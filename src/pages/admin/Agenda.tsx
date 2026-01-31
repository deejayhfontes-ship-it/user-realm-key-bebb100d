import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, subDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week';

interface Evento {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'entrega' | 'reuniao' | 'tarefa' | 'briefing' | 'pagamento';
  pedido_id?: string;
}

export default function AdminAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Horários do dia (8h às 20h)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Dias da semana atual
  const weekStart = startOfWeek(currentDate, { locale: ptBR, weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock de eventos (depois virá do banco)
  const eventos: Evento[] = [
    {
      id: 1,
      title: 'Entrega - Logotipo Cliente X',
      date: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      type: 'entrega',
      pedido_id: 'PED-2025-00123'
    },
    {
      id: 2,
      title: 'Reunião Briefing - Cliente Y',
      date: addDays(new Date(), 1),
      startTime: '14:00',
      endTime: '15:30',
      type: 'reuniao'
    },
    {
      id: 3,
      title: 'Pagamento Pendente - Cliente Z',
      date: addDays(new Date(), 2),
      startTime: '09:00',
      endTime: '09:30',
      type: 'pagamento'
    }
  ];

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      entrega: 'bg-green-500',
      reuniao: 'bg-blue-500',
      tarefa: 'bg-yellow-500',
      briefing: 'bg-purple-500',
      pagamento: 'bg-red-500'
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
                    isSameDay(e.date, day) && 
                    parseInt(e.startTime.split(':')[0]) === hour
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
                          className={cn(
                            getEventColor(evento.type),
                            "text-white p-2 rounded-lg text-xs mb-1 shadow-sm"
                          )}
                        >
                          <div className="font-semibold truncate">{evento.title}</div>
                          <div className="opacity-90">
                            {evento.startTime} - {evento.endTime}
                          </div>
                          {evento.pedido_id && (
                            <div className="text-[10px] opacity-75 mt-1">
                              {evento.pedido_id}
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
        </div>
      </div>
    </div>
  );
}
