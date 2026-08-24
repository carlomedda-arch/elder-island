import * as THREE from 'three';
import { CharacterSkinId, CharacterSkinConfig } from '../types';

export const CHARACTER_SKINS: Record<CharacterSkinId, CharacterSkinConfig> = {
  classic: {
    id: 'classic',
    name: 'Esploratore Celeste',
    subtitle: 'La classica tenuta da avventuriero delle isole fluttuanti',
    tunicColor: 0x2b5876,
    capeColor: 0xd9383a,
    bandColor: 0xf4b41a,
    pantsColor: 0x3d3d3d,
    bootsColor: 0x5c3d2e,
    glowColor: 0x00f2fe,
    icon: '🧭',
    description: 'Tunica color turchese oceanico e mantello cremisi vivace.'
  },
  solaris: {
    id: 'solaris',
    name: 'Cavaliere Solare',
    subtitle: 'Forgiato dalla radiazione dei templi solari',
    tunicColor: 0xd97706,
    capeColor: 0xf59e0b,
    bandColor: 0xfef08a,
    pantsColor: 0x78350f,
    bootsColor: 0x451a03,
    glowColor: 0xfbbf24,
    icon: '☀️',
    description: 'Armatura dorata e scintillio magico del sole allo zenit.'
  },
  zenith: {
    id: 'zenith',
    name: 'Viaggiatore Astrale',
    subtitle: 'Intriso dell\'energia cosmica dei portali eterni',
    tunicColor: 0x312e81,
    capeColor: 0x6366f1,
    bandColor: 0xa5b4fc,
    pantsColor: 0x1e1b4b,
    bootsColor: 0x0f172a,
    glowColor: 0x818cf8,
    icon: '🌌',
    description: 'Manto indaco stellare con bagliori eterei color ametista.'
  },
  crimson: {
    id: 'crimson',
    name: 'Ranger della Fenice',
    subtitle: 'Custode del fuoco sacro delle cime montuose',
    tunicColor: 0x991b1b,
    capeColor: 0xe11d48,
    bandColor: 0xfecdd3,
    pantsColor: 0x27272a,
    bootsColor: 0x18181b,
    glowColor: 0xf43f5e,
    icon: '🔥',
    description: 'Tessuti carminio ardente e mantello scarlatto della fenice.'
  },
  emerald: {
    id: 'emerald',
    name: 'Spirito di Giada',
    subtitle: 'Benedetto dalle radici millenarie delle grandi querce celesti',
    tunicColor: 0x065f46,
    capeColor: 0x10b981,
    bandColor: 0x6ee7b7,
    pantsColor: 0x14532d,
    bootsColor: 0x064e3b,
    glowColor: 0x34d399,
    icon: '🌿',
    description: 'Verde giada naturale con particelle di luce arborea.'
  },
};

export class Character {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public rotationY: number = 0;
  public isGrounded: boolean = true;
  public canDoubleJump: boolean = true;
  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public isGrappling: boolean = false;
  public isGliding: boolean = false;
  public grappleTargetPos: THREE.Vector3 | null = null;
  public grappleProgress: number = 0;
  public grappleStartPos: THREE.Vector3 = new THREE.Vector3();
  public currentSkinId: CharacterSkinId = 'classic';
  
  // Animation sub-elements
  private bodyMesh!: THREE.Mesh;
  private headGroup!: THREE.Group;
  private leftArmGroup!: THREE.Group;
  private rightArmGroup!: THREE.Group; // Has magnetic gauntlet
  private leftLegGroup!: THREE.Group;
  private rightLegGroup!: THREE.Group;
  private capeMesh!: THREE.Mesh;
  private wingsGroup!: THREE.Group;
  private leftWingMesh!: THREE.Mesh;
  private rightWingMesh!: THREE.Mesh;
  private gauntletGlow!: THREE.PointLight;
  private gauntletRing!: THREE.Mesh;
  private gauntletCore!: THREE.Mesh;
  private jumpShockwave!: THREE.Mesh;
  private jumpShockwaveTimer: number = 0;
  private shadowMesh!: THREE.Mesh;

