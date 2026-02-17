import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export type EventType = 'entrega' | 'reuniao' | 'tarefa' | 'briefing' | 'pagamento';

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: EventType;
  color: string;
  pedidoId?: string;
  pedidoProtocolo?: string;
  clientName?: string;
}

// Cores por tipo de evento
export const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string }> = {
  entrega: { bg: 'bg-blue-500/20', border: 'border-l-blue-500', text: 'text-blue-600' },
  reuniao: { bg: 'bg-amber-500/20', border: 'border-l-amber-500', text: 'text-amber-600' },
  tarefa: { bg: 'bg-emerald-500/20', border: 'border-l-emerald-500', text: 'text-emerald-600' },
  briefing: { bg: 'bg-purple-500/20', border: 'border-l-purple-500', text: 'text-purple-600' },
  pagamento: { bg: 'bg-orange-500/20', border: 'border-l-orange-500', text: 'text-orange-600' },
};

// Labels em português
export const EVENT_LABELS: Record<EventType, string> = {
  entrega: 'Entrega',
  reuniao: 'Reunião',
  tarefa: 'Tarefa',
  briefing: 'Briefing',
  pagamento: 'Pagamento',
};

interface UseAgendaEventsParams {
  date: Date;
  view: 'day' | 'week';
  enabled?: boolean;
}

export function useAgendaEvents({ date, view, enabled = true }: UseAgendaEventsParams) {
  return useQuery({
    queryKey: ['agenda-events', format(date, 'yyyy-MM-dd'), view],
    queryFn: async (): Promise<AgendaEvent[]> => {
      const startDate = view === 'day' 
        ? startOfDay(date) 
        : startOfWeek(date, { locale: ptBR });
      const endDate = view === 'day' 
        ? endOfDay(date) 
        : endOfWeek(date, { locale: ptBR });

      // Buscar pedidos com datas relevantes no período
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          protocolo,
          nome,
          descricao,
          prazo_final,
          data_entrega,
          data_briefing,
          data_inicio_confeccao,
          status,
          clients (name)
        `)
        .gte('prazo_final', format(startDate, 'yyyy-MM-dd'))
        .lte('prazo_final', format(endDate, 'yyyy-MM-dd'))
        .order('prazo_final', { ascending: true });

      if (error) throw error;

      const events: AgendaEvent[] = [];

      // Converter pedidos em eventos de entrega
      (pedidos || []).forEach((pedido) => {
        if (pedido.prazo_final) {
          // Criar data com horário padrão às 17:00 (fim de expediente)
          const prazoDate = new Date(pedido.prazo_final + 'T17:00:00');
          
          events.push({
            id: `entrega-${pedido.id}`,
            title: `Entrega: ${pedido.protocolo}`,
            description: pedido.descricao?.slice(0, 100),
            startTime: prazoDate,
            endTime: new Date(prazoDate.getTime() + 60 * 60 * 1000), // +1h
            type: 'entrega',
            color: EVENT_COLORS.entrega.bg,
            pedidoId: pedido.id,
            pedidoProtocolo: pedido.protocolo,
            clientName: (pedido.clients as { name?: string } | null)?.name || pedido.nome,
          });
        }
      });

      // Também buscar briefings recentes (últimos 7 dias)
      const { data: briefings } = await supabase
        .from('pedidos')
        .select('id, protocolo, nome, descricao, data_briefing, clients (name)')
        .eq('status', 'briefing')
        .gte('data_briefing', format(startDate, "yyyy-MM-dd'T'HH:mm:ss"))
        .lte('data_briefing', format(endDate, "yyyy-MM-dd'T'HH:mm:ss"));

      (briefings || []).forEach((pedido) => {
        if (pedido.data_briefing) {
          const briefingDate = new Date(pedido.data_briefing);
          
          events.push({
            id: `briefing-${pedido.id}`,
            title: `Briefing: ${pedido.protocolo}`,
            description: `Novo briefing de ${pedido.nome}`,
            startTime: briefingDate,
            endTime: new Date(briefingDate.getTime() + 30 * 60 * 1000), // +30min
            type: 'briefing',
            color: EVENT_COLORS.briefing.bg,
            pedidoId: pedido.id,
            pedidoProtocolo: pedido.protocolo,
            clientName: (pedido.clients as { name?: string } | null)?.name || pedido.nome,
          });
        }
      });

      // Ordenar por horário
      return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// Hook para configuração da agenda
export function useAgendaConfig() {
  // Por enquanto retorna config estática, pode ser expandido para banco
  return {
    enabled: true,
    startHour: 8,
    endHour: 20,
    slotHeight: 60, // pixels por hora
  };
}
