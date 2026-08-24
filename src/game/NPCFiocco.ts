import * as THREE from 'three';
import { FioccoAccessoryId, FioccoAccessoryConfig } from '../types';

export interface FioccoDialogue {
  id: string;
  text: string;
  mood: 'happy' | 'curious' | 'wise' | 'excited' | 'sleepy';
  tip?: string;
}

export const FIOCCO_ACCESSORIES: Record<FioccoAccessoryId, FioccoAccessoryConfig> = {
  halo: {
    id: 'halo',
    name: 'Aureola Sacra',
    icon: '✨',
    description: 'Aureola dorata fluttuante dei custodi celesti.',
  },
  star_crown: {
    id: 'star_crown',
    name: 'Corona Stellare',
    icon: '👑',
    description: 'Piccola corona d\'oro con gemme forgiata con frammenti di stelle.',
  },
  angel_wings: {
    id: 'angel_wings',
    name: 'Ali Angeliche',
    icon: '🪽',
    description: 'Morbide ali celesti piumate sul dorso di Fiocco.',
  },
  wizard_hat: {
    id: 'wizard_hat',
    name: 'Cappello da Mago',
    icon: '🧙‍♂️',
    description: 'Cappello a punta indaco con stella d\'oro per piccoli maghi.',
  },
  none: {
    id: 'none',
    name: 'Semplice Naturale',
    icon: '🐱',
    description: 'Fiocco al naturale con il suo fiocchetto dorato.',
  },
};

export const FIOCCO_DIALOGUES_BY_LEVEL: Record<number, FioccoDialogue[]> = {
  1: [
    {
      id: 'f1_1',
      mood: 'happy',
      text: 'Miao! Ciao viandante celeste! Io sono Fiocco, il gatto custode di queste rovine.',
      tip: 'Consiglio: Premi Spazio a mezz\'aria per fare il Doppio Salto, o Shift/Q per lo Scatto Rapido!',
    },
    {
      id: 'f1_2',
      mood: 'curious',
      text: 'Raccogli le 3 Rune di Luce per risvegliare il Portale Antico e passare al prossimo reame.',
      tip: 'Consiglio: Quando vedi un\'ancora col mirino celeste, premi E (o tocca Rampino) per agganciarti!',
    },
    {
      id: 'f1_3',
      mood: 'wise',
      text: 'Attento al Guardiano di Pietra sull\'isola di sinistra! Se ti avvicini si sveglierà. Usa lo Scatto per seminarlo!',
      tip: 'Consiglio: Se cadi nel vuoto, la brezza celeste ti riporterà sull\'ultimo terreno sicuro.',
    },
    {
      id: 'f1_4',
      mood: 'excited',
      text: 'Miao! Guarda lassù tra le nuvole! Ci sono i mitici Uccelli-Cane che solcano il cielo scodinzolando! Sono spiriti custodi amichevoli. 🐕🪽',
      tip: 'Consiglio: Usa la Modalità Foto per immortalare il loro stormo che volteggia nell\'etere!',
    },
    {
      id: 'f1_5',
      mood: 'happy',
      text: 'Purr... adoro stare al calduccio tra queste nuvole! Torna a parlare con me ogni volta che vuoi un consiglio!',
    },
  ],
  2: [
    {
      id: 'f2_1',
      mood: 'excited',
      text: 'Miao! Sei arrivato alle Rovine Celesti! Qui le ancore fluttuanti si muovono nel vuoto.',
      tip: 'Consiglio: Aspetta che l\'ancora mobile sia nel punto più vicino prima di lanciare il rampino!',
    },
    {
      id: 'f2_2',
      mood: 'wise',
      text: 'Ci sono 2 Guardiani a pattugliare le rovine centrali. Puoi saltare sui pilastri alti per evitarli.',
      tip: 'Consiglio: Raccogli tutte le 4 Rune di Luce per attivare il tempio finale!',
    },
    {
      id: 'f2_3',
      mood: 'happy',
      text: 'Miao miao! Sapevi che dopo il rampino vieni proiettato in avanti con uno slancio fionda? Usalo per volare lontano!',
    },
  ],
  3: [
    {
      id: 'f3_1',
      mood: 'wise',
      text: 'Questo è il Picco dei Guardiani! Il Colosso Ancestrale e i guardiani rapidi proteggono il Portale Supremo.',
      tip: 'Consiglio: Usa le ancore ad alta quota e lo scatto in volo per muoverti sopra i guardiani senza toccare terra!',
    },
    {
      id: 'f3_2',
      mood: 'excited',
      text: 'Servono 5 Rune per aprire la soglia finale! Sei il viandante più agile che queste isole abbiano mai visto!',
      tip: 'Consiglio: Usa il Doppio Salto al culmine dello slancio per raggiungere le isole torre più alte.',
    },
    {
      id: 'f3_3',
      mood: 'happy',
      text: 'Purr purr... Sei una leggenda dei cieli! Ma altre meraviglie e misteri si celano oltre questo picco! Miao! 🐾',
    },
  ],
  4: [
    {
      id: 'f4_1',
      mood: 'excited',
      text: 'Miao! Benvenuto al Santuario dello Zenit! Guarda che aurore dorate illuminano il cielo.',
      tip: 'Consiglio: Le ancore qui oscillano verticalmente. Aspetta il punto più alto prima di sganciarti!',
    },
    {
      id: 'f4_2',
      mood: 'wise',
      text: 'Le sentinelle dello Zenit sono veloci come il vento! Esegui lo Scatto a mezz\'aria per seminarle.',
      tip: 'Consiglio: Trova le 5 Rune d\'Oro per aprire il grande portale dell\'Apex.',
    },
    {
      id: 'f4_3',
      mood: 'happy',
      text: 'Purr... il vento qui profuma di luce pura. Continua così, siamo quasi al Nucleo Celeste!',
    },
  ],
  5: [
    {
      id: 'f5_1',
      mood: 'excited',
      text: 'Miao! Eccoci al leggendario Nucleo Celeste Eterno! Il cuore dell\'intero arcipelago fluttuante.',
      tip: 'Consiglio: Il Guardiano Supremo sorveglia la grande cittadella. Concatena ancore mobili per superarlo!',
    },
    {
      id: 'f5_2',
      mood: 'wise',
      text: 'Servono 6 Rune Celesti per riaccendere la Stella Madre e completare l\'avventura celeste!',
      tip: 'Consiglio: Raccogli tutte le rune su ogni isola laterale prima di scalare la torre centrale.',
    },
    {
      id: 'f5_3',
      mood: 'happy',
      text: 'Sei diventato il Maestro delle Isole Celesti! Io e tutti gli spiriti del cielo ti siamo grati! Miao miao! 🌟🐾',
    },
  ],
};

