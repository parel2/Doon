import { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController, LineElement, PointElement, LinearScale, CategoryScale, LineController, Filler } from 'chart.js';
import Card from '../components/Card';
import { formatRupiah, getLast30Days } from '../utils';
import type { AppState } from '../types';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController, LineElement, PointElement, LinearScale, CategoryScale, LineController, Filler);

interface Props {
  state: AppState;
}

export default function Analytics({ state }: Props) {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const donutChart = useRef<Chart | null>(null);
  const lineChart = useRef<Chart | null>(null);

  const expenses = state.ledger.filter(e => e.type === 'expense');

  // Category distribution
  const catMap: Record<string, number> = {};
  expenses.forEach(e => { catMap[e.cat] = (catMap[e.cat] || 0) + e.amt; });
  const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Last 30 days balance trend
  const days = getLast30Days();
  const balanceTrend = days.map(day => {
    const dayExpenses = state.ledger
      .filter(e => e.type === 'expense' && new Date(e.ts).toISOString().slice(0, 10) === day)
      .reduce((s, e) => s + e.amt, 0);
    const dayIncome = state.ledger
      .filter(e => e.type === 'income' && new Date(e.ts).toISOString().slice(0, 10) === day)
      .reduce((s, e) => s + e.amt, 0);
    return dayIncome - dayExpenses;
  });

  // Heatmap: saving days in past 12 weeks
  const heatDays: { date: string; saved: boolean }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const saved = state.savings.logs.some(l => new Date(l.ts).toISOString().slice(0, 10) === dateStr);
    heatDays.push({ date: dateStr, saved });
  }

  // Metrics
  const totalExpenses = expenses.reduce((s, e) => s + e.amt, 0);
  const totalIncome = state.ledger.filter(e => e.type === 'income').reduce((s, e) => s + e.amt, 0);
  const totalSaving = state.savings.inv + state.savings.emg;
  const burnRate = totalExpenses / 30;
  const ratio = totalExpenses > 0 ? ((totalSaving / totalExpenses) * 100).toFixed(1) : '0';
  const dailyAvg = totalExpenses / Math.max(days.filter(d => state.ledger.some(e => new Date(e.ts).toISOString().slice(0, 10) === d && e.type === 'expense')).length, 1);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  useEffect(() => {
    if (!donutRef.current) return;
    donutChart.current?.destroy();
    if (sortedCats.length === 0) return;
    donutChart.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: sortedCats.map(([c]) => c),
        datasets: [{ data: sortedCats.map(([, v]) => v), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${formatRupiah(ctx.parsed)}` } } },
      },
    });
    return () => { donutChart.current?.destroy(); };
  }, [state.ledger]);

  useEffect(() => {
    if (!lineRef.current) return;
    lineChart.current?.destroy();
    lineChart.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: days.map(d => d.slice(5)),
        datasets: [{
          data: balanceTrend,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${formatRupiah(ctx.parsed.y)}` } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', maxTicksLimit: 6, font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 }, callback: (v) => `${Number(v) >= 1000 ? (Number(v)/1000).toFixed(0)+'k' : v}` } },
        },
      },
    });
    return () => { lineChart.current?.destroy(); };
  }, [state.ledger]);

  const weeks = Array.from({ length: 12 }, (_, i) => heatDays.slice(i * 7, i * 7 + 7));

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Burn Rate/Hari', value: formatRupiah(Math.round(burnRate)), color: 'text-red-400' },
          { label: 'Saving Ratio', value: `${ratio}%`, color: 'text-emerald-400' },
          { label: 'Avg. Harian', value: formatRupiah(Math.round(dailyAvg)), color: 'text-amber-400' },
        ].map(m => (
          <Card key={m.label} className="p-3 text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">{m.label}</p>
            <p className={`text-sm font-black mt-1 ${m.color}`}>{m.value}</p>
          </Card>
        ))}
      </div>

      {/* Donut */}
      <Card className="p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Distribusi Pengeluaran</h3>
        {sortedCats.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Belum ada data pengeluaran</p>
        ) : (
          <div className="flex gap-4">
            <div className="relative" style={{ width: 140, height: 140, flexShrink: 0 }}>
              <canvas ref={donutRef} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-sm font-bold text-white">{formatRupiah(totalExpenses)}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {sortedCats.slice(0, 6).map(([cat, val], i) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-gray-300 flex-1 truncate">{cat}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{((val / totalExpenses) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Line Chart */}
      <Card className="p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tren Likuiditas (30 Hari)</h3>
        <div style={{ height: 160 }}>
          <canvas ref={lineRef} />
        </div>
      </Card>

      {/* Heatmap */}
      <Card className="p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Streak Menabung (12 Minggu)</h3>
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(day => (
                <div
                  key={day.date}
                  title={day.date}
                  className={`w-4 h-4 rounded-sm transition-colors ${day.saved ? 'bg-emerald-500' : 'bg-white/5'}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-3 h-3 rounded-sm bg-white/5" />
          <span className="text-xs text-gray-500">Tidak menabung</span>
          <div className="w-3 h-3 rounded-sm bg-emerald-500 ml-2" />
          <span className="text-xs text-gray-500">Menabung</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Streak: <span className="text-emerald-400 font-semibold">{heatDays.filter(d => d.saved).length} hari</span>
        </p>
      </Card>

      {/* Summary */}
      <Card className="p-4 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ringkasan Keuangan</h3>
        {[
          { label: 'Total Pemasukan', value: formatRupiah(totalIncome), color: 'text-emerald-400' },
          { label: 'Total Pengeluaran', value: formatRupiah(totalExpenses), color: 'text-red-400' },
          { label: 'Total Tabungan', value: formatRupiah(totalSaving), color: 'text-blue-400' },
          { label: 'Saldo Saat Ini', value: formatRupiah(state.balance.off + state.balance.on), color: 'text-white' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-400">{row.label}</span>
            <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
