import { useState, useEffect } from 'react';
import { X, Search, Upload, Link as LinkIcon, Send, Save, FileText, User, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { usePedidos } from '@/hooks/usePedidos';
import { useCreateEntrega } from '@/hooks/useEntregas';
import { cn } from '@/lib/utils';
import type { TipoEntrega, ArquivoEntrega } from '@/types/entrega';

interface NovaEntregaModalProps {
  open: boolean;
  onClose: () => void;
  pedidoId?: string;
}

export function NovaEntregaModal({ open, onClose, pedidoId }: NovaEntregaModalProps) {
  const [step, setStep] = useState(pedidoId ? 2 : 1);
  const [busca, setBusca] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    tipo: 'upload' as TipoEntrega,
    arquivos: [] as ArquivoEntrega[],
    link_externo: '',
    mensagem: '',
    dias_validade: 30
  });

  const { data: pedidos, isLoading: loadingPedidos } = usePedidos({ 
    status: 'finalizado',
    search: busca 
  });
  
  const createMutation = useCreateEntrega();

  // Se um pedidoId foi fornecido, buscar o pedido
  useEffect(() => {
    if (pedidoId && pedidos) {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (pedido) {
        setPedidoSelecionado(pedido);
        setStep(2);
      }
    }
  }, [pedidoId, pedidos]);

  const handleSelectPedido = (pedido: any) => {
    setPedidoSelecionado(pedido);
    setStep(2);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Simular upload - em produção, fazer upload real para storage
    const newFiles: ArquivoEntrega[] = Array.from(files).map(file => ({
      nome: file.name,
      url: URL.createObjectURL(file), // Temporário - substituir por URL real após upload
      tamanho: formatBytes(file.size),
      tipo: file.type
    }));

    setFormData(prev => ({
      ...prev,
      arquivos: [...prev.arquivos, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      arquivos: prev.arquivos.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (enviar: boolean) => {
    if (!pedidoSelecionado) return;

    await createMutation.mutateAsync({
      pedido_id: pedidoSelecionado.id,
      protocolo: pedidoSelecionado.protocolo,
      cliente_id: pedidoSelecionado.client_id,
      cliente_nome: pedidoSelecionado.nome,
      cliente_email: pedidoSelecionado.email,
      cliente_whatsapp: pedidoSelecionado.telefone,
      servico_nome: pedidoSelecionado.services?.title,
      tipo: formData.tipo,
      arquivos: formData.arquivos,
      link_externo: formData.link_externo || undefined,
      mensagem: formData.mensagem || undefined,
      dias_validade: formData.dias_validade,
      enviar
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setPedidoSelecionado(null);
    setBusca('');
    setFormData({
      tipo: 'upload',
      arquivos: [],
      link_externo: '',
      mensagem: '',
      dias_validade: 30
    });
    onClose();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const canSave = formData.tipo === 'link_externo' 
    ? !!formData.link_externo 
    : formData.arquivos.length > 0 || !!formData.link_externo;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && !pedidoId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep(1)}
                className="h-6 w-6"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            Nova Entrega
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {step === 1 ? (
            // STEP 1: Selecionar Pedido
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por protocolo ou cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {loadingPedidos ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando pedidos...
                  </div>
                ) : !pedidos || pedidos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pedido finalizado encontrado
                  </div>
                ) : (
                  pedidos.map((pedido) => (
                    <button
                      key={pedido.id}
                      onClick={() => handleSelectPedido(pedido)}
                      className="w-full p-4 border border-border rounded-xl hover:border-primary hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono font-semibold text-sm mb-1">
                            {pedido.protocolo}
                          </p>
                          <div className="flex items-center gap-2 text-foreground">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{pedido.nome}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pedido.services?.title || 'Serviço não especificado'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            // STEP 2: Configurar Entrega
            <div className="space-y-6">
              {/* Info do Pedido */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-semibold text-primary">
                    {pedidoSelecionado?.protocolo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{pedidoSelecionado?.nome}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Projeto</p>
                    <p className="font-medium">{pedidoSelecionado?.services?.title || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{pedidoSelecionado?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{pedidoSelecionado?.telefone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tipo de Entrega */}
              <div className="space-y-3">
                <Label>Tipo de Entrega</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'upload', label: 'Upload de Arquivos', icon: Upload },
                    { value: 'link_externo', label: 'Link Externo', icon: LinkIcon },
                    { value: 'upload_link', label: 'Upload + Link', icon: Upload }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFormData(prev => ({ ...prev, tipo: value as TipoEntrega }))}
                      className={cn(
                        "p-4 border-2 rounded-xl transition-all",
                        formData.tipo === value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium text-center">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload de Arquivos */}
              {(formData.tipo === 'upload' || formData.tipo === 'upload_link') && (
                <div className="space-y-3">
                  <Label>Arquivos</Label>
                  
                  {formData.arquivos.length > 0 && (
                    <div className="space-y-2">
                      {formData.arquivos.map((arquivo, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{arquivo.nome}</p>
                              <p className="text-xs text-muted-foreground">{arquivo.tamanho}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(idx)}
                            className="h-8 w-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        Clique para selecionar arquivos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ou arraste e solte aqui
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Link Externo */}
              {(formData.tipo === 'link_externo' || formData.tipo === 'upload_link') && (
                <div className="space-y-2">
                  <Label>Link Externo (Google Drive, Dropbox, etc)</Label>
                  <Input
                    type="url"
                    value={formData.link_externo}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_externo: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              )}

              {/* Validade */}
              <div className="space-y-2">
                <Label>Validade do Link</Label>
                <Select
                  value={String(formData.dias_validade)}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dias_validade: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="0">Sem expiração</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensagem Personalizada */}
              <div className="space-y-2">
                <Label>Mensagem Personalizada (opcional)</Label>
                <Textarea
                  value={formData.mensagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                  rows={4}
                  placeholder="Ex: Olá! Segue o material final do seu projeto. Qualquer dúvida, estamos à disposição!"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={!canSave || createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>

            <Button
              onClick={() => handleSave(true)}
              disabled={!canSave || createMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {createMutation.isPending ? 'Enviando...' : 'Enviar Entrega'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
