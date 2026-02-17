import { X, Users, Zap, Settings, Code } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Generator, useGeneratorDetails } from '@/hooks/useGenerators';
import { cn } from '@/lib/utils';

interface GeneratorDetailsDrawerProps {
  generator: Generator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (generator: Generator) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ready: { label: 'Pronto', className: 'bg-primary/15 text-primary' },
  development: { label: 'Desenvolvimento', className: 'bg-warning/15 text-warning' },
  disabled: { label: 'Desabilitado', className: 'bg-muted text-muted-foreground' }
};

const typeConfig: Record<string, { label: string; className: string }> = {
  stories: { label: 'Stories', className: 'bg-primary text-primary-foreground' },
  derivacoes: { label: 'Derivações IA', className: 'bg-accent text-accent-foreground' },
  carrossel: { label: 'Carrossel', className: 'bg-secondary text-secondary-foreground' },
  avisos: { label: 'Avisos', className: 'bg-muted text-muted-foreground' },
  outro: { label: 'Outro', className: 'bg-muted text-muted-foreground' }
};

export function GeneratorDetailsDrawer({ generator, open, onOpenChange, onEdit }: GeneratorDetailsDrawerProps) {
  const { data: details, isLoading } = useGeneratorDetails(generator?.id || null);

  const status = statusConfig[generator?.status || 'development'];
  const type = typeConfig[generator?.type || 'outro'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 border-0 soft-card-elevated rounded-l-3xl">
        <SheetHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-semibold">Detalhes do Gerador</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : details ? (
            <div className="p-6 space-y-6">
              {/* Header info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{details.name}</h2>
                  <p className="text-sm text-muted-foreground font-mono mt-1">/{details.slug}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge className={cn("rounded-full px-3 py-1 text-xs font-medium border-0", type.className)}>
                    {type.label}
                  </Badge>
                  <Badge className={cn("rounded-full px-3 py-1 text-xs font-medium border-0", status.className)}>
                    {status.label}
                  </Badge>
                </div>

                {details.description && (
                  <p className="text-sm text-muted-foreground">{details.description}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="soft-card-lime p-5 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{details.clients_using}</p>
                  <p className="text-xs opacity-70">Clientes usando</p>
                </div>
                <div className="soft-card-dark p-5 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{details.total_generations}</p>
                  <p className="text-xs opacity-70">Total gerações</p>
                </div>
              </div>

              {/* Clients list */}
              {details.clients.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Clientes com acesso
                  </h3>
                  <div className="space-y-2">
                    {details.clients.map((client) => (
                      <div
                        key={client.id}
                        className="p-3 rounded-2xl bg-muted/50 text-sm font-medium"
                      >
                        {client.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Config JSON */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </h3>
                <div className="p-4 rounded-2xl bg-secondary text-secondary-foreground">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide opacity-70">Config JSON</span>
                  </div>
                  <pre className="text-xs overflow-auto max-h-48 font-mono">
                    {JSON.stringify(details.config, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Criado em:</span>{' '}
                  {details.created_at ? format(new Date(details.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Atualizado em:</span>{' '}
                  {details.updated_at ? format(new Date(details.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => onEdit(details), 100);
                  }}
                  className="flex-1 rounded-full bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/20"
                >
                  Editar Gerador
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Gerador não encontrado
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
