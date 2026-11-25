import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

const COMPLIMENTS = [
  "You are absolutely gorgeous! ✨",
  "You have such an aesthetic personality! 🌸",
  "You are genuinely one of my very good friends! 💗",
  "Your smile makes everything brighter! ☀️",
  "You have a beautiful heart! 🫶",
  "You bring positive energy everywhere! 💫",
  "You are one of the sweetest people! 🦋",
  "You make ordinary moments special! ❤️",
  "Never stop being the wonderful person you are! 🌷",
  "You deserve all the happiness in this world! 🎀"
];

const BALLOON_STYLES = [
  { gradient: 'from-[#FF6B8B] via-[#FF4D79] to-[#D81B60]', knot: '#AD1457', glow: 'shadow-[#FF6B8B]/50', icon: '✨' },
  { gradient: 'from-[#B388FF] via-[#9055FF] to-[#7C4DFF]', knot: '#651FFF', glow: 'shadow-[#B388FF]/50', icon: '🌸' },
  { gradient: 'from-[#FF8A65] via-[#FF7043] to-[#F4511E]', knot: '#E64A19', glow: 'shadow-[#FF8A65]/50', icon: '💗' },
  { gradient: 'from-[#4DB6AC] via-[#26A69A] to-[#00897B]', knot: '#00695C', glow: 'shadow-[#4DB6AC]/50', icon: '☀️' },
  { gradient: 'from-[#4FC3F7] via-[#29B6F6] to-[#0288D1]', knot: '#0277BD', glow: 'shadow-[#4FC3F7]/50', icon: '🫶' },
  { gradient: 'from-[#F06292] via-[#EC407A] to-[#D81B60]', knot: '#C2185B', glow: 'shadow-[#F06292]/50', icon: '💫' },
  { gradient: 'from-[#FFD54F] via-[#FFCA28] to-[#FFB300]', knot: '#FFA000', glow: 'shadow-[#FFD54F]/50', icon: '🦋' },
  { gradient: 'from-[#E57373] via-[#EF5350] to-[#E53935]', knot: '#D32F2F', glow: 'shadow-[#E57373]/50', icon: '❤️' },
  { gradient: 'from-[#BA68C8] via-[#AB47BC] to-[#8E24AA]', knot: '#7B1FA2', glow: 'shadow-[#BA68C8]/50', icon: '🌷' },
  { gradient: 'from-[#FF80AB] via-[#FF4081] to-[#F50057]', knot: '#C51162', glow: 'shadow-[#FF80AB]/50', icon: '🎀' }
];

