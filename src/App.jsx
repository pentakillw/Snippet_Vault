import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import CommandPalette from './components/ui/CommandPalette'; // Nuevo

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import PublicSnippet from './pages/PublicSnippet'; 
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

// Componente Wrapper para renderizar CommandPalette solo cuando hay Auth
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <CommandPalette />}
      {children}
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider> 
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              {/* Estilos globales */}
              <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-card); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 5px; border: 2px solid var(--bg-card); }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
              `}</style>

              <AppLayout>
                <Routes>
                  {/* Públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<PublicRoute><LoginView /></PublicRoute>} />
                  <Route path="/share/:id" element={<PublicSnippet />} />
                  
                  {/* Legal */}
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-notice" element={<PrivacyNotice />} />

                  {/* Protegidas */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>

            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}