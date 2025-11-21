import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginView from './features/auth/LoginView';

// Componente auxiliar para redirigir si ya estás logueado
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Inyectamos fuentes y estilos globales dinámicos del tema */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
          `}</style>

          <Routes>
            {/* Ruta Pública (Landing) */}
            <Route path="/" element={<Home />} />

            {/* Login (Solo accesible si NO estás logueado) */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginView />
              </PublicRoute>
            } />

            {/* Dashboard (Protegido) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Fallback para rutas desconocidas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}