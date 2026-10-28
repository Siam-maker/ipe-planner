import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  BookOpen,
  Calculator,
  Percent,
  Flame,
  Droplets,
  Cog,
  Binary,
  Compass,
  Atom,
  FlaskConical,
  Target,
} from 'lucide-react';
import { Course, TabKey } from '../types';
import { getTopicKey } from '../data/curriculum';
import { Footer } from './Footer';

interface DashboardViewProps {
  level: number;
  term: number;
  courses: Course[];
  doneTopics: Record<string, boolean>;
  onSelectTab: (tab: TabKey) => void;
  onSelectCourse: (courseCode: string) => void;
  studentName: string;
}

// Icon mapper for courses with cohesive earthy editorial color grading
function getCourseIcon(code: string, name: string) {
  const text = `${code} ${name}`.toLowerCase();
  if (text.includes('thermo') || text.includes('heat')) {
    return { Icon: Flame, color: 'text-[#C65D3B] bg-[#EBE4D8] dark:bg-[#2F2722] border-[#DCD3C5] dark:border-[#423932]' };
  }
  if (text.includes('fluid')) {
    return { Icon: Droplets, color: 'text-[#3D5A80] bg-[#EBE4D8] dark:bg-[#232A33] border-[#DCD3C5] dark:border-[#35414F]' };
  }
  if (text.includes('mechanic') || text.includes('machine') || text.includes('shop')) {
    return { Icon: Cog, color: 'text-[#5B6B4E] bg-[#EBE4D8] dark:bg-[#242A21] border-[#DCD3C5] dark:border-[#394235]' };
  }
  if (text.includes('math') || text.includes('calculus')) {
    return { Icon: Compass, color: 'text-[#C65D3B] bg-[#EBE4D8] dark:bg-[#2F2722] border-[#DCD3C5] dark:border-[#423932]' };
  }
  if (text.includes('physics') || text.includes('matter')) {
    return { Icon: Atom, color: 'text-[#3D5A80] bg-[#EBE4D8] dark:bg-[#232A33] border-[#DCD3C5] dark:border-[#35414F]' };
  }
  if (text.includes('chem')) {
    return { Icon: FlaskConical, color: 'text-[#E8B04A] bg-[#EBE4D8] dark:bg-[#2F2A1E] border-[#DCD3C5] dark:border-[#473E28]' };
  }
  if (text.includes('program') || text.includes('computer')) {
    return { Icon: Binary, color: 'text-[#5B6B4E] bg-[#EBE4D8] dark:bg-[#242A21] border-[#DCD3C5] dark:border-[#394235]' };
  }
  return { Icon: BookOpen, color: 'text-[#C65D3B] bg-[#EBE4D8] dark:bg-[#2F2722] border-[#DCD3C5] dark:border-[#423932]' };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  level,
  term,
  courses,
  doneTopics,
  onSelectTab,
  onSelectCourse,
  studentName,
}) => {
  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Compute curriculum stats
  const { totalTopics, completedTopics, remainingTopics, percentage } = useMemo(() => {
    let total = 0;
    let completed = 0;
    courses.forEach((c) => {
      total += c.topics.length;
      c.topics.forEach((_, idx) => {
        const key = getTopicKey(level, term, c.code, idx);
        if (doneTopics[key]) completed++;
      });
    });
    return {
      totalTopics: total,
      completedTopics: completed,
      remainingTopics: Math.max(0, total - completed),
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [courses, level, term, doneTopics]);

  // Total credits and breakdown
  const { totalCredits, theoryCount, sessionalCount } = useMemo(() => {
    const cr = Math.round(courses.reduce((sum, c) => sum + c.credits, 0) * 100) / 100;
    const th = courses.filter((c) => c.type === 'T').length;
    const ses = courses.filter((c) => c.type === 'S').length;
    return { totalCredits: cr, theoryCount: th, sessionalCount: ses };
  }, [courses]);

  // Course progress data
  const coursesData = useMemo(() => {
    return courses.map((course) => {
      const total = course.topics.length;
      let completed = 0;
      course.topics.forEach((_, idx) => {
        const k = getTopicKey(level, term, course.code, idx);
        if (doneTopics[k]) completed++;
      });
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const { Icon, color } = getCourseIcon(course.code, course.name);
      return {
        course,
        total,
        completed,
        pct,
        Icon,
        color,
      };
    });
  }, [courses, level, term, doneTopics]);

  // Donut SVG circumference calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#F5F1EA] flex items-center gap-2">
            <span>{greeting}, {studentName.split(' ')[0]}!</span>
            <span className="text-xl sm:text-2xl" role="img" aria-label="Waving hand">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A098] mt-0.5">
            Keep going! You&rsquo;re making steady academic progress.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBE4D8] dark:bg-[#2B2622] text-[#C65D3B] dark:text-[#E8B04A] border border-[#DCD3C5] dark:border-[#3E3832] font-mono shadow-2xs">
            Level {level}, Term {term === 1 ? 'I' : 'II'}
          </span>
        </div>
      </div>

      {/* TOP PROGRESS & METRIC CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Main Syllabus Progress Card with Donut Chart */}
        <div className="md:col-span-2 bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            {/* Donut Progress Ring with Terracotta Stroke */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-[#EBE4D8] dark:stroke-[#312B26]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-[#C65D3B] dark:stroke-[#D96D4B] transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm sm:text-base font-extrabold font-mono text-[#2B2622] dark:text-[#F5F1EA] tabular-nums">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Label & Details */}
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] truncate">
                Syllabus Progress
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6E655F] dark:text-[#A8A098] mt-0.5">
                <span className="font-mono font-semibold text-[#2B2622] dark:text-[#F5F1EA]">{completedTopics}</span> / {totalTopics} topics
              </p>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#5B6B4E]/15 dark:bg-[#738563]/25 text-[#5B6B4E] dark:text-[#A3B899] border border-[#5B6B4E]/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B6B4E]" />
                  {percentage >= 75 ? 'Ahead of Schedule' : percentage >= 20 ? 'On track' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('syllabus')}
            className="flex items-center gap-1 text-xs font-semibold text-[#C65D3B] dark:text-[#D96D4B] hover:text-[#A84B2E] shrink-0 cursor-pointer"
          >
            <span className="hidden xs:inline">Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Compact Metric Cards: Completed (Sage), Remaining (Mustard), Total (Dusty Blue) */}
        <div className="md:col-span-2 grid grid-cols-3 gap-2 sm:gap-3.5 min-w-0">
          {/* Completed Card */}
          <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#5B6B4E]/15 text-[#5B6B4E] dark:bg-[#738563]/25 dark:text-[#A3B899] flex items-center justify-center border border-[#5B6B4E]/30 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#6E655F] dark:text-[#A8A098] truncate">
                Completed
              </div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#2B2622] dark:text-[#F5F1EA] mt-0.5 tabular-nums">
                {completedTopics}
              </div>
              <div className="text-[10px] text-[#8C827A] truncate font-mono">topics</div>
            </div>
          </div>

          {/* Remaining Card */}
          <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#E8B04A]/20 text-[#B88425] dark:bg-[#E8B04A]/25 dark:text-[#F0BC59] flex items-center justify-center border border-[#E8B04A]/30 mb-1.5">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#6E655F] dark:text-[#A8A098] truncate">
                Remaining
              </div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#2B2622] dark:text-[#F5F1EA] mt-0.5 tabular-nums">
                {remainingTopics}
              </div>
              <div className="text-[10px] text-[#8C827A] truncate font-mono">topics</div>
            </div>
          </div>

          {/* Total Card */}
          <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3D5A80]/15 text-[#3D5A80] dark:bg-[#3D5A80]/25 dark:text-[#88A9CB] flex items-center justify-center border border-[#3D5A80]/30 mb-1.5">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#6E655F] dark:text-[#A8A098] truncate">
                Total
              </div>
              <div className="text-base sm:text-xl font-bold font-mono text-[#2B2622] dark:text-[#F5F1EA] mt-0.5 tabular-nums">
                {totalTopics}
              </div>
              <div className="text-[10px] text-[#8C827A] truncate font-mono">topics</div>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-COLUMN SECTION: Courses Grid (8 Cols) + Quick Tools / Academic Summary (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left Column: Your Courses */}
        <div className="lg:col-span-8 space-y-3.5 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA]">
              Enrolled Courses ({courses.length})
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab('courses')}
              className="text-xs font-semibold text-[#C65D3B] dark:text-[#D96D4B] hover:text-[#A84B2E] flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop & Tablet Grid of Course Cards */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3">
            {coursesData.slice(0, 4).map(({ course, completed, total, pct, Icon, color }) => (
              <button
                key={course.code}
                type="button"
                onClick={() => onSelectCourse(course.code)}
                className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 text-left shadow-2xs hover:shadow-md hover:border-[#C65D3B]/40 dark:hover:border-[#C65D3B]/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer min-w-0"
              >
                <div className="min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 transition-transform group-hover:scale-105 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA] truncate">
                    {course.code}
                  </div>
                  <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] line-clamp-2 mt-0.5 leading-snug h-8">
                    {course.name}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E2DACF]/70 dark:border-[#38322D] w-full">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold font-mono text-[#C65D3B] dark:text-[#D96D4B]">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-[#8C827A] font-mono">
                      {completed}/{total}
                    </span>
                  </div>
                  <div className="w-full bg-[#EBE4D8] dark:bg-[#312B26] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#C65D3B] dark:bg-[#D96D4B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Course List Rows */}
          <div className="sm:hidden space-y-2">
            {coursesData.slice(0, 5).map(({ course, completed, total, pct, Icon, color }) => (
              <button
                key={course.code}
                type="button"
                onClick={() => onSelectCourse(course.code)}
                className="w-full bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-xl p-3 text-left shadow-2xs flex items-center justify-between gap-3 hover:bg-[#EBE4D8] dark:hover:bg-[#2B2622] transition-colors cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA] truncate">
                      {course.code}
                    </div>
                    <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] truncate">
                      {course.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#C65D3B] dark:text-[#D96D4B]">
                      {pct}%
                    </span>
                    <div className="text-[10px] text-[#8C827A] font-mono">
                      {completed}/{total}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C827A]" />
                </div>
              </button>
            ))}
          </div>

          {/* View All Button Banner if more than 4 courses */}
          {coursesData.length > 4 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#EBE4D8]/60 dark:bg-[#26221E] border border-[#E2DACF] dark:border-[#38322D] text-xs text-[#6E655F] dark:text-[#A8A098]">
              <span className="truncate">Showing top 4 of {coursesData.length} courses in Level {level} Term {term === 1 ? 'I' : 'II'}.</span>
              <button
                type="button"
                onClick={() => onSelectTab('courses')}
                className="font-bold text-[#C65D3B] dark:text-[#D96D4B] hover:underline shrink-0 ml-2 cursor-pointer font-mono"
              >
                All {coursesData.length} courses &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Academic Breakdown & Quick Tools */}
        <div className="lg:col-span-4 space-y-4 min-w-0">
          {/* Term Overview Card */}
          <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2B2622] dark:text-[#F5F1EA] font-mono">
                Term Overview
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EBE4D8] dark:bg-[#2E2824] text-[#C65D3B] dark:text-[#E8B04A] font-mono">
                BUET IPE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#EBE4D8]/60 dark:bg-[#282420] border border-[#E2DACF]/70 dark:border-[#38322D] flex items-center justify-between">
                <span className="text-[#6E655F] dark:text-[#A8A098]">Total Credits</span>
                <span className="font-mono font-bold text-[#2B2622] dark:text-[#F5F1EA]">{totalCredits} cr</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE4D8]/60 dark:bg-[#282420] border border-[#E2DACF]/70 dark:border-[#38322D] flex items-center justify-between">
                <span className="text-[#6E655F] dark:text-[#A8A098]">Theory Courses</span>
                <span className="font-mono font-bold text-[#C65D3B] dark:text-[#D96D4B]">{theoryCount} subjects</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EBE4D8]/60 dark:bg-[#282420] border border-[#E2DACF]/70 dark:border-[#38322D] flex items-center justify-between">
                <span className="text-[#6E655F] dark:text-[#A8A098]">Sessional Labs</span>
                <span className="font-mono font-bold text-[#5B6B4E] dark:text-[#A3B899]">{sessionalCount} labs</span>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2B2622] dark:text-[#F5F1EA] mb-2 font-mono">
              Calculators &amp; Planners
            </h3>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onSelectTab('syllabus')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E2DACF] dark:border-[#38322D] hover:border-[#C65D3B]/40 hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] text-xs font-semibold text-[#2B2622] dark:text-[#E2DACF] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#C65D3B] dark:text-[#D96D4B] shrink-0" />
                  <span>Syllabus Tracker</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('marks')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E2DACF] dark:border-[#38322D] hover:border-[#C65D3B]/40 hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] text-xs font-semibold text-[#2B2622] dark:text-[#E2DACF] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-[#C65D3B] dark:text-[#D96D4B] shrink-0" />
                  <span>Marks &amp; Finals Calculator</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('gpa')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E2DACF] dark:border-[#38322D] hover:border-[#C65D3B]/40 hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] text-xs font-semibold text-[#2B2622] dark:text-[#E2DACF] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Percent className="w-4 h-4 text-[#C65D3B] dark:text-[#D96D4B] shrink-0" />
                  <span>GPA Calculator</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('target')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E2DACF] dark:border-[#38322D] hover:border-[#C65D3B]/40 hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] text-xs font-semibold text-[#2B2622] dark:text-[#E2DACF] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-[#C65D3B] dark:text-[#D96D4B] shrink-0" />
                  <span>Target Planner</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasteful Attribution Footer */}
      <Footer />
    </div>
  );
};
