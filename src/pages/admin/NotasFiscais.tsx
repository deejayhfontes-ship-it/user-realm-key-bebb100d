import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { 
  FileText, Plus, Trash2, Eye, Download, Loader2, Send, XCircle, 
  Search, Filter, AlertCircle, CheckCircle, Clock, FileX 
} from 'lucide-react';
import { useNotasFiscais } from '@/hooks/useNotasFiscais';
import { useNfeConfig } from '@/hooks/useNfeConfig';
import { useInvoices } from '@/hooks/useInvoices';
import { NotaFiscal, STATUS_NOTA, NotaFiscalFormData } from '@/types/nfe';
import { formatCurrency, maskCPFOrCNPJ, validateCPFOrCNPJ } from '@/lib/validators';
import { toast } from 'sonner';

const emptyFormData: NotaFiscalFormData = {
  tipo: 'NFSe',
  cliente_cpf_cnpj: '',
  cliente_nome: '',
  cliente_endereco: '',
  cliente_municipio: '',
  cliente_uf: '',
  cliente_email: '',
  natureza_operacao: 'Prestação de Serviços de Design',
  codigo_servico_municipio: '',
  descricao_servico: '',
  valor_servico: 0,
  valor_desconto: 0,
  issqn_aliquota: 5,
  issqn_retido: false,
};

