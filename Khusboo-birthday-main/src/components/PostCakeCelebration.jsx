import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, PartyPopper, Smile, Laugh } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

const CONGRATS_PARAS = [
  "Yayyyy! You finally entered your twenties! 💗",
  "20 years of memories, laughter, craziness and countless little moments!",
  "May this new chapter bring you endless happiness, success, adventures and beautiful memories.",
  "Stay happy, keep smiling, and never stop being the amazing person you are! 🌸"
];

const JOKES = [
  {
    id: 1,
    joke: "Congratulations! You're now 20. Your childhood subscription has officially expired! 😂",
    tag: "Subscription Expired",
    emoji: "📦"
  },
  {
    id: 2,
    joke: "Welcome to your twenties! Now you can be confused about life professionally! 🤣",
    tag: "Pro Level",
    emoji: "🎓"
  },
  {
    id: 3,
    joke: "20 years old, but still waiting for someone to explain how adulthood works! 😭",
    tag: "Adulting 101",
    emoji: "🤷‍♀️"
  },
  {
    id: 4,
    joke: "Don't worry about getting older. You're still younger than your future problems! 😂",
    tag: "Silver Lining",
    emoji: "✨"
  },
  {
    id: 5,
    joke: "Your age is 20, but your craziness is still unlimited! 🤪",
    tag: "Certified Crazy",
    emoji: "🚀"
  },
  {
    id: 6,
    joke: "Congratulations! You have unlocked Level 20. New challenges, same madness! 🎮",
    tag: "Level 20 Unlocked",
    emoji: "🏆"
  }
];

