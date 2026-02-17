<<<<<<< HEAD
import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, X, ExternalLink, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, subDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAgendaEvents, EVENT_COLORS, EVENT_LABELS, type AgendaEvent } from '@/hooks/useAgendaEvents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type ViewMode = 'day' | 'week';

export default function AdminAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Dados reais do Supabase
  const { data: eventos = [], isLoading } = useAgendaEvents({
    date: currentDate,
    view: viewMode,
  });

  // Horários do dia (8h às 20h)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Dias da semana atual
  const weekStart = startOfWeek(currentDate, { locale: ptBR, weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      entrega: 'bg-green-500',
      reuniao: 'bg-blue-500',
      tarefa: 'bg-yellow-500',
      briefing: 'bg-purple-500',
      pagamento: 'bg-red-500',
      solicitacao: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const handlePrev = () => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleDeleteEvent = async (event: AgendaEvent) => {
    if (!event.pedidoId) {
      toast.error('Este evento não pode ser removido');
      return;
    }

    setDeleting(true);
    try {
      // Limpa a data associada para remover da agenda
      if (event.type === 'entrega') {
        const { error } = await supabase
          .from('pedidos')
          .update({ prazo_final: null })
          .eq('id', event.pedidoId);
        if (error) throw error;
      } else if (event.type === 'briefing') {
        const { error } = await supabase
          .from('pedidos')
          .update({ data_briefing: null })
          .eq('id', event.pedidoId);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
      toast.success('Evento removido da agenda!');
      setSelectedEvent(null);
    } catch (err: any) {
      toast.error(`Erro ao remover: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const displayDays = viewMode === 'week' ? weekDays : [currentDate];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agenda Completa</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie tarefas, entregas e compromissos
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Botões Dia/Semana */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'day'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Dia
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'week'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Semana
                </button>
              </div>

              {/* Navegação de data */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-primary text-black hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Evento
              </button>
            </div>
          </div>

          {/* Data atual */}
          <div className="text-sm text-muted-foreground capitalize">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* CALENDÁRIO */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Carregando agenda...</span>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">

            {/* HEADER DOS DIAS */}
            <div className={cn(
              "grid border-b border-border",
              viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'
            )}>
              <div className="p-4 text-sm font-medium text-muted-foreground border-r border-border">
                Horário
              </div>
              {displayDays.map((day) => (
                <div
                  key={day.toString()}
                  className={cn(
                    "p-4 text-center",
                    isToday(day) && 'bg-primary/5'
                  )}
                >
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold mt-1",
                    isToday(day) ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* GRID DE HORÁRIOS */}
            <div className="relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "grid border-b border-border/50",
                    viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'
                  )}
                >
                  {/* Coluna de horário */}
                  <div className="p-4 text-sm text-muted-foreground font-medium border-r border-border">
                    {hour.toString().padStart(2, '0')}:00
                  </div>

                  {/* Colunas de dias */}
                  {displayDays.map((day) => {
                    const dayEvents = eventos.filter(e =>
                      isSameDay(e.startTime, day) &&
                      e.startTime.getHours() === hour
                    );

                    return (
                      <div
                        key={day.toString()}
                        className={cn(
                          "p-2 min-h-[80px] hover:bg-muted/50 cursor-pointer relative border-r border-border/30 last:border-r-0",
                          isToday(day) && 'bg-primary/5'
                        )}
                      >
                        {dayEvents.map((evento) => (
                          <div
                            key={evento.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(evento);
                            }}
                            className={cn(
                              getEventColor(evento.type),
                              "text-white p-2 rounded-lg text-xs mb-1 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            )}
                          >
                            <div className="font-semibold truncate">{evento.title}</div>
                            <div className="opacity-90">
                              {format(evento.startTime, 'HH:mm')} - {format(evento.endTime, 'HH:mm')}
                            </div>
                            {evento.clientName && (
                              <div className="text-[10px] opacity-75 mt-1">
                                {evento.clientName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEGENDA */}
        <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Entrega</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Reunião</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Tarefa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Briefing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Pagamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Solicitação Prefeitura</span>
          </div>

          {eventos.length === 0 && !isLoading && (
            <span className="ml-auto text-white/40 italic">Nenhum evento nesta semana</span>
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES DO EVENTO */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header colorido */}
            <div className={cn(getEventColor(selectedEvent.type), "p-5")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white/80">
                    {EVENT_LABELS[selectedEvent.type as keyof typeof EVENT_LABELS] || selectedEvent.type}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Data</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {format(selectedEvent.startTime, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Horário</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {format(selectedEvent.startTime, 'HH:mm')} - {format(selectedEvent.endTime, 'HH:mm')}
                  </p>
                </div>
              </div>

              {selectedEvent.clientName && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Cliente</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedEvent.clientName}</p>
                </div>
              )}

              {selectedEvent.pedidoProtocolo && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Protocolo</p>
                  <p className="text-sm text-foreground mt-0.5 font-mono">{selectedEvent.pedidoProtocolo}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Descrição</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedEvent.description}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Remover da Agenda
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
=======
import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, X, ExternalLink, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, subDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAgendaEvents, EVENT_COLORS, EVENT_LABELS, type AgendaEvent } from '@/hooks/useAgendaEvents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type ViewMode = 'day' | 'week';

export default function AdminAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Dados reais do Supabase
  const { data: eventos = [], isLoading } = useAgendaEvents({
    date: currentDate,
    view: viewMode,
  });

  // Horários do dia (8h às 20h)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Dias da semana atual
  const weekStart = startOfWeek(currentDate, { locale: ptBR, weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      entrega: 'bg-green-500',
      reuniao: 'bg-blue-500',
      tarefa: 'bg-yellow-500',
      briefing: 'bg-purple-500',
      pagamento: 'bg-red-500',
      solicitacao: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const handlePrev = () => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleDeleteEvent = async (event: AgendaEvent) => {
    if (!event.pedidoId) {
      toast.error('Este evento não pode ser removido');
      return;
    }

    setDeleting(true);
    try {
      // Limpa a data associada para remover da agenda
      if (event.type === 'entrega') {
        const { error } = await supabase
          .from('pedidos')
          .update({ prazo_final: null })
          .eq('id', event.pedidoId);
        if (error) throw error;
      } else if (event.type === 'briefing') {
        const { error } = await supabase
          .from('pedidos')
          .update({ data_briefing: null })
          .eq('id', event.pedidoId);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['agenda-events'] });
      toast.success('Evento removido da agenda!');
      setSelectedEvent(null);
    } catch (err: any) {
      toast.error(`Erro ao remover: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const displayDays = viewMode === 'week' ? weekDays : [currentDate];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Agenda Completa</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie tarefas, entregas e compromissos
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Botões Dia/Semana */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('day')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'day'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Dia
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    viewMode === 'week'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Semana
                </button>
              </div>

              {/* Navegação de data */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-primary text-black hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Evento
              </button>
            </div>
          </div>

          {/* Data atual */}
          <div className="text-sm text-muted-foreground capitalize">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* CALENDÁRIO */}
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Carregando agenda...</span>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">

            {/* HEADER DOS DIAS */}
            <div className={cn(
              "grid border-b border-border",
              viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'
            )}>
              <div className="p-4 text-sm font-medium text-muted-foreground border-r border-border">
                Horário
              </div>
              {displayDays.map((day) => (
                <div
                  key={day.toString()}
                  className={cn(
                    "p-4 text-center",
                    isToday(day) && 'bg-primary/5'
                  )}
                >
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold mt-1",
                    isToday(day) ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* GRID DE HORÁRIOS */}
            <div className="relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "grid border-b border-border/50",
                    viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'
                  )}
                >
                  {/* Coluna de horário */}
                  <div className="p-4 text-sm text-muted-foreground font-medium border-r border-border">
                    {hour.toString().padStart(2, '0')}:00
                  </div>

                  {/* Colunas de dias */}
                  {displayDays.map((day) => {
                    const dayEvents = eventos.filter(e =>
                      isSameDay(e.startTime, day) &&
                      e.startTime.getHours() === hour
                    );

                    return (
                      <div
                        key={day.toString()}
                        className={cn(
                          "p-2 min-h-[80px] hover:bg-muted/50 cursor-pointer relative border-r border-border/30 last:border-r-0",
                          isToday(day) && 'bg-primary/5'
                        )}
                      >
                        {dayEvents.map((evento) => (
                          <div
                            key={evento.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(evento);
                            }}
                            className={cn(
                              getEventColor(evento.type),
                              "text-white p-2 rounded-lg text-xs mb-1 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            )}
                          >
                            <div className="font-semibold truncate">{evento.title}</div>
                            <div className="opacity-90">
                              {format(evento.startTime, 'HH:mm')} - {format(evento.endTime, 'HH:mm')}
                            </div>
                            {evento.clientName && (
                              <div className="text-[10px] opacity-75 mt-1">
                                {evento.clientName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEGENDA */}
        <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Entrega</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Reunião</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Tarefa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Briefing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Pagamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Solicitação Prefeitura</span>
          </div>

          {eventos.length === 0 && !isLoading && (
            <span className="ml-auto text-white/40 italic">Nenhum evento nesta semana</span>
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES DO EVENTO */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header colorido */}
            <div className={cn(getEventColor(selectedEvent.type), "p-5")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white/80">
                    {EVENT_LABELS[selectedEvent.type as keyof typeof EVENT_LABELS] || selectedEvent.type}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Data</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {format(selectedEvent.startTime, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Horário</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {format(selectedEvent.startTime, 'HH:mm')} - {format(selectedEvent.endTime, 'HH:mm')}
                  </p>
                </div>
              </div>

              {selectedEvent.clientName && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Cliente</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedEvent.clientName}</p>
                </div>
              )}

              {selectedEvent.pedidoProtocolo && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Protocolo</p>
                  <p className="text-sm text-foreground mt-0.5 font-mono">{selectedEvent.pedidoProtocolo}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-[10px] uppercase text-muted-foreground font-medium">Descrição</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedEvent.description}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Remover da Agenda
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
