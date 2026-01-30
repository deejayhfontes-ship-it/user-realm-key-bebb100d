import { useState } from 'react';
import { AlertCircle, CheckCircle, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CobrancaPendente {
  id: string;
  cliente: {
    nome: string;
    email: string;
    whatsapp?: string;
  };
  pedido_id: string;
  protocolo: string;
  valor: number;
  dias_atraso: number;
  data_vencimento: string;
}

// Mock data - replace with real API call
const mockCobrancas: CobrancaPendente[] = [
  {
    id: '1',
    cliente: { nome: 'João Silva', email: 'joao@email.com', whatsapp: '+5535999999999' },
    pedido_id: '123',
    protocolo: 'PED-2025-00123',
    valor: 5000,
    dias_atraso: 3,
    data_vencimento: '2025-01-27',
  },
  {
    id: '2',
    cliente: { nome: 'Maria Santos', email: 'maria@email.com' },
    pedido_id: '124',
    protocolo: 'PED-2025-00124',
    valor: 2500,
    dias_atraso: 7,
    data_vencimento: '2025-01-23',
  },
  {
    id: '3',
    cliente: { nome: 'Carlos Lima', email: 'carlos@email.com', whatsapp: '+5535888888888' },
    pedido_id: '125',
    protocolo: 'PED-2025-00125',
    valor: 8000,
    dias_atraso: 1,
    data_vencimento: '2025-01-29',
  },
];

export function CobrancasCard() {
  const [cobrancas] = useState<CobrancaPendente[]>(mockCobrancas);
  const [selectedCobranca, setSelectedCobranca] = useState<CobrancaPendente | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [addJuros, setAddJuros] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendCobranca = async () => {
    if (!selectedCobranca) return;
    
    setIsSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setSelectedCobranca(null);
    
    toast({
      title: 'Cobrança enviada!',
      description: `Cobrança enviada para ${selectedCobranca.cliente.nome}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (cobrancas.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border min-h-[400px] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Cobranças Pendentes</h3>
            <p className="text-sm text-muted-foreground">Clientes com pagamento em atraso</p>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-emerald-500/30 mb-4" />
          <p className="font-medium text-foreground">Nenhuma cobrança pendente</p>
          <p className="text-sm text-muted-foreground">Todos os pagamentos em dia!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Cobranças Pendentes</h3>
              <p className="text-sm text-muted-foreground">
                {cobrancas.length} cliente{cobrancas.length !== 1 ? 's' : ''} em atraso
              </p>
            </div>
          </div>
        </div>

        {/* Cobrancas List */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-3">
            {cobrancas.map((cobranca) => (
              <div
                key={cobranca.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-destructive/5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {getInitials(cobranca.cliente.nome)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {cobranca.cliente.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{cobranca.protocolo}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(cobranca.valor)}
                  </p>
                  <Badge variant="destructive" className="text-xs">
                    {cobranca.dias_atraso} dia{cobranca.dias_atraso !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:bg-primary/10"
                  onClick={() => setSelectedCobranca(cobranca)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-border">
          <Link 
            to="/admin/financeiro/cobrancas" 
            className="text-sm text-primary hover:underline"
          >
            Ver todas →
          </Link>
        </div>
      </div>

      {/* Send Cobranca Modal */}
      <Dialog open={!!selectedCobranca} onOpenChange={() => setSelectedCobranca(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Cobrança</DialogTitle>
            <DialogDescription>
              Enviar cobrança para {selectedCobranca?.cliente.nome}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCobranca && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Pedido</p>
                <p className="font-medium">#{selectedCobranca.protocolo}</p>
                <p className="text-lg font-bold text-foreground mt-2">
                  {formatCurrency(selectedCobranca.valor)}
                </p>
                <Badge variant="destructive" className="mt-2">
                  {selectedCobranca.dias_atraso} dias em atraso
                </Badge>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Canais de envio</Label>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(!!checked)}
                  />
                  <Label htmlFor="email" className="text-sm font-normal">
                    Email ({selectedCobranca.cliente.email})
                  </Label>
                </div>

                {selectedCobranca.cliente.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="whatsapp"
                      checked={sendWhatsapp}
                      onCheckedChange={(checked) => setSendWhatsapp(!!checked)}
                    />
                    <Label htmlFor="whatsapp" className="text-sm font-normal">
                      WhatsApp ({selectedCobranca.cliente.whatsapp})
                    </Label>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Checkbox
                    id="juros"
                    checked={addJuros}
                    onCheckedChange={(checked) => setAddJuros(!!checked)}
                  />
                  <Label htmlFor="juros" className="text-sm font-normal">
                    Adicionar multa/juros automático
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCobranca(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendCobranca} 
              disabled={isSending || (!sendEmail && !sendWhatsapp)}
            >
              {isSending ? 'Enviando...' : 'Enviar Cobrança'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
