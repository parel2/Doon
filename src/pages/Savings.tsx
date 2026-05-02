import { useState } from 'react';
import { PiggyBank, Shield, Plus, Clock } from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { formatRupiah, formatDate, formatTime } from '../utils';
import { addLedgerEntry, addSavingLog, saveState, needsDailySaving } from '../store';
import type { AppState, BalanceSource } from '../types';

interface Props {
  state: AppState;
  onUpdate: (s: AppState) => void;
}

export default function Savings({ state, onUpdate }: Props) {
  const [modal, setModal] = useState(false);
  const [kind, setKind] = useState<'inv' | 'emg'>('inv');
  const [amt, setAmt] = useState('');
  const [src, setSrc] = useState<BalanceSource>('offline');
  const [err, setErr] = useState('');

  const due = needsDailySaving(state);

  function submit() {
    const n = parseInt(amt);
    const min = kind === 'inv' ? 10000 : 5000;
    if (!n || n < min) { setErr(`Minimal ${formatRupiah(min)}`); return; }
    const bal = src === 'offline' ? state.balance.off : state.balance.on;
    if (n > bal) { setErr('Saldo tidak cukup'); return; }

    let s = { ...state };
    s.balance = { ...s.balance, [src === 'offline' ? 'off' : 'on']: bal - n };
    s.savings = { ...s.savings, [kind]: s.savings[kind] + n };
    s = addSavingLog(s, { ts: Date.now(), amt: n, kind, src });
    s = addLedgerEntry(s, { ts: Date.now(), amt: n, cat: kind === 'inv' ? 'Investasi' : 'Cadangan Darurat', src, type: 'saving' });
    s.meta = { ...s.meta, lastSave: Date.now() };
    saveState(s); onUpdate(s); setAmt(''); setErr(''); setModal(false);
  }

  const total = state.savings.inv + state.savings.emg;
  const invPct = total > 0 ? (state.savings.inv / total) * 100 : 50;

  return (
    <div className="space-y-4">
      {due && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl">
          <Clock size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-200">Kamu belum menabung hari ini! Segera simpan tabungan harian.</p>
        </div>
      )}

      {/* Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-teal-900 p-5">
        <p className="text-blue-200 text-xs uppercase tracking-widest">Total Tabungan</p>
        <p className="text-3xl font-black text-white mt-1">{formatRupiah(total)}</p>
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${invPct}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-[10px] text-blue-200">Investasi {invPct.toFixed(0)}%</p>
          <p className="text-[10px] text-blue-200">Cadangan {(100 - invPct).toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <PiggyBank size={14} className="text-emerald-400" />
            </div>
            <p className="text-xs text-gray-400">Investasi</p>
          </div>
          <p className="text-xl font-black text-emerald-400">{formatRupiah(state.savings.inv)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Shield size={14} className="text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Cadangan Darurat</p>
          </div>
          <p className="text-xl font-black text-blue-400">{formatRupiah(state.savings.emg)}</p>
        </Card>
      </div>

      <button
        onClick={() => setModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-xl transition-colors"
      >
        <Plus size={16} /> Tambah Tabungan
      </button>

      {/* Logs */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Riwayat Tabungan</h3>
        {state.savings.logs.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500 text-sm">Belum ada riwayat tabungan</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {state.savings.logs.map(log => (
              <Card key={log.id} className="flex items-center gap-3 p-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${log.kind === 'inv' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                  {log.kind === 'inv' ? <PiggyBank size={14} className="text-emerald-400" /> : <Shield size={14} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{log.kind === 'inv' ? 'Investasi' : 'Cadangan Darurat'}</p>
                  <p className="text-xs text-gray-500">{formatDate(log.ts)} {formatTime(log.ts)} · {log.src}</p>
                </div>
                <p className={`text-sm font-bold ${log.kind === 'inv' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  +{formatRupiah(log.amt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Tabungan">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(['inv', 'emg'] as const).map(k => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${kind === k ? (k === 'inv' ? 'bg-emerald-500 text-black' : 'bg-blue-500 text-white') : 'bg-white/5 text-gray-400'}`}
              >
                {k === 'inv' ? 'Investasi' : 'Cadangan Darurat'}
              </button>
            ))}
          </div>
          <InputField label={`Jumlah (min. ${kind === 'inv' ? 'Rp10.000' : 'Rp5.000'})`} prefix="Rp" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
          <SelectField label="Dari Saldo" value={src} onChange={e => setSrc(e.target.value as BalanceSource)} options={[
            { value: 'offline', label: `Offline — ${formatRupiah(state.balance.off)}` },
            { value: 'online', label: `Online — ${formatRupiah(state.balance.on)}` },
          ]} />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <button onClick={submit} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
