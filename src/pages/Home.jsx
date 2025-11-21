import { Link } from 'react-router-dom';
import { Terminal, Code2, Shield, Zap, Database, Share2, Layout, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col relative overflow-hidden text-[var(--text-primary)]">
      {/* Decoración de fondo abstracta */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--text-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar simple */}
      <nav className="px-6 md:px-12 py-6 flex justify-between items-center z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-[var(--accent)] text-white p-1.5 rounded-md">
            <Terminal size={20} />
          </div>
          Snippet Vault
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-sm font-medium hover:text-[var(--accent)] transition-colors hidden sm:block">
            Iniciar Sesión
          </Link>
          <Link to="/login">
            <Button variant="primary" className="!py-2 !px-6">Comenzar Gratis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-grow flex flex-col justify-center items-center text-center px-4 z-10 max-w-5xl mx-auto pt-10 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold tracking-wide uppercase mb-6 border border-[var(--accent)]/20 animate-fade-in">
          <Zap size={12} /> Versión 1.0 Disponible
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight animate-fade-in">
          Tu base de conocimiento<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--sea-light)] opacity-90">
            de código, centralizada.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed animate-fade-in">
          Deja de perder tiempo buscando ese script de Python o esa consulta SQL que escribiste hace meses. 
          Almacena, etiqueta y comparte tus snippets con una experiencia de desarrollador premium.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
          <Link to="/login">
            <Button className="!text-lg !px-8 !py-4 shadow-xl shadow-[var(--accent)]/20">
              Crear mi cuenta ahora
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Button variant="secondary" className="!text-lg !px-8 !py-4">
              Ver Demo en GitHub
            </Button>
          </a>
        </div>
      </header>

      {/* Sección: Cómo funciona */}
      <section className="py-20 bg-[var(--bg-card)]/50 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Flujo de trabajo optimizado</h2>
            <p className="text-[var(--text-secondary)]">Diseñado para integrarse en tu rutina diaria de desarrollo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            {/* Línea conectora (solo desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-[var(--border)] -z-10 border-t border-dashed" />

            <StepCard 
              number="01"
              title="Guarda"
              desc="Pega tu código. Detectamos el lenguaje automáticamente y aplicamos resaltado de sintaxis."
            />
             <StepCard 
              number="02"
              title="Organiza"
              desc="Añade etiquetas (tags) y categorías para encontrar tus soluciones en segundos."
            />
             <StepCard 
              number="03"
              title="Comparte"
              desc="Genera enlaces públicos con fecha de caducidad o publica en la comunidad global."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-center">Todo lo que necesitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Code2 size={24} />}
            title="Multi-Lenguaje"
            desc="Soporte nativo para Python, JavaScript, SQL, R, Scala y Java con PrismJS."
          />
          <FeatureCard 
            icon={<Shield size={24} />}
            title="Seguridad Auth"
            desc="Tus fragmentos están protegidos. Tú decides qué es privado y qué es público."
          />
          <FeatureCard 
            icon={<Database size={24} />}
            title="Cloud Storage"
            desc="Accede a tus snippets desde cualquier dispositivo gracias a la nube de Supabase."
          />
          <FeatureCard 
            icon={<Share2 size={24} />}
            title="Enlaces Temporales"
            desc="Comparte código sensible generando enlaces que se autodestruyen."
          />
          <FeatureCard 
            icon={<Layout size={24} />}
            title="Modo Oscuro/Claro"
            desc="Interfaz cuidada al detalle para no cansar tu vista, sea de día o de noche."
          />
           <FeatureCard 
            icon={<CheckCircle size={24} />}
            title="Open Source"
            desc="Transparencia total. Proyecto construido con tecnologías modernas y abiertas."
          />
        </div>
      </section>

      {/* Footer Legal */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--border)] pt-12 pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <Terminal size={20} className="text-[var(--accent)]" />
              Snippet Vault
            </div>
            <p className="text-[var(--text-secondary)] text-sm max-w-xs">
              La herramienta definitiva para desarrolladores que valoran su tiempo y su código.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link to="/login" className="hover:text-[var(--accent)]">Iniciar Sesión</Link></li>
              <li><Link to="/login" className="hover:text-[var(--accent)]">Registrarse</Link></li>
              <li><a href="#" className="hover:text-[var(--accent)]">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link to="/terms" className="hover:text-[var(--accent)]">Términos y Condiciones</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[var(--accent)]">Política de Privacidad</Link></li>
              <li><Link to="/privacy-notice" className="hover:text-[var(--accent)]">Aviso de Privacidad</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[var(--border)] pt-6 text-center text-[var(--text-secondary)] text-xs">
          © {new Date().getFullYear()} Snippet Vault. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 group hover:-translate-y-1 shadow-sm">
    <div className="w-12 h-12 bg-[var(--bg-main)] rounded-lg flex items-center justify-center mb-4 text-[var(--accent)] group-hover:scale-110 transition-transform border border-[var(--border)]">
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
  </div>
);

const StepCard = ({ number, title, desc }) => (
  <div className="bg-[var(--bg-main)] p-6 rounded-xl border border-[var(--border)] z-10 relative">
    <div className="w-10 h-10 bg-[var(--accent)] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-lg shadow-[var(--accent)]/20">
      {number}
    </div>
    <h3 className="font-bold text-xl mb-2">{title}</h3>
    <p className="text-[var(--text-secondary)] text-sm">{desc}</p>
  </div>
);