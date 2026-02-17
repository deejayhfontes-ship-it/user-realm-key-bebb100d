import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SiteSetting {
  id: string;
  user_id: string;
  key: string;
  value: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

interface SiteSettingsData {
  site_name: string;
  site_tagline: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  dark_color: string;
}

const defaultSettings: SiteSettingsData = {
  site_name: 'Fontes Graphics',
  site_tagline: 'Design Studio • Poços de Caldas',
  site_email: 'contato@fontesgraphics.com',
  site_phone: '',
  site_address: '',
  logo_url: '',
  favicon_url: '',
  primary_color: '#c4ff0d',
  dark_color: '#1a1a1a',
};

export function useSiteSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: loading } = useQuery({
    queryKey: ['site-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Convert array to object
      const settingsMap: Record<string, string> = {};
      (data || []).forEach((item: SiteSetting) => {
        settingsMap[item.key] = item.value || '';
      });
      
      return {
        ...defaultSettings,
        ...settingsMap,
      } as SiteSettingsData;
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: saveSettings, isPending: saving } = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettingsData>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        user_id: user.id,
        key,
        value: value || '',
        type: 'text',
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'user_id,key' });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Configurações salvas!',
        description: 'As configurações do site foram atualizadas.',
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

  return {
    settings: settings || defaultSettings,
    loading,
    saving,
    saveSettings,
  };
}

// Hook for public access (no auth required)
export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public-site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .limit(50);
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      (data || []).forEach((item) => {
        settingsMap[item.key] = item.value || '';
      });
      
      return {
        ...defaultSettings,
        ...settingsMap,
      } as SiteSettingsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
