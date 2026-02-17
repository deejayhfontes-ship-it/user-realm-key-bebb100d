<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { BriefingTemplate, BriefingSchemaJson } from '@/types/briefing-template';

// Listar templates ativos
export function useBriefingTemplates() {
    return useQuery({
        queryKey: ['briefing-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('briefing_templates')
                .select('*, services(id, title, icon)')
                .order('name');

            if (error) throw error;
            return (data || []) as unknown as BriefingTemplate[];
        },
    });
}

// Detalhe de um template
export function useBriefingTemplate(templateId: string | undefined) {
    return useQuery({
        queryKey: ['briefing-template', templateId],
        queryFn: async () => {
            if (!templateId) return null;
            const { data, error } = await supabase
                .from('briefing_templates')
                .select('*, services(id, title, icon)')
                .eq('id', templateId)
                .single();

            if (error) throw error;
            return data as unknown as BriefingTemplate;
        },
        enabled: !!templateId,
    });
}

// Templates por serviço
export function useBriefingTemplatesByService(serviceId: string | undefined) {
    return useQuery({
        queryKey: ['briefing-templates', 'service', serviceId],
        queryFn: async () => {
            if (!serviceId) return [];
            const { data, error } = await supabase
                .from('briefing_templates')
                .select('*')
                .eq('service_id', serviceId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return (data || []) as unknown as BriefingTemplate[];
        },
        enabled: !!serviceId,
    });
}

// Criar template
export function useCreateBriefingTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            service_id?: string;
            schema_json: BriefingSchemaJson;
        }) => {
            const { data: template, error } = await supabase
                .from('briefing_templates')
                .insert({
                    name: data.name,
                    description: data.description || null,
                    service_id: data.service_id || null,
                    schema_json: data.schema_json as unknown as import('@/integrations/supabase/types').Json,
                })
                .select()
                .single();

            if (error) throw error;
            return template;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['briefing-templates'] });
            toast.success('Template de briefing criado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar template: ${error.message}`);
        },
    });
}

// Atualizar template
export function useUpdateBriefingTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: {
            id: string;
            name?: string;
            description?: string;
            service_id?: string | null;
            schema_json?: BriefingSchemaJson;
            is_active?: boolean;
        }) => {
            const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
            if (data.name !== undefined) updates.name = data.name;
            if (data.description !== undefined) updates.description = data.description;
            if (data.service_id !== undefined) updates.service_id = data.service_id;
            if (data.schema_json !== undefined) updates.schema_json = data.schema_json;
            if (data.is_active !== undefined) updates.is_active = data.is_active;

            const { data: template, error } = await supabase
                .from('briefing_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return template;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['briefing-templates'] });
            toast.success('Template atualizado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar template: ${error.message}`);
        },
    });
}

// Deletar template
export function useDeleteBriefingTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('briefing_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['briefing-templates'] });
            toast.success('Template removido');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao remover template: ${error.message}`);
        },
    });
}
=======
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { BriefingTemplate, BriefingSchemaJson } from '@/types/briefing-template';

// Listar templates ativos
export function useBriefingTemplates() {
    return useQuery({
        queryKey: ['briefing-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('briefing_templates')
                .select('*, services(id, title, icon)')
                .order('name');

            if (error) throw error;
            return (data || []) as unknown as BriefingTemplate[];
        },
    });
}

// Detalhe de um template
export function useBriefingTemplate(templateId: string | undefined) {
    return useQuery({
        queryKey: ['briefing-template', templateId],
        queryFn: async () => {
            if (!templateId) return null;
            const { data, error } = await supabase
                .from('briefing_templates')
                .select('*, services(id, title, icon)')
                .eq('id', templateId)
                .single();

            if (error) throw error;
            return data as unknown as BriefingTemplate;
        },
        enabled: !!templateId,
    });
}

// Templates por serviço
export function useBriefingTemplatesByService(serviceId: string | undefined) {
    return useQuery({
        queryKey: ['briefing-templates', 'service', serviceId],
        queryFn: async () => {
            if (!serviceId) return [];
            const { data, error } = await supabase
                .from('briefing_templates')
                .select('*')
                .eq('service_id', serviceId)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return (data || []) as unknown as BriefingTemplate[];
        },
        enabled: !!serviceId,
    });
}

// Criar template
export function useCreateBriefingTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            service_id?: string;
            schema_json: BriefingSchemaJson;
        }) => {
            const { data: template, error } = await supabase
                .from('briefing_templates')
                .insert({
                    name: data.name,
                    description: data.description || null,
                    service_id: data.service_id || null,
                    schema_json: data.schema_json as unknown as import('@/integrations/supabase/types').Json,
                })
                .select()
                .single();

            if (error) throw error;
            return template;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['briefing-templates'] });
            toast.success('Template de briefing criado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao criar template: ${error.message}`);
        },
    });
}

// Atualizar template
export function useUpdateBriefingTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: {
            id: string;
            name?: string;
            description?: string;
            service_id?: string | null;
            schema_json?: BriefingSchemaJson;
            is_active?: boolean;
        }) => {
            const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
            if (data.name !== undefined) updates.name = data.name;
            if (data.description !== undefined) updates.description = data.description;
            if (data.service_id !== undefined) updates.service_id = data.service_id;
            if (data.schema_json !== undefined) updates.schema_json = data.schema_json;
            if (data.is_active !== undefined) updates.is_active = data.is_active;

            const { data: template, error } = await supabase
                .from('briefing_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return template;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['briefing-templates'] });
            toast.success('Template atualizado');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar template: ${error.message}`);
        },
    });
}

// Deletar template
export function useDeleteBriefingTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('briefing_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['briefing-templates'] });
            toast.success('Template removido');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao remover template: ${error.message}`);
        },
    });
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
