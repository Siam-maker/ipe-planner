import {
  AttendanceInputMode,
  Course,
  CourseStrength,
  TopicStatus,
} from '../types';
import { GRADES, getCourseKey, getTopicKey } from '../data/curriculum';

export function isTopicCompleted(
  status: TopicStatus | undefined,
  legacyDone: boolean | undefined
): boolean {
  if (status) {
    return status === 'studied' || status === 'revised' || status === 'confident';
  }
  return Boolean(legacyDone);
}

export function getEffectiveTopicStatus(
  status: TopicStatus | undefined,
  legacyDone: boolean | undefined
): TopicStatus {
  if (status) return status;
  return legacyDone ? 'studied' : 'not_started';
}

export interface AttendanceResult {
  mode: AttendanceInputMode;
  marks: number;
  maxMarks: number;
  percentage: number;
  pointsPerCredit: number;
  isBelowSixty: boolean;
  displayText: string;
}

export function calculateAttendance(
  credits: number,
  mode: AttendanceInputMode,
  pctValue: string | number | undefined,
  directMarksValue: string | number | undefined
): AttendanceResult {
  const maxMarks = credits * 10;

  if (mode === 'marks') {
    const rawMarks =
      directMarksValue === undefined || directMarksValue === '' ? 0 : Number(directMarksValue);
    const validMarks = isNaN(rawMarks) ? 0 : Math.max(0, Math.min(maxMarks, rawMarks));
    const percentage = maxMarks > 0 ? (validMarks / maxMarks) * 100 : 0;
    const isBelowSixty =
      directMarksValue !== '' && directMarksValue !== undefined && percentage < 60;
    const pointsPerCredit = credits > 0 ? validMarks / credits : 0;

    return {
      mode: 'marks',
      marks: Math.round(validMarks * 10) / 10,
      maxMarks,
      percentage: Math.round(percentage * 10) / 10,
      pointsPerCredit: Math.round(pointsPerCredit * 10) / 10,
      isBelowSixty,
      displayText: `${Math.round(validMarks * 10) / 10} / ${maxMarks} marks (${Math.round(
        percentage
      )}%)`,
    };
  }

  // Percentage mode (default)
  const rawPct = pctValue === undefined || pctValue === '' ? null : Number(pctValue);
  if (rawPct === null || isNaN(rawPct)) {
    return {
      mode: 'percentage',
      marks: 0,
      maxMarks,
      percentage: 0,
      pointsPerCredit: 0,
      isBelowSixty: false,
      displayText: `0 / ${maxMarks} marks (0%)`,
    };
  }

  const clampedPct = Math.max(0, Math.min(100, rawPct));
  let points = 0;
  if (clampedPct >= 90) points = 10;
  else if (clampedPct >= 85) points = 9;
  else if (clampedPct >= 80) points = 8;
  else if (clampedPct >= 75) points = 7;
  else if (clampedPct >= 70) points = 6;
  else if (clampedPct >= 65) points = 5;
  else if (clampedPct >= 60) points = 4;
  else points = 0;

  const marks = points * credits;
  const isBelowSixty = clampedPct < 60;

  return {
    mode: 'percentage',
    marks,
    maxMarks,
    percentage: clampedPct,
    pointsPerCredit: points,
    isBelowSixty,
    displayText: `${marks} / ${maxMarks} marks (${points} pts/cr)`,
  };
}

export interface ClassAttendanceResult {
  attended: number;
  conducted: number;
  totalPlanned: number;
  thresholdPct: number;
  currentPct: number;
  remainingClasses: number;
  minRequiredTotal: number;
  canStillMiss: number;
  mustAttendConsecutive: number;
  status: 'safe' | 'warning' | 'danger' | 'empty';
}

