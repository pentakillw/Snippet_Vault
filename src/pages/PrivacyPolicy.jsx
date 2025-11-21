import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-block mb-8">
          <Button variant="secondary" className="!px-3 !py-1 text-sm">
            <ArrowLeft size={16} /> Volver al Inicio
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-sm">Última actualización: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
          <p className="italic border-l-4 border-[var(--accent)] pl-4">
            En Snippet Vault, tu privacidad es prioritaria. No vendemos tus datos a terceros.
          </p>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Información que Recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Información de la Cuenta:</strong> Correo electrónico y contraseña (encriptada) al registrarte.</li>
              <li><strong>Contenido del Usuario:</strong> Los fragmentos de código (snippets), títulos, descripciones y etiquetas que almacenas.</li>
              <li><strong>Datos de Uso:</strong> Información técnica como dirección IP, tipo de navegador y fecha/hora de acceso para seguridad y análisis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. Cómo Usamos tu Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Proveer y mantener el servicio.</li>
              <li>Permitirte acceder a tu cuenta y recuperar tus datos.</li>
              <li>Notificarte sobre cambios en el servicio o problemas de seguridad.</li>
              <li>Mejorar la funcionalidad de la plataforma basada en patrones de uso anónimos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. Almacenamiento de Datos</h2>
            <p>
              Tus datos se almacenan en servidores seguros proporcionados por Supabase. Implementamos medidas de seguridad estándar de la industria para proteger contra el acceso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Cookies</h2>
            <p>
              Utilizamos cookies esenciales para mantener tu sesión iniciada y recordar tus preferencias (como el tema oscuro/claro). No utilizamos cookies de rastreo publicitario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">5. Tus Derechos</h2>
            <p>
              Tienes derecho a acceder, corregir o eliminar tu información personal. Puedes eliminar tu cuenta y todos tus datos asociados directamente desde el panel de control o contactándonos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}