export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface IslandConfig {
  id: string;
  position: [number, number, number];
  radius: number;
  height: number;
  shape?: 'circle' | 'oval' | 'plateau' | 'irregular';
  theme?: 'grass' | 'ruins' | 'temple' | 'peak';
  treesCount?: number;
  pillarsCount?: number;
  hasWaterfall?: boolean;
}

export interface GrappleAnchorConfig {
  id: string;
  position: [number, number, number];
  type: 'crystal' | 'ring' | 'pillar_top' | 'floating_relic';
  isMoving?: boolean;
  moveRange?: [number, number, number];
  moveSpeed?: number;
}

export interface RuneConfig {
  id: string;
  position: [number, number, number];
  color?: string;
  collected?: boolean;
}

export interface GuardianConfig {
  id: string;
  spawnPosition: [number, number, number];
  patrolPoints?: [number, number, number][];
  detectionRadius: number;
  speed: number;
  scale?: number;
  type?: 'standard' | 'colossus' | 'swift';
}

export interface BouncePadConfig {
  id: string;
  position: [number, number, number];
  power?: number;
  color?: number;
}

export interface WindUpdraftConfig {
  id: string;
  position: [number, number, number];
  height: number;
  radius: number;
  strength?: number;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  playerSpawn: [number, number, number];
  portalPosition: [number, number, number];
  fioccoSpawn?: [number, number, number];
  islands: IslandConfig[];
  grappleAnchors: GrappleAnchorConfig[];
  runes: RuneConfig[];
  guardians: GuardianConfig[];
  bouncePads?: BouncePadConfig[];
  windUpdrafts?: WindUpdraftConfig[];
  requiredRunes: number;
  skyColorTop: string;
  skyColorBottom: string;
  fogColor: string;
  sunColor: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GameStats {
  level: number;
  runesCollected: number;
  totalRunes: number;
  isPortalActive: boolean;
  timeElapsed: number;
  grappleCount: number;
  guardianDodgeCount: number;
  deaths: number;
}

export type GameState = 'playing' | 'level_complete' | 'game_won' | 'paused' | 'photo_mode';

export type CharacterSkinId = 'classic' | 'solaris' | 'zenith' | 'crimson' | 'emerald' | 'amethyst' | 'nebula';

export interface CharacterSkinConfig {
  id: CharacterSkinId;
  name: string;
  subtitle: string;
  tunicColor: number;
  capeColor: number;
  bandColor: number;
  pantsColor: number;
  bootsColor: number;
  glowColor: number;
  icon: string;
  description: string;
}

export type FioccoAccessoryId = 'halo' | 'star_crown' | 'angel_wings' | 'wizard_hat' | 'flower_garland' | 'dragon_horns' | 'none';

export interface FioccoAccessoryConfig {
  id: FioccoAccessoryId;
  name: string;
  icon: string;
  description: string;
}

export type PhotoFilterId = 'natural' | 'golden_aurora' | 'astral_nebula' | 'ancient_parchment' | 'zenith_radiance';

export interface PhotoFilterConfig {
  id: PhotoFilterId;
  name: string;
  filterStyle: string;
  icon: string;
}

export interface LevelRecord {
  levelId: number;
  bestTime: number; // in seconds
  stars: number; // 1, 2, or 3
  dateCompleted: string;
}
