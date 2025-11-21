import { useState, useMemo, useEffect } from 'react';
import { Terminal, Search, Plus, Moon, Sun, LogOut, Code2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SnippetCard from '../features/snippets/SnippetCard';
import CodeEditor from '../features/snippets/CodeEditor';

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formCode, setFormCode] = useState('');
  const [loadingSnippets, setLoadingSnippets] = useState(true);

  // Cargar Snippets de Supabase
  useEffect(() => {
    fetchSnippets();
  }, []);

  async function fetchSnippets() {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      console.error('Error cargando snippets:', error.message);
    } finally {
      setLoadingSnippets(false);
    }
  }

  // Lógica de filtrado
  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                            s.code.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'favorites' ? s.is_favorite : true;
      return matchesSearch && matchesFilter;
    });
  }, [snippets, search, filter]);

  // Acciones
  const handleCopy = async (snippet) => {
    navigator.clipboard.writeText(snippet.code);
    // Optimistic UI update
    const newCount = (snippet.usage_count || 0) + 1;
    setSnippets(prev => prev.map(s => s.id === snippet.id ? { ...s, usage_count: newCount } : s));
    
    // Update DB
    await supabase.from('snippets').update({ usage_count: newCount }).eq('id', snippet.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este snippet permanentemente?')) return;
    
    setSnippets(prev => prev.filter(s => s.id !== id));
    await supabase.from('snippets').delete().eq('id', id);
  };

  const handleToggleFav = async (id, currentStatus) => {
    // Optimistic
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, is_favorite: !currentStatus } : s));
    // DB
    await supabase.from('snippets').update({ is_favorite: !currentStatus }).eq('id', id);
  };

  const openEditor = (snippet = null) => {
    if (snippet) {
      setCurrentSnippet(snippet);
      setFormTitle(snippet.title);
      setFormDesc(snippet.description);
      setFormCategory(snippet.category);
      setFormCode(snippet.code);
    } else {
      setCurrentSnippet(null);
      setFormTitle('');
      setFormDesc('');
      setFormCategory('general');
      setFormCode('');
    }
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle || !formCode) return alert('Título y Código son obligatorios');

    const snippetData = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      code: formCode,
      updated_at: new Date().toISOString(),
      user_id: user.id
    };

    try {
      if (currentSnippet) {
        // Update
        const { data, error } = await supabase
          .from('snippets')
          .update(snippetData)
          .eq('id', currentSnippet.id)
          .select();
          
        if (error) throw error;
        setSnippets(prev => prev.map(s => s.id === currentSnippet.id ? data[0] : s));
      } else {
        // Create
        const { data, error } = await supabase
          .from('snippets')
          .insert([{ ...snippetData, usage_count: 0, is_favorite: false }])
          .select();
          
        if (error) throw error;
        setSnippets(prev => [data[0], ...prev]);
      }
      setIsEditorOpen(false);
    } catch (error) {
      alert('Error guardando: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      {/* Header */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--accent)] text-white p-1.5 rounded-md">
            <Terminal size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">Snippet Vault</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Barra de búsqueda */}
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar comandos..." 
              className="bg-transparent border-none focus:outline-none text-sm w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Controles */}
          <button onClick={toggleTheme} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors text-[var(--text-primary)]">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-6 w-px bg-[var(--border)] mx-2" />
          <button onClick={signOut} className="p-2 hover:text-red-400 transition-colors text-[var(--text-secondary)]">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Mis Fragmentos</h2>
            <p className="text-[var(--text-secondary)] text-sm">Gestiona y reutiliza tu código Python eficiente.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${filter === 'all' ? 'bg-[var(--bg-main)] shadow-sm font-bold' : 'text-[var(--text-secondary)]'}`}
                >
                  Todo
                </button>
                <button 
                  onClick={() => setFilter('favorites')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${filter === 'favorites' ? 'bg-[var(--bg-main)] shadow-sm font-bold text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
                >
                  Favoritos
                </button>
             </div>
            <Button onClick={() => openEditor(null)}>
              <Plus size={18} /> Nuevo
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loadingSnippets ? (
           <div className="text-center py-20 text-[var(--text-secondary)]">Cargando librería...</div>
        ) : filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map(snippet => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet} 
                onCopy={handleCopy}
                onEdit={openEditor}
                onDelete={handleDelete}
                onToggleFav={handleToggleFav}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
            <Code2 size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <p>No se encontraron snippets.</p>
          </div>
        )}
      </main>

      {/* Modal Editor */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] w-full max-w-4xl rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold text-lg">{currentSnippet ? 'Editar Snippet' : 'Nuevo Snippet Python'}</h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div>
                  <Input 
                    label="Título" 
                    placeholder="Ej: Scraping con Selenium" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                  <Input 
                    label="Descripción" 
                    placeholder="Breve explicación..." 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                  <div className="flex flex-col gap-1.5">
                     <label className="text-xs uppercase tracking-wider opacity-60 font-bold">Categoría</label>
                     <select 
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                     >
                        <option value="general">General</option>
                        <option value="scraping">Scraping</option>
                        <option value="pandas">Pandas / Data</option>
                        <option value="automatización">Automatización</option>
                        <option value="validaciones">Validaciones</option>
                        <option value="archivos">Archivos</option>
                     </select>
                  </div>
                </div>
                <div className="h-full min-h-[300px]">
                   <label className="text-xs uppercase tracking-wider opacity-60 font-bold mb-2 block">Código Python</label>
                   <div className="h-[calc(100%-2rem)] border border-[var(--border)] rounded-lg overflow-hidden">
                     <CodeEditor code={formCode} onChange={setFormCode} />
                   </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)]/30 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>
                <Save size={18} /> Guardar Snippet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}