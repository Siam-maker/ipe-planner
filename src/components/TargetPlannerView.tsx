import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, ShieldAlert, Award, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Course, CourseStrength } from '../types';
import { getCourseKey } from '../data/curriculum';
import { calculateTargetPlan } from '../utils/calculator';

interface TargetPlannerViewProps {
  level: number;
  term: number;
  courses: Course[];
  targetGpa: number;
  onSetTargetGpa: (gpa: number) => void;
  strengths: Record<string, CourseStrength>;
  onSetStrength: (courseKey: string, s: CourseStrength) => void;
}

export const TargetPlannerView: React.FC<TargetPlannerViewProps> = ({
  level,
  term,
  courses,
  targetGpa,
  onSetTargetGpa,
  strengths,
  onSetStrength,
}) => {
  const eligibleCourses = useMemo(() => courses.filter((c) => !c.notGraded), [courses]);

  const planResult = useMemo(() => {
    return calculateTargetPlan(courses, targetGpa, strengths, (c) => getCourseKey(level, term, c));
  }, [courses, targetGpa, strengths, level, term]);

  // Quick helper to auto-tune strengths if target is currently unreachable
  const handleAutoTune = () => {
    eligibleCourses.forEach((c) => {
      const key = getCourseKey(level, term, c.code);
      onSetStrength(key, 'S');
    });
  };

  const strengthCounts = useMemo(() => {
    let strong = 0;
    let avg = 0;
    let weak = 0;
    eligibleCourses.forEach((c) => {
      const s = strengths[getCourseKey(level, term, c.code)] || 'A';
      if (s === 'S') strong++;
      else if (s === 'A') avg++;
      else weak++;
    });
    return { strong, avg, weak };
  }, [eligibleCourses, strengths, level, term]);

  return (
    <div className="space-y-5">
      {/* Target Setting Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Target Term GPA
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Set your target GPA and mark course strengths to find your minimum grade blueprint.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-indigo-50/80 border border-indigo-100 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            <input
              type="number"
              min="2.00"
              max="4.00"
              step="0.01"
              value={targetGpa}
              onChange={(e) => onSetTargetGpa(Math.max(2, Math.min(4, Number(e.target.value) || 2)))}
              className="w-16 bg-transparent text-xl font-black font-mono text-indigo-900 focus:outline-hidden text-right"
            />
            <span className="text-xs font-semibold text-indigo-500">/ 4.00</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Target Presets
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
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
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <span className="font-mono text-xs sm:text-sm">{p.label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {p.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Strength Legend Pills (Clean & De-congested) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800">Strong:</span>{' '}
              <span className="text-slate-500">Aim for A+ (4.00)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800">Average:</span>{' '}
              <span className="text-slate-500">Aim for A (3.75)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800">Weak:</span>{' '}
              <span className="text-slate-500">Aim for A- (3.50)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Feasibility Summary */}
      {!planResult.achievable ? (
        <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 sm:p-5 text-rose-900 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-sm text-rose-950">
                Target Unreachable with Current Strengths
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                Maximum attainable GPA is{' '}
                <strong className="font-mono font-bold text-rose-950 text-sm">
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Set all courses to Strong
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-4.5 text-emerald-950 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-950">Plan is Achievable</div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Target <span className="font-mono font-bold">{targetGpa.toFixed(2)}</span> · Minimum plan yields{' '}
                <span className="font-mono font-bold text-emerald-950">≥ {planResult.projectedGpa.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <span className="text-xs font-bold font-mono bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-300 shrink-0">
            ≥ {planResult.projectedGpa.toFixed(2)}
          </span>
        </div>
      )}

      {/* Courses Strength Distribution Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <span>Graded Courses ({eligibleCourses.length})</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-700 font-semibold">{strengthCounts.strong} Strong</span>
          <span className="text-slate-300">·</span>
          <span className="text-blue-700 font-semibold">{strengthCounts.avg} Average</span>
          <span className="text-slate-300">·</span>
          <span className="text-amber-700 font-semibold">{strengthCounts.weak} Weak</span>
        </div>
      </div>

      {/* Spacious, De-congested Course Cards */}
      <div className="space-y-3">
        {planResult.courses.map((c) => {
          const key = getCourseKey(level, term, c.code);
          const currentStrength = strengths[key] || 'A';

          return (
            <div
              key={c.code}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm space-y-3"
            >
              {/* Card Header: Code & Title on Left, Minimum Required Grade Badge on Right */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-slate-900 tracking-tight">
                      {c.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {c.credits} cr
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                    {c.name}
                  </h3>
                </div>

                {/* Minimum Grade Needed Pill (Prominent and clear) */}
                <div className="shrink-0 text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Target Grade
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-black font-mono px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    ≥ {c.minimumGradeLetter}
                  </span>
                </div>
              </div>

              {/* Bottom Interactive Row: 3-Pill Strength Toggle + Impact Stat */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* 3-Button Segmented Selector for Course Strength */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
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
                        className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-lg transition-all select-none ${
                          isSelected
                            ? opt.id === 'S'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : opt.id === 'A'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Status & Margin Note */}
                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                      !c.isAtCap
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : c.strength === 'W'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {!c.isAtCap ? 'Can slip 1 grade' : 'Must hold this grade'}
                  </span>
                  <span className="text-slate-400 font-medium text-[11px]">
                    Cost: <strong className="font-mono text-slate-700">−{c.penaltyPerGradeDrop.toFixed(3)}</strong> GPA
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
