import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Card from './Card';
import { formatRupiah } from '../utils';

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  link: string;
}

const MOCK_BASE: Ticker[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 980_000_000, change: 2.4, link: 'https://ajaib.co.id/crypto/bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', price: 60_000_000, change: -1.2, link: 'https://ajaib.co.id/crypto/ethereum' },
  { symbol: 'XAU', name: 'Gold/XAU', price: 1_550_000, change: 0.8, link: 'https://www.alfagift.id/cari?q=emas' },
];

function jitter(base: number): number {
  return base * (1 + (Math.random() - 0.5) * 0.004);
}

export default function MarketWatch() {
  const [tickers, setTickers] = useState<Ticker[]>(MOCK_BASE);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => ({
        ...t,
        price: jitter(t.price),
        change: parseFloat((t.change + (Math.random() - 0.5) * 0.3).toFixed(2)),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Market Watch</h3>
        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">Live (Mock)</span>
      </div>
      <div className="space-y-2">
        {tickers.map(t => (
          <a
            key={t.symbol}
            href={t.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/8 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-black text-amber-400">{t.symbol}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{t.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white">{formatRupiah(Math.round(t.price))}</p>
              <div className={`flex items-center justify-end gap-0.5 ${t.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span className="text-[9px] font-medium">{t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%</span>
              </div>
            </div>
            <ExternalLink size={10} className="text-gray-600 flex-shrink-0" />
          </a>
        ))}
      </div>
    </Card>
  );
}
