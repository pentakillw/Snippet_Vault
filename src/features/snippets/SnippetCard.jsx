import { Edit3, Trash2, Copy, Heart, Hash, Link as LinkIcon, Globe, Lock, Download, Users, FileDown, Calendar } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const EXTENSIONS = {
  python: 'py', javascript: 'js', typescript: 'ts', java: 'java',
  sql: 'sql', r: 'r', html: 'html', css: 'css', json: 'json',
  bash: 'sh', scala: 'scala', go: 'go', rust: 'rs'
};

// --- FUNCIÓN HELPER PARA CORREGIR EL ERROR DE REACT 18 ---
// Elimina las propiedades de fondo del tema para evitar conflictos (shorthand vs longhand)
// al cambiar entre modo oscuro y claro.
const normalizeTheme = (theme) => {
  const newTheme = { ...theme };
  // La clave principal en temas Prism suele ser esta:
  const key = 'pre[class*="language-"]';
  
  if (newTheme[key]) {
    // Extraemos y descartamos cualquier definición de fondo del tema
    // eslint-disable-next-line no-unused-vars
    const { background, backgroundColor, ...rest } = newTheme[key];
    newTheme[key] = rest; // Dejamos el resto de estilos (fuente, colores de sintaxis, etc.)
  }
  return newTheme;
};

