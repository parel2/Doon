import { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, PiggyBank, Target } from 'lucide-react';
import Card from '../components/Card';
import { formatRupiah, formatDate, formatTime } from '../utils';
import type { AppState, LedgerType } from '../types';

interface Props {
  state: AppState;
}

const TYPE_LABELS: Record<LedgerType, string> = {
  expense: 'Pengeluaran',
  income: 'Pemasukan',
  transfer: 'Transfer',
  saving: 'Tabungan',
  target: 'Target',
};

const TYPE_FILTERS: { id: LedgerType | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'expense', label: 'Pengeluaran' },
  { id: 'income', label: 'Pemasukan' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'saving', label: 'Tabungan' },
  { id: 'target', label: 'Target' },
];

function typeIcon(type: LedgerType) {
  switch (type) {
    case 'income': return <ArrowDownLeft size={14} className="text-emerald-400" />;
    case 'transfer': return <ArrowLeftRight size={14} className="text-amber-400" />;
    case 'saving': return <PiggyBank size={14} className="text-blue-400" />;
    case 'target': return <Target size={14} className="text-purple-400" />;
    default: return <ArrowUpRight size={14} className="text-red-400" />;
  }
}

function typeBg(type: LedgerType) {
  switch (type) {
    case 'income': return 'bg-emerald-500/20';
    case 'transfer': return 'bg-amber-500/20';
    case 'saving': return 'bg-blue-500/20';
    case 'target': return 'bg-purple-500/20';
    default: return 'bg-red-500/20';
  }
}

function typeColor(type: LedgerType) {
  switch (type) {
    case 'income': return 'text-emerald-400';
    case 'transfer': return 'text-amber-400';
    case 'saving': return 'text-blue-400';
    case 'target': return 'text-purple-400';
    default: return 'text-red-400';
  }
}

export default function Ledger({ state }: Props) {
  const [filter, setFilter] = useState<LedgerType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = state.ledger.filter(e => {
    const matchType = filter === 'all' || e.type === filter;
    const matchSearch = !search || e.cat.toLowerCase().includes(search.toLowerCase()) || (e.note || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalIn = state.ledger.filter(e => e.type === 'income').reduce((s, e) => s + e.amt, 0);
  const totalOut = state.ledger.filter(e => e.type === 'expense').reduce((s, e) => s + e.amt, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Masuk</p>
          <p className="text-base font-bold text-emerald-400">{formatRupiah(totalIn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Keluar</p>
          <p className="text-base font-bold text-red-400">{formatRupiah(totalOut)}</p>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1e2231] border border-white/10 rounded-xl px-3 py-2.5">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari transaksi..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 text-sm">Tidak ada transaksi</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <Card key={entry.id} className="flex items-center gap-3 p-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg(entry.type)}`}>
                {typeIcon(entry.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{entry.cat}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{formatDate(entry.ts)} {formatTime(entry.ts)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-xs text-gray-500">{entry.src}</span>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{TYPE_LABELS[entry.type]}</span>
                </div>
                {entry.note && !entry.note.startsWith('ID:') && (
                  <p className="text-xs text-gray-600 truncate mt-0.5">{entry.note}</p>
                )}
              </div>
              <p className={`text-sm font-bold flex-shrink-0 ${typeColor(entry.type)}`}>
                {entry.type === 'income' ? '+' : '-'}{formatRupiah(entry.amt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
