import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import PublicSnippet from './pages/PublicSnippet'; 
import Explore from './pages/Explore'; 

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginView from './features/auth/LoginView';

// Legal Pages
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivacyNotice from './pages/PrivacyNotice';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider> 
        <AuthProvider>
          <BrowserRouter>
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 8px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
            `}</style>

            <Routes>
              {/* Rutas Públicas Principales */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginView />
                </PublicRoute>
              } />
              
              {/* Rutas Legales */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/privacy-notice" element={<PrivacyNotice />} />

              {/* Rutas Protegidas */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/explore" element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } />

              {/* Rutas Públicas para Compartir */}
              <Route path="/share/:id" element={<PublicSnippet />} />
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}