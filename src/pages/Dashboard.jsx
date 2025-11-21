import { useState, useMemo, useEffect } from 'react';
import { Terminal, Search, Plus, Moon, Sun, LogOut, Code2, Save, X, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SnippetCard from '../features/snippets/SnippetCard';
import CodeEditor from '../features/snippets/CodeEditor';

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const toast = useToast();
  
  // --- ESTADOS PRINCIPALES ---
  const [snippets, setSnippets] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [loadingSnippets, setLoadingSnippets] = useState(true);

  // --- ESTADOS DEL FORMULARIO (Para crear/editar) ---
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formCode, setFormCode] = useState('');
  const [formLanguage, setFormLanguage] = useState('python'); // Lenguaje seleccionado
  const [formTags, setFormTags] = useState([]); // Lista de etiquetas
  const [tagInput, setTagInput] = useState(''); // Input temporal para etiquetas

  // --- CARGAR SNIPPETS ---
  useEffect(() => {
    async function fetchSnippets() {
      try {
        const { data, error } = await supabase
          .from('snippets')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setSnippets(data || []);
      } catch (error) {
        console.error('Error fetching snippets:', error);
        toast.error('Error cargando snippets');
      } finally {
        setLoadingSnippets(false);
      }
    }
    
    fetchSnippets();
  }, [toast]);

  // --- FILTRADO Y BÚSQUEDA ---
  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      const searchLower = search.toLowerCase();
      // Búsqueda: Título, Código o TAGS
      const matchesSearch = s.title.toLowerCase().includes(searchLower) || 
                            s.code.toLowerCase().includes(searchLower) ||
                            (s.tags && s.tags.some(tag => tag.toLowerCase().includes(searchLower)));

      const matchesFilter = filter === 'favorites' ? s.is_favorite : true;
      return matchesSearch && matchesFilter;
    });
  }, [snippets, search, filter]);

  // --- ACCIONES DE TARJETA ---
  const handleCopy = async (snippet) => {
    navigator.clipboard.writeText(snippet.code);
    toast.success('Código copiado al portapapeles');

    const newCount = (snippet.usage_count || 0) + 1;
    setSnippets(prev => prev.map(s => s.id === snippet.id ? { ...s, usage_count: newCount } : s));
    
    await supabase.from('snippets').update({ usage_count: newCount }).eq('id', snippet.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este snippet permanentemente?')) return;
    
    try {
      setSnippets(prev => prev.filter(s => s.id !== id));
      const { error } = await supabase.from('snippets').delete().eq('id', id);
      if (error) throw error;
      toast.success('Snippet eliminado');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar');
    }
  };

  const handleToggleFav = async (id, currentStatus) => {
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, is_favorite: !currentStatus } : s));
    
    try {
      const { error } = await supabase.from('snippets').update({ is_favorite: !currentStatus }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error(error);
      toast.error('Error actualizando favoritos');
    }
  };

  // --- GESTIÓN DE ETIQUETAS (TAGS) ---
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault(); // Evita submit del form si se usa Enter
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !formTags.includes(newTag)) {
        setFormTags([...formTags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormTags(formTags.filter(tag => tag !== tagToRemove));
  };

  // --- ABRIR EDITOR (Nuevo o Editar) ---
  const openEditor = (snippet = null) => {
    if (snippet) {
      // Cargar datos existentes
      setCurrentSnippet(snippet);
      setFormTitle(snippet.title);
      setFormDesc(snippet.description);
      setFormCategory(snippet.category);
      setFormCode(snippet.code);
      setFormTags(snippet.tags || []);
      setFormLanguage(snippet.language || 'python');
    } else {
      // Resetear formulario
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
  };

  // --- GUARDAR SNIPPET (Create / Update) ---
  const handleSave = async () => {
    if (!formTitle || !formCode) return toast.error('Título y Código son obligatorios');

    const snippetData = {
      title: formTitle,
      description: formDesc,
      category: formCategory,
      code: formCode,
      language: formLanguage, // Guardamos lenguaje
      tags: formTags,         // Guardamos tags
      updated_at: new Date().toISOString(),
      user_id: user.id
    };

    try {
      if (currentSnippet) {
        // ACTUALIZAR
        const { data, error } = await supabase
          .from('snippets')
          .update(snippetData)
          .eq('id', currentSnippet.id)
          .select();
          
        if (error) throw error;
        setSnippets(prev => prev.map(s => s.id === currentSnippet.id ? data[0] : s));
        toast.success('Snippet actualizado correctamente');
      } else {
        // CREAR NUEVO
        const { data, error } = await supabase
          .from('snippets')
          .insert([{ ...snippetData, usage_count: 0, is_favorite: false }])
          .select();
          
        if (error) throw error;
        setSnippets(prev => [data[0], ...prev]);
        toast.success('Snippet creado con éxito');
      }
      setIsEditorOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      {/* --- HEADER --- */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] text-white p-1.5 rounded-md">
              <Terminal size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">Snippet Vault</span>
          </div>

          {/* Navegación Central */}
          <nav className="hidden md:flex gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border)]">
             <span className="px-4 py-1.5 text-sm rounded-md bg-[var(--bg-card)] shadow-sm font-bold text-[var(--accent)]">
                Mis Snippets
             </span>
             <Link to="/explore" className="px-4 py-1.5 text-sm rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all">
                Explorar
             </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <Search size={16} className="text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Buscar comandos o tags..." 
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

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Mis Fragmentos</h2>
            <p className="text-[var(--text-secondary)] text-sm">Gestiona código en Python, Java, Scala, R y SQL.</p>
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

        {/* GRID DE SNIPPETS */}
        {loadingSnippets ? (
           <div className="text-center py-20 text-[var(--text-secondary)] animate-pulse">Cargando librería...</div>
        ) : filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
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

      {/* --- MODAL EDITOR --- */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] w-full max-w-5xl rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col h-[90vh] animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold text-lg">{currentSnippet ? 'Editar Snippet' : 'Nuevo Snippet'}</h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-[var(--bg-main)] rounded-full text-[var(--text-secondary)]">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                
                {/* Columna Izquierda: Inputs y Configuración */}
                <div className="flex flex-col gap-4">
                  <Input 
                    label="Título" 
                    placeholder="Ej: Query de usuarios activos" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    autoFocus
                  />
                  <Input 
                    label="Descripción" 
                    placeholder="Breve explicación..." 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Selector de Lenguaje */}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-xs uppercase tracking-wider opacity-60 font-bold">Lenguaje</label>
                       <select 
                          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                          value={formLanguage}
                          onChange={(e) => setFormLanguage(e.target.value)}
                       >
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="scala">Scala</option>
                          <option value="r">R Stats</option>
                          <option value="sql">SQL</option>
                       </select>
                    </div>

                    {/* Selector de Categoría */}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-xs uppercase tracking-wider opacity-60 font-bold">Categoría</label>
                       <select 
                          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                       >
                          <option value="general">General</option>
                          <option value="scraping">Scraping</option>
                          <option value="pandas">Data Analysis</option>
                          <option value="automatización">Automatización</option>
                          <option value="validaciones">Validaciones</option>
                          <option value="archivos">Archivos</option>
                          <option value="api">APIs</option>
                          <option value="db">Base de Datos</option>
                       </select>
                    </div>
                  </div>

                  {/* Input de Etiquetas (Tags) */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs uppercase tracking-wider opacity-60 font-bold">Etiquetas (Tags)</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-grow bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-sm"
                        placeholder="Escribe una etiqueta y pulsa Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      <Button variant="secondary" onClick={handleAddTag} className="!px-3">
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    {/* Lista de Tags Agregadas */}
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[2rem]">
                      {formTags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-main)] border border-[var(--border)] text-xs text-[var(--text-secondary)] animate-fade-in">
                          <Hash size={10} /> {tag}
                          <button 
                            onClick={() => handleRemoveTag(tag)} 
                            className="ml-1 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      {formTags.length === 0 && (
                        <span className="text-xs text-[var(--text-secondary)] opacity-50 italic p-1">Sin etiquetas...</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Editor de Código */}
                <div className="h-full min-h-[400px] flex flex-col">
                   <label className="text-xs uppercase tracking-wider opacity-60 font-bold mb-2 block">Código {formLanguage}</label>
                   <div className="flex-grow border border-[var(--border)] rounded-lg overflow-hidden shadow-inner bg-[#1e1e1e]">
                     <CodeEditor 
                        code={formCode} 
                        onChange={setFormCode} 
                        language={formLanguage} 
                     />
                   </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
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