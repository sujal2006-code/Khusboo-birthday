import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingDecorations from './components/FloatingDecorations';
import AudioPlayer from './components/AudioPlayer';
import Countdown from './components/Countdown';
import PasswordScreen from './components/PasswordScreen';
import BalloonGame from './components/BalloonGame';
import FlowerBouquet from './components/FlowerBouquet';
import MemoryGallery from './components/MemoryGallery';
import SpecialMessage from './components/SpecialMessage';
import CakeCutting from './components/CakeCutting';
import PostCakeCelebration from './components/PostCakeCelebration';
import FinalMessage from './components/FinalMessage';
import OwnerControlPanel from './components/OwnerControlPanel';
import OwnerLoginModal from './components/OwnerLoginModal';
import { sound } from './utils/audioSynth';
import {
  validateStepLocally,
  getSavedLocalProgress,
  saveLocalProgress,
  clearLocalProgress,
  tryParseJsonResponse
} from './utils/progressGuard';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [maxUnlockedPage, setMaxUnlockedPage] = useState(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Authentication & Mode State
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  // Secret click counter for owner access trigger in footer
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef(null);
  const hasUserNavigatedRef = useRef(false);

  // 1. Initial Authentication & Guest Progress Verification
  useEffect(() => {
    const initApp = async () => {
      // Check for existing owner session in sessionStorage
      const savedOwnerToken = sessionStorage.getItem('khusboo_owner_token');
      if (savedOwnerToken) {
        try {
          const res = await fetch('/api/auth/owner-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: savedOwnerToken })
          });
          const data = await tryParseJsonResponse(res);
          if (data && data.isValid) {
            setIsOwnerMode(true);
          } else if (data) {
            sessionStorage.removeItem('khusboo_owner_token');
          }
        } catch (e) {
          console.error('Owner verify failed:', e);
        }
      }

      // Check verified guest progress via cryptographic token (with static-host fallback)
      const savedProgressToken = localStorage.getItem('khusboo_progress_token');
      if (savedProgressToken) {
        try {
          const res = await fetch('/api/progress/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ progressToken: savedProgressToken })
          });
          const data = await tryParseJsonResponse(res);
          if (hasUserNavigatedRef.current) return;

          if (data) {
            if (data.isValid) {
              const verified = Math.min(Math.max(data.maxUnlocked, 1), 9);
              setMaxUnlockedPage(verified);
              setCurrentPage(verified);
              saveLocalProgress(verified);
            } else {
              // Tampered token -> reset to step 1
              setMaxUnlockedPage(1);
              setCurrentPage(1);
              clearLocalProgress();
            }
          } else {
            const localStep = getSavedLocalProgress();
            setMaxUnlockedPage(localStep);
            setCurrentPage(localStep);
          }
        } catch (e) {
          if (hasUserNavigatedRef.current) return;
          const localStep = getSavedLocalProgress();
          setMaxUnlockedPage(localStep);
          setCurrentPage(localStep);
        }
      } else {
        const localStep = getSavedLocalProgress();
        if (localStep > 1 && !hasUserNavigatedRef.current) {
          setMaxUnlockedPage(localStep);
          setCurrentPage(localStep);
        }
      }
      setIsProgressLoaded(true);
    };

    initApp();
  }, []);

  // 2. Keyboard shortcut for Owner Access (Ctrl + Shift + O)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setIsLoginModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. URL Parameter & Hash Navigation Protection
  useEffect(() => {
    const handleUrlNavigation = () => {
      const search = window.location.search;
      const hash = window.location.hash;

      // Owner trigger in URL e.g. ?mode=owner or ?admin=true or #owner
      if (search.includes('owner') || search.includes('admin') || hash.includes('owner') || hash.includes('admin')) {
        if (!isOwnerMode) {
          setIsLoginModalOpen(true);
        }
      }

      // Check if user or guest attempts manual page navigation via URL
      if (!isProgressLoaded && !isOwnerMode) return;
      const pageMatch = hash.match(/page[=-]?(\d+)/i) || search.match(/page=(\d+)/i);
      if (pageMatch) {
        const requested = parseInt(pageMatch[1], 10);
        if (!isNaN(requested)) {
          if (isOwnerMode) {
            // Owner can open any page 1-9 directly
            setCurrentPage(Math.min(Math.max(requested, 1), 9));
          } else {
            // Guest is restricted to verified maxUnlockedPage
            if (requested > maxUnlockedPage) {
              // Block unauthorized jump and redirect to authorized step
              setCurrentPage(maxUnlockedPage);
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              setCurrentPage(Math.max(requested, 1));
            }
          }
        }
      }
    };

    handleUrlNavigation();
    window.addEventListener('popstate', handleUrlNavigation);
    window.addEventListener('hashchange', handleUrlNavigation);
    return () => {
      window.removeEventListener('popstate', handleUrlNavigation);
      window.removeEventListener('hashchange', handleUrlNavigation);
    };
  }, [isOwnerMode, maxUnlockedPage, isProgressLoaded]);

  // 4. Advance Page with Server Validation (and static-host fallback)
  const advanceToPage = async (targetPage, proof = {}) => {
    hasUserNavigatedRef.current = true;

    if (isOwnerMode) {
      // Owner Mode: instant access with all restrictions bypassed
      setCurrentPage(targetPage);
      if (targetPage > maxUnlockedPage) {
        setMaxUnlockedPage(targetPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Guest Mode: Allow revisiting already unlocked steps
    if (targetPage <= maxUnlockedPage) {
      setCurrentPage(targetPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const applyLocalFallback = () => {
      const localResult = validateStepLocally(targetPage, proof, maxUnlockedPage);
      if (localResult.allowed) {
        saveLocalProgress(localResult.maxUnlocked);
        setMaxUnlockedPage(localResult.maxUnlocked);
        setCurrentPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.warn('Step progression rejected:', localResult.error);
      }
    };

    // Guest Mode: Validate sequential step unlock with backend
    try {
      const res = await fetch('/api/progress/advance-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStep: targetPage,
          proof
        })
      });
      const data = await tryParseJsonResponse(res);

      if (data === null) {
        // Static deployment or API route unavailable: validate locally
        applyLocalFallback();
        return;
      }

      if (res.ok && data.success && data.progressToken) {
        localStorage.setItem('khusboo_progress_token', data.progressToken);
        saveLocalProgress(data.maxUnlocked);
        setMaxUnlockedPage(data.maxUnlocked);
        setCurrentPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.warn('Step progression rejected by server:', data.error);
      }
    } catch (err) {
      // Network error / offline / static host without backend
      applyLocalFallback();
    }
  };

  // 5. Owner Control Actions
  const handleOwnerLoginSuccess = (token) => {
    setIsOwnerMode(true);
    sound.playChime();
  };

  const handleExitOwnerMode = () => {
    sessionStorage.removeItem('khusboo_owner_token');
    setIsOwnerMode(false);
    // If owner was viewing a future page that guest hasn't unlocked yet, clamp back
    if (currentPage > maxUnlockedPage) {
      setCurrentPage(maxUnlockedPage);
    }
  };

  const handleResetGuestProgress = async () => {
    hasUserNavigatedRef.current = true;
    clearLocalProgress();
    try {
      const res = await fetch('/api/progress/reset', { method: 'POST' });
      const data = await tryParseJsonResponse(res);
      if (data && data.success && data.progressToken) {
        localStorage.setItem('khusboo_progress_token', data.progressToken);
      }
    } catch (e) {
      // Local progress already cleared above
    }
    setMaxUnlockedPage(1);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplay = () => {
    hasUserNavigatedRef.current = true;
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Discreet Easter Egg trigger: click 5 times on the footer watermark
  const handleFooterSecretClick = () => {
    clickCountRef.current += 1;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setIsLoginModalOpen(true);
      sound.playChime();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2500);
    }
  };

  const isNightPage = currentPage === 9;

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-between transition-colors duration-1000 ${
        isNightPage
          ? 'bg-gradient-to-b from-[#18122B] via-[#21163B] to-[#120B22] text-white selection:bg-purple-900'
          : 'bg-gradient-to-b from-[#FFF5F7] via-[#FBF7FF] to-[#FFF8F2] text-[#4A3E3D] selection:bg-rose-200'
      }`}
    >
      {/* Dreamy Ambient Background Flowers, Petals, Glows */}
      {!isNightPage && <FloatingDecorations />}

      {/* OWNER MODE: Dedicated Control Panel */}
      {isOwnerMode && (
        <OwnerControlPanel
          currentPage={currentPage}
          onSelectPage={(pageId) => {
            setCurrentPage(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onResetGuestProgress={handleResetGuestProgress}
          onExitOwnerMode={handleExitOwnerMode}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={() => {
            if (isMusicPlaying) {
              sound.stopBirthdayMusic();
              setIsMusicPlaying(false);
            } else {
              sound.playBirthdayMusic();
              setIsMusicPlaying(true);
            }
          }}
        />
      )}

      {/* Main Pages Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-2 py-4 sm:px-6">
        <AnimatePresence mode="wait">
          {/* Page 1: Birthday Countdown */}
          {currentPage === 1 && (
            <motion.div
              key="page-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Countdown
                onComplete={() => advanceToPage(2, { countdownComplete: true })}
                isOwner={isOwnerMode}
              />
            </motion.div>
          )}

          {/* Page 2: Birthday Year Password */}
          {currentPage === 2 && (
            <motion.div
              key="page-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <PasswordScreen
                onUnlock={(enteredPass) => advanceToPage(3, { password: enteredPass || '2006' })}
              />
            </motion.div>
          )}

          {/* Page 3: Balloon Popping (10 compliments) */}
          {currentPage === 3 && (
            <motion.div
              key="page-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <BalloonGame
                onNext={() => advanceToPage(4, { poppedCount: 10 })}
                isOwner={isOwnerMode}
              />
            </motion.div>
          )}

          {/* Page 4: Flower Bouquet Reveal (3D Parallax) */}
          {currentPage === 4 && (
            <motion.div
              key="page-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <FlowerBouquet
                onNext={() => advanceToPage(5, { bouquetComplete: true })}
              />
            </motion.div>
          )}

          {/* Page 5: Special Moments Polaroid Gallery */}
          {currentPage === 5 && (
            <motion.div
              key="page-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <MemoryGallery
                onNext={() => advanceToPage(6, { memoriesViewed: true })}
              />
            </motion.div>
          )}

          {/* Page 6: Handwritten Special Friendship Message */}
          {currentPage === 6 && (
            <motion.div
              key="page-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <SpecialMessage
                onNext={() => advanceToPage(7, { messageRead: true })}
              />
            </motion.div>
          )}

          {/* Page 7: 3D Birthday Cake Cutting */}
          {currentPage === 7 && (
            <motion.div
              key="page-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <CakeCutting
                onNext={() => advanceToPage(8, { cakeCut: true })}
                onMusicStart={() => setIsMusicPlaying(true)}
              />
            </motion.div>
          )}

          {/* Page 8: Post-Cake Grand Celebration (Congratulations, Jokes & Flower Rain) */}
          {currentPage === 8 && (
            <motion.div
              key="page-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <PostCakeCelebration
                onNext={() => advanceToPage(9, { celebrationComplete: true })}
              />
            </motion.div>
          )}

          {/* Page 9: Final Goodbye (Twilight Night Sky) */}
          {currentPage === 9 && (
            <motion.div
              key="page-9"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <FinalMessage onReplay={handleReplay} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Birthday Music Player */}
      <AudioPlayer isPlaying={isMusicPlaying} />

      {/* Footer watermark (includes secret trigger for owner login modal) */}
      <footer
        onClick={handleFooterSecretClick}
        className={`relative z-10 py-4 text-center text-xs select-none cursor-default transition-opacity ${
          isNightPage ? 'text-purple-300/60' : 'text-[#9B6B78]/70'
        }`}
        title={isOwnerMode ? 'Owner Mode Active' : ''}
      >
        <span>Crafted with happiness & appreciation for a wonderful friend 🌸</span>
        {isOwnerMode && (
          <span className="ml-2 inline-block text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
            OWNER MODE
          </span>
        )}
      </footer>

      {/* Owner Login Authentication Modal */}
      <OwnerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleOwnerLoginSuccess}
      />
    </div>
  );
}
