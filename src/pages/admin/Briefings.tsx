import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useBriefings, Briefing } from '@/hooks/useBriefings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Search, 
  Eye, 
  FileText, 
  Loader2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Paperclip,
  Receipt,
  FileSignature
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<Briefing['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; className: string }> = {
  novo: { label: 'Novo', variant: 'default', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  em_analise: { label: 'Em Análise', variant: 'secondary', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  orcamento_criado: { label: 'Orçamento Criado', variant: 'outline', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  proposta_criada: { label: 'Proposta Criada', variant: 'outline', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  aprovado: { label: 'Aprovado', variant: 'default', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  recusado: { label: 'Recusado', variant: 'destructive', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelado: { label: 'Cancelado', variant: 'secondary', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const PRIORIDADE_CONFIG: Record<Briefing['prioridade'], { label: string; className: string }> = {
  baixa: { label: 'Baixa', className: 'text-gray-400' },
  normal: { label: 'Normal', className: 'text-blue-400' },
  alta: { label: 'Alta', className: 'text-orange-400' },
  urgente: { label: 'Urgente', className: 'text-red-400' },
};

export default function AdminBriefings() {
  const navigate = useNavigate();
  const { briefings, isLoading, updateStatus, updateBriefing, deleteBriefing, isDeleting } = useBriefings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  // Filter briefings
  const filteredBriefings = briefings.filter(b => {
    const matchesSearch = searchTerm === '' || 
      b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    novos: briefings.filter(b => b.status === 'novo').length,
    emAnalise: briefings.filter(b => b.status === 'em_analise').length,
    urgentes: briefings.filter(b => b.prioridade === 'urgente').length,
    total: briefings.length,
  };

  const handleViewBriefing = (briefing: Briefing) => {
    setSelectedBriefing(briefing);
    setInternalNotes(briefing.notas_internas || '');
    setViewModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: Briefing['status']) => {
    updateStatus({ id, status: newStatus });
    if (selectedBriefing && selectedBriefing.id === id) {
      setSelectedBriefing({ ...selectedBriefing, status: newStatus });
    }
  };

  const handleSaveNotes = () => {
    if (selectedBriefing) {
      updateBriefing({ 
        id: selectedBriefing.id, 
        updates: { notas_internas: internalNotes } 
      });
      toast.success('Notas salvas!');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este briefing?')) {
      deleteBriefing(id);
    }
  };

  const handleCreateBudget = (briefing: Briefing) => {
    // Store briefing data in sessionStorage for pre-filling the budget form
    const budgetData = {
      fromBriefing: true,
      briefingId: briefing.id,
      clientName: briefing.nome,
      clientEmail: briefing.email,
      clientPhone: briefing.telefone,
      clientCompany: briefing.empresa,
      notes: `Briefing: ${briefing.tipo_projeto || 'Projeto'}\n\n${briefing.descricao}`,
    };
    sessionStorage.setItem('budgetPrefill', JSON.stringify(budgetData));
    
    // Update status to orcamento_criado
    updateStatus({ id: briefing.id, status: 'orcamento_criado' });
    
    setViewModalOpen(false);
    navigate('/admin/budgets');
    toast.success('Redirecionando para criar orçamento...');
  };

  const handleCreateProposal = (briefing: Briefing) => {
    // Store briefing data in sessionStorage for pre-filling the proposal form
    const proposalData = {
      fromBriefing: true,
      briefingId: briefing.id,
      clientName: briefing.nome,
      clientEmail: briefing.email,
      clientPhone: briefing.telefone,
      clientCompany: briefing.empresa,
      projectTitle: briefing.tipo_projeto || 'Novo Projeto',
      projectDescription: briefing.descricao,
      notes: briefing.referencias || '',
    };
    sessionStorage.setItem('proposalPrefill', JSON.stringify(proposalData));
    
    // Update status to proposta_criada
    updateStatus({ id: briefing.id, status: 'proposta_criada' });
    
    setViewModalOpen(false);
    navigate('/admin/propostas');
    toast.success('Redirecionando para criar proposta...');
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'arquivo';
      return decodeURIComponent(fileName);
    } catch {
      return url.split('/').pop() || 'arquivo';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Central de Pedidos" 
        subtitle="Gerenciar briefings e solicitações"
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border bg-blue-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.novos}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Análise</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.emAnalise}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgentes</p>
                  <p className="text-2xl font-bold text-red-400">{stats.urgentes}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="novo">Novos</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="orcamento_criado">Orçamento Criado</SelectItem>
                  <SelectItem value="proposta_criada">Proposta Criada</SelectItem>
                  <SelectItem value="aprovado">Aprovados</SelectItem>
                  <SelectItem value="recusado">Recusados</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Briefings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBriefings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum briefing encontrado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Anexos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBriefings.map((briefing) => (
                    <TableRow key={briefing.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(briefing.created_at), 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{briefing.nome}</p>
                          <p className="text-xs text-muted-foreground">{briefing.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{briefing.tipo_projeto || '-'}</TableCell>
                      <TableCell>{briefing.prazo || '-'}</TableCell>
                      <TableCell>
                        <span className={cn('text-sm font-medium', PRIORIDADE_CONFIG[briefing.prioridade].className)}>
                          {PRIORIDADE_CONFIG[briefing.prioridade].label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', STATUS_CONFIG[briefing.status].className)}>
                          {STATUS_CONFIG[briefing.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {briefing.arquivo_urls && briefing.arquivo_urls.length > 0 ? (
                          <div className="flex items-center gap-1 text-primary">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs">{briefing.arquivo_urls.length}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewBriefing(briefing)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCreateBudget(briefing)}
                            title="Criar Orçamento"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCreateProposal(briefing)}
                            title="Criar Proposta"
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            <FileSignature className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(briefing.id)}
                            disabled={isDeleting}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Briefing</DialogTitle>
            <DialogDescription>
              Recebido em {selectedBriefing && format(new Date(selectedBriefing.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedBriefing && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <p className="font-medium">{selectedBriefing.nome}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Empresa</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {selectedBriefing.empresa || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${selectedBriefing.email}`} className="text-primary hover:underline">
                      {selectedBriefing.email}
                    </a>
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Telefone</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedBriefing.telefone ? (
                      <a href={`tel:${selectedBriefing.telefone}`} className="text-primary hover:underline">
                        {selectedBriefing.telefone}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Tipo de Projeto</Label>
                    <p className="font-medium">{selectedBriefing.tipo_projeto || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Prazo</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {selectedBriefing.prazo || '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Descrição do Projeto</Label>
                  <div className="p-3 bg-secondary/50 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedBriefing.descricao}
                  </div>
                </div>

                {selectedBriefing.referencias && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Referências</Label>
                    <div className="p-3 bg-secondary/50 rounded-lg whitespace-pre-wrap text-sm">
                      {selectedBriefing.referencias}
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedBriefing.arquivo_urls && selectedBriefing.arquivo_urls.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label className="text-muted-foreground text-xs flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Arquivos Anexados ({selectedBriefing.arquivo_urls.length})
                  </Label>
                  <div className="space-y-2">
                    {selectedBriefing.arquivo_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg hover:bg-secondary/80 transition-colors group"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm flex-1 truncate">{getFileNameFromUrl(url)}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Control */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={selectedBriefing.status} 
                      onValueChange={(v) => handleStatusChange(selectedBriefing.id, v as Briefing['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="orcamento_criado">Orçamento Criado</SelectItem>
                        <SelectItem value="proposta_criada">Proposta Criada</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="recusado">Recusado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Badge className={cn('text-sm', PRIORIDADE_CONFIG[selectedBriefing.prioridade].className)}>
                      {PRIORIDADE_CONFIG[selectedBriefing.prioridade].label}
                    </Badge>
                  </div>
                </div>

                {/* Notas Internas */}
                <div className="space-y-2">
                  <Label>Notas Internas</Label>
                  <Textarea 
                    placeholder="Adicione notas internas sobre este briefing..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="min-h-20"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveNotes}
                    className="mt-2"
                  >
                    Salvar Notas
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleCreateBudget(selectedBriefing)}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Criar Orçamento
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleCreateProposal(selectedBriefing)}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  Criar Proposta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
