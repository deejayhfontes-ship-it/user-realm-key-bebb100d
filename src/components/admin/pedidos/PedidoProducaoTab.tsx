import { useState } from "react";
import { Palette, Upload, Send, Check, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Pedido } from "@/types/pedido";
import { 
  useUpdatePedidoStatus, 
  useFinalizarConfeccao,
  useConfirmarPagamento 
} from "@/hooks/usePedidos";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PedidoProducaoTabProps {
  pedido: Pedido;
  onClose: () => void;
}

export function PedidoProducaoTab({ pedido, onClose }: PedidoProducaoTabProps) {
  const updateStatus = useUpdatePedidoStatus();
  const finalizarConfeccao = useFinalizarConfeccao();
  const confirmarPagamento = useConfirmarPagamento();
  
  const [arquivos, setArquivos] = useState<string[]>(pedido.arquivos_entregues || []);
  const [mensagem, setMensagem] = useState(pedido.mensagem_entrega || "");
  const [novoArquivo, setNovoArquivo] = useState("");

  const canStartProduction = [
    'pagamento_confirmado',
    'orcamento_aprovado',
  ].includes(pedido.status) || (
    ['faturamento', 'pos_entrega', 'sem_custo'].includes(pedido.tipo_pagamento) &&
    pedido.status === 'orcamento_aprovado'
  );

  const isInProduction = pedido.status === 'em_confeccao' || pedido.status === 'em_ajustes';
  const isWaitingClientApproval = pedido.status === 'aguardando_aprovacao_cliente';
  const isWaitingFinalPayment = pedido.status === 'aguardando_pagamento_final';
  const isFinished = pedido.status === 'finalizado';

  const prazoFinal = pedido.prazo_final ? new Date(pedido.prazo_final) : null;
  const diasRestantes = prazoFinal ? differenceInDays(prazoFinal, new Date()) : null;
  const progressPercent = prazoFinal && pedido.data_inicio_confeccao
    ? Math.min(100, Math.max(0, 
        (differenceInDays(new Date(), new Date(pedido.data_inicio_confeccao)) / 
         differenceInDays(prazoFinal, new Date(pedido.data_inicio_confeccao))) * 100
      ))
    : 0;

  const handleStartProduction = () => {
    const prazoFinal = pedido.prazo_orcado ? calculatePrazoFinal(pedido.prazo_orcado) : null;
    
    updateStatus.mutate({
      id: pedido.id,
      status: 'em_confeccao',
      extras: {
        data_inicio_confeccao: new Date().toISOString(),
        prazo_final: prazoFinal || undefined,
      },
    }, {
      onSuccess: () => onClose(),
    });
  };

  const handleSendPreview = () => {
    if (arquivos.length === 0) return;
    
    finalizarConfeccao.mutate({
      id: pedido.id,
      arquivos,
      mensagem,
    }, {
      onSuccess: () => onClose(),
    });
  };

  const handleAddFile = () => {
    if (novoArquivo.trim()) {
      setArquivos(prev => [...prev, novoArquivo.trim()]);
      setNovoArquivo("");
    }
  };

  const handleConfirmFinalPayment = () => {
    confirmarPagamento.mutate({ 
      id: pedido.id, 
      pedido,
      isFinal: true,
    }, {
      onSuccess: () => onClose(),
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  // Finished state
  if (isFinished) {
    return (
      <div className="space-y-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-500 mb-2">Projeto Finalizado</h3>
          <p className="text-muted-foreground">
            Entregue em {pedido.data_entrega && format(new Date(pedido.data_entrega), "dd/MM/yyyy", { locale: ptBR })}
          </p>
          
          {pedido.avaliacao_nota && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-sm text-muted-foreground">Avaliação do cliente</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < pedido.avaliacao_nota! ? "text-yellow-400" : "text-muted-foreground/30"}>
                    ★
                  </span>
                ))}
              </div>
              {pedido.avaliacao_comentario && (
                <p className="text-sm mt-2 italic">"{pedido.avaliacao_comentario}"</p>
              )}
            </div>
          )}
        </div>

        {/* Delivered files */}
        {pedido.arquivos_entregues && pedido.arquivos_entregues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos entregues</h4>
            <div className="space-y-2">
              {pedido.arquivos_entregues.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-sm truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Waiting final payment
  if (isWaitingFinalPayment) {
    const valorFinal = pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada
      ? pedido.valor_orcado! - pedido.valor_entrada
      : pedido.valor_orcado!;

    return (
      <div className="space-y-6">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-orange-500">Aguardando Pagamento Final</h3>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground">Valor a receber</p>
            <p className="text-2xl font-bold">{formatCurrency(valorFinal)}</p>
            {pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada && (
              <p className="text-sm text-muted-foreground">
                Entrada já paga: {formatCurrency(pedido.valor_entrada)}
              </p>
            )}
          </div>

          {pedido.comprovante_url && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400 mb-2">Comprovante enviado:</p>
              <a 
                href={pedido.comprovante_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Ver comprovante
              </a>
            </div>
          )}

          <Button 
            onClick={handleConfirmFinalPayment}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={confirmarPagamento.isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            {confirmarPagamento.isPending ? "Confirmando..." : "Confirmar Pagamento e Finalizar"}
          </Button>
        </div>
      </div>
    );
  }

  // Waiting client approval
  if (isWaitingClientApproval) {
    return (
      <div className="space-y-6">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-500" />
            <h3 className="font-semibold text-cyan-500">Aguardando Aprovação do Cliente</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            A prévia foi enviada. Aguardando feedback do cliente.
          </p>
        </div>

        {/* Show delivered files */}
        {pedido.arquivos_entregues && pedido.arquivos_entregues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos enviados</h4>
            <div className="space-y-2">
              {pedido.arquivos_entregues.map((url, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm truncate">
                  {url}
                </div>
              ))}
            </div>
          </div>
        )}

        {pedido.mensagem_entrega && (
          <div className="space-y-2">
            <h4 className="font-medium">Mensagem enviada</h4>
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              {pedido.mensagem_entrega}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Can start or in production
  if (canStartProduction && !isInProduction) {
    return (
      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
          <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pronto para iniciar</h3>
          <p className="text-muted-foreground mb-4">
            O pagamento foi confirmado. Inicie a produção do projeto.
          </p>
          <Button 
            onClick={handleStartProduction}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? "Iniciando..." : "Iniciar Produção"}
          </Button>
        </div>
      </div>
    );
  }

  // In production
  if (isInProduction) {
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-purple-500">Em Produção</h3>
            </div>
            {pedido.status === 'em_ajustes' && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Ajustes solicitados
              </Badge>
            )}
          </div>

          {prazoFinal && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Prazo final: {format(prazoFinal, "dd/MM/yyyy", { locale: ptBR })}</span>
                <span className={diasRestantes! < 0 ? "text-red-400" : diasRestantes! <= 2 ? "text-yellow-400" : ""}>
                  {diasRestantes! < 0 
                    ? `${Math.abs(diasRestantes!)} dias atrasado` 
                    : `${diasRestantes} dias restantes`
                  }
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </div>

        {/* File upload */}
        <div className="space-y-4">
          <h4 className="font-semibold">Enviar prévia/entrega</h4>
          
          <div className="space-y-2">
            <Label>URLs dos arquivos</Label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={novoArquivo}
                onChange={(e) => setNovoArquivo(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border bg-background"
              />
              <Button variant="outline" onClick={handleAddFile}>
                Adicionar
              </Button>
            </div>
            
            {arquivos.length > 0 && (
              <div className="space-y-2 mt-2">
                {arquivos.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setArquivos(prev => prev.filter((_, i) => i !== idx))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mensagem para o cliente</Label>
            <Textarea
              placeholder="Olá! Segue a prévia do seu projeto..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleSendPreview}
            disabled={arquivos.length === 0 || finalizarConfeccao.isPending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {finalizarConfeccao.isPending ? "Enviando..." : "Enviar para aprovação"}
          </Button>
        </div>
      </div>
    );
  }

  // Not ready for production yet
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aguardando</h3>
        <p className="text-muted-foreground">
          A produção iniciará após a aprovação e pagamento do orçamento.
        </p>
      </div>
    </div>
  );
}

// Helper
function calculatePrazoFinal(diasUteis: number): string {
  const date = new Date();
  let count = 0;
  
  while (count < diasUteis) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  
  return date.toISOString().split('T')[0];
}
