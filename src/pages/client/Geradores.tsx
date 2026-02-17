import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wand2, 
  Smartphone, 
  Sparkles, 
  Images,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Ban
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { NoCreditsModal } from '@/components/client/NoCreditsModal';
import { useClientData, checkGeneratorAccess } from '@/hooks/useClientData';

const iconMap: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Sparkles: Sparkles,
  Images: Images,
  stories: Smartphone,
  derivations: Sparkles,
  carousel: Images,
};

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'stories', label: 'Stories' },
  { value: 'derivations', label: 'Posts' },
  { value: 'carousel', label: 'Carrossel' },
];

export default function ClientGeradores() {
  const [filter, setFilter] = useState('all');
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);
  const { client, generators, isLoading, creditsInfo } = useClientData();

  const filteredGenerators = filter === 'all' 
    ? generators 
    : generators?.filter(g => g.generator?.type === filter);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
          <Skeleton className="h-4 w-56 sm:w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const hasCredits = creditsInfo.remaining > 0 || client?.type === 'fixed';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Meus Geradores</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Acesse os geradores disponíveis para seu plano
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-muted/50 flex-wrap h-auto p-1">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Generators Grid */}
      {filteredGenerators && filteredGenerators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredGenerators.map((gen) => {
            const Icon = iconMap[gen.generator?.type] || Wand2;
            const access = checkGeneratorAccess(gen, client);
            const canUse = access.allowed && hasCredits;
            
            return (
              <Card 
                key={gen.id} 
                className="border-none shadow-sm bg-card hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground">{gen.generator?.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {canUse ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary">Disponível</span>
                          </>
                        ) : !hasCredits ? (
                          <>
                            <Ban className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive">Sem créditos</span>
                          </>
                        ) : access.reason === 'Fora do horário' ? (
                          <>
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">{access.reason}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive">{access.reason}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {gen.generator?.description || 'Gerador de artes personalizadas'}
                  </p>

                  {/* Credit info */}
                  {gen.credits_limit !== null && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal">
                        {gen.credits_used || 0}/{gen.credits_limit} usados
                      </Badge>
                    </div>
                  )}

                  {/* Access details */}
                  {!canUse && access.details && (
                    <p className="text-xs text-muted-foreground mb-4">{access.details}</p>
                  )}

                  {/* Action */}
                  {canUse ? (
                    <Link to={`/client/gerador/${gen.generator?.slug}`}>
                      <Button className="w-full">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Acessar Gerador
                      </Button>
                    </Link>
                  ) : !hasCredits ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setNoCreditsModalOpen(true)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Sem Créditos
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Indisponível
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Nenhum gerador encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {filter === 'all' 
              ? 'Não há geradores disponíveis para sua conta'
              : 'Não há geradores disponíveis para este filtro'}
          </p>
          {filter !== 'all' && (
            <Button variant="outline" className="mt-4" onClick={() => setFilter('all')}>
              Ver todos os geradores
            </Button>
          )}
        </div>
      )}

      {/* No Credits Modal */}
      <NoCreditsModal 
        open={noCreditsModalOpen} 
        onOpenChange={setNoCreditsModalOpen} 
      />
    </div>
  );
}
