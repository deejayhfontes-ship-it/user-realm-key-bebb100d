<<<<<<< HEAD
import { useState } from 'react';
import { AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react';
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
import { usePedidos } from '@/hooks/usePedidos';

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

export function CobrancasCard() {
  const { data: pedidos, isLoading } = usePedidos();
  const [selectedCobranca, setSelectedCobranca] = useState<CobrancaPendente | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [addJuros, setAddJuros] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Mapear pedidos com status de cobrança pendente para a interface CobrancaPendente
  const cobrancas: CobrancaPendente[] = (pedidos || [])
    .filter(p =>
      p.status === 'aguardando_pagamento' ||
      p.status === 'aguardando_pagamento_final' ||
      p.status === 'orcamento_enviado'
    )
    .map(p => {
      const dataRef = p.data_orcamento || p.data_aprovacao || p.created_at;
      const diasAtraso = Math.max(0, Math.floor(
        (Date.now() - new Date(dataRef).getTime()) / (1000 * 60 * 60 * 24)
      ));

      return {
        id: p.id,
        cliente: {
          nome: p.clients?.name || p.nome,
          email: p.clients?.email || p.email,
          whatsapp: p.telefone || undefined,
        },
        pedido_id: p.id,
        protocolo: p.protocolo,
        valor: (p.valor_orcado || 0) / 100, // centavos → reais
        dias_atraso: diasAtraso,
        data_vencimento: dataRef,
      };
    })
    .sort((a, b) => b.dias_atraso - a.dias_atraso); // mais atrasados primeiro

  const handleSendCobranca = async () => {
    if (!selectedCobranca) return;

    setIsSending(true);
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

  const totalPendente = cobrancas.reduce((acc, c) => acc + c.valor, 0);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[340px] flex flex-col items-center justify-center"
        style={{ background: '#1a1a1a' }}
      >
        <Loader2 className="w-8 h-8 text-[#d5e636] animate-spin mb-3" />
        <p className="text-sm text-gray-400">Carregando cobranças...</p>
      </div>
    );
  }

  if (cobrancas.length === 0) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[340px] flex flex-col"
        style={{ background: '#1a1a1a' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Cobranças Pendentes</h3>
            <p className="text-sm text-gray-400">Clientes com pagamento em atraso</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-emerald-500/30 mb-4" />
          <p className="font-medium text-white">Nenhuma cobrança pendente</p>
          <p className="text-sm text-gray-400">Todos os pagamentos em dia!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-[24px] p-7 flex flex-col min-h-[340px] hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
        style={{ background: '#1a1a1a' }}
      >
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,60 C50,40 100,80 150,50 C200,20 250,70 300,40 C350,10 380,50 400,30 L400,100 L0,100 Z"
              fill="#d5e636"
            />
            <path
              d="M0,70 C60,50 120,90 180,60 C240,30 300,70 350,50 C370,40 390,55 400,45 L400,100 L0,100 Z"
              fill="#d5e636"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Cobranças Pendentes</h3>
              <p className="text-sm text-gray-400 font-medium">
                {cobrancas.length} cliente{cobrancas.length !== 1 ? 's' : ''} em atraso
              </p>
            </div>
          </div>
        </div>

        {/* Big Number — total pendente */}
        <div className="mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#d5e636] flex items-center justify-center">
              <span className="text-xl font-black text-gray-900">+{cobrancas.length}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">
                {formatCurrency(totalPendente)}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                Total em atraso
              </p>
            </div>
          </div>
        </div>

        {/* Cobrancas List */}
        <ScrollArea className="flex-1 -mx-2 px-2 relative z-10">
          <div className="space-y-2">
            {cobrancas.map((cobranca) => (
              <div
                key={cobranca.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#d5e636]/20 flex items-center justify-center text-xs font-bold text-[#d5e636]">
                  {getInitials(cobranca.cliente.nome)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {cobranca.cliente.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    #{cobranca.protocolo}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(cobranca.valor)}
                  </p>
                  {cobranca.dias_atraso > 0 && (
                    <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                      {cobranca.dias_atraso} dia{cobranca.dias_atraso !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#d5e636] hover:bg-[#d5e636]/10 rounded-full"
                  onClick={() => setSelectedCobranca(cobranca)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="pt-3 mt-auto relative z-10">
          <Link
            to="/admin/financeiro/cobrancas"
            className="text-sm font-semibold text-gray-400 hover:text-[#d5e636] transition-colors inline-flex items-center gap-1"
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
                {selectedCobranca.dias_atraso > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {selectedCobranca.dias_atraso} dias em atraso
                  </Badge>
                )}
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
=======
import { useState } from 'react';
import { AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react';
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
import { usePedidos } from '@/hooks/usePedidos';

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

export function CobrancasCard() {
  const { data: pedidos, isLoading } = usePedidos();
  const [selectedCobranca, setSelectedCobranca] = useState<CobrancaPendente | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [addJuros, setAddJuros] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Mapear pedidos com status de cobrança pendente para a interface CobrancaPendente
  const cobrancas: CobrancaPendente[] = (pedidos || [])
    .filter(p =>
      p.status === 'aguardando_pagamento' ||
      p.status === 'aguardando_pagamento_final' ||
      p.status === 'orcamento_enviado'
    )
    .map(p => {
      const dataRef = p.data_orcamento || p.data_aprovacao || p.created_at;
      const diasAtraso = Math.max(0, Math.floor(
        (Date.now() - new Date(dataRef).getTime()) / (1000 * 60 * 60 * 24)
      ));

      return {
        id: p.id,
        cliente: {
          nome: p.clients?.name || p.nome,
          email: p.clients?.email || p.email,
          whatsapp: p.telefone || undefined,
        },
        pedido_id: p.id,
        protocolo: p.protocolo,
        valor: (p.valor_orcado || 0) / 100, // centavos → reais
        dias_atraso: diasAtraso,
        data_vencimento: dataRef,
      };
    })
    .sort((a, b) => b.dias_atraso - a.dias_atraso); // mais atrasados primeiro

  const handleSendCobranca = async () => {
    if (!selectedCobranca) return;

    setIsSending(true);
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

  const totalPendente = cobrancas.reduce((acc, c) => acc + c.valor, 0);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[340px] flex flex-col items-center justify-center"
        style={{ background: '#1a1a1a' }}
      >
        <Loader2 className="w-8 h-8 text-[#d5e636] animate-spin mb-3" />
        <p className="text-sm text-gray-400">Carregando cobranças...</p>
      </div>
    );
  }

  if (cobrancas.length === 0) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[340px] flex flex-col"
        style={{ background: '#1a1a1a' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Cobranças Pendentes</h3>
            <p className="text-sm text-gray-400">Clientes com pagamento em atraso</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-emerald-500/30 mb-4" />
          <p className="font-medium text-white">Nenhuma cobrança pendente</p>
          <p className="text-sm text-gray-400">Todos os pagamentos em dia!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-[24px] p-7 flex flex-col min-h-[340px] hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
        style={{ background: '#1a1a1a' }}
      >
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,60 C50,40 100,80 150,50 C200,20 250,70 300,40 C350,10 380,50 400,30 L400,100 L0,100 Z"
              fill="#d5e636"
            />
            <path
              d="M0,70 C60,50 120,90 180,60 C240,30 300,70 350,50 C370,40 390,55 400,45 L400,100 L0,100 Z"
              fill="#d5e636"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Cobranças Pendentes</h3>
              <p className="text-sm text-gray-400 font-medium">
                {cobrancas.length} cliente{cobrancas.length !== 1 ? 's' : ''} em atraso
              </p>
            </div>
          </div>
        </div>

        {/* Big Number — total pendente */}
        <div className="mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#d5e636] flex items-center justify-center">
              <span className="text-xl font-black text-gray-900">+{cobrancas.length}</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">
                {formatCurrency(totalPendente)}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                Total em atraso
              </p>
            </div>
          </div>
        </div>

        {/* Cobrancas List */}
        <ScrollArea className="flex-1 -mx-2 px-2 relative z-10">
          <div className="space-y-2">
            {cobrancas.map((cobranca) => (
              <div
                key={cobranca.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#d5e636]/20 flex items-center justify-center text-xs font-bold text-[#d5e636]">
                  {getInitials(cobranca.cliente.nome)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {cobranca.cliente.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    #{cobranca.protocolo}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(cobranca.valor)}
                  </p>
                  {cobranca.dias_atraso > 0 && (
                    <span className="text-[10px] font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                      {cobranca.dias_atraso} dia{cobranca.dias_atraso !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#d5e636] hover:bg-[#d5e636]/10 rounded-full"
                  onClick={() => setSelectedCobranca(cobranca)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="pt-3 mt-auto relative z-10">
          <Link
            to="/admin/financeiro/cobrancas"
            className="text-sm font-semibold text-gray-400 hover:text-[#d5e636] transition-colors inline-flex items-center gap-1"
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
                {selectedCobranca.dias_atraso > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    {selectedCobranca.dias_atraso} dias em atraso
                  </Badge>
                )}
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
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
