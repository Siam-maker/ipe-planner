export type CourseType = 'T' | 'S';

export interface Course {
  code: string;
  name: string;
  credits: number;
  type: CourseType;
  topics: string[];
  notGraded?: boolean;
}

export type GradeTuple = [string, number, number]; // [letter, gradePoint, minMark]

export type CourseStrength = 'S' | 'A' | 'W'; // Strong, Average, Weak

export type AttendanceInputMode = 'percentage' | 'marks';

export type TabKey = 'syllabus' | 'gpa' | 'target' | 'marks';

export interface AppState {
  level: number;
  term: number;
  activeTab: TabKey;
  targetGpa: number;
  selectedMarksCourse: string; // Course key
  // Topic completions: key = "level-term|code#topicIndex" -> boolean
  doneTopics: Record<string, boolean>;
  // Estimated grades: key = "level-term|code" -> gradePoint as string
  grades: Record<string, string>;
  // Strengths for target planner: key = "level-term|code" -> 'S' | 'A' | 'W'
  strengths: Record<string, CourseStrength>;
  // Marks Calculator attendance mode: key = "level-term|code" -> 'percentage' | 'marks'
  attendanceMode: Record<string, AttendanceInputMode>;
  // Attendance percentage: key = "level-term|code" -> number | ''
  attendancePct: Record<string, string>;
  // Direct attendance marks: key = "level-term|code" -> number | ''
  attendanceDirectMarks: Record<string, string>;
  // CT marks: key = "level-term|code#ctIndex" -> number | ''
  ctMarks: Record<string, string>;
  // Expanded subjects in syllabus: key = "level-term|code" -> boolean
  expandedSubjects: Record<string, boolean>;
}
