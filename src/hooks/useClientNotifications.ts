import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClientNotification {
  id: string;
  tipo: 'pedido' | 'mensagem' | 'pagamento' | 'entrega';
  titulo: string;
  descricao: string;
  tempo: string;
  lida: boolean;
  link?: string;
  created_at: string;
}

export function useClientNotifications() {
  const { profile } = useAuth();

  // Fetch recent orders updates as notifications
  const { data: orderNotifications } = useQuery({
    queryKey: ['client-order-notifications', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, protocolo, status, updated_at, descricao')
        .eq('client_id', profile.client_id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map((pedido): ClientNotification => ({
        id: `pedido-${pedido.id}`,
        tipo: 'pedido',
        titulo: `Pedido #${pedido.protocolo}`,
        descricao: getStatusDescription(pedido.status || 'pendente'),
        tempo: getTimeAgo(pedido.updated_at),
        lida: false, // Could be tracked in a separate table
        link: `/pedido/${pedido.protocolo}`,
        created_at: pedido.updated_at || '',
      }));
    },
    enabled: !!profile?.client_id,
  });

  // Fetch recent entregas as notifications
  const { data: entregaNotifications } = useQuery({
    queryKey: ['client-entrega-notifications', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      const { data, error } = await supabase
        .from('entregas')
        .select('id, protocolo, servico_nome, created_at, token')
        .eq('cliente_id', profile.client_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map((entrega): ClientNotification => ({
        id: `entrega-${entrega.id}`,
        tipo: 'entrega',
        titulo: 'Nova entrega disponível',
        descricao: entrega.servico_nome || `Protocolo ${entrega.protocolo}`,
        tempo: getTimeAgo(entrega.created_at),
        lida: false,
        link: `/entrega/${entrega.token}`,
        created_at: entrega.created_at,
      }));
    },
    enabled: !!profile?.client_id,
  });

  // Fetch recent payments as notifications
  const { data: paymentNotifications } = useQuery({
    queryKey: ['client-payment-notifications', profile?.client_id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('id, status, amount_cents, created_at, payment_plans(name)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map((payment): ClientNotification => ({
        id: `payment-${payment.id}`,
        tipo: 'pagamento',
        titulo: getPaymentTitle(payment.status || 'pending'),
        descricao: `${(payment.payment_plans as any)?.name || 'Pagamento'} - R$ ${(payment.amount_cents / 100).toFixed(2)}`,
        tempo: getTimeAgo(payment.created_at),
        lida: payment.status === 'approved',
        link: '/client/faturas',
        created_at: payment.created_at,
      }));
    },
    enabled: !!profile?.id,
  });

  // Fetch recent chat messages as notifications
  const { data: messageNotifications } = useQuery({
    queryKey: ['client-message-notifications', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      // Get sessions for this client
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessoes')
        .select('id')
        .eq('client_id', profile.client_id);

      if (sessionsError || !sessions?.length) return [];
      
      const sessionIds = sessions.map(s => s.id);
      
      // Get unread messages from admin
      const { data: messages, error } = await supabase
        .from('chat_mensagens')
        .select('id, mensagem, enviada_em, lida')
        .in('sessao_id', sessionIds)
        .eq('remetente_tipo', 'admin')
        .eq('lida', false)
        .order('enviada_em', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return (messages || []).map((msg): ClientNotification => ({
        id: `message-${msg.id}`,
        tipo: 'mensagem',
        titulo: 'Nova mensagem do suporte',
        descricao: msg.mensagem?.slice(0, 50) + (msg.mensagem?.length > 50 ? '...' : ''),
        tempo: getTimeAgo(msg.enviada_em),
        lida: msg.lida || false,
        link: '/client/dashboard', // Chat is in dashboard
        created_at: msg.enviada_em || '',
      }));
    },
    enabled: !!profile?.client_id,
  });

  // Combine and sort all notifications
  const allNotifications = [
    ...(orderNotifications || []),
    ...(entregaNotifications || []),
    ...(paymentNotifications || []),
    ...(messageNotifications || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = allNotifications.filter(n => !n.lida).length;

  return {
    notifications: allNotifications.slice(0, 10),
    unreadCount,
    isLoading: false,
  };
}

function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    pendente: 'Aguardando análise do pedido',
    orcamento: 'Orçamento enviado para análise',
    aprovado: 'Pedido aprovado',
    pagamento_pendente: 'Aguardando confirmação de pagamento',
    em_confeccao: 'Seu pedido está em produção',
    entregue: 'Pedido entregue com sucesso',
    cancelado: 'Pedido foi cancelado',
  };
  return descriptions[status] || 'Status atualizado';
}

function getPaymentTitle(status: string): string {
  const titles: Record<string, string> = {
    pending: 'Pagamento pendente',
    processing: 'Pagamento em processamento',
    approved: 'Pagamento confirmado',
    failed: 'Pagamento falhou',
    cancelled: 'Pagamento cancelado',
    refunded: 'Pagamento reembolsado',
  };
  return titles[status] || 'Atualização de pagamento';
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR');
}
