import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ipeLogo from '../assets/ipe-logo.png';

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
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F1EA] dark:bg-[#191715] text-[#2B2622] dark:text-[#EDE8E1] cursor-pointer select-none px-4 paper-grain"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* IPE BUET Logo */}
            <div className="relative mb-5 p-3 bg-[#FAF6F0] dark:bg-[#221F1C] rounded-3xl shadow-sm border border-[#E8E2D9] dark:border-[#2E2924]">
              <img
                src={ipeLogo}
                alt="IPE BUET"
                className="w-28 sm:w-32 h-auto object-contain rounded-2xl"
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2B2622] dark:text-[#EDE8E1] mb-1 font-serif"
            >
              IPE Study Planner
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-xs sm:text-[13px] text-[#6E655F] dark:text-[#A8A199] font-semibold tracking-wider uppercase"
            >
              Bangladesh University of Engineering &amp; Technology
            </motion.p>

            {/* Terracotta to Amber Progress Track */}
            <div className="w-48 bg-[#EBE4D8] dark:bg-[#2E2924] rounded-full h-1.5 mt-6 overflow-hidden p-0.5 border border-[#E8E2D9] dark:border-[#38312B]">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-[#C65D3B] via-[#D97945] to-[#E8B04A] rounded-full"
              />
            </div>

            <span className="text-[11px] text-[#6E655F] dark:text-[#A8A199] mt-3 font-medium">
              Tap anywhere to continue
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
