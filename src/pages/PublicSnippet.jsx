import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Terminal, Copy, Moon, Sun, Hash, Calendar } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// Helper para extensiones
const EXTENSIONS = {
  python: 'py',
  java: 'java',
  scala: 'scala',
  r: 'r',
  sql: 'sql'
};

export default function PublicSnippet() {
  const { id } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPublicSnippet() {
      try {
        const { data, error } = await supabase
          .from('snippets')
          .select('*')
          .eq('id', id)
          .eq('is_public', true)
          .single();

        if (error) throw error;
        setSnippet(data);
        
        await supabase.rpc('increment_usage', { row_id: id });
        
      } catch (err) {
        console.error(err);
        setError('Este snippet no existe o es privado.');
      } finally {
        setLoading(false);
      }
    }
    fetchPublicSnippet();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-secondary)] font-mono">
      Cargando recurso compartido...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-4">
        <Terminal size={32} />
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Acceso Denegado</h1>
      <p className="text-[var(--text-secondary)] mb-6">{error}</p>
      <Link to="/">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  );

  const ext = EXTENSIONS[snippet.language || 'python'] || 'txt';

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
      <nav className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[var(--text-primary)]">
          <div className="bg-[var(--accent)] text-white p-1.5 rounded-md">
            <Terminal size={20} />
          </div>
          Snippet Vault
        </div>
        <div className="flex gap-3">
          <button onClick={toggleTheme} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors text-[var(--text-primary)]">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login">
            <Button variant="secondary" className="!py-1.5 text-xs">Crear mi cuenta</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full animate-fade-in">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="p-6 md:p-8 border-b border-[var(--border)] bg-[var(--bg-main)]/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Badge active>{snippet.category}</Badge>
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                  <Calendar size={12} /> {new Date(snippet.created_at).toLocaleDateString()}
                </span>
              </div>
              <Button onClick={handleCopy} className={copied ? "!bg-green-500 !text-white border-none" : ""}>
                {copied ? '¡Copiado!' : <><Copy size={16} /> Copiar Código</>}
              </Button>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed opacity-80">
                {snippet.description}
              </p>
            )}

            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {snippet.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)]">
                    <Hash size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative group">
             <div className="absolute top-0 left-0 right-0 h-8 bg-[#1e1e1e] flex items-center px-4 border-b border-[#333]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                {/* Nombre de archivo dinámico basado en lenguaje */}
                <span className="ml-4 text-xs text-gray-500 font-mono">script.{ext}</span>
             </div>
            <SyntaxHighlighter
              language={snippet.language || 'python'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '3rem 1.5rem 1.5rem',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                background: '#1e1e1e',
              }}
              showLineNumbers={true}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[var(--text-secondary)] mb-4">¿Te sirvió este código? Únete para guardar los tuyos.</p>
            <Link to="/">
                <Button variant="primary" className="!px-8 !py-3 shadow-lg shadow-[var(--accent)]/20">
                    Comenzar Gratis con Snippet Vault
                </Button>
            </Link>
        </div>
      </main>
    </div>
  );
}