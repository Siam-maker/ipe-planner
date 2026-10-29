import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  AlertTriangle,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AppState } from '../types';
import { STUDENT_AVATARS, getAvatarById, AvatarGraphic } from '../data/avatars';

interface SettingsViewProps {
  state: AppState;
  onUpdateStudentName: (name: string) => void;
  onUpdateStudentAvatar: (avatarId: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetTerm: () => void;
  onResetAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateStudentName,
  onUpdateStudentAvatar,
  isDarkMode,
  onToggleDarkMode,
  onResetTerm,
  onResetAll,
}) => {
  const [nameInput, setNameInput] = useState(state.studentName || 'Adam');
  const [selectedAvatarId, setSelectedAvatarId] = useState(state.studentAvatar || 'boy-adam');
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'male' | 'female'>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<false | 'term' | 'all'>(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateStudentName(nameInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    onUpdateStudentAvatar(avatarId);
    setAvatarSuccess(true);
    setTimeout(() => setAvatarSuccess(false), 1800);
  };

  const filteredAvatars = STUDENT_AVATARS.filter((a) => {
    if (avatarFilter === 'all') return true;
    return a.gender === avatarFilter;
  });

  const currentAvatar = getAvatarById(selectedAvatarId);

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto min-w-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-[#C65D3B]" />
          <span>Settings &amp; Profile</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A199] mt-1">
          Customize your student identity, choose a personalized avatar, and manage study preferences.
        </p>
      </div>

      {/* Student Profile & Avatar Hero Card */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DF] dark:border-[#2E2924]">
          <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2">
            <User className="w-4 h-4 text-[#C65D3B]" />
            Student Identity
          </h3>
          {avatarSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5B6B4E] dark:text-[#8FA67C] animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Avatar Updated
            </span>
          )}
        </div>

        {/* Current Identity Showcase & Name Form */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-[#F2EEE6] dark:bg-[#1C1A18] p-4 rounded-2xl border border-[#E8E2D9] dark:border-[#2E2924]">
          <div className="relative shrink-0">
            <AvatarGraphic
              avatarId={selectedAvatarId}
              name={nameInput}
              size={68}
              className="w-16 h-16 sm:w-17 sm:h-17 ring-2 ring-[#C65D3B] dark:ring-[#C65D3B] shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 bg-[#C65D3B] text-white p-1 rounded-full text-[10px] shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          <form onSubmit={handleSaveName} className="flex-1 w-full space-y-2 min-w-0">
            <div className="flex items-center justify-between">
              <label htmlFor="student-name-input" className="text-xs font-semibold text-[#6E655F] dark:text-[#A8A199]">
                Display Name
              </label>
              <span className="text-[11px] text-[#6E655F] dark:text-[#A8A199]">
                Current: <strong className="text-[#2B2622] dark:text-white font-serif">{nameInput}</strong>
              </span>
            </div>
            
            <div className="flex gap-2">
              <input
                id="student-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Adam"
                className="flex-1 min-w-0 bg-[#FAF6F0] dark:bg-[#282420] text-[#2B2622] dark:text-[#EDE8E1] text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#E8E2D9] dark:border-[#38312B] focus:outline-hidden focus:ring-2 focus:ring-[#C65D3B]/25"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C65D3B] hover:bg-[#B34E2D] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-2xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Name</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#6E655F] dark:text-[#A8A199]">
              Appears on your dashboard greeting, term analytics, and top navigation.
            </p>
          </form>
        </div>

        {/* AVATAR PICKER SECTION */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B2622] dark:text-[#EDE8E1]">
                Choose Character Avatar
              </h4>
              <p className="text-[11px] text-[#6E655F] dark:text-[#A8A199]">
                Select from {STUDENT_AVATARS.length} handcrafted male and female academic avatars.
              </p>
            </div>

            {/* Filter Tabs: All / Boys / Girls */}
            <div className="flex items-center gap-1 bg-[#EBE4D8] dark:bg-[#1C1A18] p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAvatarFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  avatarFilter === 'all'
                    ? 'bg-[#C65D3B] text-white shadow-2xs'
                    : 'text-[#6E655F] dark:text-[#A8A199] hover:text-[#2B2622] dark:hover:text-white'
                }`}
              >
                All ({STUDENT_AVATARS.length})
              </button>
              <button
                type="button"
                onClick={() => setAvatarFilter('male')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  avatarFilter === 'male'
                    ? 'bg-[#C65D3B] text-white shadow-2xs'
                    : 'text-[#6E655F] dark:text-[#A8A199] hover:text-[#2B2622] dark:hover:text-white'
                }`}
              >
                Boys
              </button>
              <button
                type="button"
                onClick={() => setAvatarFilter('female')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  avatarFilter === 'female'
                    ? 'bg-[#C65D3B] text-white shadow-2xs'
                    : 'text-[#6E655F] dark:text-[#A8A199] hover:text-[#2B2622] dark:hover:text-white'
                }`}
              >
                Girls
              </button>
            </div>
          </div>

          {/* Clean Grid of Avatars - Icons only, no text underneath */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-3.5 pt-1.5">
            {filteredAvatars.map((av) => {
              const isSelected = selectedAvatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => handleSelectAvatar(av.id)}
                  title={`${av.name} · ${av.styleDesc}`}
                  className={`group relative flex items-center justify-center p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF6F0] dark:bg-[#2B2420] border-[#C65D3B] ring-2 ring-[#C65D3B]/40 shadow-sm scale-[1.04]'
                      : 'bg-[#F2EEE6] dark:bg-[#1C1A18] border-[#E8E2D9] dark:border-[#2E2924] hover:bg-[#EBE4D8] dark:hover:bg-[#28221D] hover:border-[#DCD3C5]'
                  }`}
                >
                  <div className="relative">
                    <AvatarGraphic
                      avatarId={av.id}
                      name={av.name}
                      size={52}
                      className="w-13 h-13 rounded-full shadow-2xs transition-transform group-hover:scale-105"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-[#C65D3B] text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
            <span>Warm Light (Paper)</span>
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
            <span>Warm Dark (Espresso)</span>
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
