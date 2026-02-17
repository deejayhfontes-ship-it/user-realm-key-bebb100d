import { useState } from "react";
import { X, FileText, User, Clock, CreditCard, Palette, Check, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Pedido } from "@/types/pedido";
import { STATUS_LABELS, STATUS_COLORS, TIPO_PAGAMENTO_LABELS, TIPO_PAGAMENTO_COLORS } from "@/types/pedido";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PedidoBriefingTab } from "./PedidoBriefingTab";
import { PedidoOrcamentoTab } from "./PedidoOrcamentoTab";
import { PedidoProducaoTab } from "./PedidoProducaoTab";
import { PedidoTimelineTab } from "./PedidoTimelineTab";

interface PedidoDetailsDrawerProps {
  pedido: Pedido | null;
  open: boolean;
  onClose: () => void;
}

export function PedidoDetailsDrawer({ pedido, open, onClose }: PedidoDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("briefing");

  if (!pedido) return null;

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[600px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="flex items-center gap-3">
                <span className="font-mono">{pedido.protocolo}</span>
                <Badge className={STATUS_COLORS[pedido.status]}>
                  {STATUS_LABELS[pedido.status]}
                </Badge>
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {pedido.nome} • {pedido.email}
              </p>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Serviço</p>
              <p className="font-medium text-sm truncate">
                {pedido.services?.title || "Não definido"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="font-medium text-sm">
                {formatCurrency(pedido.valor_orcado)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="font-medium text-sm">
                {pedido.prazo_orcado ? `${pedido.prazo_orcado} dias` : "-"}
              </p>
            </div>
          </div>

          {/* Payment Type Badge */}
          {pedido.status !== 'briefing' && pedido.tipo_pagamento && (
            <Badge 
              variant="outline" 
              className={`mt-3 ${TIPO_PAGAMENTO_COLORS[pedido.tipo_pagamento]}`}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              {TIPO_PAGAMENTO_LABELS[pedido.tipo_pagamento]}
              {pedido.tipo_pagamento === 'parcelado' && pedido.valor_entrada && (
                <span className="ml-1">
                  (Entrada: {formatCurrency(pedido.valor_entrada)})
                </span>
              )}
              {pedido.tipo_pagamento === 'faturamento' && pedido.condicao_pagamento && (
                <span className="ml-1">
                  ({pedido.condicao_pagamento})
                </span>
              )}
            </Badge>
          )}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start px-6 pt-2 bg-transparent border-b rounded-none">
            <TabsTrigger value="briefing" className="gap-2">
              <FileText className="w-4 h-4" />
              Briefing
            </TabsTrigger>
            <TabsTrigger value="orcamento" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Orçamento
            </TabsTrigger>
            <TabsTrigger value="producao" className="gap-2">
              <Palette className="w-4 h-4" />
              Produção
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-320px)]">
            <TabsContent value="briefing" className="p-6 m-0">
              <PedidoBriefingTab pedido={pedido} />
            </TabsContent>

            <TabsContent value="orcamento" className="p-6 m-0">
              <PedidoOrcamentoTab pedido={pedido} onClose={onClose} />
            </TabsContent>

            <TabsContent value="producao" className="p-6 m-0">
              <PedidoProducaoTab pedido={pedido} onClose={onClose} />
            </TabsContent>

            <TabsContent value="timeline" className="p-6 m-0">
              <PedidoTimelineTab pedido={pedido} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
