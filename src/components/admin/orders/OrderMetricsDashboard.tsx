import React, { useMemo } from 'react';
import { DollarSign, Clock, RotateCcw, TrendingUp, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePedidos } from '@/hooks/usePedidos';
import type { Pedido } from '@/types/pedido';

export function OrderMetricsDashboard() {
    const { data: pedidos = [] } = usePedidos();

    const metrics = useMemo(() => {
        const finalizados = pedidos.filter(p => p.status === 'finalizado');
        const ativos = pedidos.filter(p => !['cancelado', 'recusado', 'finalizado'].includes(p.status));

        // Ticket médio (centavos → reais)
        const totalReceita = finalizados.reduce((s, p) => s + (p.valor_orcado || 0), 0);
        const ticketMedio = finalizados.length > 0 ? totalReceita / finalizados.length : 0;

        // Tempo médio de produção (dias entre data_aprovacao e data_entrega)
        const temposProd = finalizados
            .filter(p => p.data_aprovacao && p.data_entrega)
            .map(p => {
                const inicio = new Date(p.data_aprovacao!).getTime();
                const fim = new Date(p.data_entrega!).getTime();
                return (fim - inicio) / (1000 * 60 * 60 * 24);
            });
        const tempoMedio = temposProd.length > 0
            ? Math.round(temposProd.reduce((s, t) => s + t, 0) / temposProd.length)
            : 0;

        // Taxa de revisão extra
        const comRevisaoExtra = finalizados.filter(p => p.revision_count > p.max_revisions).length;
        const taxaRevisaoExtra = finalizados.length > 0
            ? Math.round((comRevisaoExtra / finalizados.length) * 100)
            : 0;

        // Receita total
        const receitaTotal = totalReceita;

        // Alertas
        const now = Date.now();
        const parados = ativos.filter(p => {
            const updated = new Date(p.updated_at).getTime();
            return (now - updated) > 2 * 24 * 60 * 60 * 1000; // > 2 dias
        });
        const pagamentosPendentes = ativos.filter(p =>
            p.status === 'aguardando_pagamento' || p.status === 'aguardando_pagamento_final'
        );

        return {
            ticketMedio,
            tempoMedio,
            taxaRevisaoExtra,
            receitaTotal,
            totalPedidos: pedidos.length,
            ativosCount: ativos.length,
            finalizadosCount: finalizados.length,
            paradosCount: parados.length,
            pagamentosPendentesCount: pagamentosPendentes.length,
        };
    }, [pedidos]);

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

    const cards = [
        {
            label: 'Ticket Médio',
            value: formatCurrency(metrics.ticketMedio),
            icon: DollarSign,
            color: 'from-[#CCFF00]/20 to-[#CCFF00]/5',
            iconColor: 'text-[#CCFF00]',
            borderColor: 'border-[#CCFF00]/20',
        },
        {
            label: 'Tempo Médio',
            value: `${metrics.tempoMedio} dias`,
            icon: Clock,
            color: 'from-blue-500/20 to-blue-500/5',
            iconColor: 'text-blue-400',
            borderColor: 'border-blue-500/20',
        },
        {
            label: 'Taxa Rev. Extra',
            value: `${metrics.taxaRevisaoExtra}%`,
            icon: RotateCcw,
            color: 'from-amber-500/20 to-amber-500/5',
            iconColor: 'text-amber-400',
            borderColor: 'border-amber-500/20',
        },
        {
            label: 'Receita Total',
            value: formatCurrency(metrics.receitaTotal),
            icon: TrendingUp,
            color: 'from-green-500/20 to-green-500/5',
            iconColor: 'text-green-400',
            borderColor: 'border-green-500/20',
        },
        {
            label: 'Pedidos Ativos',
            value: String(metrics.ativosCount),
            icon: Package,
            color: 'from-purple-500/20 to-purple-500/5',
            iconColor: 'text-purple-400',
            borderColor: 'border-purple-500/20',
        },
        {
            label: 'Finalizados',
            value: String(metrics.finalizadosCount),
            icon: CheckCircle,
            color: 'from-emerald-500/20 to-emerald-500/5',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {cards.map(card => (
                    <div
                        key={card.label}
                        className={`
              rounded-2xl bg-gradient-to-br ${card.color} 
              border ${card.borderColor} p-4
              hover:scale-[1.02] transition-transform duration-200
            `}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                            <span className="text-[11px] text-gray-400">{card.label}</span>
                        </div>
                        <p className="text-lg font-semibold text-white">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Alerts */}
            {(metrics.paradosCount > 0 || metrics.pagamentosPendentesCount > 0) && (
                <div className="flex flex-wrap gap-3">
                    {metrics.paradosCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400">
                                {metrics.paradosCount} pedido(s) parado(s) há +2 dias
                            </span>
                        </div>
                    )}
                    {metrics.pagamentosPendentesCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-amber-400">
                                {metrics.pagamentosPendentesCount} pagamento(s) pendente(s)
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
