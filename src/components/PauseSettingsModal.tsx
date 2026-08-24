import React, { useState } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, X, MapPin, Sparkles, Camera } from 'lucide-react';
import { GAME_LEVELS } from '../game/levels';
import { sounds } from '../audio/SoundManager';

interface PauseSettingsModalProps {
  currentLevelId: number;
  onResume: () => void;
  onRestart: () => void;
  onSelectLevel: (levelId: number) => void;
  onOpenWardrobe: () => void;
  onOpenPhotoMode: () => void;
}

export const PauseSettingsModal: React.FC<PauseSettingsModalProps> = ({
  currentLevelId,
  onResume,
  onRestart,
  onSelectLevel,
  onOpenWardrobe,
  onOpenPhotoMode,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div id="pause-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div
        id="pause-settings-card"
        style={{
          background: 'linear-gradient(180deg, #FFB347 0%, #FFCC33 40%, #87CEEB 100%)',
        }}
        className="w-full max-w-md rounded-3xl border-4 border-white p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-orange-950 relative overflow-hidden"
      >
        {/* Floating Cyan Diamond Accents */}
        <div className="absolute top-4 right-14 w-3.5 h-3.5 bg-cyan-300 rotate-45 shadow-[0_0_12px_#00ffff]" />

        {/* Close button */}
        <button
          id="btn-pause-close"
          onClick={onResume}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-orange-950/10 hover:bg-orange-950/20 text-orange-950 flex items-center justify-center transition border border-orange-950/20"
          aria-label="Chiudi pausa"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md mb-0.5" style={{ fontFamily: '"Arial Black", sans-serif' }}>
          PAUSA & GUIDE
        </h2>
        <p className="text-xs font-semibold text-orange-950 mb-4 italic font-artistic-serif">
          Skyward Ruins — Comandi e isole celesti
        </p>

        {/* Quick Hub: Wardrobe & Photo Mode */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            id="btn-open-wardrobe-pause"
            onClick={onOpenWardrobe}
            className="py-2.5 px-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md border border-indigo-400/40 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Guardaroba</span>
          </button>

          <button
            id="btn-open-photo-pause"
            onClick={onOpenPhotoMode}
            className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md border border-white/20 active:scale-95"
          >
            <Camera className="w-4 h-4 text-cyan-300" />
            <span>Modalità Foto</span>
          </button>
        </div>

        {/* Controls Guide */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-white/80 mb-3 text-xs space-y-1.5 shadow-sm">
          <div className="font-black text-orange-950 text-xs mb-1 flex items-center gap-1.5 uppercase tracking-wider">
            <span>🎮 Comandi di Gioco</span>
          </div>
          <div className="flex justify-between items-center text-orange-950 font-medium text-[11px]">
            <span>Movimento</span>
            <span className="font-mono bg-white/90 border border-orange-950/20 px-1.5 py-0.5 rounded text-orange-950 font-bold">WASD / Frecce / Joystick</span>
          </div>
          <div className="flex justify-between items-center text-orange-950 font-medium text-[11px]">
            <span>Salta / Doppio Salto</span>
            <span className="font-mono bg-white/90 border border-orange-950/20 px-1.5 py-0.5 rounded text-orange-950 font-bold">Spazio x2</span>
          </div>
          <div className="flex justify-between items-center text-orange-950 font-medium text-[11px]">
            <span>Plana con le Ali</span>
            <span className="font-mono bg-sky-800 border border-sky-400 px-1.5 py-0.5 rounded text-white font-black">G / Tasto Plana</span>
          </div>
          <div className="flex justify-between items-center text-orange-950 font-medium text-[11px]">
            <span>Scatto Rapido (Dash)</span>
            <span className="font-mono bg-amber-800 border border-amber-500 px-1.5 py-0.5 rounded text-white font-black">Shift / Q / Tasto Scatto</span>
          </div>
          <div className="flex justify-between items-center text-orange-950 font-medium text-[11px]">
            <span>Rampino Magnetico</span>
            <span className="font-mono bg-cyan-900 border border-cyan-400 px-1.5 py-0.5 rounded text-white font-black">E o Tasto Rampino</span>
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 mb-3 shadow-sm">
          <span className="text-xs font-bold text-orange-950 uppercase tracking-wide">Effetti Sonori</span>
          <button
            id="btn-settings-audio"
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'Muto' : 'Attivo'}</span>
          </button>
        </div>

        {/* Level Selector */}
        <div className="mb-4">
          <label className="text-[11px] font-black uppercase tracking-wider text-orange-950 block mb-1">
            Seleziona Isola (1 - 5)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {GAME_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                id={`btn-select-level-${lvl.id}`}
                onClick={() => onSelectLevel(lvl.id)}
                className={`py-1.5 px-1 rounded-xl border-2 text-[11px] font-black flex flex-col items-center gap-0.5 transition shadow-sm ${
                  currentLevelId === lvl.id
                    ? 'bg-orange-950 border-black text-white scale-105 shadow-md'
                    : 'bg-white/70 border-white/80 text-orange-950 hover:bg-white'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span className="tracking-tight text-[10px]">Isola {lvl.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            id="btn-settings-restart"
            onClick={onRestart}
            className="w-1/2 py-2.5 px-3 rounded-2xl bg-white/80 hover:bg-white text-orange-950 border-2 border-orange-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ricomincia</span>
          </button>

          <button
            id="btn-settings-resume"
            onClick={onResume}
            className="w-1/2 py-2.5 px-3 rounded-2xl bg-orange-950 hover:bg-orange-900 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xl border-b-4 border-black"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Riprendi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

