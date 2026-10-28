import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Moon,
  Sun,
  ChevronDown,
  User,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  X,
  Layers,
  LayoutDashboard,
  GraduationCap,
  BookOpenCheck,
  Calculator,
  Percent,
  Target,
  BookMarked,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Course, TabKey } from '../types';
import { AvatarGraphic } from '../data/avatars';
import ipeLogo from '../assets/ipe-logo.png';

interface TopHeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  topicProgressPct: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  studentName: string;
  studentAvatar?: string;
  courses: Course[];
  level: number;
  term: number;
  onSelectLevel: (lvl: number) => void;
  onSelectTerm: (t: number) => void;
  onSelectCourse: (courseCode: string) => void;
  onResetTerm: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  topicProgressPct,
  isDarkMode,
  onToggleDarkMode,
  studentName,
  studentAvatar = 'boy-adam',
  courses,
  level,
  term,
  onSelectLevel,
  onSelectTerm,
  onSelectCourse,
  onResetTerm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTermMenuOpen, setIsTermMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (termRef.current && !termRef.current.contains(target)) {
        setIsTermMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: {
      type: 'course' | 'topic';
      title: string;
      subtitle: string;
      courseCode: string;
    }[] = [];

    courses.forEach((c) => {
      if (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) {
        results.push({
          type: 'course',
          title: `${c.code} · ${c.name}`,
          subtitle: `${c.type === 'T' ? 'Theory' : 'Sessional'} · ${c.credits} Credits`,
          courseCode: c.code,
        });
      }

      c.topics.forEach((t) => {
        if (t.toLowerCase().includes(q)) {
          results.push({
            type: 'topic',
            title: t,
            subtitle: `${c.code} · ${c.name}`,
            courseCode: c.code,
          });
        }
      });
    });

    return results.slice(0, 5);
  }, [searchQuery, courses]);

  const initials = studentName
    ? studentName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AH';

  const primaryNavItems: { key: TabKey; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'courses', label: 'Courses', icon: GraduationCap },
    { key: 'syllabus', label: 'Syllabus', icon: BookOpenCheck, badge: `${topicProgressPct}%` },
    { key: 'marks', label: 'Marks & Finals', icon: Calculator },
  ];

  const extendedNavItems: { key: TabKey; label: string; icon: typeof Percent }[] = [
    { key: 'gpa', label: 'GPA Calc', icon: Percent },
    { key: 'target', label: 'Target', icon: Target },
  ];

  const secondaryNavItems: { key: TabKey; label: string; icon: typeof BookMarked; desc: string }[] = [
    { key: 'gpa', label: 'GPA Calculator', icon: Percent, desc: 'Project semester GPA & grades' },
    { key: 'target', label: 'Target Planner', icon: Target, desc: 'Calculate grades needed for target CGPA' },
    { key: 'resources', label: 'Academic Regulations', icon: BookMarked, desc: 'BUET ordinances, honors & grading' },
    { key: 'settings', label: 'Settings', icon: Settings, desc: 'Profile, preferences & data management' },
  ];

  const isSecondaryActive = activeTab === 'resources' || activeTab === 'settings' || activeTab === 'gpa' || activeTab === 'target';

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-15 bg-[#F5F1EA]/95 dark:bg-[#191715]/95 backdrop-blur-md border-b border-[#E2DACF] dark:border-[#3E3732] transition-colors">
      <div className="max-w-7xl mx-auto h-full px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 min-w-0 relative">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer text-left focus:outline-hidden min-w-0"
            title="Go to Dashboard"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EBE4D8] dark:bg-[#2B2622] p-1 flex items-center justify-center shrink-0 border border-[#DCD3C5] dark:border-[#423B35] group-hover:border-[#C65D3B]/40 transition-colors shadow-2xs">
              <img
                src={ipeLogo}
                alt="BUET IPE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-xs xs:text-sm sm:text-base text-[#2B2622] dark:text-[#F5F1EA] tracking-tight leading-tight group-hover:text-[#C65D3B] dark:group-hover:text-[#D96D4B] transition-colors truncate">
                  IPE Study Planner
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#EBE4D8] text-[#C65D3B] dark:bg-[#2E2824] dark:text-[#E8B04A] border border-[#DCD3C5] dark:border-[#4A413A] shrink-0 font-mono">
                  BUET
                </span>
              </div>
              <p className="text-[10px] text-[#6E655F] dark:text-[#A8A098] font-medium leading-none mt-0.5 hidden md:block truncate">
                Industrial &amp; Production Engineering
              </p>
            </div>
          </button>
        </div>

        {/* Center: Top nav removed - moved to elegant bottom dock for PC screen view */}

        {/* Right Zone: Search + Current Term Selector + Theme Toggle + Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          
          {/* Desktop Search Bar (xl+) */}
          <div ref={searchRef} className="relative hidden xl:block w-40 2xl:w-48">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search courses..."
                className="w-full bg-[#EBE4D8]/80 dark:bg-[#25221F] text-[#2B2622] dark:text-[#F5F1EA] placeholder-[#8C827A] text-xs pl-8 pr-7 py-1.5 rounded-lg border border-transparent focus:border-[#C65D3B] focus:bg-[#FAF6F0] dark:focus:bg-[#1F1C1A] focus:outline-hidden transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#2B2622] dark:hover:text-white p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full right-0 w-72 mt-1.5 bg-[#FAF6F0] dark:bg-[#24201D] rounded-xl shadow-xl border border-[#E2DACF] dark:border-[#3E3732] p-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#8C827A]">
                    No matching courses or topics found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onSelectCourse(item.courseCode);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-[#EBE4D8] dark:hover:bg-[#2E2824] flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="mt-0.5 text-[#C65D3B] dark:text-[#D96D4B] shrink-0">
                          {item.type === 'course' ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#2B2622] dark:text-[#F5F1EA] truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Toggle Button for <xl viewports */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="xl:hidden p-1.5 sm:p-2 text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2B2622] rounded-lg cursor-pointer transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Term Switcher Dropdown */}
          <div ref={termRef} className="relative">
            <button
              type="button"
              onClick={() => setIsTermMenuOpen(!isTermMenuOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#EBE4D8] dark:bg-[#25221F] hover:bg-[#E2D8C9] dark:hover:bg-[#2F2A26] border border-[#DCD3C5] dark:border-[#3E3732] text-[11px] sm:text-xs font-semibold text-[#2B2622] dark:text-[#F5F1EA] transition-colors cursor-pointer select-none shadow-2xs"
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C65D3B] dark:text-[#D96D4B] shrink-0" />
              <span className="hidden md:inline text-[#6E655F] dark:text-[#A8A098] font-normal">Term:</span>
              <span className="font-bold text-[#2B2622] dark:text-[#F5F1EA] whitespace-nowrap">L{level}-T{term}</span>
              <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#8C827A] transition-transform ${isTermMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTermMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-[#FAF6F0] dark:bg-[#24201D] rounded-2xl shadow-2xl border border-[#E2DACF] dark:border-[#3E3732] p-3 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A] mb-2 font-mono">
                  Academic Term Selection
                </div>

                {/* Level selector */}
                <div className="space-y-1 mb-2.5">
                  <span className="text-[11px] text-[#6E655F] dark:text-[#A8A098] font-medium">Select Level:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => onSelectLevel(l)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          level === l
                            ? 'bg-[#C65D3B] text-white shadow-xs'
                            : 'bg-[#EBE4D8] dark:bg-[#2D2825] text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#E2D8C9] dark:hover:bg-[#38322E]'
                        }`}
                      >
                        L-{l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term selector */}
                <div className="space-y-1">
                  <span className="text-[11px] text-[#6E655F] dark:text-[#A8A098] font-medium">Select Term:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1, 2].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          onSelectTerm(t);
                          setIsTermMenuOpen(false);
                        }}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          term === t
                            ? 'bg-[#C65D3B] text-white shadow-xs'
                            : 'bg-[#EBE4D8] dark:bg-[#2D2825] text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#E2D8C9] dark:hover:bg-[#38322E]'
                        }`}
                      >
                        {t === 1 ? 'Term I' : 'Term II'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 sm:p-2 text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] hover:bg-[#EBE4D8] dark:hover:bg-[#2B2622] rounded-lg cursor-pointer transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8B04A]" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-[#C65D3B]/40 transition-all cursor-pointer"
              aria-label="User Profile"
              title={`${studentName} · Click to customize avatar & settings`}
            >
              <AvatarGraphic
                avatarId={studentAvatar}
                name={studentName}
                size={30}
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 ring-1 ring-[#DCD3C5] dark:ring-[#453D36] shadow-xs"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#FAF6F0] dark:bg-[#24201D] rounded-2xl shadow-2xl border border-[#E2DACF] dark:border-[#3E3732] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E2DACF] dark:border-[#3E3732]">
                  <AvatarGraphic
                    avatarId={studentAvatar}
                    name={studentName}
                    size={38}
                    className="w-9.5 h-9.5 ring-1 ring-[#DCD3C5] dark:ring-[#453D36] shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA] truncate">
                      {studentName}
                    </div>
                    <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098]">
                      Level {level}, Term {term}
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-[#C65D3B] dark:text-[#E8B04A] hover:bg-[#EBE4D8] dark:hover:bg-[#2E2824] rounded-xl transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Change Avatar &amp; Name</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#EBE4D8] dark:hover:bg-[#2E2824] rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#8C827A]" />
                    <span>Settings &amp; Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onResetTerm();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Reset Term Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Overlay Bar for <xl viewports */}
      {isMobileSearchOpen && (
        <div className="xl:hidden px-3.5 pb-2.5 pt-1 border-t border-[#E2DACF] dark:border-[#3E3732] bg-[#F5F1EA]/98 dark:bg-[#191715]/98">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses or topics..."
              className="w-full bg-[#EBE4D8] dark:bg-[#25221F] text-[#2B2622] dark:text-[#F5F1EA] placeholder-[#8C827A] text-xs pl-8 pr-7 py-1.5 rounded-lg border border-transparent focus:border-[#C65D3B] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#2B2622] dark:hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <div className="mt-2 bg-[#FAF6F0] dark:bg-[#24201D] rounded-xl shadow-xl border border-[#E2DACF] dark:border-[#3E3732] p-2 max-h-56 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-2 text-center text-xs text-[#8C827A]">No results found</div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectCourse(item.courseCode);
                        setIsMobileSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#EBE4D8] dark:hover:bg-[#2E2824] flex items-start gap-2 text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#C65D3B] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[#2B2622] dark:text-[#F5F1EA] truncate">{item.title}</div>
                        <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] truncate">{item.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
