import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Percent,
  Award,
  AlertTriangle,
  Info,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { AttendanceInputMode, Course } from '../types';
import { getCourseKey } from '../data/curriculum';
import {
  calculateAttendance,
  calculateCTMarks,
  calculateFinalNeeded,
} from '../utils/calculator';

interface MarksCalculatorViewProps {
  level: number;
  term: number;
  courses: Course[];
  selectedCourseKey: string;
  onSelectCourseKey: (key: string) => void;
  attendanceMode: Record<string, AttendanceInputMode>;
  onSetAttendanceMode: (courseKey: string, mode: AttendanceInputMode) => void;
  attendancePct: Record<string, string>;
  onSetAttendancePct: (courseKey: string, val: string) => void;
  attendanceDirectMarks: Record<string, string>;
  onSetAttendanceDirectMarks: (courseKey: string, val: string) => void;
  ctMarks: Record<string, string>;
  onSetCtMark: (ctKey: string, val: string) => void;
}

export const MarksCalculatorView: React.FC<MarksCalculatorViewProps> = ({
  level,
  term,
  courses,
  selectedCourseKey,
  onSelectCourseKey,
  attendanceMode,
  onSetAttendanceMode,
  attendancePct,
  onSetAttendancePct,
  attendanceDirectMarks,
  onSetAttendanceDirectMarks,
  ctMarks,
  onSetCtMark,
}) => {
  // Only Theory courses have CT + Attendance + Final written exams
  const theoryCourses = useMemo(() => courses.filter((c) => c.type === 'T'), [courses]);

  // Find active course or default to first theory course
  const currentCourse = useMemo(() => {
    const found = theoryCourses.find((c) => getCourseKey(level, term, c.code) === selectedCourseKey);
    return found || theoryCourses[0] || courses[0];
  }, [theoryCourses, courses, level, term, selectedCourseKey]);

  const courseKey = currentCourse ? getCourseKey(level, term, currentCourse.code) : '';
  const credits = currentCourse ? currentCourse.credits : 3;

  // Active attendance mode: 'percentage' or 'marks'
  const activeMode: AttendanceInputMode = (courseKey && attendanceMode[courseKey]) || 'percentage';

  const currentPctVal = (courseKey && attendancePct[courseKey]) ?? '';
  const currentDirectVal = (courseKey && attendanceDirectMarks[courseKey]) ?? '';

  // Calculation results
  const attResult = useMemo(() => {
    return calculateAttendance(credits, activeMode, currentPctVal, currentDirectVal);
  }, [credits, activeMode, currentPctVal, currentDirectVal]);

  const ctRecord = useMemo(() => {
    const rec: Record<number, string> = {};
    const count = credits + 1;
    for (let i = 0; i < count; i++) {
      const k = `${courseKey}#${i}`;
      rec[i] = ctMarks[k] ?? '';
    }
    return rec;
  }, [credits, courseKey, ctMarks]);

  const ctResult = useMemo(() => {
    return calculateCTMarks(credits, ctRecord);
  }, [credits, ctRecord]);

  const finalExamRows = useMemo(() => {
    return calculateFinalNeeded(credits, attResult.marks, ctResult.totalMarks);
  }, [credits, attResult.marks, ctResult.totalMarks]);

  const continuousTotal = attResult.marks + ctResult.totalMarks;
  const continuousMax = credits * 30; // 10 * credits + 20 * credits

  if (!currentCourse) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500">
        No theory courses found for this term.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Course Selector & Breakdown Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* Header Row: Label on Left, Badges on Right — always stays cleanly inside the card */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
          <label
            htmlFor="course-select"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Select Theory Course
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
              Total: {credits * 100} marks
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70 whitespace-nowrap">
              Final: {credits * 70} marks
            </span>
          </div>
        </div>

        {/* Full-width select dropdown on its own line */}
        <select
          id="course-select"
          value={courseKey}
          onChange={(e) => onSelectCourseKey(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
        >
          {theoryCourses.map((c) => {
            const k = getCourseKey(level, term, c.code);
            return (
              <option key={k} value={k}>
                {c.code} · {c.name} ({c.credits} cr)
              </option>
            );
          })}
        </select>

        {/* Breakdown Summary */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 leading-relaxed">
          <span>
            Attendance: <strong className="text-slate-800 font-semibold">{credits * 10}</strong> marks
          </span>
          <span className="text-slate-300">·</span>
          <span>
            Class Tests: <strong className="text-slate-800 font-semibold">{credits * 20}</strong> marks ({credits + 1} CTs of 20, best {credits} count)
          </span>
          <span className="text-slate-300">·</span>
          <span>
            Term Final: <strong className="text-slate-800 font-semibold">{credits * 70}</strong> marks
          </span>
        </div>
      </div>

      {/* ATTENDANCE SECTION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Attendance Input Method
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose either attendance percentage (%) or direct marks (only one active at a time).
            </p>
          </div>

          {/* DUAL MODE SELECTOR BUTTONS */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
            <button
              type="button"
              onClick={() => onSetAttendanceMode(courseKey, 'percentage')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors select-none ${
                activeMode === 'percentage'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {activeMode === 'percentage' && (
                <motion.div
                  layoutId="activeAttendanceModePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-indigo-600 rounded-lg shadow-xs"
                />
              )}
              <Percent className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">Attendance %</span>
            </button>

            <button
              type="button"
              onClick={() => onSetAttendanceMode(courseKey, 'marks')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors select-none ${
                activeMode === 'marks'
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {activeMode === 'marks' && (
                <motion.div
                  layoutId="activeAttendanceModePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-indigo-600 rounded-lg shadow-xs"
                />
              )}
              <Award className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">Direct Marks</span>
            </button>
          </div>
        </div>

        {/* INPUT ACCORDING TO SELECTED MODE */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3.5">
          {activeMode === 'percentage' ? (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-semibold text-slate-700">
                  Enter Your Attendance Percentage (%):
                  <div className="relative mt-1.5 max-w-[220px]">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="e.g. 85"
                      value={currentPctVal}
                      onChange={(e) => onSetAttendancePct(courseKey, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </label>

                <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-right shrink-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Secured Marks</div>
                  <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">
                    {attResult.marks} / {attResult.maxMarks}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {attResult.pointsPerCredit} points / credit
                  </div>
                </div>
              </div>

              {/* BUET Attendance Slab Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-3 border-t border-slate-200/70">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">≥ 90%</span>: 10 pts (Full)
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">85–89%</span>: 9 pts
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">80–84%</span>: 8 pts
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">75–79%</span>: 7 pts
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">70–74%</span>: 6 pts
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">65–69%</span>: 5 pts
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 text-center">
                  <span className="font-semibold text-slate-800">60–64%</span>: 4 pts
                </div>
                <div className="bg-rose-50 text-rose-700 p-2 rounded-lg border border-rose-200 text-center font-semibold">
                  &lt; 60%: 0 pts
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-semibold text-slate-700">
                  Enter Direct Attendance Marks (out of {credits * 10}):
                  <div className="relative mt-1.5 max-w-[220px]">
                    <input
                      type="number"
                      min="0"
                      max={credits * 10}
                      step="0.5"
                      placeholder={`0 - ${credits * 10}`}
                      value={currentDirectVal}
                      onChange={(e) => onSetAttendanceDirectMarks(courseKey, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      / {credits * 10}
                    </span>
                  </div>
                </label>

                <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-right shrink-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Secured Marks</div>
                  <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">
                    {attResult.marks} / {attResult.maxMarks}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ≈ {attResult.percentage}% equivalent
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  For a <strong>{credits}-credit</strong> course, total attendance marks is{' '}
                  <strong>{credits * 10}</strong> (10 marks per credit).
                </span>
              </div>
            </div>
          )}

          {/* Below 60% Attendance Warning */}
          {attResult.isBelowSixty && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Non-Collegiate Attendance Warning:</strong> Attendance is below 60%. Under BUET regulations, students with attendance &lt; 60% may be declared non-collegiate or debarred from sitting for the final exam.
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* CLASS TESTS (CT) SECTION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Class Tests (CT Marks out of 20)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {credits + 1} CTs are conducted; the best {credits} count towards {credits * 20} marks.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium mr-1.5">Best {credits} CTs:</span>
            <span className="text-base font-bold font-mono text-indigo-700">
              {ctResult.totalMarks} / {ctResult.maxMarks}
            </span>
          </div>
        </div>

        {/* CT Input Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {ctResult.items.map((item) => {
            const ctKey = `${courseKey}#${item.index}`;
            const rawVal = ctMarks[ctKey] ?? '';

            return (
              <div
                key={item.index}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                  item.isCounted
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                    : item.value !== null
                    ? 'bg-slate-50/80 border-slate-300 opacity-70'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">CT {item.index + 1}</span>
                  {item.isCounted ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Best
                    </span>
                  ) : item.value !== null ? (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-md">
                      Dropped
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">/ 20</span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    placeholder="—"
                    value={rawVal}
                    onChange={(e) => onSetCtMark(ctKey, e.target.value)}
                    className="w-full bg-white border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTINUOUS ASSESSMENT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Attendance Marks</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{attResult.marks}</span>
            <span className="text-xs text-slate-400">/ {attResult.maxMarks}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Input: {activeMode === 'percentage' ? `${attResult.percentage}%` : 'Direct Marks'}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Best CT Marks</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{ctResult.totalMarks}</span>
            <span className="text-xs text-slate-400">/ {ctResult.maxMarks}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {ctResult.enteredCount} of {credits + 1} CTs entered
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 border border-indigo-200/90 rounded-2xl p-4 sm:p-4.5 shadow-2xs">
          <div className="text-xs font-semibold text-indigo-700">Total Continuous Assessment</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-indigo-900">{continuousTotal}</span>
            <span className="text-xs font-semibold text-indigo-600">/ {continuousMax}</span>
          </div>
          <div className="text-[11px] text-indigo-600/90 mt-1 font-medium">
            {continuousMax > 0 ? Math.round((continuousTotal / continuousMax) * 100) : 0}% secured before final exam
          </div>
        </div>
      </div>

      {/* FINAL EXAM NEEDED MATRIX */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
        <div className="mb-3.5">
          <h2 className="text-sm font-bold text-slate-900">Marks Needed in Final Exam ({credits * 70} max)</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Based on your secured attendance ({attResult.marks}) and best CTs ({ctResult.totalMarks}), here is what you need in the term final:
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-3.5">Grade</th>
                <th className="py-3 px-3.5">Cutoff Total</th>
                <th className="py-3 px-3.5">Needed in Final</th>
                <th className="py-3 px-3.5">Final % Req</th>
                <th className="py-3 px-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalExamRows.map((row) => {
                let badgeClass = '';
                let badgeLabel = '';

                if (row.status === 'secured') {
                  badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  badgeLabel = 'Secured!';
                } else if (row.status === 'unreachable') {
                  badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                  badgeLabel = 'Not Reachable';
                } else if (row.status === 'comfortable') {
                  badgeClass = 'bg-teal-50 text-teal-700 border-teal-200';
                  badgeLabel = 'Comfortable';
                } else if (row.status === 'moderate') {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  badgeLabel = 'Moderate';
                } else {
                  badgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
                  badgeLabel = 'High Target';
                }

                return (
                  <tr key={row.gradeLetter} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {row.gradeLetter}
                      <span className="ml-1.5 text-xs font-normal text-slate-400 font-mono">
                        ({row.gradePoint.toFixed(2)})
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600">{row.minTotalRequired}</td>
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-800">
                      {row.status === 'secured' ? (
                        <span className="text-emerald-700 font-bold">0 / {row.finalExamMax}</span>
                      ) : row.status === 'unreachable' ? (
                        <span className="text-rose-600">—</span>
                      ) : (
                        <span>
                          {Math.ceil(row.marksNeededInFinal)} / {row.finalExamMax}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono">
                      {row.status === 'secured' ? (
                        <span className="text-emerald-600">0%</span>
                      ) : row.status === 'unreachable' ? (
                        <span className="text-rose-500 font-bold">&gt; 100%</span>
                      ) : (
                        <span>{Math.ceil(row.percentageNeeded)}%</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3.5 text-[11px] text-slate-400 leading-relaxed">
          * Final Needed = Grade cutoff - Attendance - Best CTs. In BUET, theory finals have two sections: Section A ({credits * 35} marks) and Section B ({credits * 35} marks).
        </div>
      </div>
    </div>
  );
};
