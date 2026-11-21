import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc3, Sparkles } from 'lucide-react';
import { sound } from '../utils/audioSynth';

export default function AudioPlayer({ isPlaying, onTogglePlay }) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    sound.setVolume(volume / 100);
  }, [volume]);

  const handleToggleMute = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0 && !muted) {
      sound.toggleMute();
      setMuted(true);
    } else if (val > 0 && muted) {
      sound.toggleMute();
      setMuted(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* Expanded Volume Slider Bar */}
      {showControls && (
        <div className="glass-panel px-3 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom duration-300">
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 accent-[#B76E79] bg-rose-200 rounded-lg cursor-pointer"
            title="Music Volume"
          />
          <span className="text-xs text-[#7A5C61] font-medium w-7 text-right">
            {muted ? '0%' : `${volume}%`}
          </span>
        </div>
      )}

      {/* Main floating pill */}
      <div className="glass-panel-gold pl-3 pr-2 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-rose-200/80">
        <button
          onClick={() => setShowControls(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8B4853] hover:text-[#B76E79] transition-colors"
          title="Birthday Music Box"
        >
          <Disc3 className={`w-4 h-4 text-[#B76E79] ${isPlaying && !muted ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline font-handwriting text-base">Birthday Chimes</span>
        </button>

        <button
          onClick={handleToggleMute}
          className="p-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-[#8B4853] transition-colors"
          title={muted ? 'Unmute Birthday Melody' : 'Mute Music'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#B76E79]" />}
        </button>
      </div>
    </div>
  );
}
