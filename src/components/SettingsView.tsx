import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { AppState } from '../types';

interface SettingsViewProps {
  state: AppState;
  onUpdateStudentName: (name: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetTerm: () => void;
  onResetAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateStudentName,
  isDarkMode,
  onToggleDarkMode,
  onResetTerm,
  onResetAll,
}) => {
  const [nameInput, setNameInput] = useState(state.studentName || 'Altaf Hossain');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<false | 'term' | 'all'>(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateStudentName(nameInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const initials = (nameInput || 'AH')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AH';

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto min-w-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-[#C65D3B]" />
          <span>Settings &amp; Profile</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A199] mt-1">
          Customize your student name, theme appearance, and academic data.
        </p>
      </div>

      {/* Student Profile Card */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2">
          <User className="w-4 h-4 text-[#C65D3B]" />
          Student Profile
        </h3>

        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C65D3B] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs">
            {initials}
          </div>

          <div className="flex-1 w-full space-y-1.5 min-w-0">
            <label htmlFor="student-name-input" className="text-xs font-semibold text-[#6E655F] dark:text-[#A8A199]">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                id="student-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Altaf Hossain"
                className="flex-1 min-w-0 bg-[#F2EEE6] dark:bg-[#1C1A18] text-[#2B2622] dark:text-[#EDE8E1] text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D9] dark:border-[#38312B] focus:outline-hidden focus:ring-2 focus:ring-[#C65D3B]/20"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C65D3B] hover:bg-[#B34E2D] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#6E655F] dark:text-[#A8A199]">
              Shown in greeting and top bar profile.
            </p>
          </div>
        </form>
      </div>

      {/* Theme Picker */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1]">
          Appearance Theme
        </h3>
        <p className="text-xs text-[#6E655F] dark:text-[#A8A199]">
          Choose a theme optimized for day or evening study sessions.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (isDarkMode) onToggleDarkMode();
            }}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              !isDarkMode
                ? 'bg-[#F2EEE6] border-[#C65D3B] text-[#C65D3B] shadow-2xs'
                : 'border-[#E8E2D9] dark:border-[#2E2924] text-[#6E655F] dark:text-[#A8A199] hover:bg-[#F2EEE6] dark:hover:bg-[#282420]'
            }`}
          >
            <Sun className="w-4 h-4 text-[#E8B04A]" />
            <span>Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isDarkMode) onToggleDarkMode();
            }}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-[#282420] border-[#C65D3B] text-[#E28364] shadow-2xs'
                : 'border-[#E8E2D9] dark:border-[#2E2924] text-[#6E655F] dark:text-[#A8A199] hover:bg-[#F2EEE6] dark:hover:bg-[#282420]'
            }`}
          >
            <Moon className="w-4 h-4 text-[#E28364]" />
            <span>Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Reset Academic Data */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#C65D3B] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Reset Academic Progress
        </h3>
        <p className="text-xs text-[#6E655F] dark:text-[#A8A199]">
          Clear topic checkboxes, entered CT marks, and estimated grades when beginning a new semester.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setConfirmModal('term')}
            className="px-4 py-2.5 rounded-xl border border-[#E8E2D9] dark:border-[#38312B] text-[#2B2622] dark:text-[#EDE8E1] hover:bg-[#F2EEE6] dark:hover:bg-[#282420] text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            Reset Level {state.level} Term {state.term} Only
          </button>

          <button
            type="button"
            onClick={() => setConfirmModal('all')}
            className="px-4 py-2.5 rounded-xl bg-[#C65D3B]/10 dark:bg-[#C65D3B]/20 text-[#A64525] dark:text-[#E28364] border border-[#C65D3B]/30 hover:bg-[#C65D3B]/20 text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            Reset All Terms
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2622]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF6F0] dark:bg-[#221F1C] rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-[#E8E2D9] dark:border-[#2E2924]">
            <div className="w-10 h-10 rounded-xl bg-[#C65D3B]/15 text-[#C65D3B] flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2B2622] dark:text-[#EDE8E1] mb-1">
              {confirmModal === 'term' ? 'Reset Current Term?' : 'Reset All Academic Data?'}
            </h3>
            <p className="text-xs text-[#6E655F] dark:text-[#A8A199] mb-5 leading-relaxed">
              {confirmModal === 'term'
                ? `This will clear checked topics, CT marks, attendance and estimated grades for Level ${state.level} Term ${state.term}.`
                : 'This will reset all data across all 8 terms to default.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6E655F] dark:text-[#A8A199] hover:bg-[#EBE4D8] dark:hover:bg-[#2E2924] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === 'term') onResetTerm();
                  else onResetAll();
                  setConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#C65D3B] hover:bg-[#B34E2D] active:scale-[0.98] rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
