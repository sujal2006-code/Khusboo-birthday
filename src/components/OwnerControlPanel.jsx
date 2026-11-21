import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Music,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Lock,
  Gift,
  Cake,
  Heart,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

const ALL_PAGES = [
  { id: 1, label: 'Countdown', desc: 'Welcome & Live Timer', icon: '🎀' },
  { id: 2, label: 'Password', desc: 'Birthday-Year Keypad', icon: '🔒' },
  { id: 3, label: 'Balloons', desc: '10 Interactive Compliments', icon: '🎈' },
  { id: 4, label: 'Bouquet', desc: '3D Parallax Flower Gift', icon: '💐' },
  { id: 5, label: 'Memories', desc: 'Polaroid Scrapbook Gallery', icon: '📸' },
  { id: 6, label: 'Special Message', desc: 'Handwritten Friendship Letter', icon: '💌' },
  { id: 7, label: 'Cake', desc: '3D Cake Cutting Interaction', icon: '🎂' },
  { id: 8, label: 'Celebration', desc: 'Congratulations, Jokes & Flower Rain', icon: '🥳' },
  { id: 9, label: 'Goodbye', desc: 'Twilight Night Sky Sign-off', icon: '🌙' },
];

export default function OwnerControlPanel({
  currentPage,
  onSelectPage,
  onResetGuestProgress,
  onExitOwnerMode,
  isMusicPlaying,
  onToggleMusic
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleTestConfetti = () => {
    sound.playChime();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FF6B8B', '#FACC15', '#FFD1DC', '#E6E6FA', '#BA68C8']
    });
    showNotice('🎉 Confetti & chime triggered!');
  };

  const handleTestChime = () => {
    sound.playChime();
    showNotice('✨ Harmonic chime played!');
  };

  const handleResetProgress = async () => {
    await onResetGuestProgress();
    showNotice('🔄 Guest progress successfully reset to Page 1!');
  };

  return (
    <div className="sticky top-0 z-50 w-full select-none">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-700 to-purple-800 text-white shadow-xl px-3 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-serif font-black tracking-wider text-xs sm:text-sm uppercase flex items-center gap-1.5">
              <span>👑</span>
              <span>OWNER CONTROL PANEL</span>
            </span>
            <span className="hidden md:inline-block text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-amber-200 font-semibold border border-white/20">
              Admin Mode Active (All Restrictions Bypassed)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {actionNotice && (
              <span className="text-xs bg-black/40 px-3 py-1 rounded-full text-emerald-300 font-medium animate-pulse hidden sm:inline-block">
                {actionNotice}
              </span>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold flex items-center gap-1 transition-all"
              title={isExpanded ? 'Collapse Panel' : 'Expand Panel'}
            >
              <span>{isExpanded ? 'Hide Controls' : 'Show Controls'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onExitOwnerMode}
              className="px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              title="Return to clean Guest Mode for Khusboo"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit to Guest Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Control Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-[#24172B]/95 backdrop-blur-md border-b border-rose-500/30 text-white shadow-2xl px-3 py-3 sm:px-6"
          >
            <div className="max-w-7xl mx-auto space-y-3">
              {/* 1. Direct Page Jump Buttons (All 9 Pages) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1">
                    <span>⚡ Immediate Page Navigation:</span>
                  </span>
                  <span className="text-[11px] text-gray-300">
                    Currently Viewing: <strong className="text-white">Page {currentPage} of 9</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                  {ALL_PAGES.map((page) => {
                    const isCurrent = currentPage === page.id;
                    return (
                      <button
                        key={page.id}
                        onClick={() => onSelectPage(page.id)}
                        className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-gradient-to-br from-[#B76E79] to-[#D88A96] border-white text-white font-bold shadow-lg shadow-rose-900/60 scale-102 ring-2 ring-amber-300'
                            : 'bg-white/10 hover:bg-white/20 border-white/10 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base">{page.icon}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-amber-200 font-mono">
                            #{page.id}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold truncate leading-tight">
                          Open {page.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Admin Action Tools */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleResetProgress}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/60 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border border-rose-400/40"
                    title="Resets verified guest progression back to page 1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Guest Progress</span>
                  </button>

                  <button
                    onClick={handleTestConfetti}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/60 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border border-amber-300/40"
                    title="Trigger confetti burst and audio chime"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Celebration FX</span>
                  </button>

                  <button
                    onClick={handleTestChime}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/60 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border border-purple-300/40"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Audio Chime</span>
                  </button>

                  <button
                    onClick={onToggleMusic}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
                      isMusicPlaying
                        ? 'bg-emerald-600/80 border-emerald-400 text-white'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-gray-300'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>{isMusicPlaying ? 'Birthday Music Playing' : 'Start Birthday Music'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-amber-200/90 italic flex items-center gap-1">
                  <span>🔒 Guest Mode will hide this bar and enforce sequential unlocking.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
