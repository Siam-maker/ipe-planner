import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '1', desc: 'Go to Syllabus & Dashboard' },
  { key: '2', desc: 'Go to Planner & Study Timer' },
  { key: '3', desc: 'Go to Marks & CT Calculator' },
  { key: '4', desc: 'Go to GPA Calculator' },
  { key: '5', desc: 'Go to Target & Reverse CGPA' },
  { key: '/', orKey: 'Ctrl + K', desc: 'Focus course / topic search' },
  { key: 'N', desc: 'Quick note / scratchpad' },
  { key: '?', desc: 'Show this keyboard shortcuts cheat-sheet' },
  { key: 'Esc', desc: 'Close open dialog or search' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
          {/* Backdrop click */}
          <div
            className="fixed inset-0"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Box: Bottom Sheet on Mobile, Centered Modal on Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full sm:max-w-[520px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Keyboard Shortcuts</h3>
                  <p className="text-[11px] text-slate-500">Navigate faster on desktop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close shortcuts modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of shortcuts */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
              {SHORTCUTS.map((sc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-indigo-50/30 transition-colors"
                >
                  <span className="text-xs sm:text-sm text-slate-700 font-medium">{sc.desc}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <kbd className="px-2 py-1 text-xs font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-2xs">
                      {sc.key}
                    </kbd>
                    {sc.orKey && (
                      <>
                        <span className="text-[11px] text-slate-400">or</span>
                        <kbd className="px-2 py-1 text-xs font-mono font-bold bg-white text-slate-800 border border-slate-300 rounded-md shadow-2xs">
                          {sc.orKey}
                        </kbd>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-700">Esc</kbd> anytime to dismiss dialogs.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
