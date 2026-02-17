import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PortfolioCase {
  id: string;
  title: string;
  client_name: string;
  category: string;
  description: string;
  thumbnail_url: string;
  gallery_urls: string[];
  results: string | null;
  featured: boolean;
  order_index: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export type PortfolioCaseInsert = Omit<PortfolioCase, 'id' | 'created_at' | 'updated_at'>;
export type PortfolioCaseUpdate = Partial<PortfolioCaseInsert>;

export function usePortfolio() {
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ['portfolio-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_cases')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PortfolioCase[];
    },
  });

  const createCase = useMutation({
    mutationFn: async (newCase: PortfolioCaseInsert) => {
      const { data, error } = await supabase
        .from('portfolio_cases')
        .insert(newCase)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-cases'] });
      toast({ title: 'Case criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar case', description: error.message, variant: 'destructive' });
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PortfolioCaseUpdate }) => {
      const { data: updated, error } = await supabase
        .from('portfolio_cases')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-cases'] });
      toast({ title: 'Case atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar case', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-cases'] });
      toast({ title: 'Case excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir case', description: error.message, variant: 'destructive' });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('portfolio_cases')
        .update({ featured })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-cases'] });
    },
  });

  return {
    cases,
    isLoading,
    error,
    createCase,
    updateCase,
    deleteCase,
    toggleFeatured,
  };
}

// Hook for public use (only published cases)
export function usePublicPortfolio() {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['portfolio-cases-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_cases')
        .select('*')
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as PortfolioCase[];
    },
  });

  const featuredCases = cases.filter(c => c.featured);
  const allPublished = cases;

  return { cases: allPublished, featuredCases, isLoading };
}
