import { AppState, TabKey } from '../types';

const STORAGE_KEY = 'ipe-planner-v3';

export const INITIAL_STATE: AppState = {
  level: 1,
  term: 1,
  activeTab: 'dashboard',
  targetGpa: 3.85,
  selectedMarksCourse: '1-1|Phy 117',
  studentName: 'Altaf Hossain',
  isDarkMode: false,
  notes: {},
  doneTopics: {},
  grades: {},
  strengths: {},
  attendanceMode: {},
  attendancePct: {},
  attendanceDirectMarks: {},
  ctMarks: {},
  expandedSubjects: {},
};

export function normalizeState(raw: any): AppState {
  if (!raw || typeof raw !== 'object') return { ...INITIAL_STATE };
  return {
    ...INITIAL_STATE,
    ...raw,
    level: Number(raw.level) || 1,
    term: Number(raw.term) || 1,
    activeTab: (raw.activeTab as TabKey) || 'dashboard',
    targetGpa: Number(raw.targetGpa) || 3.85,
    selectedMarksCourse: raw.selectedMarksCourse || '1-1|Phy 117',
    studentName: raw.studentName || 'Altaf Hossain',
    isDarkMode: Boolean(raw.isDarkMode),
    notes: raw.notes || {},
    doneTopics: raw.doneTopics || {},
    grades: raw.grades || {},
    strengths: raw.strengths || {},
    attendanceMode: raw.attendanceMode || {},
    attendancePct: raw.attendancePct || {},
    attendanceDirectMarks: raw.attendanceDirectMarks || {},
    ctMarks: raw.ctMarks || {},
    expandedSubjects: raw.expandedSubjects || {},
  };
}

export function parseBackupJson(rawJson: string): AppState | null {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return null;
    return normalizeState(parsed);
  } catch {
    return null;
  }
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('ipe-planner-v2');
    if (!raw) {
      const legacyRaw = localStorage.getItem('ipe-planner');
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        return migrateLegacyState(legacy);
      }
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
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
