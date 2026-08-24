import * as THREE from 'three';
import { GuardianConfig } from '../types';
import { sounds } from '../audio/SoundManager';

export type GuardianState = 'dormant' | 'awakening' | 'alert' | 'patrol' | 'chase';

export class Guardian {
  public group: THREE.Group;
  public config: GuardianConfig;
  public position: THREE.Vector3;
  public state: GuardianState = 'dormant';
  public alertLevel: number = 0; // 0 to 1
  public awakenProgress: number = 0;

  private currentPatrolIndex: number = 0;
  private animTimer: number = 0;
  private stompTimer: number = 0;

  // Visual sub-meshes
  private torsoMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private leftEye!: THREE.Mesh;
  private rightEye!: THREE.Mesh;
  private eyeLight!: THREE.PointLight;
  private leftArmGroup!: THREE.Group;
  private rightArmGroup!: THREE.Group;
  private leftLegGroup!: THREE.Group;
  private rightLegGroup!: THREE.Group;
  private runePlate!: THREE.Mesh;
  private floatingShards: THREE.Mesh[] = [];
  private threatCone!: THREE.Mesh;
  private dustEmitter?: (pos: THREE.Vector3) => void;

  constructor(config: GuardianConfig, onDust?: (pos: THREE.Vector3) => void) {
    this.config = config;
    this.dustEmitter = onDust;
    this.group = new THREE.Group();
    this.position = this.group.position;
    this.position.set(...config.spawnPosition);

    if (config.scale) {
      this.group.scale.setScalar(config.scale);
    }

    this.buildMesh();
  }

