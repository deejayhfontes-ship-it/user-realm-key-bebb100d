import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'https://instagram.com/seuusuario' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'https://linkedin.com/company/empresa' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'https://youtube.com/@seucanal' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: '+5535999999999' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', placeholder: 'https://facebook.com/suapagina' },
  { id: 'behance', name: 'Behance', icon: 'Briefcase', placeholder: 'https://behance.net/seuportfolio' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'Twitter', placeholder: 'https://x.com/seuusuario' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music', placeholder: 'https://tiktok.com/@seuusuario' },
] as const;

export function useSocialLinks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: links, isLoading: loading } = useQuery({
    queryKey: ['social-links', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // Merge with default platforms
      const existingMap = new Map((data || []).map(l => [l.platform, l]));
      
      return SOCIAL_PLATFORMS.map((platform, index) => {
        const existing = existingMap.get(platform.id);
        if (existing) return existing as SocialLink;
        
        return {
          id: `default-${platform.id}`,
          user_id: user.id,
          platform: platform.id,
          url: null,
          is_active: false,
          sort_order: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as SocialLink;
      });
    },
    enabled: !!user?.id,
  });

  const { mutateAsync: updateLink, isPending: saving } = useMutation({
    mutationFn: async (link: Partial<SocialLink> & { platform: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('social_links')
        .upsert({
          user_id: user.id,
          platform: link.platform,
          url: link.url,
          is_active: link.is_active ?? false,
          sort_order: link.sort_order ?? 0,
        }, { onConflict: 'user_id,platform' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  const { mutateAsync: saveAllLinks } = useMutation({
    mutationFn: async (linksToSave: Array<{ platform: string; url: string | null; is_active: boolean }>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      for (let i = 0; i < linksToSave.length; i++) {
        const link = linksToSave[i];
        await supabase
          .from('social_links')
          .upsert({
            user_id: user.id,
            platform: link.platform,
            url: link.url,
            is_active: link.is_active,
            sort_order: i,
          }, { onConflict: 'user_id,platform' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      toast({
        title: 'Redes sociais salvas!',
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
    links: links || [],
    loading,
    saving,
    updateLink,
    saveAllLinks,
  };
}

// Public hook
export function usePublicSocialLinks() {
  return useQuery({
    queryKey: ['public-social-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_links')
        .select('platform, url')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
