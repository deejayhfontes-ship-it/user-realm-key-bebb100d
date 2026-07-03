import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoBriefing {
  id: string;
  created_at: string;
  nome: string;
  contato: string | null;
  email: string | null;
  evento: string | null;
  tipo_video: string | null;
  valor: number | null;
  respostas: Record<string, any>;
}

export function useVideoBriefings() {
  const queryClient = useQueryClient();

  const { data: videoBriefings = [], isLoading, error } = useQuery({
    queryKey: ['video_briefings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_briefings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VideoBriefing[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('video_briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video_briefings'] });
      toast.success('Briefing de vídeo removido!');
    },
    onError: (error) => {
      console.error('Error deleting video briefing:', error);
      toast.error('Erro ao remover briefing de vídeo');
    },
  });

  return {
    videoBriefings,
    isLoading,
    error,
    deleteVideoBriefing: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
