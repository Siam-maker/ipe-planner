import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { AppState } from '../types';
import ipeLogo from '../assets/ipe-logo.png';

interface HeaderProps {
  state: AppState;
  onResetTerm: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onResetTerm, onResetAll }) => {
  const [showConfirmModal, setShowConfirmModal] = useState<false | 'term' | 'all'>(false);

  return (
    <header className="mb-5">
      <div className="flex items-center justify-between gap-3 py-2">
        {/* Top Left: IPE BUET Logo and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs shrink-0 flex items-center justify-center">
            <img
              src={ipeLogo}
              alt="IPE BUET"
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-xl"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              IPE Study Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
              BUET · Department of Industrial &amp; Production Engineering
            </p>
          </div>
        </div>

        {/* Top Right: Reset Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowConfirmModal('term')}
            title="Reset current term progress"
            aria-label="Reset current term progress"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {showConfirmModal === 'term' ? 'Reset Current Term Progress?' : 'Reset All Progress?'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              {showConfirmModal === 'term'
                ? `This will clear checked topics, CT marks, attendance and estimated grades for Level ${state.level} Term ${state.term}.`
                : 'This will reset all data across all levels and terms to initial defaults.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              {showConfirmModal === 'term' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal('all');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                >
                  Reset All...
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (showConfirmModal === 'term') onResetTerm();
                  else onResetAll();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