export class NPCFiocco {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public interactionRadius: number = 4.2;
  public currentDialogueIndex: number = 0;
  public isPlayerNearby: boolean = false;
  public currentAccessory: FioccoAccessoryId = 'halo';

  private bodyMesh!: THREE.Mesh;
  private headGroup!: THREE.Group;
  private tailGroup!: THREE.Group;
  private leftEarMesh!: THREE.Mesh;
  private rightEarMesh!: THREE.Mesh;
  private haloMesh!: THREE.Mesh;
  private starCrownGroup!: THREE.Group;
  private angelWingsGroup!: THREE.Group;
  private wizardHatGroup!: THREE.Group;
  private beaconGroup!: THREE.Group;
  private catLight!: THREE.PointLight;
  private auraRing!: THREE.Mesh;

  constructor(scene: THREE.Scene, position: THREE.Vector3 = new THREE.Vector3(2.5, 0.6, 2.0)) {
    this.position = position.clone();
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    this.buildCatModel();
    this.buildBeacon();
    this.setAccessory('halo');
    scene.add(this.group);
  }

  public setAccessory(accessoryId: FioccoAccessoryId) {
    this.currentAccessory = accessoryId;
    if (this.haloMesh) this.haloMesh.visible = accessoryId === 'halo';
    if (this.starCrownGroup) this.starCrownGroup.visible = accessoryId === 'star_crown';
    if (this.angelWingsGroup) this.angelWingsGroup.visible = accessoryId === 'angel_wings';
    if (this.wizardHatGroup) this.wizardHatGroup.visible = accessoryId === 'wizard_hat';
  }

