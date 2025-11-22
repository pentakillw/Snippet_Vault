import { useMemo } from 'react';
import { Code2, Heart, Trophy, Star } from 'lucide-react';

// Colores para lenguajes comunes
const LANG_COLORS = {
  python: 'bg-blue-500',
  javascript: 'bg-yellow-400',
  typescript: 'bg-blue-600',
  sql: 'bg-orange-500',
  html: 'bg-orange-600',
  css: 'bg-blue-400',
  java: 'bg-red-600',
  shell: 'bg-gray-500',
  other: 'bg-gray-400'
};

export default function StatsWidget({ snippets = [] }) {
  
  const stats = useMemo(() => {
    const total = snippets.length;
    const favorites = snippets.filter(s => s.is_favorite).length;
    
    // --- GAMIFICACIÓN ---
    let rank = 'Novato';
    let nextRank = 'Iniciado';
    let progress = 0;
    let target = 5;

    if (total >= 50) { rank = 'Maestro'; nextRank = 'Leyenda'; target = 100; }
    else if (total >= 25) { rank = 'Arquitecto'; nextRank = 'Maestro'; target = 50; }
    else if (total >= 10) { rank = 'Coleccionista'; nextRank = 'Arquitecto'; target = 25; }
    else if (total >= 5) { rank = 'Iniciado'; nextRank = 'Coleccionista'; target = 10; }

    const prevTarget = rank === 'Novato' ? 0 : (rank === 'Iniciado' ? 5 : (rank === 'Coleccionista' ? 10 : (rank === 'Arquitecto' ? 25 : 50)));
    const range = target - prevTarget;
    const currentInrange = total - prevTarget;
    progress = Math.min(100, Math.max(0, (currentInrange / range) * 100));

    // --- DISTRIBUCIÓN DE LENGUAJES ---
    const langs = {};
    snippets.forEach(s => {
      const l = s.language || 'plaintext';
      langs[l] = (langs[l] || 0) + 1;
    });

    // Ordenar y calcular porcentajes
    const sortedLangs = Object.entries(langs).sort((a,b) => b[1] - a[1]);
    const topLang = sortedLangs[0];
    
    // Preparamos data para la barra visual (Top 3 + Otros)
    const distribution = sortedLangs.slice(0, 3).map(([name, count]) => ({
      name,
      count,
      percent: (count / total) * 100,
      color: LANG_COLORS[name] || LANG_COLORS.other
    }));

    const othersCount = sortedLangs.slice(3).reduce((acc, curr) => acc + curr[1], 0);
    if (othersCount > 0) {
      distribution.push({
        name: 'Otros',
        count: othersCount,
        percent: (othersCount / total) * 100,
        color: LANG_COLORS.other
      });
    }

    return {
      total,
      favorites,
      topLanguage: topLang ? topLang[0] : 'N/A',
      topLangCount: topLang ? topLang[1] : 0,
      rank,
      nextRank,
      progress,
      target,
      distribution // Nueva data
    };
  }, [snippets]);

  if (snippets.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in space-y-4">
      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Nivel / Rango */}
        <div className="bg-[var(--bg-card)] border border-[var(--accent)]/30 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden shadow-lg shadow-[var(--accent)]/5">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[var(--accent)]/10 rounded-full -mr-6 -mt-6" />
          <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="bg-[var(--accent)] text-white p-2 rounded-lg shadow-md">
                  <Star size={20} className="fill-current" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded">Nvl. {stats.rank}</span>
          </div>
          <div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>{stats.total} / {stats.target} XP</span>
                  <span>Siguiente: {stats.nextRank}</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out rounded-full" style={{ width: `${stats.progress}%` }} />
              </div>
          </div>
        </div>

        {/* Card 2: Total */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Code2 size={24} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Total</p>
            <h4 className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</h4>
          </div>
        </div>

        {/* Card 3: Favoritos */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
            <Heart size={24} className="fill-current" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Favoritos</p>
            <h4 className="text-2xl font-bold text-[var(--text-primary)]">{stats.favorites}</h4>
          </div>
        </div>

        {/* Card 4: Top Language */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Top Tech</p>
            <h4 className="text-xl font-bold text-[var(--text-primary)] capitalize truncate max-w-[100px]" title={stats.topLanguage}>
              {stats.topLanguage} 
            </h4>
          </div>
        </div>
      </div>

      {/* Barra de Distribución (NUEVA) */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-2">
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-[var(--bg-main)]">
           {stats.distribution.map((item, idx) => (
             <div 
                key={idx}
                className={`h-full ${item.color}`}
                style={{ width: `${item.percent}%` }}
                title={`${item.name}: ${item.count} snippets`}
             />
           ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
           {stats.distribution.map((item, idx) => (
             <div key={idx} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="font-medium capitalize">{item.name}</span>
                <span className="opacity-50">{Math.round(item.percent)}%</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}