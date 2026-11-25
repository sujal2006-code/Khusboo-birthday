import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, PartyPopper, ArrowRight, Heart, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

// Target: 26 November 2026, 12:00:00 AM IST (UTC+5:30)
const TARGET_TIME = new Date('2026-11-26T00:00:00+05:30').getTime();

export default function Countdown({ onComplete, isOwner = false }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false
  });

  const [forceComplete, setForceComplete] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const hasCelebratedRef = useRef(false);

  useEffect(() => {
    let intervalId = null;

    const calculateTime = () => {
      const now = Date.now();
      const difference = TARGET_TIME - now;

      if (difference <= 0 || forceComplete) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isFinished: true
        });

        if (!hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          sound.playChime();
          // Trigger celebration confetti
          try {
            confetti({
              particleCount: 80,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#FFD1DC', '#E6E6FA', '#FFDAB9', '#B76E79', '#FFFDD0']
            });
          } catch (e) {
            console.warn('Confetti effect skipped:', e);
          }
        }

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return true;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isFinished: false
      });
      return false;
    };

    const alreadyFinished = calculateTime();
    if (!alreadyFinished) {
      intervalId = setInterval(calculateTime, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [forceComplete]);

  const handleTestPreview = () => {
    setForceComplete(true);
    sound.playChime();
  };

  const handleContinue = async () => {
    if (isContinuing) return;
    setIsContinuing(true);
    try {
      sound.playChime();
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
    try {
      if (onComplete) {
        await onComplete();
      }
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 text-center select-none">
      {/* Decorative Top Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-pastel-pinkDeep/40 shadow-sm text-xs font-semibold text-[#8B4853] mb-6"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
        <span>A Special Birthday Countdown</span>
        <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-6xl font-serif font-bold text-[#4A3E3D] tracking-tight mb-3"
      >
        Hey Khusboo! <span className="inline-block animate-bounce">🎀</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg sm:text-xl text-[#7A5C61] max-w-lg mb-8 font-light"
      >
        I have prepared a little birthday surprise for you...
      </motion.p>

      {/* Countdown Card / Celebration Area */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-2xl mx-auto glass-panel p-6 sm:p-10 rounded-3xl relative overflow-hidden"
      >
        {!timeLeft.isFinished ? (
          <div>
            <div className="flex items-center justify-center gap-2 text-sm text-[#8B4853] font-medium mb-6">
              <Clock className="w-4 h-4 text-[#B76E79]" />
              <span>Counting down to 26 November 2026, 12:00 AM IST</span>
            </div>

            {/* Countdown Tiles */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className="bg-white/80 rounded-2xl p-3 sm:p-5 border border-rose-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <span className="text-3xl sm:text-5xl font-extrabold text-[#8B4853] font-serif">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#9B6B78] font-semibold mt-1">
                    {item.label}
                  </span>
                  {/* Subtle decorative dot */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-300" />
                </div>
              ))}
            </div>

            <p className="text-[#8B4853] font-handwriting text-2xl sm:text-3xl font-semibold text-center mb-6">
              "Good things take time... and something special is waiting for you! ♡"
            </p>

            {/* Locked state note with discreet preview unlock (Owner Only) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-rose-100/80">
              <span className="text-xs text-[#9B6B78] italic">
                🔒 The surprise unlocks automatically on your special day.
              </span>
              {isOwner && (
                <button
                  onClick={handleTestPreview}
                  className="text-xs px-3 py-1 rounded-full bg-rose-50 text-[#B76E79] hover:bg-rose-100 border border-rose-200 transition-colors"
                  title="Preview Celebration (Owner Mode)"
                >
                  ✨ Early Preview / Test (Admin)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-3xl mb-4 shadow-inner animate-bounce">
                🎂
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#8B4853] mb-3">
                Finally, your special day is here! Happy Birthday in advance! 🎂
              </h2>
              
              <p className="text-[#7A5C61] font-aesthetic text-2xl sm:text-3xl mb-8">
                Your 20th birthday surprise journey is ready to begin!
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                disabled={isContinuing}
                onClick={handleContinue}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-base shadow-lg shadow-rose-300/50 flex items-center gap-2 hover:shadow-xl transition-all cursor-pointer disabled:opacity-75"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
