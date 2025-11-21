import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={20} className="text-[var(--accent)]" />,
  error: <XCircle size={20} className="text-red-400" />,
  info: <Info size={20} className="text-[var(--text-secondary)]" />
};

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto cerrar a los 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] px-4 py-3 rounded-lg shadow-xl animate-fade-in min-w-[300px] max-w-sm z-50 mb-2 relative overflow-hidden group">
      {/* Borde de color lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${type === 'success' ? 'bg-[var(--accent)]' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
      
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <p className="text-sm font-medium flex-grow">{message}</p>
      
      <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}