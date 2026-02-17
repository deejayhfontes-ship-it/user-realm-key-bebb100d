<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { OrderRevision, RevisionStatus } from '@/types/order-revision';

// Listar revisões de um pedido
export function useOrderRevisions(pedidoId: string | undefined) {
    return useQuery({
        queryKey: ['order-revisions', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_revisions')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('revision_number', { ascending: true });

            if (error) throw error;
            return (data || []) as unknown as OrderRevision[];
        },
        enabled: !!pedidoId,
    });
}

// Criar nova revisão
export function useCreateRevision() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            pedido_id: string;
            description: string;
            files?: Array<{ nome: string; url: string; tipo?: string }>;
            requested_by?: 'client' | 'admin';
        }) => {
            // Buscar o pedido para verificar limites
            const { data: pedido, error: pedidoError } = await supabase
                .from('pedidos')
                .select('revision_count, max_revisions')
                .eq('id', data.pedido_id)
                .single();

            if (pedidoError) throw pedidoError;

            const isExtra = (pedido.revision_count || 0) >= (pedido.max_revisions || 2);
            const nextNumber = (pedido.revision_count || 0) + 1;

            // Criar revisão
            const { data: revision, error } = await supabase
                .from('order_revisions')
                .insert({
                    pedido_id: data.pedido_id,
                    revision_number: nextNumber,
                    description: data.description,
                    files: (data.files || []) as unknown as import('@/integrations/supabase/types').Json,
                    requested_by: data.requested_by || 'client',
                    is_extra: isExtra,
                })
                .select()
                .single();

            if (error) throw error;

            // Atualizar contador no pedido
            await supabase
                .from('pedidos')
                .update({
                    revision_count: nextNumber,
                    status: 'em_ajustes' as string,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', data.pedido_id);

            // Log de atividade
            await supabase.from('order_activity_logs').insert({
                pedido_id: data.pedido_id,
                action: isExtra ? 'revision_extra_requested' : 'revision_requested',
                actor_type: data.requested_by || 'client',
                details: { revision_number: nextNumber, is_extra: isExtra } as unknown as import('@/integrations/supabase/types').Json,
            });

            return revision;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-revisions', pedido_id] });
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            queryClient.invalidateQueries({ queryKey: ['pedido', pedido_id] });
            toast.success('Revisão solicitada com sucesso');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar revisão: ${error.message}`);
        },
    });
}

// Atualizar status da revisão
export function useUpdateRevisionStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            pedido_id,
            status,
            admin_response
        }: {
            id: string;
            pedido_id: string;
            status: RevisionStatus;
            admin_response?: string;
        }) => {
            const updates: Record<string, unknown> = { status };
            if (admin_response) updates.admin_response = admin_response;
            if (status === 'completed' || status === 'rejected') {
                updates.resolved_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('order_revisions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Se completada, voltar pedido para em_confeccao
            if (status === 'completed') {
                await supabase
                    .from('pedidos')
                    .update({ status: 'em_confeccao' as string, updated_at: new Date().toISOString() })
                    .eq('id', pedido_id);
            }

            // Log
            await supabase.from('order_activity_logs').insert({
                pedido_id,
                action: `revision_${status}`,
                actor_type: 'admin',
                details: { revision_id: id, admin_response } as unknown as import('@/integrations/supabase/types').Json,
            });

            return data;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-revisions', pedido_id] });
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            toast.success('Status da revisão atualizado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar revisão: ${error.message}`);
        },
    });
}
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { OrderRevision, RevisionStatus } from '@/types/order-revision';

// Listar revisões de um pedido
export function useOrderRevisions(pedidoId: string | undefined) {
    return useQuery({
        queryKey: ['order-revisions', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_revisions')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('revision_number', { ascending: true });

            if (error) throw error;
            return (data || []) as unknown as OrderRevision[];
        },
        enabled: !!pedidoId,
    });
}

// Criar nova revisão
export function useCreateRevision() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            pedido_id: string;
            description: string;
            files?: Array<{ nome: string; url: string; tipo?: string }>;
            requested_by?: 'client' | 'admin';
        }) => {
            // Buscar o pedido para verificar limites
            const { data: pedido, error: pedidoError } = await supabase
                .from('pedidos')
                .select('revision_count, max_revisions')
                .eq('id', data.pedido_id)
                .single();

            if (pedidoError) throw pedidoError;

            const isExtra = (pedido.revision_count || 0) >= (pedido.max_revisions || 2);
            const nextNumber = (pedido.revision_count || 0) + 1;

            // Criar revisão
            const { data: revision, error } = await supabase
                .from('order_revisions')
                .insert({
                    pedido_id: data.pedido_id,
                    revision_number: nextNumber,
                    description: data.description,
                    files: (data.files || []) as unknown as import('@/integrations/supabase/types').Json,
                    requested_by: data.requested_by || 'client',
                    is_extra: isExtra,
                })
                .select()
                .single();

            if (error) throw error;

            // Atualizar contador no pedido
            await supabase
                .from('pedidos')
                .update({
                    revision_count: nextNumber,
                    status: 'em_ajustes' as string,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', data.pedido_id);

            // Log de atividade
            await supabase.from('order_activity_logs').insert({
                pedido_id: data.pedido_id,
                action: isExtra ? 'revision_extra_requested' : 'revision_requested',
                actor_type: data.requested_by || 'client',
                details: { revision_number: nextNumber, is_extra: isExtra } as unknown as import('@/integrations/supabase/types').Json,
            });

            return revision;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-revisions', pedido_id] });
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            queryClient.invalidateQueries({ queryKey: ['pedido', pedido_id] });
            toast.success('Revisão solicitada com sucesso');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar revisão: ${error.message}`);
        },
    });
}

// Atualizar status da revisão
export function useUpdateRevisionStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            pedido_id,
            status,
            admin_response
        }: {
            id: string;
            pedido_id: string;
            status: RevisionStatus;
            admin_response?: string;
        }) => {
            const updates: Record<string, unknown> = { status };
            if (admin_response) updates.admin_response = admin_response;
            if (status === 'completed' || status === 'rejected') {
                updates.resolved_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('order_revisions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Se completada, voltar pedido para em_confeccao
            if (status === 'completed') {
                await supabase
                    .from('pedidos')
                    .update({ status: 'em_confeccao' as string, updated_at: new Date().toISOString() })
                    .eq('id', pedido_id);
            }

            // Log
            await supabase.from('order_activity_logs').insert({
                pedido_id,
                action: `revision_${status}`,
                actor_type: 'admin',
                details: { revision_id: id, admin_response } as unknown as import('@/integrations/supabase/types').Json,
            });

            return data;
        },
        onSuccess: (_, { pedido_id }) => {
            queryClient.invalidateQueries({ queryKey: ['order-revisions', pedido_id] });
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            toast.success('Status da revisão atualizado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar revisão: ${error.message}`);
        },
    });
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
