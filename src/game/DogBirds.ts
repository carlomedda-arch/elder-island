import * as THREE from 'three';

export type DogBreed = 'golden' | 'shiba' | 'corgi' | 'husky' | 'beagle' | 'dalmatian';

export interface DogBirdFlightConfig {
  center: THREE.Vector3;
  radiusX: number;
  radiusZ: number;
  baseAltitude: number;
  altitudeWave: number;
  altitudeFrequency: number;
  speed: number;
  phase: number;
  scale: number;
  flightType: 'orbit' | 'figure8' | 'swoop' | 'scout';
  clockwise: boolean;
}

export interface DogBirdInstance {
  group: THREE.Group;
  breed: DogBreed;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  head: THREE.Group;
  leftEar: THREE.Group;
  rightEar: THREE.Group;
  tail: THREE.Group;
  config: DogBirdFlightConfig;
  flapPhase: number;
  glideTimer: number;
  isGliding: boolean;
  barkTimer: number;
}

export class DogBirdsManager {
  public scene: THREE.Scene;
  public dogBirds: DogBirdInstance[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createFlock(levelId: number) {
    // Clear previous dog-birds
    this.cleanup();

    const breeds: DogBreed[] = ['golden', 'shiba', 'corgi', 'husky', 'beagle', 'dalmatian'];

    // 10-12 Dog-Birds soaring across the skies around islands
    const configs: { breed: DogBreed; config: DogBirdFlightConfig }[] = [
      // Flock Alpha: Majestic Golden Dog-Bird soaring wide in sky
      {
        breed: 'golden',
        config: {
          center: new THREE.Vector3(0, 18, 0),
          radiusX: 42,
          radiusZ: 38,
          baseAltitude: 18,
          altitudeWave: 4.5,
          altitudeFrequency: 0.7,
          speed: 0.38,
          phase: 0,
          scale: 1.15,
          flightType: 'orbit',
          clockwise: true,
        },
      },
      // Companion Shiba Dog-Bird flying in formation
      {
        breed: 'shiba',
        config: {
          center: new THREE.Vector3(0, 19, 0),
          radiusX: 40,
          radiusZ: 36,
          baseAltitude: 19.5,
          altitudeWave: 4.0,
          altitudeFrequency: 0.7,
          speed: 0.38,
          phase: 0.22,
          scale: 1.0,
          flightType: 'orbit',
          clockwise: true,
        },
      },
      // Playful Corgi Dog-Bird with large bat ears
      {
        breed: 'corgi',
        config: {
          center: new THREE.Vector3(0, 17, 0),
          radiusX: 38,
          radiusZ: 34,
          baseAltitude: 17.2,
          altitudeWave: 4.2,
          altitudeFrequency: 0.7,
          speed: 0.38,
          phase: 0.44,
          scale: 0.95,
          flightType: 'orbit',
          clockwise: true,
        },
      },
      // High-Altitude Husky Dog-Bird circling the upper cloud layer
      {
        breed: 'husky',
        config: {
          center: new THREE.Vector3(10, 26, -5),
          radiusX: 55,
          radiusZ: 50,
          baseAltitude: 26,
          altitudeWave: 5.5,
          altitudeFrequency: 0.5,
          speed: 0.32,
          phase: 1.2,
          scale: 1.2,
          flightType: 'figure8',
          clockwise: false,
        },
      },
      // Beagle Dog-Bird gliding smoothly over chasms
      {
        breed: 'beagle',
        config: {
          center: new THREE.Vector3(-15, 14, 10),
          radiusX: 32,
          radiusZ: 28,
          baseAltitude: 14,
          altitudeWave: 3.2,
          altitudeFrequency: 0.9,
          speed: 0.42,
          phase: 2.1,
          scale: 1.05,
          flightType: 'swoop',
          clockwise: true,
        },
      },
      // Dalmatian Dog-Bird with cute spotted wings
      {
        breed: 'dalmatian',
        config: {
          center: new THREE.Vector3(20, 22, -15),
          radiusX: 46,
          radiusZ: 42,
          baseAltitude: 22,
          altitudeWave: 3.8,
          altitudeFrequency: 0.6,
          speed: 0.36,
          phase: 3.4,
          scale: 1.1,
          flightType: 'orbit',
          clockwise: false,
        },
      },
      // Low Altitude Explorer Golden Dog-Bird dipping near waterfalls
      {
        breed: 'golden',
        config: {
          center: new THREE.Vector3(-10, 9, -20),
          radiusX: 30,
          radiusZ: 35,
          baseAltitude: 9.5,
          altitudeWave: 3.0,
          altitudeFrequency: 0.8,
          speed: 0.45,
          phase: 4.2,
          scale: 0.9,
          flightType: 'figure8',
          clockwise: true,
        },
      },
      // Energetic Little Shiba Dog-Bird doing acrobatic swoops
      {
        breed: 'shiba',
        config: {
          center: new THREE.Vector3(15, 13, 20),
          radiusX: 28,
          radiusZ: 30,
          baseAltitude: 13,
          altitudeWave: 4.8,
          altitudeFrequency: 1.1,
          speed: 0.52,
          phase: 5.1,
          scale: 0.88,
          flightType: 'swoop',
          clockwise: false,
        },
      },
      // Cloud Wanderer Corgi Dog-Bird
      {
        breed: 'corgi',
        config: {
          center: new THREE.Vector3(-25, 24, -10),
          radiusX: 48,
          radiusZ: 44,
          baseAltitude: 24,
          altitudeWave: 4.0,
          altitudeFrequency: 0.55,
          speed: 0.34,
          phase: 0.8,
          scale: 1.0,
          flightType: 'orbit',
          clockwise: true,
        },
      },
      // Mountain Scout Husky Dog-Bird
      {
        breed: 'husky',
        config: {
          center: new THREE.Vector3(5, 29, 15),
          radiusX: 58,
          radiusZ: 52,
          baseAltitude: 29,
          altitudeWave: 6.0,
          altitudeFrequency: 0.45,
          speed: 0.3,
          phase: 2.7,
          scale: 1.25,
          flightType: 'orbit',
          clockwise: false,
        },
      },
    ];

    configs.forEach(({ breed, config }) => {
      const dogBird = this.buildDogBirdMesh(breed, config);
      this.scene.add(dogBird.group);
      this.dogBirds.push(dogBird);
    });
  }

  private buildDogBirdMesh(breed: DogBreed, config: DogBirdFlightConfig): DogBirdInstance {
    const rootGroup = new THREE.Group();
    rootGroup.scale.set(config.scale, config.scale, config.scale);

    // Breed specific color palettes
    const palette = this.getBreedPalette(breed);

    // 1. Bird Body (Aerodynamic torso with feathers and dog collar)
    const bodyGeo = new THREE.ConeGeometry(0.55, 1.6, 8);
    bodyGeo.rotateX(Math.PI / 2); // Point forward along Z-axis
    const bodyMat = new THREE.MeshStandardMaterial({
      color: palette.mainColor,
      roughness: 0.7,
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0, 0);
    body.castShadow = true;
    rootGroup.add(body);

    // Underbelly fluff patch
    const bellyGeo = new THREE.SphereGeometry(0.48, 8, 6);
    bellyGeo.scale(0.85, 0.7, 1.2);
    const bellyMat = new THREE.MeshStandardMaterial({
      color: palette.bellyColor,
      roughness: 0.8,
      flatShading: true,
    });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, -0.15, 0.1);
    rootGroup.add(belly);

    // Collar
    const collarGeo = new THREE.TorusGeometry(0.42, 0.06, 6, 12);
    const collarMat = new THREE.MeshStandardMaterial({
      color: palette.collarColor,
      roughness: 0.3,
      metalness: 0.5,
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 0.1, 0.62);
    collar.rotation.x = Math.PI / 4;
    rootGroup.add(collar);

    // Collar Golden Tag / Bell
    const tagGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const tagMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
    });
    const tag = new THREE.Mesh(tagGeo, tagMat);
    tag.position.set(0, -0.22, 0.78);
    rootGroup.add(tag);

    // 2. Dog Head & Cute Face
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.28, 0.85);

