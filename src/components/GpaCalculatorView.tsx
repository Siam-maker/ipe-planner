import React, { useMemo } from 'react';
import { Award, GraduationCap, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Course } from '../types';
import { GRADES, getCourseKey } from '../data/curriculum';
import { calculateGpa } from '../utils/calculator';

interface GpaCalculatorViewProps {
  level: number;
  term: number;
  courses: Course[];
  grades: Record<string, string>;
  onSetGrade: (courseKey: string, gradePoint: string) => void;
  onSetAllGrades: (gradePoint: string) => void;
}

export const GpaCalculatorView: React.FC<GpaCalculatorViewProps> = ({
  level,
  term,
  courses,
  grades,
  onSetGrade,
  onSetAllGrades,
}) => {
  const gpaResult = useMemo(() => {
    return calculateGpa(courses, grades, (code) => getCourseKey(level, term, code));
  }, [courses, grades, level, term]);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-[#C65D3B]" />
          <span>GPA &amp; Credit-Weighted Grade Calculator</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A199] mt-1">
          Official BUET credit-weighted Grade Point Average calculation for Level {level} Term {term}.
        </p>
      </div>

      {/* GPA Hero Card - Editorial Dark Espresso with Terracotta accent */}
      <div className="bg-gradient-to-br from-[#2B2622] via-[#352F2B] to-[#221D1A] text-[#FAF6F0] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#443C36] text-center relative overflow-hidden">
        <div className="text-xs font-bold uppercase tracking-wider text-[#E8B04A] mb-1">
          Estimated Term GPA
        </div>

        <div className="flex items-center justify-center gap-3 my-2">
          <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-[#FAF6F0]">
            {gpaResult.gpa !== null ? gpaResult.gpa.toFixed(2) : '—'}
          </span>
          {gpaResult.gpa !== null && (
            <span className="text-sm font-semibold text-[#D4CCC0]">/ 4.00</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#C2B9AC] mt-3">
          <span>
            <strong className="text-white font-mono">{gpaResult.gradedCredits}</strong> of{' '}
            <strong className="text-white font-mono">{gpaResult.totalCredits}</strong> graded credits calculated
          </span>
          {gpaResult.honorsEligible && (
            <span className="inline-flex items-center gap-1 bg-[#5B6B4E]/30 text-[#B8CCA8] border border-[#5B6B4E]/50 px-2.5 py-0.5 rounded-full font-semibold">
              <Award className="w-3.5 h-3.5" /> First Class with Honors
            </span>
          )}
        </div>
      </div>

      {/* Quick Batch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-3 sm:p-4 shadow-2xs text-xs">
        <span className="font-semibold text-[#6E655F] dark:text-[#A8A199]">Quick Presets:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onSetAllGrades('4.00')}
            className="px-3 py-1.5 rounded-xl bg-[#5B6B4E]/15 dark:bg-[#5B6B4E]/25 text-[#44513A] dark:text-[#A7BF95] font-bold border border-[#5B6B4E]/30 hover:bg-[#5B6B4E]/25 transition-colors"
          >
            All A+ (4.00)
          </button>
          <button
            type="button"
            onClick={() => onSetAllGrades('3.75')}
            className="px-3 py-1.5 rounded-xl bg-[#C65D3B]/10 dark:bg-[#C65D3B]/20 text-[#A64525] dark:text-[#E28364] font-bold border border-[#C65D3B]/30 hover:bg-[#C65D3B]/20 transition-colors"
          >
            All A (3.75)
          </button>
          <button
            type="button"
            onClick={() => onSetAllGrades('')}
            className="px-3 py-1.5 rounded-xl bg-[#EBE4D8] dark:bg-[#2A2521] text-[#6E655F] dark:text-[#C2B9AC] font-semibold hover:bg-[#E2D9CB] dark:hover:bg-[#342E29] transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Course List with Grade Pickers */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl overflow-hidden shadow-2xs divide-y divide-[#EFE9DF] dark:divide-[#2E2924]">
        {courses.map((course) => {
          const key = getCourseKey(level, term, course.code);
          const currentVal = grades[key] ?? '';

          if (course.notGraded) {
            return (
              <div key={key} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-[#F2EEE6] dark:bg-[#1C1A18]/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2B2622] dark:text-[#EDE8E1] text-sm">{course.code}</span>
                    <span className="text-xs text-[#6E655F] dark:text-[#A8A199]">· {course.credits} cr</span>
                  </div>
                  <div className="text-xs text-[#6E655F] dark:text-[#A8A199]">{course.name}</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E8B04A]/20 dark:bg-[#E8B04A]/15 text-[#91620E] dark:text-[#E8B04A] border border-[#E8B04A]/30">
                  Non-GPA
                </span>
              </div>
            );
          }

          return (
            <div
              key={key}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F2EEE6]/60 dark:hover:bg-[#282420]/60 transition-colors"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#2B2622] dark:text-[#EDE8E1] text-sm">{course.code}</span>
                  <span className="text-xs font-semibold text-[#6E655F] dark:text-[#A8A199]">· {course.credits} credits</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      course.type === 'T'
                        ? 'bg-[#C65D3B]/10 dark:bg-[#C65D3B]/20 text-[#A64525] dark:text-[#E28364]'
                        : 'bg-[#5B6B4E]/15 dark:bg-[#5B6B4E]/25 text-[#44513A] dark:text-[#A7BF95]'
                    }`}
                  >
                    {course.type === 'T' ? 'Theory' : 'Sessional'}
                  </span>
                </div>
                <div className="text-xs text-[#6E655F] dark:text-[#A8A199] truncate">{course.name}</div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                <select
                  value={currentVal}
                  onChange={(e) => onSetGrade(key, e.target.value)}
                  className={`border rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    currentVal
                      ? 'bg-[#FAF6F0] dark:bg-[#282420] border-[#C65D3B] text-[#C65D3B] dark:text-[#E28364] shadow-2xs'
                      : 'bg-[#FAF6F0] dark:bg-[#221F1C] border-[#E8E2D9] dark:border-[#38312B] text-[#2B2622] dark:text-[#EDE8E1]'
                  }`}
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(([letter, pt]) => (
                    <option key={letter} value={pt.toFixed(2)}>
                      {letter} · {pt.toFixed(2)}
                    </option>
                  ))}
                </select>

                {currentVal && (
                  <span className="text-xs font-bold font-mono text-[#5B6B4E] dark:text-[#8FA67C] flex items-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
