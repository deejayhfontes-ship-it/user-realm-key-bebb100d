import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ClientPermission {
    id: string;
    client_id: string;
    page_id: string;
    granted: boolean;
    created_at: string | null;
    page?: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        icon: string;
        status: string;
    };
}

export interface PermissionToggle {
    page_id: string;
    granted: boolean;
}

export function useClientPermissions(clientId: string | null) {
    return useQuery({
        queryKey: ['client-permissions', clientId],
        queryFn: async () => {
            if (!clientId) return [];

            const { data, error } = await supabase
                .from('client_permissions')
                .select(`
          id,
          client_id,
          page_id,
          granted,
          created_at,
          page:access_pages (
            id,
            name,
            slug,
            description,
            icon,
            status
          )
        `)
                .eq('client_id', clientId);

            if (error) throw error;
            return data as ClientPermission[];
        },
        enabled: !!clientId,
    });
}

export function useUpdateClientPermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            clientId,
            permissions,
        }: {
            clientId: string;
            permissions: PermissionToggle[];
        }) => {
            // Upsert all permissions in one operation
            const records = permissions.map((p) => ({
                client_id: clientId,
                page_id: p.page_id,
                granted: p.granted,
            }));

            const { error } = await supabase
                .from('client_permissions')
                .upsert(records, { onConflict: 'client_id,page_id' });

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['client-permissions', variables.clientId],
            });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast({
                title: 'Permissões atualizadas',
                description: 'As permissões do cliente foram salvas com sucesso.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao salvar permissões',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

export function useClientPermissionCount(clientId: string | null) {
    return useQuery({
        queryKey: ['client-permissions-count', clientId],
        queryFn: async () => {
            if (!clientId) return { granted: 0, total: 0 };

            const { count: grantedCount, error: grantedError } = await supabase
                .from('client_permissions')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', clientId)
                .eq('granted', true);

            if (grantedError) throw grantedError;

            const { count: totalCount, error: totalError } = await supabase
                .from('access_pages')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            if (totalError) throw totalError;

            return { granted: grantedCount || 0, total: totalCount || 0 };
        },
        enabled: !!clientId,
    });
}
