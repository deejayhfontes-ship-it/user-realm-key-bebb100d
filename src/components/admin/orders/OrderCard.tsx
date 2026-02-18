import React from 'react';
import { Clock, DollarSign, User, MoreVertical, AlertTriangle, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Pedido } from '@/types/pedido';
import { STATUS_LABELS, STATUS_COLORS, ORDER_TYPE_LABELS } from '@/types/pedido';

interface OrderCardProps {
    pedido: Pedido;
    onClick?: (pedido: Pedido) => void;
    onDragStart?: (e: React.DragEvent, pedido: Pedido) => void;
    isDragging?: boolean;
}

export function OrderCard({ pedido, onClick, onDragStart, isDragging }: OrderCardProps) {
    const hasExhaustedRevisions = pedido.revision_count >= pedido.max_revisions;
    const revisionPercentage = Math.min((pedido.revision_count / pedido.max_revisions) * 100, 100);

    const valor = pedido.valor_orcado
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_orcado / 100)
        : null;

    const tempoDesde = formatDistanceToNow(new Date(pedido.data_briefing), {
        addSuffix: true,
        locale: ptBR,
    });

    return (
        <div
            className={`
        group relative rounded-2xl border border-white/[0.06] bg-[#1a1a2e]/80 
        backdrop-blur-sm p-4 cursor-pointer transition-all duration-200
        hover:border-[#CCFF00]/30 hover:shadow-lg hover:shadow-[#CCFF00]/5
        hover:translate-y-[-2px]
        ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''}
      `}
            onClick={() => onClick?.(pedido)}
            draggable={!!onDragStart}
            onDragStart={(e) => onDragStart?.(e, pedido)}
        >
            {/* Header - Protocolo + Status */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#CCFF00] tracking-wider">
                    {pedido.protocolo}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[pedido.status]}`}>
                    {STATUS_LABELS[pedido.status]}
                </span>
            </div>

            {/* Cliente */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#CCFF00]/20 to-[#CCFF00]/5 
          border border-[#CCFF00]/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-[#CCFF00]" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{pedido.nome}</p>
                    {pedido.empresa && (
                        <p className="text-[10px] text-gray-500 truncate">{pedido.empresa}</p>
                    )}
                </div>
            </div>

            {/* Tipo de pedido badge */}
            <div className="mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 
          border border-white/[0.06]">
                    {ORDER_TYPE_LABELS[pedido.order_type]}
                </span>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
                {valor && (
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 font-medium">{valor}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{tempoDesde}</span>
                </div>
            </div>

            {/* Revisões indicator */}
            {pedido.revision_count > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <RotateCcw className="w-3 h-3 text-gray-500" />
                            <span className="text-[10px] text-gray-500">
                                Revisões: {pedido.revision_count}/{pedido.max_revisions}
                            </span>
                        </div>
                        {hasExhaustedRevisions && (
                            <div className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span className="text-[10px] text-amber-400">Esgotadas</span>
                            </div>
                        )}
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${hasExhaustedRevisions
                                    ? 'bg-amber-400'
                                    : 'bg-[#CCFF00]'
                                }`}
                            style={{ width: `${revisionPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Briefing completeness */}
            {pedido.status === 'briefing' && pedido.briefing_completeness_score < 100 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-500">Briefing</span>
                        <span className="text-[10px] text-[#CCFF00]">{pedido.briefing_completeness_score}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#CCFF00] transition-all duration-300"
                            style={{ width: `${pedido.briefing_completeness_score}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Hover menu indicator */}
            <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 
        transition-opacity p-1 rounded-md hover:bg-white/10"
                onClick={(e) => { e.stopPropagation(); }}
            >
                <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
            </button>
        </div>
    );
}
