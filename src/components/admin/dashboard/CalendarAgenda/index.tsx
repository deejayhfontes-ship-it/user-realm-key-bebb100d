import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CalendarX, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarHeader } from './CalendarHeader';
import { TimeGrid } from './TimeGrid';
import { AddEventDialog } from './AddEventDialog';
import { useAgendaEvents, useAgendaConfig, type AgendaEvent, type EventType } from '@/hooks/useAgendaEvents';
import type { ViewMode } from './types';
import { toast } from 'sonner';

interface CalendarAgendaProps {
  className?: string;
}

export function CalendarAgenda({ className }: CalendarAgendaProps) {
  const navigate = useNavigate();
  const config = useAgendaConfig();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('day');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: events = [], isLoading, error } = useAgendaEvents({
    date: currentDate,
    view,
    enabled: config.enabled,
  });

  const handleEventClick = (event: AgendaEvent) => {
    if (event.pedidoId) {
      navigate(`/admin/pedidos?id=${event.pedidoId}`);
    }
  };

  const handleAddEvent = (eventData: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    type: EventType;
  }) => {
    toast.success(`Evento "${eventData.title}" adicionado!`);
  };

  if (!config.enabled) {
    return null;
  }

  // Gerar dias da semana para o mini-calendário estilo referência
  const getWeekDays = () => {
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek + 1); // Segunda
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        name: dayNames[i],
        num: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
        date: d,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const todayEvents = events.length;

  return (
    <div className={cn(
      "rounded-[24px] flex flex-col min-h-[340px]",
      "hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5",
      className
    )}
      style={{ background: '#e8e9e0' }}
    >
      {/* Title — estilo referência: grande e bold */}
      <div className="p-6 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Agenda
            </h2>
            <p className="text-sm text-gray-600 font-medium mt-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {todayEvents} evento{todayEvents !== 1 ? 's' : ''} • {currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
              </span>
            </p>
          </div>

          {/* Mês dropdown — estilo referência */}
          <div className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold cursor-pointer hover:bg-gray-800 transition-colors">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() +
              currentDate.toLocaleDateString('pt-BR', { month: 'long' }).slice(1)} ▾
          </div>
        </div>
      </div>

      {/* Mini Calendar — dias da semana horizontal, estilo referência */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between gap-2">
          {weekDays.map((day) => (
            <button
              key={day.num}
              onClick={() => setCurrentDate(day.date)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-4 rounded-2xl transition-all duration-200 flex-1",
                day.isToday
                  ? "bg-[#d5e636] shadow-md"
                  : "bg-white/60 hover:bg-white/90"
              )}
            >
              <span className="text-2xl font-bold text-gray-900">{day.num}</span>
              <span className="text-xs font-medium text-gray-600">{day.name}</span>
            </button>
          ))}
        </div>

        {/* Dot indicator — estilo referência */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all",
                i === 5
                  ? "w-2.5 h-2.5 bg-gray-900"
                  : "w-1.5 h-1.5 bg-gray-400/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Time Grid Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarX className="w-10 h-10 text-gray-400/50 mb-2" />
              <p className="text-sm text-gray-500">Erro ao carregar eventos</p>
            </div>
          ) : (
            <div className="px-2">
              <CalendarHeader
                currentDate={currentDate}
                view={view}
                onViewChange={setView}
                onDateChange={setCurrentDate}
                onAddEvent={() => setIsAddDialogOpen(true)}
              />
              <TimeGrid
                currentDate={currentDate}
                view={view}
                events={events}
                startHour={config.startHour}
                endHour={config.endHour}
                slotHeight={config.slotHeight}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 pt-2">
        <Link
          to="/admin/agenda"
          className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
        >
          Ver agenda completa <span className="text-lg">→</span>
        </Link>
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        currentDate={currentDate}
        onAdd={handleAddEvent}
      />
    </div>
  );
}
