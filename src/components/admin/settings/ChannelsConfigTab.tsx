import { useState, useEffect } from 'react';
import { Loader2, MessageCircle, Instagram, Linkedin, Youtube, AtSign, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useChannelSettings } from '@/hooks/useChannelSettings';
import { defaultChannelSettingsFormData, ChannelSettingsFormData } from '@/types/cms';

export function ChannelsConfigTab() {
  const { settings, loading, saving, saveSettings } = useChannelSettings();
  const [formData, setFormData] = useState<ChannelSettingsFormData>(defaultChannelSettingsFormData);

  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp_number: settings.whatsapp_number || '',
        whatsapp_default_message: settings.whatsapp_default_message || defaultChannelSettingsFormData.whatsapp_default_message,
        whatsapp_show_float_button: settings.whatsapp_show_float_button ?? true,
        instagram_url: settings.instagram_url || '',
        behance_url: settings.behance_url || '',
        linkedin_url: settings.linkedin_url || '',
        youtube_url: settings.youtube_url || '',
        contact_email: settings.contact_email || '',
        support_hours: settings.support_hours || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(formData);
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const whatsappPreviewUrl = formData.whatsapp_number
    ? `https://wa.me/${formatPhoneForWhatsApp(formData.whatsapp_number)}?text=${encodeURIComponent(formData.whatsapp_default_message)}`
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* WhatsApp Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            WhatsApp Business
          </CardTitle>
          <CardDescription>
            Configure o botão flutuante de WhatsApp do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="5535999999999"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formato: código do país + DDD + número (ex: 5535999999999)
              </p>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="whatsapp_float"
                checked={formData.whatsapp_show_float_button}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, whatsapp_show_float_button: checked }))}
              />
              <Label htmlFor="whatsapp_float">Mostrar botão flutuante no site</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="whatsapp_message">Mensagem Padrão</Label>
            <Textarea
              id="whatsapp_message"
              value={formData.whatsapp_default_message}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_default_message: e.target.value }))}
              placeholder="Olá! Gostaria de mais informações..."
              rows={3}
            />
          </div>

          {/* WhatsApp Preview */}
          {formData.whatsapp_number && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Preview do Botão</p>
                    <p className="text-sm text-muted-foreground">
                      Assim será o botão no canto inferior direito
                    </p>
                  </div>
                </div>
                {whatsappPreviewUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={whatsappPreviewUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Testar
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
          <CardDescription>
            Links para suas redes sociais (serão exibidos no rodapé e página de contato)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.instagram_url}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                placeholder="https://instagram.com/seuusuario"
              />
            </div>
            <div>
              <Label htmlFor="behance" className="flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Behance
              </Label>
              <Input
                id="behance"
                value={formData.behance_url}
                onChange={(e) => setFormData(prev => ({ ...prev, behance_url: e.target.value }))}
                placeholder="https://behance.net/seuusuario"
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.linkedin_url}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/company/seuusuario"
              />
            </div>
            <div>
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </Label>
              <Input
                id="youtube"
                value={formData.youtube_url}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                placeholder="https://youtube.com/@seucanal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Email Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Email e Horários</CardTitle>
          <CardDescription>
            Email de contato e horário de atendimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contact_email">Email de Contato</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="contato@suaempresa.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email que recebe as mensagens do formulário
              </p>
            </div>
            <div>
              <Label htmlFor="support_hours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário de Atendimento
              </Label>
              <Input
                id="support_hours"
                value={formData.support_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, support_hours: e.target.value }))}
                placeholder="Seg-Sex: 9h às 18h"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </div>
    </form>
  );
}
