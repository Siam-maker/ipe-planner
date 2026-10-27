import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppState, TabKey, Course, AttendanceInputMode, CourseStrength } from './types';
import { getCoursesForTerm, getCourseKey, getTopicKey } from './data/curriculum';
import { loadAppState, saveAppState, INITIAL_STATE } from './utils/storage';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { LevelTermSelector } from './components/LevelTermSelector';
import { SyllabusView } from './components/SyllabusView';
import { MarksCalculatorView } from './components/MarksCalculatorView';
import { GpaCalculatorView } from './components/GpaCalculatorView';
import { TargetPlannerView } from './components/TargetPlannerView';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [showSplash, setShowSplash] = useState(true);

  // Auto-save state changes to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const currentCourses = useMemo(() => {
    return getCoursesForTerm(state.level, state.term);
  }, [state.level, state.term]);

  const totalCredits = useMemo(() => {
    return Math.round(currentCourses.reduce((sum, c) => sum + c.credits, 0) * 100) / 100;
  }, [currentCourses]);

  // Overall topic progress percentage for current term
  const topicProgressPct = useMemo(() => {
    let total = 0;
    let done = 0;
    currentCourses.forEach((c) => {
      total += c.topics.length;
      c.topics.forEach((_, i) => {
        const k = getTopicKey(state.level, state.term, c.code, i);
        if (state.doneTopics[k]) done++;
      });
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [currentCourses, state.level, state.term, state.doneTopics]);

  // Navigation handlers
  const handleSelectTab = useCallback((tab: TabKey) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const handleSelectLevel = useCallback((lvl: number) => {
    setState((prev) => {
      const courses = getCoursesForTerm(lvl, prev.term);
      const firstTheory = courses.find((c) => c.type === 'T') || courses[0];
      const newSelected = firstTheory ? getCourseKey(lvl, prev.term, firstTheory.code) : '';
      return { ...prev, level: lvl, selectedMarksCourse: newSelected };
    });
  }, []);

  const handleSelectTerm = useCallback((t: number) => {
    setState((prev) => {
      const courses = getCoursesForTerm(prev.level, t);
      const firstTheory = courses.find((c) => c.type === 'T') || courses[0];
      const newSelected = firstTheory ? getCourseKey(prev.level, t, firstTheory.code) : '';
      return { ...prev, term: t, selectedMarksCourse: newSelected };
    });
  }, []);

  // Syllabus handlers
  const handleToggleTopic = useCallback((topicKey: string) => {
    setState((prev) => ({
      ...prev,
      doneTopics: {
        ...prev.doneTopics,
        [topicKey]: !prev.doneTopics[topicKey],
      },
    }));
  }, []);

  const handleToggleSubjectExpand = useCallback((subjectKey: string) => {
    setState((prev) => {
      const current = prev.expandedSubjects[subjectKey] ?? true;
      return {
        ...prev,
        expandedSubjects: {
          ...prev.expandedSubjects,
          [subjectKey]: !current,
        },
      };
    });
  }, []);

  const handleSetAllTopicsForCourse = useCallback(
    (course: Course, done: boolean) => {
      setState((prev) => {
        const nextDone = { ...prev.doneTopics };
        course.topics.forEach((_, idx) => {
          const k = getTopicKey(prev.level, prev.term, course.code, idx);
          nextDone[k] = done;
        });
        return {
          ...prev,
          doneTopics: nextDone,
        };
      });
    },
    []
  );

  // Marks Calculator handlers
  const handleSelectMarksCourse = useCallback((key: string) => {
    setState((prev) => ({ ...prev, selectedMarksCourse: key }));
  }, []);

  const handleSetAttendanceMode = useCallback((courseKey: string, mode: AttendanceInputMode) => {
    setState((prev) => ({
      ...prev,
      attendanceMode: {
        ...prev.attendanceMode,
        [courseKey]: mode,
      },
    }));
  }, []);

  const handleSetAttendancePct = useCallback((courseKey: string, val: string) => {
    setState((prev) => ({
      ...prev,
      attendancePct: {
        ...prev.attendancePct,
        [courseKey]: val,
      },
    }));
  }, []);

  const handleSetAttendanceDirectMarks = useCallback((courseKey: string, val: string) => {
    setState((prev) => ({
      ...prev,
      attendanceDirectMarks: {
        ...prev.attendanceDirectMarks,
        [courseKey]: val,
      },
    }));
  }, []);

  const handleSetCtMark = useCallback((ctKey: string, val: string) => {
    setState((prev) => ({
      ...prev,
      ctMarks: {
        ...prev.ctMarks,
        [ctKey]: val,
      },
    }));
  }, []);

  // GPA Calculator handlers
  const handleSetGrade = useCallback((courseKey: string, gradePoint: string) => {
    setState((prev) => ({
      ...prev,
      grades: {
        ...prev.grades,
        [courseKey]: gradePoint,
      },
    }));
  }, []);

  const handleSetAllGrades = useCallback(
    (gradePoint: string) => {
      setState((prev) => {
        const nextGrades = { ...prev.grades };
        currentCourses.forEach((c) => {
          if (!c.notGraded) {
            const k = getCourseKey(prev.level, prev.term, c.code);
            nextGrades[k] = gradePoint;
          }
        });
        return {
          ...prev,
          grades: nextGrades,
        };
      });
    },
    [currentCourses]
  );

  // Target Planner handlers
  const handleSetTargetGpa = useCallback((gpa: number) => {
    setState((prev) => ({ ...prev, targetGpa: gpa }));
  }, []);

  const handleSetStrength = useCallback((courseKey: string, s: CourseStrength) => {
    setState((prev) => ({
      ...prev,
      strengths: {
        ...prev.strengths,
        [courseKey]: s,
      },
    }));
  }, []);

  // Reset handlers
  const handleResetTerm = useCallback(() => {
    setState((prev) => {
      const prefix = `${prev.level}-${prev.term}|`;
      const filterOutPrefix = <T,>(rec: Record<string, T>) => {
        const next: Record<string, T> = {};
        Object.entries(rec).forEach(([k, v]) => {
          if (!k.startsWith(prefix)) next[k] = v;
        });
        return next;
      };

      return {
        ...prev,
        doneTopics: filterOutPrefix(prev.doneTopics),
        grades: filterOutPrefix(prev.grades),
        strengths: filterOutPrefix(prev.strengths),
        attendanceMode: filterOutPrefix(prev.attendanceMode),
        attendancePct: filterOutPrefix(prev.attendancePct),
        attendanceDirectMarks: filterOutPrefix(prev.attendanceDirectMarks),
        ctMarks: filterOutPrefix(prev.ctMarks),
      };
    });
  }, []);

  const handleResetAll = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Intro Splash Screen with IPE BUET Logo */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="max-w-3xl lg:max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 pb-12">
        {/* Header Branding & Quick Tools */}
        <Header
          state={state}
          onResetTerm={handleResetTerm}
          onResetAll={handleResetAll}
        />

        {/* Level and Term Switcher */}
        <LevelTermSelector
          level={state.level}
          term={state.term}
          onSelectLevel={handleSelectLevel}
          onSelectTerm={handleSelectTerm}
          courseCount={currentCourses.length}
          totalCredits={totalCredits}
        />

        {/* Navigation Bar (Top on desktop, sticky bottom on mobile) */}
        <Navbar
          activeTab={state.activeTab}
          onSelectTab={handleSelectTab}
          topicProgressPct={topicProgressPct}
        />

        {/* Active Tab View: Instant, smooth tab rendering without screen on/off blanking */}
        <main className="relative">
          {state.activeTab === 'syllabus' && (
            <SyllabusView
              level={state.level}
              term={state.term}
              courses={currentCourses}
              doneTopics={state.doneTopics}
              expandedSubjects={state.expandedSubjects}
              onToggleTopic={handleToggleTopic}
              onToggleSubjectExpand={handleToggleSubjectExpand}
              onSetAllTopicsForCourse={handleSetAllTopicsForCourse}
            />
          )}

          {state.activeTab === 'marks' && (
            <MarksCalculatorView
              level={state.level}
              term={state.term}
              courses={currentCourses}
              selectedCourseKey={state.selectedMarksCourse}
              onSelectCourseKey={handleSelectMarksCourse}
              attendanceMode={state.attendanceMode}
              onSetAttendanceMode={handleSetAttendanceMode}
              attendancePct={state.attendancePct}
              onSetAttendancePct={handleSetAttendancePct}
              attendanceDirectMarks={state.attendanceDirectMarks}
              onSetAttendanceDirectMarks={handleSetAttendanceDirectMarks}
              ctMarks={state.ctMarks}
              onSetCtMark={handleSetCtMark}
            />
          )}

          {state.activeTab === 'gpa' && (
            <GpaCalculatorView
              level={state.level}
              term={state.term}
              courses={currentCourses}
              grades={state.grades}
              onSetGrade={handleSetGrade}
              onSetAllGrades={handleSetAllGrades}
            />
          )}

          {state.activeTab === 'target' && (
            <TargetPlannerView
              level={state.level}
              term={state.term}
              courses={currentCourses}
              targetGpa={state.targetGpa}
              onSetTargetGpa={handleSetTargetGpa}
              strengths={state.strengths}
              onSetStrength={handleSetStrength}
            />
          )}
        </main>

        {/* Creator footer credit only on home page (Syllabus tab) */}
        {state.activeTab === 'syllabus' && <Footer />}
      </div>

      {/* Vercel Analytics & Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
