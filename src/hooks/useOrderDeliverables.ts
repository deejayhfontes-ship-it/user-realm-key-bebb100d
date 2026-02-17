<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { OrderDeliverable } from '@/types/order-deliverable';

// Listar entregáveis de um pedido
export function useOrderDeliverables(pedidoId: string | undefined) {
    return useQuery({
        queryKey: ['order-deliverables', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_deliverables')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('delivered_at', { ascending: false });

            if (error) throw error;
            return (data || []) as unknown as OrderDeliverable[];
        },
        enabled: !!pedidoId,
    });
}

// Adicionar entregável
export function useAddDeliverable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            pedido_id: string;
            file_url: string;
            file_name: string;
            file_type?: string;
            file_size?: number;
            is_final?: boolean;
            expires_days?: number;
        }) => {
            const expiresAt = data.expires_days
                ? new Date(Date.now() + data.expires_days * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const { data: deliverable, error } = await supabase
                .from('order_deliverables')
                .insert({
                    pedido_id: data.pedido_id,
                    file_url: data.file_url,
                    file_name: data.file_name,
                    file_type: data.file_type || null,
                    file_size: data.file_size || null,
                    is_final: data.is_final || false,
                    expires_at: expiresAt,
                })
                .select()
                .single();

            if (error) throw error;

            // Log
            await supabase.from('order_activity_logs').insert({
                pedido_id: data.pedido_id,
                action: data.is_final ? 'final_deliverable_added' : 'partial_deliverable_added',
                actor_type: 'admin',
                details: { file_name: data.file_name, is_final: data.is_final } as unknown as import('@/integrations/supabase/types').Json,
            });

            return deliverable;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-deliverables', pedido_id] });
            toast.success('Entregável adicionado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao adicionar entregável: ${error.message}`);
        },
    });
}

// Registrar download
export function useMarkDownloaded() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, pedido_id }: { id: string; pedido_id: string }) => {
            const { error } = await supabase
                .from('order_deliverables')
                .update({ downloaded_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('order_activity_logs').insert({
                pedido_id,
                action: 'deliverable_downloaded',
                actor_type: 'client',
                details: { deliverable_id: id } as unknown as import('@/integrations/supabase/types').Json,
            });
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-deliverables', pedido_id] });
        },
    });
}
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { OrderDeliverable } from '@/types/order-deliverable';

// Listar entregáveis de um pedido
export function useOrderDeliverables(pedidoId: string | undefined) {
    return useQuery({
        queryKey: ['order-deliverables', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_deliverables')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('delivered_at', { ascending: false });

            if (error) throw error;
            return (data || []) as unknown as OrderDeliverable[];
        },
        enabled: !!pedidoId,
    });
}

// Adicionar entregável
export function useAddDeliverable() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            pedido_id: string;
            file_url: string;
            file_name: string;
            file_type?: string;
            file_size?: number;
            is_final?: boolean;
            expires_days?: number;
        }) => {
            const expiresAt = data.expires_days
                ? new Date(Date.now() + data.expires_days * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const { data: deliverable, error } = await supabase
                .from('order_deliverables')
                .insert({
                    pedido_id: data.pedido_id,
                    file_url: data.file_url,
                    file_name: data.file_name,
                    file_type: data.file_type || null,
                    file_size: data.file_size || null,
                    is_final: data.is_final || false,
                    expires_at: expiresAt,
                })
                .select()
                .single();

            if (error) throw error;

            // Log
            await supabase.from('order_activity_logs').insert({
                pedido_id: data.pedido_id,
                action: data.is_final ? 'final_deliverable_added' : 'partial_deliverable_added',
                actor_type: 'admin',
                details: { file_name: data.file_name, is_final: data.is_final } as unknown as import('@/integrations/supabase/types').Json,
            });

            return deliverable;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-deliverables', pedido_id] });
            toast.success('Entregável adicionado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao adicionar entregável: ${error.message}`);
        },
    });
}

// Registrar download
export function useMarkDownloaded() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, pedido_id }: { id: string; pedido_id: string }) => {
            const { error } = await supabase
                .from('order_deliverables')
                .update({ downloaded_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('order_activity_logs').insert({
                pedido_id,
                action: 'deliverable_downloaded',
                actor_type: 'client',
                details: { deliverable_id: id } as unknown as import('@/integrations/supabase/types').Json,
            });
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-deliverables', pedido_id] });
        },
    });
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
