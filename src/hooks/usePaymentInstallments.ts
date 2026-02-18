import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PaymentInstallment, InstallmentStatus } from '@/types/payment-installment';
import type { PaymentMode } from '@/types/pedido';

// Listar parcelas de um pedido
export function usePaymentInstallments(pedidoId: string | undefined) {
    return useQuery({
        queryKey: ['payment-installments', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('payment_installments')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('installment_number', { ascending: true });

            if (error) throw error;
            return (data || []) as unknown as PaymentInstallment[];
        },
        enabled: !!pedidoId,
    });
}

// Gerar parcelas automaticamente baseado no modo de pagamento
export function useCreateInstallments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            pedido_id: string;
            total_amount: number;
            payment_mode: PaymentMode;
            custom_splits?: number[];
            installment_count?: number;
            first_due_date?: string;
        }) => {
            const splits = calculateSplits(data.total_amount, data.payment_mode, data.custom_splits, data.installment_count);
            const baseDate = data.first_due_date ? new Date(data.first_due_date) : new Date();

            const installments = splits.map((amount, index) => ({
                pedido_id: data.pedido_id,
                installment_number: index + 1,
                amount,
                due_date: calculateDueDate(baseDate, index, data.payment_mode),
                status: 'pending' as const,
            }));

            const { data: created, error } = await supabase
                .from('payment_installments')
                .insert(installments)
                .select();

            if (error) throw error;

            // Log
            await supabase.from('order_activity_logs').insert({
                pedido_id: data.pedido_id,
                action: 'installments_created',
                actor_type: 'admin',
                details: {
                    payment_mode: data.payment_mode,
                    count: splits.length,
                    amounts: splits
                } as unknown as import('@/integrations/supabase/types').Json,
            });

            return created;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['payment-installments', pedido_id] });
            toast.success('Parcelas geradas com sucesso');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao gerar parcelas: ${error.message}`);
        },
    });
}

// Confirmar pagamento de parcela
export function useConfirmInstallment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            pedido_id,
            payment_method,
            comprovante_url
        }: {
            id: string;
            pedido_id: string;
            payment_method?: string;
            comprovante_url?: string;
        }) => {
            const { data, error } = await supabase
                .from('payment_installments')
                .update({
                    status: 'paid' as string,
                    paid_at: new Date().toISOString(),
                    payment_method: payment_method || null,
                    comprovante_url: comprovante_url || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Verificar se todas as parcelas foram pagas
            const { data: remaining } = await supabase
                .from('payment_installments')
                .select('id')
                .eq('pedido_id', pedido_id)
                .eq('status', 'pending');

            if (!remaining || remaining.length === 0) {
                // Todas pagas — atualizar status do pedido
                await supabase
                    .from('pedidos')
                    .update({
                        status: 'pagamento_confirmado' as string,
                        data_pagamento: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', pedido_id);
            }

            // Log
            await supabase.from('order_activity_logs').insert({
                pedido_id,
                action: 'installment_paid',
                actor_type: 'admin',
                details: { installment_id: id, payment_method } as unknown as import('@/integrations/supabase/types').Json,
            });

            return data;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['payment-installments', pedido_id] });
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            queryClient.invalidateQueries({ queryKey: ['pedido', pedido_id] });
            toast.success('Pagamento confirmado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao confirmar pagamento: ${error.message}`);
        },
    });
}

// Helpers
function calculateSplits(total: number, mode: PaymentMode, customSplits?: number[], count?: number): number[] {
    switch (mode) {
        case 'full':
            return [total];
        case 'split_50_50':
            return [Math.ceil(total / 2), Math.floor(total / 2)];
        case 'split_30_70':
            return [Math.ceil(total * 0.3), Math.floor(total * 0.7)];
        case 'split_custom':
            return customSplits || [total];
        case 'installments': {
            const n = count || 2;
            const base = Math.floor(total / n);
            const remainder = total - base * n;
            return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
        }
        default:
            return [total];
    }
}

function calculateDueDate(baseDate: Date, index: number, mode: PaymentMode): string {
    const date = new Date(baseDate);
    if (mode === 'full') return date.toISOString().split('T')[0];

    // Primeira parcela = imediata, demais = 30 dias de intervalo
    if (index > 0) {
        date.setDate(date.getDate() + 30 * index);
    }
    return date.toISOString().split('T')[0];
}
