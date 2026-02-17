import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProposals } from '@/hooks/useProposals';
import { Proposal, ScopeItem, ProposalSettings, RecurrenceType } from '@/types/proposal';
import { downloadProposalPDF } from '@/lib/proposal-pdf';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Download,
  Edit,
  FileText,
  Settings,
  Sparkles,
  Loader2,
  GripVertical,
  Save,
  Copy,
} from 'lucide-react';

const Propostas = () => {
  const { proposals, settings, loading, createProposal, updateProposal, deleteProposal, saveSettings } = useProposals();

  const [activeTab, setActiveTab] = useState('list');
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    client_name: '',
    client_company: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    project_title: '',
    project_description: '',
    investment_value: 0,
    payment_conditions: '',
    estimated_days: 0,
    recurrence_type: 'once' as RecurrenceType,
    contract_period_months: 12,
    notes: '',
    validity_days: 15,
  });

  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [newScopeTitle, setNewScopeTitle] = useState('');
  const [newScopeDesc, setNewScopeDesc] = useState('');

  // Settings state
  const [settingsForm, setSettingsForm] = useState<Partial<ProposalSettings>>({
    company_name: '',
    company_document: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    logo_url: '',
    default_notes: '',
    default_payment_conditions: '',
    show_fontes_logo: true,
    show_criate_logo: true,
  });

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        company_name: settings.company_name || '',
        company_document: settings.company_document || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_website: settings.company_website || '',
        logo_url: settings.logo_url || '',
        default_notes: settings.default_notes || '',
        default_payment_conditions: settings.default_payment_conditions || '',
        show_fontes_logo: settings.show_fontes_logo ?? true,
        show_criate_logo: settings.show_criate_logo ?? true,
      });

      // Apply defaults to form
      if (!formData.notes && settings.default_notes) {
        setFormData(prev => ({ ...prev, notes: settings.default_notes || '' }));
      }
      if (!formData.payment_conditions && settings.default_payment_conditions) {
        setFormData(prev => ({ ...prev, payment_conditions: settings.default_payment_conditions || '' }));
      }
    }
  }, [settings]);

  const addScopeItem = () => {
    if (!newScopeTitle.trim()) return;
    
    setScopeItems([
      ...scopeItems,
      {
        id: crypto.randomUUID(),
        title: newScopeTitle.trim(),
        description: newScopeDesc.trim(),
      },
    ]);
    setNewScopeTitle('');
    setNewScopeDesc('');
  };

  const removeScopeItem = (id: string) => {
    setScopeItems(scopeItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (generatePdf = false) => {
    if (!formData.client_name || !formData.project_title) {
      toast.error('Preencha o nome do cliente e título do projeto');
      return;
    }

    const proposalData = {
      ...formData,
      scope_items: scopeItems,
      status: 'draft' as const,
      date: new Date().toISOString().split('T')[0],
    };

    let savedProposal: Proposal | null = null;

    if (editingProposal) {
      const success = await updateProposal(editingProposal.id, proposalData);
      if (success) {
        savedProposal = { ...editingProposal, ...proposalData } as Proposal;
      }
    } else {
      const result = await createProposal(proposalData);
      if (result) {
        savedProposal = {
          ...result,
          scope_items: proposalData.scope_items,
        } as Proposal;
      }
    }

    if (savedProposal && generatePdf) {
      await downloadProposalPDF(savedProposal, settings);
    }

    resetForm();
    setActiveTab('list');
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_company: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      project_title: '',
      project_description: '',
      investment_value: 0,
      payment_conditions: settings?.default_payment_conditions || '',
      estimated_days: 0,
      recurrence_type: 'once',
      contract_period_months: 12,
      notes: settings?.default_notes || '',
      validity_days: 15,
    });
    setScopeItems([]);
    setEditingProposal(null);
  };

  const handleEdit = (proposal: Proposal) => {
    setFormData({
      client_name: proposal.client_name,
      client_company: proposal.client_company || '',
      client_email: proposal.client_email || '',
      client_phone: proposal.client_phone || '',
      client_address: proposal.client_address || '',
      project_title: proposal.project_title,
      project_description: proposal.project_description || '',
      investment_value: Number(proposal.investment_value),
      payment_conditions: proposal.payment_conditions || '',
      estimated_days: proposal.estimated_days || 0,
      recurrence_type: proposal.recurrence_type || 'once',
      contract_period_months: proposal.contract_period_months || 12,
      notes: proposal.notes || '',
      validity_days: proposal.validity_days,
    });
    setScopeItems(proposal.scope_items || []);
    setEditingProposal(proposal);
    setActiveTab('new');
  };

  const handleDuplicate = (proposal: Proposal) => {
    setFormData({
      client_name: proposal.client_name,
      client_company: proposal.client_company || '',
      client_email: proposal.client_email || '',
      client_phone: proposal.client_phone || '',
      client_address: proposal.client_address || '',
      project_title: proposal.project_title + ' (Cópia)',
      project_description: proposal.project_description || '',
      investment_value: Number(proposal.investment_value),
      payment_conditions: proposal.payment_conditions || '',
      estimated_days: proposal.estimated_days || 0,
      recurrence_type: proposal.recurrence_type || 'once',
      contract_period_months: proposal.contract_period_months || 12,
      notes: proposal.notes || '',
      validity_days: proposal.validity_days,
    });
    setScopeItems(proposal.scope_items || []);
    setEditingProposal(null);
    setActiveTab('new');
    toast.info('Proposta duplicada! Edite e salve.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta proposta?')) return;
    await deleteProposal(id);
  };

  const handleDownloadPDF = async (proposal: Proposal) => {
    await downloadProposalPDF(proposal, settings);
  };

  const handleSaveSettings = async () => {
    await saveSettings(settingsForm);
    setShowSettings(false);
  };

  const handleStatusChange = async (proposal: Proposal, newStatus: string) => {
    await updateProposal(proposal.id, { status: newStatus as Proposal['status'] });
  };

  const getRecurrenceBadge = (type: RecurrenceType) => {
    switch (type) {
      case 'monthly':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">Mensal</span>;
      case 'yearly':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">Anual</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Projeto Único</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Aprovada</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Rejeitada</span>;
      case 'sent':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">Enviada</span>;
      case 'expired':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400">Expirada</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Rascunho</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Propostas Comerciais</h1>
          <p className="text-muted-foreground text-sm">Crie e gerencie propostas de contratos e serviços recorrentes</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Propostas ({proposals.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingProposal ? 'Editar' : 'Nova Proposta'}
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="mt-6">
          {proposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhuma proposta criada ainda.</p>
              <Button onClick={() => setActiveTab('new')} className="bg-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Proposta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map(proposal => (
                <Card key={proposal.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-sm font-mono text-primary">{proposal.proposal_number}</span>
                          {getStatusBadge(proposal.status)}
                          {getRecurrenceBadge(proposal.recurrence_type)}
                        </div>
                        <h3 className="font-semibold text-foreground truncate">{proposal.project_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {proposal.client_company || proposal.client_name}
                        </p>
                      </div>
                      <div className="text-right mr-4 shrink-0">
                        <p className="text-lg font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(proposal.investment_value))}
                          {proposal.recurrence_type === 'monthly' && <span className="text-xs font-normal">/mês</span>}
                          {proposal.recurrence_type === 'yearly' && <span className="text-xs font-normal">/ano</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(proposal.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingProposal(proposal)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Visualizar"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPDF(proposal)}
                          className="text-primary hover:bg-primary/10"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(proposal)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(proposal)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(proposal.id)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* New/Edit Tab */}
        <TabsContent value="new" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Client & Project */}
            <div className="space-y-6">
              {/* Client Info */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-primary">Dados do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Contato *</Label>
                      <Input
                        value={formData.client_name}
                        onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="Nome do contato"
                        className="bg-muted/50"
                      />
                    </div>
                    <div>
                      <Label>Empresa</Label>
                      <Input
                        value={formData.client_company}
                        onChange={e => setFormData({ ...formData, client_company: e.target.value })}
                        placeholder="Nome da empresa"
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={formData.client_email}
                        onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="email@exemplo.com"
                        className="bg-muted/50"
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={formData.client_phone}
                        onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Textarea
                      value={formData.client_address}
                      onChange={e => setFormData({ ...formData, client_address: e.target.value })}
                      placeholder="Endereço completo"
                      rows={2}
                      className="bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Project Info */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-primary">Projeto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Título do Projeto *</Label>
                    <Input
                      value={formData.project_title}
                      onChange={e => setFormData({ ...formData, project_title: e.target.value })}
                      placeholder="Ex: Gestão de Redes Sociais - 2026"
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Descrição do Objetivo</Label>
                    <Textarea
                      value={formData.project_description}
                      onChange={e => setFormData({ ...formData, project_description: e.target.value })}
                      placeholder="Descrição detalhada do projeto..."
                      rows={4}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label>Prazo Estimado (dias úteis)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_days || ''}
                      onChange={e => setFormData({ ...formData, estimated_days: Number(e.target.value) })}
                      placeholder="Ex: 15"
                      className="bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Scope & Investment */}
            <div className="space-y-6">
              {/* Scope Items */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-primary">Escopo dos Serviços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
                    <Input
                      value={newScopeTitle}
                      onChange={e => setNewScopeTitle(e.target.value)}
                      placeholder="Título do serviço (ex: Criação de Posts)"
                      className="bg-background"
                    />
                    <Textarea
                      value={newScopeDesc}
                      onChange={e => setNewScopeDesc(e.target.value)}
                      placeholder="Descrição detalhada (opcional)"
                      rows={2}
                      className="bg-background"
                    />
                    <Button
                      type="button"
                      onClick={addScopeItem}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>

                  {scopeItems.length > 0 && (
                    <div className="space-y-2">
                      {scopeItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeScopeItem(item.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Investment */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-primary">Investimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Valor (R$) *</Label>
                      <Input
                        type="number"
                        value={formData.investment_value || ''}
                        onChange={e => setFormData({ ...formData, investment_value: Number(e.target.value) })}
                        placeholder="0,00"
                        className="bg-muted/50 text-lg font-bold"
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={formData.recurrence_type}
                        onValueChange={(value: RecurrenceType) => setFormData({ ...formData, recurrence_type: value })}
                      >
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Projeto Único</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.recurrence_type !== 'once' && (
                    <div>
                      <Label>Vigência do Contrato</Label>
                      <Select
                        value={String(formData.contract_period_months)}
                        onValueChange={(value) => setFormData({ ...formData, contract_period_months: Number(value) })}
                      >
                        <SelectTrigger className="bg-muted/50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 meses</SelectItem>
                          <SelectItem value="6">6 meses</SelectItem>
                          <SelectItem value="12">1 ano (12 meses)</SelectItem>
                          <SelectItem value="24">2 anos (24 meses)</SelectItem>
                          <SelectItem value="36">3 anos (36 meses)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Condições de Pagamento</Label>
                    <Textarea
                      value={formData.payment_conditions}
                      onChange={e => setFormData({ ...formData, payment_conditions: e.target.value })}
                      placeholder={formData.recurrence_type === 'monthly' 
                        ? "Ex: Pagamento mensal via boleto até dia 10"
                        : "Ex: 50% na aprovação, 50% na entrega"
                      }
                      rows={2}
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Validade (dias)</Label>
                      <Input
                        type="number"
                        value={formData.validity_days}
                        onChange={e => setFormData({ ...formData, validity_days: Number(e.target.value) })}
                        className="bg-muted/50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={3}
                      className="bg-muted/50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleSubmit(false)}
                  variant="outline"
                  className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Salvar e Gerar PDF
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Proposal Modal */}
      <Dialog open={!!viewingProposal} onOpenChange={() => setViewingProposal(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewingProposal?.proposal_number}
            </DialogTitle>
          </DialogHeader>
          {viewingProposal && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(viewingProposal.status)}
                {getRecurrenceBadge(viewingProposal.recurrence_type)}
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-lg">{viewingProposal.project_title}</h3>
                {viewingProposal.project_description && (
                  <p className="text-muted-foreground mt-2">{viewingProposal.project_description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Cliente</Label>
                  <p className="font-medium">{viewingProposal.client_name}</p>
                  {viewingProposal.client_company && (
                    <p className="text-sm text-muted-foreground">{viewingProposal.client_company}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Investimento</Label>
                  <p className="font-bold text-xl text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingProposal.investment_value)}
                    {viewingProposal.recurrence_type === 'monthly' && '/mês'}
                    {viewingProposal.recurrence_type === 'yearly' && '/ano'}
                  </p>
                  {viewingProposal.contract_period_months && viewingProposal.recurrence_type !== 'once' && (
                    <p className="text-sm text-muted-foreground">Vigência: {viewingProposal.contract_period_months} meses</p>
                  )}
                </div>
              </div>

              {viewingProposal.scope_items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Escopo dos Serviços</Label>
                  <div className="mt-2 space-y-2">
                    {viewingProposal.scope_items.map((item, index) => (
                      <div key={item.id} className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-medium">{index + 1}. {item.title}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingProposal.payment_conditions && (
                <div>
                  <Label className="text-muted-foreground text-xs">Condições de Pagamento</Label>
                  <p className="mt-1">{viewingProposal.payment_conditions}</p>
                </div>
              )}

              {viewingProposal.notes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Observações</Label>
                  <p className="mt-1 text-muted-foreground">{viewingProposal.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => handleDownloadPDF(viewingProposal)}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Select
                  value={viewingProposal.status}
                  onValueChange={(value) => handleStatusChange(viewingProposal, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary">Configurações da Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome da Empresa</Label>
                <Input
                  value={settingsForm.company_name || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, company_name: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  value={settingsForm.company_document || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, company_document: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={settingsForm.company_address || ''}
                onChange={e => setSettingsForm({ ...settingsForm, company_address: e.target.value })}
                className="bg-muted/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefone</Label>
                <Input
                  value={settingsForm.company_phone || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, company_phone: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  value={settingsForm.company_email || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, company_email: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={settingsForm.company_website || ''}
                onChange={e => setSettingsForm({ ...settingsForm, company_website: e.target.value })}
                placeholder="www.seusite.com.br"
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label>Condições de Pagamento Padrão</Label>
              <Textarea
                value={settingsForm.default_payment_conditions || ''}
                onChange={e => setSettingsForm({ ...settingsForm, default_payment_conditions: e.target.value })}
                rows={2}
                className="bg-muted/50"
              />
            </div>
            <div>
              <Label>Observações Padrão</Label>
              <Textarea
                value={settingsForm.default_notes || ''}
                onChange={e => setSettingsForm({ ...settingsForm, default_notes: e.target.value })}
                rows={3}
                className="bg-muted/50"
              />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settingsForm.show_fontes_logo}
                  onCheckedChange={checked => setSettingsForm({ ...settingsForm, show_fontes_logo: checked })}
                />
                <Label>Logo Fontes Graphics</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settingsForm.show_criate_logo}
                  onCheckedChange={checked => setSettingsForm({ ...settingsForm, show_criate_logo: checked })}
                />
                <Label>Logo Criate</Label>
              </div>
            </div>
            <Button onClick={handleSaveSettings} className="w-full bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Propostas;
