import React, { useMemo } from 'react';

export default function FloatingDecorations() {
  // Generate random petals, stars, and sparkles for a dreamy Pinterest aesthetic
  const petals = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.5 + Math.random() * 5) % 96}%`,
      top: `${(i * 6.5 + Math.random() * 8) % 94}%`,
      size: 16 + (i % 4) * 6,
      duration: 7 + (i % 5) * 2.5,
      delay: (i % 6) * 1.2,
      rotation: (i * 45) % 360,
      type: i % 3 === 0 ? '🌸' : i % 3 === 1 ? '✨' : '🌷',
      opacity: 0.35 + (i % 3) * 0.15
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft gradient ambient glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pastel-pink/30 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-pastel-lavender/35 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-pastel-peach/30 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />

      {/* Floating Petals and Sparkles */}
      {petals.map(p => (
        <span
          key={p.id}
          className="absolute select-none pointer-events-none transition-transform will-change-transform"
          style={{
            left: p.left,
            top: p.top,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`
          }}
        >
          {p.type}
        </span>
      ))}
    </div>
  );
}
