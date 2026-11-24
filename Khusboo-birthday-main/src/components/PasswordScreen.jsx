import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Sparkles, Delete, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

export default function PasswordScreen({ onUnlock }) {
  const [digits, setDigits] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Keyboard support for desktop / laptop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isUnlocked) return;

      if (/^[0-9]$/.test(e.key)) {
        handlePressDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      } else if (e.key === 'Enter') {
        handleVerify();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits, isUnlocked]);

  const handlePressDigit = (num) => {
    if (isUnlocked) return;
    if (digits.length >= 4) return;
    sound.playPop();
    if (errorMsg) setErrorMsg('');
    setDigits(prev => prev + num);
  };

  const handleBackspace = () => {
    if (isUnlocked) return;
    sound.playPop();
    if (errorMsg) setErrorMsg('');
    setDigits(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isUnlocked) return;
    sound.playPop();
    if (errorMsg) setErrorMsg('');
    setDigits('');
  };

  const handleVerify = () => {
    if (isUnlocked) return;

    if (digits === '2006') {
      setIsUnlocked(true);
      setErrorMsg('');
      sound.playChime();

      // Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FFD1DC', '#E6E6FA', '#FFDAB9', '#B76E79', '#DFBA73', '#FF6B8B']
      });

      // Automatically show the next page after a short celebration
      setTimeout(() => {
        onUnlock('2006');
      }, 1500);
    } else {
      setShake(true);
      setErrorMsg("Oopsie! That's not your birthday year! Try once more! 😄");
      sound.playSlice(); // playful error cue
      setTimeout(() => setShake(false), 600);
    }
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['Clear', '0', '⌫']
  ];

  return (
    <div className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 py-6 text-center select-none">
      {/* Decorative Floating ambient elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute text-lg sm:text-2xl opacity-40 animate-float-slow select-none"
            style={{
              left: `${(i * 9 + 6) % 92}%`,
              top: `${(i * 10 + 8) % 88}%`,
              animationDelay: `${i * 0.8}s`
            }}
          >
            {i % 3 === 0 ? '🌸' : i % 3 === 1 ? '✨' : '🌷'}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl relative border-2 border-rose-200/80 z-10"
      >
        {/* Animated Lock Icon */}
        <motion.div
          animate={isUnlocked ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-rose-200 to-pink-100 border border-rose-300 flex items-center justify-center mb-4 shadow-sm"
        >
          {isUnlocked ? (
            <Sparkles className="w-8 h-8 text-[#B76E79] animate-spin" />
          ) : (
            <Lock className="w-8 h-8 text-[#8B4853]" />
          )}
        </motion.div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3E3D] mb-1">
          Before Your Surprise Begins! 🎀
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#7A5C61] mb-5 font-normal">
          Let's see if you remember your birthday year!
        </p>

        {/* Display / PIN Input Area */}
        <motion.div
          animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full bg-white/90 border-2 border-rose-200 rounded-2xl p-4 mb-4 shadow-inner flex flex-col items-center justify-center min-h-[72px]"
        >
          {digits.length === 0 ? (
            <span className="text-sm sm:text-base text-rose-300 font-medium">
              Enter your birthday year
            </span>
          ) : (
            <div className="flex items-center gap-4">
              {[0, 1, 2, 3].map((slotIdx) => {
                const filled = slotIdx < digits.length;
                return (
                  <motion.div
                    key={slotIdx}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: filled ? 1 : 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
                      filled
                        ? 'bg-gradient-to-tr from-[#B76E79] to-[#D88A96] shadow-sm'
                        : 'border-2 border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    {filled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs sm:text-sm font-bold text-rose-600 mb-3 px-2 py-1 bg-rose-50 rounded-xl border border-rose-200"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Unlocked Banner */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 py-2 px-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Yayyy! You unlocked your surprise! 🥳</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mb-3.5">
          {keypadButtons.map((row, rowIdx) =>
            row.map((btn, colIdx) => {
              const isSpecial = btn === 'Clear' || btn === '⌫';
              return (
                <motion.button
                  key={`${rowIdx}-${colIdx}`}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  disabled={isUnlocked}
                  onClick={() => {
                    if (btn === 'Clear') handleClear();
                    else if (btn === '⌫') handleBackspace();
                    else handlePressDigit(btn);
                  }}
                  className={`h-13 sm:h-14 rounded-2xl font-serif text-lg sm:text-xl font-bold flex items-center justify-center shadow-md border transition-all touch-manipulation ${
                    isSpecial
                      ? 'bg-rose-50/90 text-[#8B4853] border-rose-200 hover:bg-rose-100 text-sm sm:text-base font-sans font-semibold'
                      : 'bg-white/95 text-[#4A3E3D] border-rose-200/90 hover:border-rose-300 hover:bg-rose-50/60'
                  }`}
                >
                  {btn === 'Clear' ? (
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear
                    </span>
                  ) : btn === '⌫' ? (
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                      <Delete className="w-4 h-4" />
                    </span>
                  ) : (
                    <span>{btn}</span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Separate ENTER Button Below Keypad */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          disabled={isUnlocked || digits.length === 0}
          onClick={handleVerify}
          className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
            digits.length > 0
              ? 'bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white shadow-rose-300/50 hover:shadow-xl cursor-pointer'
              : 'bg-rose-200/60 text-white/80 cursor-not-allowed shadow-none'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ENTER</span>
        </motion.button>

        {/* Hint */}
        <p className="text-[11px] sm:text-xs text-[#A67C82] mt-4 italic">
          Hint: Enter your 4-digit birth year ✨
        </p>
      </motion.div>
    </div>
  );
}
