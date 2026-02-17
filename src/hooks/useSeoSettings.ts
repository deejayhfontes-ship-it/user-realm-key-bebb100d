import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface SeoSetting {
  id: string;
  user_id: string;
  page_slug: string;
  title: string | null;
  description: string | null;
  keywords: string[] | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsConfig {
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
}

const defaultSeoPages = [
  { page_slug: 'home', title: 'Fontes Graphics - Design Studio', description: 'Estúdio de design gráfico especializado em branding, web design e criação de conteúdo.' },
  { page_slug: 'portfolio', title: 'Portfólio - Fontes Graphics', description: 'Conheça nossos projetos de design gráfico, branding e web design.' },
  { page_slug: 'services', title: 'Serviços - Fontes Graphics', description: 'Serviços de identidade visual, web design, social media e motion graphics.' },
  { page_slug: 'briefing', title: 'Solicitar Orçamento - Fontes Graphics', description: 'Solicite um orçamento para seu projeto de design.' },
  { page_slug: 'contact', title: 'Contato - Fontes Graphics', description: 'Entre em contato conosco para discutir seu projeto.' },
];

export function useSeoSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: seoSettings, isLoading: loading } = useQuery({
    queryKey: ['seo-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Merge with defaults
      const existingMap = new Map((data || []).map(s => [s.page_slug, s]));
      
      return defaultSeoPages.map(defaultPage => {
        const existing = existingMap.get(defaultPage.page_slug);
        if (existing) return existing as SeoSetting;
        
        return {
          id: `default-${defaultPage.page_slug}`,
          user_id: user.id,
          page_slug: defaultPage.page_slug,
          title: defaultPage.title,
          description: defaultPage.description,
          keywords: null,
          og_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as SeoSetting;
      });
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: saveSeoSetting, isPending: saving } = useMutation({
    mutationFn: async (setting: Partial<SeoSetting> & { page_slug: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          user_id: user.id,
          page_slug: setting.page_slug,
          title: setting.title,
          description: setting.description,
          keywords: setting.keywords,
          og_image_url: setting.og_image_url,
        }, { onConflict: 'user_id,page_slug' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: 'SEO atualizado!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Analytics stored in site_settings
  const { data: analytics } = useQuery({
    queryKey: ['analytics-config', user?.id],
    queryFn: async () => {
      if (!user?.id) return { google_analytics_id: '', google_tag_manager_id: '', facebook_pixel_id: '' };
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('user_id', user.id)
        .in('key', ['google_analytics_id', 'google_tag_manager_id', 'facebook_pixel_id']);
      
      if (error) throw error;
      
      const map: Record<string, string> = {};
      (data || []).forEach(item => {
        map[item.key] = item.value || '';
      });
      
      return {
        google_analytics_id: map.google_analytics_id || '',
        google_tag_manager_id: map.google_tag_manager_id || '',
        facebook_pixel_id: map.facebook_pixel_id || '',
      } as AnalyticsConfig;
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: saveAnalytics } = useMutation({
    mutationFn: async (config: AnalyticsConfig) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const updates = Object.entries(config).map(([key, value]) => ({
        user_id: user.id,
        key,
        value: value || '',
        type: 'text',
      }));
      
      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'user_id,key' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-config'] });
      toast({
        title: 'Analytics atualizado!',
      });
    },
  });

  const getSeoForPage = (pageSlug: string) => {
    return seoSettings?.find(s => s.page_slug === pageSlug);
  };

  return {
    seoSettings: seoSettings || [],
    analytics: analytics || { google_analytics_id: '', google_tag_manager_id: '', facebook_pixel_id: '' },
    loading,
    saving,
    saveSeoSetting,
    saveAnalytics,
    getSeoForPage,
  };
}
