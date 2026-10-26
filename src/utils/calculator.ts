import { AttendanceInputMode, Course, CourseStrength, GradeTuple } from '../types';
import { GRADES } from '../data/curriculum';

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
    const rawMarks = directMarksValue === undefined || directMarksValue === '' ? 0 : Number(directMarksValue);
    const validMarks = isNaN(rawMarks) ? 0 : Math.max(0, Math.min(maxMarks, rawMarks));
    const percentage = maxMarks > 0 ? (validMarks / maxMarks) * 100 : 0;
    const isBelowSixty = directMarksValue !== '' && directMarksValue !== undefined && percentage < 60;
    const pointsPerCredit = credits > 0 ? validMarks / credits : 0;

    return {
      mode: 'marks',
      marks: Math.round(validMarks * 10) / 10,
      maxMarks,
      percentage: Math.round(percentage * 10) / 10,
      pointsPerCredit: Math.round(pointsPerCredit * 10) / 10,
      isBelowSixty,
      displayText: `${Math.round(validMarks * 10) / 10} / ${maxMarks} marks (${Math.round(percentage)}%)`,
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

export interface CTItemInfo {
  index: number;
  value: number | null;
  isCounted: boolean;
}

export interface CTResult {
  totalCount: number; // credits + 1
  bestCount: number; // credits
  enteredCount: number;
  totalMarks: number;
  maxMarks: number;
  items: CTItemInfo[];
}

export function calculateCTMarks(
  credits: number,
  ctRecord: Record<number, string | number | undefined>
): CTResult {
  const totalCount = credits + 1;
  const bestCount = credits;
  const maxMarks = bestCount * 20;

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

  const totalMarks = validSorted.slice(0, bestCount).reduce((acc, curr) => acc + curr.value, 0);

  const items: CTItemInfo[] = entries.map((e) => ({
    index: e.index,
    value: e.value,
    isCounted: countedIndices.has(e.index),
  }));

  return {
    totalCount,
    bestCount,
    enteredCount,
    totalMarks: Math.round(totalMarks * 10) / 10,
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

  // Sort: prioritize lowering weak first, then average, then strong, smaller credits first
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
