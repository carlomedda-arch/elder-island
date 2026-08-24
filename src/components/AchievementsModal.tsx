import React from 'react';
import { Award, CheckCircle2, Lock, X, Trophy, Sparkles } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const ALL_GAME_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'first_grapple',
    title: 'Primo Slancio',
    description: 'Usa il rampino di luce per agganciarti a un ancora celeste.',
    icon: 'zap',
  },
  {
    id: 'first_glide',
    title: "Ali dell'Aurora",
    description: 'Spiega le ali spettrali e plana dolcemente nell\'etere cosmico.',
    icon: 'feather',
  },
  {
    id: 'first_bounce',
    title: 'Salto nel Cosmo',
    description: 'Lanciati in orbita usando un trampolino runico.',
    icon: 'arrow-up',
  },
  {
    id: 'first_updraft',
    title: 'Signore dei Venti',
    description: 'Fatti sollevare verso il cielo da una corrente ascensionale.',
    icon: 'wind',
  },
  {
    id: 'fiocco_friend',
    title: 'Compagni di Viaggio',
    description: 'Scambia parole sagge con il fedele gattino Fiocco.',
    icon: 'heart',
  },
  {
    id: 'all_runes_level',
    title: 'Collezionista Astrale',
    description: 'Raccogli tutte le rune celesti per aprire il portale.',
    icon: 'sparkles',
  },
  {
    id: 'speed_runner',
    title: 'Fulmine Celeste',
    description: 'Completa un livello in meno di 60 secondi.',
    icon: 'flame',
  },
  {
    id: 'flawless_run',
    title: 'Volata Perfetta',
    description: 'Completa un intero livello senza mai cadere nel vuoto.',
    icon: 'shield',
  },
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  const unlockedMap = new Map<string, Achievement>(achievements.map((a) => [a.id, a]));
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = ALL_GAME_ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div
      id="achievements-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="achievements-modal-container"
        className="w-full max-w-2xl bg-slate-900/95 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          id="btn-close-achievements"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div id="achievements-header" className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Galleria degli Obiettivi
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Sblocca traguardi e diventa la leggenda dei Cieli Sospesi
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div id="achievements-progress-card" className="bg-slate-800/80 rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex justify-between items-center mb-2 text-sm font-semibold">
            <span className="text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Progresso Globale
            </span>
            <span className="text-slate-300 font-mono">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div
          id="achievements-list"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pr-1 custom-scrollbar"
        >
          {ALL_GAME_ACHIEVEMENTS.map((item) => {
            const isUnlocked = unlockedMap.has(item.id);
            const unlockedData = unlockedMap.get(item.id);

            return (
              <div
                key={item.id}
                id={`achievement-card-${item.id}`}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/15 via-slate-800/90 to-slate-900 border-amber-400/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/40 border-white/5 opacity-65'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUnlocked
                      ? 'bg-amber-400/20 border-amber-300/40 text-amber-300'
                      : 'bg-slate-800 border-white/10 text-slate-500'
                  }`}
                >
                  {isUnlocked ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`font-bold text-sm truncate ${
                        isUnlocked ? 'text-amber-200' : 'text-slate-400'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  {isUnlocked && unlockedData?.unlockedAt && (
                    <span className="text-[10px] text-amber-300/70 font-mono mt-1 block">
                      Sbloccato alle {unlockedData.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
