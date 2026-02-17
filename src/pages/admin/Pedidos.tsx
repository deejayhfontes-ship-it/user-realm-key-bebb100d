<<<<<<< HEAD
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  FileText,
  Eye,
  Clock,
  Palette,
  DollarSign,
  TrendingUp,
  Download,
  MoreVertical,
  Edit,
  RefreshCw,
  MessageCircle,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoDetailsDrawer } from "@/components/admin/pedidos/PedidoDetailsDrawer";
import { OrderKanban } from "@/components/admin/orders/OrderKanban";
import { OrderDetailDrawer } from "@/components/admin/orders/OrderDetailDrawer";
import { OrderMetricsDashboard } from "@/components/admin/orders/OrderMetricsDashboard";
import type { Pedido, StatusPedido } from "@/types/pedido";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/pedido";
import { format, formatDistanceToNow, differenceInDays, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type FilterPill = 'all' | 'novos' | 'aguardando_orcamento' | 'aguardando_pagamento' | 'em_andamento' | 'aguardando_aprovacao' | 'finalizados' | 'cancelados';

const FILTER_TO_STATUSES: Record<FilterPill, StatusPedido[] | null> = {
  all: null,
  novos: ['briefing'],
  aguardando_orcamento: ['briefing'],
  aguardando_pagamento: ['aguardando_pagamento', 'aguardando_pagamento_final'],
  em_andamento: ['em_confeccao', 'em_ajustes'],
  aguardando_aprovacao: ['orcamento_enviado', 'aguardando_aprovacao_cliente'],
  finalizados: ['finalizado'],
  cancelados: ['cancelado', 'recusado'],
};

const FILTER_PILLS: { value: FilterPill; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'novos', label: 'Novos' },
  { value: 'aguardando_orcamento', label: 'Aguardando orçamento' },
  { value: 'aguardando_pagamento', label: 'Aguardando pagamento' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'aguardando_aprovacao', label: 'Aguardando aprovação' },
  { value: 'finalizados', label: 'Finalizados' },
  { value: 'cancelados', label: 'Cancelados' },
];

type SortField = 'protocolo' | 'cliente' | 'valor' | 'data' | 'prazo';
type SortDirection = 'asc' | 'desc';

type ViewMode = 'list' | 'kanban';

