import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, GraduationCap, CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-4">
      {/* GPA Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-900/40 text-center relative overflow-hidden"
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">
          Estimated Term GPA
        </div>

        <div className="flex items-center justify-center gap-3 my-2">
          <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
            {gpaResult.gpa !== null ? gpaResult.gpa.toFixed(2) : '—'}
          </span>
          {gpaResult.gpa !== null && (
            <span className="text-sm font-semibold text-indigo-300">/ 4.00</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-indigo-200 mt-2">
          <span>
            <strong className="text-white font-mono">{gpaResult.gradedCredits}</strong> of{' '}
            <strong className="text-white font-mono">{gpaResult.totalCredits}</strong> graded credits calculated
          </span>
          {gpaResult.honorsEligible && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              <Award className="w-3.5 h-3.5" /> First Class with Honors
            </span>
          )}
        </div>
      </motion.div>

      {/* Quick Batch Actions */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs text-xs">
        <span className="font-semibold text-slate-600">Quick Actions:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSetAllGrades('4.00')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
          >
            All A+ (4.0)
          </button>
          <button
            type="button"
            onClick={() => onSetAllGrades('3.75')}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
          >
            All A (3.75)
          </button>
          <button
            type="button"
            onClick={() => onSetAllGrades('')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Course List with Grade Pickers */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
        {courses.map((course) => {
          const key = getCourseKey(level, term, course.code);
          const currentVal = grades[key] ?? '';

          if (course.notGraded) {
            return (
              <div key={key} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-slate-50/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-sm">{course.code}</span>
                    <span className="text-xs text-slate-500">· {course.credits} cr</span>
                  </div>
                  <div className="text-xs text-slate-500">{course.name}</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  Satisfactory / Unsatisfactory (Not counted in GPA)
                </span>
              </div>
            );
          }

          return (
            <div
              key={key}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{course.code}</span>
                  <span className="text-xs font-semibold text-slate-500">· {course.credits} credits</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      course.type === 'T' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {course.type === 'T' ? 'Theory' : 'Sessional'}
                  </span>
                </div>
                <div className="text-xs text-slate-600">{course.name}</div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  value={currentVal}
                  onChange={(e) => onSetGrade(key, e.target.value)}
                  className={`border rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    currentVal
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900'
                      : 'bg-white border-slate-200 text-slate-600'
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
                  <span className="text-xs font-bold font-mono text-emerald-600 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
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
