import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AccessPage {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
}

export interface CreateAccessPageData {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    status?: 'active' | 'inactive';
}

export interface UpdateAccessPageData extends Partial<CreateAccessPageData> {
    id: string;
}

export function useAccessPages(statusFilter?: string) {
    return useQuery({
        queryKey: ['access-pages', statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('access_pages')
                .select('*')
                .order('name', { ascending: true });

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as AccessPage[];
        },
    });
}

export function useCreateAccessPage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateAccessPageData) => {
            const { data: result, error } = await supabase
                .from('access_pages')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['access-pages'] });
            toast({
                title: 'Página criada',
                description: 'A página de acesso foi criada com sucesso.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao criar página',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

export function useUpdateAccessPage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateAccessPageData) => {
            const { data: result, error } = await supabase
                .from('access_pages')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['access-pages'] });
            toast({
                title: 'Página atualizada',
                description: 'A página de acesso foi atualizada com sucesso.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao atualizar página',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

export function useDeleteAccessPage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('access_pages')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['access-pages'] });
            toast({
                title: 'Página removida',
                description: 'A página de acesso foi removida com sucesso.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao remover página',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}
