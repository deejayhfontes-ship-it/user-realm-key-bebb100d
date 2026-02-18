import { useState, useMemo } from 'react';
import { Package, CheckCircle, Send, Mail, MessageCircle, Link2, Download, ArrowUpRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useEntregas } from '@/hooks/useEntregas';
import type { Entrega } from '@/types/entrega';

const metodoIcons = {
  email: Mail,
  drive: Link2,
  whatsapp: MessageCircle,
  download: Download,
};

const metodoLabels = {
  email: 'Email',
  drive: 'Google Drive',
  whatsapp: 'WhatsApp',
  download: 'Download direto',
};

export function EntregasCard() {
  const { data: allEntregas, isLoading } = useEntregas();

  // Filtrar apenas entregas pendentes (rascunho + pronto_envio)
  const entregas = useMemo(() => {
    if (!allEntregas) return [];
    return allEntregas.filter(
      e => e.status === 'rascunho' || e.status === 'pronto_envio'
    );
  }, [allEntregas]);

  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [metodo, setMetodo] = useState<string>('');
  const [mensagem, setMensagem] = useState('');
  const [marcarEntregue, setMarcarEntregue] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendEntrega = async () => {
    if (!selectedEntrega || !metodo) return;

    setIsSending(true);
    // Simulação — futuramente chamar useSendEntrega
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setSelectedEntrega(null);
    setMetodo('');
    setMensagem('');

    toast({
      title: 'Entrega enviada!',
      description: `Arquivos enviados para ${selectedEntrega.cliente_nome || 'o cliente'}`,
    });
  };

  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[200px] flex flex-col items-center justify-center"
        style={{ background: '#b5b9aa' }}
      >
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-3" />
        <p className="text-sm text-gray-700 font-medium">Carregando entregas...</p>
      </div>
    );
  }

  if (entregas.length === 0) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[200px] flex flex-col"
        style={{ background: '#b5b9aa' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Entregas Pendentes</h3>
            <p className="text-sm text-gray-600">Projetos prontos para enviar</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-500/30 mb-3" />
          <p className="font-medium text-gray-900">Nenhuma entrega pendente</p>
          <p className="text-sm text-gray-600">Todos os projetos entregues!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-[24px] p-7 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        style={{ background: '#b5b9aa' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">
                Entregas Pendentes
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {entregas.length} projeto{entregas.length !== 1 ? 's' : ''} pronto{entregas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Link
            to="/admin/entregas"
            className="w-10 h-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center transition-colors"
          >
            <ArrowUpRight className="w-5 h-5 text-gray-700" />
          </Link>
        </div>

        {/* Entregas list */}
        <div className="flex flex-col gap-3">
          {entregas.slice(0, 5).map((entrega) => {
            // Determinar ícone pelo tipo de entrega
            const preferido = entrega.tipo === 'link_externo' ? 'drive' : 'email';
            const MetodoIcon = metodoIcons[preferido as keyof typeof metodoIcons] || Mail;

            return (
              <div
                key={entrega.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 hover:bg-white/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#d5e636]/40 flex items-center justify-center">
                  <MetodoIcon className="w-5 h-5 text-gray-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {entrega.cliente_nome || 'Cliente'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {entrega.servico_nome || entrega.protocolo}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-[#d5e636]/30 text-gray-700"
                  onClick={() => {
                    setSelectedEntrega(entrega);
                    setMetodo(preferido);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
          {entregas.length > 5 && (
            <p className="text-xs text-gray-600 text-center mt-1">
              +{entregas.length - 5} entregas pendentes
            </p>
          )}
        </div>
      </div>

      {/* Send Entrega Modal */}
      <Dialog open={!!selectedEntrega} onOpenChange={() => setSelectedEntrega(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Entrega</DialogTitle>
            <DialogDescription>
              Projeto: {selectedEntrega?.servico_nome || selectedEntrega?.protocolo}
            </DialogDescription>
          </DialogHeader>

          {selectedEntrega && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Arquivos ({selectedEntrega.arquivos?.length || 0})
                </p>
                <div className="space-y-2">
                  {(selectedEntrega.arquivos || []).map((arquivo, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate">{arquivo.nome}</span>
                      <span className="text-muted-foreground">{arquivo.tamanho}</span>
                    </div>
                  ))}
                  {(!selectedEntrega.arquivos || selectedEntrega.arquivos.length === 0) && (
                    <p className="text-sm text-muted-foreground">Nenhum arquivo anexado</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Método de entrega</Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email (anexos)
                      </div>
                    </SelectItem>
                    <SelectItem value="drive">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Google Drive (link)
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp (link)
                      </div>
                    </SelectItem>
                    <SelectItem value="download">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download direto
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem (opcional)</Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Adicione uma mensagem personalizada..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Checkbox
                  id="marcar-entregue"
                  checked={marcarEntregue}
                  onCheckedChange={(checked) => setMarcarEntregue(!!checked)}
                />
                <Label htmlFor="marcar-entregue" className="text-sm font-normal">
                  Marcar pedido como entregue
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEntrega(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendEntrega}
              disabled={isSending || !metodo}
            >
              {isSending ? 'Enviando...' : 'Confirmar Entrega'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
