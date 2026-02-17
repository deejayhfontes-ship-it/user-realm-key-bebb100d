import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Wand2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Pencil,
  Ban,
  Unlock,
  Plus,
  Package,
  Link,
  Sparkles
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useClientDetails, Client } from '@/hooks/useClients';
import { cn } from '@/lib/utils';

interface ClientDetailsDrawerProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (client: Client) => void;
  onToggleBlock: (client: Client) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-primary/15 text-primary border-0' },
  inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground border-0' },
  blocked: { label: 'Bloqueado', className: 'bg-destructive/15 text-destructive border-0' },
  expired: { label: 'Expirado', className: 'bg-warning/15 text-warning border-0' }
};

const typeConfig: Record<string, { label: string; className: string }> = {
  fixed: { label: 'Fixo', className: 'bg-secondary text-secondary-foreground border-0' },
  package: { label: 'Pacote', className: 'bg-primary text-primary-foreground border-0' }
};

export function ClientDetailsDrawer({ 
  client, 
  open, 
  onOpenChange,
  onEdit,
  onToggleBlock
}: ClientDetailsDrawerProps) {
  const navigate = useNavigate();
  const { data: details, isLoading } = useClientDetails(client?.id || null);

  if (!client) return null;

  const status = statusConfig[client.status || 'inactive'];
  const type = typeConfig[client.type] || typeConfig.package;

  const formatCredits = () => {
    if (client.type === 'fixed') {
      if (client.monthly_credits) {
        return `${details?.total_credits_used || 0} / ${client.monthly_credits}`;
      }
      return 'Ilimitado';
    }
    return `${client.package_credits_used || 0} / ${client.package_credits || 0}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 border-0 bg-background">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <SheetTitle className="text-2xl font-semibold">{client.name}</SheetTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${type.className} rounded-full px-3 py-1 font-medium text-xs`}>
                    {type.label}
                  </Badge>
                  <Badge className={`${status.className} rounded-full px-3 py-1 font-medium text-xs`}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                {/* Contact Info */}
                <div className="soft-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informações de Contato</h3>
                  <div className="space-y-3">
                    {client.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                    {client.created_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Cliente desde </span>
                          <span className="text-sm font-medium">
                            {format(new Date(client.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="soft-card-lime p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="text-sm font-medium opacity-80">Créditos</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCredits()}</p>
                  </div>
                  <div className="soft-card-dark p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Wand2 className="w-5 h-5" />
                      <span className="text-sm font-medium opacity-80">Gerações</span>
                    </div>
                    <p className="text-2xl font-bold">{details?.total_generations || 0}</p>
                  </div>
                </div>

                {/* Generators */}
                <div className="soft-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Geradores Atribuídos</h3>
                  {details?.client_generators && details.client_generators.length > 0 ? (
                    <div className="space-y-2">
                      {details.client_generators.map((cg: any) => (
                        <div 
                          key={cg.id} 
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              cg.enabled ? "bg-primary/15" : "bg-muted"
                            )}>
                              <Wand2 className={cn(
                                "w-4 h-4",
                                cg.enabled ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            <span className="font-medium text-sm">{cg.generator_name}</span>
                          </div>
                          <div className="text-right">
                            {cg.credits_limit ? (
                              <span className="text-xs font-mono bg-card px-2 py-1 rounded-full">
                                {cg.credits_used || 0}/{cg.credits_limit}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sem limite</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum gerador atribuído</p>
                  )}

                  {/* Add new generator dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full border-dashed">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Novo Gerador
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      <DropdownMenuItem 
                        onClick={() => window.open('/admin/generators?tab=instalar', '_blank')}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Upload ZIP
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open('/admin/generators?tab=instalar', '_blank')}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Importar via URL
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open('/admin/generators?tab=editor', '_blank')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Criar com IA
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Recent Generations */}
                <div className="soft-card p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Histórico Recente</h3>
                  {details?.recent_generations && details.recent_generations.length > 0 ? (
                    <div className="space-y-2">
                      {details.recent_generations.map((gen: any) => (
                        <div 
                          key={gen.id} 
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            {gen.success ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className="font-medium text-sm">{gen.generator_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(gen.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma geração encontrada</p>
                  )}
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="soft-card p-5 space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Observações</h3>
                    <p className="text-sm">{client.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-border/50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(client);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline"
                className={cn(
                  "rounded-full",
                  client.status === 'blocked' 
                    ? "text-primary hover:text-primary" 
                    : "text-destructive hover:text-destructive"
                )}
                onClick={() => {
                  onOpenChange(false);
                  onToggleBlock(client);
                }}
              >
                {client.status === 'blocked' ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Desbloquear
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Bloquear
                  </>
                )}
              </Button>
            </div>
            <Button 
              className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
