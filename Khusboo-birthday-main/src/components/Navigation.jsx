import React from 'react';

const PAGES = [
  { id: 1, label: 'Countdown', icon: '🎀' },
  { id: 2, label: 'Password', icon: '🔒' },
  { id: 3, label: 'Balloons', icon: '🎈' },
  { id: 4, label: 'Bouquet', icon: '💐' },
  { id: 5, label: 'Moments', icon: '📸' },
  { id: 6, label: 'Message', icon: '💌' },
  { id: 7, label: 'Cake', icon: '🎂' },
  { id: 8, label: 'Goodbye', icon: '🌙' },
];

export default function Navigation({ currentPage, maxUnlockedPage, onSelectPage }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-rose-100/80 px-4 py-2 sm:py-3 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🎀</span>
          <span className="font-serif font-bold text-sm sm:text-base text-[#6B3B48]">
            Khusboo's 20th
          </span>
        </div>

        {/* Step Indicator Bubbles */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {PAGES.map((page) => {
            const isCurrent = currentPage === page.id;
            const isUnlocked = page.id <= maxUnlockedPage;

            return (
              <button
                key={page.id}
                onClick={() => {
                  if (isUnlocked) onSelectPage(page.id);
                }}
                disabled={!isUnlocked}
                title={`${page.label} (Page ${page.id})`}
                className={`relative px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-xs transition-all flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-[#B76E79] text-white font-bold shadow-md scale-105'
                    : isUnlocked
                    ? 'bg-rose-50 hover:bg-rose-100 text-[#8B4853]'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                }`}
              >
                <span>{page.icon}</span>
                <span className="hidden md:inline text-[11px] font-medium">
                  {page.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
