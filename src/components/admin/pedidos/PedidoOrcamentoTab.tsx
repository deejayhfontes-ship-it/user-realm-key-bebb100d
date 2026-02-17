import { useState, useEffect } from "react";
import { CreditCard, Clock, FileText, Info, AlertTriangle, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import type { Pedido, TipoPagamento, OrcamentoData } from "@/types/pedido";
import { TIPO_PAGAMENTO_LABELS, TIPO_PAGAMENTO_COLORS } from "@/types/pedido";
import { useSendOrcamento, useConfirmarPagamento } from "@/hooks/usePedidos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PedidoOrcamentoTabProps {
  pedido: Pedido;
  onClose: () => void;
}

const PAYMENT_OPTIONS: {
  value: TipoPagamento;
  label: string;
  subtitle: string;
  requiresUpfront: boolean;
}[] = [
  {
    value: "antecipado",
    label: "Pagamento antecipado obrigatório",
    subtitle: "Cliente precisa pagar antes de iniciar o trabalho",
    requiresUpfront: true,
  },
  {
    value: "faturamento",
    label: "Faturamento / Crédito aprovado",
    subtitle: "Cliente tem crédito aprovado, fatura enviada após entrega",
    requiresUpfront: false,
  },
  {
    value: "pos_entrega",
    label: "Pagamento após entrega",
    subtitle: "Cliente paga após receber e aprovar o trabalho",
    requiresUpfront: false,
  },
  {
    value: "parcelado",
    label: "Pagamento parcelado",
    subtitle: "Parte antecipada, parte após entrega",
    requiresUpfront: true,
  },
  {
    value: "sem_custo",
    label: "Sem custo",
    subtitle: "Cortesia, trabalho de teste, parceria",
    requiresUpfront: false,
  },
];