export function calculateClassAttendance(
  credits: number,
  attendedRaw: string | number | undefined,
  conductedRaw: string | number | undefined,
  totalPlannedRaw: string | number | undefined,
  thresholdPct: number = 70
): ClassAttendanceResult {
  const defaultPlanned = Math.round(credits * 14); // 14 weeks per BUET term
  const totalPlanned =
    totalPlannedRaw !== undefined && totalPlannedRaw !== '' && !isNaN(Number(totalPlannedRaw))
      ? Math.max(1, Math.round(Number(totalPlannedRaw)))
      : defaultPlanned;

  const hasInput =
    (attendedRaw !== undefined && attendedRaw !== '') ||
    (conductedRaw !== undefined && conductedRaw !== '');

  const conducted =
    conductedRaw !== undefined && conductedRaw !== '' && !isNaN(Number(conductedRaw))
      ? Math.max(0, Math.round(Number(conductedRaw)))
      : 0;
  const attended =
    attendedRaw !== undefined && attendedRaw !== '' && !isNaN(Number(attendedRaw))
      ? Math.max(0, Math.min(conducted || totalPlanned, Math.round(Number(attendedRaw))))
      : 0;

  const effectiveTotal = Math.max(totalPlanned, conducted);
  const remainingClasses = Math.max(0, effectiveTotal - conducted);
  const currentPct = conducted > 0 ? Math.round((attended / conducted) * 1000) / 10 : 100;
  const minRequiredTotal = Math.ceil((thresholdPct / 100) * effectiveTotal);

  // Max final attended if student attends all remaining classes = attended + remainingClasses
  const maxPossibleAttended = attended + remainingClasses;
  const canStillMiss = Math.max(0, maxPossibleAttended - minRequiredTotal);

  // If currently below thresholdPct, how many consecutive classes needed to reach thresholdPct?
  let mustAttendConsecutive = 0;
  if (conducted > 0 && currentPct < thresholdPct && thresholdPct < 100) {
    // (attended + x) / (conducted + x) >= t/100 => x >= (t*conducted - 100*attended) / (100 - t)
    const t = thresholdPct / 100;
    const needed = Math.ceil((t * conducted - attended) / (1 - t));
    mustAttendConsecutive = Math.max(0, needed);
  }

  let status: ClassAttendanceResult['status'] = 'safe';
  if (!hasInput || conducted === 0) {
    status = 'empty';
  } else if (currentPct < thresholdPct || maxPossibleAttended < minRequiredTotal) {
    status = 'danger';
  } else if (currentPct - thresholdPct <= 5 || canStillMiss <= 2) {
    status = 'warning';
  }

  return {
    attended,
    conducted,
    totalPlanned: effectiveTotal,
    thresholdPct,
    currentPct,
    remainingClasses,
    minRequiredTotal,
    canStillMiss,
    mustAttendConsecutive,
    status,
  };
}

export interface CTItemInfo {
  index: number;
  value: number | null;
  isCounted: boolean;
}

export interface CTResult {
  totalCount: number; // default credits + 1, or custom M
  bestCount: number; // default credits, or custom N
  enteredCount: number;
  totalMarks: number; // scaled out of credits * 20
  rawBestSum: number;
  maxMarks: number; // credits * 20
  items: CTItemInfo[];
}

export function calculateCTMarks(
  credits: number,
  ctRecord: Record<number, string | number | undefined>,
  customBestN?: number,
  customTotalM?: number
): CTResult {
  const defaultTotal = Math.max(1, Math.round(credits + 1));
  const defaultBest = Math.max(1, Math.round(credits));

  const totalCount =
    customTotalM && customTotalM >= 1 ? Math.min(8, Math.round(customTotalM)) : defaultTotal;
  const bestCount =
    customBestN && customBestN >= 1
      ? Math.min(totalCount, Math.round(customBestN))
      : Math.min(totalCount, defaultBest);

  const maxMarks = credits * 20;

  const entries: { index: number; value: number | null }[] = [];
  let enteredCount = 0;

  for (let i = 0; i < totalCount; i++) {
    const raw = ctRecord[i];
    if (raw !== undefined && raw !== '' && !isNaN(Number(raw))) {
      const val = Math.max(0, Math.min(20, Number(raw)));
      entries.push({ index: i, value: val });
      enteredCount++;
    } else {
      entries.push({ index: i, value: null });
    }
  }

  // Sort valid entries descending to find the best `bestCount`
  const validSorted = entries
    .filter((e): e is { index: number; value: number } => e.value !== null)
    .sort((a, b) => b.value - a.value);

  const countedIndices = new Set(validSorted.slice(0, bestCount).map((e) => e.index));
  const rawBestSum = validSorted.slice(0, bestCount).reduce((acc, curr) => acc + curr.value, 0);

  // Scale rawBestSum (out of bestCount * 20) to maxMarks (credits * 20)
  const scaledTotal = bestCount > 0 ? (rawBestSum / (bestCount * 20)) * maxMarks : 0;

  const items: CTItemInfo[] = entries.map((e) => ({
    index: e.index,
    value: e.value,
    isCounted: countedIndices.has(e.index),
  }));

  return {
    totalCount,
    bestCount,
    enteredCount,
    totalMarks: Math.round(scaledTotal * 10) / 10,
    rawBestSum: Math.round(rawBestSum * 10) / 10,
    maxMarks,
    items,
  };
}

