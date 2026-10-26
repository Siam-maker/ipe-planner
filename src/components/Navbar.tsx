import React from 'react';
import { motion } from 'motion/react';
import { BookOpenCheck, Calculator, GraduationCap, Target } from 'lucide-react';
import { TabKey } from '../types';

interface NavbarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  topicProgressPct: number;
}

export const NAV_ITEMS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'syllabus', label: 'Syllabus', icon: BookOpenCheck },
  { key: 'marks', label: 'Marks & CT', icon: Calculator },
  { key: 'gpa', label: 'GPA Calculator', icon: GraduationCap },
  { key: 'target', label: 'Target Planner', icon: Target },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, topicProgressPct }) => {
  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav
        aria-label="Desktop primary navigation"
        className="hidden md:flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs mb-6"
      >
        <div className="flex items-center gap-1 w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={`relative flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex-1 text-center select-none whitespace-nowrap ${
                  isActive ? 'text-indigo-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveNavTab"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-indigo-50/90 border border-indigo-100 rounded-xl"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.key === 'syllabus' && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700">
                      {topicProgressPct}%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg"
      >
        <div className="grid grid-cols-4 gap-1 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all select-none ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNavIndicator"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    className="absolute inset-0 bg-indigo-50 rounded-xl"
                  />
                )}
                <span className="relative z-10 flex flex-col items-center">
                  <span className="relative">
                    <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 text-indigo-600' : 'text-slate-400'}`} />
                    {item.key === 'syllabus' && topicProgressPct > 0 && (
                      <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                        {topicProgressPct}%
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] leading-tight text-center truncate max-w-[76px]">
                    {item.key === 'syllabus'
                      ? 'Syllabus'
                      : item.key === 'marks'
                      ? 'Marks/CT'
                      : item.key === 'gpa'
                      ? 'GPA'
                      : 'Target'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
