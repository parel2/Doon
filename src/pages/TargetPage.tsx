import { useState } from 'react';
import { Target, Plus, Trash2, Zap } from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { formatRupiah } from '../utils';
import { addTarget, updateTarget, deleteTarget, addLedgerEntry, saveState } from '../store';
import type { AppState, BalanceSource } from '../types';

interface Props {
  state: AppState;
  onUpdate: (s: AppState) => void;
}

export default function TargetPage({ state, onUpdate }: Props) {
  const [addModal, setAddModal] = useState(false);
  const [injectModal, setInjectModal] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [injectAmt, setInjectAmt] = useState('');
  const [injectSrc, setInjectSrc] = useState<BalanceSource>('offline');
  const [err, setErr] = useState('');

  function submitAdd() {
    const g = parseInt(goal);
    if (!name.trim()) { setErr('Masukkan nama target'); return; }
    if (!g || g <= 0) { setErr('Masukkan nominal target'); return; }
    let s = addTarget(state, { name: name.trim(), goal: g });
    saveState(s); onUpdate(s); setName(''); setGoal(''); setErr(''); setAddModal(false);
  }

  function submitInject() {
    const n = parseInt(injectAmt);
    if (!n || n <= 0) { setErr('Masukkan jumlah yang valid'); return; }
    const bal = injectSrc === 'offline' ? state.balance.off : state.balance.on;
    if (n > bal) { setErr('Saldo tidak cukup'); return; }
    const t = state.targets.find(x => x.id === injectModal);
    if (!t) return;
    let s = { ...state };
    s.balance = { ...s.balance, [injectSrc === 'offline' ? 'off' : 'on']: bal - n };
    s = updateTarget(s, t.id, { acc: t.acc + n });
    s = addLedgerEntry(s, { ts: Date.now(), amt: n, cat: `Target: ${t.name}`, src: injectSrc, type: 'target' });
    saveState(s); onUpdate(s); setInjectAmt(''); setErr(''); setInjectModal(null);
  }

  function handleDelete(id: string) {
    const s = deleteTarget(state, id);
    saveState(s); onUpdate(s);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Target</h2>
          <p className="text-xs text-gray-400">{state.targets.length} target aktif</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl transition-colors"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      {state.targets.length === 0 ? (
        <Card className="p-8 text-center">
          <Target size={32} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">Belum ada target tabungan</p>
          <p className="text-gray-500 text-xs mt-1">Tambahkan target untuk mulai menabung</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {state.targets.map(t => {
            const pct = t.goal > 0 ? Math.min((t.acc / t.goal) * 100, 100) : 0;
            const done = pct >= 100;
            return (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{t.name}</p>
                      {done && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">Tercapai!</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Target: {formatRupiah(t.goal)}</p>
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{formatRupiah(t.acc)}</p>
                    <p className="text-xs text-gray-500">{pct.toFixed(1)}% tercapai</p>
                  </div>
                  {!done && (
                    <button
                      onClick={() => { setInjectModal(t.id); setErr(''); setInjectAmt(''); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Zap size={11} /> Isi Dana
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setErr(''); }} title="Tambah Target Baru">
        <div className="space-y-3">
          <InputField label="Nama Target" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Laptop, Motor, Liburan..." />
          <InputField label="Nominal Target" prefix="Rp" type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="0" />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <button onClick={submitAdd} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">Buat Target</button>
        </div>
      </Modal>

      {/* Inject Modal */}
      {injectModal && (() => {
        const t = state.targets.find(x => x.id === injectModal);
        if (!t) return null;
        return (
          <Modal open onClose={() => { setInjectModal(null); setErr(''); }} title={`Isi Dana — ${t.name}`}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Terkumpul</span>
                <span className="text-white font-semibold">{formatRupiah(t.acc)} / {formatRupiah(t.goal)}</span>
              </div>
              <InputField label="Jumlah" prefix="Rp" type="number" value={injectAmt} onChange={e => setInjectAmt(e.target.value)} placeholder="0" />
              <SelectField label="Dari Saldo" value={injectSrc} onChange={e => setInjectSrc(e.target.value as BalanceSource)} options={[
                { value: 'offline', label: `Offline — ${formatRupiah(state.balance.off)}` },
                { value: 'online', label: `Online — ${formatRupiah(state.balance.on)}` },
              ]} />
              {err && <p className="text-xs text-red-400">{err}</p>}
              <button onClick={submitInject} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">Masukkan Dana</button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
