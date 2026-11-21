import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ArrowRight, Camera, Sparkles, Heart } from 'lucide-react';
import { sound } from '../utils/audioSynth';

// All 6 photographs provided by the user with authentic friendship captions
const PHOTOS = [
  {
    id: 1,
    url: '/photos/photo1.jpg',
    caption: 'Ancient arches & peaceful vibes 🛕✨',
    subtitle: 'Classic elegance at the heritage steps',
    rotation: '-2deg'
  },
  {
    id: 2,
    url: '/photos/photo2.jpg',
    caption: 'Jhumkas & camera frames 📸🌸',
    subtitle: 'Capturing aesthetic smiles and little moments',
    rotation: '2.5deg'
  },
  {
    id: 3,
    url: '/photos/photo3.jpg',
    caption: 'Vibrant colors & palace steps 🏰🌷',
    subtitle: 'Bright sunny days filled with peaceful energy',
    rotation: '-1.5deg'
  },
  {
    id: 4,
    url: '/photos/photo4.jpg',
    caption: 'Evening cafe talks & green cozy vibes ☕🌿',
    subtitle: 'The best random conversations that make hours fly by',
    rotation: '2deg'
  },
  {
    id: 5,
    url: '/photos/photo5.jpg',
    caption: 'Road trip laughter & squad madness 🚗✌️',
    subtitle: 'Non-stop jokes that made our stomachs hurt with laughing!',
    rotation: '-2deg'
  },
  {
    id: 6,
    url: '/photos/photo6.jpg',
    caption: 'Lingaraj Temple vibes with the best gang! 🛕🌸',
    subtitle: 'Unforgettable temple runs, laughter, and lifelong memories',
    rotation: '1.5deg'
  }
];

export default function MemoryGallery({ onNext }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const openLightbox = (index) => {
    setSelectedPhotoIndex(index);
    sound.playChime();
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = (e) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev + 1) % PHOTOS.length);
  };

  const prevPhoto = (e) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-start px-4 py-8 select-none">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-purple-100 text-xs font-semibold text-[#6B4B70] mb-2">
          <Camera className="w-3.5 h-3.5 text-[#B76E79]" />
          <span>Scrapbook of Memories</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A3E3D] mb-2">
          Special Moments of Yours 📸
        </h2>
        <p className="text-base sm:text-lg text-[#7A5C61] font-light">
          Some memories are too special to be forgotten!
        </p>
      </motion.div>

      {/* Polaroid Grid Layout */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 sm:px-6 mb-10">
        {PHOTOS.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.03, rotate: 0 }}
            onClick={() => openLightbox(index)}
            className="cursor-pointer group"
            style={{ transform: `rotate(${photo.rotation})` }}
          >
            {/* Polaroid Frame */}
            <div className="bg-white p-4 pb-6 rounded-2xl shadow-lg border border-pink-100/80 transition-all duration-300 group-hover:shadow-2xl group-hover:border-rose-200 relative">
              {/* Cute Washi Tape at Top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-pastel-pink/80 border border-white/60 shadow-xs backdrop-blur-xs rounded-xs rotate-1" />

              {/* Photo Image Container */}
              <div className="w-full h-72 sm:h-80 overflow-hidden rounded-xl bg-rose-50 relative">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-xs text-white font-medium bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Click to view full photo ✨
                  </span>
                </div>
              </div>

              {/* Polaroid Caption */}
              <div className="mt-4 px-1 text-center">
                <h3 className="font-handwriting text-xl text-[#6B3B48] font-bold">
                  {photo.caption}
                </h3>
                <p className="text-xs text-[#8A6A72] mt-0.5 line-clamp-1">
                  {photo.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Display Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[#8B4853] font-handwriting text-2xl sm:text-3xl font-semibold text-center max-w-xl mx-auto mb-8 px-4"
      >
        "Every picture has a story, and every memory has its own special place. ♡"
      </motion.p>

      {/* Next Arrow */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          sound.playChime();
          onNext();
        }}
        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-base shadow-lg shadow-rose-300/50 flex items-center gap-2 hover:shadow-xl transition-all mb-4"
      >
        <span>Read A Special Message</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-50"
              title="Close image"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-50"
              title="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors z-50"
              title="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image & Caption Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl max-h-[90vh] flex flex-col items-center bg-white p-3 sm:p-5 rounded-3xl shadow-2xl overflow-hidden"
            >
              <img
                src={PHOTOS[selectedPhotoIndex].url}
                alt={PHOTOS[selectedPhotoIndex].caption}
                className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
              />
              <div className="text-center mt-3 px-4">
                <h4 className="font-handwriting text-2xl text-[#8B4853] font-bold">
                  {PHOTOS[selectedPhotoIndex].caption}
                </h4>
                <p className="text-sm text-[#7A5C61] mt-0.5">
                  {PHOTOS[selectedPhotoIndex].subtitle}
                </p>
                <span className="text-xs text-[#9B6B78] mt-1 inline-block">
                  {selectedPhotoIndex + 1} of {PHOTOS.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
