import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Circle,
  Calculator,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { Course } from '../types';
import { getTopicKey } from '../data/curriculum';

interface CourseDetailModalProps {
  course: Course | null;
  level: number;
  term: number;
  onClose: () => void;
  doneTopics: Record<string, boolean>;
  onToggleTopic: (topicKey: string) => void;
  onSetAllTopicsForCourse: (course: Course, done: boolean) => void;
  notes: Record<string, string>;
  onSaveNotes: (courseCode: string, noteText: string) => void;
  onOpenMarksCalculator: (courseKey: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  level,
  term,
  onClose,
  doneTopics,
  onToggleTopic,
  onSetAllTopicsForCourse,
  notes,
  onSaveNotes,
  onOpenMarksCalculator,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes' | 'resources'>('syllabus');
  const [courseNote, setCourseNote] = useState(() => (course ? notes[course.code] || '' : ''));

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!course) return null;

  const totalTopics = course.topics.length;
  let completedCount = 0;
  course.topics.forEach((_, idx) => {
    const k = getTopicKey(level, term, course.code, idx);
    if (doneTopics[k]) completedCount++;
  });
  const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const isAllDone = totalTopics > 0 && completedCount === totalTopics;

  // Split topics into logical chapter buckets
  const chapters = React.useMemo(() => {
    const chunkSize = 4;
    const list: { chapterNumber: number; title: string; topics: { index: number; name: string }[] }[] = [];
    for (let i = 0; i < course.topics.length; i += chunkSize) {
      const slice = course.topics.slice(i, i + chunkSize);
      const chapterNum = Math.floor(i / chunkSize) + 1;
      const firstTopicName = slice[0] ? slice[0].split(':')[0].split('&')[0].trim() : `Section ${chapterNum}`;
      list.push({
        chapterNumber: chapterNum,
        title: `Chapter ${chapterNum}: ${firstTopicName}`,
        topics: slice.map((t, sIdx) => ({
          index: i + sIdx,
          name: t,
        })),
      });
    }
    return list;
  }, [course]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#2B2622]/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-detail-title"
    >
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] shadow-2xl border border-[#E2DACF] dark:border-[#38322D] flex flex-col overflow-hidden min-w-0">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E2DACF] dark:border-[#38322D] relative bg-[#EBE4D8]/60 dark:bg-[#282320]/60 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 p-1.5 text-[#8C827A] hover:text-[#2B2622] dark:hover:text-[#F5F1EA] rounded-xl hover:bg-[#EBE4D8] dark:hover:bg-[#332E2A] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 pr-8 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#EBE4D8] dark:bg-[#2F2722] text-[#C65D3B] dark:text-[#D96D4B] flex items-center justify-center shrink-0 border border-[#DCD3C5] dark:border-[#423932]">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <h3 id="course-detail-title" className="text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] truncate">
                  {course.code} &mdash; {course.name}
                </h3>
              </div>
              <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] flex items-center gap-2">
                <span>{course.credits} Credits ({course.type === 'T' ? 'Theory' : 'Sessional'})</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-xs mb-1 font-medium">
                  <span className="font-bold text-[#C65D3B] dark:text-[#D96D4B] font-mono">
                    {pct}% completed
                  </span>
                  <span className="text-[#6E655F] dark:text-[#A8A098] font-mono text-xs">
                    {completedCount} / {totalTopics} topics
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
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-2.5 border-t border-[#E2DACF]/70 dark:border-[#38322D] overflow-x-auto text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('syllabus')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'syllabus'
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'text-[#6E655F] dark:text-[#A8A098] hover:bg-[#EBE4D8] dark:hover:bg-[#2B2622]'
              }`}
            >
              Syllabus Topics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'text-[#6E655F] dark:text-[#A8A098] hover:bg-[#EBE4D8] dark:hover:bg-[#2B2622]'
              }`}
            >
              Study Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'text-[#6E655F] dark:text-[#A8A098] hover:bg-[#EBE4D8] dark:hover:bg-[#2B2622]'
              }`}
            >
              Course Info
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 min-w-0 overscroll-contain">
          {activeTab === 'syllabus' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#6E655F] dark:text-[#A8A098]">
                <span>{course.topics.length} Syllabus Modules Listed</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSetAllTopicsForCourse(course, true)}
                    className="inline-flex items-center gap-1 font-semibold text-[#5B6B4E] dark:text-[#A3B899] hover:underline cursor-pointer font-mono text-[11px]"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Select All
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => onSetAllTopicsForCourse(course, false)}
                    className="inline-flex items-center gap-1 font-semibold text-[#8C827A] hover:underline cursor-pointer font-mono text-[11px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              {chapters.map((chap) => {
                const chapCompleted = chap.topics.filter((t) => {
                  const k = getTopicKey(level, term, course.code, t.index);
                  return Boolean(doneTopics[k]);
                }).length;

                return (
                  <div
                    key={chap.chapterNumber}
                    className="border border-[#E2DACF] dark:border-[#38322D] rounded-xl overflow-hidden bg-[#FAF6F0] dark:bg-[#221F1C]"
                  >
                    <div className="p-3 bg-[#EBE4D8]/60 dark:bg-[#282320]/60 flex items-center justify-between border-b border-[#E2DACF]/70 dark:border-[#38322D]">
                      <span className="text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA] truncate pr-2">
                        {chap.title}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#6E655F] dark:text-[#A8A098] shrink-0">
                        {chapCompleted}/{chap.topics.length}
                      </span>
                    </div>

                    <div className="p-1.5 space-y-1">
                      {chap.topics.map((t) => {
                        const key = getTopicKey(level, term, course.code, t.index);
                        const isDone = Boolean(doneTopics[key]);

                        return (
                          <label
                            key={t.index}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors select-none ${
                              isDone
                                ? 'bg-[#5B6B4E]/10 dark:bg-[#738563]/15 text-[#6E655F] dark:text-[#A8A098]'
                                : 'hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] text-[#2B2622] dark:text-[#F5F1EA]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => onToggleTopic(key)}
                              className="sr-only"
                            />
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-[#5B6B4E] dark:text-[#A3B899] fill-[#5B6B4E]/20" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#8C827A]" />
                              )}
                            </div>
                            <span className={`text-xs leading-relaxed break-words min-w-0 flex-1 ${isDone ? 'line-through text-[#8C827A]' : ''}`}>
                              {t.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA]">
                Personal Study Notes &amp; Exam Checklist
              </label>
              <textarea
                rows={7}
                value={courseNote}
                onChange={(e) => {
                  setCourseNote(e.target.value);
                  onSaveNotes(course.code, e.target.value);
                }}
                placeholder="Write your personal notes, formulas, reference book chapters, or CT preparation checklist here..."
                className="w-full bg-[#EBE4D8] dark:bg-[#282320] text-[#2B2622] dark:text-[#F5F1EA] placeholder-[#8C827A] text-xs sm:text-sm p-3 rounded-xl border border-[#DCD3C5] dark:border-[#3E3832] focus:outline-hidden focus:border-[#C65D3B] transition-all"
              />
              <p className="text-[11px] text-[#8C827A]">
                Notes save automatically to your local browser storage.
              </p>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-3.5 text-xs text-[#6E655F] dark:text-[#A8A098]">
              <div className="p-3.5 rounded-xl bg-[#EBE4D8] dark:bg-[#282320] border border-[#DCD3C5] dark:border-[#3E3832]">
                <h4 className="font-bold text-[#C65D3B] dark:text-[#E8B04A] text-xs sm:text-sm mb-1 font-mono">
                  BUET Course Specification
                </h4>
                <p className="leading-relaxed">
                  <strong className="text-[#2B2622] dark:text-[#F5F1EA]">{course.code}</strong> is a <strong className="text-[#2B2622] dark:text-[#F5F1EA]">{course.credits}.0 credit</strong>{' '}
                  {course.type === 'T' ? 'theory course' : 'sessional lab'} in the Department of Industrial &amp; Production Engineering.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#EBE4D8]/60 dark:bg-[#282320]/60 border border-[#DCD3C5] dark:border-[#3E3832]">
                  <span className="text-[10px] text-[#8C827A] block font-mono">Assessment</span>
                  <span className="font-bold text-[#2B2622] dark:text-[#F5F1EA] text-xs mt-0.5 block">
                    {course.type === 'T' ? '30% Continuous + 70% Final' : '100% Sessional'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#EBE4D8]/60 dark:bg-[#282320]/60 border border-[#DCD3C5] dark:border-[#3E3832]">
                  <span className="text-[10px] text-[#8C827A] block font-mono">Class Tests</span>
                  <span className="font-bold text-[#2B2622] dark:text-[#F5F1EA] text-xs mt-0.5 block">
                    {course.type === 'T' ? `${course.credits + 1} CTs (Best ${course.credits})` : 'Quizzes & Viva'}
                  </span>
                </div>
              </div>

              {course.type === 'T' && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenMarksCalculator(course.code);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#EBE4D8] dark:bg-[#2E2824] text-[#C65D3B] dark:text-[#D96D4B] hover:bg-[#E2D8C9] font-bold transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Open CT &amp; Final Exam Calculator</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#E2DACF] dark:border-[#38322D] bg-[#EBE4D8]/60 dark:bg-[#282320]/60 flex items-center justify-between gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#6E655F] dark:text-[#A8A098] hover:bg-[#EBE4D8] dark:hover:bg-[#332E2A] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onSetAllTopicsForCourse(course, !isAllDone)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
              isAllDone
                ? 'bg-[#EBE4D8] text-[#2B2622] hover:bg-[#E2D8C9] dark:bg-[#2E2824] dark:text-[#E2DACF]'
                : 'bg-[#C65D3B] hover:bg-[#B34E2E] text-white shadow-[#C65D3B]/25 active:scale-[0.98]'
            }`}
          >
            {isAllDone ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};
