import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AIProviderFromDB } from '@/lib/ai-engine/types';
import type { Json } from '@/integrations/supabase/types';

export type AIProvider = AIProviderFromDB;

export function useAIProviders() {
  return useQuery({
    queryKey: ['ai-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as unknown as AIProvider[];
    },
  });
}

export function useActiveAIProviders() {
  return useQuery({
    queryKey: ['ai-providers', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as unknown as AIProvider[];
    },
  });
}

export function useCreateAIProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (provider: Partial<AIProvider>) => {
      const insertData = {
        name: provider.name!,
        slug: provider.slug!,
        api_type: provider.api_type || 'custom',
        endpoint_url: provider.endpoint_url!,
        api_key_encrypted: provider.api_key_encrypted,
        model_name: provider.model_name,
        custom_headers: (provider.custom_headers || {}) as Json,
        request_template: (provider.request_template || null) as Json,
        response_path: provider.response_path,
        system_prompt: provider.system_prompt,
        timeout_seconds: provider.timeout_seconds || 30,
        max_tokens: provider.max_tokens || 4000,
        temperature: provider.temperature || 0.7,
        is_active: provider.is_active ?? true,
        is_default: provider.is_default ?? false,
      };

      const { data, error } = await supabase
        .from('ai_providers')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      toast({
        title: 'Provedor adicionado',
        description: 'O provedor de IA foi configurado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar provedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAIProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AIProvider> & { id: string }) => {
      // Convert to Json compatible types
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.custom_headers) {
        updateData.custom_headers = updates.custom_headers as Json;
      }
      if (updates.request_template) {
        updateData.request_template = updates.request_template as Json;
      }

      const { data, error } = await supabase
        .from('ai_providers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      toast({
        title: 'Provedor atualizado',
        description: 'As configurações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar provedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAIProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      toast({
        title: 'Provedor removido',
        description: 'O provedor foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover provedor',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTestAIProvider() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { providerId?: string; apiType?: string; endpointUrl?: string; apiKey?: string; modelName?: string }) => {
      const { data, error } = await supabase.functions.invoke('test-ai-provider', {
        body: params,
      });

      if (error) throw error;
      return data as { success: boolean; error?: string; latency?: number; message?: string };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Conexão bem sucedida!',
          description: `Latência: ${data.latency}ms`,
        });
      } else {
        toast({
          title: 'Falha na conexão',
          description: data.error || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao testar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSetDefaultProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Primeiro remove default de todos
      await supabase
        .from('ai_providers')
        .update({ is_default: false })
        .neq('id', id);

      // Define o novo default
      const { error } = await supabase
        .from('ai_providers')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      toast({
        title: 'Provedor padrão definido',
        description: 'Este provedor será usado por padrão.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao definir padrão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
