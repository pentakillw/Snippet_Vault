import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Globe, Search, Moon, Sun, LogOut, LayoutGrid, Loader, ArrowDown } from 'lucide-react';
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
  const [search, setSearch] = useState('');

  // --- REACT QUERY: Paginación Infinita ---
  const fetchPublicSnippets = async ({ pageParam = 0 }) => {
    const ITEMS_PER_PAGE = 12;
    const from = pageParam * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('snippets')
      .select('*')
      .eq('in_community', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Si hay búsqueda, usamos ilike (requiere índice en BD para performance óptima)
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // NOTA: El filtrado de expiración debe hacerse en el BACKEND con RLS
    // para seguridad real. Aquí solo filtramos visualmente por si acaso.
    return data.filter(s => !s.public_expires_at || new Date(s.public_expires_at) > new Date());
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['explore', search], // Se recarga al cambiar búsqueda
    queryFn: fetchPublicSnippets,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length : undefined;
    },
    staleTime: 1000 * 60 * 2 // Cache de 2 min
  });

  const snippets = data?.pages.flat() || [];

  const handleClone = async (snippet) => {
    if (!confirm(`¿Guardar "${snippet.title}" en tu colección personal?`)) return;
    try {
      const { error } = await supabase.from('snippets').insert([{
        user_id: user.id,
        title: `${snippet.title} (Fork)`,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        category: snippet.category,
        tags: snippet.tags,
        is_public: false,
        in_community: false,
        original_id: snippet.id // Guardamos referencia para futuro
      }]);
      if (error) throw error;
      toast.success('Snippet guardado en tu Dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Error al clonar');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] text-white p-1.5 rounded-md shadow-lg shadow-[var(--accent)]/20">
              <Globe size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block text-[var(--text-primary)]">Comunidad</span>
          </div>
          <nav className="hidden md:flex gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border)]">
             <Link to="/dashboard" className="px-4 py-1.5 text-sm rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all">Mis Snippets</Link>
             <span className="px-4 py-1.5 text-sm rounded-md bg-[var(--bg-card)] shadow-sm font-bold text-[var(--accent)] cursor-default">Explorar</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar en comunidad..." 
              className="bg-transparent border-none focus:outline-none text-sm w-48 text-[var(--text-primary)]"
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

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Catálogo Global</h2>
            <p className="text-[var(--text-secondary)]">Descubre soluciones verificadas por desarrolladores de todo el mundo.</p>
        </div>

        {isLoading ? (
           <div className="flex justify-center py-20"><Loader className="animate-spin text-[var(--accent)]" size={40} /></div>
        ) : snippets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {snippets.map(snippet => (
                <SnippetCard 
                  key={snippet.id} 
                  snippet={snippet} 
                  onCopy={(s) => { navigator.clipboard.writeText(s.code); toast.success('Copiado'); }}
                  onClone={handleClone}
                  isExploreMode={true} 
                />
              ))}
            </div>
            
            {hasNextPage && (
              <div className="mt-10 text-center">
                <button 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all font-medium flex items-center gap-2 mx-auto shadow-sm"
                >
                   {isFetchingNextPage ? <Loader size={18} className="animate-spin" /> : <ArrowDown size={18} />}
                   Cargar más snippets
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 opacity-50">
            <LayoutGrid size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p>No se encontraron resultados para tu búsqueda.</p>
          </div>
        )}
      </main>
    </div>
  );
}