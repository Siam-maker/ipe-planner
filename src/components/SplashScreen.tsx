import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if ?autostart=1 is provided to skip splash immediately
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={handleDismiss}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 cursor-pointer select-none px-4"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* IPE BUET Logo */}
            <div className="relative mb-5 p-2.5 bg-white rounded-3xl shadow-lg border border-slate-200/80">
              <img
                src="/assets/aistudio/Screenshot_2026-10-26_123419_4d074acd.png"
                alt="IPE BUET"
                className="w-28 sm:w-32 h-auto object-contain rounded-2xl"
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.25 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1"
            >
              IPE Study Planner
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.25 }}
              className="text-xs sm:text-[13px] text-slate-500 font-semibold tracking-wide uppercase"
            >
              Bangladesh University of Engineering &amp; Technology
            </motion.p>

            {/* Logo-matched Gold to BUET Maroon Progress Bar (No purple) */}
            <div className="w-48 bg-slate-100 rounded-full h-1.5 mt-5 overflow-hidden p-0.5 border border-slate-200/70">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-rose-700 rounded-full"
              />
            </div>

            <span className="text-[11px] text-slate-400 mt-3 font-medium">
              Tap anywhere to continue
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
