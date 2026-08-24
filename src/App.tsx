import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GAME_LEVELS } from './game/levels';
import { GameStats, GameState, CharacterSkinId, FioccoAccessoryId, PhotoFilterId, Achievement } from './types';
import { GameHUD } from './components/GameHUD';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { PauseSettingsModal } from './components/PauseSettingsModal';
import { StoryIntroModal } from './components/StoryIntroModal';
import { FioccoDialogueModal } from './components/FioccoDialogueModal';
import { WardrobeModal } from './components/WardrobeModal';
import { PhotoModeModal, PHOTO_FILTERS } from './components/PhotoModeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { FioccoDialogue } from './game/NPCFiocco';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>('paused'); // Starts with intro modal
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isFioccoNearby, setIsFioccoNearby] = useState<boolean>(false);
  const [fioccoDialogue, setFioccoDialogue] = useState<FioccoDialogue | null>(null);

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('skyward_achievements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [latestUnlockedAchievement, setLatestUnlockedAchievement] = useState<Achievement | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);

  // Customization & Photo Mode State
  const [currentSkin, setCurrentSkin] = useState<CharacterSkinId>(() => {
    return (localStorage.getItem('skyward_explorer_skin') as CharacterSkinId) || 'classic';
  });
  const [currentAccessory, setCurrentAccessory] = useState<FioccoAccessoryId>(() => {
    return (localStorage.getItem('skyward_fiocco_accessory') as FioccoAccessoryId) || 'none';
  });
  const [isWardrobeOpen, setIsWardrobeOpen] = useState<boolean>(false);
  const [isPhotoMode, setIsPhotoMode] = useState<boolean>(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilterId>('natural');

  const [stats, setStats] = useState<GameStats>({
    level: 1,
    runesCollected: 0,
    totalRunes: 3,
    isPortalActive: false,
    timeElapsed: 0,
    grappleCount: 0,
    guardianDodgeCount: 0,
    deaths: 0,
  });

  const [hasGrappleTarget, setHasGrappleTarget] = useState<boolean>(false);
  const [grappleDistance, setGrappleDistance] = useState<number>(0);
  const [guardianAlert, setGuardianAlert] = useState<number>(0);

  const currentLevel = GAME_LEVELS[currentLevelIndex] || GAME_LEVELS[0];
  const hasNextLevel = currentLevelIndex < GAME_LEVELS.length - 1;

  // Initialize Game Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onStatsUpdate: (newStats) => {
        setStats({ ...newStats });
      },
      onTargetGrappleChange: (hasTarget, dist) => {
        setHasGrappleTarget(hasTarget);
        setGrappleDistance(dist);
      },
      onGuardianAlert: (alert) => {
        setGuardianAlert(alert);
      },
      onLevelComplete: () => {
        setGameState('level_complete');
      },
      onPlayerRespawn: () => {
        // Handled internally in engine
      },
      onFioccoNearbyChange: (nearby) => {
        setIsFioccoNearby(nearby);
      },
      onFioccoTalk: (dialogue) => {
        setFioccoDialogue(dialogue);
      },
      onAchievementUnlocked: (newAch) => {
        setAchievements((prev) => {
          const exists = prev.some((a) => a.id === newAch.id);
          if (exists) return prev;
          const updated = [...prev, newAch];
          try {
            localStorage.setItem('skyward_achievements', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });
        setLatestUnlockedAchievement(newAch);
        setTimeout(() => {
          setLatestUnlockedAchievement((curr) => (curr?.id === newAch.id ? null : curr));
        }, 4500);
      },
    });

    // Populate already unlocked achievements
    achievements.forEach((a) => engine.unlockedAchievements.add(a.id));

    engine.loadLevel(currentLevel);
    // Apply saved customization
    engine.setPlayerSkin(currentSkin);
    engine.setFioccoAccessory(currentAccessory);

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Level change handler
  const loadLevelById = useCallback((levelId: number) => {
    const idx = GAME_LEVELS.findIndex((l) => l.id === levelId);
    if (idx !== -1 && engineRef.current) {
      setCurrentLevelIndex(idx);
      engineRef.current.loadLevel(GAME_LEVELS[idx]);
      engineRef.current.setPlayerSkin(currentSkin);
      engineRef.current.setFioccoAccessory(currentAccessory);
      setGameState('playing');
      engineRef.current.setPaused(false);
      setFioccoDialogue(null);
    }
  }, [currentSkin, currentAccessory]);

  // Skin and Accessory change handlers
  const handleSelectSkin = (skinId: CharacterSkinId) => {
    setCurrentSkin(skinId);
    localStorage.setItem('skyward_explorer_skin', skinId);
    engineRef.current?.setPlayerSkin(skinId);
  };

  const handleSelectAccessory = (accId: FioccoAccessoryId) => {
    setCurrentAccessory(accId);
    localStorage.setItem('skyward_fiocco_accessory', accId);
    engineRef.current?.setFioccoAccessory(accId);
  };

  // Handlers for HUD controls
  const handleTriggerGrapple = () => {
    engineRef.current?.triggerGrapple();
  };

  const handleTriggerJump = () => {
    engineRef.current?.triggerJump();
  };

  const handleTriggerGlide = () => {
    engineRef.current?.triggerGlide();
  };

  const handleTriggerDash = () => {
    engineRef.current?.triggerDash();
  };

  const handleTriggerTalkFiocco = () => {
    const dialogue = engineRef.current?.triggerTalkFiocco();
    if (dialogue) {
      setFioccoDialogue(dialogue);
    }
  };

  const handleNextFioccoDialogue = () => {
    if (engineRef.current) {
      const dialogue = engineRef.current.triggerTalkFiocco();
      if (dialogue) {
        setFioccoDialogue(dialogue);
      }
    }
  };

  const handleJoystickMove = (vec: { x: number; y: number }) => {
    if (engineRef.current) {
      engineRef.current.joystickVector = vec;
    }
  };

  const handleTogglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      engineRef.current?.setPaused(true);
    } else if (gameState === 'paused' && hasStarted) {
      setGameState('playing');
      engineRef.current?.setPaused(false);
    }
  };

  const handleStartGame = () => {
    setHasStarted(true);
    setGameState('playing');
    engineRef.current?.setPaused(false);
  };

  const handleNextLevel = () => {
    if (hasNextLevel) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      engineRef.current?.loadLevel(GAME_LEVELS[nextIdx]);
      engineRef.current?.setPlayerSkin(currentSkin);
      engineRef.current?.setFioccoAccessory(currentAccessory);
      setGameState('playing');
      engineRef.current?.setPaused(false);
      setFioccoDialogue(null);
    } else {
      // Loop back to Level 1
      loadLevelById(1);
    }
  };

  const handleRestartLevel = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(currentLevel);
      engineRef.current.setPlayerSkin(currentSkin);
      engineRef.current.setFioccoAccessory(currentAccessory);
      setGameState('playing');
      engineRef.current.setPaused(false);
      setFioccoDialogue(null);
    }
  };

  return (
    <div id="skyward-ruins-root" className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        id="webgl-canvas-container"
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        style={{
          filter: isPhotoMode && PHOTO_FILTERS[photoFilter]?.filterStyle !== 'none'
            ? PHOTO_FILTERS[photoFilter]?.filterStyle
            : undefined,
        }}
      />

      {/* Game HUD Overlay */}
      {hasStarted && !isPhotoMode && (
        <GameHUD
          stats={stats}
          currentLevel={currentLevel}
          hasGrappleTarget={hasGrappleTarget}
          grappleDistance={grappleDistance}
          guardianAlert={guardianAlert}
          isFioccoNearby={isFioccoNearby}
          latestAchievement={latestUnlockedAchievement}
          onTriggerGrapple={handleTriggerGrapple}
          onTriggerJump={handleTriggerJump}
          onTriggerGlide={handleTriggerGlide}
          onTriggerDash={handleTriggerDash}
          onTriggerTalkFiocco={handleTriggerTalkFiocco}
          onJoystickMove={handleJoystickMove}
          onTogglePause={handleTogglePause}
          onOpenHelp={() => setShowHelp(true)}
          onOpenWardrobe={() => setIsWardrobeOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onOpenPhotoMode={() => {
            setIsPhotoMode(true);
            engineRef.current?.setPaused(true);
          }}
        />
      )}

      {/* Photo Mode Overlay */}
      {isPhotoMode && (
        <PhotoModeModal
          currentLevelId={currentLevel.id}
          activeFilter={photoFilter}
          onFilterChange={setPhotoFilter}
          onRotateCamera={(dx, dy) => engineRef.current?.rotateCamera(dx, dy)}
          onZoomCamera={(delta) => engineRef.current?.zoomCamera(delta)}
          onCapture={() => engineRef.current?.captureScreenshot() || ''}
          onExit={() => {
            setIsPhotoMode(false);
            if (gameState === 'playing') {
              engineRef.current?.setPaused(false);
            }
          }}
        />
      )}

      {/* Wardrobe Modal */}
      {isWardrobeOpen && (
        <WardrobeModal
          currentSkin={currentSkin}
          currentAccessory={currentAccessory}
          onSelectSkin={handleSelectSkin}
          onSelectAccessory={handleSelectAccessory}
          onClose={() => setIsWardrobeOpen(false)}
        />
      )}

      {/* Achievements Gallery Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
      />

      {/* Initial Awakening Story Intro */}
      {!hasStarted && (
        <StoryIntroModal onStart={handleStartGame} />
      )}

      {/* Fiocco Dialogue Modal */}
      {fioccoDialogue && (
        <FioccoDialogueModal
          dialogue={fioccoDialogue}
          onClose={() => setFioccoDialogue(null)}
          onNextDialogue={handleNextFioccoDialogue}
        />
      )}

      {/* Level Complete Celebration Modal */}
      {gameState === 'level_complete' && (
        <LevelCompleteModal
          stats={stats}
          currentLevel={currentLevel}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onRestartLevel={handleRestartLevel}
        />
      )}

      {/* Pause & Settings Modal / Help */}
      {((gameState === 'paused' && hasStarted && !isPhotoMode && !isWardrobeOpen && !isAchievementsOpen) || showHelp) ? (
        <PauseSettingsModal
          currentLevelId={currentLevel.id}
          onResume={() => {
            setShowHelp(false);
            if (gameState === 'paused') {
              setGameState('playing');
              engineRef.current?.setPaused(false);
            }
          }}
          onRestart={() => {
            setShowHelp(false);
            handleRestartLevel();
          }}
          onSelectLevel={(id) => {
            setShowHelp(false);
            loadLevelById(id);
          }}
          onOpenWardrobe={() => {
            setShowHelp(false);
            setIsWardrobeOpen(true);
          }}
          onOpenPhotoMode={() => {
            setShowHelp(false);
            setIsPhotoMode(true);
            engineRef.current?.setPaused(true);
          }}
        />
      ) : null}
    </div>
  );
}