export default function SnippetCard({ snippet, onCopy, onEdit, onDelete, onToggleFav, isExploreMode = false, onClone }) {
  const { isDark } = useTheme();
  const toast = useToast();

  const hasActiveLink = snippet.public_expires_at && new Date(snippet.public_expires_at) > new Date();
  const isExpiredLink = snippet.public_expires_at && new Date(snippet.public_expires_at) < new Date();

  // Fecha relativa con manejo de errores
  const timeAgo = snippet.created_at 
    ? formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true, locale: es }) 
    : 'Reciente';

  const handleDownload = () => {
    try {
      const ext = EXTENSIONS[snippet.language] || 'txt';
      const blob = new Blob([snippet.code], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = snippet.title ? snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'snippet';
      a.download = `${cleanTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga iniciada');
    } catch (err) {
      console.error(err);
      toast.error('Error al descargar archivo');
    }
  };

  const handleLinkShare = async () => {
    if (isExploreMode) return;
    if (hasActiveLink) {
        const shareUrl = `${window.location.origin}/share/${snippet.id}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado. Para desactivar, edita el snippet.'); 
        return;
    }

    const inputDays = prompt("¿Días de validez del enlace? (Máx 15)", "7");
    if (inputDays !== null) { 
        let days = parseInt(inputDays);
        if (isNaN(days) || days <= 0) return toast.error("Número inválido");
        if (days > 15) days = 15;
        const date = new Date();
        date.setDate(date.getDate() + days);
        
        await updateVisibility({ is_public: true, public_expires_at: date.toISOString() });
        const shareUrl = `${window.location.origin}/share/${snippet.id}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success(`Enlace generado por ${days} días.`);
    }
  };

  const handleCommunityPublish = async () => {
    if (isExploreMode) return;
    const newState = !snippet.in_community;
    const keepPublic = newState ? true : hasActiveLink;
    
    if (newState && !confirm("¿Publicar en la comunidad global?")) return;
    if (!newState && !confirm("¿Retirar de la comunidad global?")) return;

    await updateVisibility({ in_community: newState, is_public: keepPublic });
    toast.success(newState ? '¡Publicado en la Comunidad!' : 'Retirado de la comunidad');
  };

  const updateVisibility = async (updates) => {
      try {
        const { error } = await supabase.from('snippets').update(updates).eq('id', snippet.id);
        if (error) throw error;
        window.location.reload(); 
      } catch (err) {
        toast.error('Error actualizando visibilidad');
      }
  };

  return (
    <div className={`bg-[var(--bg-card)] border rounded-xl overflow-hidden transition-all duration-300 group flex flex-col h-full shadow-sm hover:shadow-md ${snippet.in_community ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
      
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-main)]/30">
        <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <Badge active={['pandas', 'scraping', 'api'].includes(snippet.category)}>
                  {snippet.category}
                </Badge>

                <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 opacity-70">
                   <Calendar size={10} /> {timeAgo}
                </span>
            </div>

            <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-lg shadow-sm shrink-0 ml-auto overflow-x-auto max-w-[140px] sm:max-w-none custom-scrollbar">
              
              <button 
                onClick={handleDownload}
                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors flex-shrink-0"
                title="Descargar archivo"
              >
                <FileDown size={16} />
              </button>

              <div className="w-px h-4 bg-[var(--border)] mx-0.5 flex-shrink-0" />

              {isExploreMode ? (
                 <button 
                   onClick={() => onClone(snippet)} 
                   className="p-1.5 hover:bg-[var(--accent)]/20 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 px-2 whitespace-nowrap" 
                   title="Guardar en mi colección"
                 >
                   <Download size={16} /> <span className="text-xs font-bold hidden sm:inline">Guardar</span>
                 </button>
              ) : (
                 <>
                  <button 
                    onClick={handleLinkShare} 
                    className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${hasActiveLink ? 'text-blue-400 bg-blue-400/10' : 'text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10'}`}
                  >
                    <LinkIcon size={16} />
                  </button>
                  
                  <button 
                    onClick={handleCommunityPublish} 
                    className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${snippet.in_community ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}
                  >
                    {snippet.in_community ? <Users size={16} className="fill-current" /> : <Globe size={16} />}
                  </button>

                  <div className="w-px h-4 bg-[var(--border)] mx-0.5 flex-shrink-0" />
                  
                  <button onClick={() => onEdit(snippet)} className="p-1.5 hover:bg-[var(--accent)]/20 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex-shrink-0">
                      <Edit3 size={16} />
                  </button>
                  <button onClick={() => onDelete(snippet)} className="p-1.5 hover:bg-red-500/20 rounded-md text-[var(--text-secondary)] hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                 </>
              )}
            </div>
        </div>

        <div className="overflow-hidden px-4 mb-2"> 
             <h3 className="font-bold text-lg leading-tight truncate mb-2" title={snippet.title}>{snippet.title}</h3>
             
             <div className="flex items-center gap-2 flex-wrap min-h-[20px]">
                {snippet.in_community && !isExploreMode && (
                     <span className="text-[var(--accent)] flex items-center gap-0.5 text-[10px] font-bold uppercase"><Globe size={10}/> Global</span>
                )}
                {hasActiveLink && !isExploreMode && (
                     <span className="text-blue-500 flex items-center gap-0.5 text-[10px] font-bold uppercase"><LinkIcon size={10}/> Link</span>
                )}

                {snippet.tags?.map((tag, index) => (
                  <span key={index} className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center gap-0.5">
                    <Hash size={10} className="opacity-50" /> {tag}
                  </span>
                ))}
             </div>
        </div>
      </div>
      
      <div className="flex-grow relative overflow-hidden bg-[var(--bg-card)] group-card-code min-h-[140px] border-t border-[var(--border)]">
        <SyntaxHighlighter
          language={snippet.language || 'python'}
          // Aplicamos la normalización aquí
          style={isDark ? normalizeTheme(vscDarkPlus) : normalizeTheme(vs)}
          // Ahora es seguro usar backgroundColor porque es la única definición de fondo
          customStyle={{ margin: 0, padding: '1rem', backgroundColor: 'transparent', fontSize: '0.75rem', lineHeight: '1.5', height: '100%' }}
          wrapLines={true}
        >
          {snippet.code || ''}
        </SyntaxHighlighter>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-card)] to-transparent pointer-events-none" />
      </div>

      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-main)]/30 flex justify-between items-center">
        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <Copy size={12} /> {snippet.usage_count || 0} usos
        </div>
        <div className="flex gap-2">
           {!isExploreMode && (
               <button onClick={() => onToggleFav(snippet.id, snippet.is_favorite)} className="p-2 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)]">
                 <Heart size={16} className={snippet.is_favorite ? "fill-[var(--accent)] text-[var(--accent)]" : ""} />
               </button>
            )}
          <Button variant="primary" className="!py-1.5 !px-3 !text-xs" onClick={() => onCopy(snippet)}>
            <Copy size={14} /> Copiar
          </Button>
        </div>
      </div>
    </div>
  );
}