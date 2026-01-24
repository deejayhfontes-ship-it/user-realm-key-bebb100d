import { useNavigate } from 'react-router-dom';
import { 
  Wand2, 
  Sparkles, 
  ArrowRight,
  Clock,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientData, checkGeneratorAccess } from '@/hooks/useClientData';
import { cn } from '@/lib/utils';

export default function ClientGenerators() {
  const navigate = useNavigate();
  const { client, generators, creditsInfo, isLoading } = useClientData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Meus Geradores</h1>
          <p className="text-muted-foreground mt-1">
            {generators?.length || 0} geradores disponíveis
          </p>
        </div>

        {/* Credits summary */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-semibold">{creditsInfo.remaining === Infinity ? '∞' : creditsInfo.remaining}</span>
            <span className="text-muted-foreground"> créditos restantes</span>
          </span>
        </div>
      </div>

      {/* Low credits warning */}
      {creditsInfo.remaining !== Infinity && creditsInfo.remaining <= 5 && creditsInfo.remaining > 0 && (
        <Alert className="bg-warning/10 border-warning/30">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            Você está com poucos créditos restantes. Entre em contato com o suporte para renovar.
          </AlertDescription>
        </Alert>
      )}

      {/* Generators Grid */}
      {generators && generators.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generators.map((cg) => {
            const access = checkGeneratorAccess(cg, client);
            
            return (
              <Card 
                key={cg.id}
                className={cn(
                  "soft-card border-0 transition-all hover:shadow-lg",
                  !access.allowed && "opacity-60"
                )}
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg">{cg.generator.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {cg.generator.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge 
                        className={cn(
                          "rounded-full",
                          access.allowed 
                            ? "bg-primary/15 text-primary" 
                            : "bg-destructive/15 text-destructive"
                        )}
                      >
                        {access.reason}
                      </Badge>
                    </div>

                    {/* Usage */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gerações</span>
                      <span className="text-sm font-mono">
                        {cg.credits_used}
                        {cg.credits_limit && `/${cg.credits_limit}`}
                      </span>
                    </div>

                    {/* Time restrictions if any */}
                    {cg.time_limit_start && cg.time_limit_end && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Horário
                        </span>
                        <span className="text-sm">
                          {cg.time_limit_start} - {cg.time_limit_end}
                        </span>
                      </div>
                    )}

                    {/* Weekdays if restricted */}
                    {cg.allowed_weekdays && cg.allowed_weekdays.length > 0 && cg.allowed_weekdays.length < 7 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Dias
                        </span>
                        <div className="flex gap-1">
                          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                            <span 
                              key={i}
                              className={cn(
                                "w-5 h-5 text-xs flex items-center justify-center rounded",
                                cg.allowed_weekdays.includes(i)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Credit cost */}
                    {client?.type === 'package' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Custo</span>
                        <span className="text-sm">1 crédito por geração</span>
                      </div>
                    )}
                  </div>

                  {/* Error details */}
                  {!access.allowed && access.details && (
                    <p className="text-xs text-muted-foreground mt-3 p-2 rounded-lg bg-muted/50">
                      {access.details}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button 
                    className={cn(
                      "w-full rounded-full",
                      access.allowed 
                        ? "bg-primary text-primary-foreground hover:brightness-105" 
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    disabled={!access.allowed}
                    onClick={() => navigate(`/client/generator/${cg.generator.slug}`)}
                  >
                    {access.allowed ? (
                      <>
                        Usar Agora
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      access.reason
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="soft-card border-0">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Wand2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl text-foreground mb-2">
              Nenhum gerador disponível
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Você ainda não tem geradores atribuídos à sua conta. 
              Entre em contato com o suporte para liberar geradores.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
