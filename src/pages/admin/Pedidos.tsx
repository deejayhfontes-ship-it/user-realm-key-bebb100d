import { useState } from "react";
import { Search, Filter, Plus, FileText, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoDetailsDrawer } from "@/components/admin/pedidos/PedidoDetailsDrawer";
import type { Pedido, StatusPedido } from "@/types/pedido";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/pedido";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_OPTIONS: { value: StatusPedido | "all"; label: string }[] = [
  { value: "all", label: "Todos os status" },
  { value: "briefing", label: "Briefing Recebido" },
  { value: "orcamento_enviado", label: "Orçamento Enviado" },
  { value: "orcamento_aprovado", label: "Orçamento Aprovado" },
  { value: "aguardando_pagamento", label: "Aguardando Pagamento" },
  { value: "pagamento_confirmado", label: "Pagamento Confirmado" },
  { value: "em_confeccao", label: "Em Confecção" },
  { value: "aguardando_aprovacao_cliente", label: "Aguardando Aprovação" },
  { value: "em_ajustes", label: "Em Ajustes" },
  { value: "aguardando_pagamento_final", label: "Aguardando Pag. Final" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "recusado", label: "Recusado" },
];

export default function AdminPedidos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusPedido | "all">("all");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const { data: pedidos, isLoading } = usePedidos({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie briefings, orçamentos e entregas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por protocolo, nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusPedido | "all")}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { status: "briefing", label: "Novos", color: "bg-blue-500" },
          { status: "orcamento_enviado", label: "Aguardando Aprovação", color: "bg-yellow-500" },
          { status: "aguardando_pagamento", label: "Aguardando Pag.", color: "bg-orange-500" },
          { status: "em_confeccao", label: "Em Produção", color: "bg-purple-500" },
          { status: "aguardando_aprovacao_cliente", label: "Prévia Enviada", color: "bg-cyan-500" },
          { status: "finalizado", label: "Finalizados", color: "bg-green-500" },
        ].map((stat) => {
          const count = pedidos?.filter((p) => p.status === stat.status).length || 0;
          return (
            <button
              key={stat.status}
              onClick={() => setStatusFilter(stat.status as StatusPedido)}
              className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                statusFilter === stat.status
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : pedidos?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              pedidos?.map((pedido) => (
                <TableRow 
                  key={pedido.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPedido(pedido)}
                >
                  <TableCell className="font-mono font-medium">
                    {pedido.protocolo}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{pedido.nome}</p>
                      <p className="text-xs text-muted-foreground">{pedido.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pedido.services?.title || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(pedido.valor_orcado)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[pedido.status]}>
                      {STATUS_LABELS[pedido.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(pedido.created_at), "dd/MM/yy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPedido(pedido);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawer */}
      <PedidoDetailsDrawer
        pedido={selectedPedido}
        open={!!selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </div>
  );
}
