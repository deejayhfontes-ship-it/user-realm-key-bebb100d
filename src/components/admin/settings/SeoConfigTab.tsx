import { useState, useEffect } from 'react';
import { Loader2, Globe, Search, Image as ImageIcon, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSeoSettings } from '@/hooks/useSeoSettings';

const PAGE_OPTIONS = [
  { slug: 'home', name: 'Home', icon: '🏠' },
  { slug: 'portfolio', name: 'Portfólio', icon: '📁' },
  { slug: 'services', name: 'Serviços', icon: '💼' },
  { slug: 'briefing', name: 'Briefing / Orçamento', icon: '📝' },
  { slug: 'contact', name: 'Contato', icon: '✉️' },
];

export function SeoConfigTab() {
  const { seoSettings, analytics, loading, saving, saveSeoSetting, saveAnalytics } = useSeoSettings();
  const [selectedPage, setSelectedPage] = useState('home');
  
  const [seoForm, setSeoForm] = useState({
    title: '',
    description: '',
    keywords: '',
    og_image_url: '',
  });

  const [analyticsForm, setAnalyticsForm] = useState({
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
  });

  useEffect(() => {
    const pageSeo = seoSettings.find(s => s.page_slug === selectedPage);
    if (pageSeo) {
      setSeoForm({
        title: pageSeo.title || '',
        description: pageSeo.description || '',
        keywords: pageSeo.keywords?.join(', ') || '',
        og_image_url: pageSeo.og_image_url || '',
      });
    }
  }, [selectedPage, seoSettings]);

  useEffect(() => {
    if (analytics) {
      setAnalyticsForm({
        google_analytics_id: analytics.google_analytics_id || '',
        google_tag_manager_id: analytics.google_tag_manager_id || '',
        facebook_pixel_id: analytics.facebook_pixel_id || '',
      });
    }
  }, [analytics]);

  const handleSaveSeo = async () => {
    await saveSeoSetting({
      page_slug: selectedPage,
      title: seoForm.title,
      description: seoForm.description,
      keywords: seoForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      og_image_url: seoForm.og_image_url,
    });
  };

  const handleSaveAnalytics = async () => {
    await saveAnalytics(analyticsForm);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="meta" className="space-y-6">
      <TabsList>
        <TabsTrigger value="meta" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Meta Tags
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      {/* Meta Tags Tab */}
      <TabsContent value="meta" className="space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Meta Tags por Página</CardTitle>
            <CardDescription>
              Configure título, descrição e imagem para compartilhamento em redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Page Selector */}
            <div>
              <Label>Selecione a Página</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Selecione uma página" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_OPTIONS.map(page => (
                    <SelectItem key={page.slug} value={page.slug}>
                      <span className="flex items-center gap-2">
                        <span>{page.icon}</span>
                        <span>{page.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="seo_title">Título (Title Tag)</Label>
                <Input
                  id="seo_title"
                  value={seoForm.title}
                  onChange={(e) => setSeoForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Fontes Graphics - Design Studio"
                  maxLength={60}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Como aparece na aba do navegador e resultados do Google
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {seoForm.title.length}/60
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="seo_description">Descrição (Meta Description)</Label>
                <Textarea
                  id="seo_description"
                  value={seoForm.description}
                  onChange={(e) => setSeoForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Estúdio de design gráfico especializado em branding..."
                  maxLength={160}
                  rows={3}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Descrição que aparece nos resultados de busca
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {seoForm.description.length}/160
                  </p>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <Label htmlFor="seo_keywords" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Keywords (Palavras-chave)
                </Label>
                <Input
                  id="seo_keywords"
                  value={seoForm.keywords}
                  onChange={(e) => setSeoForm(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="design gráfico, branding, web design, poços de caldas"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separe as palavras-chave por vírgula (máx. 10)
                </p>
              </div>

              {/* OG Image */}
              <div>
                <Label htmlFor="seo_og_image" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagem de Compartilhamento (OG Image)
                </Label>
                <Input
                  id="seo_og_image"
                  value={seoForm.og_image_url}
                  onChange={(e) => setSeoForm(prev => ({ ...prev, og_image_url: e.target.value }))}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tamanho recomendado: 1200x630px (Facebook, Twitter, WhatsApp)
                </p>
                {seoForm.og_image_url && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <img 
                      src={seoForm.og_image_url} 
                      alt="OG Image preview" 
                      className="max-h-32 rounded object-cover"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Google Preview */}
              <div className="p-4 bg-card rounded-lg border mt-4">
                <p className="text-xs text-muted-foreground mb-2">Preview no Google:</p>
                <div className="space-y-1">
                  <p className="text-primary text-lg hover:underline cursor-pointer truncate">
                    {seoForm.title || 'Título da Página'}
                  </p>
                  <p className="text-green-500 text-sm">
                    fontesgraphics.com/{selectedPage === 'home' ? '' : selectedPage}
                  </p>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {seoForm.description || 'Descrição da página aparecerá aqui...'}
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveSeo} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar SEO'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Ferramentas de Analytics</CardTitle>
            <CardDescription>
              Configure IDs de rastreamento para monitorar o tráfego do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ga_id">Google Analytics ID</Label>
              <Input
                id="ga_id"
                value={analyticsForm.google_analytics_id}
                onChange={(e) => setAnalyticsForm(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Encontre em: Google Analytics → Admin → Data Streams → Stream ID
              </p>
            </div>

            <div>
              <Label htmlFor="gtm_id">Google Tag Manager ID</Label>
              <Input
                id="gtm_id"
                value={analyticsForm.google_tag_manager_id}
                onChange={(e) => setAnalyticsForm(prev => ({ ...prev, google_tag_manager_id: e.target.value }))}
                placeholder="GTM-XXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="fb_pixel">Facebook Pixel ID</Label>
              <Input
                id="fb_pixel"
                value={analyticsForm.facebook_pixel_id}
                onChange={(e) => setAnalyticsForm(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                placeholder="1234567890123456"
              />
            </div>

            <Button onClick={handleSaveAnalytics} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Analytics'
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
