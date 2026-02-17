import { Link } from 'react-router-dom';
import { Package, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PlanInfo {
  nome: string;
  ativo: boolean;
  renovacao: string | null;
  beneficios: string[];
}

interface PlanCardProps {
  plan: PlanInfo | null;
}

export function PlanCard({ plan }: PlanCardProps) {
  if (!plan || !plan.ativo) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Meu Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Upgrade seu plano para acessar recursos exclusivos
          </p>
          <Link to="/client/pacotes">
            <Button className="gap-2">
              Ver planos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-foreground">{plan.nome}</h4>
          <Badge className="bg-green-500/15 text-green-600">Ativo</Badge>
        </div>

        <ul className="space-y-2 mb-4">
          {plan.beneficios.map((beneficio, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              {beneficio}
            </li>
          ))}
        </ul>

        {plan.renovacao && (
          <p className="text-xs text-muted-foreground">
            Renovação em {new Date(plan.renovacao).toLocaleDateString('pt-BR')}
          </p>
        )}

        <Link to="/client/pacotes" className="text-xs text-primary hover:underline mt-2 inline-block">
          Gerenciar plano
        </Link>
      </CardContent>
    </Card>
  );
}
