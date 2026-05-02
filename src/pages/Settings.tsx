import { useState } from 'react';
import { Download, Upload, Trash2, Wallet, Info, ChevronRight, Copy, Check } from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { formatRupiah } from '../utils';
import { exportCode, importCode, saveState, DEFAULT_STATE } from '../store';
import type { AppState } from '../types';

interface Props {
  state: AppState;
  onUpdate: (s: AppState) => void;
}

export default function Settings({ state, onUpdate }: Props) {
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [importCode2, setImportCode2] = useState('');
  const [importErr, setImportErr] = useState('');
  const [copied, setCopied] = useState(false);

  const code = exportCode(state);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleImport() {
    try {
      const newState = importCode(importCode2, state);
      saveState(newState); onUpdate(newState);
      setImportModal(false); setImportCode2(''); setImportErr('');
    } catch {
      setImportErr('Kode tidak valid. Pastikan kode immigration yang benar.');
    }
  }

  function handleReset() {
    saveState({ ...DEFAULT_STATE });
    onUpdate({ ...DEFAULT_STATE });
    setResetModal(false);
  }

  return (
    <div className="space-y-5">
      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-5 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Wallet size={26} className="text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Doon</h2>
            <p className="text-xs text-gray-400">Dompet Online</p>
            <p className="text-xs text-emerald-400 mt-0.5">by N2Oktena | Parel</p>
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      <Card className="p-4 space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ringkasan Saldo</h3>
        {[
          { label: 'Saldo Offline', value: formatRupiah(state.balance.off) },
          { label: 'Saldo Online', value: formatRupiah(state.balance.on) },
          { label: 'Total Tabungan', value: formatRupiah(state.savings.inv + state.savings.emg) },
          { label: 'Total Transaksi', value: `${state.ledger.length} entri` },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-400">{row.label}</span>
            <span className="text-sm font-semibold text-white">{row.value}</span>
          </div>
        ))}
      </Card>

      {/* Data Portability */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Portabilitas Data</h3>
        <div className="space-y-2">
          <button
            onClick={() => setExportModal(true)}
            className="w-full flex items-center gap-3 p-4 bg-[#151820] border border-white/8 rounded-xl hover:border-white/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Download size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Export Data</p>
              <p className="text-xs text-gray-500">Salin immigration code</p>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </button>

          <button
            onClick={() => setImportModal(true)}
            className="w-full flex items-center gap-3 p-4 bg-[#151820] border border-white/8 rounded-xl hover:border-white/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Upload size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Import Data</p>
              <p className="text-xs text-gray-500">Tempel immigration code</p>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider mb-3">Zona Berbahaya</h3>
        <button
          onClick={() => setResetModal(true)}
          className="w-full flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-red-400">Reset Semua Data</p>
            <p className="text-xs text-red-400/60">Hapus seluruh data aplikasi</p>
          </div>
        </button>
      </div>

      {/* About */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-gray-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tentang</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Aplikasi</span>
            <span className="text-white font-medium">Doon — Dompet Online</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Versi</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Developer</span>
            <span className="text-emerald-400 font-medium">by N2Oktena | Parel</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Storage</span>
            <span className="text-white">localStorage (100% offline)</span>
          </div>
        </div>
      </Card>

      {/* Export Modal */}
      <Modal open={exportModal} onClose={() => setExportModal(false)} title="Export Data">
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Salin kode berikut dan simpan di tempat yang aman. Kode ini berisi seluruh data keuanganmu.</p>
          <div className="relative">
            <textarea
              readOnly
              value={code}
              className="w-full h-32 bg-[#1e2231] border border-white/10 rounded-xl p-3 text-xs text-gray-300 font-mono resize-none outline-none"
            />
          </div>
          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500 text-black'
            }`}
          >
            {copied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin Kode</>}
          </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModal} onClose={() => { setImportModal(false); setImportErr(''); setImportCode2(''); }} title="Import Data">
        <div className="space-y-3">
          <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">Data yang diimport akan digabungkan dengan data yang sudah ada (tidak menghapus data lama).</p>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Immigration Code</label>
            <textarea
              value={importCode2}
              onChange={e => setImportCode2(e.target.value)}
              placeholder="Tempel kode immigration di sini..."
              className="w-full h-32 bg-[#1e2231] border border-white/10 rounded-xl p-3 text-xs text-gray-300 font-mono resize-none outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          {importErr && <p className="text-xs text-red-400">{importErr}</p>}
          <button
            onClick={handleImport}
            disabled={!importCode2.trim()}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            Import Data
          </button>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal open={resetModal} onClose={() => setResetModal(false)} title="Konfirmasi Reset">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">Apakah kamu yakin ingin menghapus <strong className="text-white">seluruh data</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">Pastikan kamu sudah menyimpan immigration code terlebih dahulu!</p>
          <div className="flex gap-2">
            <button onClick={() => setResetModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors text-sm">Batal</button>
            <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors text-sm">Ya, Reset</button>
          </div>
        </div>
      </Modal>

      <p className="text-center text-xs text-gray-600 pb-2">by N2Oktena | Parel · Doon v1.0.0</p>
    </div>
  );
}
