import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { formatRupiah } from '../utils';
import { addLedgerEntry, saveState, uid } from '../store';
import type { AppState, BalanceSource, ExpenseCategory } from '../types';

const HARIAN_CATS: ExpenseCategory[] = ['Makanan', 'Hiburan', 'Kuliah'];
const KHUSUS_CATS: ExpenseCategory[] = ['Keperluan Rumah', 'Internet/Pulsa', 'Kuliah', 'Hiburan', 'Motor', 'Style', 'Lainnya'];

interface Props {
  state: AppState;
  onUpdate: (s: AppState) => void;
}

type ModalType = null | 'income' | 'expense-harian' | 'expense-khusus' | 'transfer';

export default function Dashboard({ state, onUpdate }: Props) {
  const [modal, setModal] = useState<ModalType>(null);

  const totalBalance = state.balance.off + state.balance.on;
  const todayExpenses = state.ledger
    .filter(e => e.type === 'expense' && new Date(e.ts).toDateString() === new Date().toDateString())
    .reduce((s, e) => s + e.amt, 0);

  return (
    <div className="space-y-4">
      {/* Balance Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
        </div>
        <p className="text-emerald-200 text-xs font-medium uppercase tracking-widest">Total Saldo</p>
        <p className="text-3xl font-black text-white mt-1 tracking-tight">{formatRupiah(totalBalance)}</p>
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-emerald-200 uppercase tracking-wider">Offline</p>
            <p className="text-base font-bold text-white">{formatRupiah(state.balance.off)}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-emerald-200 uppercase tracking-wider">Online</p>
            <p className="text-base font-bold text-white">{formatRupiah(state.balance.on)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-400" />
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Pengeluaran Hari Ini</p>
          </div>
          <p className="text-lg font-bold text-red-400">{formatRupiah(todayExpenses)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total Tabungan</p>
          </div>
          <p className="text-lg font-bold text-emerald-400">{formatRupiah(state.savings.inv + state.savings.emg)}</p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Pemasukan', icon: ArrowDownLeft, color: 'emerald', action: () => setModal('income') },
          { label: 'Harian', icon: ArrowUpRight, color: 'red', action: () => setModal('expense-harian') },
          { label: 'Khusus', icon: Plus, color: 'orange', action: () => setModal('expense-khusus') },
          { label: 'Transfer', icon: ArrowLeftRight, color: 'blue', action: () => setModal('transfer') },
        ].map(({ label, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 hover:bg-${color}-500/20 transition-all active:scale-95`}
          >
            <div className={`w-9 h-9 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
              <Icon size={16} className={`text-${color}-400`} />
            </div>
            <span className={`text-[10px] font-medium text-${color}-300`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Transaksi Terbaru</h3>
        {state.ledger.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500 text-sm">Belum ada transaksi</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {state.ledger.slice(0, 5).map(entry => (
              <Card key={entry.id} className="flex items-center gap-3 p-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  entry.type === 'income' ? 'bg-emerald-500/20' :
                  entry.type === 'saving' ? 'bg-blue-500/20' :
                  entry.type === 'transfer' ? 'bg-amber-500/20' : 'bg-red-500/20'
                }`}>
                  {entry.type === 'income' ? <ArrowDownLeft size={14} className="text-emerald-400" /> :
                   entry.type === 'saving' ? <TrendingUp size={14} className="text-blue-400" /> :
                   entry.type === 'transfer' ? <ArrowLeftRight size={14} className="text-amber-400" /> :
                   <ArrowUpRight size={14} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{entry.cat}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {entry.src}</p>
                </div>
                <p className={`text-sm font-bold ${entry.type === 'income' ? 'text-emerald-400' : entry.type === 'saving' ? 'text-blue-400' : 'text-red-400'}`}>
                  {entry.type === 'income' ? '+' : '-'}{formatRupiah(entry.amt)}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <IncomeModal open={modal === 'income'} onClose={() => setModal(null)} state={state} onUpdate={onUpdate} />
      <ExpenseModal open={modal === 'expense-harian'} onClose={() => setModal(null)} state={state} onUpdate={onUpdate} cats={HARIAN_CATS} title="Pengeluaran Harian" defaultCat="Makanan" />
      <ExpenseModal open={modal === 'expense-khusus'} onClose={() => setModal(null)} state={state} onUpdate={onUpdate} cats={KHUSUS_CATS} title="Pengeluaran Khusus" defaultCat="Keperluan Rumah" />
      <TransferModal open={modal === 'transfer'} onClose={() => setModal(null)} state={state} onUpdate={onUpdate} />
    </div>
  );
}

function IncomeModal({ open, onClose, state, onUpdate }: { open: boolean; onClose: () => void; state: AppState; onUpdate: (s: AppState) => void }) {
  const [amt, setAmt] = useState('');
  const [src, setSrc] = useState<BalanceSource>('offline');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  function submit() {
    const n = parseInt(amt);
    if (!n || n <= 0) { setErr('Masukkan jumlah yang valid'); return; }
    let s = { ...state };
    s.balance = { ...s.balance, [src === 'offline' ? 'off' : 'on']: (src === 'offline' ? s.balance.off : s.balance.on) + n };
    s = addLedgerEntry(s, { ts: Date.now(), amt: n, cat: note || 'Pemasukan', src, type: 'income', note });
    saveState(s); onUpdate(s); setAmt(''); setNote(''); setErr(''); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Pemasukan">
      <div className="space-y-3">
        <InputField label="Jumlah" prefix="Rp" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
        <SelectField label="Ke Saldo" value={src} onChange={e => setSrc(e.target.value as BalanceSource)} options={[{ value: 'offline', label: 'Offline (Cash)' }, { value: 'online', label: 'Online (E-Wallet/Bank)' }]} />
        <InputField label="Keterangan (opsional)" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Gaji, freelance, dll." />
        {err && <p className="text-xs text-red-400">{err}</p>}
        <button onClick={submit} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors">Tambah</button>
      </div>
    </Modal>
  );
}

function ExpenseModal({ open, onClose, state, onUpdate, cats, title, defaultCat }: {
  open: boolean; onClose: () => void; state: AppState; onUpdate: (s: AppState) => void;
  cats: string[]; title: string; defaultCat: string;
}) {
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState(defaultCat);
  const [src, setSrc] = useState<BalanceSource>('offline');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  function submit() {
    const n = parseInt(amt);
    if (!n || n <= 0) { setErr('Masukkan jumlah yang valid'); return; }
    const bal = src === 'offline' ? state.balance.off : state.balance.on;
    if (n > bal) { setErr('Saldo tidak cukup'); return; }
    let s = { ...state };
    s.balance = { ...s.balance, [src === 'offline' ? 'off' : 'on']: bal - n };
    s = addLedgerEntry(s, { ts: Date.now(), amt: n, cat, src, type: 'expense', note });
    saveState(s); onUpdate(s); setAmt(''); setNote(''); setErr(''); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        <InputField label="Jumlah" prefix="Rp" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
        <SelectField label="Kategori" value={cat} onChange={e => setCat(e.target.value)} options={cats.map(c => ({ value: c, label: c }))} />
        <SelectField label="Dari Saldo" value={src} onChange={e => setSrc(e.target.value as BalanceSource)} options={[
          { value: 'offline', label: `Offline — ${formatRupiah(state.balance.off)}` },
          { value: 'online', label: `Online — ${formatRupiah(state.balance.on)}` },
        ]} />
        <InputField label="Keterangan (opsional)" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan..." />
        {err && <p className="text-xs text-red-400">{err}</p>}
        <button onClick={submit} className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors">Catat Pengeluaran</button>
      </div>
    </Modal>
  );
}

function TransferModal({ open, onClose, state, onUpdate }: { open: boolean; onClose: () => void; state: AppState; onUpdate: (s: AppState) => void }) {
  const [amt, setAmt] = useState('');
  const [from, setFrom] = useState<BalanceSource>('offline');
  const [fee, setFee] = useState('0');
  const [err, setErr] = useState('');

  const to: BalanceSource = from === 'offline' ? 'online' : 'offline';

  function submit() {
    const n = parseInt(amt);
    const f = parseInt(fee) || 0;
    if (!n || n <= 0) { setErr('Masukkan jumlah yang valid'); return; }
    const total = n + f;
    const bal = from === 'offline' ? state.balance.off : state.balance.on;
    if (total > bal) { setErr('Saldo tidak cukup (termasuk biaya admin)'); return; }

    let s = { ...state };
    s.balance = {
      ...s.balance,
      [from === 'offline' ? 'off' : 'on']: bal - total,
      [to === 'offline' ? 'off' : 'on']: (to === 'offline' ? s.balance.off : s.balance.on) + n,
    };
    const txId = uid();
    s = addLedgerEntry(s, { ts: Date.now(), amt: n, cat: `Transfer ${from} → ${to}`, src: from, type: 'transfer', note: `ID:${txId}` });
    if (f > 0) {
      s = addLedgerEntry(s, { ts: Date.now(), amt: f, cat: 'Lainnya', src: from, type: 'expense', note: 'Biaya admin transfer' });
    }
    saveState(s); onUpdate(s); setAmt(''); setFee('0'); setErr(''); onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Pindah Saldo">
      <div className="space-y-3">
        <SelectField label="Dari" value={from} onChange={e => setFrom(e.target.value as BalanceSource)} options={[
          { value: 'offline', label: `Offline — ${formatRupiah(state.balance.off)}` },
          { value: 'online', label: `Online — ${formatRupiah(state.balance.on)}` },
        ]} />
        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <span className="flex-1 h-px bg-white/10" />
          <span>ke {to.toUpperCase()}</span>
          <span className="flex-1 h-px bg-white/10" />
        </div>
        <InputField label="Jumlah Transfer" prefix="Rp" type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" />
        <InputField label="Biaya Admin (opsional)" prefix="Rp" type="number" value={fee} onChange={e => setFee(e.target.value)} />
        {err && <p className="text-xs text-red-400">{err}</p>}
        <button onClick={submit} className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors">Transfer</button>
      </div>
    </Modal>
  );
}
