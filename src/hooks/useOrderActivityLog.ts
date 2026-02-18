import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipo do log de atividade
export interface OrderActivity {
    id: string;
    pedido_id: string;
    action: string;
    actor_type: 'admin' | 'client' | 'system';
    actor_id: string | null;
    details: Record<string, unknown>;
    created_at: string;
}

// Labels legíveis para ações
export const ACTION_LABELS: Record<string, string> = {
    order_created: 'Pedido criado',
    quote_sent: 'Orçamento enviado',
    quote_approved: 'Orçamento aprovado',
    quote_rejected: 'Orçamento recusado',
    payment_confirmed: 'Pagamento confirmado',
    production_started: 'Produção iniciada',
    revision_requested: 'Revisão solicitada',
    revision_extra_requested: 'Revisão extra solicitada',
    revision_completed: 'Revisão concluída',
    revision_rejected: 'Revisão rejeitada',
    revision_in_progress: 'Revisão em andamento',
    partial_deliverable_added: 'Entregável parcial adicionado',
    final_deliverable_added: 'Entregável final adicionado',
    deliverable_downloaded: 'Arquivo baixado pelo cliente',
    installments_created: 'Parcelas geradas',
    installment_paid: 'Parcela paga',
    status_changed: 'Status alterado',
    nps_submitted: 'Avaliação NPS enviada',
    order_archived: 'Pedido arquivado',
};

// Ícones para ações (Lucide icon names)
export const ACTION_ICONS: Record<string, string> = {
    order_created: 'Plus',
    quote_sent: 'Send',
    quote_approved: 'CheckCircle',
    quote_rejected: 'XCircle',
    payment_confirmed: 'DollarSign',
    production_started: 'Play',
    revision_requested: 'RotateCcw',
    revision_extra_requested: 'AlertTriangle',
    revision_completed: 'CheckCircle',
    revision_rejected: 'XCircle',
    revision_in_progress: 'Clock',
    partial_deliverable_added: 'FileUp',
    final_deliverable_added: 'PackageCheck',
    deliverable_downloaded: 'Download',
    installments_created: 'CreditCard',
    installment_paid: 'BadgeCheck',
    status_changed: 'ArrowRightLeft',
    nps_submitted: 'Star',
    order_archived: 'Archive',
};

// Listar atividades de um pedido
export function useOrderActivityLog(pedidoId: string | undefined) {
    return useQuery({
        queryKey: ['order-activity-log', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_activity_logs')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as unknown as OrderActivity[];
        },
        enabled: !!pedidoId,
    });
}

// Registrar atividade
export function useLogActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            pedido_id: string;
            action: string;
            actor_type?: 'admin' | 'client' | 'system';
            actor_id?: string;
            details?: Record<string, unknown>;
        }) => {
            const { data: log, error } = await supabase
                .from('order_activity_logs')
                .insert({
                    pedido_id: data.pedido_id,
                    action: data.action,
                    actor_type: data.actor_type || 'system',
                    actor_id: data.actor_id || null,
                    details: (data.details || {}) as unknown as import('@/integrations/supabase/types').Json,
                })
                .select()
                .single();

            if (error) throw error;
            return log;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-activity-log', pedido_id] });
        },
    });
}
