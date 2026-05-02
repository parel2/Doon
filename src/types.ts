export type BalanceSource = 'offline' | 'online';

export type ExpenseCategory =
  | 'Makanan'
  | 'Hiburan'
  | 'Kuliah'
  | 'Keperluan Rumah'
  | 'Internet/Pulsa'
  | 'Motor'
  | 'Style'
  | 'Lainnya';

export type LedgerType = 'expense' | 'income' | 'transfer' | 'saving' | 'target';

export interface LedgerEntry {
  id: string;
  ts: number;
  amt: number;
  cat: string;
  src: BalanceSource;
  type: LedgerType;
  note?: string;
}

export interface SavingLog {
  id: string;
  ts: number;
  amt: number;
  kind: 'inv' | 'emg';
  src: BalanceSource;
}

export interface Target {
  id: string;
  name: string;
  goal: number;
  acc: number;
  createdAt: number;
}

export interface AppState {
  profile: { name: string; app: string };
  balance: { off: number; on: number };
  savings: { inv: number; emg: number; logs: SavingLog[] };
  targets: Target[];
  ledger: LedgerEntry[];
  meta: { lastSave: number | null; onboarded: boolean };
  dailyInput: { lastDate: string | null; added: boolean };
}

export type NavTab = 'dashboard' | 'savings' | 'target' | 'ledger' | 'analytics' | 'settings';
