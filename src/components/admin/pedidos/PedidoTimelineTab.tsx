import { Check, Clock, CreditCard, FileText, Palette, Package, AlertTriangle, X } from "lucide-react";
import type { Pedido } from "@/types/pedido";
import { TIPO_PAGAMENTO_LABELS } from "@/types/pedido";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PedidoTimelineTabProps {
  pedido: Pedido;
}

interface TimelineItem {
  icon: React.ElementType;
  label: string;
  date: string | null;
  status: 'completed' | 'current' | 'pending' | 'error';
  description?: string;
}

export function PedidoTimelineTab({ pedido }: PedidoTimelineTabProps) {
  const formatDate = (date: string | null) => {
    if (!date) return null;
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  // Build timeline items based on pedido status and payment type
  const getTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];
    const status = pedido.status;
    const tipoPagamento = pedido.tipo_pagamento;
    const requiresUpfront = pedido.requer_pagamento_antecipado;

    // 1. Briefing
    items.push({
      icon: FileText,
      label: "Briefing Recebido",
      date: formatDate(pedido.data_briefing),
      status: 'completed',
      description: `Solicitação de ${pedido.services?.title || 'serviço'}`,
    });

    // 2. Orçamento enviado
    if (['briefing'].includes(status)) {
      items.push({
        icon: CreditCard,
        label: "Orçamento",
        date: null,
        status: 'pending',
        description: "Aguardando elaboração",
      });
    } else {
      items.push({
        icon: CreditCard,
        label: "Orçamento Enviado",
        date: formatDate(pedido.data_orcamento),
        status: status === 'orcamento_enviado' ? 'current' : 'completed',
        description: pedido.valor_orcado 
          ? `${formatCurrency(pedido.valor_orcado)} • ${pedido.prazo_orcado} dias • ${TIPO_PAGAMENTO_LABELS[tipoPagamento]}`
          : undefined,
      });
    }

    // 3. Recusado (if applicable)
    if (status === 'recusado') {
      items.push({
        icon: X,
        label: "Orçamento Recusado",
        date: formatDate(pedido.updated_at),
        status: 'error',
        description: pedido.motivo_recusa || "Sem motivo informado",
      });
      return items;
    }

    // 3. Cancelado (if applicable)
    if (status === 'cancelado') {
      items.push({
        icon: X,
        label: "Cancelado",
        date: formatDate(pedido.updated_at),
        status: 'error',
      });
      return items;
    }

    // 4. Aprovação (only if past orcamento_enviado)
    if (!['briefing', 'orcamento_enviado'].includes(status)) {
      items.push({
        icon: Check,
        label: "Orçamento Aprovado",
        date: formatDate(pedido.data_aprovacao),
        status: 'completed',
      });
    }

    // 5. Pagamento antecipado (if required)
    if (requiresUpfront) {
      if (status === 'aguardando_pagamento') {
        items.push({
          icon: Clock,
          label: tipoPagamento === 'parcelado' ? "Aguardando Entrada" : "Aguardando Pagamento",
          date: null,
          status: 'current',
          description: tipoPagamento === 'parcelado' && pedido.valor_entrada
            ? `Entrada: ${formatCurrency(pedido.valor_entrada)}`
            : undefined,
        });
      } else if (pedido.data_pagamento) {
        items.push({
          icon: Check,
          label: tipoPagamento === 'parcelado' ? "Entrada Confirmada" : "Pagamento Confirmado",
          date: formatDate(pedido.data_pagamento),
          status: 'completed',
          description: tipoPagamento === 'parcelado' && pedido.valor_entrada
            ? `${formatCurrency(pedido.valor_entrada)} recebido`
            : undefined,
        });
      }
    }

    // 6. Em confecção
    const productionStatuses = ['em_confeccao', 'em_ajustes', 'aguardando_aprovacao_cliente', 'aguardando_pagamento_final', 'finalizado'];
    if (productionStatuses.includes(status)) {
      items.push({
        icon: Palette,
        label: status === 'em_ajustes' ? "Em Ajustes" : "Em Confecção",
        date: formatDate(pedido.data_inicio_confeccao),
        status: ['em_confeccao', 'em_ajustes'].includes(status) ? 'current' : 'completed',
        description: pedido.prazo_final 
          ? `Prazo: ${format(new Date(pedido.prazo_final), "dd/MM/yyyy", { locale: ptBR })}`
          : undefined,
      });
    } else if (!['briefing', 'orcamento_enviado', 'aguardando_pagamento', 'recusado', 'cancelado'].includes(status)) {
      items.push({
        icon: Palette,
        label: "Em Confecção",
        date: null,
        status: 'pending',
      });
    }

    // 7. Aguardando aprovação do cliente
    if (status === 'aguardando_aprovacao_cliente') {
      items.push({
        icon: Clock,
        label: "Prévia Enviada",
        date: null,
        status: 'current',
        description: "Aguardando aprovação do cliente",
      });
    }

    // 8. Pagamento final (if pos_entrega or parcelado)
    if (tipoPagamento === 'pos_entrega' || tipoPagamento === 'parcelado') {
      if (status === 'aguardando_pagamento_final') {
        const valorFinal = tipoPagamento === 'parcelado' && pedido.valor_entrada
          ? pedido.valor_orcado! - pedido.valor_entrada
          : pedido.valor_orcado!;
        
        items.push({
          icon: CreditCard,
          label: "Aguardando Pagamento Final",
          date: null,
          status: 'current',
          description: `${formatCurrency(valorFinal)} a receber`,
        });
      } else if (pedido.data_pagamento_final) {
        items.push({
          icon: Check,
          label: "Pagamento Final Confirmado",
          date: formatDate(pedido.data_pagamento_final),
          status: 'completed',
        });
      }
    }

    // 9. Finalizado
    if (status === 'finalizado') {
      items.push({
        icon: Package,
        label: "Projeto Entregue",
        date: formatDate(pedido.data_entrega),
        status: 'completed',
        description: pedido.nota_fiscal_emitida 
          ? `NF: ${pedido.numero_nota_fiscal}` 
          : undefined,
      });
    }

    return items;
  };

  const timelineItems = getTimelineItems();

  return (
    <div className="space-y-1">
      {timelineItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === timelineItems.length - 1;
        
        return (
          <div key={index} className="flex gap-4">
            {/* Icon and line */}
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${item.status === 'completed' ? 'bg-green-500/20 text-green-500' : ''}
                ${item.status === 'current' ? 'bg-primary/20 text-primary ring-2 ring-primary' : ''}
                ${item.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                ${item.status === 'error' ? 'bg-red-500/20 text-red-500' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div className={`
                  w-0.5 flex-1 min-h-[40px] my-2
                  ${item.status === 'completed' ? 'bg-green-500/50' : 'bg-border'}
                `} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p className={`
                font-medium
                ${item.status === 'completed' ? 'text-green-500' : ''}
                ${item.status === 'current' ? 'text-primary' : ''}
                ${item.status === 'pending' ? 'text-muted-foreground' : ''}
                ${item.status === 'error' ? 'text-red-500' : ''}
              `}>
                {item.label}
              </p>
              {item.date && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
