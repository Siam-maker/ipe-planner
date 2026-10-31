import React, { useState, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  Search,
  CheckCheck,
  RotateCcw,
  BookOpen,
  FlaskConical,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react';
import { Course } from '../types';
import { getCourseKey, getTopicKey } from '../data/curriculum';
import { exportElementToPdf } from '../utils/pdfExport';
import { DownloadPdfButton } from './DownloadPdfButton';

interface SyllabusViewProps {
  level: number;
  term: number;
  courses: Course[];
  doneTopics: Record<string, boolean>;
  expandedSubjects: Record<string, boolean>;
  onToggleTopic: (topicKey: string) => void;
  onToggleSubjectExpand: (subjectKey: string) => void;
  onSetAllTopicsForCourse: (course: Course, done: boolean) => void;
  studentName?: string;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  level,
  term,
  courses,
  doneTopics,
  expandedSubjects,
  onToggleTopic,
  onToggleSubjectExpand,
  onSetAllTopicsForCourse,
  studentName = 'Adam',
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'theory' | 'sessional' | 'in-progress' | 'completed'>('all');

  // Overall statistics for current term
  const termStats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    let completedSubjects = 0;

    courses.forEach((c) => {
      const topicCount = c.topics.length;
      if (topicCount > 0) {
        totalTopics += topicCount;
        let cDone = 0;
        c.topics.forEach((_, idx) => {
          const k = getTopicKey(level, term, c.code, idx);
          if (doneTopics[k]) cDone++;
        });
        completedTopics += cDone;
        if (cDone === topicCount) completedSubjects++;
      }
    });

    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return { totalTopics, completedTopics, completedSubjects, percentage };
  }, [courses, level, term, doneTopics]);

  // Per-course stats and filter matching
  const coursesWithStats = useMemo(() => {
    return courses.map((course) => {
      const key = getCourseKey(level, term, course.code);
      const isExpanded = expandedSubjects[key] ?? true; // Default open
      const total = course.topics.length;
      let done = 0;

      course.topics.forEach((_, idx) => {
        const k = getTopicKey(level, term, course.code, idx);
        if (doneTopics[k]) done++;
      });

      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const isComplete = total > 0 && done === total;
      const isInProgress = done > 0 && done < total;
      const isNotStarted = done === 0;

      // Filter matching
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = course.code.toLowerCase().includes(q);
        const nameMatch = course.name.toLowerCase().includes(q);
        const topicMatch = course.topics.some((t) => t.toLowerCase().includes(q));
        matchesSearch = codeMatch || nameMatch || topicMatch;
      }

      let matchesFilter = true;
      if (filterType === 'theory') matchesFilter = course.type === 'T';
      else if (filterType === 'sessional') matchesFilter = course.type === 'S';
      else if (filterType === 'completed') matchesFilter = isComplete;
      else if (filterType === 'in-progress') matchesFilter = isInProgress;

      return {
        course,
        key,
        isExpanded,
        total,
        done,
        pct,
        isComplete,
        isInProgress,
        isNotStarted,
        matches: matchesSearch && matchesFilter,
      };
    });
  }, [courses, level, term, doneTopics, expandedSubjects, searchQuery, filterType]);

  const visibleCourses = coursesWithStats.filter((c) => c.matches);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    await exportElementToPdf({
      element: reportRef.current,
      fileName: `BUET_IPE_Syllabus_L${level}T${term}_${studentName.replace(/\s+/g, '_')}.pdf`,
      reportTitle: `Syllabus Progress Report · Level ${level} Term ${term === 1 ? 'I' : 'II'}`,
      studentName,
      level,
      term,
    });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#F5F1EA] flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-[#C65D3B] dark:text-[#D96D4B]" />
            <span>Syllabus Progress Tracker</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A098] mt-0.5">
            Track official syllabus modules and topics covered for Level {level} Term {term}.
          </p>
        </div>

        <DownloadPdfButton onDownload={handleDownloadPdf} label="Download Syllabus PDF" />
      </div>

      <div ref={reportRef} className="space-y-5">
      {/* Term Progress Hero Banner with Warm Editorial Palette */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2D2622] via-[#241F1C] to-[#1C1816] text-[#F5F1EA] rounded-3xl p-5 sm:p-6 shadow-md border border-[#483E36]">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold tracking-wider uppercase text-[#E8B04A] font-mono">
                Overall Syllabus Completion
              </span>
              {termStats.percentage === 100 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#5B6B4E]/30 text-[#A3B899] px-2.5 py-0.5 rounded-full border border-[#5B6B4E]/50 font-mono">
                  <Sparkles className="w-3 h-3 text-[#E8B04A]" /> All Done!
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#F5F1EA] font-mono">
                {termStats.percentage}%
              </span>
              <span className="text-xs sm:text-sm text-[#D8CEBF] font-medium">
                {termStats.completedTopics} of {termStats.totalTopics} topics checked
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-[#D8CEBF]">Completed Courses</div>
              <div className="text-lg font-bold font-mono text-[#F5F1EA]">
                {termStats.completedSubjects} / {courses.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#C65D3B]/30 border border-[#C65D3B]/50 flex items-center justify-center font-bold text-xs text-[#E8B04A] font-mono">
              {courses.length > 0 ? Math.round((termStats.completedSubjects / courses.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Animated Progress Track */}
        <div className="relative z-10 mt-4 w-full bg-[#181513] rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              termStats.percentage === 100
                ? 'bg-gradient-to-r from-[#5B6B4E] to-[#758765]'
                : 'bg-gradient-to-r from-[#C65D3B] via-[#E8B04A] to-[#5B6B4E]'
            }`}
            style={{ width: `${termStats.percentage}%` }}
          />
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="no-print bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-3 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or course (e.g. thermodynamics, matrix, calculus)..."
            className="w-full pl-9 pr-4 py-2 bg-[#EBE4D8] dark:bg-[#282320] border border-[#DCD3C5] dark:border-[#3E3832] rounded-xl text-xs sm:text-sm text-[#2B2622] dark:text-[#F5F1EA] placeholder-[#8C827A] focus:outline-hidden focus:border-[#C65D3B] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8C827A] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {[
            { id: 'all', label: `All (${courses.length})` },
            { id: 'theory', label: `Theory (${courses.filter((c) => c.type === 'T').length})` },
            { id: 'sessional', label: `Sessional (${courses.filter((c) => c.type === 'S').length})` },
            { id: 'in-progress', label: `In Progress (${coursesWithStats.filter((c) => c.isInProgress).length})` },
            { id: 'completed', label: `Completed (${coursesWithStats.filter((c) => c.isComplete).length})` },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as typeof filterType)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-[#C65D3B] text-white shadow-xs'
                    : 'bg-[#EBE4D8] dark:bg-[#2A2622] text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#E2D8C9] dark:hover:bg-[#332E2A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Subjects Accordion List */}
      <div className="space-y-3">
        {visibleCourses.length === 0 ? (
          <div className="text-center py-12 bg-[#FAF6F0] dark:bg-[#221F1C] rounded-2xl border border-[#E2DACF] dark:border-[#38322D] text-[#6E655F] dark:text-[#A8A098] p-6">
            <BookOpen className="w-8 h-8 text-[#8C827A] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#2B2622] dark:text-[#F5F1EA]">No courses match your filter or search query</p>
            <p className="text-xs text-[#8C827A] mt-1">Try searching a different keyword or resetting filters.</p>
          </div>
        ) : (
          visibleCourses.map((item) => {
            const { course, key, isExpanded, total, done, pct, isComplete, isInProgress } = item;

            return (
              <div
                key={key}
                className={`bg-[#FAF6F0] dark:bg-[#221F1C] border rounded-2xl overflow-hidden transition-all shadow-2xs ${
                  isComplete
                    ? 'border-[#5B6B4E]/50'
                    : isInProgress
                    ? 'border-[#C65D3B]/40'
                    : 'border-[#E2DACF] dark:border-[#38322D]'
                }`}
              >
                {/* Subject Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onToggleSubjectExpand(key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleSubjectExpand(key);
                    }
                  }}
                  className="p-4 sm:p-4.5 cursor-pointer hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] transition-colors select-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#2B2622] dark:text-[#F5F1EA] text-base">{course.code}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            course.type === 'T'
                              ? 'bg-[#EBE4D8] text-[#C65D3B] dark:bg-[#2F2722] dark:text-[#D96D4B] border-[#DCD3C5] dark:border-[#423932]'
                              : 'bg-[#EBE4D8] text-[#3D5A80] dark:bg-[#232A33] dark:text-[#88A9CB] border-[#DCD3C5] dark:border-[#35414F]'
                          }`}
                        >
                          {course.type === 'T' ? <BookOpen className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                          {course.type === 'T' ? 'Theory' : 'Sessional'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBE4D8] dark:bg-[#2E2824] text-[#2B2622] dark:text-[#E2DACF] font-mono">
                          {course.credits} cr
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-[#6E655F] dark:text-[#A8A098] leading-snug">{course.name}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                              isComplete
                                ? 'bg-[#5B6B4E]/15 text-[#5B6B4E] dark:bg-[#738563]/25 dark:text-[#A3B899] border-[#5B6B4E]/30'
                                : isInProgress
                                ? 'bg-[#EBE4D8] text-[#C65D3B] dark:bg-[#2F2722] dark:text-[#D96D4B] border-[#DCD3C5] dark:border-[#423932]'
                                : 'bg-[#EBE4D8] dark:bg-[#2A2622] text-[#6E655F] dark:text-[#A8A098] border-[#DCD3C5] dark:border-[#38322D]'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8C827A] font-medium mt-0.5 font-mono">
                          {done}/{total} done
                        </div>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-lg bg-[#EBE4D8] dark:bg-[#2B2622] flex items-center justify-center text-[#6E655F] dark:text-[#A8A098] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-[#EBE4D8] dark:bg-[#2E2824] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete
                          ? 'bg-[#5B6B4E]'
                          : isInProgress
                          ? 'bg-[#C65D3B] dark:bg-[#D96D4B]'
                          : 'bg-[#DCD3C5] dark:bg-[#3E3832]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Collapsible Topics Section */}
                {isExpanded && (
                  <div className="border-t border-[#E2DACF] dark:border-[#38322D] bg-[#F2EEE6]/50 dark:bg-[#1E1B18]/50 px-4 py-3 sm:px-5">
                    {/* Actions */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2DACF]/70 dark:border-[#38322D] text-xs text-[#6E655F] dark:text-[#A8A098]">
                      <span className="font-medium font-mono text-[11px]">
                        Topics ({done} of {total} completed)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetAllTopicsForCourse(course, true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#5B6B4E] dark:text-[#A3B899] hover:bg-[#5B6B4E]/10 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Select All
                        </button>
                        <span className="text-[#8C827A]">·</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetAllTopicsForCourse(course, false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#6E655F] dark:text-[#A8A098] hover:bg-[#EBE4D8] dark:hover:bg-[#282320] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Topic Checkbox Items */}
                    <div className="space-y-1.5">
                      {course.topics.map((topic, idx) => {
                        const topicKey = getTopicKey(level, term, course.code, idx);
                        const isDone = Boolean(doneTopics[topicKey]);

                        return (
                          <label
                            key={topicKey}
                            className={`group flex items-start gap-3 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer select-none border ${
                              isDone
                                ? 'bg-[#5B6B4E]/10 dark:bg-[#738563]/15 border-[#5B6B4E]/30 text-[#2B2622] dark:text-[#F5F1EA]'
                                : 'bg-[#FAF6F0] dark:bg-[#24201D] border-[#E2DACF] dark:border-[#38322D] hover:border-[#C65D3B]/40 text-[#2B2622] dark:text-[#F5F1EA]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => onToggleTopic(topicKey)}
                              className="sr-only"
                            />
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-[#5B6B4E] dark:text-[#A3B899] fill-[#5B6B4E]/20" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#8C827A] group-hover:text-[#C65D3B] transition-colors" />
                              )}
                            </div>
                            <div className="flex-1 text-xs sm:text-[13px] leading-relaxed">
                              <span className="font-mono text-[11px] mr-1.5 text-[#8C827A]">
                                {idx + 1}.
                              </span>
                              <span className={isDone ? 'line-through text-[#8C827A] dark:text-[#8C827A]' : ''}>
                                {topic}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};
