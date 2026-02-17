import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PixConfig {
  id: string;
  user_id: string;
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PixConfigInput {
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  enabled?: boolean;
}

export function usePixConfig() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pixConfig, isLoading, error } = useQuery({
    queryKey: ['pix-config', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('pix_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as PixConfig | null;
    },
    enabled: !!user?.id,
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (input: PixConfigInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const configData = {
        user_id: user.id,
        pix_key: input.pix_key,
        merchant_name: input.merchant_name,
        merchant_city: input.merchant_city,
        enabled: input.enabled ?? true,
      };

      // Upsert: insert or update
      const { data, error } = await supabase
        .from('pix_configs')
        .upsert(configData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data as PixConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-config'] });
      toast.success('Configurações PIX salvas!');
    },
    onError: (error) => {
      console.error('Error saving PIX config:', error);
      toast.error('Erro ao salvar configurações PIX');
    },
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user?.id || !pixConfig?.id) throw new Error('No config to update');

      const { data, error } = await supabase
        .from('pix_configs')
        .update({ enabled })
        .eq('id', pixConfig.id)
        .select()
        .single();

      if (error) throw error;
      return data as PixConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-config'] });
      toast.success('Status PIX atualizado!');
    },
    onError: (error) => {
      console.error('Error toggling PIX:', error);
      toast.error('Erro ao atualizar status PIX');
    },
  });

  return {
    pixConfig,
    isLoading,
    error,
    saveConfig: saveConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending,
    toggleEnabled: toggleEnabledMutation.mutate,
    isToggling: toggleEnabledMutation.isPending,
  };
}
