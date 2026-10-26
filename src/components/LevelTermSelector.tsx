import React from 'react';
import { motion } from 'motion/react';
import { Layers, Calendar } from 'lucide-react';

interface LevelTermSelectorProps {
  level: number;
  term: number;
  onSelectLevel: (lvl: number) => void;
  onSelectTerm: (t: number) => void;
  courseCount: number;
  totalCredits: number;
}

export const LevelTermSelector: React.FC<LevelTermSelectorProps> = ({
  level,
  term,
  onSelectLevel,
  onSelectTerm,
  courseCount,
  totalCredits,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Level Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <span className="hidden xs:inline-flex items-center text-xs font-semibold text-slate-500 pl-2 pr-1.5">
              <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Level
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((l) => {
                const isActive = level === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onSelectLevel(l)}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors select-none ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeLevelPill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 bg-indigo-600 rounded-lg shadow-xs"
                      />
                    )}
                    <span className="relative z-10">L-{l}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Term Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <span className="hidden xs:inline-flex items-center text-xs font-semibold text-slate-500 pl-2 pr-1.5">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Term
            </span>
            <div className="flex items-center gap-1">
              {[1, 2].map((t) => {
                const isActive = term === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onSelectTerm(t)}
                    className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors select-none ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTermPill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 bg-indigo-600 rounded-lg shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{t === 1 ? 'Term I' : 'Term II'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Term Info Summary */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 px-0.5">
          <span className="font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
            Level {level}, Term {term === 1 ? 'I' : 'II'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">{courseCount}</span> courses
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-800">{totalCredits}</span> credits
          </span>
        </div>
      </div>
    </div>
  );
};
