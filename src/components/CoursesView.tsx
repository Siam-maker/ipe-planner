import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  FlaskConical,
  Calculator,
  GraduationCap,
} from 'lucide-react';
import { Course, TabKey } from '../types';
import { getCourseKey, getTopicKey } from '../data/curriculum';

interface CoursesViewProps {
  level: number;
  term: number;
  courses: Course[];
  doneTopics: Record<string, boolean>;
  onSelectCourse: (courseCode: string) => void;
  onOpenMarksForCourse: (courseKey: string) => void;
  onSelectTab: (tab: TabKey) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  level,
  term,
  courses,
  doneTopics,
  onSelectCourse,
  onOpenMarksForCourse,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'theory' | 'sessional'>('all');

  const courseList = useMemo(() => {
    return courses.map((course) => {
      const total = course.topics.length;
      let completed = 0;
      course.topics.forEach((_, idx) => {
        const k = getTopicKey(level, term, course.code, idx);
        if (doneTopics[k]) completed++;
      });
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        course,
        total,
        completed,
        pct,
      };
    });
  }, [courses, level, term, doneTopics]);

  const filtered = useMemo(() => {
    return courseList.filter(({ course }) => {
      if (filterType === 'theory' && course.type !== 'T') return false;
      if (filterType === 'sessional' && course.type !== 'S') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          course.code.toLowerCase().includes(q) ||
          course.name.toLowerCase().includes(q) ||
          course.topics.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [courseList, filterType, searchQuery]);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#F5F1EA] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#C65D3B] dark:text-[#D96D4B]" />
            <span>Enrolled Courses</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A098] mt-0.5">
            Level {level}, Term {term === 1 ? 'I' : 'II'} Curriculum · {courses.length} Courses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('syllabus')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#C65D3B] hover:bg-[#B34E2E] text-white shadow-2xs transition-all cursor-pointer font-mono"
          >
            Open Syllabus Tracker &rarr;
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-3 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by code, title, or topic..."
            className="w-full pl-9 pr-4 py-2 bg-[#EBE4D8] dark:bg-[#282320] text-[#2B2622] dark:text-[#F5F1EA] placeholder-[#8C827A] rounded-xl text-xs sm:text-sm border border-[#DCD3C5] dark:border-[#3E3832] focus:outline-hidden focus:border-[#C65D3B]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'all', label: `All Courses (${courses.length})` },
            { id: 'theory', label: `Theory (${courses.filter((c) => c.type === 'T').length})` },
            { id: 'sessional', label: `Sessional (${courses.filter((c) => c.type === 'S').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as typeof filterType)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap select-none cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'bg-[#EBE4D8] dark:bg-[#2A2622] text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#E2D8C9] dark:hover:bg-[#332E2A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ course, total, completed, pct }) => {
          const courseKey = getCourseKey(level, term, course.code);

          return (
            <div
              key={course.code}
              className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-[#C65D3B]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        course.type === 'T'
                          ? 'bg-[#EBE4D8] dark:bg-[#2F2722] text-[#C65D3B] dark:text-[#D96D4B] border-[#DCD3C5] dark:border-[#423932]'
                          : 'bg-[#EBE4D8] dark:bg-[#232A33] text-[#3D5A80] dark:text-[#88A9CB] border-[#DCD3C5] dark:border-[#35414F]'
                      }`}
                    >
                      {course.type === 'T' ? <BookOpen className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA]">
                        {course.code}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6E655F] dark:text-[#A8A098]">
                        <span>{course.credits} Credits</span>
                        <span>·</span>
                        <span>{course.type === 'T' ? 'Theory' : 'Sessional'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                      pct === 100
                        ? 'bg-[#5B6B4E]/15 text-[#5B6B4E] dark:bg-[#738563]/25 dark:text-[#A3B899] border-[#5B6B4E]/30'
                        : 'bg-[#EBE4D8] text-[#C65D3B] dark:bg-[#2E2824] dark:text-[#E8B04A] border-[#DCD3C5] dark:border-[#423932]'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-[#2B2622] dark:text-[#E2DACF] line-clamp-2 leading-relaxed mb-4">
                  {course.name}
                </h4>

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-[#6E655F] dark:text-[#A8A098]">
                    <span>Curriculum coverage</span>
                    <span className="font-mono font-medium text-[#2B2622] dark:text-[#F5F1EA]">
                      {completed} / {total} topics
                    </span>
                  </div>
                  <div className="w-full bg-[#EBE4D8] dark:bg-[#312B26] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-[#5B6B4E]' : 'bg-[#C65D3B] dark:bg-[#D96D4B]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-[#E2DACF]/70 dark:border-[#38322D] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCourse(course.code)}
                  className="flex-1 py-2 px-3 text-xs font-bold text-[#C65D3B] dark:text-[#D96D4B] bg-[#EBE4D8] dark:bg-[#2B2622] hover:bg-[#E2D8C9] dark:hover:bg-[#352F2A] rounded-xl transition-colors text-center cursor-pointer"
                >
                  View Details &amp; Topics
                </button>

                {course.type === 'T' && (
                  <button
                    type="button"
                    onClick={() => onOpenMarksForCourse(courseKey)}
                    title="Calculate CT & Final Exam"
                    className="p-2 text-[#6E655F] hover:text-[#C65D3B] dark:text-[#A8A098] dark:hover:text-[#D96D4B] bg-[#EBE4D8] dark:bg-[#2B2622] hover:bg-[#E2D8C9] dark:hover:bg-[#352F2A] rounded-xl transition-colors cursor-pointer"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
