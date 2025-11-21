import { useState, useEffect, useMemo } from 'react';
import { Globe, Search, Moon, Sun, LogOut, LayoutGrid, Code2, Users, Plus } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SnippetCard from '../features/snippets/SnippetCard';

export default function Explore() {
  const { signOut, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const toast = useToast();
  
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicSnippets();
  }, );

  async function fetchPublicSnippets() {
    try {
      // CAMBIO IMPORTANTE: Ahora filtramos por 'in_community'
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('in_community', true) // <--- Solo los publicados explícitamente
        .neq('user_id', user.id) 
        .order('created_at', { ascending: false })
        .limit(200); 
        
      if (error) throw error;
      
      const validSnippets = (data || []).filter(s => 
        !s.public_expires_at || new Date(s.public_expires_at) > new Date()
      );
      
      setSnippets(validSnippets);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando catálogo');
    } finally {
      setLoading(false);
    }
  }

  const handleClone = async (snippet) => {
    if (!confirm(`¿Guardar "${snippet.title}" en tu colección personal?`)) return;

    try {
      const newSnippet = {
        user_id: user.id,
        title: `${snippet.title} (Copia)`,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        category: snippet.category,
        tags: snippet.tags,
        is_public: false, 
        in_community: false, // Al clonar, nace privado y fuera de la comunidad
        is_favorite: false,
        usage_count: 0
      };

      const { error } = await supabase.from('snippets').insert([newSnippet]);
      if (error) throw error;

      toast.success('Snippet guardado en tu Dashboard');
    } catch (error) {
        console.error(error);
      toast.error('Error al guardar snippet');
    }
  };

  const handleCopy = (snippet) => {
    navigator.clipboard.writeText(snippet.code);
    toast.success('Copiado al portapapeles');
  };

  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      const searchLower = search.toLowerCase();
      return s.title.toLowerCase().includes(searchLower) || 
             s.code.toLowerCase().includes(searchLower) ||
             (s.tags && s.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    });
  }, [snippets, search]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] pb-20 md:pb-0">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] text-white p-1.5 rounded-md">
              <Users size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">Explorar Catálogo</span>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border)]">
             <Link to="/dashboard" className="px-4 py-1.5 text-sm rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all">
                Mis Snippets
             </Link>
             <span className="px-4 py-1.5 text-sm rounded-md bg-[var(--bg-card)] shadow-sm font-bold text-[var(--accent)]">
                Explorar
             </span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Buscador Desktop */}
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar en la comunidad..." 
              className="bg-transparent border-none focus:outline-none text-sm w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button onClick={toggleTheme} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors text-[var(--text-primary)]">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-6 w-px bg-[var(--border)] mx-2" />
          <button onClick={signOut} className="p-2 hover:text-red-400 transition-colors text-[var(--text-secondary)]">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        
        {/* --- BUSCADOR MÓVIL --- */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-2 bg-[var(--bg-card)] px-4 py-3 rounded-xl border border-[var(--border)] shadow-sm focus-within:border-[var(--accent)] transition-colors">
            <Search size={18} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar en la comunidad..." 
              className="bg-transparent border-none focus:outline-none text-base w-full text-[var(--text-primary)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Catálogo Comunitario</h2>
            <p className="text-[var(--text-secondary)] text-sm">Descubre snippets verificados por la comunidad. Recuerda revisar el código antes de usarlo.</p>
        </div>

        {loading ? (
           <div className="text-center py-20 text-[var(--text-secondary)] animate-pulse">Cargando catálogo...</div>
        ) : filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredSnippets.map(snippet => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet} 
                onCopy={handleCopy}
                onClone={handleClone}
                isExploreMode={true} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
            <LayoutGrid size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p>No hay snippets públicos disponibles en este momento.</p>
          </div>
        )}
      </main>

      {/* --- BOTTOM NAVIGATION BAR (Solo Móvil) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] flex justify-around items-center p-3 z-40 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
           <LayoutGrid size={24} />
           <span className="text-[10px] font-medium">Mis Snippets</span>
        </Link>
        
        <Link to="/dashboard" className="flex flex-col items-center justify-center -mt-8 bg-[var(--bg-main)] text-[var(--text-secondary)] w-14 h-14 rounded-full shadow-lg border-4 border-[var(--bg-main)] opacity-50 pointer-events-none">
           <Plus size={28} />
        </Link>

        <Link to="/explore" className="flex flex-col items-center gap-1 text-[var(--accent)]">
           <Globe size={24} />
           <span className="text-[10px] font-bold">Explorar</span>
        </Link>
      </nav>

    </div>
  );
}