export interface GradeTargetRow {
  gradeLetter: string;
  gradePoint: number;
  minTotalRequired: number;
  marksNeededInFinal: number;
  finalExamMax: number;
  percentageNeeded: number;
  status: 'secured' | 'comfortable' | 'moderate' | 'tough' | 'unreachable';
}

export function calculateFinalNeeded(
  credits: number,
  attendanceMarks: number,
  ctMarks: number
): GradeTargetRow[] {
  const continuousMarks = attendanceMarks + ctMarks;
  const finalExamMax = 70 * credits;

  return GRADES.slice(0, 9).map(([letter, point, minTotalPct]) => {
    const minTotalRequired = minTotalPct * credits;
    const marksNeededInFinal = minTotalRequired - continuousMarks;
    const percentageNeeded = finalExamMax > 0 ? (marksNeededInFinal / finalExamMax) * 100 : 0;

    let status: GradeTargetRow['status'];
    if (marksNeededInFinal <= 0) {
      status = 'secured';
    } else if (marksNeededInFinal > finalExamMax) {
      status = 'unreachable';
    } else if (percentageNeeded <= 60) {
      status = 'comfortable';
    } else if (percentageNeeded <= 80) {
      status = 'moderate';
    } else {
      status = 'tough';
    }

    return {
      gradeLetter: letter,
      gradePoint: point,
      minTotalRequired,
      marksNeededInFinal: Math.max(0, marksNeededInFinal),
      finalExamMax,
      percentageNeeded: Math.max(0, percentageNeeded),
      status,
    };
  });
}

export interface GpaCalculationResult {
  totalCredits: number;
  gradedCredits: number;
  earnedPoints: number;
  gpa: number | null;
  honorsEligible: boolean;
}

export function calculateGpa(
  courses: Course[],
  gradesRecord: Record<string, string | number | undefined>,
  getKey: (code: string) => string
): GpaCalculationResult {
  let totalCredits = 0;
  let gradedCredits = 0;
  let earnedPoints = 0;

  for (const course of courses) {
    if (course.notGraded) continue;
    totalCredits += course.credits;
    const key = getKey(course.code);
    const rawVal = gradesRecord[key];
    if (rawVal !== undefined && rawVal !== '' && !isNaN(Number(rawVal))) {
      const pt = Number(rawVal);
      earnedPoints += course.credits * pt;
      gradedCredits += course.credits;
    }
  }

  const gpa = gradedCredits > 0 ? earnedPoints / gradedCredits : null;
  const honorsEligible = gpa !== null && gpa >= 3.75;

  return {
    totalCredits,
    gradedCredits,
    earnedPoints: Math.round(earnedPoints * 100) / 100,
    gpa: gpa !== null ? Math.round(gpa * 100) / 100 : null,
    honorsEligible,
  };
}

export interface ReverseCgpaResult {
  hasValidInputs: boolean;
  completedCredits: number;
  currentCgpa: number;
  targetCgpa: number;
  termCredits: number;
  totalCreditsAfterTerm: number;
  currentQualityPoints: number;
  targetQualityPoints: number;
  requiredTermQualityPoints: number;
  requiredTermGpa: number;
  maxReachableCgpaThisTerm: number;
  isImpossible: boolean;
  isAlreadySecured: boolean;
  additionalCreditsAt4Needed: number | null;
}

