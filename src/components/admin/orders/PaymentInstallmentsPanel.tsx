<<<<<<< HEAD
import React from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, XCircle, Upload, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentInstallments, useConfirmInstallment } from '@/hooks/usePaymentInstallments';
import { INSTALLMENT_STATUS_LABELS, INSTALLMENT_STATUS_COLORS } from '@/types/payment-installment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentInstallmentsPanelProps {
    pedidoId: string;
    paymentMode: string;
}

export function PaymentInstallmentsPanel({ pedidoId, paymentMode }: PaymentInstallmentsPanelProps) {
    const { data: installments = [], isLoading } = usePaymentInstallments(pedidoId);
    const confirmPayment = useConfirmInstallment();

    const totalPaid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const totalPending = installments.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.amount, 0);
    const total = installments.reduce((s, i) => s + i.amount, 0);
    const progress = total > 0 ? Math.round((totalPaid / total) * 100) : 0;

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

    const statusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-400" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}
            </div>
        );
    }

    if (installments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <CreditCard className="w-10 h-10 mb-3 text-gray-600" />
                <p className="text-sm">Nenhuma parcela configurada</p>
                <p className="text-xs text-gray-600 mt-1">
                    {paymentMode === 'full' ? 'Pagamento integral configurado' : 'Gere as parcelas no orçamento'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary bar */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#CCFF00]" />
                        <span className="text-sm text-white font-medium">
                            {formatCurrency(totalPaid)} <span className="text-gray-500 font-normal">/ {formatCurrency(total)}</span>
                        </span>
                    </div>
                    <span className="text-xs text-[#CCFF00] font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#CCFF00] to-green-400 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {totalPending > 0 && (
                    <p className="text-[10px] text-gray-500 mt-1.5">
                        Pendente: {formatCurrency(totalPending)}
                    </p>
                )}
            </div>

            {/* Installments list */}
            <div className="space-y-2">
                {installments.map((inst) => (
                    <div
                        key={inst.id}
                        className={`
              flex items-center gap-3 p-3 rounded-xl border transition-all
              ${inst.status === 'overdue'
                                ? 'bg-red-500/5 border-red-500/20'
                                : inst.status === 'paid'
                                    ? 'bg-green-500/5 border-green-500/20'
                                    : 'bg-white/[0.03] border-white/[0.06]'
                            }
            `}
                    >
                        {/* Status icon */}
                        {statusIcon(inst.status)}

                        {/* Number */}
                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-mono text-gray-400">{inst.installment_number}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-medium">{formatCurrency(inst.amount)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${INSTALLMENT_STATUS_COLORS[inst.status]}`}>
                                    {INSTALLMENT_STATUS_LABELS[inst.status]}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span>Vencimento: {format(new Date(inst.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                {inst.paid_at && (
                                    <>
                                        <span>•</span>
                                        <span className="text-green-500">
                                            Pago em {format(new Date(inst.paid_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {inst.status === 'pending' || inst.status === 'overdue' ? (
                            <Button
                                size="sm"
                                onClick={() => confirmPayment.mutate({ id: inst.id, pedido_id: pedidoId })}
                                disabled={confirmPayment.isPending}
                                className="bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00]/20 border border-[#CCFF00]/20 text-xs h-7"
                            >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmar
                            </Button>
                        ) : null}

                        {/* Comprovante indicator */}
                        {inst.comprovante_url && (
                            <a href={inst.comprovante_url} target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-[#CCFF00]">
                                <Upload className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
=======
import React from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, XCircle, Upload, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaymentInstallments, useConfirmInstallment } from '@/hooks/usePaymentInstallments';
import { INSTALLMENT_STATUS_LABELS, INSTALLMENT_STATUS_COLORS } from '@/types/payment-installment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentInstallmentsPanelProps {
    pedidoId: string;
    paymentMode: string;
}

export function PaymentInstallmentsPanel({ pedidoId, paymentMode }: PaymentInstallmentsPanelProps) {
    const { data: installments = [], isLoading } = usePaymentInstallments(pedidoId);
    const confirmPayment = useConfirmInstallment();

    const totalPaid = installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const totalPending = installments.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.amount, 0);
    const total = installments.reduce((s, i) => s + i.amount, 0);
    const progress = total > 0 ? Math.round((totalPaid / total) * 100) : 0;

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);

    const statusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-400" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}
            </div>
        );
    }

    if (installments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <CreditCard className="w-10 h-10 mb-3 text-gray-600" />
                <p className="text-sm">Nenhuma parcela configurada</p>
                <p className="text-xs text-gray-600 mt-1">
                    {paymentMode === 'full' ? 'Pagamento integral configurado' : 'Gere as parcelas no orçamento'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary bar */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#CCFF00]" />
                        <span className="text-sm text-white font-medium">
                            {formatCurrency(totalPaid)} <span className="text-gray-500 font-normal">/ {formatCurrency(total)}</span>
                        </span>
                    </div>
                    <span className="text-xs text-[#CCFF00] font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#CCFF00] to-green-400 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {totalPending > 0 && (
                    <p className="text-[10px] text-gray-500 mt-1.5">
                        Pendente: {formatCurrency(totalPending)}
                    </p>
                )}
            </div>

            {/* Installments list */}
            <div className="space-y-2">
                {installments.map((inst) => (
                    <div
                        key={inst.id}
                        className={`
              flex items-center gap-3 p-3 rounded-xl border transition-all
              ${inst.status === 'overdue'
                                ? 'bg-red-500/5 border-red-500/20'
                                : inst.status === 'paid'
                                    ? 'bg-green-500/5 border-green-500/20'
                                    : 'bg-white/[0.03] border-white/[0.06]'
                            }
            `}
                    >
                        {/* Status icon */}
                        {statusIcon(inst.status)}

                        {/* Number */}
                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-mono text-gray-400">{inst.installment_number}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-medium">{formatCurrency(inst.amount)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${INSTALLMENT_STATUS_COLORS[inst.status]}`}>
                                    {INSTALLMENT_STATUS_LABELS[inst.status]}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span>Vencimento: {format(new Date(inst.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                {inst.paid_at && (
                                    <>
                                        <span>•</span>
                                        <span className="text-green-500">
                                            Pago em {format(new Date(inst.paid_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {inst.status === 'pending' || inst.status === 'overdue' ? (
                            <Button
                                size="sm"
                                onClick={() => confirmPayment.mutate({ id: inst.id, pedido_id: pedidoId })}
                                disabled={confirmPayment.isPending}
                                className="bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00]/20 border border-[#CCFF00]/20 text-xs h-7"
                            >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmar
                            </Button>
                        ) : null}

                        {/* Comprovante indicator */}
                        {inst.comprovante_url && (
                            <a href={inst.comprovante_url} target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-[#CCFF00]">
                                <Upload className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
