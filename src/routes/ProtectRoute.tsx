import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/lib/api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="text-sm text-base-content/60">Carregando sua conta...</span>
      </div>
    );
  }

  if (!user && !getToken()) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
