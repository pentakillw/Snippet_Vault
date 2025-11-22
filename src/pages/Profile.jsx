import { useState, useRef } from 'react';
import { User, Key, Shield, ArrowLeft, Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Importamos supabase directo para gestión de datos
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [password, setPassword] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- CAMBIAR PASSWORD ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    try {
      await updateProfile({ password });
      toast.success('Contraseña actualizada correctamente');
      setPassword('');
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoadingAuth(false);
    }
  };

  // --- EXPORTAR DATOS ---
  const handleExport = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = `snippet-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.success('Backup descargado correctamente');
    } catch (error) {
      toast.error('Error al exportar: ' + error.message);
    } finally {
      setLoadingData(false);
    }
  };

  // --- IMPORTAR DATOS ---
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoadingData(true);
        const jsonData = JSON.parse(event.target.result);
        
        if (!Array.isArray(jsonData)) throw new Error("Formato de archivo inválido");

        // CORRECCIÓN DEFINITIVA:
        // En lugar de destructurar variables que no usamos, clonamos y borramos las claves.
        const snippetsToInsert = jsonData.map((item) => {
          const cleanItem = { ...item };
          
          // Eliminamos explícitamente las propiedades conflictivas para evitar errores de "unused vars"
          delete cleanItem.id;         // Borramos ID antiguo para generar uno nuevo
          delete cleanItem.user_id;    // Borramos dueño antiguo
          delete cleanItem.created_at; // Borramos fechas antiguas
          delete cleanItem.updated_at;

          // Retornamos el objeto limpio con los nuevos valores
          return {
            ...cleanItem,
            user_id: user.id,
            created_at: new Date(),
            updated_at: new Date()
          };
        });

        const { error } = await supabase.from('snippets').insert(snippetsToInsert);
        
        if (error) throw error;

        toast.success(`${snippetsToInsert.length} snippets importados exitosamente`);
        queryClient.invalidateQueries(['snippets']); // Refrescar datos en Dashboard
        
      } catch (error) {
        console.error(error);
        toast.error('Error al importar: ' + error.message);
      } finally {
        setLoadingData(false);
        e.target.value = null; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-block mb-6">
           <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm">
             <ArrowLeft size={16} /> Volver al Dashboard
           </button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Mi Cuenta</h1>
        <p className="text-[var(--text-secondary)] mb-8">Gestiona tu seguridad y tus datos.</p>

        <div className="space-y-8">
          
          {/* TARJETA PERFIL */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-6 border-b border-[var(--border)] pb-6">
               <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)]">
                 <User size={32} />
               </div>
               <div>
                 <h3 className="text-lg font-bold">{user?.email}</h3>
                 <p className="text-xs text-[var(--text-secondary)] font-mono opacity-70">UID: {user?.id}</p>
                 <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                      <Shield size={10} /> Verificado
                    </span>
                 </div>
               </div>
             </div>

             <form onSubmit={handleUpdatePassword}>
               <h4 className="font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                 <Key size={18} className="text-[var(--text-secondary)]" />
                 Seguridad
               </h4>
               <div className="flex gap-4 items-end">
                 <div className="flex-grow">
                    <Input 
                      label="Nueva Contraseña" 
                      type="password" 
                      placeholder="••••••••"
                      className="!mb-0"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
                 <Button type="submit" disabled={loadingAuth || !password} className="h-[46px]">
                   {loadingAuth ? '...' : 'Actualizar'}
                 </Button>
               </div>
             </form>
          </div>

          {/* TARJETA GESTIÓN DE DATOS */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm relative overflow-hidden">
             {/* Decoración de fondo */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -mr-10 -mt-10 pointer-events-none" />

             <h4 className="font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)] relative z-10">
               <Database size={18} className="text-[var(--text-secondary)]" />
               Gestión de Datos
             </h4>
             
             <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-lg">
               Tus snippets son tuyos. Puedes descargar una copia de seguridad en formato JSON o importar snippets desde otro archivo compatible.
             </p>

             <div className="flex flex-col sm:flex-row gap-4">
               <Button variant="secondary" onClick={handleExport} disabled={loadingData} className="w-full sm:w-auto justify-center">
                 <Download size={16} /> Exportar Backup
               </Button>
               
               <div className="relative">
                 <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                 />
                 <Button variant="primary" onClick={handleImportClick} disabled={loadingData} className="w-full sm:w-auto justify-center">
                   <Upload size={16} /> Importar Snippets
                 </Button>
               </div>
             </div>

             {loadingData && <p className="text-xs text-[var(--accent)] mt-4 animate-pulse">Procesando datos...</p>}
          </div>

          {/* ZONA DE PELIGRO (Placeholder visual) */}
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6 flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity">
             <AlertTriangle className="text-red-500 shrink-0" />
             <div>
                <h4 className="font-bold text-red-500 text-sm mb-1">Zona de Peligro</h4>
                <p className="text-xs text-red-400 mb-3">La eliminación de cuenta es irreversible y borrará todos tus snippets públicos y privados.</p>
                <button className="text-xs font-bold text-red-500 hover:text-red-400 underline">Eliminar mi cuenta</button>
             </div>
          </div>

        </div>

        <div className="text-center text-xs text-[var(--text-secondary)] opacity-30 mt-12">
          Snippet Vault v1.2.0 - Enterprise Build
        </div>
      </div>
    </div>
  );
}