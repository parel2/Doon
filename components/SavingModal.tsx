import { useState } from 'react';
import { PiggyBank, Shield } from 'lucide-react';
import Modal from './Modal';
import InputField from './InputField';
import SelectField from './SelectField';
import { formatRupiah } from '../utils';
import type { AppState, BalanceSource } from '../types';
import { addLedgerEntry, addSavingLog, saveState, needsDailySaving } from '../store';

interface Props {
  state: AppState;
  onUpdate: (s: AppState) => void;
  forced?: boolean;
}

export default function SavingModal({ state, onUpdate, forced = false }: Props) {
  const open = forced ? needsDailySaving(state) : false;
  const [invAmt, setInvAmt] = useState('10000');
  const [emgAmt, setEmgAmt] = useState('5000');
  const [src, setSrc] = useState<BalanceSource>('offline');
  const [error, setError] = useState('');

  function handleSave() {
    const inv = parseInt(invAmt) || 0;
    const emg = parseInt(emgAmt) || 0;
    if (inv < 10000) { setError('Investasi minimal Rp10.000'); return; }
    if (emg < 5000) { setError('Cadangan darurat minimal Rp5.000'); return; }
    const total = inv + emg;
    const bal = src === 'offline' ? state.balance.off : state.balance.on;
    if (total > bal) { setError(`Saldo ${src === 'offline' ? 'offline' : 'online'} tidak cukup`); return; }

    let s = { ...state };
    s.balance = { ...s.balance, [src === 'offline' ? 'off' : 'on']: bal - total };
    s.savings = { ...s.savings, inv: s.savings.inv + inv, emg: s.savings.emg + emg };
    s = addSavingLog(s, { ts: Date.now(), amt: inv, kind: 'inv', src });
    s = addSavingLog(s, { ts: Date.now(), amt: emg, kind: 'emg', src });
    s = addLedgerEntry(s, { ts: Date.now(), amt: inv, cat: 'Investasi', src, type: 'saving' });
    s = addLedgerEntry(s, { ts: Date.now(), amt: emg, cat: 'Cadangan Darurat', src, type: 'saving' });
    s.meta = { ...s.meta, lastSave: Date.now() };
    saveState(s);
    onUpdate(s);
    setError('');
  }

  if (!open) return null;

  return (
    <Modal open title="Wajib Menabung Hari Ini" closable={false}>
      <div className="space-y-4">
        <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <span className="text-amber-400 text-xl">!</span>
          <p className="text-xs text-amber-200">Kamu belum menabung dalam 24 jam terakhir. Selesaikan kewajiban menabung untuk melanjutkan.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <PiggyBank size={20} className="mx-auto text-emerald-400 mb-1" />
            <p className="text-xs text-gray-400">Investasi</p>
            <p className="text-sm font-bold text-emerald-400">{formatRupiah(state.savings.inv)}</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
            <Shield size={20} className="mx-auto text-blue-400 mb-1" />
            <p className="text-xs text-gray-400">Cadangan</p>
            <p className="text-sm font-bold text-blue-400">{formatRupiah(state.savings.emg)}</p>
          </div>
        </div>

        <InputField label="Investasi (min. Rp10.000)" prefix="Rp" type="number" value={invAmt} onChange={e => setInvAmt(e.target.value)} />
        <InputField label="Cadangan Darurat (min. Rp5.000)" prefix="Rp" type="number" value={emgAmt} onChange={e => setEmgAmt(e.target.value)} />
        <SelectField
          label="Sumber Dana"
          value={src}
          onChange={e => setSrc(e.target.value as BalanceSource)}
          options={[
            { value: 'offline', label: `Offline — ${formatRupiah(state.balance.off)}` },
            { value: 'online', label: `Online — ${formatRupiah(state.balance.on)}` },
          ]}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors"
        >
          Simpan Sekarang
        </button>
      </div>
    </Modal>
  );
}
