import * as THREE from 'three';
import { LevelData, GameStats, CharacterSkinId, FioccoAccessoryId, Achievement } from '../types';
import { Character } from './Character';
import { Guardian } from './Guardians';
import { WorldBuilder } from './WorldBuilder';
import { NPCFiocco, FioccoDialogue } from './NPCFiocco';
import { sounds } from '../audio/SoundManager';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onTargetGrappleChange: (hasTarget: boolean, dist: number, targetPos: { x: number; y: number; z: number } | null) => void;
  onGuardianAlert: (alertLevel: number) => void;
  onLevelComplete: () => void;
  onPlayerRespawn: () => void;
  onFioccoNearbyChange?: (isNearby: boolean) => void;
  onFioccoTalk?: (dialogue: FioccoDialogue) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public callbacks: GameEngineCallbacks;

  private currentLevel!: LevelData;
  private character!: Character;
  private guardians: Guardian[] = [];
  private worldBuilder!: WorldBuilder;
  public fioccoNPC!: NPCFiocco;

  private stats: GameStats = {
    level: 1,
    runesCollected: 0,
    totalRunes: 3,
    isPortalActive: false,
    timeElapsed: 0,
    grappleCount: 0,
    guardianDodgeCount: 0,
    deaths: 0,
  };

  // Achievements
  public unlockedAchievements: Set<string> = new Set();

  // Camera Orbit Control
  private cameraDistance: number = 7.5;
  private cameraPitch: number = 0.35; // Vertical angle (radians)
  private cameraYaw: number = 0; // Horizontal orbit angle (radians)
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();

  // Input states
  public keys: { [key: string]: boolean } = {};
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // Active Grapple Beam
  private grappleBeam!: THREE.Line;
  private grappleBeamMat!: THREE.LineBasicMaterial;
  private targetedAnchorId: string | null = null;
  private targetedAnchorPos: THREE.Vector3 | null = null;
  private targetedAnchorGroup: THREE.Group | null = null;

  // Respawn Checkpoint
  private lastSafeCheckpoint: THREE.Vector3 = new THREE.Vector3(0, 3, 0);

  // Gameplay Mechanics: Stamina, Dash, Gliding
  public stamina: number = 100;
  private dashCooldown: number = 0;
  private isDashing: boolean = false;
  private dashTimer: number = 0;
  private dashDir: THREE.Vector3 = new THREE.Vector3();
  public isGlidingActive: boolean = false;
  private windSoundTimer: number = 0;

  // Particles
  private dustParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  private particleGroup: THREE.Group = new THREE.Group();

  // Animation Frame
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isDestroyed: boolean = false;
  private isRunning: boolean = true;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Setup Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    // 2. Setup Grapple Beam Mesh
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    this.grappleBeamMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      linewidth: 3,
      transparent: true,
      opacity: 0,
    });
    this.grappleBeam = new THREE.Line(beamGeo, this.grappleBeamMat);
    this.grappleBeam.frustumCulled = false;
    this.scene.add(this.grappleBeam);

    this.scene.add(this.particleGroup);

    // 3. Event Listeners
    this.bindEvents();

    // Resize handling
    window.addEventListener('resize', this.onResize);
  }

  public loadLevel(level: LevelData) {
    this.currentLevel = level;

    // Clear previous world
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.scene.add(this.grappleBeam);
    this.scene.add(this.particleGroup);

    // Reset stats
    this.stats = {
      level: level.id,
      runesCollected: 0,
      totalRunes: level.requiredRunes,
      isPortalActive: false,
      timeElapsed: 0,
      grappleCount: 0,
      guardianDodgeCount: 0,
      deaths: 0,
    };
    this.callbacks.onStatsUpdate(this.stats);

    // World Builder
    this.worldBuilder = new WorldBuilder(this.scene);
    this.worldBuilder.buildLevel(level);

    // Character
    this.character = new Character();
    this.character.position.set(...level.playerSpawn);
    this.lastSafeCheckpoint.copy(this.character.position);
    this.scene.add(this.character.group);

    // Camera initial angle behind character
    this.cameraYaw = 0;
    this.cameraPitch = 0.35;

    // Guardians
    this.guardians = level.guardians.map((gConf) => {
      const guardian = new Guardian(gConf, (pos) => this.spawnDust(pos, 5, 0.4));
      this.scene.add(guardian.group);
      return guardian;
    });

    // Fiocco NPC (The white guardian cat)
    const fioccoSpawn = level.fioccoSpawn || [2.5, 0.6, 2.0];
    this.fioccoNPC = new NPCFiocco(this.scene, new THREE.Vector3(...fioccoSpawn));
    this.callbacks.onFioccoNearbyChange?.(false);

    this.lastTime = performance.now();
    this.isRunning = true;
    this.keys = {};
    this.joystickVector = { x: 0, y: 0 };
    this.isPointerDown = false;
    this.stamina = 100;
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.targetedAnchorPos = null;
    this.targetedAnchorId = null;
    this.targetedAnchorGroup = null;
    this.grappleBeamMat.opacity = 0;

    // Clear dust particles from previous levels
    while (this.particleGroup.children.length > 0) {
      this.particleGroup.remove(this.particleGroup.children[0]);
    }
    this.dustParticles = [];

    if (!this.animFrameId) {
      this.startLoop();
    }
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);

    this.container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.container.addEventListener('wheel', this.onWheel, { passive: true });
  }

  private onWindowBlur = () => {
    this.keys = {};
    this.isPointerDown = false;
    this.joystickVector = { x: 0, y: 0 };
  };

  private onKeyDown = (e: KeyboardEvent) => {
    sounds.init();
    sounds.resume();
    this.keys[e.code] = true;

    if (e.code === 'KeyE' || e.code === 'KeyF') {
      this.triggerGrapple();
    }
    if (e.code === 'KeyG') {
      this.triggerGlide(true);
    }
    if (e.code === 'KeyT' || e.code === 'KeyC') {
      this.triggerTalkFiocco();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyQ') {
      this.triggerDash();
    }
    if (e.code === 'Space') {
      // If mid-air and has target within reasonable lock, grapple; otherwise jump / double-jump
      if (!this.character.isGrounded && this.targetedAnchorPos) {
        this.triggerGrapple();
      } else {
        this.triggerJump();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
    if (e.code === 'KeyG') {
      this.triggerGlide(false);
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    sounds.init();
    sounds.resume();
    if (e.target === this.renderer.domElement) {
      this.isPointerDown = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isPointerDown) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.cameraYaw -= dx * 0.005;
      this.cameraPitch = Math.max(0.05, Math.min(1.2, this.cameraPitch + dy * 0.005));
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    this.cameraDistance = Math.max(4, Math.min(14, this.cameraDistance + e.deltaY * 0.01));
  };

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public triggerGlide(enable?: boolean) {
    if (enable !== undefined) {
      this.isGlidingActive = enable;
    } else {
      this.isGlidingActive = !this.isGlidingActive;
    }
    if (this.isGlidingActive && !this.character.isGrounded) {
      sounds.playGliderDeploy();
      this.unlockAchievement('first_glide', "Ali dell'Aurora", 'Spiega le ali celesti e plana dolcemente nell\'etere.', 'feather');
    }
  }

  public unlockAchievement(id: string, title: string, description: string, icon: string) {
    if (!this.unlockedAchievements.has(id)) {
      this.unlockedAchievements.add(id);
      sounds.playAchievement();
      const achievement: Achievement = {
        id,
        title,
        description,
        icon,
        unlocked: true,
        unlockedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      this.callbacks.onAchievementUnlocked?.(achievement);
    }
  }

  public triggerJump() {
    if (this.character.isGrappling) return;

    if (this.character.isGrounded) {
      this.character.velocity.y = 11.5;
      this.character.isGrounded = false;
      this.character.canDoubleJump = true;
      this.character.isGliding = false;
      this.character.triggerJumpFX();
      sounds.playJump();
      this.spawnDust(this.character.position, 6, 0.3);
    } else if (this.character.canDoubleJump && this.stamina >= 20) {
      // Aerial Boost / Double Jump
      this.character.velocity.y = 10.5;
      this.character.canDoubleJump = false;
      this.character.isGliding = false;
      this.stamina = Math.max(0, this.stamina - 20);
      this.character.triggerJumpFX();
      sounds.playDoubleJump();
      this.spawnDust(this.character.position, 12, 0.5);
      this.spawnRuneSparkles(this.character.position, '#38bdf8');
    } else if (!this.character.isGrounded && this.character.velocity.y < 0) {
      // Hold/Press Jump to Glide while falling
      this.triggerGlide(true);
    }
  }

  public triggerDash() {
    if (this.isDashing || this.dashCooldown > 0 || this.stamina < 25) return;

    this.isDashing = true;
    this.dashTimer = 0.22; // Quick, snappy burst
    this.dashCooldown = 0.7; // Cooldown before next dash
    this.stamina = Math.max(0, this.stamina - 25);
    this.character.isDashing = true;
    this.character.dashTimer = 0.22;
    this.character.triggerJumpFX();

    // Dash in the direction character is facing or camera forward
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.character.rotationY);
    this.dashDir.copy(forward).normalize();

    sounds.playDash();
    this.spawnDust(this.character.position, 10, 0.4);
    this.spawnRuneSparkles(this.character.position, '#f59e0b');
  }

  public triggerGrapple() {
    if (this.targetedAnchorPos && !this.character.isGrappling) {
      this.character.velocity.set(0, 0, 0); // Clear residual momentum
      this.character.isGrappling = true;
      this.character.isGliding = false;
      this.character.grappleStartPos.copy(this.character.position);
      this.character.grappleTargetPos = this.targetedAnchorPos.clone();
      this.character.grappleProgress = 0;
      this.stats.grappleCount++;
      this.callbacks.onStatsUpdate(this.stats);

      sounds.playGrappleShoot();
      sounds.playGrappleZip();
      this.grappleBeamMat.opacity = 0.9;

      this.unlockAchievement('first_grapple', 'Primo Slancio', 'Usa il rampino di luce per agganciarti a un ancora celeste.', 'zap');
    }
  }

  public triggerTalkFiocco() {
    if (this.fioccoNPC && this.fioccoNPC.isPlayerNearby) {
      sounds.playCatMeow();
      const dialogue = this.fioccoNPC.getNextDialogue(this.currentLevel.id);
      this.callbacks.onFioccoTalk?.(dialogue);
      this.unlockAchievement('fiocco_friend', 'Compagni di Viaggio', 'Scambia parole sagge con il fedele gattino Fiocco.', 'heart');
      return dialogue;
    }
    return null;
  }

  public startLoop() {
    const loop = (now: number) => {
      if (this.isDestroyed) return;
      const delta = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      if (this.isRunning) {
        this.update(now / 1000, delta);
        this.renderer.render(this.scene, this.camera);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private update(time: number, delta: number) {
    this.stats.timeElapsed += delta;

    // 1. Update World Elements (crystals, runes, clouds, waterfalls)
    this.worldBuilder.update(time, delta);

    // 2. Player Input & Movement
    let inputX = 0;
    let inputZ = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputX += 1;

    // Add Joystick input
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      inputX = this.joystickVector.x;
      inputZ = -this.joystickVector.y;
    }

    const isInputActive = Math.abs(inputX) > 0.05 || Math.abs(inputZ) > 0.05;

    // Calculate move direction relative to camera angle
    let moveDir = new THREE.Vector3();
    if (isInputActive) {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      moveDir.addScaledVector(right, inputX);
      moveDir.addScaledVector(forward, -inputZ);
      moveDir.normalize();

      // Smooth rotate character to move direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      // Angular interpolation
      let diff = targetRotation - this.character.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.character.rotationY += diff * Math.min(1, delta * 12);
    }

    // Update Stamina & Dash Timers
    if (this.stamina < 100) {
      this.stamina = Math.min(100, this.stamina + delta * 24); // Regenerates over ~4s
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    }
    if (this.isDashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    // 3. Handle Grappling State Physics
    if (this.character.isGrappling && this.character.grappleTargetPos) {
      this.character.grappleProgress += delta * 2.8; // Speed of zip
      const t = Math.min(1, this.character.grappleProgress);

      // Dynamically update target position if anchor is moving
      if (this.targetedAnchorGroup) {
        this.character.grappleTargetPos.copy(this.targetedAnchorGroup.position);
      }

      // Arc trajectory pulling toward anchor
      const currentPos = new THREE.Vector3().lerpVectors(
        this.character.grappleStartPos,
        this.character.grappleTargetPos,
        t
      );
      // Add slight upward parabola arc
      const arc = Math.sin(t * Math.PI) * 2.2;
      currentPos.y += arc;
      this.character.position.copy(currentPos);

      // Update Grapple Beam line endpoints
      const gauntletPos = this.character.getGauntletWorldPos();
      const posAttr = this.grappleBeam.geometry.attributes.position;
      posAttr.setXYZ(0, gauntletPos.x, gauntletPos.y, gauntletPos.z);
      posAttr.setXYZ(1, this.character.grappleTargetPos.x, this.character.grappleTargetPos.y, this.character.grappleTargetPos.z);
      posAttr.needsUpdate = true;

      // Finish Grapple: SLINGSHOT BOOST!
      if (t >= 1) {
        this.character.isGrappling = false;
        this.grappleBeamMat.opacity = 0;

        // Slingshot catapult forward/upward
        const forwardFling = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.character.rotationY);
        this.character.velocity.copy(forwardFling.multiplyScalar(10.5));
        this.character.velocity.y = 7.5;
        this.character.isGrounded = false;
        this.character.canDoubleJump = true; // reset double jump upon completing grapple
        this.spawnRuneSparkles(this.character.position, '#00ffff');
      }
    } else {
      // Normal Ground / Air Physics + Dash / Gliding Physics
      let baseSpeed = 9.5;
      if (this.isDashing) {
        baseSpeed = 24.0; // High speed dash burst
        this.character.position.x += this.dashDir.x * baseSpeed * delta;
        this.character.position.z += this.dashDir.z * baseSpeed * delta;
      } else if (isInputActive) {
        this.character.position.x += moveDir.x * baseSpeed * delta;
        this.character.position.z += moveDir.z * baseSpeed * delta;
      }

      // Check Wind Updrafts
      let inWindUpdraft = false;
      this.worldBuilder.windUpdraftMeshes.forEach(({ config, group }) => {
        const uPos = group.position;
        const dx = this.character.position.x - uPos.x;
        const dz = this.character.position.z - uPos.z;
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        const relY = this.character.position.y - uPos.y;
        if (distXZ < config.radius && relY >= -0.5 && relY <= config.height) {
          inWindUpdraft = true;
          // Smooth upward lift
          this.character.velocity.y = Math.min(13.5, this.character.velocity.y + delta * 38.0);
          this.character.isGrounded = false;
          this.character.canDoubleJump = true;
          if (Math.random() < 0.25) {
            this.spawnDust(this.character.position, 1, 0.2);
          }
          this.unlockAchievement('first_updraft', 'Signore dei Venti', 'Fatti sollevare verso il cielo da una corrente ascensionale.', 'wind');
        }
      });

      if (inWindUpdraft) {
        this.windSoundTimer -= delta;
        if (this.windSoundTimer <= 0) {
          sounds.playWindUpdraft();
          this.windSoundTimer = 0.8;
        }
      }

      // Check Bounce Pads
      this.worldBuilder.bouncePadMeshes.forEach((pad) => {
        const pPos = pad.group.position;
        const dx = this.character.position.x - pPos.x;
        const dz = this.character.position.z - pPos.z;
        const dy = this.character.position.y - pPos.y;
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        if (distXZ < 1.7 && dy >= -0.2 && dy < 1.6 && this.character.velocity.y <= 1.0) {
          const power = pad.config.power || 18.0;
          this.character.velocity.y = power;
          this.character.isGrounded = false;
          this.character.canDoubleJump = true;
          this.character.isGliding = false;
          this.worldBuilder.triggerBouncePadFX(pad.config.id);
          sounds.playBouncePad();
          this.spawnRuneSparkles(this.character.position, '#facc15');
          this.unlockAchievement('first_bounce', 'Salto nel Cosmo', 'Lanciati in orbita usando un trampolino runico.', 'arrow-up');
        }
      });

      // Gliding & Gravity Physics
      const wantsGlide = (this.keys['Space'] || this.keys['KeyG'] || this.isGlidingActive) && !this.character.isGrounded && this.character.velocity.y < 0;
      if (wantsGlide && !inWindUpdraft) {
        if (!this.character.isGliding) {
          sounds.playGliderDeploy();
          this.unlockAchievement('first_glide', "Ali dell'Aurora", 'Spiega le ali celesti e plana dolcemente nell\'etere.', 'feather');
        }
        this.character.isGliding = true;
        // Float gently: capped terminal velocity
        this.character.velocity.y = Math.max(-2.5, this.character.velocity.y - 4.0 * delta);
        baseSpeed = 11.5;
        if (Math.random() < 0.15) {
          this.spawnRuneSparkles(this.character.position, '#38bdf8');
        }
      } else {
        this.character.isGliding = false;
        if (!inWindUpdraft) {
          this.character.velocity.y -= 26.0 * delta; // Regular gravity
        }
      }

      this.character.position.y += this.character.velocity.y * delta;

      // Check ground collision
      const groundY = this.worldBuilder.getGroundHeightAt(this.character.position.x, this.character.position.z, this.character.position.y);
      if (groundY !== null) {
        if (this.character.position.y <= groundY) {
          if (!this.character.isGrounded && this.character.velocity.y < -3) {
            sounds.playLand();
            this.spawnDust(this.character.position, 4, 0.25);
          }
          this.character.position.y = groundY;
          this.character.velocity.y = 0;
          this.character.isGrounded = true;
          this.character.isGliding = false;
          this.isGlidingActive = false;
          this.character.canDoubleJump = true; // reset double jump on land
          this.lastSafeCheckpoint.copy(this.character.position);
        } else {
          this.character.isGrounded = false;
        }
        this.character.setShadowHeight(groundY);
      } else {
        this.character.isGrounded = false;
        this.character.hideShadow();
      }

      // Footstep sounds
      if (this.character.isGrounded && isInputActive && Math.random() < 0.1) {
        sounds.playFootstep();
      }

      // 4. Void Fall Rescue (falling off islands)
      if (this.character.position.y < -14) {
        this.handleVoidFall();
      }
    }

    // Update Character Animations
    this.character.update(delta, isInputActive, isInputActive ? 1 : 0);

    // 5. Update Target Grapple Lock-On
    this.updateGrappleTargeting();

    // 6. Update Guardians & Proximity Warning
    let maxGuardianAlert = 0;
    this.guardians.forEach((guardian) => {
      const { hitPlayer } = guardian.update(delta, this.character.position);
      if (guardian.alertLevel > maxGuardianAlert) {
        maxGuardianAlert = guardian.alertLevel;
      }

      if (hitPlayer) {
        this.handleGuardianHit(guardian);
      }
    });
    this.callbacks.onGuardianAlert(maxGuardianAlert);

    // 7. Check Rune Pickups
    this.worldBuilder.runeMeshes.forEach((rune, id) => {
      if (!rune.collected) {
        const dist = this.character.position.distanceTo(rune.group.position);
        if (dist < 1.6) {
          rune.collected = true;
          rune.group.visible = false;
          this.stats.runesCollected++;
          sounds.playRunePickup();
          this.spawnRuneSparkles(rune.group.position, rune.config.color || '#38ef7d');

          // Check if all runes collected -> Activate Portal!
          if (this.stats.runesCollected >= this.stats.totalRunes) {
            this.stats.isPortalActive = true;
            this.worldBuilder.activatePortalVisuals();
            sounds.playPortalActivated();
            this.unlockAchievement('all_runes_level', 'Collezionista Astrale', 'Raccogli tutte le rune celesti per aprire il portale.', 'sparkles');
          }

          this.callbacks.onStatsUpdate(this.stats);
        }
      }
    });

    // 8. Check Portal Entrance
    if (this.stats.isPortalActive && this.worldBuilder.portalGroup) {
      const portalCenter = this.worldBuilder.portalGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0));
      const distToPortal = this.character.position.distanceTo(portalCenter);
      if (distToPortal < 2.5) {
        this.handlePortalEnter();
      }
    }

    // 9. Update Particles
    this.updateParticles(delta);

    // 10. Update Fiocco NPC
    if (this.fioccoNPC) {
      const prevNearby = this.fioccoNPC.isPlayerNearby;
      this.fioccoNPC.update(delta, this.character.position);
      if (prevNearby !== this.fioccoNPC.isPlayerNearby) {
        this.callbacks.onFioccoNearbyChange?.(this.fioccoNPC.isPlayerNearby);
      }
    }

    // 11. Update 3rd-Person Camera
    this.updateCamera(delta);
  }

  private updateGrappleTargeting() {
    if (this.character.isGrappling) {
      return;
    }

    const maxDist = 32; // Max grapple lock range
    let bestScore = -Infinity;
    let bestPos: THREE.Vector3 | null = null;
    let bestId: string | null = null;
    let bestGroup: THREE.Group | null = null;
    let bestDist = 0;

    // Camera forward vector on horizontal plane
    const camForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw).normalize();

    this.worldBuilder.grappleMeshes.forEach(({ group, config }) => {
      const anchorPos = group.position;
      const toAnchor = new THREE.Vector3().subVectors(anchorPos, this.character.position);
      const dist = toAnchor.length();

      if (dist <= maxDist && dist > 1.5) {
        toAnchor.y = 0;
        toAnchor.normalize();
        const dot = camForward.dot(toAnchor); // 1 = directly in center of view, -1 = behind

        // Score: high dot product + closer distance
        // Anchors in front get major priority, but very close ones are also accessible
        if (dot > -0.25) {
          const score = (dot + 0.5) * 20 - dist;
          if (score > bestScore) {
            bestScore = score;
            bestPos = anchorPos.clone();
            bestId = config.id;
            bestGroup = group;
            bestDist = dist;
          }
        }
      }
    });

    this.targetedAnchorId = bestId;
    this.targetedAnchorPos = bestPos;
    this.targetedAnchorGroup = bestGroup;

    this.callbacks.onTargetGrappleChange(
      bestPos !== null,
      Math.round(bestDist * 10) / 10,
      bestPos ? { x: bestPos.x, y: bestPos.y, z: bestPos.z } : null
    );
  }

  private updateCamera(delta: number) {
    // Smooth camera follow target
    const target = this.character.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    this.cameraTarget.lerp(target, delta * 10);

    // Calculate spherical coordinates from yaw and pitch
    const cx = this.cameraTarget.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const cy = this.cameraTarget.y + Math.sin(this.cameraPitch) * this.cameraDistance;
    const cz = this.cameraTarget.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.cameraTarget);
  }

  private handleVoidFall() {
    sounds.playRespawn();
    this.stats.deaths++;
    this.character.position.copy(this.lastSafeCheckpoint);
    this.character.velocity.set(0, 0, 0);
    this.character.isGrappling = false;
    this.grappleBeamMat.opacity = 0;
    this.spawnDust(this.character.position, 12, 0.8);
    this.callbacks.onPlayerRespawn();
    this.callbacks.onStatsUpdate(this.stats);
  }

  private handleGuardianHit(guardian: Guardian) {
    sounds.playGuardianHit();
    this.stats.deaths++;
    // Knockback
    const knockDir = new THREE.Vector3().subVectors(this.character.position, guardian.position).normalize();
    knockDir.y = 0.5;
    this.character.velocity.copy(knockDir.multiplyScalar(12));
    this.character.isGrounded = false;
    this.character.isGrappling = false;
    this.grappleBeamMat.opacity = 0;

    // Guardian resets slightly
    guardian.resetToSpawn();
    this.spawnDust(this.character.position, 10, 0.6);
    this.callbacks.onPlayerRespawn();
    this.callbacks.onStatsUpdate(this.stats);
  }

  private handlePortalEnter() {
    sounds.playPortalEnter();
    if (this.stats.timeElapsed < 60) {
      this.unlockAchievement('speed_runner', 'Fulmine Celeste', 'Completa un livello in meno di 60 secondi.', 'flame');
    }
    if (this.stats.deaths === 0) {
      this.unlockAchievement('flawless_run', 'Volata Perfetta', 'Completa un intero livello senza mai cadere nel vuoto.', 'shield');
    }
    this.isRunning = false;
    this.callbacks.onLevelComplete();
  }

  public spawnDust(pos: THREE.Vector3, count: number = 6, scale: number = 0.3) {
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.6,
    });
    for (let i = 0; i < count; i++) {
      const geo = new THREE.DodecahedronGeometry(0.12 * scale, 0);
      const mesh = new THREE.Mesh(geo, dustMat.clone());
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        pos.y + 0.1,
        pos.z + (Math.random() - 0.5) * 0.4
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        Math.random() * 2.0,
        (Math.random() - 0.5) * 2.5
      );
      this.particleGroup.add(mesh);
      this.dustParticles.push({ mesh, vel, life: 1.0 });
    }
  }

  public spawnRuneSparkles(pos: THREE.Vector3, colorHex: string) {
    const col = new THREE.Color(colorHex);
    const sparkleMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.9,
    });
    for (let i = 0; i < 16; i++) {
      const geo = new THREE.TetrahedronGeometry(0.15, 0);
      const mesh = new THREE.Mesh(geo, sparkleMat.clone());
      mesh.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 4.0 + 1.0,
        (Math.random() - 0.5) * 4.5
      );
      this.particleGroup.add(mesh);
      this.dustParticles.push({ mesh, vel, life: 1.2 });
    }
  }

  private updateParticles(delta: number) {
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.life -= delta * 1.8;
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= delta * 3.0; // Gravity
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.dustParticles.splice(i, 1);
      }
    }
  }

  public setPaused(paused: boolean) {
    this.isRunning = !paused;
    if (paused) {
      this.keys = {};
      this.isPointerDown = false;
      this.joystickVector = { x: 0, y: 0 };
    } else {
      this.lastTime = performance.now();
    }
  }

  public setPlayerSkin(skinId: CharacterSkinId) {
    if (this.character) {
      this.character.setSkin(skinId);
    }
  }

  public setFioccoAccessory(accId: FioccoAccessoryId) {
    if (this.fioccoNPC) {
      this.fioccoNPC.setAccessory(accId);
    }
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    this.cameraYaw += deltaYaw;
    this.cameraPitch = Math.max(0.05, Math.min(Math.PI * 0.45, this.cameraPitch + deltaPitch));
    this.updateCamera(0.016);
  }

  public zoomCamera(delta: number) {
    this.cameraDistance = Math.max(3.5, Math.min(18.0, this.cameraDistance + delta));
    this.updateCamera(0.016);
  }

  public captureScreenshot(): string {
    // Force a crisp render pass
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.container.removeEventListener('wheel', this.onWheel);
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
