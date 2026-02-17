import { Link } from 'react-router-dom';
import { Plus, Sparkles, FileText, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
  { label: 'Novo Orçamento', icon: Plus, href: '/briefing' },
  { label: 'Acessar Geradores', icon: Sparkles, href: '/client/geradores' },
  { label: 'Minhas Faturas', icon: FileText, href: '/client/faturas' },
  { label: 'Histórico de Artes', icon: MessageCircle, href: '/client/historico' },
];

export function QuickActionsCard() {
  return (
    <Card className="border-none bg-gradient-to-br from-primary to-primary/80">
      <CardContent className="p-5">
        <h3 className="font-semibold text-primary-foreground mb-4">Ações Rápidas</h3>
        <div className="space-y-2">
          {actions.map((action) => (
            <Link key={action.href} to={action.href}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/10 hover:bg-black/15 transition-colors cursor-pointer">
                <action.icon className="w-5 h-5 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
