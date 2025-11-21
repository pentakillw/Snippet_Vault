export default function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--accent)]/20",
    secondary: "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]",
    ghost: "hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}