export default function PostCakeCelebration({ onNext }) {
  const [stage, setStage] = useState(1);
  // Stage 1: Initial congratulations card & gentle flower drizzle
  // Stage 2: Flower shower intensity rises, jokes appear
  // Stage 3: Full grand rain of flowers & final celebration card

  useEffect(() => {
    // Initial celebration burst
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#FF6B8B', '#FACC15', '#FFD1DC', '#E6E6FA', '#FFFDD0', '#B76E79']
    });

    const t2 = setTimeout(() => {
      setStage(2);
      sound.playChime();
    }, 1800);

    const t3 = setTimeout(() => {
      setStage(3);
      sound.playChime();
      confetti({
        particleCount: 120,
        spread: 110,
        origin: { y: 0.3 },
        colors: ['#FF8DA1', '#FDA4AF', '#FDE047', '#C084FC', '#FFF']
      });
    }, 4500);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Optimized Falling Flower Petals & Blossoms
  const fallingFlowers = useMemo(() => {
    const items = ['🌸', '🌹', '🤍', '🪻', '🌼', '🌷', '💮', '✨', '🌸', '🌼', '🌹', '🪻'];
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      flower: items[i % items.length],
      left: `${(i * 3.1 + Math.random() * 3) % 96}%`,
      size: 16 + (i % 5) * 6, // 16px to 40px
      duration: 5.5 + (i % 6) * 1.5,
      delay: (i * 0.25) % 4,
      sway: 20 + (i % 4) * 15,
      rotationSpeed: 360 * (i % 2 === 0 ? 1 : -1)
    }));
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 px-3 py-4 flex flex-col items-center select-none">
      {/* Dimmed Background Overlay */}
      <div className="fixed inset-0 bg-black/35 backdrop-blur-xs pointer-events-none z-10 transition-opacity duration-1000" />

      {/* CONTINUOUS GRAND RAIN OF FLOWERS (STAGE 4 REQUIREMENT) */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {fallingFlowers.map((f) => (
          <motion.div
            key={f.id}
            initial={{ y: -60, x: 0, rotate: 0, opacity: 0 }}
            animate={{
              y: '105vh',
              x: [0, f.sway, -f.sway, 0],
              rotate: f.rotationSpeed,
              opacity: [0, 0.9, 0.9, 0]
            }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              delay: f.delay,
              ease: 'easeInOut'
            }}
            className="absolute will-change-transform filter drop-shadow-sm select-none"
            style={{
              left: f.left,
              fontSize: `${f.size}px`
            }}
          >
            {f.flower}
          </motion.div>
        ))}
      </div>

      {/* STEP 2: CONGRATULATIONS MESSAGE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-rose-300 shadow-2xl relative z-20 text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-xs font-bold text-[#8B4853] mb-3 shadow-xs">
          <PartyPopper className="w-4 h-4 text-[#B76E79]" />
          <span>Milestone Celebration</span>
        </span>

        {/* Animated Main Heading */}
        <motion.h2
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-2xl sm:text-4xl font-serif font-extrabold text-[#8B4853] mb-1"
        >
          CONGRATULATIONS, KHUSBOO! 🥳🎂
        </motion.h2>

        {/* Subheading */}
        <h3 className="text-lg sm:text-2xl font-serif font-bold text-[#DFBA73] drop-shadow-xs mb-5">
          OFFICIALLY 20 YEARS YOUNG! 🎉
        </h3>

        {/* Paragraph by Paragraph Message Reveal */}
        <div className="space-y-3.5 text-left sm:text-center font-serif">
          {CONGRATS_PARAS.map((para, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.2 }}
              className={`leading-relaxed ${
                idx === 0
                  ? 'text-lg sm:text-xl font-bold text-[#6B3B48] font-handwriting'
                  : 'text-base sm:text-lg text-[#4A3E3D] font-normal'
              }`}
            >
              {para}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* STEP 3: FUNNY BIRTHDAY JOKES */}
      <div className="w-full max-w-3xl relative z-20 mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mb-4"
        >
          <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-white/90 border border-rose-200 text-xs font-bold text-[#8B4853] shadow-xs">
            <Laugh className="w-3.5 h-3.5 text-amber-500" />
            <span>20th Birthday Realities 😂</span>
          </span>
          <div>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#6B3B48] bg-white/85 px-5 py-2 rounded-2xl inline-block border border-rose-200/90 shadow-md mt-2">
              A Few Friendly Truths About Turning 20!
            </h4>
          </div>
        </motion.div>

        {/* 6 Joke Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {JOKES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
              whileHover={{ scale: 1.03, rotate: index % 2 === 0 ? 1 : -1 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-rose-200 shadow-xl flex items-start gap-3.5 group cursor-default transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-100 to-amber-100 border border-rose-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                {item.emoji}
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md inline-block mb-1">
                  {item.tag}
                </span>
                <p className="text-sm sm:text-base font-serif text-[#3D2C2E] font-medium leading-snug">
                  {item.joke}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* STEP 5: FINAL CELEBRATION MESSAGE CARD & NEXT BUTTON */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-[#DFBA73] shadow-2xl relative z-20 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
          🎀
        </div>

        {/* Heading: 20 NEVER LOOKED THIS GOOD! 🎀 */}
        <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#8B4853] mb-3">
          20 NEVER LOOKED THIS GOOD! 🎀
        </h3>

        {/* Message */}
        <div className="font-serif text-base sm:text-lg text-[#4A3E3D] space-y-2 mb-6 leading-relaxed">
          <p className="font-semibold text-[#8B4853]">
            Once again, Happy 20th Birthday, Khusboo!
          </p>
          <p>
            Keep shining, keep laughing, and keep making beautiful memories.
          </p>
          <p className="font-bold text-[#DFBA73] pt-1">
            Here's to a wonderful new chapter! 🥳💐
          </p>
        </div>

        {/* Animated NEXT Button to navigate to final goodbye page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sound.playChime();
            onNext();
          }}
          className="px-9 py-4 rounded-full bg-gradient-to-r from-[#DFBA73] via-[#B76E79] to-[#D88A96] text-white font-extrabold text-base shadow-xl shadow-rose-300/60 hover:shadow-2xl transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <span>One Last Thing...</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
