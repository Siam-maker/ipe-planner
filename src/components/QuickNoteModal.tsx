import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Check } from 'lucide-react';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  term: number;
  noteContent: string;
  onSaveNote: (content: string) => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  level,
  term,
  noteContent,
  onSaveNote,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

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
          <div
            className="fixed inset-0"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal: Bottom sheet on mobile, Centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 35 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full sm:max-w-[540px] bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Quick Scratchpad Note
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Level {level}, Term {term === 1 ? 'I' : 'II'} · Auto-saved locally
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close notes modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={8}
              value={noteContent}
              onChange={(e) => onSaveNote(e.target.value)}
              placeholder="Jot down formulas, exam dates, CT syllabus reminders, or study goals for this term (press Esc to close)..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
            />

            <div className="flex items-center justify-between pt-3 mt-2 text-xs text-slate-500 border-t border-slate-100">
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Auto-saved to browser storage
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
