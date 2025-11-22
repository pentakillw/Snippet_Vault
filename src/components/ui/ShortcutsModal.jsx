import { useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'K'], desc: 'Abrir Paleta de Comandos' },
    { keys: ['Ctrl', 'S'], desc: 'Guardar Snippet (Editor)' },
    { keys: ['?'], desc: 'Ver Atajos de Teclado' },
    { keys: ['Esc'], desc: 'Cerrar Modales' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-main)]/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                <Keyboard size={24} />
             </div>
             <h2 className="text-xl font-bold text-[var(--text-primary)]">Atajos de Teclado</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid gap-4">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center group">
              <span className="text-sm text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)] transition-colors">
                {item.desc}
              </span>
              <div className="flex gap-1">
                {item.keys.map((k, i) => (
                  <kbd key={i} className="px-2 py-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-md text-xs font-mono font-bold text-[var(--text-primary)] shadow-sm min-w-[24px] text-center">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[var(--bg-main)]/30 text-center border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
          Tip: Puedes usar <kbd className="font-bold">Ctrl + K</kbd> para navegar rápidamente por toda la app.
        </div>
      </div>
    </div>
  );
}