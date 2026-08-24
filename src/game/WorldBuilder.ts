import * as THREE from 'three';
import { IslandConfig, GrappleAnchorConfig, RuneConfig, LevelData, BouncePadConfig, WindUpdraftConfig } from '../types';
import { DogBirdsManager } from './DogBirds';

export class WorldBuilder {
  public scene: THREE.Scene;
  public dogBirdsManager: DogBirdsManager;
  public islandColliders: { center: THREE.Vector3; radius: number; height: number; y: number }[] = [];
  public grappleMeshes: Map<string, { group: THREE.Group; config: GrappleAnchorConfig; basePos: THREE.Vector3; rings: THREE.Mesh[] }> = new Map();
  public runeMeshes: Map<string, { group: THREE.Group; config: RuneConfig; collected: boolean; light: THREE.PointLight; core: THREE.Mesh; rings: THREE.Mesh[] }> = new Map();
  public bouncePadMeshes: { group: THREE.Group; config: BouncePadConfig; padMesh: THREE.Mesh; runeRings: THREE.Mesh[]; animTimer: number; springT: number }[] = [];
  public windUpdraftMeshes: { group: THREE.Group; config: WindUpdraftConfig; particles: THREE.Points; windRings: THREE.Mesh[] }[] = [];
  public portalGroup!: THREE.Group;
  public portalVortex!: THREE.Mesh;
  public portalVortex2!: THREE.Mesh;
  public portalLight!: THREE.PointLight;
  public portalRuneRings: THREE.Mesh[] = [];
  public portalGroundGlyph!: THREE.Mesh;
  public waterfallParticles: THREE.Points[] = [];
  public waterfallPlanes: THREE.Mesh[] = [];
  public atmosphereParticles!: THREE.Points;
  public spiritFireflies!: THREE.Points;
  public floatingCrystals: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number; rotSpeed: THREE.Vector3 }[] = [];
  public swayingTrees: { trunk: THREE.Group; baseRot: number; phase: number }[] = [];
  public hangingVines: { group: THREE.Group; phase: number }[] = [];
  public clouds: { group: THREE.Group; speed: number }[] = [];
  public sunFlareGroup!: THREE.Group;
  public godRaysGroup: THREE.Group = new THREE.Group();
  public auroraCurtains: THREE.Mesh[] = [];
  public rainbowArc?: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.dogBirdsManager = new DogBirdsManager(scene);
  }

  public buildLevel(level: LevelData) {
    this.islandColliders = [];
    this.grappleMeshes.clear();
    this.runeMeshes.clear();
    this.bouncePadMeshes = [];
    this.windUpdraftMeshes = [];
    this.floatingCrystals = [];
    this.swayingTrees = [];
    this.hangingVines = [];
    this.clouds = [];
    this.waterfallParticles = [];
    this.waterfallPlanes = [];

    // 1. Build Sky Dome & Ambient Lighting
    this.setupEnvironment(level);

    // 2. Build Floating Islands
    level.islands.forEach((island) => {
      this.createIsland(island);
    });

    // 3. Build Grapple Anchors
    const anchorsList = level.grappleAnchors || (level as any).anchors || [];
    anchorsList.forEach((anchor) => {
      this.createGrappleAnchor(anchor);
    });

    // 4. Build Magic Runes
    level.runes.forEach((rune) => {
      this.createRune(rune);
    });

    // 4.5 Build Interactive Bounce Pads & Wind Updrafts
    if (level.bouncePads) {
      level.bouncePads.forEach((pad) => {
        this.createBouncePad(pad);
      });
    }

    if (level.windUpdrafts) {
      level.windUpdrafts.forEach((updraft) => {
        this.createWindUpdraft(updraft);
      });
    }

    // 5. Build Ancient Portal
    this.createPortal(level.portalPosition);

    // 6. Build Floating Clouds, Sun Corona & Celestial Atmosphere
    this.createCloudscape();
    this.createAtmosphereParticles();
    this.createSpiritFireflies();

    // 7. Spawn Soaring Dog-Birds (Uccelli-Cane) in the celestial background
    this.dogBirdsManager.createFlock(level.id);
  }

  private setupEnvironment(level: LevelData) {
    // Advanced Celestial Sky Dome Shader with dynamic sun glow & starry haze
    const skyGeo = new THREE.SphereGeometry(260, 32, 24);
    const vertexShader = `
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      void main() {
        vLocalPosition = position;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 horizonColor;
      uniform vec3 sunPosition;
      uniform vec3 sunColor;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;

      void main() {
        vec3 nPos = normalize(vWorldPosition);
        float h = nPos.y;

        // Multi-stop celestial gradient
        vec3 col = bottomColor;
        if (h > 0.0) {
          float t = clamp(h * 1.6, 0.0, 1.0);
          col = mix(horizonColor, topColor, t);
        } else {
          float t = clamp(-h * 2.0, 0.0, 1.0);
          col = mix(horizonColor, bottomColor, t);
        }

        // Sun disc and scattering glow
        vec3 sunDir = normalize(sunPosition);
        float sunDot = max(dot(nPos, sunDir), 0.0);
        float sunCorona = pow(sunDot, 64.0) * 1.5;
        float sunAura = pow(sunDot, 6.0) * 0.45;

        col += sunColor * (sunCorona + sunAura);

        // Subtle celestial stardust shimmer in high dome
        if (h > 0.2) {
          float noise = fract(sin(dot(nPos.xz * 180.0, vec2(12.9898, 78.233))) * 43758.5453);
          if (noise > 0.985) {
            col += vec3(0.9, 0.95, 1.0) * (noise - 0.985) * 20.0 * h;
          }
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const topCol = new THREE.Color(level.skyColorTop);
    const bottomCol = new THREE.Color(level.skyColorBottom);
    const horizonCol = new THREE.Color(level.fogColor || '#ffd166');
    const sunCol = new THREE.Color(level.sunColor || '#fff3b0');
    const sunPos = new THREE.Vector3(60, 95, 45);

    const skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        topColor: { value: topCol },
        bottomColor: { value: bottomCol },
        horizonColor: { value: horizonCol },
        sunPosition: { value: sunPos },
        sunColor: { value: sunCol },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyDome);

    // Sun Corona Flare Billboard
    this.sunFlareGroup = new THREE.Group();
    this.sunFlareGroup.position.copy(sunPos.clone().normalize().multiplyScalar(220));

    // Outer sun halo disc
    const haloGeo = new THREE.PlaneGeometry(55, 55);
    const haloMat = new THREE.MeshBasicMaterial({
      color: level.sunColor || 0xffe6a3,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunHalo = new THREE.Mesh(haloGeo, haloMat);
    this.sunFlareGroup.add(sunHalo);

    // Inner bright core
    const coreGeo = new THREE.PlaneGeometry(24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunCore = new THREE.Mesh(coreGeo, coreMat);
    this.sunFlareGroup.add(sunCore);

    this.scene.add(this.sunFlareGroup);

    // Ambient Lighting with balanced sky warmth and ground fill
    const hemiLight = new THREE.HemisphereLight(topCol, bottomCol, 1.35);
    this.scene.add(hemiLight);

    // Main Sun Directional Light with deep crisp shadows
    const dirLight = new THREE.DirectionalLight(sunCol, 1.75);
    dirLight.position.set(50, 85, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 220;
    const shadowD = 75;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    dirLight.shadow.bias = -0.0003;
    dirLight.shadow.normalBias = 0.02;
    this.scene.add(dirLight);

    // Secondary Warm Rim Light for anime/Ghibli-style rim highlights
    const rimLight = new THREE.DirectionalLight(0xfff0db, 0.7);
    rimLight.position.set(-45, 25, -45);
    this.scene.add(rimLight);

    // Depth fog for atmospheric immersion
    this.scene.fog = new THREE.FogExp2(level.fogColor || '#ffd166', 0.006);

    // Volumetric Celestial God Rays (Light Shafts radiating from the Sun)
    this.godRaysGroup = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
      color: level.sunColor || 0xfff3b0,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    for (let r = 0; r < 7; r++) {
      const rayLength = 120 + Math.random() * 60;
      const rayGeo = new THREE.ConeGeometry(8 + Math.random() * 8, rayLength, 8, 1, true);
      rayGeo.translate(0, -rayLength * 0.5, 0);
      const ray = new THREE.Mesh(rayGeo, rayMat);

      const offsetAngle = (r / 7) * Math.PI * 2 + Math.random() * 0.5;
      const spread = 0.18 + Math.random() * 0.15;
      ray.position.copy(sunPos);
      ray.rotation.x = Math.PI * 0.65 + Math.sin(offsetAngle) * spread;
      ray.rotation.z = -Math.PI * 0.25 + Math.cos(offsetAngle) * spread;
      ray.scale.set(1.0 + Math.random() * 0.5, 1.0, 1.0 + Math.random() * 0.5);
      this.godRaysGroup.add(ray);
    }
    this.scene.add(this.godRaysGroup);

    // Atmospheric Celestial Aurora Ribbons (Upper Stratosphere)
    this.auroraCurtains = [];
    const auroraColors = [0x38bdf8, 0xa855f7, 0x34d399, 0xf43f5e];
    for (let a = 0; a < 3; a++) {
      const ribbonGeo = new THREE.CylinderGeometry(110 + a * 15, 120 + a * 15, 18, 32, 1, true, 0, Math.PI * 1.2);
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: auroraColors[a % auroraColors.length],
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.set(-20 + a * 20, 48 + a * 6, -30 + a * 15);
      ribbon.rotation.x = 0.25 + a * 0.1;
      ribbon.rotation.y = a * 0.8;
      this.scene.add(ribbon);
      this.auroraCurtains.push(ribbon);
    }
  }

  private createIsland(config: IslandConfig) {
    const group = new THREE.Group();
    group.position.set(...config.position);

    const radius = config.radius;
    const height = config.height;

    // Grass Top Material with stylized rich tone
    const grassColor = config.theme === 'temple' ? 0x5fa848 : (config.theme === 'ruins' ? 0x4e9c3e : 0x5cb338);
    const grassMat = new THREE.MeshStandardMaterial({
      color: grassColor,
      roughness: 0.75,
      metalness: 0.05,
      flatShading: true,
    });

    // Rock Bottom Material with Stratified earthy stone tone
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x4f4943,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });

    const strataMat = new THREE.MeshStandardMaterial({
      color: 0x6e665d,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });

    // 1. Island Top Plateau Plate
    const topSegments = 16;
    const topGeo = new THREE.CylinderGeometry(radius, radius * 0.96, 1.4, topSegments);
    const pos = topGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      if (vy > 0) {
        // Natural terrain wave undulation
        const wave = Math.sin(vx * 0.45) * Math.cos(vz * 0.45) * 0.4 + Math.sin(vx * 0.9 + vz * 0.9) * 0.15;
        pos.setY(i, vy + wave);
      }
    }
    topGeo.computeVertexNormals();

    const topMesh = new THREE.Mesh(topGeo, grassMat);
    topMesh.receiveShadow = true;
    group.add(topMesh);

    // 2. Island Underside Cone with rugged rock crags
    const bottomGeo = new THREE.ConeGeometry(radius * 0.96, height, topSegments, 4);
    bottomGeo.rotateX(Math.PI);
    bottomGeo.translate(0, -height * 0.5, 0);

    const bPos = bottomGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const vx = bPos.getX(i);
      const vy = bPos.getY(i);
      const vz = bPos.getZ(i);
      if (vy < 0) {
        const crag = Math.sin(vx * 0.7) * Math.cos(vz * 0.7) * (0.8 + (-vy / height) * 0.8);
        bPos.setX(i, vx + crag);
        bPos.setZ(i, vz + crag);
      }
    }
    bottomGeo.computeVertexNormals();

    const bottomMesh = new THREE.Mesh(bottomGeo, rockMat);
    bottomMesh.castShadow = true;
    bottomMesh.receiveShadow = true;
    group.add(bottomMesh);

    // 2b. Rock Strata Band for geological realism
    const strataGeo = new THREE.CylinderGeometry(radius * 0.94, radius * 0.85, 2.2, topSegments);
    strataGeo.translate(0, -2.0, 0);
    const strataMesh = new THREE.Mesh(strataGeo, strataMat);
    strataMesh.castShadow = true;
    strataMesh.receiveShadow = true;
    group.add(strataMesh);

    // 3. Hanging Ancient Vines cascading off cliff edges
    this.createHangingVines(group, radius);

    // 4. Floating Micro-Debris & Levitating Geodes
    for (let i = 0; i < 5; i++) {
      const rockR = 0.5 + Math.random() * 0.9;
      const rockGeo = new THREE.DodecahedronGeometry(rockR, 0);
      const microRock = new THREE.Mesh(rockGeo, rockMat);
      const ang = Math.random() * Math.PI * 2;
      const dist = radius * (0.3 + Math.random() * 0.6);
      microRock.position.set(
        Math.cos(ang) * dist,
        -height - 1.2 - Math.random() * 3.5,
        Math.sin(ang) * dist
      );
      microRock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      microRock.castShadow = true;
      group.add(microRock);
    }

    // 5. Levitating Energy Crystal Shard around island
    this.createFloatingCrystal(group, radius);

    // 6. Props & Foliage (Trees with Wind, Ancient Obelisks, Glowing Flora)
    this.populateIslandProps(group, config, radius);

    // 7. Waterfall with Rainbow Mist if configured
    if (config.hasWaterfall) {
      this.createWaterfall(group, radius);
    }

    this.scene.add(group);

    // Register collider for ground height calculations
    this.islandColliders.push({
      center: new THREE.Vector3(...config.position),
      radius: radius,
      height: height,
      y: config.position[1] + 0.7,
    });
  }

  private createHangingVines(group: THREE.Group, radius: number) {
    const vineMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.8,
      flatShading: true,
    });

    const vineCount = 3 + Math.floor(Math.random() * 3);
    for (let v = 0; v < vineCount; v++) {
      const angle = (v / vineCount) * Math.PI * 2 + Math.random() * 0.8;
      const x = Math.cos(angle) * (radius * 0.94);
      const z = Math.sin(angle) * (radius * 0.94);

      const vineGroup = new THREE.Group();
      vineGroup.position.set(x, 0.4, z);

      const length = 2.5 + Math.random() * 3.5;
      const links = 4;
      for (let l = 0; l < links; l++) {
        const linkGeo = new THREE.CylinderGeometry(0.08 - l * 0.012, 0.07 - l * 0.012, length / links, 4);
        linkGeo.translate(0, -((length / links) * (l + 0.5)), 0);
        const link = new THREE.Mesh(linkGeo, vineMat);
        link.castShadow = true;
        vineGroup.add(link);

        // Little hanging leaves on vine
        if (Math.random() > 0.3) {
          const leafGeo = new THREE.TetrahedronGeometry(0.16, 0);
          const leafMat = new THREE.MeshBasicMaterial({ color: 0x52b788 });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set((Math.random() - 0.5) * 0.15, -((length / links) * l) - 0.3, (Math.random() - 0.5) * 0.15);
          vineGroup.add(leaf);
        }
      }

      group.add(vineGroup);
      this.hangingVines.push({ group: vineGroup, phase: Math.random() * Math.PI * 2 });
    }
  }

  private createFloatingCrystal(group: THREE.Group, radius: number) {
    const crystalColors = [0x00f2fe, 0xffb703, 0xa855f7, 0x10b981];
    const colorHex = crystalColors[Math.floor(Math.random() * crystalColors.length)];

    const crystalGeo = new THREE.OctahedronGeometry(0.45, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.3,
      flatShading: true,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);

    const ang = Math.random() * Math.PI * 2;
    const dist = radius * 1.15;
    const startPos = new THREE.Vector3(Math.cos(ang) * dist, 1.5 + Math.random() * 2.0, Math.sin(ang) * dist);
    crystal.position.copy(startPos);

    // Subtle light glow
    const pLight = new THREE.PointLight(colorHex, 1.2, 5);
    crystal.add(pLight);

    group.add(crystal);
    this.floatingCrystals.push({
      mesh: crystal,
      basePos: startPos.clone(),
      speed: 1.0 + Math.random() * 1.5,
      rotSpeed: new THREE.Vector3(0.5 + Math.random() * 0.5, 0.8 + Math.random() * 0.8, 0.3),
    });
  }

  private populateIslandProps(group: THREE.Group, config: IslandConfig, radius: number) {
    const stonePillarMat = new THREE.MeshStandardMaterial({ color: 0x8a8e94, roughness: 0.8, flatShading: true });
    const runeStoneMat = new THREE.MeshStandardMaterial({ color: 0xb5ba72, roughness: 0.6, flatShading: true });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9, flatShading: true });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8, flatShading: true });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.7, flatShading: true });
    const foliageMat3 = new THREE.MeshStandardMaterial({ color: 0x74c69d, roughness: 0.7, flatShading: true });

    // 1. Wind-Swaying Trees
    const treeCount = config.treesCount || 3;
    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 2.2 + Math.random() * (radius - 3.8);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0.7, z);

      // Curved Trunk
      const trunkH = 2.0 + Math.random() * 1.0;
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.32, trunkH, 6);
      trunkGeo.translate(0, trunkH * 0.5, 0);
      const trunk = new THREE.Mesh(trunkGeo, woodMat);
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Multi-cluster Puffy Canopy
      const leavesCount = 4 + Math.floor(Math.random() * 3);
      for (let j = 0; j < leavesCount; j++) {
        const leafR = 0.75 + Math.random() * 0.55;
        const leafGeo = new THREE.DodecahedronGeometry(leafR, 0);
        const mat = j % 3 === 0 ? foliageMat : (j % 3 === 1 ? foliageMat2 : foliageMat3);
        const leaves = new THREE.Mesh(leafGeo, mat);
        leaves.position.set(
          (Math.random() - 0.5) * 0.8,
          trunkH + 0.2 + j * 0.45,
          (Math.random() - 0.5) * 0.8
        );
        leaves.castShadow = true;
        treeGroup.add(leaves);
      }

      group.add(treeGroup);
      this.swayingTrees.push({
        trunk: treeGroup,
        baseRot: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 2. Ancient Ruin Pillars & Inscribed Obelisks
    const pillarCount = config.pillarsCount || 2;
    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2 + 1.1;
      const dist = 3.2 + Math.random() * (radius - 4.2);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(x, 0.7, z);

      const pillarH = 2.6 + Math.random() * 2.2;
      const pillarGeo = new THREE.CylinderGeometry(0.42, 0.48, pillarH, 6);
      pillarGeo.translate(0, pillarH * 0.5, 0);
      const pillar = new THREE.Mesh(pillarGeo, stonePillarMat);
      pillar.castShadow = true;
      pillarGroup.add(pillar);

      // Pillar Capital / Carved Runic Top
      const capGeo = new THREE.BoxGeometry(1.1, 0.28, 1.1);
      const cap = new THREE.Mesh(capGeo, runeStoneMat);
      cap.position.y = pillarH;
      pillarGroup.add(cap);

      // Glowing Runic Inscription Plate on Pillar
      const glyphGeo = new THREE.PlaneGeometry(0.25, 0.8);
      const glyphMat = new THREE.MeshBasicMaterial({
        color: 0x38ef7d,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const glyph = new THREE.Mesh(glyphGeo, glyphMat);
      glyph.position.set(0, pillarH * 0.55, 0.44);
      pillarGroup.add(glyph);

      pillarGroup.rotation.z = (Math.random() - 0.5) * 0.08;
      pillarGroup.rotation.x = (Math.random() - 0.5) * 0.08;

      group.add(pillarGroup);
    }

    // 3. Glowing Flora, Mushrooms & Dense Stylized Grass Tufts
    const flowerColors = [0xffd166, 0xff5d8f, 0x4cc9f0, 0xb5179e];
    for (let i = 0; i < 22; i++) {
      const fx = (Math.random() - 0.5) * (radius * 1.45);
      const fz = (Math.random() - 0.5) * (radius * 1.45);
      if (fx * fx + fz * fz < (radius - 1.2) * (radius - 1.2)) {
        if (i % 3 === 0) {
          // Bioluminescent Wildflower
          const fColor = flowerColors[i % flowerColors.length];
          const flowerGeo = new THREE.TetrahedronGeometry(0.16, 0);
          const flowerMat = new THREE.MeshBasicMaterial({ color: fColor });
          const flower = new THREE.Mesh(flowerGeo, flowerMat);
          flower.position.set(fx, 0.82, fz);
          group.add(flower);
        } else {
          // Clustered 3-blade stylized grass
          const grassCluster = new THREE.Group();
          grassCluster.position.set(fx, 0.7, fz);
          for (let b = 0; b < 3; b++) {
            const bladeGeo = new THREE.ConeGeometry(0.08, 0.38 + Math.random() * 0.2, 3);
            bladeGeo.translate(0, 0.2, 0);
            const bladeMat = b % 2 === 0 ? foliageMat2 : foliageMat3;
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
            grassCluster.add(blade);
          }
          group.add(grassCluster);
        }
      }
    }
  }

  private createWaterfall(group: THREE.Group, radius: number) {
    const edgeAngle = -Math.PI * 0.35;
    const wx = Math.cos(edgeAngle) * (radius * 0.92);
    const wz = Math.sin(edgeAngle) * (radius * 0.92);

    // Multi-Layered Flowing Water Stream
    const streamGeo = new THREE.PlaneGeometry(1.6, 20, 2, 10);
    streamGeo.translate(0, -10, 0);

    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const stream = new THREE.Mesh(streamGeo, waterMat);
    stream.position.set(wx, 0.6, wz);
    stream.rotation.y = edgeAngle + Math.PI / 2;
    group.add(stream);
    this.waterfallPlanes.push(stream);

    // Secondary Frothing foam layer
    const foamGeo = new THREE.PlaneGeometry(1.3, 19, 2, 8);
    foamGeo.translate(0, -9.5, 0.05);
    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    stream.add(foam);

    // Waterfall Splash Particles & Radiant Rainbow Mist
    const particleCount = 55;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = wx + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = -Math.random() * 18;
      positions[i * 3 + 2] = wz + (Math.random() - 0.5) * 1.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe0f7fa,
      size: 0.4,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(particleGeo, pMat);
    group.add(particles);
    this.waterfallParticles.push(particles);

    // Rainbow mist arc halo at base of waterfall
    const rainbowGeo = new THREE.TorusGeometry(1.6, 0.12, 6, 16, Math.PI);
    const rainbowMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const rainbow = new THREE.Mesh(rainbowGeo, rainbowMat);
    rainbow.position.set(wx, -16, wz);
    rainbow.rotation.x = Math.PI / 2;
    group.add(rainbow);
  }

  private createGrappleAnchor(config: GrappleAnchorConfig) {
    const group = new THREE.Group();
    group.position.set(...config.position);

    // Glowing Core Crystal with Refractive Specular
    const crystalGeo = new THREE.OctahedronGeometry(0.72, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00d2de,
      emissiveIntensity: 1.0,
      metalness: 0.3,
      roughness: 0.1,
      flatShading: true,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystal);

    // Magnetic Rotating Ring 1 (Gold alloy)
    const ring1Geo = new THREE.TorusGeometry(1.05, 0.07, 8, 20);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    group.add(ring1);

    // Magnetic Rotating Ring 2 (Perpendicular)
    const ring2Geo = new THREE.TorusGeometry(1.28, 0.06, 8, 20);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);

    // Floating Glyph Runes orbiting around anchor
    const glyphRingGeo = new THREE.TorusGeometry(1.5, 0.03, 4, 8);
    const glyphRingMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.7 });
    const ring3 = new THREE.Mesh(glyphRingGeo, glyphRingMat);
    group.add(ring3);

    // Core Light
    const light = new THREE.PointLight(0x00f2fe, 2.2, 10);
    group.add(light);

    this.scene.add(group);

    this.grappleMeshes.set(config.id, {
      group,
      config,
      basePos: new THREE.Vector3(...config.position),
      rings: [ring1, ring2, ring3],
    });
  }

  private createRune(config: RuneConfig) {
    const group = new THREE.Group();
    group.position.set(...config.position);

    const runeColor = new THREE.Color(config.color || '#38ef7d');

    // Ancient Magical Rune Core (Dual Nested Octahedrons)
    const runeGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const runeMat = new THREE.MeshStandardMaterial({
      color: runeColor,
      emissive: runeColor,
      emissiveIntensity: 1.1,
      metalness: 0.4,
      roughness: 0.15,
      flatShading: true,
    });
    const runeMesh = new THREE.Mesh(runeGeo, runeMat);
    group.add(runeMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.OctahedronGeometry(0.3, 0);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerCore);

    // Outer Floating Glyphic Rings
    const ring1Geo = new THREE.TorusGeometry(0.78, 0.04, 6, 12);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    group.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(0.95, 0.03, 6, 12);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);

    // Ascending Light Pillar Beam (Subtle celestial ray)
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.35, 12, 6);
    beamGeo.translate(0, 6, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: runeColor,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    group.add(beam);

    // Point Light
    const light = new THREE.PointLight(runeColor, 2.5, 8);
    group.add(light);

    this.scene.add(group);

    this.runeMeshes.set(config.id, {
      group,
      config,
      collected: false,
      light,
      core: runeMesh,
      rings: [ring1, ring2],
    });
  }

  private createPortal(position: [number, number, number]) {
    this.portalGroup = new THREE.Group();
    this.portalGroup.position.set(...position);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3d4148, roughness: 0.8, flatShading: true });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf4b41a, metalness: 0.85, roughness: 0.2 });

    // 1. Ancient Stepped Portal Dais Base
    const baseGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.7, 16);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.receiveShadow = true;
    this.portalGroup.add(base);

    // Ground Magic Circle Glyph
    const groundGlyphGeo = new THREE.RingGeometry(1.2, 3.2, 24);
    groundGlyphGeo.rotateX(-Math.PI / 2);
    const groundGlyphMat = new THREE.MeshBasicMaterial({
      color: 0x4361ee,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.portalGroundGlyph = new THREE.Mesh(groundGlyphGeo, groundGlyphMat);
    this.portalGroundGlyph.position.y = 0.36;
    this.portalGroup.add(this.portalGroundGlyph);

    // 2. Standing Monolithic Portal Arch Stones
    const pillarGeo = new THREE.BoxGeometry(0.85, 4.8, 0.85);
    const leftPillar = new THREE.Mesh(pillarGeo, stoneMat);
    leftPillar.position.set(-2.1, 2.4, 0);
    leftPillar.castShadow = true;
    this.portalGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, stoneMat);
    rightPillar.position.set(2.1, 2.4, 0);
    rightPillar.castShadow = true;
    this.portalGroup.add(rightPillar);

    // Arch Keystone & Top Pediment
    const topBarGeo = new THREE.BoxGeometry(5.2, 0.9, 1.1);
    const topBar = new THREE.Mesh(topBarGeo, stoneMat);
    topBar.position.set(0, 4.8, 0);
    topBar.castShadow = true;
    this.portalGroup.add(topBar);

    // Golden Rune Inlays on Pillars
    const inlayGeo = new THREE.BoxGeometry(0.28, 3.4, 0.9);
    const leftInlay = new THREE.Mesh(inlayGeo, goldMat);
    leftInlay.position.set(-2.1, 2.4, 0);
    this.portalGroup.add(leftInlay);

    const rightInlay = new THREE.Mesh(inlayGeo, goldMat);
    rightInlay.position.set(2.1, 2.4, 0);
    this.portalGroup.add(rightInlay);

    // Floating Levitating Gate Rune Orbs
    for (let i = 0; i < 4; i++) {
      const orbGeo = new THREE.OctahedronGeometry(0.22, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x4cc9f0,
        emissive: 0x4cc9f0,
        emissiveIntensity: 0.8,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(-1.8 + i * 1.2, 5.5, 0);
      this.portalGroup.add(orb);
    }

    // 3. Swirling Cosmic Dual-Vortex Portal Mesh
    const vortexGeo1 = new THREE.PlaneGeometry(3.5, 4.2);
    const vortexMat1 = new THREE.MeshBasicMaterial({
      color: 0x3a0ca3,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.portalVortex = new THREE.Mesh(vortexGeo1, vortexMat1);
    this.portalVortex.position.set(0, 2.5, 0);
    this.portalGroup.add(this.portalVortex);

    const vortexGeo2 = new THREE.PlaneGeometry(2.8, 3.4);
    const vortexMat2 = new THREE.MeshBasicMaterial({
      color: 0x4361ee,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.portalVortex2 = new THREE.Mesh(vortexGeo2, vortexMat2);
    this.portalVortex2.position.set(0, 2.5, 0.05);
    this.portalGroup.add(this.portalVortex2);

    // 4. Point Light
    this.portalLight = new THREE.PointLight(0x4361ee, 0.8, 12);
    this.portalLight.position.set(0, 2.5, 0.6);
    this.portalGroup.add(this.portalLight);

    this.scene.add(this.portalGroup);
  }

  public activatePortalVisuals() {
    if (!this.portalVortex || !this.portalLight) return;
    (this.portalVortex.material as THREE.MeshBasicMaterial).color.setHex(0x4cc9f0);
    (this.portalVortex.material as THREE.MeshBasicMaterial).opacity = 0.9;
    (this.portalVortex2.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
    (this.portalVortex2.material as THREE.MeshBasicMaterial).opacity = 0.7;
    (this.portalGroundGlyph.material as THREE.MeshBasicMaterial).color.setHex(0x4cc9f0);
    (this.portalGroundGlyph.material as THREE.MeshBasicMaterial).opacity = 0.9;

    this.portalLight.color.setHex(0x4cc9f0);
    this.portalLight.intensity = 4.5;
  }

  private createCloudscape() {
    const cloudMatTop = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true,
      transparent: true,
      opacity: 0.88,
    });

    const cloudMatMist = new THREE.MeshLambertMaterial({
      color: 0xdde7f0,
      flatShading: true,
      transparent: true,
      opacity: 0.75,
    });

    // 1. Mid/High-Altitude Puffy Clouds
    for (let i = 0; i < 28; i++) {
      const cloudGroup = new THREE.Group();
      const puffs = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffs; p++) {
        const puffR = 3.5 + Math.random() * 4.5;
        const puffGeo = new THREE.DodecahedronGeometry(puffR, 0);
        const puff = new THREE.Mesh(puffGeo, cloudMatTop);
        puff.position.set(
          p * 3.5 - (puffs * 1.75),
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 3.0
        );
        cloudGroup.add(puff);
      }

      const ang = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 85;
      const height = -10 + Math.random() * 50;

      cloudGroup.position.set(Math.cos(ang) * dist, height, Math.sin(ang) * dist);
      this.scene.add(cloudGroup);
      this.clouds.push({ group: cloudGroup, speed: 0.6 + Math.random() * 0.6 });
    }

    // 2. Low-Altitude Celestial Mist Sea (Beneath the islands in the abyss)
    for (let i = 0; i < 18; i++) {
      const mistGroup = new THREE.Group();
      const puffs = 5 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffs; p++) {
        const puffR = 6.0 + Math.random() * 6.0;
        const puffGeo = new THREE.DodecahedronGeometry(puffR, 0);
        const puff = new THREE.Mesh(puffGeo, cloudMatMist);
        puff.position.set(
          p * 5.0 - (puffs * 2.5),
          (Math.random() - 0.5) * 2.0,
          (Math.random() - 0.5) * 5.0
        );
        mistGroup.add(puff);
      }

      const ang = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 90;
      const height = -28 - Math.random() * 15;

      mistGroup.position.set(Math.cos(ang) * dist, height, Math.sin(ang) * dist);
      this.scene.add(mistGroup);
      this.clouds.push({ group: mistGroup, speed: 0.3 + Math.random() * 0.3 });
    }
  }

  private createAtmosphereParticles() {
    const count = 160;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfff3b0,
      size: 0.5,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.atmosphereParticles = new THREE.Points(geo, mat);
    this.scene.add(this.atmosphereParticles);
  }

  private createSpiritFireflies() {
    const count = 75;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = 0.5 + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x70e000,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.spiritFireflies = new THREE.Points(geo, mat);
    this.scene.add(this.spiritFireflies);
  }

  public createBouncePad(config: BouncePadConfig) {
    const padGroup = new THREE.Group();
    padGroup.position.set(...config.position);

    // 1. Carved stone pedestal
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x474b54,
      roughness: 0.8,
      flatShading: true,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    padGroup.add(base);

    // 2. Bouncy Mushroom / Energy Pad Dome
    const padColor = config.color || 0xfacc15; // Golden celestial by default
    const domeGeo = new THREE.SphereGeometry(1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: padColor,
      emissive: padColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3,
    });
    const padMesh = new THREE.Mesh(domeGeo, domeMat);
    padMesh.position.y = 0.35;
    padGroup.add(padMesh);

    // 3. Orbiting Runes & Pulsing Glow Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: padColor,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.45;
    padGroup.add(ring1);

    const runeRings = [ring1];

    // 4. Upward Energy Beacon Light
    const padLight = new THREE.PointLight(padColor, 1.5, 6);
    padLight.position.set(0, 0.8, 0);
    padGroup.add(padLight);

    this.scene.add(padGroup);
    this.bouncePadMeshes.push({
      group: padGroup,
      config,
      padMesh,
      runeRings,
      animTimer: 0,
      springT: 0,
    });
  }

  public triggerBouncePadFX(padId: string) {
    const pad = this.bouncePadMeshes.find((p) => p.config.id === padId);
    if (pad) {
      pad.springT = 1.0;
    }
  }

  public createWindUpdraft(config: WindUpdraftConfig) {
    const updraftGroup = new THREE.Group();
    updraftGroup.position.set(...config.position);

    // 1. Ancient Stone Vent Base
    const ventGeo = new THREE.RingGeometry(0.8, config.radius, 24);
    ventGeo.rotateX(-Math.PI / 2);
    const ventMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.y = 0.05;
    updraftGroup.add(vent);

    // 2. Ascending Wind Rings
    const windRings: THREE.Mesh[] = [];
    const ringGeo = new THREE.TorusGeometry(config.radius * 0.85, 0.06, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.rotation.x = Math.PI / 2;
      ring.position.y = (config.height / 4) * i;
      updraftGroup.add(ring);
      windRings.push(ring);
    }

    // 3. Upward Leaf & Breeze Particle Stream
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * (config.radius * 0.8);
      pPos[i * 3] = Math.cos(ang) * r;
      pPos[i * 3 + 1] = Math.random() * config.height;
      pPos[i * 3 + 2] = Math.sin(ang) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    updraftGroup.add(particles);

    this.scene.add(updraftGroup);
    this.windUpdraftMeshes.push({
      group: updraftGroup,
      config,
      particles,
      windRings,
    });
  }

  public update(time: number, delta: number) {
    // 1. Animate Grapple Anchors & Nested Gyroscope Rings
    this.grappleMeshes.forEach(({ group, config, basePos, rings }) => {
      // Rotation on axes
      group.children[0].rotation.y += delta * 1.8;
      if (rings[0]) rings[0].rotation.x += delta * 1.4;
      if (rings[1]) rings[1].rotation.z += delta * 1.1;
      if (rings[2]) rings[2].rotation.y -= delta * 1.6;

      // Bobbing & moving
      const yOffset = Math.sin(time * 2.2 + basePos.x) * 0.35;
      if (config.isMoving && config.moveRange) {
        const moveSpeed = config.moveSpeed || 1.0;
        const m = Math.sin(time * moveSpeed);
        group.position.x = basePos.x + config.moveRange[0] * m;
        group.position.y = basePos.y + config.moveRange[1] * m + yOffset;
        group.position.z = basePos.z + config.moveRange[2] * m;
      } else {
        group.position.y = basePos.y + yOffset;
      }
    });

    // 2. Animate Runes & Orbital Glyph Rings
    this.runeMeshes.forEach(({ group, collected, core, rings }) => {
      if (!collected) {
        core.rotation.y += delta * 2.4;
        core.rotation.x += delta * 1.2;
        if (rings[0]) rings[0].rotation.z -= delta * 1.8;
        if (rings[1]) rings[1].rotation.y += delta * 1.5;
        group.position.y += Math.sin(time * 3.2 + group.position.x) * 0.006;
      }
    });

    // 2.5 Animate Bounce Pads & Wind Updrafts
    this.bouncePadMeshes.forEach((pad) => {
      pad.animTimer += delta;
      if (pad.runeRings[0]) {
        pad.runeRings[0].rotation.z += delta * 1.5;
      }
      if (pad.springT > 0) {
        pad.springT = Math.max(0, pad.springT - delta * 3.0);
        // Squash & Stretch elastic recoil
        const squish = Math.sin(pad.springT * Math.PI) * 0.45;
        pad.padMesh.scale.set(1 + squish * 0.6, 1 - squish * 0.5, 1 + squish * 0.6);
      } else {
        const pulse = 1.0 + Math.sin(pad.animTimer * 4) * 0.05;
        pad.padMesh.scale.set(pulse, pulse, pulse);
      }
    });

    this.windUpdraftMeshes.forEach(({ config, particles, windRings }) => {
      // Rotate & lift wind rings
      windRings.forEach((ring, idx) => {
        ring.rotation.z += delta * (1.5 + idx * 0.3);
        ring.position.y += delta * 4.0;
        if (ring.position.y > config.height) {
          ring.position.y = 0.2;
        }
        const relY = ring.position.y / config.height;
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.sin(relY * Math.PI) * 0.7;
      });

      // Stream particles upward
      const pos = particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * 8.0;
        if (y > config.height) {
          y = 0;
        }
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    });

    // 3. Animate Levitating Energy Crystals
    this.floatingCrystals.forEach(({ mesh, basePos, speed, rotSpeed }) => {
      mesh.rotation.x += rotSpeed.x * delta;
      mesh.rotation.y += rotSpeed.y * delta;
      mesh.rotation.z += rotSpeed.z * delta;
      mesh.position.y = basePos.y + Math.sin(time * speed + basePos.x) * 0.4;
    });

    // 4. Swaying Wind on Trees & Hanging Vines
    const wind = Math.sin(time * 1.6);
    this.swayingTrees.forEach(({ trunk, baseRot, phase }) => {
      trunk.rotation.z = baseRot + Math.sin(time * 1.8 + phase) * 0.045;
      trunk.rotation.x = Math.cos(time * 1.4 + phase) * 0.035;
    });

    this.hangingVines.forEach(({ group, phase }) => {
      group.rotation.z = Math.sin(time * 2.0 + phase) * 0.08;
      group.rotation.x = Math.cos(time * 1.7 + phase) * 0.06;
    });

    // 5. Animate Portal Vortexes & Ground Glyphs
    if (this.portalVortex) {
      this.portalVortex.rotation.z += delta * 1.6;
    }
    if (this.portalVortex2) {
      this.portalVortex2.rotation.z -= delta * 2.1;
    }
    if (this.portalGroundGlyph) {
      this.portalGroundGlyph.rotation.z += delta * 0.4;
    }

    // 6. Drift Cloudscape
    this.clouds.forEach(({ group, speed }) => {
      group.position.x += delta * (0.8 * speed);
      if (group.position.x > 140) {
        group.position.x = -140;
      }
    });

    // 7. Ambient Golden Pollen / Celestial Dust Drifting
    if (this.atmosphereParticles) {
      const pPos = this.atmosphereParticles.geometry.attributes.position;
      for (let i = 0; i < pPos.count; i++) {
        let y = pPos.getY(i) - delta * 0.45;
        let x = pPos.getX(i) + Math.sin(time * 0.6 + i) * delta * 0.9;
        if (y < -5) y = 40;
        pPos.setY(i, y);
        pPos.setX(i, x);
      }
      pPos.needsUpdate = true;
    }

    // 8. Spirit Fireflies Wandering
    if (this.spiritFireflies) {
      const fPos = this.spiritFireflies.geometry.attributes.position;
      for (let i = 0; i < fPos.count; i++) {
        const x = fPos.getX(i) + Math.sin(time * 1.2 + i * 0.5) * delta * 1.2;
        const y = fPos.getY(i) + Math.cos(time * 1.5 + i) * delta * 0.6;
        const z = fPos.getZ(i) + Math.sin(time * 0.9 + i * 0.3) * delta * 1.2;
        fPos.setX(i, x);
        fPos.setY(i, y);
        fPos.setZ(i, z);
      }
      fPos.needsUpdate = true;
    }

    // 9. Waterfall Flow & Splash Particles
    this.waterfallParticles.forEach((particles) => {
      const pos = particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - delta * 16;
        if (y < -19) {
          y = 0;
        }
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    });

    // 10. Animate Dog-Birds Soaring & Wing Flapping
    if (this.dogBirdsManager) {
      this.dogBirdsManager.update(time, delta);
    }

    // 11. Animate God Rays Pulsation & Sun Corona
    if (this.godRaysGroup) {
      const rayPulse = 0.12 + Math.sin(time * 1.5) * 0.04;
      this.godRaysGroup.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.MeshBasicMaterial).opacity = rayPulse + Math.sin(time * 2.0 + i) * 0.03;
        }
      });
    }

    // 12. Animate Aurora Curtains Wave
    this.auroraCurtains.forEach((ribbon, i) => {
      ribbon.rotation.y += delta * (0.04 + i * 0.02);
      (ribbon.material as THREE.MeshBasicMaterial).opacity = 0.14 + Math.sin(time * 1.2 + i * 1.5) * 0.05;
    });
  }

  public getGroundHeightAt(x: number, z: number, currentY?: number): number | null {
    // Find all overlapping island colliders at (x, z)
    const matches: number[] = [];
    for (const island of this.islandColliders) {
      const dx = x - island.center.x;
      const dz = z - island.center.z;
      const distSq = dx * dx + dz * dz;
      if (distSq <= island.radius * island.radius) {
        matches.push(island.y);
      }
    }

    if (matches.length === 0) return null; // Over void chasm

    if (currentY !== undefined) {
      // Find the highest island that is at or beneath current position (with step-up tolerance of 0.8)
      const below = matches.filter((y) => y <= currentY + 0.8);
      if (below.length > 0) {
        return Math.max(...below);
      }
      // If player is currently below all island tops, return the closest island height
      return Math.min(...matches);
    }

    // Default to highest island surface
    return Math.max(...matches);
  }
}

