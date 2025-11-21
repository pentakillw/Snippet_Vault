import { Edit3, Trash2, Copy, Heart } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function SnippetCard({ snippet, onCopy, onEdit, onDelete, onToggleFav }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] transition-all duration-300 group flex flex-col h-full shadow-sm">
      {/* Header Card */}
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-start bg-[var(--bg-main)]/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge active={['pandas', 'scraping', 'api'].includes(snippet.category)}>
              {snippet.category}
            </Badge>
            {snippet.is_favorite && <Heart size={14} className="fill-[var(--accent)] text-[var(--accent)]" />}
          </div>
          <h3 className="font-bold text-lg leading-tight">{snippet.title}</h3>
        </div>
        
        {/* Acciones Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button onClick={() => onEdit(snippet)} className="p-1.5 hover:bg-[var(--accent)]/20 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            <Edit3 size={16} />
          </button>
          <button onClick={() => onDelete(snippet.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-[var(--text-secondary)] hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Preview Código */}
      <div className="p-4 flex-grow relative overflow-hidden bg-[var(--bg-card)]">
        <pre className="text-xs text-[var(--text-secondary)] overflow-hidden line-clamp-6 opacity-70 font-mono">
          {snippet.code}
        </pre>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Footer Card */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-main)]/30 flex justify-between items-center">
        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <Copy size={12} /> {snippet.usage_count || 0} usos
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => onToggleFav(snippet.id, snippet.is_favorite)}
            className="p-2 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors"
          >
            <Heart size={16} className={snippet.is_favorite ? "fill-[var(--accent)] text-[var(--accent)]" : ""} />
          </button>
          <Button variant="primary" className="!py-1.5 !px-3 !text-xs" onClick={() => onCopy(snippet)}>
            <Copy size={14} /> Copiar
          </Button>
        </div>
      </div>
    </div>
  );
}