export function PedidoOrcamentoTab({ pedido, onClose }: PedidoOrcamentoTabProps) {
  const sendOrcamento = useSendOrcamento();
  const confirmarPagamento = useConfirmarPagamento();

  const [formData, setFormData] = useState<{
    valor: string;
    prazo: string;
    observacoes: string;
    tipoPagamento: TipoPagamento;
    valorEntrada: string;
    condicaoPagamento: string;
  }>({
    valor: pedido.valor_orcado ? (pedido.valor_orcado / 100).toFixed(2) : "",
    prazo: pedido.prazo_orcado?.toString() || "",
    observacoes: pedido.observacoes_admin || "",
    tipoPagamento: pedido.tipo_pagamento || "antecipado",
    valorEntrada: pedido.valor_entrada ? (pedido.valor_entrada / 100).toFixed(2) : "",
    condicaoPagamento: pedido.condicao_pagamento || "",
  });

  const hasExistingOrcamento = !!pedido.valor_orcado;
  const isWaitingPayment = pedido.status === 'aguardando_pagamento';
  const isWaitingApproval = pedido.status === 'orcamento_enviado';
  const isApproved = ['orcamento_aprovado', 'pagamento_confirmado', 'em_confeccao', 'aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 'finalizado'].includes(pedido.status);

  const selectedOption = PAYMENT_OPTIONS.find(o => o.value === formData.tipoPagamento);
  const saldoRestante = formData.tipoPagamento === 'parcelado' && formData.valor && formData.valorEntrada
    ? parseFloat(formData.valor) - parseFloat(formData.valorEntrada || '0')
    : 0;

  const handleSubmit = () => {
    const data: OrcamentoData = {
      valor_orcado: parseFloat(formData.valor),
      prazo_orcado: parseInt(formData.prazo),
      observacoes_admin: formData.observacoes || undefined,
      requer_pagamento_antecipado: selectedOption?.requiresUpfront || false,
      tipo_pagamento: formData.tipoPagamento,
      valor_entrada: formData.tipoPagamento === 'parcelado' && formData.valorEntrada
        ? parseFloat(formData.valorEntrada)
        : undefined,
      condicao_pagamento: formData.tipoPagamento === 'faturamento' && formData.condicaoPagamento
        ? formData.condicaoPagamento
        : undefined,
    };

    sendOrcamento.mutate({ id: pedido.id, data }, {
      onSuccess: () => onClose(),
    });
  };

  const handleConfirmPayment = () => {
    confirmarPagamento.mutate({ id: pedido.id, pedido }, {
      onSuccess: () => onClose(),
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  // Show existing quote card if approved
  if (isApproved && hasExistingOrcamento) {
    return (
      <div className="space-y-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-green-500">Orçamento Aprovado</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-2xl font-bold">{formatCurrency(pedido.valor_orcado!)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-lg font-medium">{pedido.prazo_orcado} dias úteis</p>
            </div>
          </div>

          <Badge className={TIPO_PAGAMENTO_COLORS[pedido.tipo_pagamento]}>
            {TIPO_PAGAMENTO_LABELS[pedido.tipo_pagamento]}
          </Badge>

          {pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada && (
            <div className="mt-4 text-sm">
              <p>Entrada: {formatCurrency(pedido.valor_entrada)}</p>
              <p>Saldo: {formatCurrency(pedido.valor_orcado! - pedido.valor_entrada)}</p>
            </div>
          )}

          {pedido.observacoes_admin && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Observações</p>
              <p className="text-sm">{pedido.observacoes_admin}</p>
            </div>
          )}

          {pedido.data_aprovacao && (
            <p className="text-xs text-muted-foreground mt-4">
              Aprovado em {format(new Date(pedido.data_aprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show waiting payment state
  if (isWaitingPayment) {
    return (
      <div className="space-y-6">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-orange-500">Aguardando Pagamento</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {pedido.tipo_pagamento === 'parcelado' ? 'Valor da Entrada' : 'Valor Total'}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(pedido.tipo_pagamento === 'parcelado' ? pedido.valor_entrada! : pedido.valor_orcado!)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-lg font-medium">{pedido.prazo_orcado} dias úteis</p>
            </div>
          </div>

          {pedido.comprovante_url && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400 mb-2">Comprovante enviado pelo cliente:</p>
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
            onClick={handleConfirmPayment}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={confirmarPagamento.isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            {confirmarPagamento.isPending ? "Confirmando..." : "Confirmar Pagamento Recebido"}
          </Button>
        </div>
      </div>
    );
  }

  // Show form
  return (
    <div className="space-y-6">
      {/* Existing quote card */}
      {hasExistingOrcamento && isWaitingApproval && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="font-medium text-yellow-500">Aguardando aprovação do cliente</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Valor: {formatCurrency(pedido.valor_orcado!)}</p>
              <p className="text-sm">Prazo: {pedido.prazo_orcado} dias</p>
            </div>
            <Badge className={TIPO_PAGAMENTO_COLORS[pedido.tipo_pagamento]}>
              {TIPO_PAGAMENTO_LABELS[pedido.tipo_pagamento]}
            </Badge>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {hasExistingOrcamento ? "Editar Orçamento" : "Criar Orçamento"}
        </h3>

        {/* Values */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Valor do orçamento *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                type="number"
                step="0.01"
                placeholder="5.000,00"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Prazo de entrega *</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="10"
                value={formData.prazo}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                dias úteis
              </span>
            </div>
          </div>
        </div>

        {/* Payment Type */}
        <div className="space-y-3">
          <Label>Condições de pagamento</Label>
          <RadioGroup
            value={formData.tipoPagamento}
            onValueChange={(v) => setFormData(prev => ({ ...prev, tipoPagamento: v as TipoPagamento }))}
            className="space-y-3"
          >
            {PAYMENT_OPTIONS.map((option) => (
              <div key={option.value} className="relative">
                <label
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.tipoPagamento === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                    
                    {/* Conditional fields */}
                    {option.value === 'faturamento' && formData.tipoPagamento === 'faturamento' && (
                      <div className="mt-3">
                        <Input
                          placeholder="30 dias, 60 dias, etc"
                          value={formData.condicaoPagamento}
                          onChange={(e) => setFormData(prev => ({ ...prev, condicaoPagamento: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    
                    {option.value === 'parcelado' && formData.tipoPagamento === 'parcelado' && (
                      <div className="mt-3 space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Valor de entrada"
                            value={formData.valorEntrada}
                            onChange={(e) => setFormData(prev => ({ ...prev, valorEntrada: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            className="pl-10"
                          />
                        </div>
                        {saldoRestante > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Saldo de R$ {saldoRestante.toFixed(2)} será cobrado na entrega
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Info cards */}
        {(formData.tipoPagamento === 'faturamento' || formData.tipoPagamento === 'pos_entrega') && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-400">
              ⚠️ O projeto iniciará imediatamente após aprovação do cliente, sem aguardar pagamento.
            </p>
          </div>
        )}

        {formData.tipoPagamento === 'parcelado' && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-400">
              O projeto só iniciará após confirmação do pagamento de entrada.
            </p>
          </div>
        )}

        {/* Observations */}
        <div className="space-y-2">
          <Label>Observações para o cliente</Label>
          <Textarea
            placeholder="Detalhes sobre o que será entregue, revisões incluídas, etc"
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            rows={4}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!formData.valor || !formData.prazo || sendOrcamento.isPending}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {sendOrcamento.isPending 
            ? "Enviando..." 
            : hasExistingOrcamento 
              ? "Atualizar e reenviar orçamento" 
              : "Salvar e enviar orçamento"
          }
        </Button>
      </div>
    </div>
  );
}
