import { useState } from 'react';
import { X, Clock, CheckCircle2, XCircle, MessageSquare, AlertTriangle, FileText, Package } from 'lucide-react';
import type { ClientBudget } from '@/hooks/useClientBudgets';

interface BudgetDetailModalProps {
    budget: ClientBudget;
    onClose: () => void;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string) => Promise<void>;
    onRequestChange: (id: string, message: string) => Promise<void>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Rascunho', color: '#999', bg: 'rgba(153,153,153,0.15)' },
    sent: { label: 'Pendente', color: '#f5a623', bg: 'rgba(245,166,35,0.15)' },
    approved: { label: 'Aprovado', color: '#4caf50', bg: 'rgba(76,175,80,0.15)' },
    rejected: { label: 'Recusado', color: '#ef5350', bg: 'rgba(239,83,80,0.15)' },
    expired: { label: 'Expirado', color: '#ef5350', bg: 'rgba(239,83,80,0.15)' },
};

export function BudgetDetailModal({
    budget,
    onClose,
    onApprove,
    onReject,
    onRequestChange,
}: BudgetDetailModalProps) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showChangeForm, setShowChangeForm] = useState(false);
    const [changeMessage, setChangeMessage] = useState('');
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const status = statusConfig[budget.computedStatus] || statusConfig.sent;
    const canAct = budget.computedStatus === 'sent';
    const isExpired = budget.computedStatus === 'expired';

    const handleApprove = async () => {
        setActionLoading(true);
        await onApprove(budget.id);
        setActionLoading(false);
    };

    const handleReject = async () => {
        setActionLoading(true);
        await onReject(budget.id);
        setActionLoading(false);
        setShowRejectConfirm(false);
    };

    const handleRequestChange = async () => {
        if (!changeMessage.trim()) return;
        setActionLoading(true);
        await onRequestChange(budget.id, changeMessage.trim());
        setActionLoading(false);
        setShowChangeForm(false);
        setChangeMessage('');
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: '#f5f5f0',
                    borderRadius: '16px',
                    color: '#1a1a1a',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-6"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: '#c8e632', color: '#1a1a1a' }}
                        >
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold" style={{ color: '#1a1a1a' }}>
                                {budget.budget_number}
                            </h2>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-0.5"
                                style={{ color: status.color, backgroundColor: status.bg }}
                            >
                                {status.label}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    >
                        <X className="w-4 h-4" style={{ color: '#666' }} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Expiry countdown */}
                    {budget.daysUntilExpiry !== null && budget.daysUntilExpiry > 0 && canAct && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-xl text-sm"
                            style={{
                                backgroundColor: budget.daysUntilExpiry <= 3
                                    ? 'rgba(239,83,80,0.1)'
                                    : 'rgba(245,166,35,0.1)',
                                color: budget.daysUntilExpiry <= 3 ? '#ef5350' : '#f5a623',
                            }}
                        >
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">
                                {budget.daysUntilExpiry === 1
                                    ? 'Expira amanhã'
                                    : `Expira em ${budget.daysUntilExpiry} dias`}
                            </span>
                        </div>
                    )}

                    {isExpired && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-xl text-sm"
                            style={{ backgroundColor: 'rgba(239,83,80,0.1)', color: '#ef5350' }}
                        >
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">
                                Este orçamento expirou. Solicite um novo se ainda tiver interesse.
                            </span>
                        </div>
                    )}

                    {/* Budget items */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: '#666' }}>
                            ITENS DO ORÇAMENTO
                        </h3>
                        <div className="space-y-2">
                            {budget.lines.length === 0 ? (
                                <p className="text-sm" style={{ color: '#999' }}>
                                    Nenhum item detalhado
                                </p>
                            ) : (
                                budget.lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Package className="w-4 h-4 flex-shrink-0" style={{ color: '#999' }} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{line.description}</p>
                                                <p className="text-xs" style={{ color: '#999' }}>
                                                    {line.quantity}x · {formatCurrency(line.unit_price)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold ml-3 flex-shrink-0">
                                            {formatCurrency(line.total)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div
                        className="p-4 rounded-xl space-y-3"
                        style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                    >
                        {budget.subtotal !== budget.total && (
                            <div className="flex justify-between text-sm">
                                <span style={{ color: '#666' }}>Subtotal</span>
                                <span>{formatCurrency(budget.subtotal)}</span>
                            </div>
                        )}
                        {budget.global_discount_value > 0 && (
                            <div className="flex justify-between text-sm">
                                <span style={{ color: '#666' }}>Desconto</span>
                                <span style={{ color: '#ef5350' }}>
                                    -{budget.global_discount_type === 'percent'
                                        ? `${budget.global_discount_value}%`
                                        : formatCurrency(budget.global_discount_value)}
                                </span>
                            </div>
                        )}
                        {budget.shipping > 0 && (
                            <div className="flex justify-between text-sm">
                                <span style={{ color: '#666' }}>Frete</span>
                                <span>{formatCurrency(budget.shipping)}</span>
                            </div>
                        )}
                        <div
                            className="flex justify-between pt-3 font-bold text-base"
                            style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
                        >
                            <span>Total</span>
                            <span style={{ color: '#1a1a1a' }}>{formatCurrency(budget.total)}</span>
                        </div>
                    </div>

                    {/* Validity & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Validade</p>
                            <p className="text-sm font-semibold">{budget.validity_days} dias</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#999' }}>Data</p>
                            <p className="text-sm font-semibold">
                                {new Date(budget.date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>

                    {budget.notes && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2" style={{ color: '#666' }}>
                                OBSERVAÇÕES
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
                                {budget.notes}
                            </p>
                        </div>
                    )}

                    {/* Terms & Conditions */}
                    {budget.terms_and_conditions && canAct && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2" style={{ color: '#666' }}>
                                TERMOS E CONDIÇÕES
                            </h3>
                            <div
                                className="p-3 rounded-xl text-sm leading-relaxed mb-3"
                                style={{ backgroundColor: 'rgba(0,0,0,0.04)', color: '#555', maxHeight: '160px', overflowY: 'auto' }}
                            >
                                {budget.terms_and_conditions}
                            </div>
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded"
                                    style={{ accentColor: '#c8e632' }}
                                />
                                <span className="text-sm" style={{ color: '#555' }}>
                                    Li e aceito os termos e condições acima
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Change request form */}
                    {showChangeForm && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold" style={{ color: '#666' }}>
                                SOLICITAR ALTERAÇÃO
                            </h3>
                            <textarea
                                value={changeMessage}
                                onChange={(e) => setChangeMessage(e.target.value)}
                                placeholder="Descreva as alterações que deseja no orçamento..."
                                rows={4}
                                className="w-full p-3 rounded-xl text-sm resize-none outline-none"
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    color: '#1a1a1a',
                                }}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRequestChange}
                                    disabled={!changeMessage.trim() || actionLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                                    style={{ backgroundColor: '#c8e632', color: '#1a1a1a' }}
                                >
                                    {actionLoading ? 'Enviando...' : 'Enviar Solicitação'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowChangeForm(false);
                                        setChangeMessage('');
                                    }}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#666' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reject confirmation */}
                    {showRejectConfirm && (
                        <div
                            className="p-4 rounded-xl space-y-3"
                            style={{ backgroundColor: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)' }}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" style={{ color: '#ef5350' }} />
                                <p className="text-sm font-semibold" style={{ color: '#ef5350' }}>
                                    Tem certeza que deseja recusar?
                                </p>
                            </div>
                            <p className="text-sm" style={{ color: '#666' }}>
                                Esta ação não pode ser desfeita. O orçamento será marcado como recusado.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                                    style={{ backgroundColor: '#ef5350' }}
                                >
                                    {actionLoading ? 'Recusando...' : 'Sim, Recusar'}
                                </button>
                                <button
                                    onClick={() => setShowRejectConfirm(false)}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#666' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {canAct && !showChangeForm && !showRejectConfirm && (
                        <div className="space-y-3 pt-2">
                            <button
                                onClick={handleApprove}
                                disabled={
                                    (budget.terms_and_conditions ? !termsAccepted : false) || actionLoading
                                }
                                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#c8e632', color: '#1a1a1a' }}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {actionLoading ? 'Aprovando...' : 'Aprovar Orçamento'}
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowChangeForm(true)}
                                    className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#555' }}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Solicitar Alteração
                                </button>
                                <button
                                    onClick={() => setShowRejectConfirm(true)}
                                    className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                                    style={{ backgroundColor: 'rgba(239,83,80,0.08)', color: '#ef5350' }}
                                >
                                    <XCircle className="w-4 h-4" />
                                    Recusar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status messages for non-actionable budgets */}
                    {budget.computedStatus === 'approved' && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-xl text-sm"
                            style={{ backgroundColor: 'rgba(76,175,80,0.1)', color: '#4caf50' }}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">Orçamento aprovado</span>
                        </div>
                    )}
                    {budget.computedStatus === 'rejected' && (
                        <div
                            className="flex items-center gap-2 p-3 rounded-xl text-sm"
                            style={{ backgroundColor: 'rgba(239,83,80,0.1)', color: '#ef5350' }}
                        >
                            <XCircle className="w-4 h-4" />
                            <span className="font-medium">Orçamento recusado</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
