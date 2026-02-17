import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClientData } from '@/hooks/useClientData';

interface ClientRouteProps {
  children: React.ReactNode;
}

export function ClientRoute({ children }: ClientRouteProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const { client, isLoading: clientLoading } = useClientData();

  // Still loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin, redirect to admin dashboard
  if (profile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Still loading client data
  if (clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No client associated
  if (!profile?.client_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Erro de Configuração</h2>
          <p className="text-muted-foreground">
            Sua conta não está associada a nenhum cliente. Entre em contato com o suporte.
          </p>
        </div>
      </div>
    );
  }

  // Check client status
  if (client?.status === 'blocked') {
    return <Navigate to="/client/blocked" replace />;
  }

  if (client?.status === 'expired') {
    return <Navigate to="/client/expired" replace />;
  }

  return <>{children}</>;
}
