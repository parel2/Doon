import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1400);
    const t2 = setTimeout(onDone, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#0a0c12] flex flex-col items-center justify-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <Wallet size={40} className="text-emerald-400" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">Doon</h1>
          <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Dompet Online</p>
        </div>
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      <p className="absolute bottom-8 text-xs text-gray-600">by N2Oktena | Parel</p>
    </div>
  );
}
