import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
  Plus,
  BookOpen,
  Flame,
  Check,
  Trash2,
} from 'lucide-react';
import { Course, StudySessionLog, TopicStatus } from '../types';
import { getCourseKey } from '../data/curriculum';
import { generateSmartStudyPlan } from '../utils/calculator';

interface PlannerTimerViewProps {
  level: number;
  term: number;
  courses: Course[];
  topicStatuses: Record<string, TopicStatus>;
  doneTopics: Record<string, boolean>;
  examDates: Record<string, string>;
  dailyStudyHours: number;
  studyLogs: StudySessionLog[];
  onSetExamDate: (courseKey: string, dateStr: string) => void;
  onSetDailyStudyHours: (hours: number) => void;
  onSetTopicStatus: (topicKey: string, status: TopicStatus) => void;
  onAddStudyLog: (courseKey: string, courseCode: string, minutes: number) => void;
  onClearStudyLogs?: () => void;
}

const STATUS_LABELS: Record<TopicStatus, { label: string; bg: string; text: string }> = {
  not_started: { label: 'Not started', bg: 'bg-slate-100', text: 'text-slate-600' },
  in_progress: { label: 'In progress', bg: 'bg-amber-50', text: 'text-amber-700' },
  studied: { label: 'Studied', bg: 'bg-blue-50', text: 'text-blue-700' },
  revised: { label: 'Revised', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  confident: { label: 'Confident', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

const TIMER_PRESETS = [
  { id: 'pomodoro', label: 'Focus 25m', minutes: 25, isBreak: false },
  { id: 'deep', label: 'Deep 50m', minutes: 50, isBreak: false },
  { id: 'short_break', label: 'Short Break 5m', minutes: 5, isBreak: true },
  { id: 'long_break', label: 'Long Break 15m', minutes: 15, isBreak: true },
];

export const PlannerTimerView: React.FC<PlannerTimerViewProps> = ({
  level,
  term,
  courses,
  topicStatuses,
  doneTopics,
  examDates,
  dailyStudyHours,
  studyLogs,
  onSetExamDate,
  onSetDailyStudyHours,
  onSetTopicStatus,
  onAddStudyLog,
}) => {
  const [selectedTimerCourse, setSelectedTimerCourse] = useState<string>(
    () => courses[0]?.code ?? ''
  );
  const [activePreset, setActivePreset] = useState(TIMER_PRESETS[0]);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_PRESETS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!courses.some((c) => c.code === selectedTimerCourse) && courses.length > 0) {
      setSelectedTimerCourse(courses[0].code);
    }
  }, [courses, selectedTimerCourse]);

  // Countdown interval for Pomodoro Timer
  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          if (!activePreset.isBreak && selectedTimerCourse) {
            const cKey = getCourseKey(level, term, selectedTimerCourse);
            onAddStudyLog(cKey, selectedTimerCourse, activePreset.minutes);
            setSessionCompletedMsg(
              `Logged ${activePreset.minutes} mins for ${selectedTimerCourse}!`
            );
            setTimeout(() => setSessionCompletedMsg(null), 4000);
          }
          return activePreset.minutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, activePreset, selectedTimerCourse, level, term, onAddStudyLog]);

  const handleSelectPreset = (preset: (typeof TIMER_PRESETS)[0]) => {
    setIsRunning(false);
    setActivePreset(preset);
    setSecondsLeft(preset.minutes * 60);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(activePreset.minutes * 60);
  };

  const handleLogElapsedNow = () => {
    const elapsedSeconds = activePreset.minutes * 60 - secondsLeft;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (selectedTimerCourse) {
      const cKey = getCourseKey(level, term, selectedTimerCourse);
      onAddStudyLog(cKey, selectedTimerCourse, elapsedMinutes);
      setSessionCompletedMsg(`Logged ${elapsedMinutes} mins for ${selectedTimerCourse}!`);
      setTimeout(() => setSessionCompletedMsg(null), 3500);
    }
    handleResetTimer();
  };

  const handleQuickLogMinutes = (mins: number) => {
    if (!selectedTimerCourse) return;
    const cKey = getCourseKey(level, term, selectedTimerCourse);
    onAddStudyLog(cKey, selectedTimerCourse, mins);
    setSessionCompletedMsg(`Added +${mins}m to ${selectedTimerCourse}`);
    setTimeout(() => setSessionCompletedMsg(null), 3000);
  };

  // Auto-fill sample exam schedule starting 5 days from today
  const handleFillSampleSchedule = () => {
    const base = new Date();
    courses.forEach((c, idx) => {
      const d = new Date(base);
      d.setDate(base.getDate() + 5 + idx * 3);
      const iso = d.toISOString().slice(0, 10);
      onSetExamDate(getCourseKey(level, term, c.code), iso);
    });
  };

  const smartPlan = useMemo(() => {
    return generateSmartStudyPlan(
      courses,
      level,
      term,
      topicStatuses,
      doneTopics,
      examDates,
      dailyStudyHours
    );
  }, [courses, level, term, topicStatuses, doneTopics, examDates, dailyStudyHours]);

  // Weekly 7-day study bar chart data
  const weeklyChartData = useMemo(() => {
    const days: { date: string; shortLabel: string; minutes: number; hours: number }[] = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = i === 0 ? 'Today' : dayNames[d.getDay()];
      const mins = studyLogs
        .filter((log) => log.date === iso)
        .reduce((acc, log) => acc + log.minutes, 0);
      days.push({
        date: iso,
        shortLabel: label,
        minutes: mins,
        hours: Math.round((mins / 60) * 10) / 10,
      });
    }
    const maxMinutes = Math.max(60, ...days.map((d) => d.minutes));
    const totalWeekMinutes = days.reduce((acc, d) => acc + d.minutes, 0);
    return { days, maxMinutes, totalWeekHours: Math.round((totalWeekMinutes / 60) * 10) / 10 };
  }, [studyLogs]);

  // Course-wise study hours for current term
  const courseStudyBreakdown = useMemo(() => {
    const rows = courses.map((c) => {
      const cKey = getCourseKey(level, term, c.code);
      const mins = studyLogs
        .filter((l) => l.courseKey === cKey || l.courseCode === c.code)
        .reduce((acc, l) => acc + l.minutes, 0);
      return {
        code: c.code,
        name: c.name,
        minutes: mins,
        hours: Math.round((mins / 60) * 10) / 10,
      };
    });
    const maxMins = Math.max(60, ...rows.map((r) => r.minutes));
    const totalTermMins = rows.reduce((acc, r) => acc + r.minutes, 0);
    return { rows, maxMins, totalTermHours: Math.round((totalTermMins / 60) * 10) / 10 };
  }, [courses, level, term, studyLogs]);

  const minsDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secsDisplay = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      {/* TOP HERO ROW: Next Exam Countdown + Daily Study Hours Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Next Exam Countdown Card (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xs border border-indigo-800/50 flex flex-col justify-between">
          {smartPlan.nextExam ? (
            <>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                    <Calendar className="w-3.5 h-3.5" /> Next Upcoming Exam
                  </span>
                  <span className="text-xs font-mono font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-2.5 py-0.5 rounded-full">
                    {smartPlan.nextExam.examDate}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Next exam: {smartPlan.nextExam.courseCode} ({smartPlan.nextExam.courseName}) in{' '}
                  <span className="text-amber-300 underline decoration-amber-400/50">
                    {smartPlan.nextExam.daysRemaining === 0
                      ? 'Today!'
                      : `${smartPlan.nextExam.daysRemaining} day${
                          smartPlan.nextExam.daysRemaining === 1 ? '' : 's'
                        }`}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                  <strong className="text-white font-mono">
                    {smartPlan.nextExam.syllabusDonePct}%
                  </strong>{' '}
                  syllabus done · {smartPlan.nextExam.remainingTopics} of{' '}
                  {smartPlan.nextExam.totalTopics} topics remaining
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
                <span>Smart plan prioritizes weak topics &amp; nearer exams</span>
                <span className="font-mono font-bold text-emerald-300">
                  {smartPlan.totalRemainingTopics} total topics left in term
                </span>
              </div>
            </>
          ) : (
            <div className="my-auto py-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
                <Calendar className="w-4 h-4" /> Exam Countdown &amp; Smart Planner
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                No upcoming exam dates set for Level {level}, Term {term === 1 ? 'I' : 'II'}
              </h2>
              <p className="text-xs text-indigo-200 mt-1 mb-4 max-w-xl leading-relaxed">
                Set your exam dates below so the planner can calculate remaining topics per day and
                prioritize weak topics for your nearest exams.
              </p>
              <button
                type="button"
                onClick={handleFillSampleSchedule}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Sample Exam Routine (Starting in 5 Days)
              </button>
            </div>
          )}
        </div>

        {/* Daily Study Hours Configuration Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Daily Study Capacity
              </span>
              <span className="text-sm font-black font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {dailyStudyHours} hrs / day
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Adjust your available daily study hours. The daily plan automatically scales to match.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={dailyStudyHours}
              onChange={(e) => onSetDailyStudyHours(Number(e.target.value))}
              aria-label="Daily available study hours"
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>1 hr (Light)</span>
              <span>4 hrs (Balanced)</span>
              <span>8 hrs (Intensive)</span>
              <span>12 hrs (Exam Week)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Today&apos;s Scheduled Tasks:</span>
            <span className="font-bold font-mono text-slate-900">
              {smartPlan.todaysPlan.length} priority topics (~{Math.round(dailyStudyHours * 60)} mins)
            </span>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN DESKTOP GRID: Left = Smart Planner & Exam Schedule, Right = Pomodoro Timer & Study Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (7 cols): Today's Smart Checklist + Per-Course Exam Schedule */}
        <div className="lg:col-span-7 space-y-5">
          {/* Today's Smart Study Plan Checklist */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Today&apos;s Smart Study Plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auto-generated from remaining topics ÷ remaining days. Weak topics &amp; nearer exams get extra time.
                </p>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                {smartPlan.todaysPlan.length} topics today
              </span>
            </div>

            {smartPlan.todaysPlan.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200/60 p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  All topics in this term are marked Confident!
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switch terms or mark any topic as &ldquo;In progress&rdquo; to schedule revisions.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {smartPlan.todaysPlan.map((item) => {
                  const isDone =
                    item.status === 'studied' ||
                    item.status === 'revised' ||
                    item.status === 'confident';
                  const stInfo = STATUS_LABELS[item.status];

                  return (
                    <div
                      key={item.topicKey}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-200/70'
                          : item.isWeak
                          ? 'bg-slate-50/70 border-slate-200/90 hover:border-indigo-300'
                          : 'bg-white border-slate-200/80'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() =>
                            onSetTopicStatus(
                              item.topicKey,
                              isDone ? 'not_started' : 'studied'
                            )
                          }
                          className="sr-only"
                        />
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <div className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-md border-2 border-slate-300 hover:border-indigo-500 transition-colors" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {item.courseCode}
                            </span>
                            {item.daysUntilExam !== null && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  item.daysUntilExam <= 5
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                Exam in {item.daysUntilExam}d
                              </span>
                            )}
                            <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              ~{item.allocatedMinutes} mins
                            </span>
                          </div>
                          <p
                            className={`text-xs sm:text-sm font-medium leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {item.topicTitle}
                          </p>
                        </div>
                      </label>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            onSetTopicStatus(item.topicKey, e.target.value as TopicStatus)
                          }
                          aria-label={`Status for ${item.topicTitle}`}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 cursor-pointer ${stInfo.bg} ${stInfo.text}`}
                        >
                          <option value="not_started">Not started</option>
                          <option value="in_progress">In progress</option>
                          <option value="studied">Studied</option>
                          <option value="revised">Revised</option>
                          <option value="confident">Confident</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exam Schedule & Per-Course Daily Allocation Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Exam Schedule &amp; Course Pace
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set exam dates per course to calculate daily topic targets.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillSampleSchedule}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Auto-Fill Sample Dates
              </button>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Exam Date</th>
                    <th className="py-2.5 px-3 text-center">Countdown</th>
                    <th className="py-2.5 px-3 text-center">Left / Weak</th>
                    <th className="py-2.5 px-3 text-right">Pace Needed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {smartPlan.coursePlans.map((cp) => {
                    const cKey = getCourseKey(level, term, cp.courseCode);
                    const dateVal = examDates[cKey] || '';

                    return (
                      <tr key={cp.courseCode} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 font-mono">{cp.courseCode}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {cp.courseName}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="date"
                            value={dateVal}
                            onChange={(e) => onSetExamDate(cKey, e.target.value)}
                            aria-label={`Exam date for ${cp.courseCode}`}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {cp.daysRemaining !== null ? (
                            <span
                              className={`inline-block font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                cp.daysRemaining <= 3
                                  ? 'bg-rose-100 text-rose-700'
                                  : cp.daysRemaining <= 7
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {cp.daysRemaining}d left
                            </span>
                          ) : (
                            <span className="text-slate-400">Not set</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="font-bold text-slate-800">{cp.remainingTopicsCount}</span>
                          <span className="text-slate-400">/{cp.totalTopics}</span>
                          {cp.weakTopicsCount > 0 && (
                            <span className="ml-1 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded">
                              {cp.weakTopicsCount} weak
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {cp.remainingTopicsCount === 0 ? (
                            <span className="text-emerald-600 font-bold">Done</span>
                          ) : (
                            <div>
                              <span className="font-bold text-slate-900">
                                {cp.topicsPerDay} topics/d
                              </span>
                              {cp.recommendedMinutesToday > 0 && (
                                <span className="block text-[10px] text-indigo-600">
                                  {cp.recommendedMinutesToday}m today
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Pomodoro Focus Timer + Weekly Bar Chart + Course Hours */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pomodoro Focus Timer Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Pomodoro Focus Timer
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Auto-logs study time
              </span>
            </div>

            {/* Preset Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {TIMER_PRESETS.map((preset) => {
                const active = activePreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Course Attribution Selector */}
            <div className="flex items-center justify-between gap-2 text-xs min-w-0">
              <label htmlFor="timer-course-select" className="font-semibold text-slate-600 shrink-0">
                Studying Course:
              </label>
              <select
                id="timer-course-select"
                value={selectedTimerCourse}
                onChange={(e) => setSelectedTimerCourse(e.target.value)}
                className="flex-1 min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Digital Clock Readout */}
            <div className="py-5 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900">
                {minsDisplay}:{secsDisplay}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1.5">
                {activePreset.isBreak
                  ? 'Break session — relax & recharge'
                  : `Focusing on ${selectedTimerCourse}`}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-colors cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Focus
                  </>
                )}
              </button>

              {!activePreset.isBreak && secondsLeft < activePreset.minutes * 60 && (
                <button
                  type="button"
                  onClick={handleLogElapsedNow}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Finish early and log elapsed study time"
                >
                  Log Done
                </button>
              )}

              <button
                type="button"
                onClick={handleResetTimer}
                aria-label="Reset timer"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Manual Log Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-medium">Quick Log Session:</span>
              <div className="flex items-center gap-1.5">
                {[25, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleQuickLogMinutes(m)}
                    className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> {m}m
                  </button>
                ))}
              </div>
            </div>

            {sessionCompletedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sessionCompletedMsg}</span>
              </div>
            )}
          </div>

          {/* Weekly Study Hours Bar Chart */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Weekly Study Hours (Last 7 Days)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily focus hours across all courses
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                {weeklyChartData.totalWeekHours} hrs total
              </span>
            </div>

            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1 border-b border-slate-100">
              {weeklyChartData.days.map((d) => {
                const heightPct =
                  weeklyChartData.maxMinutes > 0
                    ? Math.max(6, Math.round((d.minutes / weeklyChartData.maxMinutes) * 100))
                    : 6;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group"
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-600 mb-1">
                      {d.hours > 0 ? `${d.hours}h` : '0'}
                    </span>
                    <div className="w-full max-w-[30px] bg-slate-100 rounded-t-lg h-24 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          d.minutes > 0
                            ? 'bg-indigo-600 group-hover:bg-indigo-500'
                            : 'bg-slate-200'
                        }`}
                        style={{ height: `${d.minutes > 0 ? heightPct : 6}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1.5">
                      {d.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course-Wise Study Hours Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Course-Wise Study Time</h3>
              <span className="text-xs font-mono font-bold text-slate-600">
                {courseStudyBreakdown.totalTermHours}h logged in term
              </span>
            </div>

            {courseStudyBreakdown.totalTermHours === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200/60 p-4">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">No study sessions logged yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
                  Start the Pomodoro timer or use Quick Log (+25m) above to track course hours.
                </p>
                <button
                  type="button"
                  onClick={() => handleQuickLogMinutes(25)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Log First 25m Session
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {courseStudyBreakdown.rows.map((r) => {
                  const pct =
                    courseStudyBreakdown.maxMins > 0
                      ? Math.round((r.minutes / courseStudyBreakdown.maxMins) * 100)
                      : 0;
                  return (
                    <div key={r.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {r.code}{' '}
                          <span className="font-normal text-slate-500">· {r.name}</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-700">
                          {r.hours}h ({r.minutes}m)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
