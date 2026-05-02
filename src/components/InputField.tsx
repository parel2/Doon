interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

export default function InputField({ label, prefix, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center bg-[#1e2231] border border-white/10 rounded-lg overflow-hidden focus-within:border-emerald-500/60 transition-colors">
        {prefix && <span className="px-3 text-gray-400 text-sm border-r border-white/10 bg-[#252a3a]">{prefix}</span>}
        <input
          {...props}
          className={`flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none ${className}`}
        />
      </div>
    </div>
  );
}
