import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Receipt, Download, CreditCard, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Payment {
  id: string;
  plan_id: string | null;
  gateway: string;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  next_billing_at: string | null;
  created_at: string;
  payment_plans?: { name: string } | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  processing: { label: 'Processando', variant: 'outline' },
  approved: { label: 'Pago', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
  refunded: { label: 'Reembolsado', variant: 'outline' },
};

const paymentMethodLabels: Record<string, string> = {
  pix: 'Pix',
  credit_card: 'Cartão de Crédito',
  boleto: 'Boleto',
  transfer: 'Transferência',
  cash: 'Dinheiro',
};

export default function ClientFaturas() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState<Payment | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPayments();
    }
  }, [user?.id]);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, payment_plans(name)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);

      // Check for active subscription
      const subscription = data?.find(
        (p) => p.status === 'approved' && p.next_billing_at && new Date(p.next_billing_at) > new Date()
      );
      setActiveSubscription(subscription || null);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error('Erro ao carregar histórico de pagamentos');
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

  const handleDownloadReceipt = (paymentId: string) => {
    // TODO: Implementar geração de PDF
    toast.info('Geração de comprovantes será implementada em breve');
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Minhas Faturas</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Histórico de pagamentos e assinaturas
        </p>
      </div>

      {/* Active Subscription Card */}
      {activeSubscription && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Assinatura Ativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">
                  {activeSubscription.payment_plans?.name || 'Plano Premium'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Renova automaticamente em{' '}
                  {activeSubscription.next_billing_at && 
                    format(new Date(activeSubscription.next_billing_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Alterar forma de pagamento
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Cancelar assinatura
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Histórico de Pagamentos
          </CardTitle>
          <CardDescription>
            Todas as suas transações e faturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Você ainda não possui faturas
              </h3>
              <p className="text-muted-foreground mb-6">
                Escolha um plano para começar a usar nossos geradores
              </p>
              <Link to="/platform">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ver Planos Disponíveis
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Comprovante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.payment_plans?.name || 'Pagamento avulso'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(payment.amount_cents)}
                    </TableCell>
                    <TableCell>
                      {paymentMethodLabels[payment.payment_method || ''] || payment.payment_method || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[payment.status]?.variant || 'secondary'}>
                        {statusConfig[payment.status]?.label || payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