    // Dog Cranium
    const headGeo = new THREE.SphereGeometry(0.42, 8, 8);
    headGeo.scale(1.0, 0.95, 1.05);
    const headMat = new THREE.MeshStandardMaterial({
      color: palette.mainColor,
      roughness: 0.7,
      flatShading: true,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headGroup.add(headMesh);

    // Dog Snout / Muzzle
    const snoutGeo = new THREE.BoxGeometry(0.32, 0.26, 0.38);
    const snoutMat = new THREE.MeshStandardMaterial({
      color: palette.snoutColor,
      roughness: 0.8,
      flatShading: true,
    });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, -0.08, 0.36);
    headGroup.add(snout);

    // Dog Nose
    const noseGeo = new THREE.SphereGeometry(0.09, 6, 6);
    noseGeo.scale(1.2, 0.9, 1.0);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.2,
      metalness: 0.1,
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.02, 0.54);
    headGroup.add(nose);

    // Dog Smiling Mouth & Lolling Pink Tongue
    const tongueGeo = new THREE.BoxGeometry(0.12, 0.04, 0.18);
    tongueGeo.rotateX(0.2);
    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
    });
    const tongue = new THREE.Mesh(tongueGeo, tongueMat);
    tongue.position.set(0.04, -0.19, 0.46);
    headGroup.add(tongue);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.1,
    });
    const pupilHighlightGeo = new THREE.SphereGeometry(0.025, 4, 4);
    const pupilHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left Eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.08, 0.32);
    const leftHigh = new THREE.Mesh(pupilHighlightGeo, pupilHighlightMat);
    leftHigh.position.set(-0.02, 0.03, 0.06);
    leftEye.add(leftHigh);
    headGroup.add(leftEye);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.08, 0.32);
    const rightHigh = new THREE.Mesh(pupilHighlightGeo, pupilHighlightMat);
    rightHigh.position.set(0.02, 0.03, 0.06);
    rightEye.add(rightHigh);
    headGroup.add(rightEye);

    // Eyebrow markings (for Shiba/Husky/Beagle)
    if (palette.hasEyebrowDots) {
      const dotGeo = new THREE.SphereGeometry(0.05, 4, 4);
      const dotMat = new THREE.MeshBasicMaterial({ color: palette.bellyColor });
      const leftDot = new THREE.Mesh(dotGeo, dotMat);
      leftDot.position.set(-0.16, 0.22, 0.3);
      const rightDot = new THREE.Mesh(dotGeo, dotMat);
      rightDot.position.set(0.16, 0.22, 0.3);
      headGroup.add(leftDot);
      headGroup.add(rightDot);
    }

    // Ears
    const leftEar = new THREE.Group();
    const rightEar = new THREE.Group();

    if (palette.earType === 'floppy') {
      // Drooping hound/retriever ears
      const earGeo = new THREE.BoxGeometry(0.15, 0.42, 0.1);
      earGeo.translate(0, -0.18, 0);
      const earMat = new THREE.MeshStandardMaterial({
        color: palette.earColor,
        roughness: 0.7,
        flatShading: true,
      });

      const lMesh = new THREE.Mesh(earGeo, earMat);
      lMesh.rotation.z = -0.3;
      leftEar.position.set(-0.35, 0.18, 0.05);
      leftEar.add(lMesh);

      const rMesh = new THREE.Mesh(earGeo, earMat);
      rMesh.rotation.z = 0.3;
      rightEar.position.set(0.35, 0.18, 0.05);
      rightEar.add(rMesh);
    } else {
      // Perky triangular ears (Shiba, Corgi, Husky)
      const earGeo = new THREE.ConeGeometry(0.16, 0.38, 4);
      earGeo.translate(0, 0.18, 0);
      earGeo.rotateY(Math.PI / 4);
      const earMat = new THREE.MeshStandardMaterial({
        color: palette.earColor,
        roughness: 0.7,
        flatShading: true,
      });

      const innerEarGeo = new THREE.ConeGeometry(0.1, 0.25, 4);
      innerEarGeo.translate(0, 0.14, 0.04);
      innerEarGeo.rotateY(Math.PI / 4);
      const innerEarMat = new THREE.MeshBasicMaterial({ color: 0xfda4af });

      const lMesh = new THREE.Mesh(earGeo, earMat);
      lMesh.add(new THREE.Mesh(innerEarGeo, innerEarMat));
      lMesh.rotation.z = 0.35;
      lMesh.rotation.x = -0.15;
      leftEar.position.set(-0.25, 0.3, -0.05);
      leftEar.add(lMesh);

      const rMesh = new THREE.Mesh(earGeo, earMat);
      rMesh.add(new THREE.Mesh(innerEarGeo, innerEarMat));
      rMesh.rotation.z = -0.35;
      rMesh.rotation.x = -0.15;
      rightEar.position.set(0.25, 0.3, -0.05);
      rightEar.add(rMesh);
    }

    headGroup.add(leftEar);
    headGroup.add(rightEar);
    rootGroup.add(headGroup);

    // 3. Flapping Bird Wings with Layered Feathers
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.45, 0.1, 0.15);

    const rightWing = new THREE.Group();
    rightWing.position.set(0.45, 0.1, 0.15);

    this.buildWingFeathers(leftWing, true, palette);
    this.buildWingFeathers(rightWing, false, palette);

    rootGroup.add(leftWing);
    rootGroup.add(rightWing);

    // 4. Wagging Bird-Dog Tail (feathery tail fan)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.1, -0.8);

    const tailFeatherGeo = new THREE.BoxGeometry(0.12, 0.05, 0.65);
    tailFeatherGeo.translate(0, 0, -0.3);
    const tailMat = new THREE.MeshStandardMaterial({
      color: palette.mainColor,
      roughness: 0.7,
      flatShading: true,
    });
    const tailTipMat = new THREE.MeshStandardMaterial({
      color: palette.bellyColor,
      roughness: 0.7,
      flatShading: true,
    });

    for (let f = -2; f <= 2; f++) {
      const feather = new THREE.Mesh(tailFeatherGeo, f === 0 ? tailTipMat : tailMat);
      feather.rotation.y = f * 0.18;
      feather.rotation.x = -0.15 + Math.abs(f) * 0.05;
      tailGroup.add(feather);
    }
    rootGroup.add(tailGroup);

    // 5. Cute Tucked Puppy Paws
    const pawGeo = new THREE.SphereGeometry(0.12, 6, 6);
    pawGeo.scale(1.0, 0.6, 1.4);
    const pawMat = new THREE.MeshStandardMaterial({
      color: palette.bellyColor,
      roughness: 0.8,
      flatShading: true,
    });

    const frontLeftPaw = new THREE.Mesh(pawGeo, pawMat);
    frontLeftPaw.position.set(-0.25, -0.35, 0.35);
    rootGroup.add(frontLeftPaw);

    const frontRightPaw = new THREE.Mesh(pawGeo, pawMat);
    frontRightPaw.position.set(0.25, -0.35, 0.35);
    rootGroup.add(frontRightPaw);

    const backLeftPaw = new THREE.Mesh(pawGeo, pawMat);
    backLeftPaw.position.set(-0.22, -0.3, -0.35);
    rootGroup.add(backLeftPaw);

    const backRightPaw = new THREE.Mesh(pawGeo, pawMat);
    backRightPaw.position.set(0.22, -0.3, -0.35);
    rootGroup.add(backRightPaw);

    // Set initial position
    this.updateSinglePosition(rootGroup, config, 0);

    return {
      group: rootGroup,
      breed,
      leftWing,
      rightWing,
      head: headGroup,
      leftEar,
      rightEar,
      tail: tailGroup,
      config,
      flapPhase: Math.random() * Math.PI * 2,
      glideTimer: 3 + Math.random() * 5,
      isGliding: false,
      barkTimer: 5 + Math.random() * 15,
    };
  }

  private buildWingFeathers(wingGroup: THREE.Group, isLeft: boolean, palette: any) {
    const sign = isLeft ? -1 : 1;
    const wingMat = new THREE.MeshStandardMaterial({
      color: palette.wingColor || palette.mainColor,
      roughness: 0.6,
      flatShading: true,
    });
    const wingTipMat = new THREE.MeshStandardMaterial({
      color: palette.wingTipColor || palette.bellyColor,
      roughness: 0.6,
      flatShading: true,
    });

    // Primary & Secondary Feather Sections
    const featherCount = 5;
    for (let i = 0; i < featherCount; i++) {
      const fLength = 0.9 + (featherCount - i) * 0.22;
      const fWidth = 0.22;
      const fGeo = new THREE.BoxGeometry(fWidth, 0.04, fLength);
      fGeo.translate(0, 0, -fLength * 0.35);

      const mat = i >= 3 ? wingTipMat : wingMat;
      const feather = new THREE.Mesh(fGeo, mat);

      feather.position.set(sign * (0.2 + i * 0.28), 0, -i * 0.06);
      feather.rotation.y = sign * (0.25 + i * 0.12);
      feather.rotation.z = sign * (0.05 + i * 0.04);
      feather.castShadow = true;
      wingGroup.add(feather);
    }
  }

  private getBreedPalette(breed: DogBreed) {
    switch (breed) {
      case 'golden':
        return {
          mainColor: 0xf59e0b, // Golden amber
          bellyColor: 0xfef3c7, // Soft cream
          snoutColor: 0xfde68a,
          earColor: 0xd97706,
          collarColor: 0xef4444, // Red collar
          earType: 'floppy',
          hasEyebrowDots: false,
        };
      case 'shiba':
        return {
          mainColor: 0xea580c, // Rich fox orange
          bellyColor: 0xffedd5, // Pure cream
          snoutColor: 0xffedd5,
          earColor: 0xc2410c,
          collarColor: 0x10b981, // Emerald collar
          earType: 'pointy',
          hasEyebrowDots: true,
        };
      case 'corgi':
        return {
          mainColor: 0xd97706, // Warm tan
          bellyColor: 0xffffff, // Bright white
          snoutColor: 0xffffff,
          earColor: 0xb45309,
          collarColor: 0x8b5cf6, // Royal purple collar
          earType: 'pointy',
          hasEyebrowDots: true,
        };
      case 'husky':
        return {
          mainColor: 0x475569, // Slate grey
          bellyColor: 0xf8fafc, // Snow white
          snoutColor: 0xf8fafc,
          earColor: 0x334155,
          collarColor: 0x06b6d4, // Cyan collar
          earType: 'pointy',
          hasEyebrowDots: true,
        };
      case 'beagle':
        return {
          mainColor: 0xb45309, // Hound brown
          bellyColor: 0xffffff, // White
          snoutColor: 0xffffff,
          earColor: 0x27272a, // Dark ears
          collarColor: 0x3b82f6, // Sky blue collar
          earType: 'floppy',
          hasEyebrowDots: true,
        };
      case 'dalmatian':
        return {
          mainColor: 0xf8fafc, // Pure white
          bellyColor: 0xe2e8f0,
          snoutColor: 0xf8fafc,
          earColor: 0x18181b, // Black spotted ears
          collarColor: 0xec4899, // Hot pink collar
          earType: 'floppy',
          hasEyebrowDots: false,
        };
    }
  }

  private updateSinglePosition(group: THREE.Group, config: DogBirdFlightConfig, t: number) {
    const angle = (t * config.speed + config.phase) * (config.clockwise ? 1 : -1);

    let x = 0;
    let z = 0;
    let y = config.baseAltitude + Math.sin(t * config.altitudeFrequency + config.phase) * config.altitudeWave;

    if (config.flightType === 'figure8') {
      x = config.center.x + Math.sin(angle) * config.radiusX;
      z = config.center.z + Math.sin(angle * 2) * (config.radiusZ * 0.5);
    } else if (config.flightType === 'swoop') {
      x = config.center.x + Math.cos(angle) * config.radiusX;
      z = config.center.z + Math.sin(angle) * config.radiusZ;
      y += Math.sin(angle * 3) * 3.5;
    } else {
      // Standard orbital loop
      x = config.center.x + Math.cos(angle) * config.radiusX;
      z = config.center.z + Math.sin(angle) * config.radiusZ;
    }

    // Next point for smooth tangent lookAt and banking
    const dt = 0.05;
    const nextAngle = ((t + dt) * config.speed + config.phase) * (config.clockwise ? 1 : -1);
    let nextX = config.center.x + Math.cos(nextAngle) * config.radiusX;
    let nextZ = config.center.z + Math.sin(nextAngle) * config.radiusZ;
    let nextY = config.baseAltitude + Math.sin((t + dt) * config.altitudeFrequency + config.phase) * config.altitudeWave;

    if (config.flightType === 'figure8') {
      nextX = config.center.x + Math.sin(nextAngle) * config.radiusX;
      nextZ = config.center.z + Math.sin(nextAngle * 2) * (config.radiusZ * 0.5);
    } else if (config.flightType === 'swoop') {
      nextY += Math.sin(nextAngle * 3) * 3.5;
    }

    group.position.set(x, y, z);

    // Look along flight vector
    const forward = new THREE.Vector3(nextX - x, nextY - y, nextZ - z).normalize();
    const targetPos = new THREE.Vector3().addVectors(group.position, forward);
    group.lookAt(targetPos);

    // Natural banking into curve
    const bank = (config.clockwise ? -1 : 1) * 0.35;
    group.rotation.z += bank;
  }

  public update(time: number, delta: number) {
    this.dogBirds.forEach((db) => {
      // 1. Move along celestial trajectory
      this.updateSinglePosition(db.group, db.config, time);

      // 2. Gliding vs Flapping logic
      db.glideTimer -= delta;
      if (db.glideTimer <= 0) {
        db.isGliding = !db.isGliding;
        db.glideTimer = db.isGliding ? 2.5 + Math.random() * 3.0 : 4.0 + Math.random() * 6.0;
      }

      // 3. Wing Flapping Animation
      if (db.isGliding) {
        // Soaring wing pose with gentle dihedral angle
        const glideFloat = Math.sin(time * 2.5 + db.flapPhase) * 0.06;
        db.leftWing.rotation.z = -0.15 + glideFloat;
        db.rightWing.rotation.z = 0.15 - glideFloat;
        db.leftWing.rotation.x = 0.05;
        db.rightWing.rotation.x = 0.05;
      } else {
        // Active energetic bird wing flapping
        const flapRate = 9.5;
        const flapAngle = Math.sin(time * flapRate + db.flapPhase);
        db.leftWing.rotation.z = -flapAngle * 0.75 - 0.2;
        db.rightWing.rotation.z = flapAngle * 0.75 + 0.2;
        db.leftWing.rotation.x = -Math.cos(time * flapRate + db.flapPhase) * 0.25;
        db.rightWing.rotation.x = -Math.cos(time * flapRate + db.flapPhase) * 0.25;
      }

      // 4. Tail Wagging (Happy flying puppy wag!)
      const tailWag = Math.sin(time * 12.0 + db.flapPhase) * 0.45;
      db.tail.rotation.y = tailWag;
      db.tail.rotation.x = -0.15 + Math.sin(time * 3.0) * 0.08;

      // 5. Head Bobbing & Ear Aerodynamic Flutter
      db.head.rotation.y = Math.sin(time * 2.0 + db.flapPhase) * 0.12;
      db.head.rotation.x = Math.sin(time * 3.5) * 0.08;

      // Floppy or pointy ears fluttering in the wind
      const earFlutter = Math.sin(time * 16.0 + db.flapPhase) * 0.12;
      db.leftEar.rotation.x = earFlutter;
      db.rightEar.rotation.x = -earFlutter;
    });
  }

  public cleanup() {
    this.dogBirds.forEach((db) => {
      this.scene.remove(db.group);
      // Clean child geometries/materials
      db.group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    });
    this.dogBirds = [];
  }
}
