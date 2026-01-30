import { useState } from 'react';
import { Loader2, GripVertical, Eye, EyeOff, Settings, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useHomeSections } from '@/hooks/useHomeSections';
import { cn } from '@/lib/utils';

const sectionIcons: Record<string, string> = {
  hero: '🏠',
  projects: '📁',
  generators: '🤖',
  about: '👥',
  clients: '🤝',
  services: '💼',
  contact: '✉️',
};

const sectionDescriptions: Record<string, string> = {
  hero: 'Banner principal com título e CTA',
  projects: 'Grid de cards e portfólio',
  generators: 'Seção de geradores de arte IA',
  about: 'Informações sobre a empresa',
  clients: 'Logos de parceiros criativos',
  services: 'Lista de serviços oferecidos',
  contact: 'Formulário de contato',
};

const sectionEditRoutes: Record<string, string> = {
  about: 'sobre',
  services: 'servicos',
  clients: 'parceiros',
  contact: 'formulario',
};

export function HomePageConfigTab() {
  const { sections, loading, updating, updateSection } = useHomeSections();

  const handleToggleSection = async (slug: string, isActive: boolean) => {
    await updateSection({ slug, updates: { is_active: isActive } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Seções da Home Page</CardTitle>
          <CardDescription>
            Ative ou desative as seções que aparecem na página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.map((section) => {
            const icon = sectionIcons[section.slug] || '📄';
            const description = sectionDescriptions[section.slug] || '';
            const editRoute = sectionEditRoutes[section.slug];
            const isLocked = !section.is_editable;

            return (
              <div 
                key={section.slug}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                  section.is_active 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-muted/30 border-border"
                )}
              >
                {/* Drag Handle (visual only for now) */}
                <div className="text-muted-foreground cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Icon */}
                <div className="text-2xl">{icon}</div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.name}</span>
                    {isLocked && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-4">
                  {editRoute && section.is_editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Scroll to tab or navigate
                        const element = document.querySelector(`[data-tab="${editRoute}"]`);
                        if (element) {
                          (element as HTMLButtonElement).click();
                        }
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}

                  {section.is_editable ? (
                    <div className="flex items-center gap-2">
                      {section.is_active ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={section.is_active}
                        onCheckedChange={(checked) => handleToggleSection(section.slug, checked)}
                        disabled={updating || isLocked}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">
                      Sempre visível
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border border-border bg-muted/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-medium">Dica</p>
              <p className="text-sm text-muted-foreground">
                As seções marcadas como "Editar" possuem conteúdo personalizável em suas respectivas abas.
                A seção Hero é fixa e sempre aparece no topo da página.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
