import React, { useState, useCallback } from 'react';
import { usePedidos } from '@/hooks/usePedidos';
import { useUpdatePedidoStatus } from '@/hooks/usePedidos';
import { OrderCard } from './OrderCard';
import { toast } from 'sonner';
import type { Pedido, StatusPedido } from '@/types/pedido';

// Colunas do Kanban com seus status correspondentes
const KANBAN_COLUMNS: Array<{
    id: string;
    title: string;
    statuses: StatusPedido[];
    color: string;
    dotColor: string;
}> = [
        {
            id: 'briefing',
            title: 'Briefing',
            statuses: ['briefing'],
            color: 'from-blue-500/10 to-blue-500/5',
            dotColor: 'bg-blue-400',
        },
        {
            id: 'orcamento',
            title: 'Orçamento',
            statuses: ['orcamento_enviado', 'orcamento_aprovado'],
            color: 'from-yellow-500/10 to-yellow-500/5',
            dotColor: 'bg-yellow-400',
        },
        {
            id: 'pagamento',
            title: 'Pagamento',
            statuses: ['aguardando_pagamento', 'pagamento_confirmado'],
            color: 'from-orange-500/10 to-orange-500/5',
            dotColor: 'bg-orange-400',
        },
        {
            id: 'producao',
            title: 'Produção',
            statuses: ['em_confeccao'],
            color: 'from-purple-500/10 to-purple-500/5',
            dotColor: 'bg-purple-400',
        },
        {
            id: 'revisao',
            title: 'Revisão',
            statuses: ['em_ajustes', 'aguardando_aprovacao_cliente'],
            color: 'from-cyan-500/10 to-cyan-500/5',
            dotColor: 'bg-cyan-400',
        },
        {
            id: 'entrega',
            title: 'Entrega',
            statuses: ['aguardando_pagamento_final'],
            color: 'from-emerald-500/10 to-emerald-500/5',
            dotColor: 'bg-emerald-400',
        },
        {
            id: 'finalizado',
            title: 'Finalizado',
            statuses: ['finalizado'],
            color: 'from-green-500/10 to-green-500/5',
            dotColor: 'bg-green-400',
        },
    ];

// Mapeamento: ao dropar em coluna, qual status setar
const DROP_STATUS_MAP: Record<string, StatusPedido> = {
    briefing: 'briefing',
    orcamento: 'orcamento_enviado',
    pagamento: 'aguardando_pagamento',
    producao: 'em_confeccao',
    revisao: 'em_ajustes',
    entrega: 'aguardando_pagamento_final',
    finalizado: 'finalizado',
};

interface OrderKanbanProps {
    onOrderClick?: (pedido: Pedido) => void;
    filters?: { status?: StatusPedido; search?: string };
}

export function OrderKanban({ onOrderClick, filters }: OrderKanbanProps) {
    const { data: pedidos = [], isLoading } = usePedidos(filters);
    const updateStatus = useUpdatePedidoStatus();
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [draggingPedidoId, setDraggingPedidoId] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, pedido: Pedido) => {
        e.dataTransfer.setData('pedidoId', pedido.id);
        e.dataTransfer.setData('currentStatus', pedido.status);
        e.dataTransfer.effectAllowed = 'move';
        setDraggingPedidoId(pedido.id);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        setDraggingPedidoId(null);

        const pedidoId = e.dataTransfer.getData('pedidoId');
        const currentStatus = e.dataTransfer.getData('currentStatus');
        const newStatus = DROP_STATUS_MAP[columnId];

        if (!pedidoId || !newStatus || currentStatus === newStatus) return;

        updateStatus.mutate(
            { id: pedidoId, status: newStatus },
            {
                onError: (error: Error) => {
                    toast.error(`Erro ao mover pedido: ${error.message}`);
                },
            }
        );
    }, [updateStatus]);

    const handleDragEnd = useCallback(() => {
        setDragOverColumn(null);
        setDraggingPedidoId(null);
    }, []);

    // Filtrar pedidos cancelados e recusados do kanban
    const activePedidos = pedidos.filter(p => !['cancelado', 'recusado'].includes(p.status));

    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map(col => (
                    <div key={col.id} className="min-w-[280px] flex-shrink-0">
                        <div className="h-8 bg-white/[0.03] rounded-lg mb-3 animate-pulse" />
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {KANBAN_COLUMNS.map(column => {
                const columnPedidos = activePedidos.filter(p => column.statuses.includes(p.status));
                const isOver = dragOverColumn === column.id;

                return (
                    <div
                        key={column.id}
                        className="min-w-[280px] w-[280px] flex-shrink-0"
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={`
              flex items-center justify-between px-3 py-2 rounded-xl mb-3
              bg-gradient-to-r ${column.color} border border-white/[0.04]
            `}>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                                <span className="text-sm font-medium text-gray-300">
                                    {column.title}
                                </span>
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-white/[0.05] px-2 py-0.5 rounded-md">
                                {columnPedidos.length}
                            </span>
                        </div>

                        {/* Column Content */}
                        <div className={`
              space-y-3 min-h-[200px] rounded-2xl p-2 transition-all duration-200
              ${isOver
                                ? 'bg-[#CCFF00]/5 border-2 border-dashed border-[#CCFF00]/30'
                                : 'border-2 border-transparent'
                            }
            `}>
                            {columnPedidos.map(pedido => (
                                <OrderCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onClick={onOrderClick}
                                    onDragStart={handleDragStart}
                                    isDragging={draggingPedidoId === pedido.id}
                                />
                            ))}

                            {columnPedidos.length === 0 && (
                                <div className="flex items-center justify-center h-24 rounded-2xl 
                  border border-dashed border-white/[0.06] text-gray-600 text-xs">
                                    Nenhum pedido
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
