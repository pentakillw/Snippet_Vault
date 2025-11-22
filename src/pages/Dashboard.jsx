import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom'; 
import { Terminal, Search, Plus, Moon, Sun, LogOut, Code2, Save, X, Hash, User, Settings, Filter, Loader, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import SnippetCard from '../features/snippets/SnippetCard';
import CodeEditor from '../features/snippets/CodeEditor';
import StatsWidget from '../components/StatsWidget'; 

// --- CONSTANTES ---
const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'testing', label: 'Testing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'power-platform', label: 'Power Platform' },
  { value: 'utils', label: 'Utilidades' }
];

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'r', label: 'R Stats' },
  { value: 'powerfx', label: 'Power Apps (Power FX)' },
  { value: 'dax', label: 'Power BI (DAX)' },
  { value: 'm', label: 'Power Query (M)' },
  { value: 'excel', label: 'Excel Formulas' },
  { value: 'scala', label: 'Scala' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash/Shell' }
];

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams(); 
  
  // Estados UI
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | favorites
  const [filterCategory, setFilterCategory] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Estados Formulario
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formCode, setFormCode] = useState('');
  const [formLanguage, setFormLanguage] = useState('python');
  const [formTags, setFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // 4. DEFINICIÓN DE FUNCIONES
  const openEditor = useCallback((snippet = null) => {
    if (snippet) {
      setCurrentSnippet(snippet);
      setFormTitle(snippet.title);
      setFormDesc(snippet.description);
      setFormCategory(snippet.category);
      setFormCode(snippet.code);
      setFormTags(snippet.tags || []);
      setFormLanguage(snippet.language || 'python');
    } else {
      setCurrentSnippet(null);
      setFormTitle('');
      setFormDesc('');
      setFormCategory('general');
      setFormCode('');
      setFormTags([]);
      setFormLanguage('python');
    }
    setTagInput('');
    setIsEditorOpen(true);
  }, []); 

  // 5. EFECTOS
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
        setTimeout(() => { openEditor(null); }, 0);
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.delete('action');
            return newParams;
        }, { replace: true });
    }
  }, [searchParams, setSearchParams, openEditor]); 

  // --- REACT QUERY CON PAGINACIÓN Y FILTROS ---
  const fetchMySnippets = async ({ pageParam = 0 }) => {
    const ITEMS_PER_PAGE = 12;
    const from = pageParam * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('snippets')
      .select('*', { count: 'exact' }) // Pedimos el total para saber si hay más
      .order('created_at', { ascending: false })
      .range(from, to);

    // APLICAR FILTROS EN SERVIDOR (Mucho más rápido)
    // 1. Solo mis snippets
    // Nota: Aunque RLS ya filtra, es buena práctica ser explícito
    query = query.eq('user_id', user.id);

    // 2. Filtro de búsqueda (Título)
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // 3. Filtro de Favoritos
    if (filterType === 'favorites') {
      query = query.eq('is_favorite', true);
    }

    // 4. Filtro de Categoría
    if (filterCategory) {
      query = query.eq('category', filterCategory);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    
    return { data, count };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['my-snippets', user?.id, search, filterType, filterCategory], // Clave compuesta para reaccionar a filtros
    queryFn: fetchMySnippets,
    getNextPageParam: (lastPage, allPages) => {
      // Si la última página trajo menos items que el límite, no hay más
      if (lastPage.data.length < 12) return undefined;
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5 // 5 minutos de caché
  });

  const snippets = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  // --- MUTACIONES ---
  const saveMutation = useMutation({
    mutationFn: async (snippetData) => {
      if (currentSnippet) {
        const { data, error } = await supabase.from('snippets').update(snippetData).eq('id', currentSnippet.id).select();
        if (error) throw error; return data[0];
      } else {
        const { data, error } = await supabase.from('snippets').insert([{ ...snippetData, user_id: user.id }]).select();
        if (error) throw error; return data[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-snippets']); // Invalida la query paginada
      toast.success(currentSnippet ? 'Actualizado' : 'Creado');
      setIsEditorOpen(false);
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
       const { error } = await supabase.from('snippets').delete().eq('id', id);
       if (error) throw error;
    },
    onSuccess: () => {
       queryClient.invalidateQueries(['my-snippets']);
       toast.success('Eliminado');
    },
    onError: () => toast.error('Error al eliminar')
  });

  const toggleFavMutation = useMutation({
    mutationFn: async ({ id, is_favorite }) => {
       const { error } = await supabase.from('snippets').update({ is_favorite }).eq('id', id);
       if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(['my-snippets'])
  });

  const handleSave = useCallback(() => {
    if (!formTitle || !formCode) return toast.error('Título y Código requeridos');
    saveMutation.mutate({
      title: formTitle,
      description: formDesc,
      category: formCategory,
      code: formCode,
      language: formLanguage,
      tags: formTags,
      updated_at: new Date().toISOString()
    });
  }, [formTitle, formCode, formDesc, formCategory, formLanguage, formTags, saveMutation, toast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditorOpen) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, handleSave]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !formTags.includes(newTag)) {
        setFormTags([...formTags, newTag]);
        setTagInput('');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] pb-20 md:pb-0">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] text-white p-1.5 rounded-md shadow-lg shadow-[var(--accent)]/20">
              <Terminal size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block text-[var(--text-primary)]">Snippet Vault</span>
          </div>
          <nav className="hidden md:flex gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border)]">
             <span className="px-4 py-1.5 text-sm rounded-md bg-[var(--bg-card)] shadow-sm font-bold text-[var(--accent)] cursor-default">Mis Snippets</span>
             <Link to="/explore" className="px-4 py-1.5 text-sm rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all">Explorar</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none focus:outline-none text-sm w-40 text-[var(--text-primary)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Link to="/profile" title="Mi Perfil">
            <button className="p-2 hover:bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              <User size={20} />
            </button>
          </Link>

          <button onClick={toggleTheme} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors text-[var(--text-primary)]">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="h-6 w-px bg-[var(--border)] mx-1" />
          
          <button onClick={signOut} className="p-2 hover:bg-red-500/10 rounded-full text-[var(--text-secondary)] hover:text-red-500 transition-colors" title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        
        {!isLoading && <StatsWidget snippets={snippets} />}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-[var(--text-primary)]">Mis Fragmentos</h2>
            <p className="text-[var(--text-secondary)] text-sm">
              {totalCount} {totalCount === 1 ? 'snippet encontrado' : 'snippets encontrados'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
             <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] appearance-none cursor-pointer shadow-sm hover:border-[var(--accent)]/50 transition-colors"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
             </div>

             <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 shadow-sm">
                <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 text-xs rounded-md transition-all ${filterType === 'all' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Todo</button>
                <button onClick={() => setFilterType('favorites')} className={`px-4 py-1.5 text-xs rounded-md transition-all ${filterType === 'favorites' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Favoritos</button>
             </div>

            <Button onClick={() => openEditor(null)} className="gap-2 shadow-lg shadow-[var(--accent)]/20">
              <Plus size={18} /> Nuevo
            </Button>
          </div>
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
                  onEdit={openEditor}
                  onDelete={(id) => { if(confirm('¿Eliminar?')) deleteMutation.mutate(id) }}
                  onToggleFav={(id, status) => toggleFavMutation.mutate({ id, is_favorite: !status })}
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
          <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-card)]/50">
            <Code2 size={64} className="mb-4 text-[var(--text-secondary)]" />
            <h3 className="text-xl font-bold mb-2">No se encontraron resultados</h3>
            <p className="max-w-xs mx-auto mb-6">Prueba cambiando los filtros o crea un nuevo snippet.</p>
            <Button onClick={() => { setFilterCategory(''); setSearch(''); setFilterType('all'); }}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </main>

      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col animate-zoom-in overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-main)]">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--accent)]/20 p-2 rounded-lg text-[var(--accent)]">
                  {currentSnippet ? <Settings size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{currentSnippet ? 'Editar Snippet' : 'Nuevo Snippet'}</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-[var(--border)] rounded border border-[var(--text-secondary)]/20">Ctrl + S</span> para guardar
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-[var(--bg-card)] rounded-full text-[var(--text-secondary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/3 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg-main)]/50">
                <div className="space-y-4">
                  <Input label="Título" placeholder="Ej: Autenticación JWT" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} autoFocus />
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs uppercase tracking-wider opacity-70 font-bold text-[var(--text-secondary)] ml-1">Descripción</label>
                    <textarea 
                      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none h-24 text-sm"
                      placeholder="¿Qué hace este código?"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Lenguaje" value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} options={LANGUAGES} />
                    <Select label="Categoría" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} options={CATEGORIES} />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs uppercase tracking-wider opacity-70 font-bold text-[var(--text-secondary)] ml-1">Etiquetas</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-grow bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--accent)]/20"
                        placeholder="Añadir tag (Enter)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      <Button variant="secondary" onClick={handleAddTag} className="!px-3 !py-2"><Plus size={16} /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[32px]">
                      {formTags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs text-[var(--accent)] font-bold animate-fade-in">
                          <Hash size={10} /> {tag}
                          <button onClick={() => setFormTags(formTags.filter(t => t !== tag))} className="ml-1 hover:text-red-500"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/3 p-4 bg-[var(--bg-card)] flex flex-col h-full">
                 <CodeEditor code={formCode} onChange={setFormCode} language={formLanguage} />
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)] flex justify-end gap-3 items-center">
              <span className="text-xs text-[var(--text-secondary)] mr-auto hidden md:inline">Los cambios pueden tardar unos segundos.</span>
              <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="min-w-[140px]">
                {saveMutation.isPending ? 'Guardando...' : <><Save size={18} /> Guardar</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}