import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeveloperModeValue {
  enabled: boolean;
}

export function useDeveloperMode() {
  const queryClient = useQueryClient();

  // Buscar estado atual
  const { data, isLoading } = useQuery({
    queryKey: ['global-settings', 'developer_mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'developer_mode')
        .single();
      
      if (error) throw error;
      const value = data?.value as unknown as DeveloperModeValue | null;
      return value;
    },
    staleTime: 1000 * 30, // 30 segundos
  });

  // Mutation para atualizar
  const toggleMutation = useMutation({
    mutationFn: async (newValue: boolean) => {
      const { error } = await supabase
        .from('global_settings')
        .update({ value: { enabled: newValue } })
        .eq('key', 'developer_mode');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-settings', 'developer_mode'] });
      // Recarregar página para aplicar mudanças
      setTimeout(() => window.location.reload(), 500);
    }
  });

  const isDeveloperMode = data?.enabled ?? true; // Default: true para desenvolvimento

  return {
    isDeveloperMode,
    isLoading,
    toggle: (value: boolean) => toggleMutation.mutate(value),
    isToggling: toggleMutation.isPending
  };
}
