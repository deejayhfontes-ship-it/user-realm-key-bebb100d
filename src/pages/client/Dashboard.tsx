import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CreditCard, 
  Wand2, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientData, checkGeneratorAccess } from '@/hooks/useClientData';
import { cn } from '@/lib/utils';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { 
    client, 
    generators, 
    recentGenerations, 
    totalGenerations,
    creditsInfo,
    isLoading 
  } = useClientData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-primary/15 text-primary' },
    inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground' },
    blocked: { label: 'Bloqueado', className: 'bg-destructive/15 text-destructive' },
    expired: { label: 'Expirado', className: 'bg-warning/15 text-warning' }
  };

  const status = statusConfig[client?.status || 'inactive'];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Bem-vindo, {client?.name?.split(' ')[0]}! 👋
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Credits Card */}
        <Card className="soft-card-lime border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium opacity-80">Créditos</span>
            </div>
            <p className="text-2xl font-bold">
              {creditsInfo.used}/{creditsInfo.total === Infinity ? '∞' : creditsInfo.total}
            </p>
            {client?.type === 'package' && client?.access_expires_at && (
              <p className="text-xs opacity-60 mt-1">
                Expira: {format(new Date(client.access_expires_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generations Card */}
        <Card className="soft-card-dark border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="h-5 w-5" />
              <span className="text-sm font-medium opacity-80">Gerações</span>
            </div>
            <p className="text-2xl font-bold">{totalGenerations || 0}</p>
            <p className="text-xs opacity-60 mt-1">Total</p>
          </CardContent>
        </Card>

        {/* Validity Card */}
        <Card className="soft-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Validade</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {client?.type === 'fixed' 
                ? 'Ilimitado'
                : client?.access_expires_at 
                  ? format(new Date(client.access_expires_at), 'dd/MM/yy', { locale: ptBR })
                  : 'N/A'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {client?.type === 'fixed' ? 'Contrato' : 'Pacote'}
            </p>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="soft-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Status</span>
            </div>
            <Badge className={cn("text-base px-3 py-1", status.className)}>
              {status.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Generators Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Geradores Disponíveis</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/client/generators')}
            className="text-primary"
          >
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {generators && generators.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {generators.slice(0, 4).map((cg) => {
              const access = checkGeneratorAccess(cg, client);
              
              return (
                <Card 
                  key={cg.id} 
                  className={cn(
                    "soft-card border-0 transition-all hover:shadow-lg cursor-pointer",
                    !access.allowed && "opacity-60"
                  )}
                  onClick={() => access.allowed && navigate(`/client/generator/${cg.generator.slug}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{cg.generator.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {cg.generator.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono">
                          {cg.credits_used}
                          {cg.credits_limit && `/${cg.credits_limit}`}
                        </span>
                        {' '}gerações
                      </div>
                      
                      <Button 
                        size="sm" 
                        disabled={!access.allowed}
                        className={cn(
                          "rounded-full",
                          access.allowed 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {access.allowed ? 'Usar Agora' : access.reason}
                        {access.allowed && <ArrowRight className="h-4 w-4 ml-1" />}
                      </Button>
                    </div>

                    {!access.allowed && access.details && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {access.details}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="soft-card border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Nenhum gerador disponível</h3>
              <p className="text-sm text-muted-foreground">
                Entre em contato com o suporte para liberar geradores.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Generations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Últimas Gerações</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/client/history')}
            className="text-primary"
          >
            Ver histórico
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <Card className="soft-card border-0">
          <CardContent className="p-4">
            {recentGenerations && recentGenerations.length > 0 ? (
              <div className="space-y-2">
                {recentGenerations.map((gen) => (
                  <div 
                    key={gen.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {gen.success ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-foreground">{gen.generator_name}</p>
                        {gen.prompt && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{gen.prompt}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(gen.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma geração encontrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
