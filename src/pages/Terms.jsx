import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Gavel, Scale, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-block mb-8">
          <Button variant="secondary" className="!px-3 !py-1 text-sm">
            <ArrowLeft size={16} /> Volver al Inicio
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
           <div className="bg-[var(--accent)]/10 p-3 rounded-lg text-[var(--accent)]">
              <Gavel size={32} />
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-bold">Términos de Servicio</h1>
              <p className="text-[var(--text-secondary)] text-sm">Vigencia a partir de: {new Date().toLocaleDateString()}</p>
           </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-sm space-y-10 text-sm md:text-base leading-relaxed text-[var(--text-secondary)]">
          
          {/* Alerta de Responsabilidad */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400 flex gap-3 items-start">
            <ShieldAlert size={24} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              <strong>CLÁUSULA DE EXENCIÓN:</strong> Snippet Vault es una plataforma de "Puerto Seguro". No monitoreamos activamente el código. Usted asume el 100% de la responsabilidad legal por cualquier contenido que suba, almacene o comparta.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">1. Aceptación de Condiciones</h2>
            <p>
              Al acceder, registrarse o utilizar Snippet Vault ("el Servicio"), usted acepta irrevocablemente estar sujeto a estos términos. Si utiliza el Servicio en nombre de una entidad (empresa, organización), usted declara y garantiza que tiene la autoridad para vincular a dicha entidad a estos Términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">2. Derechos de Propiedad Intelectual y Garantías</h2>
            <div className="space-y-4">
                <p>
                  <strong>2.1 Garantía de Autoría:</strong> Usted declara y garantiza bajo protesta de decir verdad que es el autor original del código que sube, o que posee las licencias, derechos, consentimientos y permisos necesarios para publicarlo.
                </p>
                <p className="bg-[var(--bg-main)] p-3 rounded border border-[var(--border)]">
                  <strong>⚠️ Código de Empleadores:</strong> Si usted sube código perteneciente a su empleador o empresa, usted garantiza que tiene permiso explícito para hacerlo. Snippet Vault cooperará plenamente con las autoridades o entidades corporativas en casos de filtración de propiedad intelectual industrial.
                </p>
                <p>
                  <strong>2.2 Licencia Operativa (Contenido Privado):</strong> Al almacenar código, incluso si está marcado como "Privado", usted otorga a Snippet Vault una licencia mundial, libre de regalías y no exclusiva para alojar, almacenar, realizar copias de seguridad, indexar (para su propia búsqueda) y parsear (para resaltado de sintaxis) dicho contenido.
                </p>
                <p>
                  <strong>2.3 Licencia Comunitaria (Contenido Público):</strong> Al marcar un snippet como "Público" o "Comunidad", usted otorga una licencia perpetua, irrevocable, mundial y libre de regalías a Snippet Vault y a todos sus usuarios para usar, copiar, modificar, distribuir y crear trabajos derivados de dicho código. <strong>Usted renuncia a cualquier "derecho moral"</strong> de reclamar autoría exclusiva una vez que el código ha sido liberado a la comunidad.
                </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">3. Política de Uso Aceptable (Tolerancia Cero)</h2>
            <p className="mb-3">Nos reservamos el derecho de terminar cuentas inmediatamente si detectamos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Malware:</strong> Alojamiento de código malicioso, scripts de Command & Control (C2), ransomware o spyware.</li>
              <li><strong>Minería:</strong> Uso de la plataforma para distribuir scripts de minería de criptomonedas.</li>
              <li><strong>Abuso de Infraestructura:</strong> Uso de la plataforma como CDN (Content Delivery Network) para imágenes o archivos binarios pesados.</li>
              <li><strong>Scraping:</strong> Uso de bots, spiders o scrapers para extraer la base de datos de la comunidad.</li>
              <li><strong>Contenido Ilegal:</strong> Cualquier código que viole leyes locales o internacionales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">4. Terminación y "Kill Switch"</h2>
            <p>
              Snippet Vault se reserva el derecho, a su entera y exclusiva discreción, de suspender o eliminar su cuenta y rechazar cualquier uso actual o futuro del Servicio <strong>por cualquier motivo y sin previo aviso</strong>. En caso de terminación por violación de términos:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Su acceso será revocado instantáneamente.</li>
              <li>Todo su contenido podrá ser eliminado permanentemente de nuestros servidores.</li>
              <li>Snippet Vault no será responsable ante usted ni ante terceros por dicha terminación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">5. Limitación de Responsabilidad</h2>
            <p>
              EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, SNIPPET VAULT NO SERÁ RESPONSABLE DE NINGÚN DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O PUNITIVO, NI DE NINGUNA PÉRDIDA DE BENEFICIOS O INGRESOS, YA SEA INCURRIDA DIRECTA O INDIRECTAMENTE, O DE CUALQUIER PÉRDIDA DE DATOS, USO, FONDO DE COMERCIO U OTRAS PÉRDIDAS INTANGIBLES. LA RESPONSABILIDAD TOTAL DE SNIPPET VAULT HACIA USTED POR CUALQUIER RECLAMO SE LIMITARÁ A LA CANTIDAD QUE USTED HAYA PAGADO A SNIPPET VAULT EN LOS ÚLTIMOS 12 MESES O $50 USD, LO QUE SEA MAYOR.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">6. Indemnización</h2>
            <div className="flex gap-3 bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border)]">
                <Scale size={24} className="text-[var(--accent)] shrink-0" />
                <p>
                    Usted acuerda defender, indemnizar y eximir de responsabilidad a Snippet Vault, sus directivos y empleados frente a cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda y gastos (incluidos los honorarios de abogados) derivados de: (i) su uso y acceso al Servicio; (ii) su violación de cualquier término de estos Términos; o (iii) su violación de cualquier derecho de terceros, incluidos, entre otros, derechos de autor o de propiedad.
                </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3 border-b border-[var(--border)] pb-2">7. Jurisdicción y Renuncia a Demanda Colectiva</h2>
            <p>
              Estos términos se regirán por las leyes del lugar donde opera principalmente Snippet Vault, sin tener en cuenta sus principios de conflicto de leyes. Usted y Snippet Vault acuerdan que cualquier disputa se resolverá mediante arbitraje individual vinculante y <strong>renuncian explícitamente a participar en demandas colectivas</strong>.
            </p>
          </section>

        </div>
        
        <div className="mt-8 text-center border-t border-[var(--border)] pt-8 pb-12">
          <div className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] opacity-70 bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border)]">
            <AlertTriangle size={12} />
            ¿Dudas legales? Contacto: legal@snippetvault.com
          </div>
        </div>
      </div>
    </div>
  );
}