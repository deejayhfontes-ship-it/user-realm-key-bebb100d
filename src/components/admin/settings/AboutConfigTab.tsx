import { useState, useEffect } from 'react';
import { Loader2, Plus, X, Upload, Target, Eye, Lightbulb, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanyAbout } from '@/hooks/useCompanyAbout';
import { defaultCompanyAboutFormData, CompanyAboutFormData, Differential } from '@/types/cms';
import * as LucideIcons from 'lucide-react';

const availableIcons = [
  'Clock', 'Shield', 'Zap', 'Heart', 'Star', 'Target', 'Lightbulb', 'Users',
  'Award', 'CheckCircle', 'Sparkles', 'Rocket', 'Crown', 'ThumbsUp', 'Gem'
];

export function AboutConfigTab() {
  const { about, loading, saving, saveAbout } = useCompanyAbout();
  const [formData, setFormData] = useState<CompanyAboutFormData>(defaultCompanyAboutFormData);

  useEffect(() => {
    if (about) {
      setFormData({
        headline: about.headline || 'Quem Somos',
        story_title: about.story_title || '',
        full_description: about.full_description || '',
        mission: about.mission || '',
        vision: about.vision || '',
        values: about.values || [],
        foundation_year: about.foundation_year || '',
        team_size: about.team_size || '',
        projects_count: about.projects_count || '',
        clients_count: about.clients_count || '',
        about_image_url: about.about_image_url || '',
        differentials: about.differentials || [],
      });
    }
  }, [about]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAbout(formData);
  };

  // Values management
  const addValue = () => {
    setFormData(prev => ({ ...prev, values: [...prev.values, ''] }));
  };

  const updateValue = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.map((v, i) => i === index ? value : v)
    }));
  };

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  // Differentials management
  const addDifferential = () => {
    setFormData(prev => ({
      ...prev,
      differentials: [...prev.differentials, { icon: 'Star', title: '', description: '' }]
    }));
  };

  const updateDifferential = (index: number, field: keyof Differential, value: string) => {
    setFormData(prev => ({
      ...prev,
      differentials: prev.differentials.map((d, i) => 
        i === index ? { ...d, [field]: value } : d
      )
    }));
  };

  const removeDifferential = (index: number) => {
    setFormData(prev => ({
      ...prev,
      differentials: prev.differentials.filter((_, i) => i !== index)
    }));
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
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
      {/* Header and Story */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Título e História</CardTitle>
          <CardDescription>
            Headline e descrição principal da seção "Quem Somos"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="headline">Headline da Seção</Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="Quem Somos"
              />
            </div>
            <div>
              <Label htmlFor="story_title">Subtítulo Impactante</Label>
              <Input
                id="story_title"
                value={formData.story_title}
                onChange={(e) => setFormData(prev => ({ ...prev, story_title: e.target.value }))}
                placeholder="Criando experiências desde 2018"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="full_description">Descrição Completa</Label>
            <Textarea
              id="full_description"
              value={formData.full_description}
              onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
              placeholder="Conte a história da sua empresa..."
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor="about_image_url">URL da Imagem</Label>
            <Input
              id="about_image_url"
              value={formData.about_image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, about_image_url: e.target.value }))}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Imagem da equipe ou escritório para a seção sobre
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mission, Vision, Values */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Missão, Visão e Valores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mission">Missão</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              placeholder="Nossa missão é..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="vision">Visão</Label>
            <Textarea
              id="vision"
              value={formData.vision}
              onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
              placeholder="Nossa visão para o futuro..."
              rows={3}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Valores</Label>
              <Button type="button" variant="outline" size="sm" onClick={addValue}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {formData.values.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                    placeholder="Ex: Criatividade, Inovação..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeValue(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.values.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum valor adicionado. Clique em "Adicionar" para começar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Estatísticas
          </CardTitle>
          <CardDescription>
            Números para exibir na landing page (ex: "150+", "40+")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="foundation_year">Ano de Fundação</Label>
              <Input
                id="foundation_year"
                value={formData.foundation_year}
                onChange={(e) => setFormData(prev => ({ ...prev, foundation_year: e.target.value }))}
                placeholder="2018"
              />
            </div>
            <div>
              <Label htmlFor="team_size">Tamanho do Time</Label>
              <Input
                id="team_size"
                value={formData.team_size}
                onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
                placeholder="15+"
              />
            </div>
            <div>
              <Label htmlFor="projects_count">Projetos Entregues</Label>
              <Input
                id="projects_count"
                value={formData.projects_count}
                onChange={(e) => setFormData(prev => ({ ...prev, projects_count: e.target.value }))}
                placeholder="150+"
              />
            </div>
            <div>
              <Label htmlFor="clients_count">Clientes Atendidos</Label>
              <Input
                id="clients_count"
                value={formData.clients_count}
                onChange={(e) => setFormData(prev => ({ ...prev, clients_count: e.target.value }))}
                placeholder="40+"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Differentials */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Diferenciais
              </CardTitle>
              <CardDescription>
                "Por que nos escolher" - exibido como grid na landing
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addDifferential}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.differentials.map((diff, index) => (
              <div key={index} className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Ícone</Label>
                      <Select
                        value={diff.icon}
                        onValueChange={(value) => updateDifferential(index, 'icon', value)}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              {renderIcon(diff.icon)}
                              <span>{diff.icon}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map(icon => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2">
                                {renderIcon(icon)}
                                <span>{icon}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={diff.title}
                        onChange={(e) => updateDifferential(index, 'title', e.target.value)}
                        placeholder="Atendimento 24h"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={diff.description}
                        onChange={(e) => updateDifferential(index, 'description', e.target.value)}
                        placeholder="Suporte em tempo real"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => removeDifferential(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {formData.differentials.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum diferencial adicionado. Clique em "Adicionar" para começar.
              </p>
            )}
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
