import { useState } from 'react';
import { Database, Check, AlertTriangle, Loader, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import seedData from '../data/seed_snippets.json'; 

export default function AdminSeeder() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); 

  // --- CONFIGURACIÓN DE VOLUMEN ---
  const MULTIPLIER = 4; // 50 snippets x 4 = 200 snippets
  // --------------------------------

  const handleSeed = async () => {
    if (!user) return alert('Debes estar logueado');
    if (!confirm(`⚠️ MODO STRESS TEST\n\nSe generarán ${seedData.length * MULTIPLIER} snippets para poblar la comunidad.\n\n¿Continuar?`)) return;

    setLoading(true);
    try {
      let allSnippets = [];

      // Bucle multiplicador para generar volumen
      for (let i = 0; i < MULTIPLIER; i++) {
          const batch = seedData.map(snippet => ({
            ...snippet,
            // Variación en el título para que no se vean idénticos si se ordenan por nombre
            title: i === 0 ? snippet.title : `${snippet.title} (Var. ${i})`,
            user_id: user.id,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(), // Fechas aleatorias pasadas
            updated_at: new Date().toISOString(),
            usage_count: Math.floor(Math.random() * 500), // Usos simulados
            is_favorite: Math.random() > 0.8, // Algunos favoritos random
            in_community: true,
            is_public: true
          }));
          allSnippets = [...allSnippets, ...batch];
      }

      // Insertar en bloques de 100 para no saturar Supabase
      const BATCH_SIZE = 100;
      for (let i = 0; i < allSnippets.length; i += BATCH_SIZE) {
          const { error } = await supabase
            .from('snippets')
            .insert(allSnippets.slice(i, i + BATCH_SIZE));
          
          if (error) throw error;
      }

      setStatus('success');
      alert(`¡ÉXITO! Se han cargado ${allSnippets.length} snippets.`);
    } catch (error) {
      console.error(error);
      setStatus('error');
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
            <Database size={24} />
        </div>
        <div>
            <h3 className="font-bold text-blue-400">Mega Seeder (x{MULTIPLIER})</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md">
                Generador de volumen para Análisis de Datos y Scraping.
                <br/>Base: {seedData.length} únicos | <strong>Total a generar: {seedData.length * MULTIPLIER}</strong>
            </p>
        </div>
      </div>

      <Button 
        onClick={handleSeed} 
        disabled={loading || status === 'success'}
        className={status === 'success' ? "!bg-green-500 !text-white border-none" : "!bg-blue-600 !text-white border-none"}
      >
        {loading ? (
            <><Loader size={16} className="animate-spin" /> Generando...</>
        ) : status === 'success' ? (
            <><Check size={16} /> ¡{seedData.length * MULTIPLIER} Cargados!</>
        ) : (
            <><Copy size={16} /> Generar {seedData.length * MULTIPLIER} Snippets</>
        )}
      </Button>
    </div>
  );
}