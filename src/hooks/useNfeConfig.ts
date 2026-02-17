import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NfeConfig } from '@/types/nfe';

export function useNfeConfig() {
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['nfe-config'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('nfe_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as NfeConfig | null;
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (configData: Partial<NfeConfig>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload: Record<string, unknown> = {
        ...configData,
        user_id: user.id,
      };

      // Check if config exists
      const { data: existing } = await supabase
        .from('nfe_configs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let data, error;
      if (existing) {
        // Update
        const result = await supabase
          .from('nfe_configs')
          .update(payload)
          .eq('user_id', user.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert - cast to proper type
        const insertPayload = payload as {
          user_id: string;
          razao_social: string;
          cnpj: string;
          [key: string]: unknown;
        };
        const result = await supabase
          .from('nfe_configs')
          .insert(insertPayload)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as NfeConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nfe-config'] });
      toast.success('Configurações fiscais salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar configurações fiscais:', error);
      toast.error('Erro ao salvar configurações fiscais');
    },
  });

  const isConfigComplete = Boolean(
    config?.razao_social &&
    config?.cnpj &&
    config?.logradouro &&
    config?.municipio &&
    config?.uf
  );

  return {
    config,
    isLoading,
    error,
    saveConfig,
    isConfigComplete,
  };
}
