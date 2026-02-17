import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, Copy, ExternalLink, FileText, User, Calendar, 
  Clock, Eye, Download, Send, Ban, CheckCircle, Link as LinkIcon 
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

import { useEntrega, useSendEntrega, useRevokeEntrega } from '@/hooks/useEntregas';
import { STATUS_ENTREGA_LABELS, STATUS_ENTREGA_COLORS } from '@/types/entrega';

interface EntregaDetailsDrawerProps {
  entregaId: string | null;
  onClose: () => void;
}

export function EntregaDetailsDrawer({ entregaId, onClose }: EntregaDetailsDrawerProps) {
  const { data: entrega, isLoading } = useEntrega(entregaId || undefined);
  const sendMutation = useSendEntrega();
  const revokeMutation = useRevokeEntrega();

  const handleCopyLink = () => {
    if (entrega?.link_acesso) {
      navigator.clipboard.writeText(entrega.link_acesso);
      toast.success('Link copiado!');
    }
  };

  const handleSend = async () => {
    if (entrega) {
      await sendMutation.mutateAsync(entrega.id);
    }
  };

  const handleRevoke = async () => {
    if (entrega) {
      await revokeMutation.mutateAsync(entrega.id);
    }
  };

  return (
    <Sheet open={!!entregaId} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detalhes da Entrega
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-muted border-t-primary rounded-full" />
          </div>
        ) : entrega ? (
          <div className="mt-6 space-y-6">
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-primary">
                  {entrega.protocolo}
                </span>
                <Badge className={STATUS_ENTREGA_COLORS[entrega.status]}>
                  {STATUS_ENTREGA_LABELS[entrega.status]}
                </Badge>
              </div>

              {/* Link de Acesso */}
              {entrega.link_acesso && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Link de Acesso</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={entrega.link_acesso}
                      readOnly
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open(entrega.link_acesso!, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Cliente */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-medium">{entrega.cliente_nome || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{entrega.cliente_email || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{entrega.cliente_whatsapp || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projeto</p>
                  <p className="font-medium">{entrega.servico_nome || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Arquivos */}
            {entrega.arquivos && entrega.arquivos.length > 0 && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Arquivos ({entrega.arquivos.length})
                  </h4>
                  <div className="space-y-2">
                    {entrega.arquivos.map((arquivo, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{arquivo.nome}</p>
                            <p className="text-xs text-muted-foreground">{arquivo.tamanho}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(arquivo.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Link Externo */}
            {entrega.link_externo && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Link Externo
                  </h4>
                  <a 
                    href={entrega.link_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {entrega.link_externo}
                  </a>
                </div>
                <Separator />
              </>
            )}

            {/* Estatísticas */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Estatísticas
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{entrega.total_acessos}</div>
                  <div className="text-xs text-muted-foreground">Acessos</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{entrega.total_downloads}</div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{entrega.dias_validade}</div>
                  <div className="text-xs text-muted-foreground">Dias Validade</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Datas */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Datas
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(entrega.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {entrega.data_envio && (
                  <div>
                    <p className="text-muted-foreground">Enviado em</p>
                    <p className="font-medium">
                      {format(new Date(entrega.data_envio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {entrega.expira_em && (
                  <div>
                    <p className="text-muted-foreground">Expira em</p>
                    <p className="font-medium">
                      {format(new Date(entrega.expira_em), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}
                {entrega.ultimo_acesso && (
                  <div>
                    <p className="text-muted-foreground">Último acesso</p>
                    <p className="font-medium">
                      {format(new Date(entrega.ultimo_acesso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagem */}
            {entrega.mensagem && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold">Mensagem</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {entrega.mensagem}
                  </p>
                </div>
              </>
            )}

            {/* Ações */}
            <div className="pt-4 space-y-3">
              {entrega.status === 'rascunho' && (
                <Button 
                  className="w-full" 
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Entrega
                </Button>
              )}
              
              {entrega.status === 'enviado' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleRevoke}
                  disabled={revokeMutation.isPending}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Revogar Acesso
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Entrega não encontrada
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
