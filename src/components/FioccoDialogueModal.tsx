import React, { useEffect } from 'react';
import { FioccoDialogue } from '../game/NPCFiocco';
import { Sparkles, X, ChevronRight, Heart } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface FioccoDialogueModalProps {
  dialogue: FioccoDialogue | null;
  onClose: () => void;
  onNextDialogue: () => void;
}

export const FioccoDialogueModal: React.FC<FioccoDialogueModalProps> = ({
  dialogue,
  onClose,
  onNextDialogue,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' || e.code === 'KeyT') {
        e.preventDefault();
        sounds.playCatMeow();
        onNextDialogue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNextDialogue]);

  if (!dialogue) return null;

  const handleNext = () => {
    sounds.playCatMeow();
    onNextDialogue();
  };

  const handlePet = () => {
    sounds.playCatMeow();
  };

  return (
    <div
      id="fiocco-dialogue-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm select-none"
    >
      <div
        id="fiocco-dialogue-card"
        style={{
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FFF5EB 60%, #FEF08A 100%)',
        }}
        className="w-full max-w-lg rounded-3xl border-4 border-white p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-orange-950 relative overflow-hidden"
      >
        {/* Floating Cyan Diamond Accents */}
        <div className="absolute top-4 right-14 w-3.5 h-3.5 bg-cyan-400 rotate-45 shadow-[0_0_10px_#38bdf8]" />
        <div className="absolute bottom-6 right-6 w-3 h-3 bg-amber-400 rotate-45" />

        {/* Close button */}
        <button
          id="btn-fiocco-close"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-orange-950/10 hover:bg-orange-950/20 text-orange-950 flex items-center justify-center transition border border-orange-950/20 active:scale-90"
          aria-label="Chiudi dialogo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Fiocco Avatar & Name Tag */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-orange-950/30 flex items-center justify-center shadow-md relative">
            <span className="text-3xl filter drop-shadow-sm select-none">🐱</span>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center">
              <Heart className="w-3 h-3 fill-orange-950 text-orange-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-orange-950 uppercase tracking-wide">
                Fiocco
              </h3>
              <span className="bg-amber-200/90 text-orange-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-orange-950/20">
                Spirito Felino
              </span>
            </div>
            <p className="text-xs font-semibold text-orange-900/80 italic">
              Custode delle Isole Celesti
            </p>
          </div>
        </div>

        {/* Dialogue Body Speech Bubble */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-orange-950/15 mb-4 shadow-sm relative">
          <p className="text-sm sm:text-base font-bold text-orange-950 leading-relaxed">
            "{dialogue.text}"
          </p>

          {dialogue.tip && (
            <div className="mt-3 pt-3 border-t border-orange-950/10 flex items-start gap-2 text-xs font-semibold text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-300/40">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{dialogue.tip}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            id="btn-fiocco-meow"
            onClick={handlePet}
            className="py-2.5 px-3.5 rounded-2xl bg-white/70 hover:bg-white text-orange-950 border border-orange-950/20 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <span>🐾 Accarezza</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-fiocco-next"
              onClick={handleNext}
              className="py-2.5 px-4 rounded-2xl bg-orange-950 hover:bg-orange-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow-lg border-b-2 border-black"
            >
              <span>Altro consiglio</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="btn-fiocco-close-bottom"
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-orange-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 transition active:scale-95 shadow-md border-b-2 border-amber-600"
            >
              <span>Grazie Fiocco!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
