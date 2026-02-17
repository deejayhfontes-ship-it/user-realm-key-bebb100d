import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface PartnerLogo {
  id: string;
  user_id: string;
  nome: string;
  logo_url: string;
  site_url: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerSectionSettings {
  id: string;
  user_id: string;
  show_section: boolean;
  created_at: string;
  updated_at: string;
}

export function usePartnerLogos() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [settings, setSettings] = useState<PartnerSectionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_logos')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setLogos((data as PartnerLogo[]) || []);
    } catch (error) {
      console.error('Error fetching partner logos:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_section_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as PartnerSectionSettings | null);
    } catch (error) {
      console.error('Error fetching partner settings:', error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchLogos(), fetchSettings()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const createLogo = async (logoData: {
    nome: string;
    logo_url: string;
    site_url?: string;
    ordem?: number;
    ativo?: boolean;
  }) => {
    if (!user) return null;

    try {
      const nextOrdem = logoData.ordem ?? (logos.length > 0 ? Math.max(...logos.map(l => l.ordem)) + 1 : 1);
      
      const { data, error } = await supabase
        .from('partner_logos')
        .insert({
          user_id: user.id,
          nome: logoData.nome,
          logo_url: logoData.logo_url,
          site_url: logoData.site_url || null,
          ordem: nextOrdem,
          ativo: logoData.ativo ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Logo adicionado com sucesso!',
      });

      await fetchLogos();
      return data as PartnerLogo;
    } catch (error) {
      console.error('Error creating logo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar logo. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLogo = async (id: string, updates: Partial<Omit<PartnerLogo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error } = await supabase
        .from('partner_logos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Logo atualizado!',
      });

      await fetchLogos();
    } catch (error) {
      console.error('Error updating logo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar logo.',
        variant: 'destructive',
      });
    }
  };

  const deleteLogo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partner_logos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Removido',
        description: 'Logo removido com sucesso.',
      });

      await fetchLogos();
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover logo.',
        variant: 'destructive',
      });
    }
  };

  const reorderLogos = async (orderedIds: string[]) => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        ordem: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('partner_logos')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
      }

      toast({
        title: 'Sucesso!',
        description: 'Ordem atualizada!',
      });

      await fetchLogos();
    } catch (error) {
      console.error('Error reordering logos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao reordenar logos.',
        variant: 'destructive',
      });
    }
  };

  const updateSettings = async (showSection: boolean) => {
    if (!user) return;

    try {
      if (settings) {
        const { error } = await supabase
          .from('partner_section_settings')
          .update({ show_section: showSection })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('partner_section_settings')
          .insert({
            user_id: user.id,
            show_section: showSection,
          });

        if (error) throw error;
      }

      toast({
        title: 'Sucesso!',
        description: showSection ? 'Seção ativada!' : 'Seção desativada!',
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configurações.',
        variant: 'destructive',
      });
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('about-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('about-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload do logo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const activeLogos = logos.filter(l => l.ativo);
  const canActivateSection = activeLogos.length >= 4;
  const shouldShowSection = settings?.show_section && canActivateSection;

  return {
    logos,
    settings,
    loading,
    activeLogos,
    canActivateSection,
    shouldShowSection,
    createLogo,
    updateLogo,
    deleteLogo,
    reorderLogos,
    updateSettings,
    uploadLogo,
    refetch: fetchAll,
  };
}

// Hook for public access (landing page)
export function usePublicPartnerLogos() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [showSection, setShowSection] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active logos
        const { data: logosData, error: logosError } = await supabase
          .from('partner_logos')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true });

        if (logosError) throw logosError;

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('partner_section_settings')
          .select('*')
          .eq('show_section', true)
          .limit(1)
          .maybeSingle();

        if (settingsError) throw settingsError;

        const activeLogos = (logosData as PartnerLogo[]) || [];
        setLogos(activeLogos);
        setShowSection(!!settingsData && activeLogos.length >= 4);
      } catch (error) {
        console.error('Error fetching public partner logos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { logos, showSection, loading };
}
