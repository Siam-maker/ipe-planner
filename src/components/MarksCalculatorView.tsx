import React, { useMemo, useRef } from 'react';
import {
  Percent,
  Award,
  AlertTriangle,
  Info,
  CheckCircle,
  Calculator,
} from 'lucide-react';
import { AttendanceInputMode, Course } from '../types';
import { getCourseKey } from '../data/curriculum';
import {
  calculateAttendance,
  calculateCTMarks,
  calculateFinalNeeded,
} from '../utils/calculator';
import { exportElementToPdf } from '../utils/pdfExport';
import { DownloadPdfButton } from './DownloadPdfButton';

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
  studentName?: string;
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
  studentName = 'Adam',
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
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

  // Top achievable grade with reasonable final exam performance
  const topComfortableGrade = useMemo(() => {
    const comfortable = finalExamRows.find((r) => r.status === 'comfortable' || r.status === 'secured');
    if (comfortable) return comfortable;
    const moderate = finalExamRows.find((r) => r.status === 'moderate');
    if (moderate) return moderate;
    return finalExamRows[0];
  }, [finalExamRows]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !currentCourse) return;
    await exportElementToPdf({
      element: reportRef.current,
      fileName: `BUET_IPE_Marks_Finals_${currentCourse.code}_${studentName.replace(/\s+/g, '_')}.pdf`,
      reportTitle: `Continuous Assessment & Finals Analysis · ${currentCourse.code}: ${currentCourse.name}`,
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
            <Calculator className="w-6 h-6 text-[#C65D3B] dark:text-[#D96D4B]" />
            <span>Marks &amp; Finals Calculator</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A098] mt-0.5">
            Calculate continuous assessment (Attendance + CT) and required marks in BUET Term Finals.
          </p>
        </div>

        <DownloadPdfButton onDownload={handleDownloadPdf} label="Download Marks Sheet PDF" />
      </div>

      <div ref={reportRef} className="space-y-5">
      {/* Course Selector & Breakdown Header */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <label
            htmlFor="course-select"
            className="text-xs font-bold text-[#8C827A] uppercase tracking-wider font-mono"
          >
            Select Theory Course
          </label>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EBE4D8] dark:bg-[#2E2824] text-[#C65D3B] dark:text-[#E8B04A] border border-[#DCD3C5] dark:border-[#423932] whitespace-nowrap">
              Total: {credits * 100} marks
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EBE4D8] dark:bg-[#2A2622] text-[#2B2622] dark:text-[#E2DACF] border border-[#DCD3C5] dark:border-[#38322D] whitespace-nowrap">
              Final: {credits * 70} marks
            </span>
          </div>
        </div>

        {/* Full-width select dropdown */}
        <select
          id="course-select"
          value={courseKey}
          onChange={(e) => onSelectCourseKey(e.target.value)}
          className="w-full bg-[#EBE4D8] dark:bg-[#282320] border border-[#DCD3C5] dark:border-[#3E3832] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#2B2622] dark:text-[#F5F1EA] focus:outline-hidden focus:border-[#C65D3B] transition-all cursor-pointer"
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
        <div className="pt-2 border-t border-[#E2DACF]/70 dark:border-[#38322D] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6E655F] dark:text-[#A8A098] leading-relaxed">
          <span>
            Attendance: <strong className="text-[#2B2622] dark:text-[#F5F1EA] font-semibold">{credits * 10}</strong> marks
          </span>
          <span className="text-[#8C827A]">·</span>
          <span>
            Class Tests: <strong className="text-[#2B2622] dark:text-[#F5F1EA] font-semibold">{credits * 20}</strong> marks ({credits + 1} CTs of 20, best {credits} count)
          </span>
          <span className="text-[#8C827A]">·</span>
          <span>
            Term Final: <strong className="text-[#2B2622] dark:text-[#F5F1EA] font-semibold">{credits * 70}</strong> marks
          </span>
        </div>
      </div>

      {/* ATTENDANCE SECTION */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C65D3B] dark:text-[#D96D4B]" />
              Attendance Input Method
            </h3>
            <p className="text-xs text-[#6E655F] dark:text-[#A8A098] mt-0.5">
              Choose either attendance percentage (%) or direct marks.
            </p>
          </div>

          {/* DUAL MODE SELECTOR BUTTONS */}
          <div className="flex items-center gap-2">
            <div className="no-print flex items-center bg-[#EBE4D8] dark:bg-[#282320] p-1 rounded-xl self-start sm:self-auto border border-[#DCD3C5] dark:border-[#3E3832]">
              <button
                type="button"
                onClick={() => onSetAttendanceMode(courseKey, 'percentage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
                  activeMode === 'percentage'
                    ? 'bg-[#C65D3B] text-white shadow-xs'
                    : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Attendance %</span>
              </button>

              <button
                type="button"
                onClick={() => onSetAttendanceMode(courseKey, 'marks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
                  activeMode === 'marks'
                    ? 'bg-[#C65D3B] text-white shadow-xs'
                    : 'text-[#6E655F] dark:text-[#A8A098] hover:text-[#2B2622] dark:hover:text-[#F5F1EA]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Direct Marks</span>
              </button>
            </div>
            <span className="hidden print-badge font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EBE4D8] text-[#2B2622] border border-[#DCD3C5]">
              Method: {activeMode === 'percentage' ? 'Attendance %' : 'Direct Marks'}
            </span>
          </div>
        </div>

        {/* ATTENDANCE INPUT FIELDS */}
        {activeMode === 'percentage' ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-60">
                <label
                  htmlFor="att-pct-input"
                  className="block text-xs font-semibold text-[#2B2622] dark:text-[#F5F1EA] mb-1"
                >
                  Attendance Percentage (%):
                </label>
                <div className="relative">
                  <input
                    id="att-pct-input"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 85"
                    value={currentPctVal}
                    onChange={(e) => onSetAttendancePct(courseKey, e.target.value)}
                    className="w-full bg-[#EBE4D8] dark:bg-[#282320] border border-[#DCD3C5] dark:border-[#3E3832] rounded-xl px-3.5 py-2 text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] focus:border-[#C65D3B] focus:outline-hidden"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C827A]">
                    %
                  </span>
                </div>
              </div>

              {/* Attendance Quick Presets */}
              <div className="no-print flex flex-wrap items-center gap-1.5">
                {[60, 70, 75, 80, 85, 90, 95, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onSetAttendancePct(courseKey, String(preset))}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#EBE4D8] dark:bg-[#2B2622] text-[#2B2622] dark:text-[#E2DACF] hover:bg-[#E2D8C9] border border-[#DCD3C5] dark:border-[#38322D] transition-colors cursor-pointer"
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {attResult.isBelowSixty && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>BUET Ordinance Warning:</strong> Attendance below 60% leads to Non-Collegiate status and disqualification from final examinations.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full sm:w-60">
              <label
                htmlFor="att-marks-input"
                className="block text-xs font-semibold text-[#2B2622] dark:text-[#F5F1EA] mb-1"
              >
                Attendance Marks (Max {attResult.maxMarks}):
              </label>
              <input
                id="att-marks-input"
                type="number"
                min="0"
                max={attResult.maxMarks}
                step="0.5"
                placeholder={`0 to ${attResult.maxMarks}`}
                value={currentDirectVal}
                onChange={(e) => onSetAttendanceDirectMarks(courseKey, e.target.value)}
                className="w-full bg-[#EBE4D8] dark:bg-[#282320] border border-[#DCD3C5] dark:border-[#3E3832] rounded-xl px-3.5 py-2 text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] focus:border-[#C65D3B] focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* CLASS TESTS (CT) SECTION */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C65D3B] dark:text-[#D96D4B]" />
              Class Tests ({credits + 1} CTs total, best {credits} count)
            </h3>
            <p className="text-xs text-[#6E655F] dark:text-[#A8A098] mt-0.5">
              Each CT is out of 20 marks. The lowest mark is automatically dropped.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#6E655F] dark:text-[#A8A098] font-medium mr-1.5">Best {credits} CTs:</span>
            <span className="text-base font-bold font-mono text-[#C65D3B] dark:text-[#D96D4B]">
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
                    ? 'bg-[#5B6B4E]/10 dark:bg-[#738563]/15 border-[#5B6B4E]/40'
                    : item.value !== null
                    ? 'bg-[#EBE4D8]/50 dark:bg-[#282320] border-[#DCD3C5] dark:border-[#3E3832] opacity-70'
                    : 'bg-[#FAF6F0] dark:bg-[#24201D] border-[#E2DACF] dark:border-[#38322D]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#2B2622] dark:text-[#F5F1EA]">CT {item.index + 1}</span>
                  {item.isCounted ? (
                    <span className="text-[10px] font-bold text-[#5B6B4E] dark:text-[#A3B899] bg-[#5B6B4E]/15 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-mono">
                      <CheckCircle className="w-2.5 h-2.5" /> Best
                    </span>
                  ) : item.value !== null ? (
                    <span className="text-[10px] font-semibold text-[#8C827A] bg-[#EBE4D8] dark:bg-[#2B2622] px-1.5 py-0.5 rounded-md font-mono">
                      Dropped
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#8C827A] font-mono">/ 20</span>
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
                    className="w-full bg-[#EBE4D8] dark:bg-[#282320] border border-[#DCD3C5] dark:border-[#3E3832] rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA] focus:border-[#C65D3B] transition-all text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTINUOUS ASSESSMENT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-4.5 shadow-2xs">
          <div className="text-xs font-semibold text-[#6E655F] dark:text-[#A8A098]">Attendance Marks</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#2B2622] dark:text-[#F5F1EA]">{attResult.marks}</span>
            <span className="text-xs text-[#8C827A]">/ {attResult.maxMarks}</span>
          </div>
          <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] mt-1 font-mono">
            Input: {activeMode === 'percentage' ? `${attResult.percentage}%` : 'Direct Marks'}
          </div>
        </div>

        <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-4.5 shadow-2xs">
          <div className="text-xs font-semibold text-[#6E655F] dark:text-[#A8A098]">Best CT Marks</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#2B2622] dark:text-[#F5F1EA]">{ctResult.totalMarks}</span>
            <span className="text-xs text-[#8C827A]">/ {ctResult.maxMarks}</span>
          </div>
          <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] mt-1 font-mono">
            {ctResult.enteredCount} of {credits + 1} CTs entered
          </div>
        </div>

        <div className="bg-[#EBE4D8] dark:bg-[#2B2622] border border-[#DCD3C5] dark:border-[#423932] rounded-2xl p-4 sm:p-4.5 shadow-2xs">
          <div className="text-xs font-semibold text-[#C65D3B] dark:text-[#E8B04A] font-mono">Total Continuous Assessment</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#2B2622] dark:text-[#F5F1EA]">{continuousTotal}</span>
            <span className="text-xs font-semibold text-[#C65D3B] dark:text-[#D96D4B]">/ {continuousMax}</span>
          </div>
          <div className="text-[11px] text-[#6E655F] dark:text-[#A8A098] mt-1 font-mono">
            {continuousMax > 0 ? Math.round((continuousTotal / continuousMax) * 100) : 0}% secured before final exam
          </div>
        </div>
      </div>

      {/* ESTIMATED GRADE RESULT BOX */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#5B6B4E]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B4E] dark:text-[#A3B899] font-mono">
            Projected Course Standing
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#2B2622] dark:text-[#F5F1EA] mt-0.5">
            Estimated Grade: <span className="text-[#C65D3B] dark:text-[#D96D4B]">{topComfortableGrade.gradeLetter}</span> ({topComfortableGrade.gradePoint.toFixed(2)})
          </div>
          <p className="text-xs text-[#6E655F] dark:text-[#A8A098] mt-1">
            Based on your secured {continuousTotal} continuous marks and course rules. Requires {Math.ceil(topComfortableGrade.marksNeededInFinal)} / {credits * 70} in the Final Exam.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold font-mono px-3.5 py-2 rounded-xl bg-[#5B6B4E] text-white shadow-xs">
            {Math.round(topComfortableGrade.percentageNeeded)}% Needed in Final
          </span>
        </div>
      </div>

      {/* FINAL EXAM NEEDED MATRIX */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38322D] rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden">
        <div className="mb-3.5">
          <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#F5F1EA]">
            Marks Needed in Final Exam ({credits * 70} max)
          </h3>
          <p className="text-xs text-[#6E655F] dark:text-[#A8A098] mt-1 leading-relaxed">
            Based on your secured attendance ({attResult.marks}) and best CTs ({ctResult.totalMarks}), here is what you need in the term final:
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E2DACF] dark:border-[#38322D] text-[#8C827A] text-xs uppercase tracking-wider font-semibold font-mono">
                <th className="py-3 px-3.5">Grade</th>
                <th className="py-3 px-3.5">Cutoff Total</th>
                <th className="py-3 px-3.5">Needed in Final</th>
                <th className="py-3 px-3.5">Final % Req</th>
                <th className="py-3 px-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DACF]/70 dark:divide-[#38322D] font-mono">
              {finalExamRows.map((row) => {
                let badgeClass = '';
                let badgeLabel = '';

                if (row.status === 'secured') {
                  badgeClass = 'bg-[#5B6B4E]/15 text-[#5B6B4E] dark:bg-[#738563]/25 dark:text-[#A3B899] border-[#5B6B4E]/30';
                  badgeLabel = 'Secured!';
                } else if (row.status === 'unreachable') {
                  badgeClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';
                  badgeLabel = 'Not Reachable';
                } else if (row.status === 'comfortable') {
                  badgeClass = 'bg-[#5B6B4E]/15 text-[#5B6B4E] dark:bg-[#738563]/25 dark:text-[#A3B899] border-[#5B6B4E]/30';
                  badgeLabel = 'Comfortable';
                } else if (row.status === 'moderate') {
                  badgeClass = 'bg-[#E8B04A]/20 text-[#A6751C] dark:text-[#F0BC59] border-[#E8B04A]/30';
                  badgeLabel = 'Moderate';
                } else {
                  badgeClass = 'bg-[#C65D3B]/15 text-[#C65D3B] dark:text-[#D96D4B] border-[#C65D3B]/30';
                  badgeLabel = 'High Target';
                }

                return (
                  <tr key={row.gradeLetter} className="hover:bg-[#EBE4D8]/50 dark:hover:bg-[#2A2622] transition-colors">
                    <td className="py-3 px-3.5 font-bold text-[#2B2622] dark:text-[#F5F1EA]">
                      {row.gradeLetter}
                      <span className="ml-1.5 text-xs font-normal text-[#8C827A]">
                        ({row.gradePoint.toFixed(2)})
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[#6E655F] dark:text-[#A8A098]">{row.minTotalRequired}</td>
                    <td className="py-3 px-3.5 font-semibold text-[#2B2622] dark:text-[#F5F1EA]">
                      {row.status === 'secured' ? (
                        <span className="text-[#5B6B4E] dark:text-[#A3B899] font-bold">0 / {row.finalExamMax}</span>
                      ) : row.status === 'unreachable' ? (
                        <span className="text-rose-600 dark:text-rose-400">—</span>
                      ) : (
                        <span>
                          {Math.ceil(row.marksNeededInFinal)} / {row.finalExamMax}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      {row.status === 'secured' ? (
                        <span className="text-[#5B6B4E] dark:text-[#A3B899]">0%</span>
                      ) : row.status === 'unreachable' ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">&gt; 100%</span>
                      ) : (
                        <span>{Math.ceil(row.percentageNeeded)}%</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-sans">
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

        <div className="mt-3.5 text-[11px] text-[#8C827A] leading-relaxed font-sans">
          * Final Needed = Grade cutoff - Attendance - Best CTs. In BUET, theory finals have two sections: Section A ({credits * 35} marks) and Section B ({credits * 35} marks).
        </div>
      </div>
      </div>
    </div>
  );
};
