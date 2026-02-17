import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Order {
  id: string;
  protocolo: string;
  descricao: string;
  status: string;
  created_at: string;
  data_entrega?: string | null;
}

interface RecentOrdersCardProps {
  orders: Order[];
}

const statusConfig: Record<string, { label: string; color: string; progress: number }> = {
  'pendente': { label: 'Aguardando', color: 'bg-yellow-500/15 text-yellow-600', progress: 10 },
  'orcamento': { label: 'Orçamento', color: 'bg-blue-500/15 text-blue-600', progress: 25 },
  'aprovado': { label: 'Aprovado', color: 'bg-primary/15 text-primary', progress: 40 },
  'pagamento_pendente': { label: 'Pag. Pendente', color: 'bg-orange-500/15 text-orange-600', progress: 50 },
  'em_confeccao': { label: 'Em Confecção', color: 'bg-purple-500/15 text-purple-600', progress: 70 },
  'entregue': { label: 'Entregue', color: 'bg-green-500/15 text-green-600', progress: 100 },
  'cancelado': { label: 'Cancelado', color: 'bg-destructive/15 text-destructive', progress: 0 },
};

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Seus Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground mb-4">Você ainda não tem pedidos</p>
          <Link to="/briefing">
            <Button variant="outline" size="sm">Fazer primeiro pedido</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Seus Pedidos
        </CardTitle>
        <Link to="/client/pedidos">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.slice(0, 3).map((order) => {
          const config = statusConfig[order.status] || statusConfig['pendente'];
          const isDelivered = order.status === 'entregue';

          return (
            <Link 
              key={order.id} 
              to={`/pedido/${order.protocolo}`}
              className="block"
            >
              <div className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors hover:shadow-sm cursor-pointer">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">#{order.protocolo}</span>
                  <Badge className={config.color}>{config.label}</Badge>
                </div>

                {/* Details */}
                <p className="text-sm text-muted-foreground truncate mb-3">{order.descricao}</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                  {isDelivered && order.data_entrega ? (
                    <span className="text-green-600">
                      Entregue em {new Date(order.data_entrega).toLocaleDateString('pt-BR')}
                    </span>
                  ) : config.progress > 0 && config.progress < 100 && (
                    <div className="flex items-center gap-2">
                      <Progress value={config.progress} className="w-16 h-1.5" />
                      <span>{config.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
