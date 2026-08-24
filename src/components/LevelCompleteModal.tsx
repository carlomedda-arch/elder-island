import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameStats, LevelData, LevelRecord } from '../types';
import { Trophy, Star, ArrowRight, RotateCcw, Sparkles, Timer, Crosshair, Shield, Zap } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface LevelCompleteModalProps {
  stats: GameStats;
  currentLevel: LevelData;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestartLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  stats,
  currentLevel,
  hasNextLevel,
  onNextLevel,
  onRestartLevel,
}) => {
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestTime, setBestTime] = useState<number>(stats.timeElapsed);

  // Determine star rating
  let stars = 3;
  if (stats.deaths > 1 || stats.timeElapsed > 90) stars = 2;
  if (stats.deaths > 3 || stats.timeElapsed > 180) stars = 1;

  useEffect(() => {
    sounds.playStarRating();

    // Check & save speedrun best time
    try {
      const recordsRaw = localStorage.getItem('skyward_best_times');
      const records: Record<number, LevelRecord> = recordsRaw ? JSON.parse(recordsRaw) : {};
      const prevRecord = records[currentLevel.id];

      if (!prevRecord || stats.timeElapsed < prevRecord.bestTime) {
        setIsNewRecord(true);
        setBestTime(stats.timeElapsed);
        records[currentLevel.id] = {
          levelId: currentLevel.id,
          bestTime: stats.timeElapsed,
          stars: Math.max(stars, prevRecord?.stars || 1),
          dateCompleted: new Date().toISOString(),
        };
        localStorage.setItem('skyward_best_times', JSON.stringify(records));
      } else {
        setBestTime(prevRecord.bestTime);
      }
    } catch {
      // LocalStorage fallback
    }

    // Launch festive confetti bursts
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4cc9f0', '#f72585', '#7209b7', '#f4b41a', '#38ef7d'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4cc9f0', '#f72585', '#7209b7', '#f4b41a', '#38ef7d'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [currentLevel.id, stars, stats.timeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="level-complete-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div
        id="level-complete-card"
        style={{
          background: 'linear-gradient(180deg, #FFB347 0%, #FFCC33 40%, #87CEEB 100%)',
        }}
        className="w-full max-w-md rounded-3xl border-4 border-white p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.35)] text-orange-950 text-center relative overflow-hidden"
      >
        {/* Floating Cyan Diamond Accents */}
        <div className="absolute top-4 right-6 w-3.5 h-3.5 bg-cyan-300 rotate-45 shadow-[0_0_12px_#00ffff]" />
        <div className="absolute bottom-16 left-6 w-4 h-4 bg-cyan-300 rotate-45 shadow-[0_0_15px_#00ffff]" />

        {/* Trophy / Victory Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white/80 border-2 border-white flex items-center justify-center mb-3 shadow-lg relative">
          <Trophy className="w-10 h-10 text-orange-900 animate-bounce" />
          {isNewRecord && (
            <div className="absolute -top-2 -right-3 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-white shadow-md animate-pulse flex items-center gap-1">
              <Zap className="w-3 h-3 fill-white" />
              <span>RECORD!</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md mb-1" style={{ fontFamily: '"Arial Black", sans-serif' }}>
          {hasNextLevel ? 'PORTALE ATTIVATO!' : 'REAME CONQUISTATO!'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-orange-950 mb-4">
          Hai completato con successo <span className="font-bold underline">{currentLevel.title}</span>
        </p>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2.5 rounded-2xl border-2 shadow-sm transition-all ${
                starIdx <= stars
                  ? 'bg-amber-100 border-orange-950 text-amber-500 scale-105'
                  : 'bg-white/40 border-white/60 text-orange-950/30'
              }`}
            >
              <Star className={`w-7 h-7 ${starIdx <= stars ? 'fill-amber-400 text-orange-950' : ''}`} />
            </div>
          ))}
        </div>

        {/* Stats Grid in Frosted Warm Glass */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-white/80 flex flex-col items-center shadow-sm relative">
            <div className="flex items-center gap-1 text-orange-900/80 text-[11px] font-bold mb-0.5">
              <Timer className="w-3.5 h-3.5" />
              <span>TEMPO</span>
            </div>
            <span className="text-base font-black text-orange-950">{formatTime(stats.timeElapsed)}</span>
            <span className="text-[10px] text-orange-900/70 font-semibold mt-0.5">
              Record: {formatTime(bestTime)}
            </span>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-white/80 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-bold mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>RUNE</span>
            </div>
            <span className="text-base font-black text-emerald-900">
              {stats.runesCollected} / {stats.totalRunes}
            </span>
            <span className="text-[10px] text-emerald-800/70 font-semibold mt-0.5">
              Completate 100%
            </span>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-white/80 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-1 text-cyan-900 text-[11px] font-bold mb-0.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-700" />
              <span>RAMPINI</span>
            </div>
            <span className="text-base font-black text-cyan-950">{stats.grappleCount}</span>
            <span className="text-[10px] text-cyan-900/70 font-semibold mt-0.5">
              Agganci eseguiti
            </span>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-white/80 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-1 text-rose-900 text-[11px] font-bold mb-0.5">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>CADUTE</span>
            </div>
            <span className="text-base font-black text-rose-950">{stats.deaths}</span>
            <span className="text-[10px] text-rose-900/70 font-semibold mt-0.5">
              {stats.deaths === 0 ? 'Perfetto!' : 'Tentativi'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-modal-restart"
            onClick={onRestartLevel}
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-white/80 hover:bg-white text-orange-950 border-2 border-orange-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rigioca</span>
          </button>

          {hasNextLevel ? (
            <button
              id="btn-modal-next"
              onClick={onNextLevel}
              className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-orange-950 hover:bg-orange-900 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition active:scale-95 shadow-xl border-b-4 border-black"
            >
              <span>Prossima Isola</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-modal-first-level"
              onClick={onNextLevel}
              className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-orange-950 hover:bg-orange-900 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition active:scale-95 shadow-xl border-b-4 border-black"
            >
              <span>Ricomincia</span>
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