  private buildCatModel() {
    // White fur material
    const whiteFurMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.05,
    });

    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      roughness: 0.5,
    });

    const blueEyesMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.3,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });

    const catInnerGroup = new THREE.Group();
    // Scale cat slightly up so it is prominent and clearly visible
    catInnerGroup.scale.set(1.25, 1.25, 1.25);

    // 1. Cat Body (Rounded sphere shape)
    const bodyGeo = new THREE.SphereGeometry(0.38, 12, 10);
    bodyGeo.scale(1.0, 0.92, 1.25);
    this.bodyMesh = new THREE.Mesh(bodyGeo, whiteFurMat);
    this.bodyMesh.position.y = 0.38;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    catInnerGroup.add(this.bodyMesh);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.72, 0.32);

    const headGeo = new THREE.SphereGeometry(0.32, 14, 12);
    headGeo.scale(1.15, 0.95, 1.05);
    const headMesh = new THREE.Mesh(headGeo, whiteFurMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Snout / Muzzle
    const snoutGeo = new THREE.SphereGeometry(0.13, 8, 8);
    snoutGeo.scale(1.2, 0.8, 1.0);
    const snoutMesh = new THREE.Mesh(snoutGeo, whiteFurMat);
    snoutMesh.position.set(0, -0.04, 0.25);
    this.headGroup.add(snoutMesh);

    // Cute pink nose
    const noseGeo = new THREE.ConeGeometry(0.04, 0.045, 3);
    noseGeo.rotateX(Math.PI);
    const noseMesh = new THREE.Mesh(noseGeo, pinkMat);
    noseMesh.position.set(0, -0.02, 0.35);
    this.headGroup.add(noseMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.055, 8, 8);
    eyeGeo.scale(0.8, 1.1, 0.5);

    const leftEye = new THREE.Mesh(eyeGeo, blueEyesMat);
    leftEye.position.set(-0.13, 0.06, 0.27);
    leftEye.rotation.y = -0.15;
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, blueEyesMat);
    rightEye.position.set(0.13, 0.06, 0.27);
    rightEye.rotation.y = 0.15;
    this.headGroup.add(rightEye);

    // Sparkles on eyes
    const sparkleGeo = new THREE.SphereGeometry(0.02, 4, 4);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    leftSparkle.position.set(-0.14, 0.08, 0.3);
    this.headGroup.add(leftSparkle);

    const rightSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    rightSparkle.position.set(0.12, 0.08, 0.3);
    this.headGroup.add(rightSparkle);

    // Pointy Cat Ears
    const earGeo = new THREE.ConeGeometry(0.12, 0.24, 4);
    earGeo.scale(0.8, 1.0, 0.5);

    this.leftEarMesh = new THREE.Mesh(earGeo, whiteFurMat);
    this.leftEarMesh.position.set(-0.2, 0.26, 0.02);
    this.leftEarMesh.rotation.z = 0.35;
    this.leftEarMesh.rotation.x = -0.1;
    this.headGroup.add(this.leftEarMesh);

    const innerEarL = new THREE.Mesh(earGeo, pinkMat);
    innerEarL.scale.set(0.65, 0.65, 0.65);
    innerEarL.position.set(0, 0, 0.02);
    this.leftEarMesh.add(innerEarL);

    this.rightEarMesh = new THREE.Mesh(earGeo, whiteFurMat);
    this.rightEarMesh.position.set(0.2, 0.26, 0.02);
    this.rightEarMesh.rotation.z = -0.35;
    this.rightEarMesh.rotation.x = -0.1;
    this.headGroup.add(this.rightEarMesh);

    const innerEarR = new THREE.Mesh(earGeo, pinkMat);
    innerEarR.scale.set(0.65, 0.65, 0.65);
    innerEarR.position.set(0, 0, 0.02);
    this.rightEarMesh.add(innerEarR);

    // Golden Bow (Fiocco) on Collar
    const collarGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 16);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, goldMat);
    collar.position.set(0, -0.2, 0);
    this.headGroup.add(collar);

    const bowCenterGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const bowWingGeo = new THREE.ConeGeometry(0.07, 0.12, 4);
    bowWingGeo.rotateZ(Math.PI / 2);

    const bowMesh = new THREE.Mesh(bowCenterGeo, goldMat);
    bowMesh.position.set(0, -0.2, 0.27);

    const leftBowWing = new THREE.Mesh(bowWingGeo, goldMat);
    leftBowWing.position.set(-0.08, 0, 0);
    bowMesh.add(leftBowWing);

    const rightBowWing = new THREE.Mesh(bowWingGeo, goldMat);
    rightBowWing.rotation.y = Math.PI;
    rightBowWing.position.set(0.08, 0, 0);
    bowMesh.add(rightBowWing);

    this.headGroup.add(bowMesh);

    // Halo above Fiocco
    const haloGeo = new THREE.TorusGeometry(0.2, 0.025, 8, 20);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.9,
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.haloMesh.position.set(0, 0.48, 0);
    this.headGroup.add(this.haloMesh);

    // Star Crown Accessory
    this.starCrownGroup = new THREE.Group();
    this.starCrownGroup.position.set(0, 0.32, 0.04);
    const crownBandGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.06, 8, 1, true);
    const crownBand = new THREE.Mesh(crownBandGeo, goldMat);
    this.starCrownGroup.add(crownBand);
    for (let i = 0; i < 4; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.1, 4);
      const spike = new THREE.Mesh(spikeGeo, goldMat);
      const angle = (i * Math.PI) / 2;
      spike.position.set(Math.sin(angle) * 0.12, 0.07, Math.cos(angle) * 0.12);
      this.starCrownGroup.add(spike);
    }
    const crownGemGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const crownGemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const crownGem = new THREE.Mesh(crownGemGeo, crownGemMat);
    crownGem.position.set(0, 0.08, 0.13);
    this.starCrownGroup.add(crownGem);
    this.headGroup.add(this.starCrownGroup);

    // Wizard Hat Accessory
    this.wizardHatGroup = new THREE.Group();
    this.wizardHatGroup.position.set(0, 0.3, 0.02);
    this.wizardHatGroup.rotation.x = -0.1;
    const hatBrimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 12);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.4 });
    const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
    this.wizardHatGroup.add(hatBrim);
    const hatConeGeo = new THREE.ConeGeometry(0.18, 0.4, 8);
    const hatCone = new THREE.Mesh(hatConeGeo, hatMat);
    hatCone.position.set(0, 0.2, -0.02);
    hatCone.rotation.x = -0.15;
    this.wizardHatGroup.add(hatCone);
    const hatBandGeo = new THREE.CylinderGeometry(0.17, 0.18, 0.05, 10);
    const hatBandMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const hatBand = new THREE.Mesh(hatBandGeo, hatBandMat);
    hatBand.position.set(0, 0.05, -0.01);
    this.wizardHatGroup.add(hatBand);
    this.headGroup.add(this.wizardHatGroup);

    catInnerGroup.add(this.headGroup);

    // Angel Wings Accessory (Mounted on Cat Body)
    this.angelWingsGroup = new THREE.Group();
    this.angelWingsGroup.position.set(0, 0.48, -0.12);
    const wingShape = new THREE.BoxGeometry(0.35, 0.22, 0.03);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
    });
    const leftWing = new THREE.Mesh(wingShape, wingMat);
    leftWing.position.set(-0.25, 0.05, 0);
    leftWing.rotation.set(0.2, 0.3, -0.3);
    this.angelWingsGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingShape, wingMat);
    rightWing.position.set(0.25, 0.05, 0);
    rightWing.rotation.set(0.2, -0.3, 0.3);
    this.angelWingsGroup.add(rightWing);
    catInnerGroup.add(this.angelWingsGroup);

    // 3. Paws
    const pawGeo = new THREE.SphereGeometry(0.1, 8, 8);
    pawGeo.scale(0.9, 0.7, 1.2);

    const leftPawFront = new THREE.Mesh(pawGeo, whiteFurMat);
    leftPawFront.position.set(-0.18, 0.08, 0.3);
    catInnerGroup.add(leftPawFront);

    const rightPawFront = new THREE.Mesh(pawGeo, whiteFurMat);
    rightPawFront.position.set(0.18, 0.08, 0.3);
    catInnerGroup.add(rightPawFront);

    const leftPawBack = new THREE.Mesh(pawGeo, whiteFurMat);
    leftPawBack.position.set(-0.22, 0.08, -0.25);
    catInnerGroup.add(leftPawBack);

    const rightPawBack = new THREE.Mesh(pawGeo, whiteFurMat);
    rightPawBack.position.set(0.22, 0.08, -0.25);
    catInnerGroup.add(rightPawBack);

    // 4. Tail
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.3, -0.4);

    const tailCurve = new THREE.CylinderGeometry(0.055, 0.045, 0.5, 8);
    tailCurve.translate(0, 0.25, 0);
    tailCurve.rotateX(-0.4);
    const tailMesh = new THREE.Mesh(tailCurve, whiteFurMat);
    this.tailGroup.add(tailMesh);

    const tailTipGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const tailTip = new THREE.Mesh(tailTipGeo, whiteFurMat);
    tailTip.position.set(0, 0.45, -0.18);
    this.tailGroup.add(tailTip);

    catInnerGroup.add(this.tailGroup);

    this.group.add(catInnerGroup);

    // Warm Light on Fiocco
    this.catLight = new THREE.PointLight(0xffedd5, 1.8, 6);
    this.catLight.position.set(0, 1.2, 0);
    this.group.add(this.catLight);

    // Aura Ring on ground
    const auraGeo = new THREE.RingGeometry(0.6, 0.85, 24);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    this.auraRing = new THREE.Mesh(auraGeo, auraMat);
    this.auraRing.position.y = 0.04;
    this.group.add(this.auraRing);
  }

  private buildBeacon() {
    this.beaconGroup = new THREE.Group();
    this.beaconGroup.position.set(0, 1.8, 0);

    // Floating Golden Diamond / Cat Symbol Beacon
    const diamondGeo = new THREE.OctahedronGeometry(0.22, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
      metalness: 0.5,
      roughness: 0.2,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    this.beaconGroup.add(diamond);

    // Floating Rotating Halo Ring above Beacon
    const ringGeo = new THREE.TorusGeometry(0.35, 0.03, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    this.beaconGroup.add(ring);

    this.group.add(this.beaconGroup);
  }

  public setPosition(pos: [number, number, number]) {
    this.position.set(pos[0], pos[1], pos[2]);
    this.group.position.copy(this.position);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    const time = performance.now() * 0.001;
    const distToPlayer = this.group.position.distanceTo(playerPos);
    this.isPlayerNearby = distToPlayer <= this.interactionRadius;

    // 1. Idle Tail and Breathing
    this.bodyMesh.scale.y = 0.92 + Math.sin(time * 3) * 0.04;
    this.tailGroup.rotation.y = Math.sin(time * 4) * 0.45;
    this.tailGroup.rotation.z = Math.cos(time * 3) * 0.2;

    // Floating Halo, Crown, Hat, Wings & Aura
    this.haloMesh.position.y = 0.48 + Math.sin(time * 2.5) * 0.04;
    this.haloMesh.rotation.z = time * 0.8;
    
    if (this.starCrownGroup && this.starCrownGroup.visible) {
      this.starCrownGroup.rotation.y = time * 0.6;
    }
    if (this.wizardHatGroup && this.wizardHatGroup.visible) {
      this.wizardHatGroup.rotation.z = Math.sin(time * 2) * 0.05;
    }
    if (this.angelWingsGroup && this.angelWingsGroup.visible) {
      const flap = Math.sin(time * 5) * 0.25;
      const leftW = this.angelWingsGroup.children[0] as THREE.Mesh;
      const rightW = this.angelWingsGroup.children[1] as THREE.Mesh;
      if (leftW) leftW.rotation.y = 0.3 + flap;
      if (rightW) rightW.rotation.y = -0.3 - flap;
    }

    this.auraRing.rotation.z = time * 0.5;

    // Beacon animation
    this.beaconGroup.position.y = 1.8 + Math.sin(time * 3) * 0.12;
    this.beaconGroup.rotation.y = time * 2.0;

    // 2. React to player proximity
    if (this.isPlayerNearby) {
      // Turn whole cat towards player smoothly
      const dirToPlayer = new THREE.Vector3().subVectors(playerPos, this.group.position);
      dirToPlayer.y = 0;
      if (dirToPlayer.lengthSq() > 0.01) {
        dirToPlayer.normalize();
        const targetAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        let angleDiff = targetAngle - this.group.rotation.y;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.group.rotation.y += angleDiff * Math.min(1, delta * 5);
      }

      // Twitch ears happily
      this.leftEarMesh.rotation.z = 0.35 + Math.sin(time * 8) * 0.08;
      this.rightEarMesh.rotation.z = -0.35 + Math.cos(time * 8) * 0.08;
      this.auraRing.scale.setScalar(1.0 + Math.sin(time * 5) * 0.1);
    } else {
      this.leftEarMesh.rotation.z = 0.35;
      this.rightEarMesh.rotation.z = -0.35;
      this.auraRing.scale.setScalar(1.0);
    }
  }

  public getNextDialogue(levelId: number): FioccoDialogue {
    const list = FIOCCO_DIALOGUES_BY_LEVEL[levelId] || FIOCCO_DIALOGUES_BY_LEVEL[1];
    const dialogue = list[this.currentDialogueIndex % list.length];
    this.currentDialogueIndex++;
    return dialogue;
  }
}
