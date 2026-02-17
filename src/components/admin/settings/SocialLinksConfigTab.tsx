import { useState, useEffect } from 'react';
import { Loader2, Instagram, Linkedin, Youtube, Facebook, MessageCircle, Briefcase, Music, Twitter, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSocialLinks, SOCIAL_PLATFORMS } from '@/hooks/useSocialLinks';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  MessageCircle,
  Briefcase,
  Music,
  Twitter,
};

interface SocialFormItem {
  platform: string;
  url: string;
  is_active: boolean;
}

export function SocialLinksConfigTab() {
  const { links, loading, saving, saveAllLinks } = useSocialLinks();
  const [formData, setFormData] = useState<SocialFormItem[]>([]);

  useEffect(() => {
    if (links.length > 0) {
      setFormData(links.map(l => ({
        platform: l.platform,
        url: l.url || '',
        is_active: l.is_active,
      })));
    } else {
      setFormData(SOCIAL_PLATFORMS.map(p => ({
        platform: p.id,
        url: '',
        is_active: false,
      })));
    }
  }, [links]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAllLinks(formData);
  };

  const updateItem = (platform: string, updates: Partial<SocialFormItem>) => {
    setFormData(prev => prev.map(item => 
      item.platform === platform ? { ...item, ...updates } : item
    ));
  };

  const getWhatsAppUrl = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned ? `https://wa.me/${cleaned}` : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeLinks = formData.filter(l => l.is_active && l.url);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Links de Redes Sociais</CardTitle>
          <CardDescription>
            Configure suas redes sociais. Serão exibidas no rodapé e página de contato.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {SOCIAL_PLATFORMS.map((platform) => {
            const formItem = formData.find(f => f.platform === platform.id);
            const Icon = iconMap[platform.icon];
            const isWhatsApp = platform.id === 'whatsapp';
            const whatsappUrl = isWhatsApp ? getWhatsAppUrl(formItem?.url || '') : null;

            return (
              <div key={platform.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={formItem?.is_active || false}
                    onCheckedChange={(checked) => updateItem(platform.id, { is_active: checked })}
                  />
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                    <span className="font-medium">{platform.name}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    value={formItem?.url || ''}
                    onChange={(e) => updateItem(platform.id, { url: e.target.value })}
                    placeholder={platform.placeholder}
                    disabled={!formItem?.is_active}
                  />
                  {isWhatsApp && formItem?.is_active && whatsappUrl && (
                    <p className="text-xs text-muted-foreground">
                      Link gerado: {whatsappUrl}
                    </p>
                  )}
                </div>

                {formItem?.is_active && formItem?.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a 
                      href={isWhatsApp ? whatsappUrl || '#' : formItem.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Preview Card */}
      {activeLinks.length > 0 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Preview no Footer</CardTitle>
            <CardDescription>
              Assim aparecerão os ícones no rodapé do site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900">
              {activeLinks.map(link => {
                const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
                const Icon = platform ? iconMap[platform.icon] : null;
                
                return Icon ? (
                  <div 
                    key={link.platform}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Redes Sociais'
          )}
        </Button>
      </div>
    </form>
  );
}
