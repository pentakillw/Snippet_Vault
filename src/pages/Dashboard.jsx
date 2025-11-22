import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Terminal, Search, Plus, Moon, Sun, LogOut, Code2, Save, X, 
  Hash, User, Settings, Filter, ArrowDown, Menu, ArrowUpAz, CalendarClock, Zap, ChevronDown, HelpCircle 
} from 'lucide-react';
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
import ConfirmDialog from '../components/ui/ConfirmDialog'; 
import SnippetSkeleton from '../components/ui/SnippetSkeleton'; 
import ActivityHeatmap from '../components/ActivityHeatmap'; // IMPORTAR HEATMAP
import ShortcutsModal from '../components/ui/ShortcutsModal'; // IMPORTAR MODAL ATAJOS
import { TEMPLATES } from '../data/templates';

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

  // Estados UI & Filtros
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); 
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false); // Estado Modal Atajos

  // Estados para Modal Confirmación
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Estados Formulario
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formCode, setFormCode] = useState('');
  const [formLanguage, setFormLanguage] = useState('python');
  const [formTags, setFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const openEditor = useCallback((snippet = null) => {
    setShowTemplates(false);
    if (snippet) {
      setCurrentSnippet(snippet);
      setFormTitle(snippet.title);
      setFormDesc(snippet.description || '');
      setFormCategory(snippet.category || 'general');
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

  // --- LISTENERS GLOBALES (Atajos) ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
        // Abrir ayuda con Shift + ? (que es '?' en layouts EN/ES)
        if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            setShowShortcuts(true);
        }
        
        // Guardar con Ctrl + S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (isEditorOpen) handleSave();
        }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isEditorOpen]); // Dependencia necesaria para acceder a handleSave actualizado

  // --- REACT QUERY ---
  const fetchMySnippets = async ({ pageParam = 0 }) => {
    const ITEMS_PER_PAGE = 12;
    const from = pageParam * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    let query = supabase.from('snippets').select('*', { count: 'exact' });

    if (sortBy === 'title') {
        query = query.order('title', { ascending: true });
    } else {
        query = query.order('created_at', { ascending: false });
    }
    
    query = query.range(from, to).eq('user_id', user.id);

    if (search) query = query.ilike('title', `%${search}%`);
    if (filterType === 'favorites') query = query.eq('is_favorite', true);
    if (filterCategory) query = query.eq('category', filterCategory);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['my-snippets', user?.id, search, filterType, filterCategory, sortBy],
    queryFn: fetchMySnippets,
    getNextPageParam: (lastPage, allPages) => lastPage.data.length < 12 ? undefined : allPages.length,
    staleTime: 1000 * 60 * 5
  });

  const snippets = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  // --- TAGS LOGIC ---
  const existingTags = useMemo(() => {
    const tags = new Set();
    snippets.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [snippets]);

  const filteredTags = tagInput 
    ? existingTags.filter(t => t.includes(tagInput.toLowerCase()) && !formTags.includes(t)).slice(0, 5)
    : [];

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
      queryClient.invalidateQueries(['my-snippets']);
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
       toast.success('Snippet eliminado correctamente');
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

  const handleDeleteRequest = (snippet) => {
    setConfirmDialog({
        isOpen: true,
        title: '¿Eliminar Snippet?',
        message: `Estás a punto de eliminar "${snippet.title}". Esta acción no se puede deshacer.`,
        onConfirm: () => deleteMutation.mutate(snippet.id)
    });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const addTag = (val) => {
    const newTag = val.trim().toLowerCase();
    if (newTag && !formTags.includes(newTag)) {
      setFormTags([...formTags, newTag]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const applyTemplate = (tpl) => {
      if (formCode && !confirm('Esto reemplazará tu código actual. ¿Continuar?')) return;
      setFormCode(tpl.code);
      setFormLanguage(tpl.language);
      if (!formTitle) setFormTitle(tpl.label);
      setShowTemplates(false);
      toast.success('Plantilla aplicada');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] pb-20 md:pb-0">
      
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
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
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border)] focus-within:border-[var(--accent)] transition-colors">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none focus:outline-none text-sm w-32 lg:w-40 text-[var(--text-primary)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Botón de Ayuda (Nuevo) */}
          <button 
            onClick={() => setShowShortcuts(true)}
            className="p-2 hover:bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors hidden lg:block"
            title="Atajos de Teclado (?)"
          >
            <HelpCircle size={20} />
          </button>

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
        <div className="flex md:hidden items-center gap-3">
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[var(--text-primary)]">
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border)] z-20 p-4 flex flex-col gap-4 shadow-2xl animate-fade-in">
           <nav className="flex flex-col gap-2">
             <div className="px-3 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md font-bold text-sm">Mis Snippets</div>
             <Link to="/explore" className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-main)] rounded-md text-sm">Explorar Comunidad</Link>
             <Link to="/profile" className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-main)] rounded-md text-sm">Mi Perfil</Link>
           </nav>
           <div className="flex items-center gap-2 bg-[var(--bg-main)] px-3 py-2 rounded-lg border border-[var(--border)]">
              <Search size={16} className="text-[var(--text-secondary)]" />
              <input 
                type="text" 
                placeholder="Buscar snippets..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-[var(--text-primary)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
              <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                 {isDark ? <><Sun size={16} /> Modo Claro</> : <><Moon size={16} /> Modo Oscuro</>}
              </button>
              <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-400">
                 <LogOut size={16} /> Salir
              </button>
           </div>
        </div>
      )}

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        
        {/* WIDGETS & HEATMAP */}
        {!isLoading && (
            <>
                <StatsWidget snippets={snippets} />
                {/* Mostramos el heatmap solo si hay datos para que se vea bien */}
                {snippets.length > 0 && <ActivityHeatmap snippets={snippets} />}
            </>
        )}

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-[var(--text-primary)]">Mis Fragmentos</h2>
            <p className="text-[var(--text-secondary)] text-sm">
               {isLoading ? 'Cargando...' : `${totalCount} ${totalCount === 1 ? 'snippet encontrado' : 'snippets encontrados'}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
             <div className="relative w-full sm:w-auto">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] z-10" />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-8 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] appearance-none cursor-pointer shadow-sm hover:border-[var(--accent)]/50 transition-colors"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
             </div>

             <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 shadow-sm w-full sm:w-auto">
                <button 
                    onClick={() => setSortBy('created_at')} 
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-md transition-all flex items-center justify-center gap-2 ${sortBy === 'created_at' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Más recientes"
                >
                    <CalendarClock size={14} /> <span className="hidden sm:inline">Fecha</span>
                </button>
                <button 
                    onClick={() => setSortBy('title')} 
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-md transition-all flex items-center justify-center gap-2 ${sortBy === 'title' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Alfabético"
                >
                    <ArrowUpAz size={14} /> <span className="hidden sm:inline">A-Z</span>
                </button>
             </div>

             <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 shadow-sm w-full sm:w-auto">
                <button onClick={() => setFilterType('all')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs rounded-md transition-all ${filterType === 'all' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Todo</button>
                <button onClick={() => setFilterType('favorites')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs rounded-md transition-all ${filterType === 'favorites' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Favoritos</button>
             </div>

            <Button onClick={() => openEditor(null)} className="w-full sm:w-auto gap-2 shadow-lg shadow-[var(--accent)]/20">
              <Plus size={18} /> Nuevo
            </Button>
          </div>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1,2,3,4,5,6].map(i => <SnippetSkeleton key={i} />)}
           </div>
        ) : snippets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
              {snippets.map(snippet => (
                <SnippetCard 
                  key={snippet.id} 
                  snippet={snippet} 
                  onCopy={(s) => { navigator.clipboard.writeText(s.code); toast.success('Copiado'); }}
                  onEdit={openEditor}
                  onDelete={() => handleDeleteRequest(snippet)} 
                  onToggleFav={(id, status) => toggleFavMutation.mutate({ id, is_favorite: !status })}
                />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-10 text-center pb-10">
                <button 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all font-medium flex items-center gap-2 mx-auto shadow-sm"
                >
                   {isFetchingNextPage ? <Settings size={18} className="animate-spin" /> : <ArrowDown size={18} />}
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

      {/* MODALES */}
      
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
          <div className="bg-[var(--bg-card)] w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-2xl shadow-2xl border-none md:border md:border-[var(--border)] flex flex-col animate-zoom-in overflow-hidden relative">
            <div className="p-3 md:p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-main)] shrink-0 z-20 relative">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--accent)]/20 p-2 rounded-lg text-[var(--accent)]">
                  {currentSnippet ? <Settings size={20} /> : <Plus size={20} />}
                </div>
                <div className="mr-2">
                  <h3 className="font-bold text-base md:text-lg leading-none">{currentSnippet ? 'Editar Snippet' : 'Nuevo Snippet'}</h3>
                  <p className="hidden md:flex text-[10px] text-[var(--text-secondary)] mt-1 items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-[var(--border)] rounded border border-[var(--text-secondary)]/20">Ctrl + S</span> para guardar
                  </p>
                </div>
                <div className="relative">
                    <button 
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold hover:bg-yellow-500/20 transition-colors"
                    >
                        <Zap size={14} /> <span className="hidden sm:inline">Plantillas</span> <ChevronDown size={12} />
                    </button>
                    {showTemplates && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                            <div className="bg-[var(--bg-main)] px-3 py-2 border-b border-[var(--border)] text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                                Insertar Código Rápido
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {TEMPLATES.map(tpl => (
                                    <button 
                                        key={tpl.id}
                                        onClick={() => applyTemplate(tpl)}
                                        className="w-full text-left px-4 py-3 hover:bg-[var(--accent)]/10 transition-colors border-b border-[var(--border)]/50 last:border-0 group"
                                    >
                                        <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)]">{tpl.label}</div>
                                        <div className="text-[10px] text-[var(--text-secondary)]">{tpl.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-[var(--bg-card)] rounded-full text-[var(--text-secondary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative z-10">
              <div className="w-full md:w-1/3 overflow-y-auto border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg-main)]/50 order-2 md:order-1 flex-shrink-0 max-h-[40vh] md:max-h-none">
                <div className="p-4 md:p-6 space-y-4">
                  <Input label="Título" placeholder="Ej: Autenticación JWT" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} autoFocus />
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs uppercase tracking-wider opacity-70 font-bold text-[var(--text-secondary)] ml-1">Descripción</label>
                    <textarea 
                      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none h-20 text-sm"
                      placeholder="¿Qué hace este código?"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Select label="Lenguaje" value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} options={LANGUAGES} />
                    <Select label="Categoría" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} options={CATEGORIES} />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs uppercase tracking-wider opacity-70 font-bold text-[var(--text-secondary)] ml-1">Etiquetas</label>
                    <div className="flex gap-2 relative">
                      <input
                        className="flex-grow bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm focus:ring-2 focus:ring-[var(--accent)]/20"
                        placeholder="Añadir tag (Enter)"
                        value={tagInput}
                        onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                        onKeyDown={handleAddTag}
                        onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)} 
                      />
                      <Button variant="secondary" onClick={handleAddTag} className="!px-3 !py-2"><Plus size={16} /></Button>
                      {showTagSuggestions && filteredTags.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg z-30 overflow-hidden animate-fade-in">
                           {filteredTags.map(tag => (
                             <button 
                               key={tag} 
                               onClick={() => addTag(tag)}
                               className="w-full text-left px-3 py-2 hover:bg-[var(--bg-main)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
                             >
                               <Hash size={12} className="opacity-50" /> {tag}
                             </button>
                           ))}
                        </div>
                      )}
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
              <div className="w-full md:w-2/3 bg-[var(--bg-card)] flex flex-col h-full order-1 md:order-2 flex-grow overflow-hidden">
                 <div className="h-full w-full p-0 md:p-4">
                    <CodeEditor code={formCode} onChange={setFormCode} language={formLanguage} />
                 </div>
              </div>
            </div>
            <div className="p-3 md:p-4 border-t border-[var(--border)] bg-[var(--bg-main)] flex justify-end gap-3 items-center shrink-0 z-20 relative">
              <span className="text-xs text-[var(--text-secondary)] mr-auto hidden md:inline">Los cambios pueden tardar unos segundos.</span>
              <Button variant="secondary" onClick={() => setIsEditorOpen(false)} className="flex-1 md:flex-none">Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="min-w-[120px] flex-1 md:flex-none">
                {saveMutation.isPending ? 'Guardando...' : <><Save size={18} /> Guardar</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <ShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}