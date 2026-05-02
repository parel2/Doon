interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#151820] border border-white/8 rounded-2xl ${onClick ? 'cursor-pointer hover:border-white/20 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
