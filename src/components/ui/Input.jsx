export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && <label className="text-xs uppercase tracking-wider opacity-60 font-bold">{label}</label>}
      <input 
        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
        {...props}
      />
    </div>
  );
}