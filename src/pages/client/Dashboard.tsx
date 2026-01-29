import { Link } from 'react-router-dom';
import { 
  Wand2, 
  Image as ImageIcon, 
  Smartphone, 
  Sparkles, 
  Images,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditDisplay } from '@/components/client/CreditDisplay';
import { useClientData } from '@/hooks/useClientData';

const iconMap: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Sparkles: Sparkles,
  Images: Images,
  stories: Smartphone,
  derivations: Sparkles,
  carousel: Images,
};

export default function ClientDashboard() {
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
      <div className="p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const clientName = client?.name?.split(' ')[0] || 'Usuário';

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Bem-vindo, {clientName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus geradores e acompanhe suas criações
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Créditos Disponíveis */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <CreditDisplay
              used={creditsInfo.used}
              total={creditsInfo.total}
              resetDate={client?.access_expires_at}
              type={client?.type || 'package'}
            />
          </CardContent>
        </Card>

        {/* Geradores Liberados */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Geradores Liberados</p>
                <p className="text-2xl font-bold text-foreground">{generators?.length || 0}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-4">
              {generators?.slice(0, 5).map((gen) => {
                const Icon = iconMap[gen.generator?.type] || Wand2;
                return (
                  <div 
                    key={gen.id} 
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    title={gen.generator?.name}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Artes Geradas */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Artes Geradas</p>
                <p className="text-2xl font-bold text-foreground">{totalGenerations || 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Total de gerações</p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status da Conta</p>
                <Badge 
                  className={
                    client?.status === 'active' 
                      ? 'bg-primary/15 text-primary hover:bg-primary/20 mt-1'
                      : 'bg-destructive/15 text-destructive hover:bg-destructive/20 mt-1'
                  }
                >
                  {client?.status === 'active' ? 'Ativo' : client?.status === 'blocked' ? 'Bloqueado' : 'Expirado'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meus Geradores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Meus Geradores</h2>
          <Link to="/client/geradores">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {generators && generators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generators.map((gen) => {
              const Icon = iconMap[gen.generator?.type] || Wand2;
              return (
                <Card key={gen.id} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{gen.generator?.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {gen.generator?.description || 'Gerador de artes'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/client/gerador/${gen.generator?.slug}`}>
                      <Button className="w-full mt-4" size="sm">
                        Usar Agora
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Nenhum gerador disponível</h3>
              <p className="text-sm text-muted-foreground">
                Entre em contato com o administrador para liberar geradores.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Últimas Criações */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Últimas Criações</h2>
          <Link to="/client/historico">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Ver histórico <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {recentGenerations && recentGenerations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentGenerations.slice(0, 4).map((gen) => (
              <Card key={gen.id} className="border-none shadow-sm bg-card overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">Ver</Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">
                    {gen.generator_name || 'Geração'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(gen.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Nenhuma arte gerada</h3>
              <p className="text-sm text-muted-foreground">
                Comece usando um dos geradores disponíveis.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
