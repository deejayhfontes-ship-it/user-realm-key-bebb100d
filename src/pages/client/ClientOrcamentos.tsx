import { useClientBudgets, type ClientBudget } from '@/hooks/useClientBudgets';
import { BudgetDetailModal } from '@/components/client/BudgetDetailModal';
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    draft: { label: 'Rascunho', color: '#999', bg: 'rgba(153,153,153,0.15)', icon: FileText },
    sent: { label: 'Pendente', color: '#f5a623', bg: 'rgba(245,166,35,0.15)', icon: Clock },
    approved: { label: 'Aprovado', color: '#4caf50', bg: 'rgba(76,175,80,0.15)', icon: CheckCircle2 },
    rejected: { label: 'Recusado', color: '#ef5350', bg: 'rgba(239,83,80,0.15)', icon: XCircle },
    expired: { label: 'Expirado', color: '#ef5350', bg: 'rgba(239,83,80,0.15)', icon: AlertTriangle },
};

function BudgetCard({
    budget,
    onClick,
}: {
    budget: ClientBudget;
    onClick: () => void;
}) {
    const status = statusConfig[budget.computedStatus] || statusConfig.sent;
    const StatusIcon = status.icon;
    const isExpired = budget.computedStatus === 'expired';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <button
            onClick={onClick}
            className="w-full text-left transition-all duration-200 group"
            style={{
                backgroundColor: '#f5f5f0',
                borderRadius: '16px',
                opacity: isExpired ? 0.6 : 1,
            }}
        >
            <div className="p-5 space-y-4">
                {/* Top row */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                            style={{ backgroundColor: isExpired ? 'rgba(239,83,80,0.12)' : '#c8e632' }}
                        >
                            <FileText
                                className="w-5 h-5"
                                style={{ color: isExpired ? '#ef5350' : '#1a1a1a' }}
                            />
                        </div>
                        <div>
                            <p className="font-bold text-sm" style={{ color: '#1a1a1a' }}>
                                {budget.budget_number}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                                {new Date(budget.date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                    <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
                        style={{ color: status.color, backgroundColor: status.bg }}
                    >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                    </span>
                </div>

                {/* Lines preview */}
                {budget.lines.length > 0 && (
                    <div className="space-y-1">
                        {budget.lines.slice(0, 2).map((line) => (
                            <p key={line.id} className="text-xs truncate" style={{ color: '#666' }}>
                                • {line.description}
                            </p>
                        ))}
                        {budget.lines.length > 2 && (
                            <p className="text-xs" style={{ color: '#999' }}>
                                +{budget.lines.length - 2} item(ns)
                            </p>
                        )}
                    </div>
                )}

                {/* Bottom row */}
                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
                >
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" style={{ color: '#999' }} />
                        <span className="text-xs" style={{ color: '#999' }}>
                            {budget.daysUntilExpiry !== null && budget.daysUntilExpiry > 0
                                ? `${budget.daysUntilExpiry}d restantes`
                                : isExpired
                                    ? 'Expirado'
                                    : `${budget.validity_days}d validade`}
                        </span>
                    </div>
                    <span
                        className="text-base font-bold"
                        style={{ color: '#1a1a1a' }}
                    >
                        {formatCurrency(budget.total)}
                    </span>
                </div>
            </div>
        </button>
    );
}

export default function ClientOrcamentos() {
    const {
        budgets,
        loading,
        selectedBudget,
        setSelectedBudget,
        approveBudget,
        rejectBudget,
        requestChange,
    } = useClientBudgets();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="max-w-4xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: '#f5f5f0' }}>
                            Meus Orçamentos
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'rgba(245,245,240,0.5)' }}>
                            Visualize e gerencie seus orçamentos
                        </p>
                    </div>
                    {budgets.length > 0 && (
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: 'rgba(200,230,50,0.15)', color: '#c8e632' }}
                        >
                            {budgets.filter(b => b.computedStatus === 'sent').length} pendente(s)
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-36 rounded-2xl animate-pulse"
                                style={{ backgroundColor: 'rgba(245,245,240,0.06)' }}
                            />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && budgets.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center py-20 rounded-2xl"
                        style={{ backgroundColor: 'rgba(245,245,240,0.04)' }}
                    >
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: 'rgba(200,230,50,0.15)' }}
                        >
                            <FileText className="w-8 h-8" style={{ color: '#c8e632' }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#f5f5f0' }}>
                            Nenhum orçamento encontrado
                        </h3>
                        <p className="text-sm mb-6 text-center max-w-sm" style={{ color: 'rgba(245,245,240,0.5)' }}>
                            Quando o time enviar um orçamento para você, ele aparecerá aqui.
                        </p>
                        <button
                            onClick={() => navigate('/briefing')}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-105"
                            style={{ backgroundColor: '#c8e632', color: '#1a1a1a' }}
                        >
                            <Plus className="w-4 h-4" />
                            Solicitar Orçamento
                        </button>
                    </div>
                )}

                {/* Budget grid */}
                {!loading && budgets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onClick={() => setSelectedBudget(budget)}
                            />
                        ))}
                    </div>
                )}

                {/* Expired CTA */}
                {!loading && budgets.some(b => b.computedStatus === 'expired') && (
                    <div
                        className="mt-8 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4"
                        style={{ backgroundColor: 'rgba(245,245,240,0.04)', border: '1px solid rgba(245,245,240,0.08)' }}
                    >
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-sm font-semibold" style={{ color: '#f5f5f0' }}>
                                Possui orçamentos expirados?
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'rgba(245,245,240,0.5)' }}>
                                Solicite um novo orçamento atualizado para seus projetos.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/briefing')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-transform hover:scale-105"
                            style={{ backgroundColor: '#c8e632', color: '#1a1a1a' }}
                        >
                            <Plus className="w-4 h-4" />
                            Solicitar Novo Orçamento
                        </button>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selectedBudget && (
                <BudgetDetailModal
                    budget={selectedBudget}
                    onClose={() => setSelectedBudget(null)}
                    onApprove={approveBudget}
                    onReject={rejectBudget}
                    onRequestChange={requestChange}
                />
            )}
        </div>
    );
}
