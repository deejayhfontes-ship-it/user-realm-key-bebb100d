import { useState } from 'react';
import { 
  Package, Plus, Eye, Edit2, XCircle, 
  Search, Calendar, User, FileText, Link as LinkIcon,
  Clock, CheckCircle, AlertCircle, Ban, Send, Copy,
  ExternalLink, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useEntregas, useRevokeEntrega, useSendEntrega } from '@/hooks/useEntregas';
import { NovaEntregaModal } from '@/components/admin/entregas/NovaEntregaModal';
import { EntregaDetailsDrawer } from '@/components/admin/entregas/EntregaDetailsDrawer';
import { STATUS_ENTREGA_LABELS, STATUS_ENTREGA_COLORS, type StatusEntrega } from '@/types/entrega';

export default function AdminEntregas() {
  const [filtros, setFiltros] = useState({
    status: 'todos',
    busca: ''
  });
  const [showModalNova, setShowModalNova] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data: entregas, isLoading } = useEntregas(filtros);
  const revokeMutation = useRevokeEntrega();
  const sendMutation = useSendEntrega();

  const getStatusIcon = (status: StatusEntrega) => {
    const icons = {
      rascunho: Edit2,
      pronto_envio: Clock,
      enviado: CheckCircle,
      expirado: AlertCircle,
      revogado: Ban,
    };
    return icons[status] || Edit2;
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  const handleRevoke = async () => {
    if (revokeId) {
      await revokeMutation.mutateAsync(revokeId);
      setRevokeId(null);
    }
  };

  const handleSend = async (id: string) => {
    await sendMutation.mutateAsync(id);
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Entregas</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gerencie todas as entregas de projetos
              </p>
            </div>

            <Button
              onClick={() => setShowModalNova(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Entrega
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Filtros */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por protocolo, cliente..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-9"
                />
              </div>

              <Select
                value={filtros.status}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="pronto_envio">Pronto para Envio</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="expirado">Expirado</SelectItem>
                  <SelectItem value="revogado">Revogado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Entregas */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-muted border-t-primary rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando entregas...</p>
              </div>
            ) : !entregas || entregas.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma entrega encontrada
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crie sua primeira entrega clicando no botão acima
                </p>
                <Button onClick={() => setShowModalNova(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Entrega
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Acessos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entregas.map((entrega) => {
                    const StatusIcon = getStatusIcon(entrega.status);
                    const isExpired = entrega.expira_em && new Date(entrega.expira_em) < new Date();
                    
                    return (
                      <TableRow key={entrega.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono font-semibold text-sm">
                              {entrega.protocolo}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {entrega.cliente_nome || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {entrega.servico_nome || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`gap-1.5 ${STATUS_ENTREGA_COLORS[entrega.status]}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {STATUS_ENTREGA_LABELS[entrega.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(entrega.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entrega.expira_em ? (
                            <span className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {format(new Date(entrega.expira_em), 'dd/MM/yyyy', { locale: ptBR })}
                              {isExpired && ' (expirado)'}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sem expiração</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{entrega.total_acessos}</span>
                            <Download className="w-4 h-4 text-muted-foreground ml-2" />
                            <span className="text-sm">{entrega.total_downloads}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedEntrega(entrega.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes</TooltipContent>
                            </Tooltip>

                            {entrega.link_acesso && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopyLink(entrega.link_acesso!)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copiar link</TooltipContent>
                              </Tooltip>
                            )}

                            {entrega.link_acesso && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(entrega.link_acesso!, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Abrir link</TooltipContent>
                              </Tooltip>
                            )}

                            {entrega.status === 'rascunho' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleSend(entrega.id)}
                                    disabled={sendMutation.isPending}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Enviar</TooltipContent>
                              </Tooltip>
                            )}

                            {entrega.status === 'enviado' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setRevokeId(entrega.id)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Revogar acesso</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>

      {/* Modal Nova Entrega */}
      <NovaEntregaModal
        open={showModalNova}
        onClose={() => setShowModalNova(false)}
      />

      {/* Drawer de Detalhes */}
      <EntregaDetailsDrawer
        entregaId={selectedEntrega}
        onClose={() => setSelectedEntrega(null)}
      />

      {/* Dialog de Confirmação de Revogação */}
      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar o acesso a esta entrega? 
              O cliente não poderá mais acessar os arquivos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
