import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PrivacyNotice() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-block mb-8">
          <Button variant="secondary" className="!px-3 !py-1 text-sm">
            <ArrowLeft size={16} /> Volver al Inicio
          </Button>
        </Link>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-[var(--accent)]/10 p-3 rounded-full text-[var(--accent)]">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Aviso de Privacidad Simplificado</h1>
            </div>

            <p className="text-[var(--text-secondary)] mb-6">
                Snippet Vault, con domicilio digital en la nube, es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
            </p>

            <div className="space-y-6 text-sm">
                <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="font-bold text-[var(--accent)] mb-2">¿Para qué fines utilizaremos sus datos personales?</h3>
                    <p className="text-[var(--text-secondary)]">
                        Los datos personales que recabamos de usted los utilizaremos para las siguientes finalidades que son necesarias para el servicio que solicita:
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-[var(--text-secondary)] space-y-1">
                        <li>Creación y gestión de su cuenta de usuario.</li>
                        <li>Almacenamiento y recuperación de sus fragmentos de código.</li>
                        <li>Autenticación y seguridad de la cuenta.</li>
                        <li>Comunicación sobre actualizaciones críticas del servicio.</li>
                    </ul>
                </div>

                <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="font-bold text-[var(--accent)] mb-2">Derechos ARCO</h3>
                    <p className="text-[var(--text-secondary)]">
                        Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstas en la normativa (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición).
                    </p>
                </div>

                <p className="text-[var(--text-secondary)] text-xs mt-4">
                    Para conocer mayor información sobre los términos y condiciones en que serán tratados sus datos personales, como los terceros con quienes compartimos su información personal y la forma en que podrá ejercer sus derechos ARCO, puede consultar el <Link to="/privacy-policy" className="text-[var(--accent)] hover:underline">aviso de privacidad integral</Link>.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}