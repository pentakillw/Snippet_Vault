import { useMemo } from 'react';
import { Code2, Heart, Trophy, BarChart3 } from 'lucide-react';

export default function StatsWidget({ snippets = [] }) {
  
  const stats = useMemo(() => {
    const total = snippets.length;
    const favorites = snippets.filter(s => s.is_favorite).length;
    
    // Calcular lenguaje más usado
    const langs = {};
    snippets.forEach(s => {
      const l = s.language || 'unknown';
      langs[l] = (langs[l] || 0) + 1;
    });
    
    const topLang = Object.entries(langs).sort((a,b) => b[1] - a[1])[0];

    return {
      total,
      favorites,
      topLanguage: topLang ? topLang[0] : 'N/A',
      topLangCount: topLang ? topLang[1] : 0
    };
  }, [snippets]);

  if (snippets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
      
      {/* Card 1: Total */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-6 -mt-6 group-hover:bg-blue-500/10 transition-colors" />
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <Code2 size={24} />
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Total Snippets</p>
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</h4>
        </div>
      </div>

      {/* Card 2: Favoritos */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-pink-500/5 rounded-full -mr-6 -mt-6 group-hover:bg-pink-500/10 transition-colors" />
        <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
          <Heart size={24} className="fill-current" />
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Favoritos</p>
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">{stats.favorites}</h4>
        </div>
      </div>

      {/* Card 3: Top Language */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-4 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-6 -mt-6 group-hover:bg-amber-500/10 transition-colors" />
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Trophy size={24} />
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Top Lenguaje</p>
          <h4 className="text-2xl font-bold text-[var(--text-primary)] capitalize">
            {stats.topLanguage} 
            <span className="text-xs opacity-50 ml-2 font-normal">({stats.topLangCount})</span>
          </h4>
        </div>
      </div>

    </div>
  );
}