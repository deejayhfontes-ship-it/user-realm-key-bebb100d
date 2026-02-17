import { useState, useEffect } from 'react';
import { Loader2, Upload, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function GeneralConfigTab() {
  const { settings, loading, saving, saveSettings } = useSiteSettings();
  const [formData, setFormData] = useState({
    site_name: '',
    site_tagline: '',
    site_email: '',
    site_phone: '',
    site_address: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#c4ff0d',
    dark_color: '#1a1a1a',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        site_tagline: settings.site_tagline || '',
        site_email: settings.site_email || '',
        site_phone: settings.site_phone || '',
        site_address: settings.site_address || '',
        logo_url: settings.logo_url || '',
        favicon_url: settings.favicon_url || '',
        primary_color: settings.primary_color || '#c4ff0d',
        dark_color: settings.dark_color || '#1a1a1a',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Info Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Informações do Site</CardTitle>
          <CardDescription>
            Dados básicos que aparecem em todo o site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                placeholder="Fontes Graphics"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="site_tagline">Slogan / Tagline</Label>
              <Input
                id="site_tagline"
                value={formData.site_tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, site_tagline: e.target.value }))}
                placeholder="Design Studio • Poços de Caldas"
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="site_email">Email Principal</Label>
              <Input
                id="site_email"
                type="email"
                value={formData.site_email}
                onChange={(e) => setFormData(prev => ({ ...prev, site_email: e.target.value }))}
                placeholder="contato@fontesgraphics.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usado em formulários e rodapé
              </p>
            </div>
            <div>
              <Label htmlFor="site_phone">Telefone / WhatsApp</Label>
              <Input
                id="site_phone"
                type="tel"
                value={formData.site_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, site_phone: e.target.value }))}
                placeholder="(35) 99999-9999"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="site_address">Endereço (opcional)</Label>
            <Textarea
              id="site_address"
              value={formData.site_address}
              onChange={(e) => setFormData(prev => ({ ...prev, site_address: e.target.value }))}
              placeholder="Rua Exemplo, 123 - Centro&#10;Poços de Caldas - MG"
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exibido no footer do site
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logo e Favicon
          </CardTitle>
          <CardDescription>
            Imagens de identidade do site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="logo_url">URL do Logo (Header)</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Formatos: PNG, SVG • Tamanho: 200x60px recomendado
              </p>
              {formData.logo_url && (
                <div className="p-4 bg-muted rounded-lg">
                  <img 
                    src={formData.logo_url} 
                    alt="Preview logo" 
                    className="max-h-12 object-contain"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="favicon_url">URL do Favicon</Label>
              <Input
                id="favicon_url"
                value={formData.favicon_url}
                onChange={(e) => setFormData(prev => ({ ...prev, favicon_url: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Formatos: PNG, ICO • Tamanho: 32x32px ou 64x64px
              </p>
              {formData.favicon_url && (
                <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
                  <img 
                    src={formData.favicon_url} 
                    alt="Preview favicon" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                  <span className="text-sm text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Cores do Site (Avançado)</CardTitle>
          <CardDescription>
            Personalize as cores principais do tema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="primary_color">Cor Primária (Destaque)</Label>
              <div className="flex gap-3">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#c4ff0d"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="dark_color">Cor Dark (Fundo)</Label>
              <div className="flex gap-3">
                <Input
                  id="dark_color"
                  type="color"
                  value={formData.dark_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, dark_color: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.dark_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, dark_color: e.target.value }))}
                  placeholder="#1a1a1a"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: formData.dark_color }}>
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: formData.primary_color }}
              />
              <div>
                <p className="font-medium" style={{ color: formData.primary_color }}>
                  Texto em Destaque
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Preview das cores no tema escuro
                </p>
              </div>
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
