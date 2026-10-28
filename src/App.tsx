import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppState, TabKey, Course, AttendanceInputMode, CourseStrength } from './types';
import { getCoursesForTerm, getCourseKey, getTopicKey } from './data/curriculum';
import { loadAppState, saveAppState, INITIAL_STATE } from './utils/storage';
import { TopHeader } from './components/TopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { CoursesView } from './components/CoursesView';
import { CourseDetailModal } from './components/CourseDetailModal';
import { SyllabusView } from './components/SyllabusView';
import { MarksCalculatorView } from './components/MarksCalculatorView';
import { GpaCalculatorView } from './components/GpaCalculatorView';
import { TargetPlannerView } from './components/TargetPlannerView';
import { AcademicResourcesView } from './components/AcademicResourcesView';
import { SettingsView } from './components/SettingsView';
import { SplashScreen } from './components/SplashScreen';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCourseDetailCode, setSelectedCourseDetailCode] = useState<string | null>(null);

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Lock background scroll when course modal is open
  useEffect(() => {
    if (selectedCourseDetailCode) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [selectedCourseDetailCode]);

  // Auto-save state changes to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const currentCourses = useMemo(() => {
    return getCoursesForTerm(state.level, state.term);
  }, [state.level, state.term]);

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

  // Selected course for detail modal
  const selectedCourseDetail = useMemo(() => {
    if (!selectedCourseDetailCode) return null;
    return currentCourses.find((c) => c.code === selectedCourseDetailCode) || null;
  }, [currentCourses, selectedCourseDetailCode]);

  // Navigation handlers
  const handleSelectTab = useCallback((tab: TabKey) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Course inspection & notes
  const handleSelectCourse = useCallback((courseCode: string) => {
    setSelectedCourseDetailCode(courseCode);
  }, []);

  const handleSaveNotes = useCallback((courseCode: string, noteText: string) => {
    setState((prev) => ({
      ...prev,
      notes: {
        ...(prev.notes || {}),
        [courseCode]: noteText,
      },
    }));
  }, []);

  const handleOpenMarksForCourse = useCallback((courseKey: string) => {
    setState((prev) => ({
      ...prev,
      activeTab: 'marks',
      selectedMarksCourse: courseKey,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Theme & Profile
  const handleToggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, []);

  const handleUpdateStudentName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, studentName: name }));
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
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-[#191715] text-[#2B2622] dark:text-[#F5F1EA] flex flex-col transition-colors selection:bg-[#C65D3B] selection:text-white antialiased relative">
      {/* Subtle tactile paper texture overlay */}
      <div className="fixed inset-0 pointer-events-none paper-grain z-50 opacity-40 dark:opacity-20 select-none" aria-hidden="true" />

      {/* Intro Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Top Header with full navigation, live search, theme toggle, session switcher, and student profile */}
      <TopHeader
        activeTab={state.activeTab}
        onSelectTab={handleSelectTab}
        topicProgressPct={topicProgressPct}
        isDarkMode={Boolean(state.isDarkMode)}
        onToggleDarkMode={handleToggleDarkMode}
        studentName={state.studentName || 'Altaf Hossain'}
        courses={currentCourses}
        level={state.level}
        term={state.term}
        onSelectLevel={handleSelectLevel}
        onSelectTerm={handleSelectTerm}
        onSelectCourse={handleSelectCourse}
        onResetTerm={handleResetTerm}
      />

      {/* Dynamic Page Content Viewport */}
      <main
        key={state.activeTab}
        className="flex-1 px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-7xl w-full mx-auto min-w-0 pb-24 sm:pb-28 md:pb-32 animate-view-fade"
      >
          {state.activeTab === 'dashboard' && (
            <DashboardView
              level={state.level}
              term={state.term}
              courses={currentCourses}
              doneTopics={state.doneTopics}
              onSelectTab={handleSelectTab}
              onSelectCourse={handleSelectCourse}
              studentName={state.studentName || 'Altaf Hossain'}
            />
          )}

          {state.activeTab === 'courses' && (
            <CoursesView
              level={state.level}
              term={state.term}
              courses={currentCourses}
              doneTopics={state.doneTopics}
              onSelectCourse={handleSelectCourse}
              onOpenMarksForCourse={handleOpenMarksForCourse}
              onSelectTab={handleSelectTab}
            />
          )}

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

          {state.activeTab === 'resources' && <AcademicResourcesView />}

          {state.activeTab === 'settings' && (
            <SettingsView
              state={state}
              onUpdateStudentName={handleUpdateStudentName}
              isDarkMode={Boolean(state.isDarkMode)}
              onToggleDarkMode={handleToggleDarkMode}
              onResetTerm={handleResetTerm}
              onResetAll={handleResetAll}
            />
          )}
        </main>

        {/* Course Detail Modal */}
      {selectedCourseDetail && (
        <CourseDetailModal
          course={selectedCourseDetail}
          level={state.level}
          term={state.term}
          onClose={() => setSelectedCourseDetailCode(null)}
          doneTopics={state.doneTopics}
          onToggleTopic={handleToggleTopic}
          onSetAllTopicsForCourse={handleSetAllTopicsForCourse}
          notes={state.notes || {}}
          onSaveNotes={handleSaveNotes}
          onOpenMarksCalculator={(courseCode) => {
            const k = getCourseKey(state.level, state.term, courseCode);
            handleOpenMarksForCourse(k);
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={state.activeTab}
        onSelectTab={handleSelectTab}
        topicProgressPct={topicProgressPct}
      />

      {/* Analytics */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
