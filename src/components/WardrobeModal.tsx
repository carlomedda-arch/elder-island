import React, { useState } from 'react';
import { Sparkles, Shirt, Crown, X, Check, Eye } from 'lucide-react';
import { CharacterSkinId, FioccoAccessoryId } from '../types';
import { CHARACTER_SKINS } from '../game/Character';
import { FIOCCO_ACCESSORIES } from '../game/NPCFiocco';
import { sounds } from '../audio/SoundManager';

interface WardrobeModalProps {
  currentSkin: CharacterSkinId;
  currentAccessory: FioccoAccessoryId;
  onSelectSkin: (skinId: CharacterSkinId) => void;
  onSelectAccessory: (accId: FioccoAccessoryId) => void;
  onClose: () => void;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  currentSkin,
  currentAccessory,
  onSelectSkin,
  onSelectAccessory,
  onClose,
}) => {
  const [tab, setTab] = useState<'explorer' | 'fiocco'>('explorer');

  const handleSkinClick = (id: CharacterSkinId) => {
    sounds.playEquipSkin();
    onSelectSkin(id);
  };

  const handleAccessoryClick = (id: FioccoAccessoryId) => {
    sounds.playCatMeow();
    onSelectAccessory(id);
  };

  return (
    <div id="wardrobe-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div
        id="wardrobe-card"
        style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 45%, #0f172a 100%)',
        }}
        className="w-full max-w-lg rounded-3xl border-2 border-indigo-400/40 p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] text-white relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-wardrobe-close"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/20"
          aria-label="Chiudi guardaroba"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-indigo-950" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-200">
              GUARDAROBA CELESTE
            </h2>
            <p className="text-xs text-indigo-200 font-medium">
              Personalizza le vesti dell'Esploratore e gli accessori di Fiocco
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/10 my-4">
          <button
            id="tab-explorer-skins"
            onClick={() => setTab('explorer')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              tab === 'explorer'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Esploratore ({Object.keys(CHARACTER_SKINS).length})</span>
          </button>
          <button
            id="tab-fiocco-accessories"
            onClick={() => setTab('fiocco')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              tab === 'fiocco'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Fiocco ({Object.keys(FIOCCO_ACCESSORIES).length})</span>
          </button>
        </div>

        {/* Tab Content (Scrollable list) */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 custom-scrollbar">
          {tab === 'explorer' && (
            <div className="grid grid-cols-1 gap-2.5">
              {(Object.values(CHARACTER_SKINS)).map((skin) => {
                const isSelected = currentSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    id={`skin-card-${skin.id}`}
                    onClick={() => handleSkinClick(skin.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition relative flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40'
                        : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/80 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/20 shadow-inner"
                        style={{ backgroundColor: `#${skin.tunicColor.toString(16).padStart(6, '0')}` }}
                      >
                        <span>{skin.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{skin.name}</h4>
                          {isSelected && (
                            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-cyan-400/40">
                              Equipaggiato
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-200 line-clamp-1">{skin.subtitle}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{skin.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'fiocco' && (
            <div className="grid grid-cols-1 gap-2.5">
              {(Object.values(FIOCCO_ACCESSORIES)).map((acc) => {
                const isSelected = currentAccessory === acc.id;
                return (
                  <button
                    key={acc.id}
                    id={`accessory-card-${acc.id}`}
                    onClick={() => handleAccessoryClick(acc.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition relative flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/40'
                        : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/80 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
                        <span>{acc.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                          {isSelected && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-400/40">
                              Indossato
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-200/80 mt-0.5">{acc.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tutte le tenute sono sincronizzate in tempo reale</span>
          </div>

          <button
            id="btn-wardrobe-confirm"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-lg"
          >
            Conferma & Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
