import { AppState, TabKey } from '../types';

const STORAGE_KEY = 'ipe-planner-v2';

export const INITIAL_STATE: AppState = {
  level: 1,
  term: 1,
  activeTab: 'syllabus',
  targetGpa: 3.85,
  selectedMarksCourse: '1-1|Phy 117',
  doneTopics: {},
  grades: {},
  strengths: {},
  attendanceMode: {},
  attendancePct: {},
  attendanceDirectMarks: {},
  ctMarks: {},
  expandedSubjects: {},
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Also check legacy key if user previously had data
      const legacyRaw = localStorage.getItem('ipe-planner');
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        return migrateLegacyState(legacy);
      }
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      level: parsed.level || 1,
      term: parsed.term || 1,
      activeTab: (parsed.activeTab as TabKey) || 'syllabus',
      doneTopics: parsed.doneTopics || {},
      grades: parsed.grades || {},
      strengths: parsed.strengths || {},
      attendanceMode: parsed.attendanceMode || {},
      attendancePct: parsed.attendancePct || {},
      attendanceDirectMarks: parsed.attendanceDirectMarks || {},
      ctMarks: parsed.ctMarks || {},
      expandedSubjects: parsed.expandedSubjects || {},
    };
  } catch (err) {
    console.warn('Failed to load saved state:', err);
    return INITIAL_STATE;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
}

function migrateLegacyState(legacy: Record<string, unknown>): AppState {
  const state: AppState = { ...INITIAL_STATE };
  if (legacy.lv) state.level = Number(legacy.lv) || 1;
  if (legacy.tm) state.term = Number(legacy.tm) || 1;
  if (legacy.tg) state.targetGpa = Number(legacy.tg) || 3.85;

  const tabMap: Record<string, TabKey> = {
    syl: 'syllabus',
    gpa: 'gpa',
    tgt: 'target',
    mk: 'marks',
  };
  if (typeof legacy.tab === 'string' && tabMap[legacy.tab]) {
    state.activeTab = tabMap[legacy.tab];
  }

  if (legacy.done && typeof legacy.done === 'object') {
    state.doneTopics = legacy.done as Record<string, boolean>;
  }
  if (legacy.gr && typeof legacy.gr === 'object') {
    state.grades = legacy.gr as Record<string, string>;
  }
  if (legacy.st && typeof legacy.st === 'object') {
    state.strengths = legacy.st as Record<string, 'S' | 'A' | 'W'>;
  }
  if (legacy.at && typeof legacy.at === 'object') {
    state.attendancePct = legacy.at as Record<string, string>;
  }
  if (legacy.ct && typeof legacy.ct === 'object') {
    state.ctMarks = legacy.ct as Record<string, string>;
  }

  return state;
}

export function exportBackup(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buet-ipe-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
