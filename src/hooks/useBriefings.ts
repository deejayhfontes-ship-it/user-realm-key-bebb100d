import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Briefing {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  tipo_projeto: string | null;
  descricao: string;
  referencias: string | null;
  prazo: string | null;
  arquivo_urls: string[];
  status: 'novo' | 'em_analise' | 'orcamento_criado' | 'proposta_criada' | 'aprovado' | 'recusado' | 'cancelado';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  budget_id: string | null;
  proposal_id: string | null;
  notas_internas: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface BriefingInput {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  tipo_projeto?: string;
  descricao: string;
  referencias?: string;
  prazo?: string;
  arquivo_urls?: string[];
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
      return (data || []).map(row => ({
        ...row,
        arquivo_urls: (row.arquivo_urls as string[]) || [],
        status: row.status as Briefing['status'],
        prioridade: row.prioridade as Briefing['prioridade'],
      })) as Briefing[];
    },
  });

  const createBriefingMutation = useMutation({
    mutationFn: async (input: BriefingInput) => {
      const { data, error } = await supabase
        .from('briefings')
        .insert({
          nome: input.nome,
          email: input.email,
          telefone: input.telefone,
          empresa: input.empresa,
          tipo_projeto: input.tipo_projeto,
          descricao: input.descricao,
          referencias: input.referencias,
          prazo: input.prazo,
          arquivo_urls: input.arquivo_urls as unknown as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast.success('Briefing criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating briefing:', error);
      toast.error('Erro ao criar briefing');
    },
  });

  const updateBriefingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Briefing> }) => {
      const { data, error } = await supabase
        .from('briefings')
        .update({
          ...updates,
          arquivo_urls: updates.arquivo_urls as unknown as any,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast.success('Briefing atualizado!');
    },
    onError: (error) => {
      console.error('Error updating briefing:', error);
      toast.error('Erro ao atualizar briefing');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Briefing['status'] }) => {
      const { data, error } = await supabase
        .from('briefings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
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
    createBriefing: createBriefingMutation.mutate,
    isCreating: createBriefingMutation.isPending,
    updateBriefing: updateBriefingMutation.mutate,
    isUpdating: updateBriefingMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    deleteBriefing: deleteBriefingMutation.mutate,
    isDeleting: deleteBriefingMutation.isPending,
  };
}
