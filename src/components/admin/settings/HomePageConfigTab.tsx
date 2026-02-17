import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  LayoutGrid, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Mail,
  Lock,
  Info,
  Loader2
} from 'lucide-react';
import { useHomeSections } from '@/hooks/useHomeSections';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SectionConfig {
  slug: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  isFixed?: boolean;
  editTab?: string;
}

interface HomePageConfigTabProps {
  onTabChange?: (tab: string) => void;
}

const allSections: SectionConfig[] = [
  {
    slug: 'hero',
    name: 'Hero Section',
    description: 'Seção principal do topo (sempre visível)',
    icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    iconBg: 'bg-purple-100',
    isFixed: true,
  },
  {
    slug: 'projects',
    name: 'Cards Principais',
    description: '4 cards principais (Área Cliente, Pacotes, Portfólio, Orçamento)',
    icon: <LayoutGrid className="w-5 h-5 text-blue-600" />,
    iconBg: 'bg-blue-100',
  },
  {
    slug: 'about',
    name: 'Sobre Nós',
    description: 'Informações sobre a empresa',
    icon: <Users className="w-5 h-5 text-green-600" />,
    iconBg: 'bg-green-100',
    editTab: 'sobre',
  },
  {
    slug: 'services',
    name: 'Serviços',
    description: 'Grid de serviços oferecidos',
    icon: <Briefcase className="w-5 h-5 text-orange-600" />,
    iconBg: 'bg-orange-100',
    editTab: 'servicos',
  },
  {
    slug: 'generators',
    name: 'Geradores IA',
    description: 'Seção de recursos premium com IA',
    icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    iconBg: 'bg-purple-100',
  },
  {
    slug: 'milestones',
    name: 'Números que Falam por Nós',
    description: 'Anos, projetos e clientes (conquistas)',
    icon: <TrendingUp className="w-5 h-5 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    editTab: 'sobre',
  },
  {
    slug: 'clients',
    name: 'Parceiros Criativos',
    description: 'Carrossel de logos de clientes',
    icon: <Users className="w-5 h-5 text-indigo-600" />,
    iconBg: 'bg-indigo-100',
    editTab: 'parceiros',
  },
  {
    slug: 'contact',
    name: 'Formulário de Contato',
    description: 'Seção "Vamos Conversar"',
    icon: <Mail className="w-5 h-5 text-pink-600" />,
    iconBg: 'bg-pink-100',
    editTab: 'formulario',
  },
];

export function HomePageConfigTab({ onTabChange }: HomePageConfigTabProps) {
  const { sections, loading, updating, updateSection } = useHomeSections();
  const [localStates, setLocalStates] = useState<Record<string, boolean>>({});

  const getSectionState = (slug: string): boolean => {
    // Check local state first (for optimistic updates)
    if (localStates[slug] !== undefined) return localStates[slug];
    // Then check database
    const dbSection = sections.find(s => s.slug === slug);
    return dbSection?.is_active ?? true;
  };

  const handleToggleSection = async (slug: string, isActive: boolean) => {
    // Optimistic update
    setLocalStates(prev => ({ ...prev, [slug]: isActive }));
    
    try {
      await updateSection({ slug, updates: { is_active: isActive } });
      toast({
        title: isActive ? '✅ Seção ativada' : '❌ Seção desativada',
        description: `A seção será ${isActive ? 'exibida' : 'ocultada'} na home.`,
      });
    } catch {
      // Revert on error
      setLocalStates(prev => {
        const newState = { ...prev };
        delete newState[slug];
        return newState;
      });
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar a seção.',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback: try clicking the tab directly
      const element = document.querySelector(`[data-tab="${tabName}"]`);
      if (element) {
        (element as HTMLButtonElement).click();
      }
    }
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
          {allSections.map((section) => {
            const isActive = getSectionState(section.slug);

            return (
              <div 
                key={section.slug}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-colors",
                  section.isFixed 
                    ? "bg-muted/50 border-border" 
                    : isActive 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-muted/30 border-border"
                )}
              >
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", section.iconBg)}>
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{section.name}</span>
                      {section.isFixed && (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                {/* Right: Edit + Toggle */}
                <div className="flex items-center gap-4">
                  {section.editTab && !section.isFixed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(section.editTab!)}
                      className="font-semibold hover:bg-[#c4ff0d]/20"
                      style={{ color: '#c4ff0d' }}
                    >
                      Editar
                    </Button>
                  )}

                  {section.isFixed ? (
                    <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">
                      Fixo
                    </span>
                  ) : (
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => handleToggleSection(section.slug, checked)}
                      disabled={updating}
                      className="data-[state=checked]:bg-[#c4ff0d]"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">💡 Dica</p>
              <p className="text-sm text-blue-700">
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