export default function BalloonGame({ onNext, isOwner = false }) {
  const [poppedState, setPoppedState] = useState(Array(10).fill(false));

  const poppedCount = poppedState.filter(Boolean).length;
  const isAllPopped = poppedCount === 10;

  const handlePop = (index, e) => {
    if (poppedState[index]) return;

    sound.playPop();

    if (e && e.clientX) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: ['#FF6B8B', '#9055FF', '#FF7043', '#29B6F6', '#FFCA28']
      });
    }

    setPoppedState(prev => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;

      if (next.filter(Boolean).length === 10) {
        setTimeout(() => {
          sound.playChime();
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FFD1DC', '#E6E6FA', '#FFDAB9', '#B76E79', '#FFFDD0']
          });
        }, 350);
      }
      return next;
    });
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-start px-4 py-6 text-center select-none">
      {/* Headings */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto mb-4"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-xs font-bold text-[#8B4853] mb-2 shadow-xs">
          Interactive Balloon Pop
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A3E3D] mb-2">
          Let's Pop Some Happiness! 🎈
        </h2>
        <p className="text-base sm:text-lg text-[#6B4B52] font-medium">
          Every balloon has a little compliment waiting for you. Pop them all!
        </p>

        {/* Counter */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-rose-300 text-sm font-bold text-[#8B4853] shadow-md">
            <span>Balloons Popped:</span>
            <span className="text-rose-600 font-extrabold text-lg">{poppedCount} / 10</span>
          </div>
          {isOwner && (
            <button
              onClick={() => setPoppedState(Array(10).fill(true))}
              className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 border border-rose-300 text-[#8B4853] text-xs font-bold transition-all shadow-xs"
              title="Pop all balloons at once for testing"
            >
              ✨ Pop All (Admin)
            </button>
          )}
        </div>
      </motion.div>

      {/* Balloons Grid */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-y-6 gap-x-4 sm:gap-6 my-4 px-2">
        {BALLOON_STYLES.map((style, idx) => {
          const isPopped = poppedState[idx];
          return (
            <div key={idx} className="relative flex flex-col items-center justify-center min-h-[13rem] sm:min-h-[14rem]">
              <AnimatePresence mode="wait">
                {!isPopped ? (
                  <motion.div
                    key="balloon"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: [0, -12, 0],
                      rotate: [0, idx % 2 === 0 ? 3 : -3, 0]
                    }}
                    exit={{ scale: [1.3, 0], opacity: 0 }}
                    transition={{
                      y: { duration: 3 + (idx % 3) * 0.6, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 3.5 + (idx % 2) * 0.5, repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 0.22 },
                      opacity: { duration: 0.22 }
                    }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={(e) => handlePop(idx, e)}
                    className="cursor-pointer relative flex flex-col items-center group touch-manipulation drop-shadow-md"
                  >
                    {/* Balloon Body */}
                    <div
                      className={`w-[84px] h-[112px] sm:w-[98px] sm:h-[128px] rounded-[50%_50%_50%_50%_/_42%_42%_58%_58%] bg-gradient-to-tr ${style.gradient} shadow-lg ${style.glow} relative flex items-center justify-center transition-transform border border-white/40`}
                    >
                      {/* Curled Specular Gloss */}
                      <div className="absolute top-2 left-3 w-5 h-8 rounded-full bg-white/60 -rotate-35 blur-[0.8px] pointer-events-none" />
                      <div className="absolute top-2 right-3 w-2 h-3 rounded-full bg-white/40 blur-[0.5px] pointer-events-none" />

                      {/* Number and Icon badge */}
                      <div className="flex flex-col items-center z-10 select-none">
                        <span className="text-white text-lg drop-shadow-md">
                          {style.icon}
                        </span>
                        <span className="text-white text-xs font-extrabold font-serif tracking-wider drop-shadow-md">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Balloon Knot */}
                    <div
                      className="w-3.5 h-2.5 -mt-0.5 rounded-b-md shadow-xs"
                      style={{ backgroundColor: style.knot }}
                    />

                    {/* Curving String */}
                    <svg className="w-8 h-14 overflow-visible -mt-0.5" viewBox="0 0 30 60">
                      <path
                        d="M15,0 C8,15 22,28 14,42 C10,48 16,56 15,60"
                        fill="none"
                        stroke="#6B4B52"
                        strokeWidth="1.8"
                        strokeDasharray="2.5,2.5"
                        opacity="0.8"
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="compliment"
                    initial={{ opacity: 0, scale: 0.65, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    data-testid={`balloon-message-${idx + 1}`}
                    className="w-full max-w-[185px] min-h-[144px] sm:min-h-[156px] p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-rose-200/90 shadow-lg shadow-rose-200/40 flex flex-col items-center justify-center text-center"
                  >
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-[#8B4853] mb-2">
                      <span>{style.icon}</span>
                      <span>#{idx + 1}</span>
                    </span>
                    <p className="text-xs sm:text-[13px] font-serif font-semibold text-[#4A3E3D] leading-snug break-words">
                      "{COMPLIMENTS[idx]}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Completion Banner & Next Arrow */}
      {isAllPopped && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto mt-4 p-6 rounded-3xl bg-white border-2 border-rose-300 text-center shadow-2xl z-20"
        >
          <div className="text-4xl mb-2 animate-bounce">🥳</div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#8B4853] mb-4">
            Yayyy! You unlocked all your little compliments! 🥳
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sound.playChime();
              onNext();
            }}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-base shadow-lg shadow-rose-300/50 flex items-center justify-center gap-2 mx-auto hover:shadow-xl transition-all"
          >
            <span>A Special Bouquet Awaits</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
