export default function Badge({ children, active }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-md border transition-colors ${active ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
      {children}
    </span>
  );
}