import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { AgendaCard } from '@/components/admin/dashboard/AgendaCard';
import { TrelloCard } from '@/components/admin/dashboard/TrelloCard';
import { CobrancasCard } from '@/components/admin/dashboard/CobrancasCard';
import { FaturamentoCard } from '@/components/admin/dashboard/FaturamentoCard';
import { MetaCard } from '@/components/admin/dashboard/MetaCard';
import { EntregasCard } from '@/components/admin/dashboard/EntregasCard';
import { DashboardFAB } from '@/components/admin/dashboard/DashboardFAB';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const notificationCount = 3; // Mock - replace with real count

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="flex flex-col min-h-full bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Left side - Greeting */}
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {getGreeting()}, {userName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Aqui está um resumo do seu negócio hoje
              </p>
            </div>

            {/* Right side - Notifications & Avatar */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium">Novo briefing recebido</span>
                    <span className="text-xs text-muted-foreground">há 5 minutos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium">Pagamento confirmado</span>
                    <span className="text-xs text-muted-foreground">há 1 hora</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium">Prazo de entrega próximo</span>
                    <span className="text-xs text-muted-foreground">há 2 horas</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center text-primary">
                    Ver todas as notificações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar & Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AgendaCard />
            <TrelloCard />
            <CobrancasCard />
            <FaturamentoCard />
            <MetaCard />
            <EntregasCard />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <DashboardFAB />
    </div>
  );
}
