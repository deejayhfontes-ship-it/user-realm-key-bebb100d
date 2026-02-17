import { Link } from 'react-router-dom';
import { Bell, ShoppingBag, MessageCircle, CreditCard, Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ClientNotification } from '@/hooks/useClientNotifications';

interface NotificationsCardProps {
  notifications: ClientNotification[];
  unreadCount: number;
}

const iconMap: Record<string, React.ElementType> = {
  pedido: ShoppingBag,
  mensagem: MessageCircle,
  pagamento: CreditCard,
  entrega: Package,
};

export function NotificationsCard({ notifications, unreadCount }: NotificationsCardProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Atualizações
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground ml-1">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(!notifications || notifications.length === 0) ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Bell className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma notificação recente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif) => {
              const Icon = iconMap[notif.tipo] || Bell;
              return (
                <Link 
                  key={notif.id}
                  to={notif.link || '#'}
                  className="block"
                >
                  <div className={cn(
                    "p-3 rounded-lg transition-colors cursor-pointer",
                    notif.lida ? 'hover:bg-muted/50' : 'bg-muted/50 hover:bg-muted'
                  )}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm truncate">
                            {notif.titulo}
                          </p>
                          {!notif.lida && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {notif.descricao}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notif.tempo}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
