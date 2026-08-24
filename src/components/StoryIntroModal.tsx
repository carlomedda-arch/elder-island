import React from 'react';
import { Play, Sparkles, Crosshair, ShieldAlert, Compass } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface StoryIntroModalProps {
  onStart: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({ onStart }) => {
  const handleStartGame = () => {
    sounds.init();
    sounds.resume();
    onStart();
  };

  return (
    <div id="intro-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div
        id="intro-modal-card"
        style={{
          background: 'linear-gradient(180deg, #FFB347 0%, #FFCC33 45%, #87CEEB 100%)',
        }}
        className="w-full max-w-lg rounded-3xl border-4 border-white p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-orange-950 relative overflow-hidden"
      >
        {/* Artistic Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-25 artistic-pattern-dots pointer-events-none" />

        {/* Floating Cyan Diamond Accents */}
        <div className="absolute top-4 right-6 w-3.5 h-3.5 bg-cyan-300 rotate-45 shadow-[0_0_12px_#00ffff] blur-[0.5px]" />
        <div className="absolute bottom-16 left-6 w-4 h-4 bg-cyan-300 rotate-45 shadow-[0_0_15px_#00ffff] blur-[0.5px]" />

        {/* Header Title */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/10 border border-black/20 text-orange-950 text-[11px] font-bold uppercase tracking-[0.2em] mb-2 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-orange-950" />
            <span>3D Low-Poly Adventure</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-none drop-shadow-md tracking-tight mb-2" style={{ fontFamily: '"Arial Black", sans-serif' }}>
            SKYWARD<br />
            <span className="text-orange-950">RUINS</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-orange-950 max-w-sm mx-auto leading-relaxed font-artistic-serif italic">
            Ti risvegli su un arcipelago di isole galleggianti tra le nuvole. Raccogli le antiche rune di energia e riattiva i portali celesti!
          </p>
        </div>

        {/* Feature Grid / Guide Cards in Frosted Warm Glass */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 relative z-10">
          <div className="bg-white/75 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 flex flex-col items-center text-center shadow-sm">
            <div className="w-7 h-7 bg-cyan-400 rotate-45 flex items-center justify-center mb-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-950 -rotate-45" />
            </div>
            <h2 className="text-xs font-black text-orange-950 mb-0.5">Rune</h2>
            <p className="text-[10px] font-medium text-orange-900/80 leading-tight">Alimenta i portali.</p>
          </div>

          <div className="bg-white/75 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 flex flex-col items-center text-center shadow-sm">
            <div className="w-7 h-7 bg-orange-800 rounded-xl flex items-center justify-center text-amber-200 font-black mb-1.5 shadow-md border border-orange-950">
              <Crosshair className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-black text-orange-950 mb-0.5">Rampino</h2>
            <p className="text-[10px] font-medium text-orange-900/80 leading-tight">Supera i baratri.</p>
          </div>

          <div className="bg-white/75 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 flex flex-col items-center text-center shadow-sm">
            <div className="w-7 h-7 bg-red-500 rotate-45 flex items-center justify-center mb-1.5 shadow-md">
              <ShieldAlert className="w-3.5 h-3.5 text-white -rotate-45" />
            </div>
            <h2 className="text-xs font-black text-orange-950 mb-0.5">Guardiani</h2>
            <p className="text-[10px] font-medium text-orange-900/80 leading-tight">Schiva i colossi.</p>
          </div>

          <div className="bg-white/75 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 flex flex-col items-center text-center shadow-sm">
            <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-base mb-1.5 shadow-md border border-amber-500">
              🐱
            </div>
            <h2 className="text-xs font-black text-orange-950 mb-0.5">Fiocco</h2>
            <p className="text-[10px] font-medium text-orange-900/80 leading-tight">Gatto custode guida.</p>
          </div>
        </div>

        {/* Start Button */}
        <button
          id="btn-intro-start"
          onClick={handleStartGame}
          className="w-full py-4 px-6 rounded-2xl bg-orange-950 hover:bg-orange-900 text-white font-black text-sm sm:text-base tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition active:scale-95 border-b-4 border-black shadow-xl"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Inizia Avventura</span>
        </button>
      </div>
    </div>
  );
};

