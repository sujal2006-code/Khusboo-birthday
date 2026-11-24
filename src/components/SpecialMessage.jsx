import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, ArrowRight, Heart } from 'lucide-react';
import { sound } from '../utils/audioSynth';

const PARAGRAPHS = [
  "Happy Birthday, Khusboo! 🎂🥳",
  "On your special day, I genuinely wish that every single dream and wish you hold in your heart comes true, bringing you endless happiness, success, and peace. ✨💛",
  "Looking back at all the pure enjoyment we’ve had together—from the non-stop, random jokes that make us laugh till our stomachs hurt 😂🤣 to the unforgettable moments we spent around Lingaraj Temple soaking in the vibes 🛕🌸—every memory with you feels priceless.",
  "Life gets busy, but the comfort, madness, and genuine bond we share never fade. I truly feel so lucky to have a friend like you in my life who makes ordinary days extraordinary and always brings the best energy. 🫂💫",
  "May this year bless you with everything you deserve and more.",
  "Here’s to many more temple runs, endless laughter, and a lifetime of amazing memories ahead! 🎉🥂❤️"
];

export default function SpecialMessage({ onNext }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenLetter = () => {
    setIsOpen(true);
    sound.playChime();
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-6 select-none">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto text-center mb-4"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-xs font-bold text-[#8B4853] mb-2 shadow-xs">
          <Heart className="w-3.5 h-3.5 text-[#B76E79]" />
          <span>From One Good Friend to Another</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A3E3D] mb-1">
          A Special Message for My Good Friend 💗
        </h2>
      </motion.div>

      {/* Envelope / Letter Interactive Card */}
      {!isOpen ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md mx-auto my-6 p-8 bg-white border-2 border-rose-200 rounded-3xl text-center shadow-2xl flex flex-col items-center cursor-pointer group"
          onClick={handleOpenLetter}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-200 to-pink-100 flex items-center justify-center text-[#B76E79] shadow-inner mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-10 h-10 animate-bounce" />
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A3E3D] mb-2">
            A Handwritten Letter For You 💌
          </h3>
          <p className="text-sm text-[#7A5C61] mb-6">
            Tap below to open and read your personal birthday note.
          </p>

          <button
            onClick={handleOpenLetter}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <MailOpen className="w-4 h-4" />
            <span>Open Letter</span>
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl mx-auto bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border-2 border-rose-200 shadow-2xl relative overflow-hidden text-left"
        >
          {/* Subtle floral watermark corner */}
          <div className="absolute top-3 right-4 text-3xl opacity-20 pointer-events-none select-none">
            🌸
          </div>
          <div className="absolute bottom-3 left-4 text-3xl opacity-20 pointer-events-none select-none">
            🌷
          </div>

          {/* Letter Body */}
          <div className="space-y-4 font-serif leading-relaxed text-[#3D2C2E]">
            {PARAGRAPHS.map((para, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className={
                  idx === 0
                    ? "text-2xl sm:text-3xl font-extrabold text-[#8B4853] font-handwriting"
                    : idx === PARAGRAPHS.length - 1
                    ? "text-base sm:text-lg font-bold text-[#8B4853] pt-2"
                    : "text-base sm:text-lg text-[#3D2C2E] font-normal"
                }
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Signoff Ribbon */}
          <div className="mt-8 pt-6 border-t-2 border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs uppercase tracking-wider text-[#9B6B78] font-bold">
                True Friendship Always
              </span>
              <p className="font-handwriting text-2xl text-[#8B4853] font-bold">
                From your good friend ♡
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sound.playChime();
                onNext();
              }}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-sm shadow-md shadow-rose-300/40 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Time for Cake Cutting!</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
