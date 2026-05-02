import { Home, PiggyBank, Target, BookOpen, BarChart2, Settings } from 'lucide-react';
import type { NavTab } from '../types';

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'savings', label: 'Savings', Icon: PiggyBank },
  { id: 'target', label: 'Target', Icon: Target },
  { id: 'ledger', label: 'Ledger', Icon: BookOpen },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f1117] border-t border-white/10 safe-area-pb">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-all duration-200 ${
                isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium tracking-wide uppercase">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-400 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