  // Trackable materials for skinning
  private tunicMat!: THREE.MeshStandardMaterial;
  private capeMat!: THREE.MeshStandardMaterial;
  private bandMat!: THREE.MeshStandardMaterial;
  private pantsMat!: THREE.MeshStandardMaterial;
  private bootsMat!: THREE.MeshStandardMaterial;
  private energyMat!: THREE.MeshBasicMaterial;

  private animTimer: number = 0;
  private moveSpeed: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.position = this.group.position;
    this.velocity = new THREE.Vector3();

    this.buildMesh();
  }

  public setSkin(skinId: CharacterSkinId) {
    const config = CHARACTER_SKINS[skinId] || CHARACTER_SKINS.classic;
    this.currentSkinId = config.id;
    if (this.tunicMat) this.tunicMat.color.setHex(config.tunicColor);
    if (this.capeMat) this.capeMat.color.setHex(config.capeColor);
    if (this.bandMat) this.bandMat.color.setHex(config.bandColor);
    if (this.pantsMat) this.pantsMat.color.setHex(config.pantsColor);
    if (this.bootsMat) this.bootsMat.color.setHex(config.bootsColor);
    if (this.energyMat) this.energyMat.color.setHex(config.glowColor);
    if (this.gauntletGlow) this.gauntletGlow.color.setHex(config.glowColor);
  }

  public triggerJumpFX() {
    this.jumpShockwaveTimer = 0.45;
    this.jumpShockwave.scale.set(0.1, 0.1, 0.1);
    (this.jumpShockwave.material as THREE.MeshBasicMaterial).opacity = 0.8;
  }

  private buildMesh() {
    // Materials with PBR stylized shading
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1a4, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.7, flatShading: true });
    this.tunicMat = new THREE.MeshStandardMaterial({ color: 0x2b5876, roughness: 0.5, flatShading: true });
    this.pantsMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.7, flatShading: true });
    this.bootsMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.8, flatShading: true });
    this.capeMat = new THREE.MeshStandardMaterial({ color: 0xd9383a, roughness: 0.4, side: THREE.DoubleSide, flatShading: true });
    const gauntletMat = new THREE.MeshStandardMaterial({
      color: 0x1f2421,
      metalness: 0.85,
      roughness: 0.2,
      flatShading: true
    });
    this.energyMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.35);
    this.bodyMesh = new THREE.Mesh(torsoGeo, this.tunicMat);
    this.bodyMesh.position.y = 0.95;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Belt & buckle
    const beltGeo = new THREE.BoxGeometry(0.57, 0.1, 0.37);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = -0.22;
    this.bodyMesh.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.14, 0.12, 0.4);
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xf4b41a, metalness: 0.9, roughness: 0.2 });
    const buckle = new THREE.Mesh(buckleGeo, buckleMat);
    buckle.position.y = -0.22;
    this.bodyMesh.add(buckle);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.45, 0);

    const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.36);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Stylized Anime/Windwaker Hair
    const hairTopGeo = new THREE.BoxGeometry(0.42, 0.22, 0.42);
    const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
    hairTop.position.y = 0.14;
    this.headGroup.add(hairTop);

    // Hair Tuft/Bangs
    const bangsGeo = new THREE.ConeGeometry(0.18, 0.3, 4);
    const bangs = new THREE.Mesh(bangsGeo, hairMat);
    bangs.rotation.x = Math.PI * 0.4;
    bangs.rotation.y = Math.PI * 0.25;
    bangs.position.set(0, 0.12, 0.22);
    this.headGroup.add(bangs);

    // Headband
    const bandGeo = new THREE.BoxGeometry(0.40, 0.08, 0.38);
    this.bandMat = new THREE.MeshStandardMaterial({ color: 0xf4b41a, roughness: 0.5 });
    const band = new THREE.Mesh(bandGeo, this.bandMat);
    band.position.y = 0.06;
    this.headGroup.add(band);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.02);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1, 0, 0.19);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1, 0, 0.19);
    this.headGroup.add(leftEye);
    this.headGroup.add(rightEye);

    this.group.add(this.headGroup);

    // 3. Dynamic Flowing Cape (Cloth simulation with 6x10 vertex grid)
    const capeGeo = new THREE.PlaneGeometry(0.55, 0.95, 6, 10);
    // Center pivot near shoulders
    capeGeo.translate(0, -0.45, 0);
    this.capeMesh = new THREE.Mesh(capeGeo, this.capeMat);
    this.capeMesh.position.set(0, 1.25, -0.18);
    this.capeMesh.rotation.x = 0.12;
    this.capeMesh.castShadow = true;
    this.group.add(this.capeMesh);

    // 3.5 Spectral Aurora Wings (Multi-Layered Celestial Feathers)
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 1.2, -0.15);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.6, 0.45);
    wingShape.lineTo(1.4, 0.55);
    wingShape.lineTo(1.85, 0.2);
    wingShape.lineTo(1.5, -0.2);
    wingShape.lineTo(0.8, -0.55);
    wingShape.lineTo(0, -0.1);
    wingShape.closePath();

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wingInnerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Right Wing
    this.rightWingMesh = new THREE.Mesh(wingGeo, wingMat);
    const rightWingInner = new THREE.Mesh(wingGeo, wingInnerMat);
    rightWingInner.scale.set(0.75, 0.75, 0.75);
    rightWingInner.position.set(0.1, 0, 0.02);
    this.rightWingMesh.add(rightWingInner);
    this.wingsGroup.add(this.rightWingMesh);

    // Left Wing
    this.leftWingMesh = new THREE.Mesh(wingGeo, wingMat.clone());
    this.leftWingMesh.scale.set(-1, 1, 1);
    const leftWingInner = new THREE.Mesh(wingGeo, wingInnerMat.clone());
    leftWingInner.scale.set(0.75, 0.75, 0.75);
    leftWingInner.position.set(0.1, 0, 0.02);
    this.leftWingMesh.add(leftWingInner);
    this.wingsGroup.add(this.leftWingMesh);

    this.group.add(this.wingsGroup);

    // 4. Left Arm (Standard)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.38, 1.2, 0);
    const armGeo = new THREE.BoxGeometry(0.16, 0.5, 0.16);
    armGeo.translate(0, -0.22, 0);
    const leftArm = new THREE.Mesh(armGeo, this.tunicMat);
    leftArm.castShadow = true;
    this.leftArmGroup.add(leftArm);
    this.group.add(this.leftArmGroup);

    // 5. Right Arm (Magnetic Grappler Gauntlet)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.38, 1.2, 0);
    
    const rightUpperArmGeo = new THREE.BoxGeometry(0.16, 0.25, 0.16);
    rightUpperArmGeo.translate(0, -0.1, 0);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, this.tunicMat);
    rightUpperArm.castShadow = true;
    this.rightArmGroup.add(rightUpperArm);

    // Gauntlet
    const gauntletGeo = new THREE.BoxGeometry(0.22, 0.34, 0.22);
    gauntletGeo.translate(0, -0.32, 0);
    const gauntlet = new THREE.Mesh(gauntletGeo, gauntletMat);
    gauntlet.castShadow = true;
    this.rightArmGroup.add(gauntlet);

    // Gauntlet Energy Core
    const coreGeo = new THREE.SphereGeometry(0.06, 8, 8);
    this.gauntletCore = new THREE.Mesh(coreGeo, this.energyMat);
    this.gauntletCore.position.set(0, -0.36, 0.11);
    this.rightArmGroup.add(this.gauntletCore);

    // Gauntlet Glow Ring
    const ringGeo = new THREE.TorusGeometry(0.13, 0.035, 6, 16);
    this.gauntletRing = new THREE.Mesh(ringGeo, this.energyMat);
    this.gauntletRing.rotation.x = Math.PI / 2;
    this.gauntletRing.position.set(0, -0.38, 0);
    this.rightArmGroup.add(this.gauntletRing);

    this.gauntletGlow = new THREE.PointLight(0x00f2fe, 1.5, 3.0);
    this.gauntletGlow.position.set(0, -0.4, 0);
    this.rightArmGroup.add(this.gauntletGlow);

    this.group.add(this.rightArmGroup);

    // 6. Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.16, 0.65, 0);
    const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    legGeo.translate(0, -0.3, 0);
    const leftLeg = new THREE.Mesh(legGeo, this.pantsMat);
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    const bootGeo = new THREE.BoxGeometry(0.2, 0.22, 0.24);
    bootGeo.translate(0, -0.52, 0.02);
    const leftBoot = new THREE.Mesh(bootGeo, this.bootsMat);
    this.leftLegGroup.add(leftBoot);

    this.group.add(this.leftLegGroup);

    // 7. Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.16, 0.65, 0);
    const rightLeg = new THREE.Mesh(legGeo, this.pantsMat);
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);

    const rightBoot = new THREE.Mesh(bootGeo, this.bootsMat);
    this.rightLegGroup.add(rightBoot);

    this.group.add(this.rightLegGroup);

    // 8. Jump Shockwave Halo Ring
    const shockGeo = new THREE.RingGeometry(0.2, 0.35, 24);
    shockGeo.rotateX(-Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.jumpShockwave = new THREE.Mesh(shockGeo, shockMat);
    this.jumpShockwave.position.y = 0.05;
    this.group.add(this.jumpShockwave);

    // 9. Ground Shadow Decal
    const shadowGeo = new THREE.CircleGeometry(0.45, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  public update(delta: number, isMoving: boolean, moveSpeed: number) {
    this.animTimer += delta * (isMoving ? 12 : 3);
    this.moveSpeed = moveSpeed;

    // Animate jump shockwave
    if (this.jumpShockwaveTimer > 0) {
      this.jumpShockwaveTimer -= delta;
      const progress = 1 - Math.max(0, this.jumpShockwaveTimer / 0.45);
      const scale = 0.5 + progress * 2.8;
      this.jumpShockwave.scale.set(scale, scale, scale);
      (this.jumpShockwave.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.7;
    } else {
      (this.jumpShockwave.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // Gauntlet core pulse
    if (this.gauntletCore) {
      const coreScale = 1.0 + Math.sin(this.animTimer * 4) * 0.15;
      this.gauntletCore.scale.setScalar(coreScale);
    }

    // Apply facing rotation
    this.group.rotation.y = this.rotationY;

    // Animate Glider Wings
    if (this.isGliding) {
      const wingPulse = Math.sin(this.animTimer * 6) * 0.08;
      this.wingsGroup.scale.set(1 + wingPulse * 0.5, 1 + wingPulse * 0.5, 1);
      this.rightWingMesh.rotation.z = wingPulse;
      this.leftWingMesh.rotation.z = -wingPulse;
      (this.rightWingMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
      (this.leftWingMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
    } else {
      (this.rightWingMesh.material as THREE.MeshBasicMaterial).opacity = 0;
      (this.leftWingMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // Dynamic Cloth Mesh Wave Physics on Cape Geometry
    if (this.capeMesh && this.capeMesh.geometry) {
      const posAttr = this.capeMesh.geometry.attributes.position;
      const waveFreq = isMoving ? 14 : (this.isGliding ? 16 : 4);
      const waveAmp = isMoving ? 0.08 : (this.isGliding ? 0.12 : 0.025);
      const speedOffset = isMoving ? 0.18 : (this.isGliding ? 0.25 : 0.02);

      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        // Normalized distance from cape neck attachment (0 at top, 1 at bottom)
        const distFromTop = Math.abs(vy) / 0.95;
        const wave = Math.sin(this.animTimer * waveFreq * 0.5 + distFromTop * 3.5 + vx * 2.0) * waveAmp * distFromTop;
        const trailBack = -distFromTop * distFromTop * speedOffset;
        posAttr.setZ(i, trailBack + wave);
      }
      posAttr.needsUpdate = true;
    }

    // State 1: Grappling Pose
    if (this.isGrappling) {
      // Outstretched gauntlet arm pointing up/forward
      this.rightArmGroup.rotation.x = -Math.PI * 0.65;
      this.rightArmGroup.rotation.z = -0.2;
      this.leftArmGroup.rotation.x = 0.3;
      this.leftArmGroup.rotation.z = -0.4;
      
      // Streamlined flight pose
      this.leftLegGroup.rotation.x = 0.4;
      this.rightLegGroup.rotation.x = 0.6;
      this.bodyMesh.rotation.x = 0.2;
      this.capeMesh.rotation.x = 0.9 + Math.sin(this.animTimer * 2) * 0.15;
      this.gauntletGlow.intensity = 2.5 + Math.sin(this.animTimer * 4) * 0.8;
      this.gauntletRing.scale.setScalar(1.2 + Math.sin(this.animTimer * 6) * 0.2);
      return;
    }

    // State 1.5: Gliding Pose
    if (this.isGliding) {
      this.leftArmGroup.rotation.x = -1.4;
      this.rightArmGroup.rotation.x = -1.4;
      this.leftArmGroup.rotation.z = -0.6;
      this.rightArmGroup.rotation.z = 0.6;
      this.leftLegGroup.rotation.x = 0.25;
      this.rightLegGroup.rotation.x = 0.3;
      this.bodyMesh.rotation.x = 0.35;
      this.capeMesh.rotation.x = 0.8 + Math.sin(this.animTimer * 3) * 0.1;
      this.gauntletGlow.intensity = 1.6;
      return;
    }

    // State 2: Mid-Air / Jump Pose
    if (!this.isGrounded) {
      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftLegGroup.rotation.x = 0.5;
      this.rightLegGroup.rotation.x = 0.8;
      this.bodyMesh.rotation.x = 0.1;
      this.capeMesh.rotation.x = 0.6 + Math.sin(this.animTimer) * 0.1;
      this.gauntletGlow.intensity = 1.0;
      return;
    }

    // State 3: Running
    if (isMoving) {
      const legAngle = Math.sin(this.animTimer) * 0.75;
      const armAngle = -Math.sin(this.animTimer) * 0.75;

      this.leftLegGroup.rotation.x = legAngle;
      this.rightLegGroup.rotation.x = -legAngle;
      this.leftArmGroup.rotation.x = armAngle;
      this.rightArmGroup.rotation.x = -armAngle * 0.8;

      // Running bounce & cape billow
      this.bodyMesh.position.y = 0.95 + Math.abs(Math.sin(this.animTimer)) * 0.08;
      this.headGroup.position.y = 1.45 + Math.abs(Math.sin(this.animTimer)) * 0.08;
      this.capeMesh.rotation.x = 0.45 + Math.abs(Math.sin(this.animTimer)) * 0.25;
      this.capeMesh.rotation.y = Math.sin(this.animTimer * 0.5) * 0.1;
      this.gauntletGlow.intensity = 1.2 + Math.sin(this.animTimer) * 0.4;
    } else {
      // State 4: Idle Breathing
      const breath = Math.sin(this.animTimer * 0.8);
      this.bodyMesh.position.y = 0.95 + breath * 0.015;
      this.headGroup.position.y = 1.45 + breath * 0.02;
      this.leftArmGroup.rotation.x = breath * 0.05;
      this.rightArmGroup.rotation.x = -breath * 0.05;
      this.leftArmGroup.rotation.z = breath * 0.03;
      this.rightArmGroup.rotation.z = -breath * 0.03;
      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;
      this.capeMesh.rotation.x = 0.15 + breath * 0.04;
      this.capeMesh.rotation.y = Math.sin(this.animTimer * 0.4) * 0.05;
      this.gauntletGlow.intensity = 0.9 + breath * 0.3;
    }
  }

  public hideShadow() {
    (this.shadowMesh.material as THREE.MeshBasicMaterial).opacity = 0;
  }

  public setShadowHeight(groundY: number) {
    this.shadowMesh.position.y = groundY - this.position.y + 0.03;
    // Scale shadow with distance from ground
    const dist = Math.max(0.1, this.position.y - groundY);
    const scale = Math.max(0.2, 1 - dist * 0.15);
    this.shadowMesh.scale.set(scale, scale, scale);
    (this.shadowMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.05, 0.4 - dist * 0.06);
  }

  public getGauntletWorldPos(): THREE.Vector3 {
    const pos = new THREE.Vector3(0, -0.4, 0);
    this.rightArmGroup.localToWorld(pos);
    return pos;
  }
}
