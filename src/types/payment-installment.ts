// Status da parcela
export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// Interface da parcela
export interface PaymentInstallment {
    id: string;
    pedido_id: string;
    installment_number: number;
    amount: number;
    due_date: string;
    status: InstallmentStatus;
    payment_method: string | null;
    paid_at: string | null;
    comprovante_url: string | null;
    created_at: string;
    updated_at: string;
}

// Labels para status
export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Em Atraso',
    cancelled: 'Cancelado',
};

// Cores para status
export const INSTALLMENT_STATUS_COLORS: Record<InstallmentStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    paid: 'bg-green-500/20 text-green-400',
    overdue: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
};
