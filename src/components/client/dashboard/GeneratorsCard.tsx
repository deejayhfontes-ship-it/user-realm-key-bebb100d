import { Link } from 'react-router-dom';
import { Sparkles, Smartphone, Images, ArrowRight, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClientGenerator } from '@/hooks/useClientData';

interface GeneratorsCardProps {
  generators: ClientGenerator[];
  creditsUsed: number;
  creditsTotal: number;
}

const iconMap: Record<string, React.ElementType> = {
  stories: Smartphone,
  derivations: Sparkles,
  carousel: Images,
};

export function GeneratorsCard({ generators, creditsUsed, creditsTotal }: GeneratorsCardProps) {
  const creditsPercentage = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

  if (!generators || generators.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-none">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Recursos Premium</h3>
          <p className="text-white/60 mb-4">
            Geradores de IA ainda não disponíveis
          </p>
          <p className="text-white/40 text-sm">
            Entre em contato para liberar acesso
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-none">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Recursos Premium
                <Badge className="bg-primary/20 text-primary border-none text-xs">🤖 IA</Badge>
              </h3>
              <p className="text-sm text-white/50">Crie conteúdo profissional em minutos</p>
            </div>
          </div>
        </div>

        {/* Generators grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {generators.slice(0, 4).map((gen) => {
            const Icon = iconMap[gen.generator?.type] || Wand2;
            return (
              <Link 
                key={gen.id} 
                to={`/client/gerador/${gen.generator?.slug}`}
                className="block"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-primary/50 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{gen.generator?.name}</h4>
                      <p className="text-xs text-white/50 line-clamp-1">
                        {gen.generator?.description || 'Gerador de artes'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-3 bg-white/10 hover:bg-primary text-white hover:text-primary-foreground transition-colors"
                  >
                    Acessar
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Credits usage */}
        {creditsTotal > 0 && creditsTotal !== Infinity && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">
                {creditsUsed} de {creditsTotal} gerações usadas
              </span>
              <span className="text-sm font-medium text-primary">{Math.round(creditsPercentage)}%</span>
            </div>
            <Progress value={creditsPercentage} className="h-2" />
            {creditsPercentage >= 80 && (
              <Link to="/client/pacotes" className="text-xs text-primary mt-2 inline-block hover:underline">
                Ver planos para mais créditos →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
