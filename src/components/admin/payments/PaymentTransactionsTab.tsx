import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Eye, CheckCircle, XCircle, RefreshCw, Receipt, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Payment {
  id: string;
  client_id: string | null;
  user_id: string | null;
  plan_id: string | null;
  gateway: string;
  external_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string;
  clients?: { name: string; email: string } | null;
  payment_plans?: { name: string } | null;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
}

interface Plan {
  id: string;
  name: string;
  price_cents: number;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  processing: { label: 'Processando', variant: 'outline' },
  approved: { label: 'Aprovado', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
  refunded: { label: 'Reembolsado', variant: 'outline' },
};

const gatewayColors: Record<string, string> = {
  stripe: 'bg-[#635BFF] text-white',
  mercado_pago: 'bg-[#009EE3] text-white',
  pagseguro: 'bg-[#41B54C] text-white',
  asaas: 'bg-[#0064CC] text-white',
  manual: 'bg-muted text-foreground',
};

export default function PaymentTransactionsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModal, setDetailsModal] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterGateway, setFilterGateway] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual payment form
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, clientsRes, plansRes] = await Promise.all([
        supabase
          .from('payments')
          .select('*, clients(name, email), payment_plans(name)')
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name, email').order('name'),
        supabase.from('payment_plans').select('id, name, price_cents').eq('is_active', true),
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (plansRes.error) throw plansRes.error;

      setPayments(paymentsRes.data || []);
      setClients(clientsRes.data || []);
      setPlans(plansRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const filteredPayments = payments.filter((p) => {
    if (filterGateway !== 'all' && p.gateway !== filterGateway) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchTerm) {
      const clientName = p.clients?.name?.toLowerCase() || '';
      const clientEmail = p.clients?.email?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      if (!clientName.includes(search) && !clientEmail.includes(search)) return false;
    }
    return true;
  });

  const handleManualPayment = async () => {
    if (!selectedClient || !amount) {
      toast.error('Selecione um cliente e informe o valor');
      return;
    }

    setSaving(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);

      // Create payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        client_id: selectedClient,
        plan_id: selectedPlan || null,
        gateway: 'manual',
        amount_cents: amountCents,
        status: 'approved',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
      });

      if (paymentError) throw paymentError;

      // Update client credits if a plan was selected
      if (selectedPlan) {
        const plan = plans.find((p) => p.id === selectedPlan);
        if (plan) {
          // Get plan credits
          const { data: planData } = await supabase
            .from('payment_plans')
            .select('credits_included')
            .eq('id', selectedPlan)
            .single();

          if (planData) {
            // Update client credits
            const { error: updateError } = await supabase
              .from('clients')
              .update({
                package_credits: planData.credits_included,
                package_credits_used: 0,
                status: 'active',
              })
              .eq('id', selectedClient);

            if (updateError) throw updateError;
          }
        }
      }

      toast.success('Pagamento registrado e créditos liberados!');
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const handleReleaseCredits = async (payment: Payment) => {
    if (!payment.plan_id || !payment.client_id) {
      toast.error('Pagamento sem plano ou cliente associado');
      return;
    }

    try {
      // Get plan credits
      const { data: planData } = await supabase
        .from('payment_plans')
        .select('credits_included')
        .eq('id', payment.plan_id)
        .single();

      if (!planData) {
        toast.error('Plano não encontrado');
        return;
      }

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'approved', paid_at: new Date().toISOString() })
        .eq('id', payment.id);

      // Update client credits
      await supabase
        .from('clients')
        .update({
          package_credits: planData.credits_included,
          package_credits_used: 0,
          status: 'active',
        })
        .eq('id', payment.client_id);

      toast.success('Créditos liberados com sucesso!');
      loadData();
      setDetailsModal(null);
    } catch (error) {
      console.error('Erro ao liberar créditos:', error);
      toast.error('Erro ao liberar créditos');
    }
  };

  const resetForm = () => {
    setSelectedClient('');
    setSelectedPlan('');
    setAmount('');
    setPaymentMethod('pix');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              Todas as transações do sistema
            </CardDescription>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Pagamento Manual
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterGateway} onValueChange={setFilterGateway}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Gateway" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                <SelectItem value="pagseguro">PagSeguro</SelectItem>
                <SelectItem value="asaas">Asaas</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.clients?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{payment.clients?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={gatewayColors[payment.gateway] || 'bg-muted'}>
                      {payment.gateway.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(payment.amount_cents)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[payment.status]?.variant || 'secondary'}>
                      {statusConfig[payment.status]?.label || payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDetailsModal(payment)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Pagamento Manual */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento Manual</DialogTitle>
            <DialogDescription>
              Registre um pagamento recebido por fora (Pix, transferência, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.email && `(${client.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plano (opcional)</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatPrice(plan.price_cents)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se selecionado, os créditos do plano serão liberados automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="97.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualPayment} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Registrar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>

          {detailsModal && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-mono text-xs">{detailsModal.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gateway</p>
                  <Badge className={gatewayColors[detailsModal.gateway]}>
                    {detailsModal.gateway}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{detailsModal.clients?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <p>{detailsModal.payment_plans?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-lg font-bold">{formatPrice(detailsModal.amount_cents)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[detailsModal.status]?.variant}>
                    {statusConfig[detailsModal.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forma de pagamento</p>
                  <p>{detailsModal.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p>{format(new Date(detailsModal.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
                {detailsModal.external_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">ID Externo</p>
                    <p className="font-mono text-xs">{detailsModal.external_id}</p>
                  </div>
                )}
                {detailsModal.failure_reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Motivo da falha</p>
                    <p className="text-destructive">{detailsModal.failure_reason}</p>
                  </div>
                )}
              </div>

              {detailsModal.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleReleaseCredits(detailsModal)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Liberar Créditos
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
