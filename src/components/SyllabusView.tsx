import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
} from 'lucide-react';
import { Course } from '../types';
import { getCourseKey, getTopicKey } from '../data/curriculum';

interface SyllabusViewProps {
  level: number;
  term: number;
  courses: Course[];
  doneTopics: Record<string, boolean>;
  expandedSubjects: Record<string, boolean>;
  onToggleTopic: (topicKey: string) => void;
  onToggleSubjectExpand: (subjectKey: string) => void;
  onSetAllTopicsForCourse: (course: Course, done: boolean) => void;
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
}) => {
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

  return (
    <div className="space-y-4">
      {/* Term Progress Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-800/40"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
                Term Syllabus Completion
              </span>
              {termStats.percentage === 100 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" /> All Done!
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {termStats.percentage}%
              </span>
              <span className="text-xs sm:text-sm text-indigo-200/90 font-medium">
                {termStats.completedTopics} of {termStats.totalTopics} topics checked
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-indigo-200">Completed Courses</div>
              <div className="text-lg font-bold font-mono text-white">
                {termStats.completedSubjects} / {courses.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-bold text-xs text-indigo-100">
              {courses.length > 0 ? Math.round((termStats.completedSubjects / courses.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Smooth animated progress track */}
        <div className="relative z-10 mt-4 w-full bg-slate-950/60 rounded-full h-3 overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${termStats.percentage}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className={`h-full rounded-full ${
              termStats.percentage === 100
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                : 'bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400'
            }`}
          />
        </div>
      </motion.div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject or topic (e.g. IPE 205, casting, matrix, calculus)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
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
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Subjects List */}
      <div className="space-y-3">
        {visibleCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/90 text-slate-500 p-6">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No courses match your filter or search query</p>
            <p className="text-xs text-slate-400 mt-1">Try searching a different keyword or resetting filters.</p>
          </div>
        ) : (
          visibleCourses.map((item) => {
            const { course, key, isExpanded, total, done, pct, isComplete, isInProgress } = item;

            return (
              <motion.div
                key={key}
                layout
                transition={{ duration: 0.2 }}
                className={`bg-white border rounded-2xl overflow-hidden transition-shadow ${
                  isComplete
                    ? 'border-emerald-200/90 shadow-xs'
                    : isInProgress
                    ? 'border-indigo-200/90 shadow-xs'
                    : 'border-slate-200/90 shadow-2xs'
                }`}
              >
                {/* Subject Header with Progress and Controls */}
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
                  className="p-4 sm:p-4.5 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{course.code}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            course.type === 'T'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          }`}
                        >
                          {course.type === 'T' ? <BookOpen className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                          {course.type === 'T' ? 'Theory' : 'Sessional'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {course.credits} cr
                        </span>
                        {course.notGraded && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
                            Non-GPA
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-semibold text-slate-700 leading-snug">{course.name}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Individual Subject Progress Badge */}
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                              isComplete
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {done}/{total} done
                        </div>
                      </div>

                      {/* Expand Chevron */}
                      <div
                        className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Individual Subject Progress Bar */}
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className={`h-full rounded-full ${
                        isComplete
                          ? 'bg-emerald-500'
                          : isInProgress
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Collapsible Topics Section */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${key}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5"
                    >
                      {/* Subject Quick Actions */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 text-xs text-slate-500">
                        <span className="font-medium">
                          Curriculum Topics ({done} of {total} completed)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetAllTopicsForCourse(course, true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Select All
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetAllTopicsForCourse(course, false);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Topic Checkbox Items */}
                      <div className="space-y-2">
                        {course.topics.map((topic, idx) => {
                          const topicKey = getTopicKey(level, term, course.code, idx);
                          const isDone = Boolean(doneTopics[topicKey]);

                          return (
                            <label
                              key={topicKey}
                              className={`group flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl transition-all cursor-pointer select-none border ${
                                isDone
                                  ? 'bg-emerald-50/50 border-emerald-200/50 text-slate-700'
                                  : 'bg-white border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/20 text-slate-800'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => onToggleTopic(topicKey)}
                                className="sr-only"
                              />
                              <div className="mt-0.5 flex-shrink-0">
                                {isDone ? (
                                  <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                  </motion.div>
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                )}
                              </div>
                              <div className="flex-1 text-xs sm:text-[13px] leading-relaxed">
                                <span className={`font-mono text-[11px] mr-1.5 text-slate-400`}>
                                  {idx + 1}.
                                </span>
                                <span className={isDone ? 'line-through text-slate-500' : ''}>
                                  {topic}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
