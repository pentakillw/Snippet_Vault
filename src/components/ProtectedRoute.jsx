import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--accent)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
      </div>
    );
  }

  if (!user) {
    // Redirigir al login pero guardando la ubicación intentada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}