export function calculateReverseCgpa(
  completedCreditsRaw: string | number | undefined,
  currentCgpaRaw: string | number | undefined,
  targetCgpaRaw: string | number | undefined,
  termCredits: number
): ReverseCgpaResult {
  const completedCredits = Number(completedCreditsRaw);
  const currentCgpa = Number(currentCgpaRaw);
  const targetCgpa = Number(targetCgpaRaw);

  if (
    completedCreditsRaw === '' ||
    completedCreditsRaw === undefined ||
    currentCgpaRaw === '' ||
    currentCgpaRaw === undefined ||
    targetCgpaRaw === '' ||
    targetCgpaRaw === undefined ||
    isNaN(completedCredits) ||
    isNaN(currentCgpa) ||
    isNaN(targetCgpa) ||
    completedCredits < 0 ||
    currentCgpa < 0 ||
    currentCgpa > 4 ||
    targetCgpa <= 0 ||
    targetCgpa > 4 ||
    termCredits <= 0
  ) {
    return {
      hasValidInputs: false,
      completedCredits: 0,
      currentCgpa: 0,
      targetCgpa: targetCgpa || 3.75,
      termCredits,
      totalCreditsAfterTerm: termCredits,
      currentQualityPoints: 0,
      targetQualityPoints: 0,
      requiredTermQualityPoints: 0,
      requiredTermGpa: 0,
      maxReachableCgpaThisTerm: 4.0,
      isImpossible: false,
      isAlreadySecured: false,
      additionalCreditsAt4Needed: null,
    };
  }

  const totalCreditsAfterTerm = completedCredits + termCredits;
  const currentQualityPoints = completedCredits * currentCgpa;
  const targetQualityPoints = totalCreditsAfterTerm * targetCgpa;
  const requiredTermQualityPoints = targetQualityPoints - currentQualityPoints;
  const requiredTermGpa = requiredTermQualityPoints / termCredits;
  const maxReachableCgpaThisTerm =
    (currentQualityPoints + termCredits * 4.0) / totalCreditsAfterTerm;

  const isImpossible = requiredTermGpa > 4.0001;
  const isAlreadySecured = requiredTermGpa <= 2.0;

  let additionalCreditsAt4Needed: number | null = null;
  if (isImpossible && targetCgpa < 4.0) {
    // Total credits at 4.0 needed from now: (targetCgpa * completedCredits - currentQualityPoints) / (4.0 - targetCgpa)
    const total4CreditsNeeded =
      (targetCgpa * completedCredits - currentQualityPoints) / (4.0 - targetCgpa);
    additionalCreditsAt4Needed = Math.max(0, Math.ceil(total4CreditsNeeded - termCredits));
  }

  return {
    hasValidInputs: true,
    completedCredits,
    currentCgpa,
    targetCgpa,
    termCredits,
    totalCreditsAfterTerm: Math.round(totalCreditsAfterTerm * 100) / 100,
    currentQualityPoints: Math.round(currentQualityPoints * 100) / 100,
    targetQualityPoints: Math.round(targetQualityPoints * 100) / 100,
    requiredTermQualityPoints: Math.round(requiredTermQualityPoints * 100) / 100,
    requiredTermGpa: Math.round(requiredTermGpa * 1000) / 1000,
    maxReachableCgpaThisTerm: Math.round(maxReachableCgpaThisTerm * 1000) / 1000,
    isImpossible,
    isAlreadySecured,
    additionalCreditsAt4Needed,
  };
}

export interface TargetPlanCourseResult {
  code: string;
  name: string;
  credits: number;
  strength: CourseStrength;
  minimumGradeLetter: string;
  minimumGradePoint: number;
  isAtCap: boolean;
  penaltyPerGradeDrop: number;
}

export interface TargetPlanResult {
  targetGpa: number;
  achievable: boolean;
  projectedGpa: number;
  maxPossibleGpa: number;
  courses: TargetPlanCourseResult[];
}

