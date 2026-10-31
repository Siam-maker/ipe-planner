import React, { useMemo, useRef } from 'react';
import { Target, ShieldAlert, Award, Sparkles } from 'lucide-react';
import { Course, CourseStrength } from '../types';
import { getCourseKey } from '../data/curriculum';
import { calculateTargetPlan } from '../utils/calculator';
import { exportElementToPdf } from '../utils/pdfExport';
import { DownloadPdfButton } from './DownloadPdfButton';

interface TargetPlannerViewProps {
  level: number;
  term: number;
  courses: Course[];
  targetGpa: number;
  onSetTargetGpa: (gpa: number) => void;
  strengths: Record<string, CourseStrength>;
  onSetStrength: (courseKey: string, s: CourseStrength) => void;
  studentName?: string;
}

export const TargetPlannerView: React.FC<TargetPlannerViewProps> = ({
  level,
  term,
  courses,
  targetGpa,
  onSetTargetGpa,
  strengths,
  onSetStrength,
  studentName = 'Adam',
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const eligibleCourses = useMemo(() => courses.filter((c) => !c.notGraded), [courses]);

  const planResult = useMemo(() => {
    return calculateTargetPlan(courses, targetGpa, strengths, (c) => getCourseKey(level, term, c));
  }, [courses, targetGpa, strengths, level, term]);

  // Auto-tune strengths if target is currently unreachable
  const handleAutoTune = () => {
    eligibleCourses.forEach((c) => {
      const key = getCourseKey(level, term, c.code);
      onSetStrength(key, 'S');
    });
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    await exportElementToPdf({
      element: reportRef.current,
      fileName: `BUET_IPE_Target_Strategy_L${level}T${term}_${studentName.replace(/\s+/g, '_')}.pdf`,
      reportTitle: `Target GPA Strategy Plan · Level ${level} Term ${term === 1 ? 'I' : 'II'}`,
      studentName,
      level,
      term,
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2.5">
            <Target className="w-6 h-6 text-[#C65D3B]" />
            <span>Target GPA Blueprint &amp; Strategy</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A199] mt-1">
            Map out the minimum letter grade you need in each course to hit your goal.
          </p>
        </div>

        <DownloadPdfButton onDownload={handleDownloadPdf} label="Download Target Plan PDF" />
      </div>

      <div ref={reportRef} className="space-y-6">
      {/* Target Setting Card */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE9DF] dark:border-[#2E2924]">
          <div>
            <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1] uppercase tracking-wider">
              Target Term GPA
            </h3>
            <p className="text-xs text-[#6E655F] dark:text-[#A8A199] mt-0.5">
              Set your target GPA and classify courses by your confidence level.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] px-4 py-2 rounded-xl self-start sm:self-auto">
            <input
              type="number"
              min="2.00"
              max="4.00"
              step="0.01"
              value={targetGpa}
              onChange={(e) => onSetTargetGpa(Math.max(2, Math.min(4, Number(e.target.value) || 2)))}
              className="w-16 bg-transparent text-xl font-black font-mono text-[#2B2622] dark:text-[#EDE8E1] focus:outline-hidden text-right"
            />
            <span className="text-xs font-semibold text-[#6E655F] dark:text-[#A8A199]">/ 4.00</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="no-print">
          <div className="text-[11px] font-bold text-[#6E655F] dark:text-[#A8A199] uppercase tracking-wider mb-2">
            Target Presets
          </div>
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {[
              { val: 4.0, label: '4.00', sub: 'Max' },
              { val: 3.85, label: '3.85', sub: 'Dean' },
              { val: 3.75, label: '3.75', sub: 'Honors' },
              { val: 3.5, label: '3.50', sub: 'Good' },
              { val: 3.25, label: '3.25', sub: 'Pass' },
            ].map((p) => {
              const isActive = Math.abs(targetGpa - p.val) < 0.01;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => onSetTargetGpa(p.val)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition-all select-none border ${
                    isActive
                      ? 'bg-[#C65D3B] text-white border-[#C65D3B] shadow-2xs font-bold'
                      : 'bg-[#F2EEE6] dark:bg-[#282420] text-[#2B2622] dark:text-[#EDE8E1] border-[#E8E2D9] dark:border-[#38312B] hover:bg-[#EBE4D8] dark:hover:bg-[#342E29] font-semibold'
                  }`}
                >
                  <span className="font-mono text-xs sm:text-sm">{p.label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-amber-100' : 'text-[#6E655F] dark:text-[#A8A199]'}`}>
                    {p.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Strength Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B6B4E] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[#2B2622] dark:text-[#EDE8E1]">Strong:</span>{' '}
              <span className="text-[#6E655F] dark:text-[#A8A199]">Aim for A+ (4.00)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C65D3B] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[#2B2622] dark:text-[#EDE8E1]">Average:</span>{' '}
              <span className="text-[#6E655F] dark:text-[#A8A199]">Aim for A (3.75)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8B04A] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-[#2B2622] dark:text-[#EDE8E1]">Weak:</span>{' '}
              <span className="text-[#6E655F] dark:text-[#A8A199]">Aim for A- (3.50)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Feasibility Summary */}
      {!planResult.achievable ? (
        <div className="bg-[#FAF6F0] dark:bg-[#2A201E] border border-[#E28364]/40 rounded-2xl p-4 sm:p-5 text-[#2B2622] dark:text-[#EDE8E1] shadow-2xs space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#C65D3B] shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-sm text-[#C65D3B]">
                Target Unreachable with Current Strengths
              </h4>
              <p className="text-xs text-[#6E655F] dark:text-[#C2B9AC] leading-relaxed">
                Maximum attainable GPA is{' '}
                <strong className="font-mono font-bold text-[#2B2622] dark:text-white text-sm">
                  {planResult.maxPossibleGpa.toFixed(2)}
                </strong>
                . To reach{' '}
                <strong className="font-mono font-bold">{targetGpa.toFixed(2)}</strong>, mark more courses as Strong.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoTune}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#C65D3B] hover:bg-[#B34E2D] text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Set all courses to Strong
          </button>
        </div>
      ) : (
        <div className="bg-[#FAF6F0] dark:bg-[#1E241B] border border-[#5B6B4E]/40 rounded-2xl p-4 sm:p-5 text-[#2B2622] dark:text-[#EDE8E1] shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#5B6B4E] shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#5B6B4E] dark:text-[#8FA67C]">Plan is Achievable</div>
              <p className="text-xs text-[#6E655F] dark:text-[#C2B9AC] mt-0.5">
                Target <span className="font-mono font-bold">{targetGpa.toFixed(2)}</span> · Minimum plan yields{' '}
                <span className="font-mono font-bold text-[#2B2622] dark:text-white">≥ {planResult.projectedGpa.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-bold font-mono bg-[#5B6B4E]/15 text-[#44513A] dark:text-[#A7BF95] px-3 py-1.5 rounded-xl border border-[#5B6B4E]/30 shrink-0">
            ≥ {planResult.projectedGpa.toFixed(2)}
          </span>
        </div>
      )}

      {/* Course Strength Breakdown List */}
      <div className="space-y-3">
        {planResult.courses.map((c) => {
          const key = getCourseKey(level, term, c.code);
          const currentStrength = strengths[key] || 'A';

          return (
            <div
              key={c.code}
              className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-[#2B2622] dark:text-[#EDE8E1] tracking-tight">
                      {c.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EBE4D8] dark:bg-[#2E2924] text-[#6E655F] dark:text-[#C2B9AC]">
                      {c.credits} cr
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#6E655F] dark:text-[#A8A199] leading-snug">
                    {c.name}
                  </h4>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-bold text-[#6E655F] dark:text-[#A8A199] uppercase tracking-wider mb-0.5">
                    Target Grade
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-black font-mono px-3 py-1 rounded-xl bg-[#C65D3B]/10 dark:bg-[#C65D3B]/20 text-[#C65D3B] dark:text-[#E28364] border border-[#C65D3B]/30">
                    ≥ {c.minimumGradeLetter}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE9DF] dark:border-[#2E2924] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="no-print flex items-center bg-[#F2EEE6] dark:bg-[#1C1A18] p-1 rounded-xl w-full sm:w-auto">
                    {(
                      [
                        { id: 'S', label: 'Strong' },
                        { id: 'A', label: 'Average' },
                        { id: 'W', label: 'Weak' },
                      ] as const
                    ).map((opt) => {
                      const isSelected = currentStrength === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onSetStrength(key, opt.id)}
                          className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all select-none ${
                            isSelected
                              ? opt.id === 'S'
                                ? 'bg-[#5B6B4E] text-white shadow-2xs'
                                : opt.id === 'A'
                                ? 'bg-[#C65D3B] text-white shadow-2xs'
                                : 'bg-[#E8B04A] text-[#2B2622] font-bold shadow-2xs'
                              : 'text-[#6E655F] dark:text-[#A8A199] hover:text-[#2B2622] dark:hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="hidden print-badge font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EBE4D8] text-[#2B2622] border border-[#DCD3C5]">
                    Confidence: {currentStrength === 'S' ? 'Strong (Aim: A+)' : currentStrength === 'A' ? 'Average (Aim: A)' : 'Weak (Aim: ≤ B)'}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                      !c.isAtCap
                        ? 'bg-[#5B6B4E]/15 text-[#44513A] dark:text-[#A7BF95] border border-[#5B6B4E]/30'
                        : c.strength === 'W'
                        ? 'bg-[#C65D3B]/15 text-[#A64525] dark:text-[#E28364] border border-[#C65D3B]/30'
                        : 'bg-[#E8B04A]/20 text-[#91620E] dark:text-[#E8B04A] border border-[#E8B04A]/30'
                    }`}
                  >
                    {!c.isAtCap ? 'Can slip 1 grade' : 'Must hold this grade'}
                  </span>
                  <span className="text-[#6E655F] dark:text-[#A8A199] font-medium text-[11px]">
                    Cost: <strong className="font-mono text-[#2B2622] dark:text-white">−{c.penaltyPerGradeDrop.toFixed(3)}</strong> GPA
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
