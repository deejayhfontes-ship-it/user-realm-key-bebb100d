import { useState, useEffect } from 'react';
import { Loader2, FileText, Eye, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLegalPages } from '@/hooks/useLegalPages';

export function LegalPagesConfigTab() {
  const { pages, loading, saving, savePage, defaultTermsContent, defaultPrivacyContent } = useLegalPages();
  
  const [termsData, setTermsData] = useState({
    title: 'Termos de Uso',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
  });
  
  const [privacyData, setPrivacyData] = useState({
    title: 'Política de Privacidade',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
  });

  useEffect(() => {
    const termsPage = pages.find(p => p.slug === 'termos');
    const privacyPage = pages.find(p => p.slug === 'privacidade');
    
    if (termsPage) {
      setTermsData({
        title: termsPage.title,
        content: termsPage.content || defaultTermsContent,
        meta_title: termsPage.meta_title || '',
        meta_description: termsPage.meta_description || '',
        is_published: termsPage.is_published,
      });
    }
    
    if (privacyPage) {
      setPrivacyData({
        title: privacyPage.title,
        content: privacyPage.content || defaultPrivacyContent,
        meta_title: privacyPage.meta_title || '',
        meta_description: privacyPage.meta_description || '',
        is_published: privacyPage.is_published,
      });
    }
  }, [pages, defaultTermsContent, defaultPrivacyContent]);

  const handleSaveTerms = async () => {
    await savePage({
      slug: 'termos',
      title: termsData.title,
      content: termsData.content,
      meta_title: termsData.meta_title,
      meta_description: termsData.meta_description,
      is_published: termsData.is_published,
    });
  };

  const handleSavePrivacy = async () => {
    await savePage({
      slug: 'privacidade',
      title: privacyData.title,
      content: privacyData.content,
      meta_title: privacyData.meta_title,
      meta_description: privacyData.meta_description,
      is_published: privacyData.is_published,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="termos" className="space-y-6">
      <TabsList>
        <TabsTrigger value="termos" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Termos de Uso
        </TabsTrigger>
        <TabsTrigger value="privacidade" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Política de Privacidade
        </TabsTrigger>
      </TabsList>

      {/* Terms Tab */}
      <TabsContent value="termos">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Termos de Uso</CardTitle>
                <CardDescription>
                  Defina os termos e condições de uso do site
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="terms_published" className="text-sm">Publicado</Label>
                <Switch
                  id="terms_published"
                  checked={termsData.is_published}
                  onCheckedChange={(checked) => setTermsData(prev => ({ ...prev, is_published: checked }))}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="terms_title">Título da Página</Label>
              <Input
                id="terms_title"
                value={termsData.title}
                onChange={(e) => setTermsData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Termos de Uso"
              />
            </div>

            <div>
              <Label htmlFor="terms_content">Conteúdo (Markdown)</Label>
              <Textarea
                id="terms_content"
                value={termsData.content}
                onChange={(e) => setTermsData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="# Termos de Uso..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use Markdown para formatação: # Título, ## Subtítulo, **negrito**, *itálico*, - lista
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="terms_meta_title">Meta Title (SEO)</Label>
                <Input
                  id="terms_meta_title"
                  value={termsData.meta_title}
                  onChange={(e) => setTermsData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="Termos de Uso - Fontes Graphics"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {termsData.meta_title.length}/60 caracteres
                </p>
              </div>
              <div>
                <Label htmlFor="terms_meta_desc">Meta Description (SEO)</Label>
                <Input
                  id="terms_meta_desc"
                  value={termsData.meta_description}
                  onChange={(e) => setTermsData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Termos e condições de uso..."
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {termsData.meta_description.length}/160 caracteres
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleSaveTerms} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar e Publicar'
                )}
              </Button>
              {termsData.is_published && (
                <Button variant="outline" asChild>
                  <a href="/termos" target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Página
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Privacy Tab */}
      <TabsContent value="privacidade">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Política de Privacidade</CardTitle>
                <CardDescription>
                  Defina a política de privacidade e proteção de dados (LGPD)
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="privacy_published" className="text-sm">Publicado</Label>
                <Switch
                  id="privacy_published"
                  checked={privacyData.is_published}
                  onCheckedChange={(checked) => setPrivacyData(prev => ({ ...prev, is_published: checked }))}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="privacy_title">Título da Página</Label>
              <Input
                id="privacy_title"
                value={privacyData.title}
                onChange={(e) => setPrivacyData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Política de Privacidade"
              />
            </div>

            <div>
              <Label htmlFor="privacy_content">Conteúdo (Markdown)</Label>
              <Textarea
                id="privacy_content"
                value={privacyData.content}
                onChange={(e) => setPrivacyData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="# Política de Privacidade..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use Markdown para formatação: # Título, ## Subtítulo, **negrito**, *itálico*, - lista
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="privacy_meta_title">Meta Title (SEO)</Label>
                <Input
                  id="privacy_meta_title"
                  value={privacyData.meta_title}
                  onChange={(e) => setPrivacyData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="Política de Privacidade - Fontes Graphics"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {privacyData.meta_title.length}/60 caracteres
                </p>
              </div>
              <div>
                <Label htmlFor="privacy_meta_desc">Meta Description (SEO)</Label>
                <Input
                  id="privacy_meta_desc"
                  value={privacyData.meta_description}
                  onChange={(e) => setPrivacyData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Como tratamos seus dados..."
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {privacyData.meta_description.length}/160 caracteres
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleSavePrivacy} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar e Publicar'
                )}
              </Button>
              {privacyData.is_published && (
                <Button variant="outline" asChild>
                  <a href="/privacidade" target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Página
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
