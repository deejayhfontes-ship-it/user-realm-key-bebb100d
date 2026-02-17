import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectType {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useProjectTypes() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjectTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProjectTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching project types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  return {
    projectTypes,
    loading,
    refetch: fetchProjectTypes,
  };
}

export function useProjectTypesAdmin() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjectTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_types')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProjectTypes(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar tipos de projeto',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const addProjectType = async (name: string, icon: string = 'MoreHorizontal') => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const maxOrder = projectTypes.reduce((max, pt) => Math.max(max, pt.sort_order), 0);
      
      const { data, error } = await supabase
        .from('project_types')
        .insert({
          name,
          icon,
          sort_order: maxOrder + 1,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setProjectTypes(prev => [...prev, data]);
      toast({ title: 'Tipo de projeto adicionado' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar tipo',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProjectType = async (id: string, updates: Partial<Pick<ProjectType, 'name' | 'icon' | 'is_active' | 'sort_order'>>) => {
    try {
      const { error } = await supabase
        .from('project_types')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setProjectTypes(prev => prev.map(pt => 
        pt.id === id ? { ...pt, ...updates } : pt
      ));
      toast({ title: 'Tipo de projeto atualizado' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar tipo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteProjectType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjectTypes(prev => prev.filter(pt => pt.id !== id));
      toast({ title: 'Tipo de projeto removido' });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover tipo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const reorderProjectTypes = async (orderedIds: string[]) => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('project_types')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setProjectTypes(prev => {
        const sorted = [...prev].sort((a, b) => {
          const aIndex = orderedIds.indexOf(a.id);
          const bIndex = orderedIds.indexOf(b.id);
          return aIndex - bIndex;
        });
        return sorted.map((pt, index) => ({ ...pt, sort_order: index }));
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao reordenar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    projectTypes,
    loading,
    addProjectType,
    updateProjectType,
    deleteProjectType,
    reorderProjectTypes,
    refetch: fetchProjectTypes,
  };
}
