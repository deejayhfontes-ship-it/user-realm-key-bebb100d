import { useState } from 'react';
import { Package, CheckCircle, Send, Mail, MessageCircle, Link2, Download } from 'lucide-react';
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

interface Arquivo {
  nome: string;
  url: string;
  tamanho: string;
}

interface EntregaPendente {
  pedido_id: string;
  protocolo: string;
  cliente: string;
  projeto: string;
  arquivos: Arquivo[];
  metodo_preferido: 'email' | 'drive' | 'whatsapp' | 'download';
}

// Mock data - replace with real API call
const mockEntregas: EntregaPendente[] = [
  {
    pedido_id: '123',
    protocolo: 'PED-2025-00123',
    cliente: 'João Silva',
    projeto: 'Logo + Identidade Visual',
    arquivos: [
      { nome: 'logo_final.png', url: '#', tamanho: '2.5 MB' },
      { nome: 'identidade_visual.pdf', url: '#', tamanho: '15 MB' },
    ],
    metodo_preferido: 'email',
  },
  {
    pedido_id: '124',
    protocolo: 'PED-2025-00124',
    cliente: 'Maria Santos',
    projeto: 'Artes para Redes Sociais',
    arquivos: [
      { nome: 'pack_instagram.zip', url: '#', tamanho: '45 MB' },
    ],
    metodo_preferido: 'drive',
  },
  {
    pedido_id: '125',
    protocolo: 'PED-2025-00125',
    cliente: 'Carlos Lima',
    projeto: 'Banner Web',
    arquivos: [
      { nome: 'banner_1920x600.jpg', url: '#', tamanho: '1.2 MB' },
    ],
    metodo_preferido: 'whatsapp',
  },
];

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
  const [entregas] = useState<EntregaPendente[]>(mockEntregas);
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaPendente | null>(null);
  const [metodo, setMetodo] = useState<string>('');
  const [mensagem, setMensagem] = useState('');
  const [marcarEntregue, setMarcarEntregue] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendEntrega = async () => {
    if (!selectedEntrega || !metodo) return;
    
    setIsSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setSelectedEntrega(null);
    setMetodo('');
    setMensagem('');
    
    toast({
      title: 'Entrega enviada!',
      description: `Arquivos enviados para ${selectedEntrega.cliente}`,
    });
  };

  if (entregas.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border min-h-[400px] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Entregas Pendentes</h3>
            <p className="text-sm text-muted-foreground">Projetos prontos para enviar</p>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <CheckCircle className="w-16 h-16 text-emerald-500/30 mb-4" />
          <p className="font-medium text-foreground">Nenhuma entrega pendente</p>
          <p className="text-sm text-muted-foreground">Todos os projetos entregues!</p>
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
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Entregas Pendentes</h3>
              <p className="text-sm text-muted-foreground">
                {entregas.length} projeto{entregas.length !== 1 ? 's' : ''} pronto{entregas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Entregas List */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-3">
            {entregas.map((entrega) => {
              const MetodoIcon = metodoIcons[entrega.metodo_preferido];
              
              return (
                <div
                  key={entrega.pedido_id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-orange-500/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {entrega.cliente}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entrega.projeto}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{entrega.protocolo}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 text-xs">
                      <MetodoIcon className="w-3 h-3 mr-1" />
                      {metodoLabels[entrega.metodo_preferido]}
                    </Badge>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      onClick={() => {
                        setSelectedEntrega(entrega);
                        setMetodo(entrega.metodo_preferido);
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="pt-4 mt-auto border-t border-border">
          <Link 
            to="/admin/entregas" 
            className="text-sm text-primary hover:underline"
          >
            Ver histórico →
          </Link>
        </div>
      </div>

      {/* Send Entrega Modal */}
      <Dialog open={!!selectedEntrega} onOpenChange={() => setSelectedEntrega(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Entrega</DialogTitle>
            <DialogDescription>
              Projeto: {selectedEntrega?.projeto}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntrega && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Arquivos ({selectedEntrega.arquivos.length})
                </p>
                <div className="space-y-2">
                  {selectedEntrega.arquivos.map((arquivo, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate">{arquivo.nome}</span>
                      <span className="text-muted-foreground">{arquivo.tamanho}</span>
                    </div>
                  ))}
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
