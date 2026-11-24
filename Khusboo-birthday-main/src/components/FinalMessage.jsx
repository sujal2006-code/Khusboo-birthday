import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Moon, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

const FULL_TEXT = `I hope this little surprise brought a smile to your face.

I wanted to make your birthday a little different from the usual wishes and messages.

I hope you liked it. And remember, you deserve all the happiness, success, and beautiful things life has to offer.

Keep smiling, keep shining, and never change the wonderful person you are.

That's all for today...

Instead of saying only Happy Birthday, I wanted to create a little memory for one of my very good friends.

Okay, Good Night! 🌙

Bye Bye, Khusboo! 💗`;

export default function FinalMessage({ onReplay }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const speed = 22;
    intervalRef.current = setInterval(() => {
      if (index < FULL_TEXT.length) {
        setDisplayedText(FULL_TEXT.slice(0, index + 1));
        index++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTypingComplete(true);
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD1DC', '#E6E6FA', '#FFFDD0', '#DFBA73']
        });
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSkipTyping = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayedText(FULL_TEXT);
    setIsTypingComplete(true);
  };

  return (
    <div className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 py-8 select-none overflow-hidden">
      {/* Night Sky Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft Glowing Moon */}
        <div className="absolute top-6 right-8 sm:right-24 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-200 to-amber-50 shadow-[0_0_80px_rgba(255,240,180,0.85)] flex items-center justify-center opacity-90 animate-pulse-glow">
          {/* Crescent cutout for an authentic crescent moon */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#18122B] -mr-7 -mt-4" />
        </div>

        {/* Twinkling Stars */}
        {[...Array(32)].map((_, i) => (
          <div
            key={i}
            className="absolute text-amber-200 animate-sparkle"
            style={{
              left: `${(i * 7.5 + 8) % 94}%`,
              top: `${(i * 8.5 + 5) % 90}%`,
              fontSize: `${8 + (i % 4) * 5}px`,
              animationDelay: `${(i % 5) * 0.6}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          >
            {i % 3 === 0 ? '✦' : i % 3 === 1 ? '★' : '•'}
          </div>
        ))}

        {/* Floating Night Flowers */}
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none opacity-40 animate-float-slow text-lg sm:text-2xl"
            style={{
              left: `${(i * 12 + 10) % 90}%`,
              top: `${(i * 11 + 15) % 85}%`,
              animationDelay: `${i * 1.2}s`
            }}
          >
            {i % 2 === 0 ? '🌸' : '✨'}
          </span>
        ))}
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xl mx-auto text-center mb-6 z-10"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-xs font-semibold text-rose-200 mb-2 shadow-lg backdrop-blur-md">
          <Moon className="w-3.5 h-3.5 text-amber-300" />
          <span>Under the Birthday Stars</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-1 drop-shadow-md">
          One Last Thing... ♡
        </h2>
      </motion.div>

      {/* Typewriter Text Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10 text-left font-serif"
      >
        <div className="whitespace-pre-line text-base sm:text-lg text-rose-50 leading-relaxed min-h-[300px] drop-shadow-sm font-normal">
          {displayedText}
          {!isTypingComplete && (
            <span className="inline-block w-2 h-5 bg-rose-300 ml-1 animate-pulse align-middle" />
          )}
        </div>

        {!isTypingComplete && (
          <button
            onClick={handleSkipTyping}
            className="text-xs text-rose-300 hover:text-white underline mt-4 block"
          >
            Skip animation ⏩
          </button>
        )}

        {/* Display at the end */}
        {isTypingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="text-xl sm:text-2xl font-handwriting font-bold text-rose-200 drop-shadow-sm">
              Hope You Liked It! 😊
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sound.playChime();
                onReplay();
              }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#DFBA73] to-[#B76E79] text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 border border-amber-200/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Your Birthday Surprise ♡</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
