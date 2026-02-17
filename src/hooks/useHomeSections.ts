import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface HomeSection {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  is_editable: boolean;
  config: Json;
  created_at: string;
  updated_at: string;
}

interface DefaultSection {
  slug: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  is_editable: boolean;
  config: Json;
}

const defaultSections: DefaultSection[] = [
  { slug: 'hero', name: 'Hero Section', is_active: true, sort_order: 0, is_editable: false, config: {} },
  { slug: 'projects', name: 'Projetos / Cards', is_active: true, sort_order: 1, is_editable: true, config: {} },
  { slug: 'generators', name: 'Geradores IA', is_active: true, sort_order: 2, is_editable: true, config: {} },
  { slug: 'about', name: 'Sobre Nós', is_active: true, sort_order: 3, is_editable: true, config: {} },
  { slug: 'clients', name: 'Parceiros Criativos', is_active: true, sort_order: 4, is_editable: true, config: {} },
  { slug: 'services', name: 'Serviços', is_active: true, sort_order: 5, is_editable: true, config: {} },
  { slug: 'contact', name: 'Contato', is_active: true, sort_order: 6, is_editable: true, config: {} },
];

export function useHomeSections() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sections, isLoading: loading } = useQuery({
    queryKey: ['home-sections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // If no sections exist, return defaults
      if (!data || data.length === 0) {
        return defaultSections.map((s, i) => ({
          ...s,
          id: `default-${i}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }
      
      return data as HomeSection[];
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: initializeSections } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const sectionsToInsert = defaultSections.map((s) => ({
        ...s,
        user_id: user.id,
      }));
      
      const { error } = await supabase
        .from('home_sections')
        .upsert(sectionsToInsert, { onConflict: 'user_id,slug' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-sections'] });
    },
  });

  const { mutateAsync: updateSection, isPending: updating } = useMutation({
    mutationFn: async ({ slug, updates }: { slug: string; updates: { is_active?: boolean; sort_order?: number; config?: Json } }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      // Check if section exists
      const { data: existing } = await supabase
        .from('home_sections')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', slug)
        .single();
      
      if (!existing) {
        // Create it first
        const defaultSection = defaultSections.find(s => s.slug === slug);
        if (defaultSection) {
          const { error: insertError } = await supabase
            .from('home_sections')
            .insert({
              slug: defaultSection.slug,
              name: defaultSection.name,
              is_active: updates.is_active ?? defaultSection.is_active,
              sort_order: updates.sort_order ?? defaultSection.sort_order,
              is_editable: defaultSection.is_editable,
              config: updates.config ?? defaultSection.config,
              user_id: user.id,
            });
          if (insertError) throw insertError;
        }
      } else {
        const { error } = await supabase
          .from('home_sections')
          .update(updates)
          .eq('user_id', user.id)
          .eq('slug', slug);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-sections'] });
      toast({
        title: 'Seção atualizada!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: reorderSections } = useMutation({
    mutationFn: async (orderedSlugs: string[]) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      for (let i = 0; i < orderedSlugs.length; i++) {
        await supabase
          .from('home_sections')
          .update({ sort_order: i })
          .eq('user_id', user.id)
          .eq('slug', orderedSlugs[i]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-sections'] });
    },
  });

  return {
    sections: sections || [],
    loading,
    updating,
    updateSection,
    reorderSections,
    initializeSections,
  };
}

// Public hook - returns ALL sections so we can check is_active status
export function usePublicHomeSections() {
  return useQuery({
    queryKey: ['public-home-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('slug, name, is_active, sort_order, config')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute cache for faster updates
  });
}
