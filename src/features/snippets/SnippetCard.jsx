import { Edit3, Trash2, Copy, Heart, Hash, Link as LinkIcon, Globe, Lock, Download, Users } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function SnippetCard({ snippet, onCopy, onEdit, onDelete, onToggleFav, isExploreMode = false, onClone }) {
  const { isDark } = useTheme();
  const toast = useToast();

  // Cálculo de estado del link
  const hasActiveLink = snippet.public_expires_at && new Date(snippet.public_expires_at) > new Date();
  const isExpiredLink = snippet.public_expires_at && new Date(snippet.public_expires_at) < new Date();

  // --- ACCIÓN 1: GESTIONAR ENLACE (Totalmente Independiente) ---
  const handleLinkShare = async () => {
    if (isExploreMode) return;

    // SI YA TIENE LINK ACTIVO -> QUITAR SOLO LINK
    if (hasActiveLink) {
        const shareUrl = `${window.location.origin}/share/${snippet.id}`;
        await navigator.clipboard.writeText(shareUrl);
        
        if (confirm(`🔗 ENLACE ACTIVO: ${shareUrl}\n\n¿Deseas ELIMINAR el enlace privado?\n(Esto NO afectará si está publicado en la comunidad)`)) {
            // Lógica: Quitamos fecha de expiración (muere el link).
            // is_public se queda en true SOLO si sigue en comunidad.
            const keepPublic = snippet.in_community;
            
            await updateVisibility({ 
                public_expires_at: null, 
                is_public: keepPublic 
            });
            toast.info('Enlace privado desactivado.');
        } else {
            toast.success('Enlace copiado al portapapeles');
        }
        return;
    }

    // ACTIVAR LINK
    const inputDays = prompt("¿Días de validez del enlace? (Máx 15)", "7");
    if (inputDays !== null) { 
        let days = parseInt(inputDays);
        if (isNaN(days) || days <= 0) return toast.error("Número inválido");
        if (days > 15) days = 15;

        const date = new Date();
        date.setDate(date.getDate() + days);
        
        // Al activar link, is_public debe ser true
        await updateVisibility({ 
            is_public: true, 
            public_expires_at: date.toISOString() 
        });
        
        const shareUrl = `${window.location.origin}/share/${snippet.id}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success(`Enlace generado por ${days} días.`);
    }
  };

  // --- ACCIÓN 2: GESTIONAR COMUNIDAD (Totalmente Independiente) ---
  const handleCommunityPublish = async () => {
    if (isExploreMode) return;

    // SI YA ESTÁ EN COMUNIDAD -> QUITAR SOLO DE COMUNIDAD
    if (snippet.in_community) {
        if (confirm("¿Retirar este snippet del Catálogo Comunitario?\n(El enlace privado seguirá funcionando si está activo)")) {
            // Lógica: Quitamos in_community.
            // is_public se queda en true SOLO si tiene link activo.
            const keepPublic = hasActiveLink;

            await updateVisibility({ 
                in_community: false,
                is_public: keepPublic 
            });
            toast.info('Snippet retirado de la comunidad.');
        }
        return;
    }

    // PUBLICAR EN COMUNIDAD
    if (confirm("¿Publicar en la Comunidad?\nSerá visible para todos en 'Explorar'.")) {
        // Al publicar, is_public debe ser true
        await updateVisibility({ 
            in_community: true, 
            is_public: true 
        });
        toast.success('¡Publicado en la Comunidad!');
    }
  };

  const updateVisibility = async (updates) => {
      try {
        const { error } = await supabase
            .from('snippets')
            .update(updates)
            .eq('id', snippet.id);

        if (error) throw error;
        window.location.reload(); 
      } catch (err) {
        console.error(err);
        toast.error('Error actualizando visibilidad');
      }
  };

  return (
    <div className={`bg-[var(--bg-card)] border rounded-xl overflow-hidden transition-all duration-300 group flex flex-col h-full shadow-sm hover:shadow-md ${snippet.in_community ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
      
      {/* --- HEADER ESTRUCTURADO (Flexbox, sin posiciones absolutas) --- */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-main)]/30">
        
        {/* FILA SUPERIOR: Categoría + Estados (Izq)  VS  Botones (Der) */}
        <div className="flex justify-between items-start mb-3 gap-2">
            
            {/* IZQUIERDA: Badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <Badge active={['pandas', 'scraping', 'api'].includes(snippet.category)}>
                  {snippet.category}
                </Badge>

                {!isExploreMode && (
                  <>
                    {snippet.in_community && (
                        <span className="bg-[var(--accent)] text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold uppercase tracking-wider shadow-sm animate-fade-in">
                            <Globe size={10} /> Comunidad
                        </span>
                    )}
                    
                    {hasActiveLink && (
                         <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold uppercase tracking-wider shadow-sm animate-fade-in">
                            <LinkIcon size={10} /> Link
                         </span>
                    )}
                    
                    {isExpiredLink && !hasActiveLink && (
                         <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold uppercase tracking-wider">
                            <Lock size={10} /> Expirado
                         </span>
                    )}
                  </>
                )}
            </div>

            {/* DERECHA: Acciones (Siempre visibles) */}
            <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-lg shadow-sm shrink-0 ml-auto">
              {isExploreMode ? (
                 <button 
                   onClick={() => onClone(snippet)} 
                   className="p-1.5 hover:bg-[var(--accent)]/20 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 px-2" 
                   title="Guardar en mi colección"
                 >
                   <Download size={16} /> <span className="text-xs font-bold">Guardar</span>
                 </button>
              ) : (
                 <>
                  <button 
                    onClick={handleLinkShare} 
                    className={`p-1.5 rounded-md transition-colors ${hasActiveLink ? 'text-blue-400 bg-blue-400/10' : 'text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10'}`}
                    title={hasActiveLink ? "Link Activo (Click para gestionar)" : "Crear Link Privado"}
                  >
                    <LinkIcon size={16} />
                  </button>
                  
                  <button 
                    onClick={handleCommunityPublish} 
                    className={`p-1.5 rounded-md transition-colors ${snippet.in_community ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}
                    title={snippet.in_community ? "En Comunidad (Click para retirar)" : "Publicar en Comunidad"}
                  >
                    {snippet.in_community ? <Users size={16} className="fill-current" /> : <Globe size={16} />}
                  </button>

                  <div className="w-px h-4 bg-[var(--border)] mx-0.5" />
                  
                  <button onClick={() => onEdit(snippet)} className="p-1.5 hover:bg-[var(--accent)]/20 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" title="Editar">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => onDelete(snippet.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-[var(--text-secondary)] hover:text-red-400 transition-colors" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                 </>
              )}
            </div>
        </div>

        {/* FILA INFERIOR: Título y Tags */}
        <div className="overflow-hidden"> 
             <h3 className="font-bold text-lg leading-tight truncate mb-2" title={snippet.title}>{snippet.title}</h3>
             
             <div className="flex items-center gap-2 flex-wrap">
                {snippet.tags?.map((tag, index) => (
                  <span key={index} className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center gap-0.5">
                    <Hash size={10} className="opacity-50" /> {tag}
                  </span>
                ))}
                {!isExploreMode && snippet.is_favorite && <Heart size={14} className="fill-[var(--accent)] text-[var(--accent)]" />}
             </div>
        </div>
      </div>
      
      {/* Preview Código */}
      <div className="flex-grow relative overflow-hidden bg-[var(--bg-card)] group-card-code">
        <SyntaxHighlighter
          language={snippet.language || 'python'}
          style={isDark ? vscDarkPlus : vs}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.75rem', lineHeight: '1.5', height: '100%' }}
          wrapLines={true}
        >
          {snippet.code}
        </SyntaxHighlighter>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--bg-card)] to-transparent pointer-events-none" />
      </div>

      {/* Footer */}
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