export function calculateTargetPlan(
  courses: Course[],
  targetGpa: number,
  strengths: Record<string, CourseStrength>,
  getKey: (code: string) => string
): TargetPlanResult {
  const eligible = courses.filter((c) => !c.notGraded);
  const totalCredits = eligible.reduce((acc, c) => acc + c.credits, 0);
  if (totalCredits === 0) {
    return {
      targetGpa,
      achievable: true,
      projectedGpa: 0,
      maxPossibleGpa: 0,
      courses: [],
    };
  }

  const requiredPoints = targetGpa * totalCredits;
  const capMap: Record<CourseStrength, number> = {
    S: 4.0,
    A: 3.75,
    W: 3.5,
  };

  const getStrength = (code: string): CourseStrength => strengths[getKey(code)] || 'A';

  const maxPoints = eligible.reduce((acc, c) => acc + c.credits * capMap[getStrength(c.code)], 0);
  const maxPossibleGpa = maxPoints / totalCredits;

  if (maxPoints < requiredPoints - 1e-9) {
    return {
      targetGpa,
      achievable: false,
      projectedGpa: Math.round(maxPossibleGpa * 100) / 100,
      maxPossibleGpa: Math.round(maxPossibleGpa * 100) / 100,
      courses: eligible.map((c) => {
        const s = getStrength(c.code);
        const cap = capMap[s];
        return {
          code: c.code,
          name: c.name,
          credits: c.credits,
          strength: s,
          minimumGradeLetter: getGradeLetterFromPoint(cap),
          minimumGradePoint: cap,
          isAtCap: true,
          penaltyPerGradeDrop: (c.credits * 0.25) / totalCredits,
        };
      }),
    };
  }

  let slack = maxPoints - requiredPoints;
  const grades: Record<string, number> = {};

  const orderRank: Record<CourseStrength, number> = { W: 0, A: 1, S: 2 };
  const sorted = [...eligible].sort((a, b) => {
    const diff = orderRank[getStrength(a.code)] - orderRank[getStrength(b.code)];
    if (diff !== 0) return diff;
    return a.credits - b.credits;
  });

  for (const c of sorted) {
    let g = capMap[getStrength(c.code)];
    while (g > 2.5 && c.credits * 0.25 <= slack + 1e-9) {
      g -= 0.25;
      slack -= c.credits * 0.25;
    }
    grades[c.code] = g;
  }

  const projectedPoints = eligible.reduce((acc, c) => acc + c.credits * grades[c.code], 0);
  const projectedGpa = projectedPoints / totalCredits;

  return {
    targetGpa,
    achievable: true,
    projectedGpa: Math.round(projectedGpa * 100) / 100,
    maxPossibleGpa: Math.round(maxPossibleGpa * 100) / 100,
    courses: eligible.map((c) => {
      const s = getStrength(c.code);
      const cap = capMap[s];
      const g = grades[c.code] ?? cap;
      return {
        code: c.code,
        name: c.name,
        credits: c.credits,
        strength: s,
        minimumGradeLetter: getGradeLetterFromPoint(g),
        minimumGradePoint: g,
        isAtCap: Math.abs(g - cap) < 0.01,
        penaltyPerGradeDrop: Math.round(((c.credits * 0.25) / totalCredits) * 1000) / 1000,
      };
    }),
  };
}

function getGradeLetterFromPoint(pt: number): string {
  const match = GRADES.find((g) => Math.abs(g[1] - pt) < 0.05);
  return match ? match[0] : 'F';
}

export interface NextExamSummary {
  courseCode: string;
  courseName: string;
  examDate: string;
  daysRemaining: number;
  syllabusDonePct: number;
  remainingTopics: number;
  totalTopics: number;
}

export interface CourseStudyPlanRow {
  courseCode: string;
  courseName: string;
  examDate: string | null;
  daysRemaining: number | null;
  totalTopics: number;
  completedTopics: number;
  weakTopicsCount: number;
  remainingTopicsCount: number;
  topicsPerDay: number;
  recommendedMinutesToday: number;
}

