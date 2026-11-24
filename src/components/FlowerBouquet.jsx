import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';

export default function FlowerBouquet({ onNext }) {
  const [animStage, setAnimStage] = useState(1);
  // 1: Floating petals immediately active
  // 2: Bouquet presents upward from bottom (gift reveal)
  // 3: 3D floating and parallax active
  // 4: Sparkles & glow aura surround bouquet + dedication message fades in
  // 5: Complete: NEXT arrow appears

  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    // Stage 2: Gift presentation rise
    const t2 = setTimeout(() => {
      setAnimStage(2);
      sound.playChime();
    }, 250);

    // Stage 3: Settle into 3D floating & interactive tilt
    const t3 = setTimeout(() => {
      setAnimStage(3);
    }, 1300);

    // Stage 4: Glowing particles & dedication
    const t4 = setTimeout(() => {
      setAnimStage(4);
    }, 2100);

    // Stage 5: Celebration confetti & NEXT arrow ready
    const t5 = setTimeout(() => {
      setAnimStage(5);
      sound.playChime();
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#FF6B8B', '#FACC15', '#FFD1DC', '#E6E6FA', '#FFFDD0']
      });
    }, 3000);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Mouse Parallax on Desktop / Laptop
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 14;
    const rotateX = -(y / (rect.height / 2)) * 14;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Touch Parallax on Mobile
  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 12;
    const rotateX = -(y / (rect.height / 2)) * 12;
    setTilt({ rotateX, rotateY });
  };

  const handleTouchEnd = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[90vh] flex flex-col items-center justify-between px-3 py-3 sm:py-5 text-center select-none overflow-hidden"
    >
      {/* 1. Header Area */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto z-20 shrink-0"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-xs font-bold text-[#8B4853] mb-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
          <span>Handpicked Birthday Gift</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A3E3D] mb-1">
          A Little Bouquet, Just for You! 💐
        </h2>
      </motion.div>

      {/* Floating Petals in Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={`bg-petal-${i}`}
            initial={{ y: -60, x: Math.random() * 280 - 140, opacity: 0, rotate: 0 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight * 0.9 : 800,
              x: Math.sin(i * 1.5) * 80,
              opacity: [0, 0.85, 0],
              rotate: 360
            }}
            transition={{
              duration: 6.5 + (i % 4) * 1.8,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
            className="absolute text-xl sm:text-3xl"
            style={{ left: `${(i * 7.5 + 5) % 92}%` }}
          >
            {i % 5 === 0 ? '🌸' : i % 5 === 1 ? '🌼' : i % 5 === 2 ? '🌹' : i % 5 === 3 ? '🌺' : '✨'}
          </motion.div>
        ))}
      </div>

      {/* 2. 3D-Style Bouquet Centerpiece */}
      <div className="relative w-full flex-1 max-w-lg mx-auto flex flex-col items-center justify-center my-1 z-10 min-h-[300px] sm:min-h-[400px]">
        {/* Soft Glowing Warm Particle & Aura Layer */}
        <AnimatePresence>
          {animStage >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.18 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/35 via-rose-300/30 to-orange-200/35 blur-3xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Orbiting Sparkle Accents */}
        {animStage >= 4 && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={`sparkle-${i}`}
                animate={{
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.4, 1, 0.4],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2.2 + (i % 3) * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                className="absolute text-amber-300 drop-shadow-md select-none text-base sm:text-xl"
                style={{
                  top: `${16 + (i * 9) % 65}%`,
                  left: `${15 + (i * 11) % 72}%`
                }}
              >
                ✦
              </motion.span>
            ))}
          </div>
        )}

        {/* Bouquet Presentation Gift Container */}
        <motion.div
          initial={{ y: 260, opacity: 0, scale: 0.8 }}
          animate={
            animStage >= 2
              ? {
                  y: 0,
                  opacity: 1,
                  scale: animStage >= 3 ? 1 : 1.03
                }
              : { y: 260, opacity: 0, scale: 0.8 }
          }
          transition={{
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative flex flex-col items-center justify-center perspective-[1000px]"
        >
          {/* Subtle Continuous 3D Floating + Parallax Tilt Wrap */}
          <motion.div
            animate={
              animStage >= 3
                ? {
                    y: [0, -10, 0],
                    rotateZ: [0, 1.2, 0, -1.2, 0]
                  }
                : {}
            }
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(15px)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d'
            }}
            className="relative flex flex-col items-center group cursor-grab active:cursor-grabbing"
          >
            {/* The Authentic Uploaded Bouquet Photograph (Transparent PNG Cutout) */}
            <div className="relative">
              <img
                src="/photos/new_bouquet_transparent.png"
                alt="A Special Birthday Bouquet for Khusboo"
                className="h-auto max-h-[44vh] sm:max-h-[50vh] md:max-h-[56vh] max-w-[85vw] sm:max-w-md object-contain drop-shadow-[0_20px_35px_rgba(230,100,50,0.35)] drop-shadow-[0_8px_18px_rgba(180,40,40,0.22)] filter transition-all duration-300"
                draggable={false}
              />

              {/* Realistic Specular Lighting Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-transparent pointer-events-none rounded-3xl" />
            </div>

            {/* Natural Contact Shadow Underneath Bouquet */}
            <motion.div
              animate={
                animStage >= 3
                  ? {
                      scale: [1, 0.88, 1],
                      opacity: [0.45, 0.28, 0.45]
                    }
                  : {}
              }
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-48 sm:w-60 h-6 bg-gradient-to-r from-transparent via-[#8B4853]/45 to-transparent rounded-full blur-md -mt-3 pointer-events-none"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* 3. Bottom Dedication & Navigation Area */}
      <div className="max-w-xl mx-auto z-20 shrink-0 mt-2 mb-1">
        {/* Exact Message: "A little bouquet for a wonderful friend like you! 💐" */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={animStage >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          className="text-xl sm:text-2xl text-[#8B4853] font-handwriting font-bold max-w-lg mx-auto mb-3"
        >
          "A little bouquet for a wonderful friend like you! 💐"
        </motion.p>

        {/* Next Arrow (Appears strictly after bouquet reveal completes) */}
        <AnimatePresence>
          {animStage >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  sound.playChime();
                  onNext();
                }}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-base shadow-lg shadow-rose-300/50 flex items-center gap-2 mx-auto hover:shadow-xl transition-all"
              >
                <span>Explore Special Moments</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
