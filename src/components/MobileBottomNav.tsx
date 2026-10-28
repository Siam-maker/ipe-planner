import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpenCheck,
  Calculator,
  MoreHorizontal,
  ChevronUp,
  Settings,
  BookMarked,
  Percent,
  Target,
  X,
} from 'lucide-react';
import { TabKey } from '../types';

interface BottomNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  topicProgressPct: number;
}

export const MobileBottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  topicProgressPct,
}) => {
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isDesktopMoreOpen, setIsDesktopMoreOpen] = useState(false);
  const desktopMoreRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMoreRef.current && !desktopMoreRef.current.contains(e.target as Node)) {
        setIsDesktopMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDesktopMoreOpen(false);
        setIsMobileMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile "More" drawer is open
  useEffect(() => {
    if (isMobileMoreOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isMobileMoreOpen]);

  const isHomeActive = activeTab === 'dashboard';
  const isCoursesActive = activeTab === 'courses';
  const isSyllabusActive = activeTab === 'syllabus';
  const isMarksActive = activeTab === 'marks';
  const isSecondaryActive =
    activeTab === 'gpa' || activeTab === 'target' || activeTab === 'resources' || activeTab === 'settings';

  const secondaryItems: { key: TabKey; label: string; desc: string; icon: typeof Percent }[] = [
    { key: 'gpa', label: 'GPA Calculator', desc: 'Project semester GPA & grades', icon: Percent },
    { key: 'target', label: 'Target Planner', desc: 'Calculate grades needed for target CGPA', icon: Target },
    { key: 'resources', label: 'Academic Regulations', desc: 'BUET ordinances, honors & grading rules', icon: BookMarked },
    { key: 'settings', label: 'Settings', desc: 'Preferences, dark mode & data reset', icon: Settings },
  ];

  const handleSelectMore = (tab: TabKey) => {
    onSelectTab(tab);
    setIsDesktopMoreOpen(false);
    setIsMobileMoreOpen(false);
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* PC / DESKTOP VIEW: Floating Bottom Navigation Dock (md+)      */}
      {/* ------------------------------------------------------------- */}
      <nav
        aria-label="Desktop bottom dock navigation"
        className="hidden md:flex fixed bottom-5 left-1/2 z-40 items-center gap-1.5 p-1.5 bg-[#FAF6F0]/90 dark:bg-[#221F1C]/90 backdrop-blur-xl border border-[#E2DACF] dark:border-[#3E3732] rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 animate-dock-enter select-none transition-all duration-300 hover:shadow-[#C65D3B]/10"
      >
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 ${
            isHomeActive
              ? 'bg-[#C65D3B] text-white shadow-md shadow-[#C65D3B]/25 scale-[1.02]'
              : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2D2825]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 shrink-0 ${isHomeActive ? 'text-white' : 'text-[#8C827A]'}`} />
          <span>Dashboard</span>
        </button>

        {/* Courses */}
        <button
          type="button"
          onClick={() => onSelectTab('courses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 ${
            isCoursesActive
              ? 'bg-[#C65D3B] text-white shadow-md shadow-[#C65D3B]/25 scale-[1.02]'
              : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2D2825]'
          }`}
        >
          <GraduationCap className={`w-4 h-4 shrink-0 ${isCoursesActive ? 'text-white' : 'text-[#8C827A]'}`} />
          <span>Courses</span>
        </button>

        {/* Syllabus */}
        <button
          type="button"
          onClick={() => onSelectTab('syllabus')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 ${
            isSyllabusActive
              ? 'bg-[#C65D3B] text-white shadow-md shadow-[#C65D3B]/25 scale-[1.02]'
              : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2D2825]'
          }`}
        >
          <BookOpenCheck className={`w-4 h-4 shrink-0 ${isSyllabusActive ? 'text-white' : 'text-[#8C827A]'}`} />
          <span>Syllabus</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono transition-colors ${
              isSyllabusActive
                ? 'bg-white/20 text-white'
                : 'bg-[#5B6B4E]/15 text-[#5B6B4E] dark:bg-[#738563]/25 dark:text-[#A3B899] border border-[#5B6B4E]/30'
            }`}
          >
            {topicProgressPct}%
          </span>
        </button>

        {/* Marks & Finals */}
        <button
          type="button"
          onClick={() => onSelectTab('marks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 ${
            isMarksActive
              ? 'bg-[#C65D3B] text-white shadow-md shadow-[#C65D3B]/25 scale-[1.02]'
              : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2D2825]'
          }`}
        >
          <Calculator className={`w-4 h-4 shrink-0 ${isMarksActive ? 'text-white' : 'text-[#8C827A]'}`} />
          <span>Marks &amp; Finals</span>
        </button>

        {/* Desktop "More" Menu with Upward Popover */}
        <div ref={desktopMoreRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDesktopMoreOpen(!isDesktopMoreOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 ${
              isSecondaryActive || isDesktopMoreOpen
                ? 'bg-[#C65D3B] text-white shadow-md shadow-[#C65D3B]/25 scale-[1.02]'
                : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2D2825]'
            }`}
          >
            <span>More</span>
            <ChevronUp
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isDesktopMoreOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDesktopMoreOpen && (
            <div className="absolute bottom-full mb-3 right-0 w-68 bg-[#FAF6F0] dark:bg-[#24201D] rounded-2xl shadow-2xl border border-[#E2DACF] dark:border-[#3E3732] p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C827A] font-mono">
                Additional Tools &amp; Options
              </div>
              <div className="space-y-1 mt-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectMore(item.key)}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#EBE4D8] dark:bg-[#2F2925] text-[#C65D3B] dark:text-[#E8B04A] font-semibold'
                          : 'hover:bg-[#EBE4D8]/70 dark:hover:bg-[#2E2824] text-[#2B2622] dark:text-[#E2DACF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-[#C65D3B] dark:text-[#E8B04A]' : 'text-[#8C827A]'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate leading-tight">{item.label}</div>
                        <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] truncate leading-tight mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE & TABLET VIEW: Fixed Bottom Bar (< md)                 */}
      {/* ------------------------------------------------------------- */}
      {/* "More" Bottom Sheet Modal for Mobile */}
      {isMobileMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="More navigation options">
          <div
            className="fixed inset-0 bg-[#2B2622]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsMobileMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-[#FAF6F0] dark:bg-[#24201D] rounded-t-3xl border-t border-[#E2DACF] dark:border-[#3E3732] p-4 sm:p-5 shadow-2xl z-10 space-y-3.5 animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2DACF] dark:border-[#3E3732]">
              <span className="text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA] uppercase tracking-wider font-mono">
                More Tools &amp; Options
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1.5 text-[#8C827A] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] rounded-lg cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectMore(item.key)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-left font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-[#EBE4D8] dark:bg-[#2E2824] border-[#C65D3B] text-[#C65D3B] dark:text-[#E8B04A]'
                        : 'bg-[#EBE4D8]/60 dark:bg-[#282320] border-[#E2DACF] dark:border-[#3E3732] text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#EBE4D8]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#C65D3B] dark:text-[#E8B04A] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Mobile (< md) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0]/95 dark:bg-[#1E1B18]/95 backdrop-blur-md border-t border-[#E2DACF] dark:border-[#3E3732] px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg transition-colors select-none"
      >
        <div className="grid grid-cols-5 gap-0.5 max-w-lg mx-auto">
          {/* Home */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isHomeActive
                ? 'text-[#C65D3B] dark:text-[#D96D4B] font-bold'
                : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 mb-0.5 ${isHomeActive ? 'text-[#C65D3B] dark:text-[#D96D4B]' : 'text-[#8C827A]'}`} />
            <span className="text-[10px] leading-tight truncate">Home</span>
          </button>

          {/* Courses */}
          <button
            type="button"
            onClick={() => onSelectTab('courses')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isCoursesActive
                ? 'text-[#C65D3B] dark:text-[#D96D4B] font-bold'
                : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
            }`}
          >
            <GraduationCap className={`w-5 h-5 mb-0.5 ${isCoursesActive ? 'text-[#C65D3B] dark:text-[#D96D4B]' : 'text-[#8C827A]'}`} />
            <span className="text-[10px] leading-tight truncate">Courses</span>
          </button>

          {/* Syllabus */}
          <button
            type="button"
            onClick={() => onSelectTab('syllabus')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isSyllabusActive
                ? 'text-[#C65D3B] dark:text-[#D96D4B] font-bold'
                : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
            }`}
          >
            <div className="relative">
              <BookOpenCheck className={`w-5 h-5 mb-0.5 ${isSyllabusActive ? 'text-[#C65D3B] dark:text-[#D96D4B]' : 'text-[#8C827A]'}`} />
              <span className="absolute -top-1 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-[#5B6B4E] text-[9px] font-bold text-white flex items-center justify-center font-mono">
                {topicProgressPct}%
              </span>
            </div>
            <span className="text-[10px] leading-tight truncate">Syllabus</span>
          </button>

          {/* Finals */}
          <button
            type="button"
            onClick={() => onSelectTab('marks')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isMarksActive
                ? 'text-[#C65D3B] dark:text-[#D96D4B] font-bold'
                : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
            }`}
          >
            <Calculator className={`w-5 h-5 mb-0.5 ${isMarksActive ? 'text-[#C65D3B] dark:text-[#D96D4B]' : 'text-[#8C827A]'}`} />
            <span className="text-[10px] leading-tight truncate">Finals</span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
              isSecondaryActive || isMobileMoreOpen
                ? 'text-[#C65D3B] dark:text-[#D96D4B] font-bold'
                : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 mb-0.5 ${isSecondaryActive || isMobileMoreOpen ? 'text-[#C65D3B] dark:text-[#D96D4B]' : 'text-[#8C827A]'}`} />
            <span className="text-[10px] leading-tight truncate">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
