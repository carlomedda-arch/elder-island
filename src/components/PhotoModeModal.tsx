import React, { useState } from 'react';
import { Camera, Download, Eye, EyeOff, RotateCcw, X, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { PhotoFilterId, PhotoFilterConfig } from '../types';
import { sounds } from '../audio/SoundManager';

export const PHOTO_FILTERS: Record<PhotoFilterId, PhotoFilterConfig> = {
  natural: {
    id: 'natural',
    name: 'Naturale',
    filterStyle: 'none',
    icon: '🍃',
  },
  golden_aurora: {
    id: 'golden_aurora',
    name: 'Aurora Dorata',
    filterStyle: 'sepia(30%) saturate(140%) contrast(105%) brightness(108%)',
    icon: '✨',
  },
  astral_nebula: {
    id: 'astral_nebula',
    name: 'Nebulosa Astrale',
    filterStyle: 'hue-rotate(220deg) saturate(160%) contrast(115%)',
    icon: '🌌',
  },
  ancient_parchment: {
    id: 'ancient_parchment',
    name: 'Pergamena Antica',
    filterStyle: 'sepia(85%) contrast(120%) brightness(95%)',
    icon: '📜',
  },
  zenith_radiance: {
    id: 'zenith_radiance',
    name: 'Luce dello Zenit',
    filterStyle: 'saturate(180%) contrast(110%) brightness(115%)',
    icon: '☀️',
  },
};

interface PhotoModeModalProps {
  currentLevelId: number;
  activeFilter: PhotoFilterId;
  onFilterChange: (filter: PhotoFilterId) => void;
  onRotateCamera: (dx: number, dy: number) => void;
  onZoomCamera: (delta: number) => void;
  onCapture: () => string; // returns data URL
  onExit: () => void;
}

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({
  currentLevelId,
  activeFilter,
  onFilterChange,
  onRotateCamera,
  onZoomCamera,
  onCapture,
  onExit,
}) => {
  const [hideUI, setHideUI] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    sounds.playCameraShutter();
    setIsCapturing(true);
    
    setTimeout(() => {
      try {
        const dataUrl = onCapture();
        const link = document.createElement('a');
        link.download = `Skyward-Ruins-Isola-${currentLevelId}-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Snapshot error:', err);
      } finally {
        setIsCapturing(false);
      }
    }, 100);
  };

  return (
    <div id="photo-mode-overlay" className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Visual Filter applied across the whole screen */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          backdropFilter: PHOTO_FILTERS[activeFilter]?.filterStyle !== 'none'
            ? PHOTO_FILTERS[activeFilter]?.filterStyle
            : undefined,
        }}
      />

      {/* Cinematic Frame corners */}
      <div className="absolute inset-4 border-2 border-white/30 rounded-3xl pointer-events-none" />
      <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
      <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

      {/* Top Banner (Photo Mode indicator & Exit) */}
      {!hideUI && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 shadow-2xl pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-amber-400" />
            MODALITÀ FOTO — ISOLA {currentLevelId}
          </span>
          <button
            id="btn-photo-exit"
            onClick={onExit}
            className="ml-2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Esci dalla modalità foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Controls Toolbar */}
      {!hideUI && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 flex flex-col items-center gap-3 pointer-events-auto">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
            {(Object.values(PHOTO_FILTERS)).map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  id={`btn-photo-filter-${f.id}`}
                  onClick={() => onFilterChange(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                      : 'bg-white/5 hover:bg-white/15 text-white/90'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span className="text-[11px] font-semibold">{f.name}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between w-full bg-slate-950/85 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-2xl">
            {/* Camera Orbit Pad */}
            <div className="flex items-center gap-1">
              <button
                id="btn-photo-cam-left"
                onClick={() => onRotateCamera(-0.2, 0)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                title="Ruota Sinistra"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  id="btn-photo-cam-up"
                  onClick={() => onRotateCamera(0, -0.1)}
                  className="w-8 h-4 rounded-t bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                  title="Alza Angolo"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  id="btn-photo-cam-down"
                  onClick={() => onRotateCamera(0, 0.1)}
                  className="w-8 h-4 rounded-b bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                  title="Abbassa Angolo"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <button
                id="btn-photo-cam-right"
                onClick={() => onRotateCamera(0.2, 0)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                title="Ruota Destra"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-photo-zoom-in"
                onClick={() => onZoomCamera(-1.0)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                id="btn-photo-zoom-out"
                onClick={() => onZoomCamera(1.0)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Main Shutter Snap Button */}
            <button
              id="btn-photo-snap"
              onClick={handleCapture}
              disabled={isCapturing}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)] disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? 'Scatto...' : 'Scatta Foto'}</span>
            </button>

            {/* Hide UI Toggle */}
            <button
              id="btn-photo-hide-ui"
              onClick={() => setHideUI(true)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              title="Nascondi Interfaccia (Tocca lo schermo per ripristinare)"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Screen touch when UI is hidden to restore UI */}
      {hideUI && (
        <div
          id="photo-screen-unhide-trigger"
          onClick={() => setHideUI(false)}
          className="absolute inset-0 pointer-events-auto flex items-end justify-center pb-8 cursor-pointer"
        >
          <div className="bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs text-white/90 flex items-center gap-2 animate-bounce">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Tocca lo schermo per mostrare i controlli</span>
          </div>
        </div>
      )}

      {/* Flash shutter overlay animation */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping" />
      )}
    </div>
  );
};
