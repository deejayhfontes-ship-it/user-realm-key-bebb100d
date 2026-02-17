import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ActiveOrder {
  id: string;
  protocolo: string;
  servico: string;
  valor: number;
  status: string;
  prazo_final: string | null;
  created_at: string;
}

interface ActiveOrderCardProps {
  order: ActiveOrder | null;
  onOpenChat: () => void;
}

const statusConfig: Record<string, { label: string; color: string; progress: number }> = {
  'pendente': { label: 'Aguardando', color: 'bg-yellow-500/15 text-yellow-600', progress: 10 },
  'orcamento': { label: 'Orçamento Enviado', color: 'bg-blue-500/15 text-blue-600', progress: 25 },
  'aprovado': { label: 'Aprovado', color: 'bg-primary/15 text-primary', progress: 40 },
  'pagamento_pendente': { label: 'Aguardando Pagamento', color: 'bg-orange-500/15 text-orange-600', progress: 50 },
  'em_confeccao': { label: 'Em Confecção', color: 'bg-purple-500/15 text-purple-600', progress: 70 },
  'entregue': { label: 'Entregue', color: 'bg-green-500/15 text-green-600', progress: 100 },
  'cancelado': { label: 'Cancelado', color: 'bg-destructive/15 text-destructive', progress: 0 },
};

export function ActiveOrderCard({ order, onOpenChat }: ActiveOrderCardProps) {
  if (!order) {
    // CTA for new order
    return (
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Comece seu próximo projeto!
          </h3>
          <p className="text-muted-foreground mb-6">
            Transforme suas ideias em realidade com nossos serviços
          </p>
          <Link to="/briefing">
            <Button size="lg" className="gap-2">
              Fazer Orçamento
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const config = statusConfig[order.status] || statusConfig['pendente'];
  
  const getDaysRemaining = () => {
    if (!order.prazo_final) return null;
    const prazo = new Date(order.prazo_final);
    const now = new Date();
    const diff = Math.ceil((prazo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();
  const daysColor = daysRemaining !== null 
    ? daysRemaining <= 0 ? 'text-destructive' 
    : daysRemaining <= 3 ? 'text-yellow-600' 
    : 'text-green-600'
    : 'text-muted-foreground';

  return (
    <Card className="border-2 border-primary relative overflow-hidden">
      {/* Pulse badge */}
      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground animate-pulse">
        Em Andamento
      </Badge>

      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Seu Pedido Atual</h3>
            <Link 
              to={`/pedido/${order.protocolo}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              #{order.protocolo}
            </Link>
          </div>
        </div>

        {/* Service name */}
        <h4 className="text-xl font-bold text-foreground mb-6">{order.servico}</h4>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-primary">
              R$ {order.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <Badge className={config.color}>{config.label}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Entrega em</p>
            {order.prazo_final ? (
              <div>
                <p className="font-semibold text-foreground">
                  {new Date(order.prazo_final).toLocaleDateString('pt-BR')}
                </p>
                {daysRemaining !== null && (
                  <p className={`text-sm ${daysColor}`}>
                    {daysRemaining > 0 ? `Em ${daysRemaining} dias` : daysRemaining === 0 ? 'Hoje!' : 'Atrasado'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">A definir</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={config.progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={config.progress >= 10 ? 'text-primary font-medium' : ''}>Pedido</span>
            <span className={config.progress >= 25 ? 'text-primary font-medium' : ''}>Orçamento</span>
            <span className={config.progress >= 50 ? 'text-primary font-medium' : ''}>Pagamento</span>
            <span className={config.progress >= 70 ? 'text-primary font-medium' : ''}>Confecção</span>
            <span className={config.progress >= 100 ? 'text-primary font-medium' : ''}>Entrega</span>
          </div>
        </div>

        {/* Timeline dots */}
        <div className="flex items-center justify-between mb-8">
          {[10, 25, 50, 70, 100].map((step, i) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  config.progress >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : config.progress >= step - 10 
                    ? 'border-2 border-primary animate-pulse bg-primary/10'
                    : 'bg-muted'
                }`}
              >
                {config.progress >= step ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              {i < 4 && (
                <div className={`h-0.5 w-8 md:w-16 ${
                  config.progress > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link to={`/pedido/${order.protocolo}`}>
            <Button className="gap-2">
              Ver Detalhes Completos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={onOpenChat}>
            <MessageCircle className="w-4 h-4" />
            Enviar Mensagem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
