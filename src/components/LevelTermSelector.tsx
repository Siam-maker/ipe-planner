import React, { useEffect } from 'react';
import { Layers, Calendar, X, Check } from 'lucide-react';

interface LevelTermSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  term: number;
  onSelectLevel: (lvl: number) => void;
  onSelectTerm: (t: number) => void;
  courseCount: number;
  totalCredits: number;
}

export const LevelTermSelector: React.FC<LevelTermSelectorProps> = ({
  isOpen,
  onClose,
  level,
  term,
  onSelectLevel,
  onSelectTerm,
  courseCount,
  totalCredits,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="term-switcher-title"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-[480px] rounded-t-3xl sm:rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="term-switcher-title" className="text-lg font-bold text-slate-900">
              Switch Academic Level &amp; Term
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Your saved progress for each term is kept separately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close term switcher"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Select Level</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((l) => {
              const isActive = level === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => onSelectLevel(l)}
                  className={`min-h-[48px] px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Level {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* Term Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Select Term</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2].map((t) => {
              const isActive = term === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onSelectTerm(t)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Term {t === 1 ? 'I' : 'II'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Done CTA */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-600">
            <strong className="text-slate-900">
              Level {level}, Term {term === 1 ? 'I' : 'II'}
            </strong>
            <span className="mx-1.5">·</span>
            <span className="font-mono">
              {courseCount} courses · {totalCredits} cr
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
