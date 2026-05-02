import type { AppState, LedgerEntry, SavingLog, Target } from './types';

const STORAGE_KEY = 'doon_v1';

export const DEFAULT_STATE: AppState = {
  profile: { name: 'N2Oktena | Parel', app: 'Doon' },
  balance: { off: 0, on: 0 },
  savings: { inv: 0, emg: 0, logs: [] },
  targets: [],
  ledger: [],
  meta: { lastSave: null, onboarded: false },
  dailyInput: { lastDate: null, added: false },
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return deepMerge(structuredClone(DEFAULT_STATE), parsed);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const k = key as keyof T;
    const ov = override[k];
    const bv = base[k];
    if (ov !== undefined && ov !== null) {
      if (Array.isArray(ov)) {
        (result as Record<string, unknown>)[key] = ov;
      } else if (typeof ov === 'object' && typeof bv === 'object' && !Array.isArray(bv)) {
        (result as Record<string, unknown>)[key] = deepMerge(
          bv as object,
          ov as object
        );
      } else {
        (result as Record<string, unknown>)[key] = ov;
      }
    }
  }
  return result;
}

export function exportCode(state: AppState): string {
  const json = JSON.stringify(state);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importCode(code: string, current: AppState): AppState {
  const json = decodeURIComponent(escape(atob(code.trim())));
  const parsed = JSON.parse(json) as Partial<AppState>;
  return deepMerge(current, parsed);
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function needsDailySaving(state: AppState): boolean {
  const last = state.meta.lastSave;
  if (!last) return true;
  return Date.now() - last > 24 * 60 * 60 * 1000;
}

export function addLedgerEntry(state: AppState, entry: Omit<LedgerEntry, 'id'>): AppState {
  const e: LedgerEntry = { id: uid(), ...entry };
  return { ...state, ledger: [e, ...state.ledger] };
}

export function addSavingLog(state: AppState, log: Omit<SavingLog, 'id'>): AppState {
  const l: SavingLog = { id: uid(), ...log };
  return { ...state, savings: { ...state.savings, logs: [l, ...state.savings.logs] } };
}

export function addTarget(state: AppState, t: Omit<Target, 'id' | 'createdAt'>): AppState {
  const target: Target = { id: uid(), createdAt: Date.now(), acc: 0, ...t };
  return { ...state, targets: [...state.targets, target] };
}

export function updateTarget(state: AppState, id: string, patch: Partial<Target>): AppState {
  return { ...state, targets: state.targets.map(t => t.id === id ? { ...t, ...patch } : t) };
}

export function deleteTarget(state: AppState, id: string): AppState {
  return { ...state, targets: state.targets.filter(t => t.id !== id) };
}
