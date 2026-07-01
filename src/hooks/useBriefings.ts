import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Briefing {
  id: string;
  created_at: string;
  nome: string;
  cidade: string;
  cargo: string | null;
  respostas: Record<string, any>;
}

export function useBriefings() {
  const queryClient = useQueryClient();

  const { data: briefings = [], isLoading, error } = useQuery({
    queryKey: ['briefings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Briefing[];
    },
  });

  const deleteBriefingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast.success('Briefing removido!');
    },
    onError: (error) => {
      console.error('Error deleting briefing:', error);
      toast.error('Erro ao remover briefing');
    },
  });

  return {
    briefings,
    isLoading,
    error,
    deleteBriefing: deleteBriefingMutation.mutate,
    isDeleting: deleteBriefingMutation.isPending,
  };
}
