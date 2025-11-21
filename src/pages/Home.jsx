import { Link } from 'react-router-dom';
import { Terminal, Code2, Shield, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col relative overflow-hidden">
      {/* Decoración de fondo abstracta */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--text-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar simple */}
      <nav className="px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-[var(--accent)] text-white p-1.5 rounded-md">
            <Terminal size={20} />
          </div>
          Snippet Vault
        </div>
        <Link to="/login">
          <Button variant="secondary" className="!py-2 !px-6">Acceder</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4 z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold tracking-wide uppercase mb-6 border border-[var(--accent)]/20">
          <Zap size={12} /> Versión 1.0 Disponible
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Tu código Python,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--sea-light)] opacity-80">
            organizado y seguro.
          </span>
        </h1>
        
        <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed">
          Deja de perder tiempo buscando ese script que escribiste hace meses. 
          Almacena, etiqueta y recupera tus snippets con una experiencia de desarrollador premium.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/login">
            <Button className="!text-lg !px-8 !py-4 shadow-xl shadow-[var(--accent)]/20">
              Comenzar Gratis
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Button variant="secondary" className="!text-lg !px-8 !py-4">
              Ver en GitHub
            </Button>
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full text-left">
          <FeatureCard 
            icon={<Code2 size={24} />}
            title="Syntax Highlighting"
            desc="Editor optimizado para Python con resaltado de sintaxis automático."
          />
          <FeatureCard 
            icon={<Shield size={24} />}
            title="Seguridad Auth"
            desc="Tus fragmentos están protegidos con autenticación robusta vía Supabase."
          />
          <FeatureCard 
            icon={<Zap size={24} />}
            title="Acceso Rápido"
            desc="Buscador instantáneo y copiado al portapapeles en un clic."
          />
        </div>
      </main>

      <footer className="py-8 text-center text-[var(--text-secondary)] text-sm opacity-60">
        © {new Date().getFullYear()} Snippet Vault. Arquitectura React + Supabase.
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 group">
    <div className="w-12 h-12 bg-[var(--bg-main)] rounded-lg flex items-center justify-center mb-4 text-[var(--accent)] group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
  </div>
);