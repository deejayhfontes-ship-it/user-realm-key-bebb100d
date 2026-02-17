import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ChannelSettings, ChannelSettingsFormData } from '@/types/cms';

export function useChannelSettings() {
  const [settings, setSettings] = useState<ChannelSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('channel_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as ChannelSettings | null);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async (formData: ChannelSettingsFormData) => {
    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const payload = {
        user_id: userData.user.id,
        whatsapp_number: formData.whatsapp_number || null,
        whatsapp_default_message: formData.whatsapp_default_message,
        whatsapp_show_float_button: formData.whatsapp_show_float_button,
        instagram_url: formData.instagram_url || null,
        behance_url: formData.behance_url || null,
        linkedin_url: formData.linkedin_url || null,
        youtube_url: formData.youtube_url || null,
        contact_email: formData.contact_email || null,
        support_hours: formData.support_hours || null,
      };

      let result;
      if (settings?.id) {
        result = await supabase
          .from('channel_settings')
          .update(payload)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('channel_settings')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings(result.data as ChannelSettings);
      toast({ title: 'Configurações salvas com sucesso' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    saveSettings,
    refetch: fetchSettings,
  };
}