export default function AdminPedidos() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterPill>("all");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [sortField, setSortField] = useState<SortField>("data");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data: allPedidos, isLoading } = usePedidos({
    search: search || undefined,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!allPedidos) return { total: 0, aguardandoOrcamento: 0, emConfeccao: 0, faturamento: 0 };

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const faturamentoMes = allPedidos
      .filter(p =>
        p.status === 'finalizado' &&
        p.data_entrega &&
        new Date(p.data_entrega) >= monthStart &&
        new Date(p.data_entrega) <= monthEnd
      )
      .reduce((acc, p) => acc + (p.valor_orcado || 0), 0);

    return {
      total: allPedidos.length,
      aguardandoOrcamento: allPedidos.filter(p => p.status === 'briefing').length,
      emConfeccao: allPedidos.filter(p => ['em_confeccao', 'em_ajustes'].includes(p.status)).length,
      faturamento: faturamentoMes,
    };
  }, [allPedidos]);

  // Filter counts for badges
  const filterCounts = useMemo(() => {
    if (!allPedidos) return {};

    const counts: Record<FilterPill, number> = {
      all: allPedidos.length,
      novos: 0,
      aguardando_orcamento: 0,
      aguardando_pagamento: 0,
      em_andamento: 0,
      aguardando_aprovacao: 0,
      finalizados: 0,
      cancelados: 0,
    };

    allPedidos.forEach(p => {
      const statuses = FILTER_TO_STATUSES;
      Object.entries(statuses).forEach(([key, statusList]) => {
        if (statusList && statusList.includes(p.status)) {
          counts[key as FilterPill]++;
        }
      });
    });

    return counts;
  }, [allPedidos]);

  // Apply filters
  const filteredPedidos = useMemo(() => {
    if (!allPedidos) return [];

    let result = allPedidos;

    // Apply status filter
    const statusesToFilter = FILTER_TO_STATUSES[activeFilter];
    if (statusesToFilter) {
      result = result.filter(p => statusesToFilter.includes(p.status));
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'protocolo':
          comparison = a.protocolo.localeCompare(b.protocolo);
          break;
        case 'cliente':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'valor':
          comparison = (a.valor_orcado || 0) - (b.valor_orcado || 0);
          break;
        case 'data':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'prazo':
          const prazoA = a.prazo_final ? new Date(a.prazo_final).getTime() : Infinity;
          const prazoB = b.prazo_final ? new Date(b.prazo_final).getTime() : Infinity;
          comparison = prazoA - prazoB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allPedidos, activeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const paginatedPedidos = filteredPedidos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const isOverdue = (prazoFinal: string | null) => {
    if (!prazoFinal) return false;
    return isBefore(new Date(prazoFinal), new Date());
  };

  const exportToCSV = () => {
    if (!filteredPedidos.length) return;

    const headers = ['Protocolo', 'Cliente', 'Email', 'Serviço', 'Valor', 'Status', 'Data', 'Prazo'];
    const rows = filteredPedidos.map(p => [
      p.protocolo,
      p.nome,
      p.email,
      p.services?.title || '',
      p.valor_orcado ? (p.valor_orcado / 100).toFixed(2) : '',
      STATUS_LABELS[p.status],
      format(new Date(p.created_at), 'dd/MM/yyyy'),
      p.prazo_final ? format(new Date(p.prazo_final), 'dd/MM/yyyy') : '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusBadgeClasses = (status: StatusPedido) => {
    const colorMap: Record<StatusPedido, string> = {
      briefing: 'bg-[rgba(102,102,102,0.1)] text-[#666666]',
      orcamento_enviado: 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6]',
      orcamento_aprovado: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]',
      aguardando_pagamento: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]',
      pagamento_confirmado: 'bg-[rgba(16,185,129,0.1)] text-[#10b981]',
      em_confeccao: 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]',
      aguardando_aprovacao_cliente: 'bg-[rgba(249,115,22,0.1)] text-[#f97316]',
      em_ajustes: 'bg-[rgba(55,48,163,0.1)] text-[#3730a3]',
      aguardando_pagamento_final: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]',
      finalizado: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]',
      cancelado: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
      recusado: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
    };
    return colorMap[status];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-black/10 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1a1a]">Gerenciar Pedidos</h1>
            <p className="text-sm text-black/60 mt-1">Visualize e gerencie todos os pedidos</p>
          </div>
          <div className="flex items-center gap-1 bg-black/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === 'list'
                ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                : 'text-black/50 hover:text-black/70'
                }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === 'kanban'
                ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                : 'text-black/50 hover:text-black/70'
                }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Metrics Dashboard */}
        <OrderMetricsDashboard />

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <OrderKanban
            onOrderClick={setSelectedPedido}
          />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Pedidos */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Total de Pedidos</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">+12% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#c4ff0d]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#c4ff0d]" />
                  </div>
                </div>
              </div>

              {/* Aguardando Orçamento */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Aguardando Orçamento</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">{stats.aguardandoOrcamento}</p>
                    {stats.aguardandoOrcamento > 5 && (
                      <Badge className="mt-2 bg-red-500 text-white animate-pulse">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                </div>
              </div>

              {/* Em Confecção */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Em Confecção</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">{stats.emConfeccao}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                </div>
              </div>

              {/* Faturamento do Mês */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Faturamento do Mês</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">
                      {formatCurrency(stats.faturamento)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#10b981]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {FILTER_PILLS.map((pill) => {
                  const count = filterCounts[pill.value] || 0;
                  const isActive = activeFilter === pill.value;
                  const showBadge = pill.value === 'novos' && count > 0;

                  return (
                    <button
                      key={pill.value}
                      onClick={() => {
                        setActiveFilter(pill.value);
                        setCurrentPage(1);
                      }}
                      className={`
                    relative px-4 py-2 rounded-full text-sm transition-all
                    ${isActive
                          ? 'bg-[#c4ff0d] text-[#1a1a1a] font-semibold'
                          : 'bg-black/5 text-[#666] hover:bg-black/10'
                        }
                  `}
                    >
                      {pill.label}
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px]">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search and Actions */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                  <Input
                    placeholder="Buscar por protocolo, cliente..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-[300px] rounded-full border-black/10 focus:border-[#c4ff0d] bg-white"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="rounded-full border-[#c4ff0d] text-[#c4ff0d] hover:bg-[#c4ff0d]/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>

                <Button
                  className="rounded-full bg-[#c4ff0d] text-[#1a1a1a] hover:bg-[#b3e60c]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo pedido
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#fafafa] border-b-2 border-black/10">
                    <TableHead
                      className="w-[150px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('protocolo')}
                    >
                      <div className="flex items-center gap-1">
                        Protocolo
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-[200px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('cliente')}
                    >
                      <div className="flex items-center gap-1">
                        Cliente
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px] text-xs font-semibold text-black/60 uppercase tracking-wider">
                      Serviço
                    </TableHead>
                    <TableHead
                      className="w-[120px] text-xs font-semibold text-black/60 uppercase tracking-wider text-right cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('valor')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Valor
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px] text-xs font-semibold text-black/60 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead
                      className="w-[120px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('data')}
                    >
                      <div className="flex items-center gap-1">
                        Data
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-[120px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('prazo')}
                    >
                      <div className="flex items-center gap-1">
                        Prazo
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px] text-xs font-semibold text-black/60 uppercase tracking-wider text-center">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-[#c4ff0d] border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-black/50">Carregando pedidos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedPedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-black/20 mb-3" />
                        <p className="text-black/50">Nenhum pedido encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPedidos.map((pedido) => (
                      <TableRow
                        key={pedido.id}
                        className="border-b border-black/5 hover:bg-[rgba(196,255,13,0.05)] transition-colors cursor-pointer"
                        onClick={() => setSelectedPedido(pedido)}
                      >
                        <TableCell className="font-semibold text-sm text-[#1a1a1a] hover:text-[#c4ff0d] transition-colors">
                          {pedido.protocolo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm text-[#1a1a1a]">{pedido.nome}</p>
                            <p className="text-xs text-black/50">{pedido.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-black/70">
                          {pedido.services?.title || "-"}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-[#1a1a1a] text-right">
                          {formatCurrency(pedido.valor_orcado)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeClasses(pedido.status)} px-3 py-1 text-xs font-semibold rounded-xl`}>
                            {STATUS_LABELS[pedido.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-[13px] text-black/60">
                              {format(new Date(pedido.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-[11px] text-black/40">
                              {formatDistanceToNow(new Date(pedido.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pedido.prazo_final ? (
                            <div className={`${isOverdue(pedido.prazo_final) ? 'text-[#ef4444] font-semibold' : 'text-black/60'}`}>
                              <div className="flex items-center gap-1">
                                {isOverdue(pedido.prazo_final) && <AlertCircle className="w-4 h-4" />}
                                <span className="text-[13px]">
                                  {format(new Date(pedido.prazo_final), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-black/30">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] rounded-xl p-2 shadow-lg">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPedido(pedido);
                                }}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar orçamento
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Mudar status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Enviar mensagem
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {filteredPedidos.length > 0 && (
                <div className="px-5 py-5 border-t border-black/5 flex items-center justify-between">
                  <p className="text-sm text-black/60">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredPedidos.length)} de {filteredPedidos.length} pedidos
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 w-9 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant="ghost"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-9 w-9 rounded-lg text-sm ${currentPage === pageNum
                            ? 'bg-[#c4ff0d] text-[#1a1a1a] font-semibold hover:bg-[#c4ff0d]'
                            : 'text-black/60 hover:bg-black/5'
                            }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(v) => {
                      setItemsPerPage(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px] rounded-lg border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 por página</SelectItem>
                      <SelectItem value="20">20 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                      <SelectItem value="100">100 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legacy Drawer (list view) */}
      {viewMode === 'list' && (
        <PedidoDetailsDrawer
          pedido={selectedPedido}
          open={!!selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}

      {/* New Detail Drawer (kanban view) */}
      {viewMode === 'kanban' && (
        <OrderDetailDrawer
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}
    </div>
  );
}
=======
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  FileText,
  Eye,
  Clock,
  Palette,
  DollarSign,
  TrendingUp,
  Download,
  MoreVertical,
  Edit,
  RefreshCw,
  MessageCircle,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePedidos } from "@/hooks/usePedidos";
import { PedidoDetailsDrawer } from "@/components/admin/pedidos/PedidoDetailsDrawer";
import { OrderKanban } from "@/components/admin/orders/OrderKanban";
import { OrderDetailDrawer } from "@/components/admin/orders/OrderDetailDrawer";
import { OrderMetricsDashboard } from "@/components/admin/orders/OrderMetricsDashboard";
import type { Pedido, StatusPedido } from "@/types/pedido";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/pedido";
import { format, formatDistanceToNow, differenceInDays, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type FilterPill = 'all' | 'novos' | 'aguardando_orcamento' | 'aguardando_pagamento' | 'em_andamento' | 'aguardando_aprovacao' | 'finalizados' | 'cancelados';

const FILTER_TO_STATUSES: Record<FilterPill, StatusPedido[] | null> = {
  all: null,
  novos: ['briefing'],
  aguardando_orcamento: ['briefing'],
  aguardando_pagamento: ['aguardando_pagamento', 'aguardando_pagamento_final'],
  em_andamento: ['em_confeccao', 'em_ajustes'],
  aguardando_aprovacao: ['orcamento_enviado', 'aguardando_aprovacao_cliente'],
  finalizados: ['finalizado'],
  cancelados: ['cancelado', 'recusado'],
};

const FILTER_PILLS: { value: FilterPill; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'novos', label: 'Novos' },
  { value: 'aguardando_orcamento', label: 'Aguardando orçamento' },
  { value: 'aguardando_pagamento', label: 'Aguardando pagamento' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'aguardando_aprovacao', label: 'Aguardando aprovação' },
  { value: 'finalizados', label: 'Finalizados' },
  { value: 'cancelados', label: 'Cancelados' },
];

type SortField = 'protocolo' | 'cliente' | 'valor' | 'data' | 'prazo';
type SortDirection = 'asc' | 'desc';

type ViewMode = 'list' | 'kanban';

export default function AdminPedidos() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterPill>("all");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [sortField, setSortField] = useState<SortField>("data");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data: allPedidos, isLoading } = usePedidos({
    search: search || undefined,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!allPedidos) return { total: 0, aguardandoOrcamento: 0, emConfeccao: 0, faturamento: 0 };

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const faturamentoMes = allPedidos
      .filter(p =>
        p.status === 'finalizado' &&
        p.data_entrega &&
        new Date(p.data_entrega) >= monthStart &&
        new Date(p.data_entrega) <= monthEnd
      )
      .reduce((acc, p) => acc + (p.valor_orcado || 0), 0);

    return {
      total: allPedidos.length,
      aguardandoOrcamento: allPedidos.filter(p => p.status === 'briefing').length,
      emConfeccao: allPedidos.filter(p => ['em_confeccao', 'em_ajustes'].includes(p.status)).length,
      faturamento: faturamentoMes,
    };
  }, [allPedidos]);

  // Filter counts for badges
  const filterCounts = useMemo(() => {
    if (!allPedidos) return {};

    const counts: Record<FilterPill, number> = {
      all: allPedidos.length,
      novos: 0,
      aguardando_orcamento: 0,
      aguardando_pagamento: 0,
      em_andamento: 0,
      aguardando_aprovacao: 0,
      finalizados: 0,
      cancelados: 0,
    };

    allPedidos.forEach(p => {
      const statuses = FILTER_TO_STATUSES;
      Object.entries(statuses).forEach(([key, statusList]) => {
        if (statusList && statusList.includes(p.status)) {
          counts[key as FilterPill]++;
        }
      });
    });

    return counts;
  }, [allPedidos]);

  // Apply filters
  const filteredPedidos = useMemo(() => {
    if (!allPedidos) return [];

    let result = allPedidos;

    // Apply status filter
    const statusesToFilter = FILTER_TO_STATUSES[activeFilter];
    if (statusesToFilter) {
      result = result.filter(p => statusesToFilter.includes(p.status));
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'protocolo':
          comparison = a.protocolo.localeCompare(b.protocolo);
          break;
        case 'cliente':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'valor':
          comparison = (a.valor_orcado || 0) - (b.valor_orcado || 0);
          break;
        case 'data':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'prazo':
          const prazoA = a.prazo_final ? new Date(a.prazo_final).getTime() : Infinity;
          const prazoB = b.prazo_final ? new Date(b.prazo_final).getTime() : Infinity;
          comparison = prazoA - prazoB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allPedidos, activeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const paginatedPedidos = filteredPedidos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (cents: number | null) => {
    if (!cents) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const isOverdue = (prazoFinal: string | null) => {
    if (!prazoFinal) return false;
    return isBefore(new Date(prazoFinal), new Date());
  };

  const exportToCSV = () => {
    if (!filteredPedidos.length) return;

    const headers = ['Protocolo', 'Cliente', 'Email', 'Serviço', 'Valor', 'Status', 'Data', 'Prazo'];
    const rows = filteredPedidos.map(p => [
      p.protocolo,
      p.nome,
      p.email,
      p.services?.title || '',
      p.valor_orcado ? (p.valor_orcado / 100).toFixed(2) : '',
      STATUS_LABELS[p.status],
      format(new Date(p.created_at), 'dd/MM/yyyy'),
      p.prazo_final ? format(new Date(p.prazo_final), 'dd/MM/yyyy') : '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusBadgeClasses = (status: StatusPedido) => {
    const colorMap: Record<StatusPedido, string> = {
      briefing: 'bg-[rgba(102,102,102,0.1)] text-[#666666]',
      orcamento_enviado: 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6]',
      orcamento_aprovado: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]',
      aguardando_pagamento: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]',
      pagamento_confirmado: 'bg-[rgba(16,185,129,0.1)] text-[#10b981]',
      em_confeccao: 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6]',
      aguardando_aprovacao_cliente: 'bg-[rgba(249,115,22,0.1)] text-[#f97316]',
      em_ajustes: 'bg-[rgba(55,48,163,0.1)] text-[#3730a3]',
      aguardando_pagamento_final: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]',
      finalizado: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]',
      cancelado: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
      recusado: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
    };
    return colorMap[status];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-black/10 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1a1a]">Gerenciar Pedidos</h1>
            <p className="text-sm text-black/60 mt-1">Visualize e gerencie todos os pedidos</p>
          </div>
          <div className="flex items-center gap-1 bg-black/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === 'list'
                ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                : 'text-black/50 hover:text-black/70'
                }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${viewMode === 'kanban'
                ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                : 'text-black/50 hover:text-black/70'
                }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Metrics Dashboard */}
        <OrderMetricsDashboard />

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <OrderKanban
            onOrderClick={setSelectedPedido}
          />
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Pedidos */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Total de Pedidos</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">{stats.total}</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">+12% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#c4ff0d]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#c4ff0d]" />
                  </div>
                </div>
              </div>

              {/* Aguardando Orçamento */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Aguardando Orçamento</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">{stats.aguardandoOrcamento}</p>
                    {stats.aguardandoOrcamento > 5 && (
                      <Badge className="mt-2 bg-red-500 text-white animate-pulse">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                </div>
              </div>

              {/* Em Confecção */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Em Confecção</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">{stats.emConfeccao}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                </div>
              </div>

              {/* Faturamento do Mês */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/60">Faturamento do Mês</p>
                    <p className="text-[32px] font-bold text-[#1a1a1a] mt-1">
                      {formatCurrency(stats.faturamento)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#10b981]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {FILTER_PILLS.map((pill) => {
                  const count = filterCounts[pill.value] || 0;
                  const isActive = activeFilter === pill.value;
                  const showBadge = pill.value === 'novos' && count > 0;

                  return (
                    <button
                      key={pill.value}
                      onClick={() => {
                        setActiveFilter(pill.value);
                        setCurrentPage(1);
                      }}
                      className={`
                    relative px-4 py-2 rounded-full text-sm transition-all
                    ${isActive
                          ? 'bg-[#c4ff0d] text-[#1a1a1a] font-semibold'
                          : 'bg-black/5 text-[#666] hover:bg-black/10'
                        }
                  `}
                    >
                      {pill.label}
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px]">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search and Actions */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                  <Input
                    placeholder="Buscar por protocolo, cliente..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-[300px] rounded-full border-black/10 focus:border-[#c4ff0d] bg-white"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="rounded-full border-[#c4ff0d] text-[#c4ff0d] hover:bg-[#c4ff0d]/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>

                <Button
                  className="rounded-full bg-[#c4ff0d] text-[#1a1a1a] hover:bg-[#b3e60c]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo pedido
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#fafafa] border-b-2 border-black/10">
                    <TableHead
                      className="w-[150px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('protocolo')}
                    >
                      <div className="flex items-center gap-1">
                        Protocolo
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-[200px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('cliente')}
                    >
                      <div className="flex items-center gap-1">
                        Cliente
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px] text-xs font-semibold text-black/60 uppercase tracking-wider">
                      Serviço
                    </TableHead>
                    <TableHead
                      className="w-[120px] text-xs font-semibold text-black/60 uppercase tracking-wider text-right cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('valor')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Valor
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px] text-xs font-semibold text-black/60 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead
                      className="w-[120px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('data')}
                    >
                      <div className="flex items-center gap-1">
                        Data
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-[120px] text-xs font-semibold text-black/60 uppercase tracking-wider cursor-pointer hover:text-black/80"
                      onClick={() => handleSort('prazo')}
                    >
                      <div className="flex items-center gap-1">
                        Prazo
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px] text-xs font-semibold text-black/60 uppercase tracking-wider text-center">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-[#c4ff0d] border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-black/50">Carregando pedidos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedPedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-black/20 mb-3" />
                        <p className="text-black/50">Nenhum pedido encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPedidos.map((pedido) => (
                      <TableRow
                        key={pedido.id}
                        className="border-b border-black/5 hover:bg-[rgba(196,255,13,0.05)] transition-colors cursor-pointer"
                        onClick={() => setSelectedPedido(pedido)}
                      >
                        <TableCell className="font-semibold text-sm text-[#1a1a1a] hover:text-[#c4ff0d] transition-colors">
                          {pedido.protocolo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm text-[#1a1a1a]">{pedido.nome}</p>
                            <p className="text-xs text-black/50">{pedido.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-black/70">
                          {pedido.services?.title || "-"}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-[#1a1a1a] text-right">
                          {formatCurrency(pedido.valor_orcado)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeClasses(pedido.status)} px-3 py-1 text-xs font-semibold rounded-xl`}>
                            {STATUS_LABELS[pedido.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-[13px] text-black/60">
                              {format(new Date(pedido.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-[11px] text-black/40">
                              {formatDistanceToNow(new Date(pedido.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pedido.prazo_final ? (
                            <div className={`${isOverdue(pedido.prazo_final) ? 'text-[#ef4444] font-semibold' : 'text-black/60'}`}>
                              <div className="flex items-center gap-1">
                                {isOverdue(pedido.prazo_final) && <AlertCircle className="w-4 h-4" />}
                                <span className="text-[13px]">
                                  {format(new Date(pedido.prazo_final), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-black/30">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] rounded-xl p-2 shadow-lg">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPedido(pedido);
                                }}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar orçamento
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Mudar status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Enviar mensagem
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-lg px-3 py-2.5 cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {filteredPedidos.length > 0 && (
                <div className="px-5 py-5 border-t border-black/5 flex items-center justify-between">
                  <p className="text-sm text-black/60">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredPedidos.length)} de {filteredPedidos.length} pedidos
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 w-9 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant="ghost"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-9 w-9 rounded-lg text-sm ${currentPage === pageNum
                            ? 'bg-[#c4ff0d] text-[#1a1a1a] font-semibold hover:bg-[#c4ff0d]'
                            : 'text-black/60 hover:bg-black/5'
                            }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(v) => {
                      setItemsPerPage(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px] rounded-lg border-black/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 por página</SelectItem>
                      <SelectItem value="20">20 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                      <SelectItem value="100">100 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Legacy Drawer (list view) */}
      {viewMode === 'list' && (
        <PedidoDetailsDrawer
          pedido={selectedPedido}
          open={!!selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}

      {/* New Detail Drawer (kanban view) */}
      {viewMode === 'kanban' && (
        <OrderDetailDrawer
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}
    </div>
  );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
