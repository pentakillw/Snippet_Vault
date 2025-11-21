import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginView() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate(); 
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Estado para el checkbox de términos
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validar aceptación de términos en registro
    if (!isLogin && !acceptedTerms) {
      setError('Debes aceptar los Términos y Políticas para registrarte.');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);
        
      if (error) throw error;
      
      if (!isLogin) {
        alert('Revisa tu email para confirmar tu cuenta');
        setIsLogin(true); 
      } else {
         navigate('/dashboard'); 
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)] animate-fade-in">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-sm font-mono"
      >
        &larr; Volver al inicio
      </button>

      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
            <Terminal size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Snippet Vault</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {isLogin ? 'Bienvenido de nuevo, Dev.' : 'Crea tu cuenta y organiza tu código.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input 
            label="Email Corporativo" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input 
            label="Contraseña" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {/* Checkbox de términos solo visible en Registro */}
          {!isLogin && (
            <div className="flex items-start gap-3 mb-4 text-xs text-[var(--text-secondary)]">
              <input 
                type="checkbox" 
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-[var(--accent)] cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer leading-relaxed">
                Acepto los <Link to="/terms" target="_blank" className="text-[var(--accent)] hover:underline">Términos y Condiciones</Link>, la <Link to="/privacy-policy" target="_blank" className="text-[var(--accent)] hover:underline">Política de Privacidad</Link> y el <Link to="/privacy-notice" target="_blank" className="text-[var(--accent)] hover:underline">Aviso de Privacidad</Link>.
              </label>
            </div>
          )}
          
          {error && (
            <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mb-4" disabled={loading || (!isLogin && !acceptedTerms)}>
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-[var(--border)]">
          <button 
            onClick={() => {
                setIsLogin(!isLogin);
                setError(''); // Limpiar errores al cambiar
                setAcceptedTerms(false);
            }}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            {isLogin ? '¿Nuevo por aquí? Crea una cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}