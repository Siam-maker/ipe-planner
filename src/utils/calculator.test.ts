import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendance,
  calculateCTMarks,
  calculateFinalNeeded,
  calculateGpa,
  calculateTargetPlan,
} from './calculator';
import { Course } from '../types';

test('calculateAttendance with percentage mode: 92% gives full marks (10 pts/cr)', () => {
  const result = calculateAttendance(3, 'percentage', 92, '');
  assert.equal(result.marks, 30);
  assert.equal(result.pointsPerCredit, 10);
  assert.equal(result.isBelowSixty, false);
});

test('calculateAttendance with percentage mode: 77% gives 7 pts/cr', () => {
  const result = calculateAttendance(3, 'percentage', 77, '');
  assert.equal(result.marks, 21);
  assert.equal(result.pointsPerCredit, 7);
  assert.equal(result.isBelowSixty, false);
});

test('calculateAttendance with percentage mode: 55% warns below 60%', () => {
  const result = calculateAttendance(3, 'percentage', 55, '');
  assert.equal(result.marks, 0);
  assert.equal(result.pointsPerCredit, 0);
  assert.equal(result.isBelowSixty, true);
});

test('calculateAttendance with marks mode: direct 27 marks for 3 credits (out of 30)', () => {
  const result = calculateAttendance(3, 'marks', '85', 27);
  // Marks mode must ignore the percentage input and directly use 27
  assert.equal(result.marks, 27);
  assert.equal(result.maxMarks, 30);
  assert.equal(result.percentage, 90);
  assert.equal(result.isBelowSixty, false);
});

test('calculateAttendance with marks mode: direct 15 marks for 3 credits is below 60%', () => {
  const result = calculateAttendance(3, 'marks', '', 15);
  assert.equal(result.marks, 15);
  assert.equal(result.percentage, 50);
  assert.equal(result.isBelowSixty, true);
});

test('calculateAttendance with marks mode: clamped between 0 and max', () => {
  const over = calculateAttendance(3, 'marks', '', 35);
  assert.equal(over.marks, 30);

  const neg = calculateAttendance(3, 'marks', '', -5);
  assert.equal(neg.marks, 0);
});

test('calculateCTMarks selects best N CTs for an N-credit course', () => {
  // 3-credit course has 4 CTs (credits + 1), best 3 count
  const ctRecord = {
    0: 16,
    1: 19,
    2: 14,
    3: 18,
  };
  const result = calculateCTMarks(3, ctRecord);
  assert.equal(result.totalCount, 4);
  assert.equal(result.bestCount, 3);
  // Best 3 are 19, 18, 16 -> sum = 53
  assert.equal(result.totalMarks, 53);
  assert.equal(result.items.find((i) => i.index === 1)?.isCounted, true);
  assert.equal(result.items.find((i) => i.index === 3)?.isCounted, true);
  assert.equal(result.items.find((i) => i.index === 0)?.isCounted, true);
  assert.equal(result.items.find((i) => i.index === 2)?.isCounted, false);
});

test('calculateFinalNeeded calculates cutoffs and remaining needed correctly', () => {
  // 3 credits course: max final = 210, A+ cutoff is 240
  // Continuous assessment = 27 (att) + 53 (ct) = 80
  // Final needed for A+ = 240 - 80 = 160 out of 210 (76.19%)
  const rows = calculateFinalNeeded(3, 27, 53);
  const aPlus = rows.find((r) => r.gradeLetter === 'A+');
  assert.ok(aPlus);
  assert.equal(aPlus.minTotalRequired, 240);
  assert.equal(aPlus.marksNeededInFinal, 160);
  assert.equal(aPlus.finalExamMax, 210);
  assert.equal(aPlus.status, 'moderate'); // 76.19% is moderate
});

test('calculateGpa handles credit-weighted grades and excludes non-graded courses', () => {
  const testCourses: Course[] = [
    { code: 'C1', name: 'Course 1', credits: 3, type: 'T', topics: [] },
    { code: 'C2', name: 'Course 2', credits: 4, type: 'T', topics: [] },
    { code: 'C3', name: 'Sessional Part 1', credits: 3, type: 'S', topics: [], notGraded: true },
  ];
  const grades = {
    '1-1|C1': '4.00',
    '1-1|C2': '3.75',
    '1-1|C3': '0.00',
  };
  const result = calculateGpa(testCourses, grades, (code) => `1-1|${code}`);
  // C1: 3 * 4.0 = 12, C2: 4 * 3.75 = 15. Total points = 27. Graded credits = 7.
  // GPA = 27 / 7 = 3.857 -> 3.86
  assert.equal(result.gradedCredits, 7);
  assert.equal(result.gpa, 3.86);
  assert.equal(result.honorsEligible, true);
});

test('calculateTargetPlan recommends minimum grades for target GPA', () => {
  const testCourses: Course[] = [
    { code: 'C1', name: 'Course 1', credits: 3, type: 'T', topics: [] },
    { code: 'C2', name: 'Course 2', credits: 3, type: 'T', topics: [] },
  ];
  const strengths = {
    '1-1|C1': 'S' as const,
    '1-1|C2': 'A' as const,
  };
  const plan = calculateTargetPlan(testCourses, 3.8, strengths, (c) => `1-1|${c}`);
  assert.equal(plan.achievable, true);
  assert.ok(plan.projectedGpa >= 3.8);
});
