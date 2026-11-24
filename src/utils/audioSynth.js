// Web Audio API Synthesizer for high quality interactive sound effects and cheerful birthday music box

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.musicPlaying = false;
    this.musicTimeout = null;
    this.volume = 0.7;
    this.isMuted = false;
    this.currentNoteOscs = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Play a soft sparkle / pop sound when balloon bursts
  playPop() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      // White noise burst
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(3, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(t);

      // Sweet chime tone on top
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25 + Math.random() * 200, t);
      oscGain.gain.setValueAtTime(0.25 * this.volume, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.warn("Audio pop error:", e);
    }
  }

  // Sparkle / chime sound for unlocking / bloom
  playChime() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const notes = [587.33, 659.25, 880, 1046.5]; // D5, E5, A5, C6
      const t = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);
        gain.gain.setValueAtTime(0.2 * this.volume, t + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.65);
      });
    } catch (e) {
      console.warn("Chime error:", e);
    }
  }

  // Sound when cake knife cuts
  playSlice() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.35);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t);

      gain.gain.setValueAtTime(0.3 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch (e) {
      console.warn("Slice error:", e);
    }
  }

  // Play a gentle playful error buzz
  playError() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      [220, 180].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.18 * this.volume, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + (idx + 1) * 0.12);
      });
    } catch (e) {
      console.warn("Error cue sound failed:", e);
    }
  }

  // Cheerful music-box rendition of "Happy Birthday To You"
  // Notes in Key of F major:
  // C4, C4, D4, C4, F4, E4
  // C4, C4, D4, C4, G4, F4
  // C4, C4, C5, A4, F4, E4, D4
  // Bb4, Bb4, A4, F4, G4, F4
  playBirthdayMusic() {
    this.init();
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    const melody = [
      // phrase 1
      { note: 'C4', dur: 0.35, pause: 0.1 },
      { note: 'C4', dur: 0.25, pause: 0.05 },
      { note: 'D4', dur: 0.6, pause: 0.1 },
      { note: 'C4', dur: 0.6, pause: 0.1 },
      { note: 'F4', dur: 0.6, pause: 0.1 },
      { note: 'E4', dur: 1.1, pause: 0.3 },
      // phrase 2
      { note: 'C4', dur: 0.35, pause: 0.1 },
      { note: 'C4', dur: 0.25, pause: 0.05 },
      { note: 'D4', dur: 0.6, pause: 0.1 },
      { note: 'C4', dur: 0.6, pause: 0.1 },
      { note: 'G4', dur: 0.6, pause: 0.1 },
      { note: 'F4', dur: 1.1, pause: 0.3 },
      // phrase 3
      { note: 'C4', dur: 0.35, pause: 0.1 },
      { note: 'C4', dur: 0.25, pause: 0.05 },
      { note: 'C5', dur: 0.6, pause: 0.1 },
      { note: 'A4', dur: 0.6, pause: 0.1 },
      { note: 'F4', dur: 0.5, pause: 0.1 },
      { note: 'E4', dur: 0.5, pause: 0.1 },
      { note: 'D4', dur: 1.0, pause: 0.3 },
      // phrase 4
      { note: 'Bb4', dur: 0.35, pause: 0.1 },
      { note: 'Bb4', dur: 0.25, pause: 0.05 },
      { note: 'A4', dur: 0.6, pause: 0.1 },
      { note: 'F4', dur: 0.6, pause: 0.1 },
      { note: 'G4', dur: 0.6, pause: 0.1 },
      { note: 'F4', dur: 1.4, pause: 0.8 },
    ];

    const freqMap = {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'Bb4': 466.16,
      'C5': 523.25,
      'D5': 587.33,
      'F5': 698.46
    };

    const playLoop = () => {
      if (!this.musicPlaying || !this.ctx) return;
      let timeOffset = 0;

      melody.forEach(item => {
        const freq = freqMap[item.note];
        if (freq) {
          const timeout = setTimeout(() => {
            if (!this.musicPlaying || !this.ctx || this.isMuted) return;
            this.playMusicBoxNote(freq, item.dur);
          }, timeOffset * 1000);
          this.currentNoteOscs.push(timeout);
        }
        timeOffset += item.dur + item.pause;
      });

      // Loop after complete melody
      this.musicTimeout = setTimeout(() => {
        if (this.musicPlaying) {
          playLoop();
        }
      }, (timeOffset + 1.2) * 1000);
    };

    playLoop();
  }

  playMusicBoxNote(freq, dur) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Dual oscillator for rich music box bell sheen
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      // bell harmonic overtone (3rd or 4th)
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 3.01, t);

      const noteVol = 0.28 * this.volume;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(noteVol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.85);
      osc2.stop(t + dur + 0.85);
    } catch (e) {
      console.warn("Music note error:", e);
    }
  }

  stopBirthdayMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    this.currentNoteOscs.forEach(t => clearTimeout(t));
    this.currentNoteOscs = [];
  }
}

export const sound = new SoundEngine();
