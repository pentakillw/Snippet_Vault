import { useMemo } from 'react';
import { subDays, format, isSameDay, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ActivityHeatmap({ snippets = [] }) {
  // Generamos los datos del último año (o 6 meses para no saturar)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const daysToRender = 160; // Aprox 5 meses para que se vea bien en desktop
    const startDate = subDays(today, daysToRender);
    
    // Alinear al inicio de la semana (Domingo)
    const calendarStart = startOfWeek(startDate);
    
    const days = [];
    for (let i = 0; i <= daysToRender + (today.getDay() + 1); i++) {
      const date = addDays(calendarStart, i);
      if (date > today) break;

      // Contar contribuciones (snippets creados este día)
      const count = snippets.filter(s => 
        s.created_at && isSameDay(new Date(s.created_at), date)
      ).length;

      // Determinar intensidad del color
      let intensity = 'bg-[var(--bg-main)] border border-[var(--border)]'; // Nivel 0
      if (count === 1) intensity = 'bg-[var(--accent)]/30 border-transparent';
      if (count === 2) intensity = 'bg-[var(--accent)]/60 border-transparent';
      if (count >= 3) intensity = 'bg-[var(--accent)] border-transparent';

      days.push({ date, count, intensity });
    }
    return days;
  }, [snippets]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6 hidden md:block animate-fade-in">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex justify-between">
        <span>Actividad Reciente</span>
        <span className="opacity-50">{heatmapData.reduce((acc, curr) => acc + curr.count, 0)} contribuciones</span>
      </h3>
      
      <div className="flex flex-wrap gap-1 justify-start">
        {heatmapData.map((day, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-default ${day.intensity}`}
            title={`${format(day.date, 'd MMM, yyyy', { locale: es })}: ${day.count} snippets`}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] mt-2 justify-end">
        <span>Menos</span>
        <div className="w-3 h-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border)]" />
        <div className="w-3 h-3 rounded-sm bg-[var(--accent)]/30" />
        <div className="w-3 h-3 rounded-sm bg-[var(--accent)]/60" />
        <div className="w-3 h-3 rounded-sm bg-[var(--accent)]" />
        <span>Más</span>
      </div>
    </div>
  );
}