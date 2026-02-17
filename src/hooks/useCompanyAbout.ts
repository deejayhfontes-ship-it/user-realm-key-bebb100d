import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CompanyAbout, CompanyAboutFormData, Differential } from '@/types/cms';
import type { Json } from '@/integrations/supabase/types';

export function useCompanyAbout() {
  const [about, setAbout] = useState<CompanyAbout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('company_about')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setAbout({
          ...data,
          values: (data.values as unknown as string[]) || [],
          differentials: (data.differentials as unknown as Differential[]) || [],
        } as CompanyAbout);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const saveAbout = async (formData: CompanyAboutFormData) => {
    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const payload = {
        user_id: userData.user.id,
        headline: formData.headline,
        story_title: formData.story_title || null,
        full_description: formData.full_description || null,
        mission: formData.mission || null,
        vision: formData.vision || null,
        values: formData.values as unknown as Json,
        foundation_year: formData.foundation_year || null,
        team_size: formData.team_size || null,
        projects_count: formData.projects_count || null,
        clients_count: formData.clients_count || null,
        about_image_url: formData.about_image_url || null,
        differentials: formData.differentials as unknown as Json,
      };

      let result;
      if (about?.id) {
        result = await supabase
          .from('company_about')
          .update(payload)
          .eq('id', about.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('company_about')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setAbout({
        ...result.data,
        values: (result.data.values as unknown as string[]) || [],
        differentials: (result.data.differentials as unknown as Differential[]) || [],
      } as CompanyAbout);

      toast({ title: 'Dados salvos com sucesso' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar dados',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    about,
    loading,
    saving,
    saveAbout,
    refetch: fetchAbout,
  };
}
