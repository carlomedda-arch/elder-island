import React, { useState, useEffect, useRef } from 'react';
import { GameStats, LevelData, Achievement } from '../types';
import { Sparkles, Compass, Volume2, VolumeX, ShieldAlert, Crosshair, Pause, HelpCircle, ArrowUp, Zap, Camera, Shirt, Trophy, Feather } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface GameHUDProps {
  stats: GameStats;
  currentLevel: LevelData;
  hasGrappleTarget: boolean;
  grappleDistance: number;
  guardianAlert: number;
  isFioccoNearby?: boolean;
  latestAchievement?: Achievement | null;
  onTriggerGrapple: () => void;
  onTriggerJump: () => void;
  onTriggerDash: () => void;
  onTriggerGlide?: () => void;
  onTriggerTalkFiocco?: () => void;
  onJoystickMove: (vec: { x: number; y: number }) => void;
  onTogglePause: () => void;
  onOpenHelp: () => void;
  onOpenWardrobe: () => void;
  onOpenPhotoMode: () => void;
  onOpenAchievements?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  currentLevel,
  hasGrappleTarget,
  grappleDistance,
  guardianAlert,
  isFioccoNearby,
  latestAchievement,
  onTriggerGrapple,
  onTriggerJump,
  onTriggerDash,
  onTriggerGlide,
  onTriggerTalkFiocco,
  onJoystickMove,
  onTogglePause,
  onOpenHelp,
  onOpenWardrobe,
  onOpenPhotoMode,
  onOpenAchievements,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickTouchId, setJoystickTouchId] = useState<number | null>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Mobile Virtual Joystick Touch Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    setJoystickTouchId(touch.identifier);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        setJoystickTouchId(null);
        setStickPos({ x: 0, y: 0 });
        onJoystickMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setStickPos({ x: dx, y: dy });
    onJoystickMove({
      x: dx / maxRadius,
      y: -(dy / maxRadius), // invert Y for forward
    });
  };

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="game-hud-layer" className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* Top Header Bar */}
      <header id="hud-header" className="flex items-center justify-between gap-3 w-full max-w-5xl mx-auto">
        {/* Level Title & Badge */}
        <div id="level-badge" className="flex items-center gap-2.5 bg-slate-900/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-lg text-white">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300">
            {stats.level}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold leading-tight tracking-wide text-amber-100">
              {currentLevel.title}
            </h1>
            <p className="text-[11px] text-slate-300 tracking-wider">
              {currentLevel.subtitle}
            </p>
          </div>
        </div>

        {/* Objective & Runes Counter */}
        <div id="runes-counter-badge" className="flex items-center gap-3 bg-slate-900/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-lg text-white">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-5 h-5 ${stats.isPortalActive ? 'text-cyan-400 animate-spin' : 'text-emerald-400 animate-pulse'}`} />
            <span className="font-bold text-base sm:text-lg tracking-wider text-emerald-300">
              {stats.runesCollected} / {stats.totalRunes}
            </span>
            <span className="hidden sm:inline text-xs text-slate-300 ml-1">Rune</span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          {/* Time */}
          <span className="text-xs font-mono text-slate-300">
            ⏱ {formatTime(stats.timeElapsed)}
          </span>
        </div>

        {/* Action Controls (Achievements, Wardrobe, Photo, Sound, Help, Pause) */}
        <div id="hud-top-actions" className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            id="btn-achievements-toggle"
            onClick={onOpenAchievements}
            className="w-10 h-10 rounded-2xl bg-amber-900/85 hover:bg-amber-800 backdrop-blur-md border border-amber-400/40 text-amber-300 flex items-center justify-center transition active:scale-95 shadow-md"
            title="Obiettivi & Traguardi"
            aria-label="Open Achievements"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            id="btn-wardrobe-toggle"
            onClick={onOpenWardrobe}
            className="w-10 h-10 rounded-2xl bg-indigo-900/85 hover:bg-indigo-800 backdrop-blur-md border border-indigo-400/40 text-amber-300 flex items-center justify-center transition active:scale-95 shadow-md"
            title="Guardaroba (Skin & Accessori)"
            aria-label="Open Wardrobe"
          >
            <Shirt className="w-4 h-4" />
          </button>

          <button
            id="btn-photo-toggle"
            onClick={onOpenPhotoMode}
            className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 backdrop-blur-md border border-white/15 text-cyan-300 flex items-center justify-center transition active:scale-95 shadow-md"
            title="Modalità Foto"
            aria-label="Open Photo Mode"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            id="btn-sound-toggle"
            onClick={handleToggleSound}
            className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition active:scale-95 shadow-md"
            title="Audio"
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-200" />}
          </button>

          <button
            id="btn-help-toggle"
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition active:scale-95 shadow-md"
            title="Comandi e info"
            aria-label="Help and Info"
          >
            <HelpCircle className="w-4 h-4 text-slate-200" />
          </button>

          <button
            id="btn-pause-toggle"
            onClick={onTogglePause}
            className="w-10 h-10 rounded-2xl bg-slate-900/75 hover:bg-slate-800 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition active:scale-95 shadow-md"
            title="Pausa"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 text-slate-200" />
          </button>
        </div>
      </header>

      {/* Center Screen Indicators */}
      <div id="hud-center-zone" className="flex flex-col items-center justify-center gap-3">
        {/* Achievement Unlocked Toast */}
        {latestAchievement && (
          <div
            id="achievement-unlocked-toast"
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600/95 via-yellow-500/95 to-amber-600/95 border-2 border-yellow-200 text-slate-950 shadow-2xl shadow-amber-500/50 animate-bounce"
          >
            <Trophy className="w-6 h-6 shrink-0 text-slate-950" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                Obiettivo Sbloccato!
              </span>
              <span className="font-extrabold text-sm tracking-wide leading-tight">
                {latestAchievement.title}
              </span>
              <span className="text-[11px] font-medium text-amber-950/80 leading-tight">
                {latestAchievement.description}
              </span>
            </div>
          </div>
        )}

        {/* Guardian Warning Alert */}
        {guardianAlert > 0.1 && (
          <div
            id="guardian-warning-indicator"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-950/85 backdrop-blur-md border border-rose-500/50 text-rose-200 shadow-xl animate-pulse"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">
              Guardiano di Pietra Svegliato!
            </span>
          </div>
        )}

        {/* Grapple Lock-On Reticle */}
        {hasGrappleTarget && (
          <div
            id="grapple-lockon-reticle"
            className="flex flex-col items-center gap-1 bg-cyan-950/80 backdrop-blur-md border border-cyan-400/60 text-cyan-200 px-4 py-2 rounded-2xl shadow-xl animate-bounce"
          >
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-300 animate-spin" />
              <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-cyan-100">
                Ancora Magnetica ({grappleDistance}m)
              </span>
            </div>
            <span className="text-[11px] text-cyan-300 font-medium">
              Premi <kbd className="bg-cyan-800/80 px-1.5 py-0.5 rounded text-white font-mono">E</kbd> o tocca Rampino!
            </span>
          </div>
        )}

        {/* Portal Ready Glow Notification */}
        {stats.isPortalActive && (
          <div
            id="portal-active-banner"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-emerald-400/60 text-emerald-200 shadow-2xl animate-pulse"
          >
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span className="font-bold text-xs sm:text-sm tracking-wide">
              Portale Attivato! Raggiungi il santuario per avanzare!
            </span>
          </div>
        )}

        {/* Fiocco NPC Proximity Indicator */}
        {isFioccoNearby && (
          <div
            id="fiocco-nearby-indicator"
            onClick={onTriggerTalkFiocco}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-amber-100/95 backdrop-blur-md border-2 border-amber-400 text-orange-950 shadow-2xl animate-bounce pointer-events-auto cursor-pointer hover:scale-105 transition active:scale-95"
          >
            <span className="text-xl">🐱</span>
            <div className="flex flex-col">
              <span className="font-black text-xs sm:text-sm tracking-wide">
                Fiocco è qui vicino!
              </span>
              <span className="text-[11px] text-orange-900 font-semibold">
                Premi <kbd className="bg-amber-300/80 px-1 py-0.5 rounded text-orange-950 font-mono">T</kbd> o tocca qui per parlare
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls / Touch Interface */}
      <footer id="hud-bottom-bar" className="flex items-end justify-between w-full max-w-5xl mx-auto">
        {/* Left: Mobile Virtual Joystick or Desktop Controls Hint */}
        <div id="left-controller-zone" className="pointer-events-auto">
          {/* Virtual Joystick (Visible on touch devices / responsive) */}
          <div
            ref={joystickRef}
            id="virtual-joystick-base"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/50 backdrop-blur-sm border-2 border-white/20 relative flex items-center justify-center touch-none select-none shadow-inner"
          >
            <div
              id="virtual-joystick-stick"
              style={{
                transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white/60 shadow-lg pointer-events-none"
            />
          </div>
        </div>

        {/* Keyboard helper tag (Desktop) */}
        <div id="desktop-controls-hint" className="hidden md:flex items-center gap-3 bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs text-slate-300">
          <span><kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded font-mono">WASD</kbd> Muovi</span>
          <span><kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded font-mono">Shift/Q</kbd> Scatto</span>
          <span><kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded font-mono">Spazio</kbd> Salto</span>
          <span><kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded font-mono">G</kbd> Plana</span>
          <span><kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded font-mono">E</kbd> Rampino</span>
          <span><kbd className="bg-slate-700 text-white px-1.5 py-0.5 rounded font-mono">T</kbd> Parla</span>
        </div>

        {/* Right: Action Buttons (Talk, Glide, Dash, Grapple Hook & Jump) */}
        <div id="right-action-buttons" className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
          {/* Talk with Fiocco Button */}
          {isFioccoNearby && (
            <button
              id="btn-action-talk-fiocco"
              onClick={onTriggerTalkFiocco}
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-3xl bg-gradient-to-t from-amber-400 to-yellow-200 hover:from-amber-300 hover:to-yellow-100 text-orange-950 border-2 border-amber-300 flex flex-col items-center justify-center gap-0.5 font-black shadow-xl shadow-amber-400/40 transition active:scale-90 animate-pulse"
              title="Parla con Fiocco (T)"
              aria-label="Talk to Fiocco"
            >
              <span className="text-xl">🐱</span>
              <span className="text-[9px] tracking-wider uppercase font-extrabold">Parla</span>
            </button>
          )}

          {/* Glide Wings Button */}
          <button
            id="btn-action-glide"
            onClick={onTriggerGlide}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-3xl bg-sky-700 hover:bg-sky-600 text-sky-100 border-2 border-sky-300/60 flex flex-col items-center justify-center gap-0.5 font-bold shadow-xl shadow-sky-700/30 transition active:scale-90"
            title="Plana con le ali (G)"
            aria-label="Glide"
          >
            <Feather className="w-5 h-5 text-sky-200" />
            <span className="text-[9px] tracking-wider uppercase font-bold">Plana</span>
          </button>

          {/* Dash Sprint Button */}
          <button
            id="btn-action-dash"
            onClick={onTriggerDash}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-3xl bg-amber-600 hover:bg-amber-500 text-white border-2 border-amber-300/60 flex flex-col items-center justify-center gap-0.5 font-black shadow-xl shadow-amber-600/30 transition active:scale-90"
            title="Scatto Rapido (Shift)"
            aria-label="Dash"
          >
            <Zap className="w-5 h-5 text-amber-100" />
            <span className="text-[9px] tracking-wider uppercase font-bold">Scatto</span>
          </button>

          {/* Magnetic Grapple Hook Button */}
          <button
            id="btn-action-grapple"
            onClick={onTriggerGrapple}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-3xl flex flex-col items-center justify-center gap-0.5 font-bold shadow-xl transition active:scale-90 border-2 ${
              hasGrappleTarget
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-200 shadow-cyan-500/40 animate-pulse'
                : 'bg-slate-900/70 text-slate-400 border-white/15'
            }`}
            title="Usa Rampino Magnetico (E)"
            aria-label="Use Grapple Hook"
          >
            <Crosshair className="w-5 h-5" />
            <span className="text-[9px] tracking-wider uppercase font-bold">Rampino</span>
          </button>

          {/* Jump / Double Jump Button */}
          <button
            id="btn-action-jump"
            onClick={onTriggerJump}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-3xl bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 border-2 border-amber-200 flex flex-col items-center justify-center gap-0.5 font-black shadow-xl shadow-amber-500/30 transition active:scale-90"
            title="Salta / Doppio Salto (Spazio)"
            aria-label="Jump"
          >
            <ArrowUp className="w-5 h-5" />
            <span className="text-[9px] tracking-wider uppercase font-bold">Salta</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