export default function NotasFiscais() {
  const navigate = useNavigate();
  const { notas, isLoading, createNota, transmitirNota, cancelarNota, deleteNota } = useNotasFiscais();
  const { config, isConfigComplete } = useNfeConfig();
  const { invoices } = useInvoices();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState('');
  
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [formData, setFormData] = useState<NotaFiscalFormData>(emptyFormData);

  // Redirect if config not complete
  if (!isLoading && !isConfigComplete) {
    return (
      <div className="flex flex-col h-full">
        <AdminHeader 
          title="Notas Fiscais" 
          subtitle="Emissão e gestão de NF-e/NFS-e"
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <CardTitle>Configuração Incompleta</CardTitle>
              </div>
              <CardDescription>
                Complete os dados fiscais antes de emitir notas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin/settings')} className="w-full">
                Ir para Configurações
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredNotas = notas.filter((nota) => {
    const matchesSearch = 
      nota.numero.toString().includes(searchTerm) ||
      nota.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.cliente_cpf_cnpj.includes(searchTerm.replace(/\D/g, ''));
    
    const matchesStatus = statusFilter === 'all' || nota.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    
    if (invoiceId && invoiceId !== 'avulsa') {
      const invoice = invoices.find(i => i.id === invoiceId);
      if (invoice) {
        setFormData(prev => ({
          ...prev,
          invoice_id: invoice.id,
          cliente_nome: invoice.bill_to_name,
          cliente_endereco: invoice.bill_to_address || '',
          cliente_email: invoice.bill_to_email || '',
          valor_servico: invoice.total,
          descricao_servico: invoice.items.map(i => i.description).join('; '),
        }));
      }
    } else {
      setFormData(emptyFormData);
    }
    
    setWizardStep(2);
  };

  const handleFormChange = (field: keyof NotaFiscalFormData, value: string | number | boolean) => {
    if (field === 'cliente_cpf_cnpj') {
      setFormData(prev => ({ ...prev, [field]: maskCPFOrCNPJ(value as string) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateNota = async () => {
    if (!formData.cliente_cpf_cnpj || !validateCPFOrCNPJ(formData.cliente_cpf_cnpj)) {
      toast.error('CPF/CNPJ inválido');
      return;
    }
    if (!formData.cliente_nome) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    if (!formData.descricao_servico || formData.descricao_servico.length < 10) {
      toast.error('Descrição do serviço deve ter pelo menos 10 caracteres');
      return;
    }
    if (formData.valor_servico <= 0) {
      toast.error('Valor do serviço deve ser maior que zero');
      return;
    }

    await createNota.mutateAsync(formData);
    setIsNewModalOpen(false);
    setWizardStep(1);
    setFormData(emptyFormData);
    setSelectedInvoiceId('');
  };

  const handleTransmitir = async (nota: NotaFiscal) => {
    await transmitirNota.mutateAsync(nota.id);
  };

  const handleCancelar = async () => {
    if (!selectedNota || !cancelMotivo) {
      toast.error('Informe o motivo do cancelamento');
      return;
    }
    await cancelarNota.mutateAsync({ id: selectedNota.id, motivo: cancelMotivo });
    setIsCancelModalOpen(false);
    setCancelMotivo('');
    setSelectedNota(null);
  };

  const valorLiquido = formData.valor_servico - formData.valor_desconto;
  const issqnCalculado = Math.round((valorLiquido * formData.issqn_aliquota) / 100);

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Notas Fiscais" 
        subtitle="Emissão e gestão de NF-e/NFS-e"
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_NOTA).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Emitir Nova Nota
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNotas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma nota fiscal encontrada.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotas.map((nota) => {
                    const statusInfo = STATUS_NOTA[nota.status];
                    return (
                      <TableRow key={nota.id}>
                        <TableCell className="font-medium">
                          {nota.numero}/{nota.serie}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{nota.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.cliente_nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {maskCPFOrCNPJ(nota.cliente_cpf_cnpj)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(nota.valor_liquido)}
                        </TableCell>
                        <TableCell>
                          {new Date(nota.data_emissao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedNota(nota); setIsViewModalOpen(true); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {nota.status === 'digitacao' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTransmitir(nota)}
                                disabled={transmitirNota.isPending}
                              >
                                <Send className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            {(nota.status === 'autorizada' || nota.status === 'enviada') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setSelectedNota(nota); setIsCancelModalOpen(true); }}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                            {nota.pdf_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(nota.pdf_url!, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {nota.status === 'digitacao' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNota.mutate(nota.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Nova Nota - Wizard */}
      <Dialog open={isNewModalOpen} onOpenChange={(open) => { setIsNewModalOpen(open); if (!open) { setWizardStep(1); setFormData(emptyFormData); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emitir Nova Nota Fiscal</DialogTitle>
            <DialogDescription>Passo {wizardStep} de 3</DialogDescription>
          </DialogHeader>

          {/* Step 1 - Select Invoice */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Selecione uma fatura existente ou emissão avulsa:</p>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                <Button
                  variant={selectedInvoiceId === 'avulsa' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => handleSelectInvoice('avulsa')}
                >
                  <FileX className="h-4 w-4 mr-2" />
                  Emissão Avulsa (sem vínculo)
                </Button>
                {invoices.filter(i => i.status === 'paid' || i.status === 'pending').map((invoice) => (
                  <Button
                    key={invoice.id}
                    variant={selectedInvoiceId === invoice.id ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => handleSelectInvoice(invoice.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    #{invoice.invoice_number} - {invoice.bill_to_name} - {formatCurrency(invoice.total)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 - Client Data */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Dados do tomador (cliente):</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>CPF/CNPJ *</Label>
                  <Input
                    value={formData.cliente_cpf_cnpj}
                    onChange={(e) => handleFormChange('cliente_cpf_cnpj', e.target.value)}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome/Razão Social *</Label>
                  <Input
                    value={formData.cliente_nome}
                    onChange={(e) => handleFormChange('cliente_nome', e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.cliente_endereco}
                    onChange={(e) => handleFormChange('cliente_endereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Município</Label>
                  <Input
                    value={formData.cliente_municipio}
                    onChange={(e) => handleFormChange('cliente_municipio', e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input
                    value={formData.cliente_uf}
                    onChange={(e) => handleFormChange('cliente_uf', e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.cliente_email}
                    onChange={(e) => handleFormChange('cliente_email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setWizardStep(1)}>Voltar</Button>
                <Button onClick={() => setWizardStep(3)}>Próximo</Button>
              </div>
            </div>
          )}

          {/* Step 3 - Service Details */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Detalhes do serviço:</p>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Descrição do Serviço * (mín. 10 caracteres)</Label>
                  <Textarea
                    value={formData.descricao_servico}
                    onChange={(e) => handleFormChange('descricao_servico', e.target.value)}
                    placeholder="Descrição completa do serviço prestado..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Código Serviço Municipal</Label>
                    <Input
                      value={formData.codigo_servico_municipio}
                      onChange={(e) => handleFormChange('codigo_servico_municipio', e.target.value)}
                      placeholder="Código da lista da prefeitura"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Nota</Label>
                    <Select value={formData.tipo} onValueChange={(v) => handleFormChange('tipo', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NFSe">NFS-e (Serviços)</SelectItem>
                        <SelectItem value="NFe">NF-e (Produtos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Valor do Serviço (centavos) *</Label>
                    <Input
                      type="number"
                      value={formData.valor_servico}
                      onChange={(e) => handleFormChange('valor_servico', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">{formatCurrency(formData.valor_servico)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto (centavos)</Label>
                    <Input
                      type="number"
                      value={formData.valor_desconto}
                      onChange={(e) => handleFormChange('valor_desconto', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alíquota ISS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.issqn_aliquota}
                      onChange={(e) => handleFormChange('issqn_aliquota', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Resumo */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Valor do Serviço:</span>
                        <span>{formatCurrency(formData.valor_servico)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>(-) Desconto:</span>
                        <span>{formatCurrency(formData.valor_desconto)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Valor Líquido:</span>
                        <span>{formatCurrency(valorLiquido)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>ISS ({formData.issqn_aliquota}%):</span>
                        <span>{formatCurrency(issqnCalculado)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setWizardStep(2)}>Voltar</Button>
                <Button onClick={handleCreateNota} disabled={createNota.isPending}>
                  {createNota.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Gerar Nota
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Visualizar */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nota Fiscal {selectedNota?.numero}/{selectedNota?.serie}</DialogTitle>
          </DialogHeader>
          {selectedNota && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">{selectedNota.tipo}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={STATUS_NOTA[selectedNota.status].color}>
                    {STATUS_NOTA[selectedNota.status].label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{selectedNota.cliente_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPF/CNPJ:</span>
                  <span>{maskCPFOrCNPJ(selectedNota.cliente_cpf_cnpj)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(selectedNota.valor_liquido)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISS ({selectedNota.issqn_aliquota}%):</span>
                  <span>{formatCurrency(selectedNota.issqn_valor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emissão:</span>
                  <span>{new Date(selectedNota.data_emissao).toLocaleString('pt-BR')}</span>
                </div>
                {selectedNota.chave_acesso && (
                  <div>
                    <span className="text-muted-foreground">Chave de Acesso:</span>
                    <p className="font-mono text-xs break-all mt-1">{selectedNota.chave_acesso}</p>
                  </div>
                )}
                {selectedNota.motivo_status && (
                  <div>
                    <span className="text-muted-foreground">Motivo:</span>
                    <p className="text-sm mt-1">{selectedNota.motivo_status}</p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <span className="text-muted-foreground text-sm">Descrição do Serviço:</span>
                <p className="text-sm mt-1">{selectedNota.descricao_servico}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Cancelar */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Nota Fiscal</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento da nota {selectedNota?.numero}/{selectedNota?.serie}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo do Cancelamento *</Label>
              <Textarea
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                placeholder="Informe o motivo..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelar} disabled={cancelarNota.isPending}>
              {cancelarNota.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