  private buildMesh() {
    // Ancient weathered stone materials with standard PBR shading
    const stoneDarkMat = new THREE.MeshStandardMaterial({ color: 0x484b52, roughness: 0.85, flatShading: true });
    const stoneLightMat = new THREE.MeshStandardMaterial({ color: 0x6e737d, roughness: 0.8, flatShading: true });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3d6340, roughness: 0.9, flatShading: true });
    const runeDormantMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const eyeDormantMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    // 1. Heavy Stone Torso
    const torsoGeo = new THREE.BoxGeometry(1.25, 1.45, 0.95);
    this.torsoMesh = new THREE.Mesh(torsoGeo, stoneDarkMat);
    this.torsoMesh.position.y = 1.6;
    this.torsoMesh.castShadow = true;
    this.group.add(this.torsoMesh);

    // Moss patches on shoulder & back
    const mossGeo1 = new THREE.BoxGeometry(0.55, 0.22, 0.55);
    const moss1 = new THREE.Mesh(mossGeo1, mossMat);
    moss1.position.set(0.4, 0.72, 0.1);
    this.torsoMesh.add(moss1);

    const mossGeo2 = new THREE.BoxGeometry(0.65, 0.32, 0.32);
    const moss2 = new THREE.Mesh(mossGeo2, mossMat);
    moss2.position.set(-0.3, 0.68, -0.3);
    this.torsoMesh.add(moss2);

    // Chest ancient glowing rune core
    const coreGeo = new THREE.OctahedronGeometry(0.28, 0);
    this.runePlate = new THREE.Mesh(coreGeo, runeDormantMat);
    this.runePlate.position.set(0, 0.1, 0.5);
    this.torsoMesh.add(this.runePlate);

    // Glowing Runic Inscription Lines on Torso
    const runeLineGeo = new THREE.PlaneGeometry(0.8, 0.08);
    const runeLineMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
    const runeLine = new THREE.Mesh(runeLineGeo, runeLineMat);
    runeLine.position.set(0, -0.25, 0.49);
    this.torsoMesh.add(runeLine);

    // 2. Heavy Stone Head
    const headGeo = new THREE.BoxGeometry(0.75, 0.65, 0.7);
    this.headMesh = new THREE.Mesh(headGeo, stoneLightMat);
    this.headMesh.position.set(0, 2.6, 0.1);
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // Glowing Eyes
    const eyeGeo = new THREE.BoxGeometry(0.14, 0.11, 0.06);
    this.leftEye = new THREE.Mesh(eyeGeo, eyeDormantMat);
    this.leftEye.position.set(-0.2, 0, 0.36);
    this.headMesh.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeDormantMat.clone());
    this.rightEye.position.set(0.2, 0, 0.36);
    this.headMesh.add(this.rightEye);

    this.eyeLight = new THREE.PointLight(0xff4500, 0, 6);
    this.eyeLight.position.set(0, 0, 0.6);
    this.headMesh.add(this.eyeLight);

    // Horns / Spikes on head
    const hornGeo = new THREE.ConeGeometry(0.14, 0.4, 4);
    const hornL = new THREE.Mesh(hornGeo, stoneDarkMat);
    hornL.position.set(-0.28, 0.4, 0);
    hornL.rotation.z = 0.35;
    this.headMesh.add(hornL);

    const hornR = new THREE.Mesh(hornGeo, stoneDarkMat);
    hornR.position.set(0.28, 0.4, 0);
    hornR.rotation.z = -0.35;
    this.headMesh.add(hornR);

    // 3. Huge Stone Arms
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.9, 2.0, 0);
    const armGeo = new THREE.BoxGeometry(0.48, 1.15, 0.48);
    armGeo.translate(0, -0.48, 0);
    const leftArm = new THREE.Mesh(armGeo, stoneDarkMat);
    leftArm.castShadow = true;
    this.leftArmGroup.add(leftArm);
    this.group.add(this.leftArmGroup);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.9, 2.0, 0);
    const rightArm = new THREE.Mesh(armGeo, stoneDarkMat);
    rightArm.castShadow = true;
    this.rightArmGroup.add(rightArm);
    this.group.add(this.rightArmGroup);

    // 4. Sturdy Stone Legs
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.42, 0.9, 0);
    const legGeo = new THREE.BoxGeometry(0.42, 0.95, 0.42);
    legGeo.translate(0, -0.48, 0);
    const leftLeg = new THREE.Mesh(legGeo, stoneLightMat);
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);
    this.group.add(this.leftLegGroup);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.42, 0.9, 0);
    const rightLeg = new THREE.Mesh(legGeo, stoneLightMat);
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);
    this.group.add(this.rightLegGroup);

    // 5. Levitating Stone Rune Shards (Orbiting Armor Pauldrons)
    const shardGeo = new THREE.DodecahedronGeometry(0.22, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x5a5d64,
      emissive: 0x222222,
      roughness: 0.7,
      flatShading: true,
    });
    for (let i = 0; i < 3; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat.clone());
      shard.position.set(Math.cos(i * 2.1) * 1.4, 2.0, Math.sin(i * 2.1) * 1.4);
      this.group.add(shard);
      this.floatingShards.push(shard);
    }

    // 6. Threat Scan Cone (Projected on Ground during Alert/Chase)
    const coneGeo = new THREE.RingGeometry(0.5, this.config.detectionRadius, 24, 1, 0, Math.PI * 0.45);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.rotateY(Math.PI * 0.77);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.threatCone = new THREE.Mesh(coneGeo, coneMat);
    this.threatCone.position.y = 0.06;
    this.group.add(this.threatCone);

    // Initial Dormant Pose (hunched over statue)
    this.torsoMesh.position.y = 1.0;
    this.torsoMesh.rotation.x = 0.4;
    this.headMesh.position.set(0, 1.7, 0.3);
    this.headMesh.rotation.x = 0.5;
    this.leftArmGroup.position.y = 1.3;
    this.rightArmGroup.position.y = 1.3;
    this.leftArmGroup.rotation.x = 0.3;
    this.rightArmGroup.rotation.x = 0.3;
    this.leftLegGroup.rotation.x = -0.3;
    this.rightLegGroup.rotation.x = -0.3;
  }

  public update(delta: number, playerPos: THREE.Vector3): { hitPlayer: boolean } {
    const distToPlayer = this.position.distanceTo(playerPos);
    let hitPlayer = false;

    // Animate Orbiting Stone Shards
    this.floatingShards.forEach((shard, idx) => {
      const ang = this.animTimer * 1.5 + (idx * Math.PI * 2) / 3;
      const radius = this.state === 'chase' ? 1.6 : 1.3;
      shard.position.x = Math.cos(ang) * radius;
      shard.position.z = Math.sin(ang) * radius;
      shard.position.y = 1.9 + Math.sin(ang * 2) * 0.25;
      shard.rotation.x += delta * 2;
      shard.rotation.y += delta * 2;
    });

    // State Transitions
    switch (this.state) {
      case 'dormant': {
        (this.threatCone.material as THREE.MeshBasicMaterial).opacity = 0;
        if (distToPlayer <= this.config.detectionRadius) {
          this.state = 'awakening';
          this.awakenProgress = 0;
          sounds.playGuardianAwaken();
        }
        break;
      }

      case 'awakening': {
        this.awakenProgress += delta * 1.5;
        const progress = Math.min(1, this.awakenProgress);

        // Shake & rise up
        const shake = (1 - progress) * Math.sin(this.awakenProgress * 30) * 0.08;
        this.group.position.x = this.config.spawnPosition[0] + shake;

        // Transition poses to active
        this.torsoMesh.position.y = 1.0 + progress * 0.6;
        this.torsoMesh.rotation.x = 0.4 * (1 - progress);
        this.headMesh.position.set(0, 1.7 + progress * 0.9, 0.3 * (1 - progress) + 0.1 * progress);
        this.headMesh.rotation.x = 0.5 * (1 - progress);
        this.leftArmGroup.position.y = 1.3 + progress * 0.7;
        this.rightArmGroup.position.y = 1.3 + progress * 0.7;
        this.leftArmGroup.rotation.x = 0.3 * (1 - progress);
        this.rightArmGroup.rotation.x = 0.3 * (1 - progress);
        this.leftLegGroup.rotation.x = -0.3 * (1 - progress);
        this.rightLegGroup.rotation.x = -0.3 * (1 - progress);

        // Eye glow flare
        const eyeCol = new THREE.Color().setHSL(0.04, 1, 0.1 + progress * 0.45);
        (this.leftEye.material as THREE.MeshBasicMaterial).color.copy(eyeCol);
        (this.rightEye.material as THREE.MeshBasicMaterial).color.copy(eyeCol);
        (this.runePlate.material as THREE.MeshStandardMaterial).emissive.copy(eyeCol);
        (this.runePlate.material as THREE.MeshStandardMaterial).emissiveIntensity = progress * 1.5;
        this.eyeLight.intensity = progress * 3.5;

        (this.threatCone.material as THREE.MeshBasicMaterial).opacity = progress * 0.25;

        if (this.awakenProgress >= 1) {
          this.state = 'chase';
          this.alertLevel = 1;
        }
        break;
      }

      case 'chase':
      case 'patrol': {
        this.animTimer += delta * 4;

        if (distToPlayer <= this.config.detectionRadius * 1.4) {
          this.state = 'chase';
          this.alertLevel = 1;

          // Look and move toward player
          const dir = new THREE.Vector3().subVectors(playerPos, this.position);
          dir.y = 0; // maintain island elevation
          const targetAngle = Math.atan2(dir.x, dir.z);
          this.group.rotation.y = targetAngle;

          dir.normalize();
          this.position.addScaledVector(dir, this.config.speed * delta);

          // Threat cone pulse
          (this.threatCone.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(this.animTimer * 4) * 0.1;

          // Check hit
          if (distToPlayer < 1.8 * (this.config.scale || 1.0)) {
            hitPlayer = true;
          }
        } else {
          // Patrol or return to spawn
          this.alertLevel = Math.max(0, this.alertLevel - delta * 0.5);
          (this.threatCone.material as THREE.MeshBasicMaterial).opacity = this.alertLevel * 0.2;

          if (this.config.patrolPoints && this.config.patrolPoints.length > 0) {
            const targetPoint = this.config.patrolPoints[this.currentPatrolIndex];
            const targetVec = new THREE.Vector3(...targetPoint);
            const distToPoint = this.position.distanceTo(targetVec);

            if (distToPoint < 1.0) {
              this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.config.patrolPoints.length;
            } else {
              const dir = new THREE.Vector3().subVectors(targetVec, this.position);
              dir.y = 0;
              this.group.rotation.y = Math.atan2(dir.x, dir.z);
              dir.normalize();
              this.position.addScaledVector(dir, this.config.speed * 0.6 * delta);
            }
          }
        }

        // Heavy Stomping Walk Animation
        const walkSwing = Math.sin(this.animTimer) * 0.48;
        this.leftLegGroup.rotation.x = walkSwing;
        this.rightLegGroup.rotation.x = -walkSwing;
        this.leftArmGroup.rotation.x = -walkSwing * 0.75;
        this.rightArmGroup.rotation.x = walkSwing * 0.75;
        this.torsoMesh.position.y = 1.6 + Math.abs(Math.sin(this.animTimer)) * 0.1;

        // Periodic stomp thuds
        this.stompTimer += delta;
        if (this.stompTimer > 0.45) {
          this.stompTimer = 0;
          if (distToPlayer < 30) {
            sounds.playGuardianStomp();
            if (this.dustEmitter) {
              const stompFootPos = this.position.clone().add(new THREE.Vector3(walkSwing > 0 ? -0.45 : 0.45, 0.1, 0));
              this.dustEmitter(stompFootPos);
            }
          }
        }

        // Eye pulse during chase
        const eyeHue = this.state === 'chase' ? 0.0 : 0.08;
        const pulse = 0.4 + Math.sin(this.animTimer * 3) * 0.2;
        (this.leftEye.material as THREE.MeshBasicMaterial).color.setHSL(eyeHue, 1, pulse);
        (this.rightEye.material as THREE.MeshBasicMaterial).color.setHSL(eyeHue, 1, pulse);
        (this.runePlate.material as THREE.MeshStandardMaterial).emissive.setHSL(eyeHue, 1, pulse * 0.8);
        this.eyeLight.intensity = pulse * 4.5;
        break;
      }
    }

    return { hitPlayer };
  }

  public resetToSpawn() {
    this.position.set(...this.config.spawnPosition);
    this.state = 'dormant';
    this.alertLevel = 0;
    this.awakenProgress = 0;

    // Reset pose
    this.torsoMesh.position.y = 1.0;
    this.torsoMesh.rotation.x = 0.4;
    this.headMesh.position.set(0, 1.7, 0.3);
    this.headMesh.rotation.x = 0.5;
    this.leftArmGroup.position.y = 1.3;
    this.rightArmGroup.position.y = 1.3;
    this.leftArmGroup.rotation.x = 0.3;
    this.rightArmGroup.rotation.x = 0.3;
    this.leftLegGroup.rotation.x = -0.3;
    this.rightLegGroup.rotation.x = -0.3;

    (this.leftEye.material as THREE.MeshBasicMaterial).color.setHex(0x111111);
    (this.rightEye.material as THREE.MeshBasicMaterial).color.setHex(0x111111);
    (this.runePlate.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
    (this.threatCone.material as THREE.MeshBasicMaterial).opacity = 0;
    this.eyeLight.intensity = 0;
  }
}

