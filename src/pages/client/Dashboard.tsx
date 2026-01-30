import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientData } from '@/hooks/useClientData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Dashboard components
import { DashboardHeader } from '@/components/client/dashboard/DashboardHeader';
import { ActiveOrderCard } from '@/components/client/dashboard/ActiveOrderCard';
import { RecentOrdersCard } from '@/components/client/dashboard/RecentOrdersCard';
import { GeneratorsCard } from '@/components/client/dashboard/GeneratorsCard';
import { FilesCard } from '@/components/client/dashboard/FilesCard';
import { ChatWidget } from '@/components/client/dashboard/ChatWidget';
import { NotificationsCard } from '@/components/client/dashboard/NotificationsCard';
import { QuickActionsCard } from '@/components/client/dashboard/QuickActionsCard';
import { PlanCard } from '@/components/client/dashboard/PlanCard';
import { MobileChatFAB } from '@/components/client/dashboard/MobileChatFAB';

export default function ClientDashboard() {
  const { profile } = useAuth();
  const { client, generators, creditsInfo, isLoading } = useClientData();
  const [chatOpen, setChatOpen] = useState(true);

  // Fetch client's orders (pedidos)
  const { data: pedidos, isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['client-pedidos', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.client_id,
  });

  // Get active order (not delivered or cancelled)
  const activeOrder = pedidos?.find(p => 
    !['entregue', 'cancelado'].includes(p.status || '')
  );

  // Format active order for component
  const formattedActiveOrder = activeOrder ? {
    id: activeOrder.id,
    protocolo: activeOrder.protocolo,
    servico: activeOrder.descricao,
    valor: activeOrder.valor_orcado || 0,
    status: activeOrder.status || 'pendente',
    prazo_final: activeOrder.prazo_final,
    created_at: activeOrder.created_at || '',
  } : null;

  // Format orders for recent list
  const formattedOrders = pedidos?.map(p => ({
    id: p.id,
    protocolo: p.protocolo,
    descricao: p.descricao,
    status: p.status || 'pendente',
    created_at: p.created_at || '',
    data_entrega: p.data_entrega,
  })) || [];

  // Mock notifications (replace with real data)
  const notifications = [
    {
      id: '1',
      tipo: 'pedido' as const,
      titulo: 'Pedido atualizado',
      descricao: 'Status alterado para "Em Confecção"',
      tempo: 'há 2 horas',
      lida: false,
      link: '/client/pedidos',
    },
    {
      id: '2',
      tipo: 'mensagem' as const,
      titulo: 'Nova mensagem',
      descricao: 'Você recebeu uma resposta do suporte',
      tempo: 'há 5 horas',
      lida: true,
      link: '/client/suporte',
    },
  ];

  // Mock plan info (replace with real data)
  const planInfo = client?.type === 'package' ? {
    nome: 'Plano Profissional',
    ativo: true,
    renovacao: client.access_expires_at,
    beneficios: [
      `${client.package_credits || 0} créditos de geração`,
      'Suporte prioritário',
      'Revisões ilimitadas',
    ],
  } : null;

  // Mock files (replace with real data)
  const files: any[] = [];

  const unreadNotifications = notifications.filter(n => !n.lida).length;
  const activeOrdersCount = pedidos?.filter(p => 
    !['entregue', 'cancelado'].includes(p.status || '')
  ).length || 0;

  if (isLoading || isLoadingPedidos) {
    return (
      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        <Skeleton className="h-40 w-full rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-muted/30 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Personalized Header */}
        <DashboardHeader 
          client={client} 
          activeOrdersCount={activeOrdersCount} 
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Active Order or CTA */}
            <ActiveOrderCard 
              order={formattedActiveOrder} 
              onOpenChat={() => setChatOpen(true)}
            />

            {/* Recent Orders */}
            <RecentOrdersCard orders={formattedOrders} />

            {/* AI Generators */}
            <GeneratorsCard 
              generators={generators || []}
              creditsUsed={creditsInfo.used}
              creditsTotal={creditsInfo.total}
            />

            {/* Files & Downloads */}
            <FilesCard files={files} />
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            {/* Chat Widget - Desktop only */}
            <div className="hidden lg:block sticky top-6">
              <ChatWidget 
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
              />
              
              {/* Notifications */}
              <div className="mt-6">
                <NotificationsCard 
                  notifications={notifications}
                  unreadCount={unreadNotifications}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-6">
                <QuickActionsCard />
              </div>

              {/* Plan Info */}
              <div className="mt-6">
                <PlanCard plan={planInfo} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile widgets below main content */}
        <div className="lg:hidden mt-6 space-y-6">
          <NotificationsCard 
            notifications={notifications}
            unreadCount={unreadNotifications}
          />
          <QuickActionsCard />
          <PlanCard plan={planInfo} />
        </div>

        {/* Mobile Chat FAB */}
        <MobileChatFAB unreadCount={2} />
      </div>
    </div>
  );
}
