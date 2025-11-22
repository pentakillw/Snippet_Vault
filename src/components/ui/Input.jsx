import { useId } from 'react';

export default function Input({ label, className = '', ...props }) {
  // Genera un ID único automáticamente para accesibilidad (vincula label con input)
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
      <input 
        id={id}
        className={`w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] 
        placeholder:text-[var(--text-secondary)] placeholder:opacity-50
        focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 
        transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
}