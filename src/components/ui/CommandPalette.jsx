import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, LayoutGrid, Globe, User, Plus, Moon, Sun, LogOut, Command } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { signOut } = useAuth();

  // Definición de comandos
  const commands = [
    { 
      id: 'nav-dash', 
      label: 'Ir al Dashboard', 
      icon: <LayoutGrid size={18} />, 
      action: () => navigate('/dashboard') 
    },
    { 
      id: 'nav-explore', 
      label: 'Explorar Comunidad', 
      icon: <Globe size={18} />, 
      action: () => navigate('/explore') 
    },
    { 
      id: 'nav-profile', 
      label: 'Mi Perfil', 
      icon: <User size={18} />, 
      action: () => navigate('/profile') 
    },
    { 
      id: 'act-create', 
      label: 'Crear Nuevo Snippet', 
      icon: <Plus size={18} />, 
      action: () => navigate('/dashboard?action=create') // Redirección con parámetro
    },
    { 
      id: 'act-theme', 
      label: `Cambiar a modo ${isDark ? 'Claro' : 'Oscuro'}`, 
      icon: isDark ? <Sun size={18} /> : <Moon size={18} />, 
      action: toggleTheme 
    },
    { 
      id: 'act-logout', 
      label: 'Cerrar Sesión', 
      icon: <LogOut size={18} />, 
      action: signOut,
      danger: true
    },
  ];

  // Filtrado
  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  // Event Listeners
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Navegación con flechas
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
          setIsOpen(false);
          setQuery('');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, activeIndex, filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[20vh] animate-fade-in">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-3">
          <Search size={20} className="text-[var(--text-secondary)]" />
          <input 
            className="flex-grow bg-transparent text-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50 focus:outline-none"
            placeholder="Escribe un comando..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            autoFocus
          />
          <div className="px-1.5 py-0.5 bg-[var(--border)] rounded text-[10px] text-[var(--text-secondary)] font-bold">ESC</div>
        </div>

        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => { cmd.action(); setIsOpen(false); setQuery(''); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors text-left
                  ${index === activeIndex ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-main)]'}
                  ${cmd.danger && index !== activeIndex ? 'text-red-400 hover:bg-red-500/10' : ''}
                `}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={`${index === activeIndex ? 'text-white' : cmd.danger ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                  {cmd.icon}
                </div>
                <span className="font-medium">{cmd.label}</span>
                {index === activeIndex && (
                  <Command size={14} className="ml-auto opacity-50" />
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-[var(--text-secondary)] opacity-50 text-sm">
              No se encontraron comandos.
            </div>
          )}
        </div>
        
        <div className="bg-[var(--bg-main)]/50 p-2 text-[10px] text-center text-[var(--text-secondary)] border-t border-[var(--border)]">
          Usa <span className="font-bold">↑</span> y <span className="font-bold">↓</span> para navegar, <span className="font-bold">Enter</span> para seleccionar
        </div>
      </div>
    </div>
  );
}