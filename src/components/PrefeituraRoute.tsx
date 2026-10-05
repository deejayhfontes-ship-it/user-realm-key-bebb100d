import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Protege rotas exclusivas da Prefeitura.
// Só permite acesso a usuários com email @prefeitura (login especial) ou admins.
// Clientes normais e faculdade são redirecionados para suas próprias áreas.
export function PrefeituraRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const email = user.email?.toLowerCase() ?? '';
  const isPrefeitura = email.includes('@prefeitura');

  if (!isPrefeitura && !isAdmin) {
    // Usuário logado, mas não é da prefeitura — manda pra área dele
    const destino = email.includes('@edicao.com') ? '/faculdade' : '/client/dashboard';
    return <Navigate to={destino} replace />;
  }

  return <>{children}</>;
}
