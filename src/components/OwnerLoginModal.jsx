import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, X, Sparkles, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { tryParseJsonResponse } from '../utils/progressGuard';

export default function OwnerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter your owner master password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });
      const data = await tryParseJsonResponse(res);

      if (!data) {
        sound.playError();
        setErrorMsg('Owner login requires the backend server.');
        return;
      }

      if (data.success && data.token) {
        sound.playChime();
        sessionStorage.setItem('khusboo_owner_token', data.token);
        onLoginSuccess(data.token);
        setPassword('');
        setErrorMsg('');
        onClose();
      } else {
        sound.playError();
        setErrorMsg(data.error || 'Incorrect owner password. Access denied.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
      }
    } catch (err) {
      sound.playError();
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: isShaking ? [0, -12, 12, -8, 8, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B76E79] to-[#D88A96] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#4A3E3D] flex items-center gap-1.5">
                <span>Owner Authentication</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-[#8B4853] font-sans font-bold">
                  Admin
                </span>
              </h3>
              <p className="text-xs text-[#7A5C61]">
                Website Creator Master Access Control
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-6 bg-rose-50/70 p-3 rounded-2xl border border-rose-100">
            Enter your secret creator password to unlock full administrator privileges and immediate access to all 9 pages.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#6B3B48] uppercase tracking-wider mb-2">
                Owner Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-[#B76E79]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter creator password..."
                  autoFocus
                  className="w-full pl-10 pr-12 py-3 rounded-2xl bg-white border border-rose-200 text-[#4A3E3D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B76E79] focus:border-transparent text-sm shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white text-xs font-bold shadow-lg shadow-rose-300/40 hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : 'Unlock Owner Mode'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
