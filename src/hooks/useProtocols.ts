import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Protocol, ProtocolType, ProtocolStatus } from '@/types/protocol';

// ─── Listar todos os protocolos (admin) ─────────────────────────────
export function useProtocols(filters?: { type?: ProtocolType; status?: ProtocolStatus; search?: string }) {
    return useQuery({
        queryKey: ['protocols', filters],
        queryFn: async () => {
            let query = (supabase as any)
                .from('protocols')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters?.type) query = query.eq('type', filters.type);
            if (filters?.status) query = query.eq('status', filters.status);
            if (filters?.search) {
                query = query.or(
                    `protocol_code.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%`
                );
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data ?? []) as Protocol[];
        },
    });
}

// ─── Buscar protocolo por código (público) ──────────────────────────
export function usePublicProtocol(code: string | undefined) {
    return useQuery({
        queryKey: ['protocol-public', code],
        queryFn: async () => {
            if (!code) return null;
            const { data, error } = await supabase.functions.invoke('drive-manager', {
                body: { action: 'GET_PUBLIC', protocol_code: code },
            });
            if (error) throw error;
            return data?.protocol as Protocol | null;
        },
        enabled: !!code,
    });
}

// ─── Criar pasta (CREATE_FOLDER) ────────────────────────────────────
export function useCreateDriveFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: {
            display_name: string;
            type: ProtocolType;
            customer_email?: string;
            pedido_id?: string;
        }) => {
            const { data, error } = await supabase.functions.invoke('drive-manager', {
                body: { action: 'CREATE_FOLDER', ...params },
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
            toast.success('Pasta criada no Google Drive!');
        },
        onError: (err: Error) => {
            toast.error(`Erro ao criar pasta: ${err.message}`);
        },
    });
}

// ─── Habilitar entrega (ENABLE_DELIVERY) ────────────────────────────
export function useEnableDelivery() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (protocol_code: string) => {
            const { data, error } = await supabase.functions.invoke('drive-manager', {
                body: { action: 'ENABLE_DELIVERY', protocol_code },
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
            toast.success('Entrega habilitada! Link púbico ativado.');
        },
        onError: (err: Error) => {
            toast.error(`Erro ao habilitar entrega: ${err.message}`);
        },
    });
}

// ─── Apagar pasta (DELETE_FOLDER) ───────────────────────────────────
export function useDeleteDriveFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (protocol_code: string) => {
            const { data, error } = await supabase.functions.invoke('drive-manager', {
                body: { action: 'DELETE_FOLDER', protocol_code },
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
            toast.success('Pasta removida do Google Drive.');
        },
        onError: (err: Error) => {
            toast.error(`Erro ao apagar pasta: ${err.message}`);
        },
    });
}

// ─── Atualizar status de protocolo ──────────────────────────────────
export function useUpdateProtocolStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ code, status }: { code: string; status: ProtocolStatus }) => {
            const { error } = await (supabase as any)
                .from('protocols')
                .update({ status })
                .eq('protocol_code', code);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['protocols'] });
            toast.success('Status atualizado!');
        },
        onError: (err: Error) => {
            toast.error(`Erro ao atualizar status: ${err.message}`);
        },
    });
}