export interface DailyPlanTopicItem {
  topicKey: string;
  courseCode: string;
  courseName: string;
  topicIndex: number;
  topicTitle: string;
  status: TopicStatus;
  isWeak: boolean;
  daysUntilExam: number | null;
  allocatedMinutes: number;
}

export interface SmartStudyPlanResult {
  nextExam: NextExamSummary | null;
  coursePlans: CourseStudyPlanRow[];
  todaysPlan: DailyPlanTopicItem[];
  totalRemainingTopics: number;
  hasAnyExamDate: boolean;
}

function diffDaysISO(fromISO: string, toISO: string): number {
  const d1 = new Date(fromISO + 'T00:00:00');
  const d2 = new Date(toISO + 'T00:00:00');
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateSmartStudyPlan(
  courses: Course[],
  level: number,
  term: number,
  topicStatuses: Record<string, TopicStatus>,
  doneTopics: Record<string, boolean>,
  examDates: Record<string, string>,
  dailyStudyHours: number = 4,
  todayStr: string = new Date().toISOString().slice(0, 10)
): SmartStudyPlanResult {
  const totalDailyMinutes = Math.max(30, Math.round((dailyStudyHours || 4) * 60));
  let nextExam: NextExamSummary | null = null;
  let hasAnyExamDate = false;
  let totalRemainingTopics = 0;

  const coursePlans: CourseStudyPlanRow[] = [];
  const candidateTopics: {
    topicKey: string;
    courseCode: string;
    courseName: string;
    topicIndex: number;
    topicTitle: string;
    status: TopicStatus;
    isWeak: boolean;
    daysUntilExam: number | null;
    priorityScore: number;
  }[] = [];

  for (const course of courses) {
    const cKey = getCourseKey(level, term, course.code);
    const examDate = examDates[cKey] || null;
    let daysRemaining: number | null = null;

    if (examDate) {
      const diff = diffDaysISO(todayStr, examDate);
      if (diff >= 0) {
        daysRemaining = diff;
        hasAnyExamDate = true;
      }
    }

    const totalTopics = course.topics.length;
    let completedTopics = 0;
    let weakTopicsCount = 0;
    let remainingTopicsCount = 0;

    course.topics.forEach((title, idx) => {
      const tKey = getTopicKey(level, term, course.code, idx);
      const status = getEffectiveTopicStatus(topicStatuses[tKey], doneTopics[tKey]);
      const completed = isTopicCompleted(status, doneTopics[tKey]);

      if (completed) {
        completedTopics++;
      } else {
        remainingTopicsCount++;
        totalRemainingTopics++;
      }

      // Weak topic = 'not_started' or 'in_progress' (or 'studied' that still needs revision before exam)
      const isWeak = status === 'not_started' || status === 'in_progress';
      if (isWeak) weakTopicsCount++;

      if (status !== 'confident') {
        // Compute priority score:
        // Nearer exams get much higher priority; weak topics ('not_started' / 'in_progress') get 2.5x weight over 'studied'/'revised'
        const urgencyWeight =
          daysRemaining !== null ? 100 / Math.max(1, daysRemaining) : 5;
        const statusWeight =
          status === 'not_started'
            ? 3.0
            : status === 'in_progress'
            ? 2.6
            : status === 'studied'
            ? 1.2
            : 0.6;
        const creditWeight = 1 + course.credits * 0.1;

        candidateTopics.push({
          topicKey: tKey,
          courseCode: course.code,
          courseName: course.name,
          topicIndex: idx,
          topicTitle: title,
          status,
          isWeak,
          daysUntilExam: daysRemaining,
          priorityScore: urgencyWeight * statusWeight * creditWeight - idx * 0.01,
        });
      }
    });

    const syllabusDonePct =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    if (daysRemaining !== null) {
      if (!nextExam || daysRemaining < nextExam.daysRemaining) {
        nextExam = {
          courseCode: course.code,
          courseName: course.name,
          examDate: examDate!,
          daysRemaining,
          syllabusDonePct,
          remainingTopics: remainingTopicsCount,
          totalTopics,
        };
      }
    }

    const effectiveDays = daysRemaining !== null ? Math.max(1, daysRemaining) : 14;
    const topicsPerDay =
      remainingTopicsCount > 0
        ? Math.round((remainingTopicsCount / effectiveDays) * 10) / 10
        : 0;

    coursePlans.push({
      courseCode: course.code,
      courseName: course.name,
      examDate,
      daysRemaining,
      totalTopics,
      completedTopics,
      weakTopicsCount,
      remainingTopicsCount,
      topicsPerDay,
      recommendedMinutesToday: 0, // populated below
    });
  }

  // Sort candidate topics by priorityScore descending
  candidateTopics.sort((a, b) => b.priorityScore - a.priorityScore);

  // Determine how many topics to schedule today based on dailyStudyHours and remaining topics/days
  const totalTopicsPerDayNeeded = coursePlans.reduce((sum, cp) => sum + cp.topicsPerDay, 0);
  const targetCountToday = Math.max(
    Math.min(candidateTopics.length, Math.ceil(dailyStudyHours * 1.5)),
    Math.min(10, Math.ceil(totalTopicsPerDayNeeded))
  );

  const selectedToday = candidateTopics.slice(0, Math.max(1, Math.min(8, targetCountToday)));
  const totalWeightToday = selectedToday.reduce(
    (sum, item) => sum + (item.isWeak ? 1.5 : 1.0),
    0
  );

  const todaysPlan: DailyPlanTopicItem[] = selectedToday.map((item) => {
    const w = item.isWeak ? 1.5 : 1.0;
    const mins =
      totalWeightToday > 0
        ? Math.max(15, Math.round(((w / totalWeightToday) * totalDailyMinutes) / 5) * 5)
        : 30;
    return {
      topicKey: item.topicKey,
      courseCode: item.courseCode,
      courseName: item.courseName,
      topicIndex: item.topicIndex,
      topicTitle: item.topicTitle,
      status: item.status,
      isWeak: item.isWeak,
      daysUntilExam: item.daysUntilExam,
      allocatedMinutes: mins,
    };
  });

  // Aggregate recommendedMinutesToday per course
  for (const cp of coursePlans) {
    cp.recommendedMinutesToday = todaysPlan
      .filter((t) => t.courseCode === cp.courseCode)
      .reduce((acc, t) => acc + t.allocatedMinutes, 0);
  }

  return {
    nextExam,
    coursePlans,
    todaysPlan,
    totalRemainingTopics,
    hasAnyExamDate,
  };
}

export interface SpacedRevisionItem {
  topicKey: string;
  courseCode: string;
  courseName: string;
  topicIndex: number;
  topicTitle: string;
  status: TopicStatus;
  studiedDate: string;
  daysElapsed: number;
  intervalLabel: string;
}

export function getSpacedRevisionReminders(
  courses: Course[],
  level: number,
  term: number,
  topicStatuses: Record<string, TopicStatus>,
  topicStudiedDates: Record<string, string>,
  todayStr: string = new Date().toISOString().slice(0, 10)
): SpacedRevisionItem[] {
  const reminders: SpacedRevisionItem[] = [];

  for (const course of courses) {
    course.topics.forEach((title, idx) => {
      const tKey = getTopicKey(level, term, course.code, idx);
      const status = topicStatuses[tKey];
      const studiedDate = topicStudiedDates[tKey];

      if (!studiedDate || (status !== 'studied' && status !== 'revised')) {
        return;
      }

      const daysElapsed = diffDaysISO(studiedDate, todayStr);
      // 1-3-7 spaced repetition intervals:
      // Day 1-2: 1-Day Review; Day 3-6: 3-Day Review; Day >= 7: 7-Day Review
      if (daysElapsed >= 1) {
        let intervalLabel = '1-Day Review';
        if (daysElapsed >= 7) intervalLabel = '7-Day Review';
        else if (daysElapsed >= 3) intervalLabel = '3-Day Review';

        reminders.push({
          topicKey: tKey,
          courseCode: course.code,
          courseName: course.name,
          topicIndex: idx,
          topicTitle: title,
          status,
          studiedDate,
          daysElapsed,
          intervalLabel,
        });
      }
    });
  }

  return reminders.sort((a, b) => b.daysElapsed - a.daysElapsed);
}
