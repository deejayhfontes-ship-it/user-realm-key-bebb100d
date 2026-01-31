import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CalendarX } from 'lucide-react';
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
      // Navegar para o pedido
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
    // Por enquanto, apenas mostrar toast (implementar save no DB depois)
    toast.success(`Evento "${eventData.title}" adicionado!`);
    // TODO: Implementar salvamento no banco
  };

  // Se agenda desativada, não renderiza
  if (!config.enabled) {
    return null;
  }

  return (
    <div className={cn(
      "bg-card rounded-2xl shadow-sm border border-border",
      "hover:shadow-md transition-all duration-300 hover:-translate-y-0.5",
      "min-h-[400px] flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 pb-0">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onDateChange={setCurrentDate}
          onAddEvent={() => setIsAddDialogOpen(true)}
        />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarX className="w-12 h-12 text-destructive/30 mb-3" />
              <p className="text-sm text-muted-foreground">Erro ao carregar eventos</p>
            </div>
          ) : (
            <TimeGrid
              currentDate={currentDate}
              view={view}
              events={events}
              startHour={config.startHour}
              endHour={config.endHour}
              slotHeight={config.slotHeight}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 pt-2 border-t border-border">
        <Link 
          to="/admin/agenda" 
          className="text-sm text-primary hover:underline"
        >
          Ver agenda completa →
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
