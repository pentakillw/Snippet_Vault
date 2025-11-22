import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, options = [], value, onChange, placeholder, className = '' }) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs uppercase tracking-wider opacity-70 font-bold text-[var(--text-secondary)] ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-2.5 pr-10 text-[var(--text-primary)] 
          appearance-none focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 
          transition-all cursor-pointer ${className}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" 
        />
      </div>
    </div>
  );
}