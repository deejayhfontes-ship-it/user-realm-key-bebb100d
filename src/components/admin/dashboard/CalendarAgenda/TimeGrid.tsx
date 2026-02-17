import { format, isSameHour, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EventBlock } from './EventBlock';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';
import type { ViewMode } from './types';

interface TimeGridProps {
  currentDate: Date;
  view: ViewMode;
  events: AgendaEvent[];
  startHour: number;
  endHour: number;
  slotHeight: number;
  onEventClick: (event: AgendaEvent) => void;
}

export function TimeGrid({
  currentDate,
  view,
  events,
  startHour,
  endHour,
  slotHeight,
  onEventClick,
}: TimeGridProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isToday = isSameDay(currentDate, now);

  // Para view de semana, gerar os 7 dias
  const weekDays = view === 'week'
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { locale: ptBR }), i))
    : [currentDate];

  // Filtrar eventos por dia
  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(e.startTime, day));
  };

  // Linha do "agora"
  const nowLineTop = isToday && currentHour >= startHour && currentHour < endHour
    ? ((currentHour - startHour) + currentMinute / 60) * slotHeight
    : null;

  if (view === 'week') {
    return (
      <div className="overflow-x-auto">
        {/* Week Header */}
        <div className="flex border-b border-border">
          <div className="w-16 flex-shrink-0" /> {/* Spacer for time column */}
          {weekDays.map((day, i) => {
            const isCurrentDay = isSameDay(day, now);
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 min-w-[100px] text-center py-2 border-l border-border",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                <p className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className={cn(
                  "text-lg font-semibold",
                  isCurrentDay && "text-primary"
                )}>
                  {format(day, 'd')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Week Grid */}
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-border text-right pr-2 text-xs text-muted-foreground"
                style={{ height: slotHeight }}
              >
                <span className="relative -top-2">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const isDayToday = isSameDay(day, now);
            
            return (
              <div key={dayIndex} className="flex-1 min-w-[100px] relative border-l border-border">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "border-b border-border/50",
                      isDayToday && "bg-primary/5"
                    )}
                    style={{ height: slotHeight }}
                  />
                ))}
                
                {/* Events for this day */}
                {dayEvents.map((event) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                    startHour={startHour}
                    slotHeight={slotHeight}
                    style={{ left: 4, right: 4 }}
                  />
                ))}

                {/* Now line */}
                {isDayToday && nowLineTop !== null && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-destructive z-10"
                    style={{ top: nowLineTop }}
                  >
                    <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Day view
  return (
    <div className="relative">
      {/* Time slots */}
      {hours.map((hour) => {
        const isCurrentHourSlot = isToday && hour === currentHour;
        
        return (
          <div
            key={hour}
            className={cn(
              "flex border-b border-border/50 group",
              isCurrentHourSlot && "bg-primary/5"
            )}
            style={{ height: slotHeight }}
          >
            {/* Time label */}
            <div className="w-16 flex-shrink-0 text-right pr-3 pt-0 text-xs text-muted-foreground relative">
              <span className="absolute -top-2 right-3">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            
            {/* Slot area */}
            <div className="flex-1 relative border-l border-border/30" />
          </div>
        );
      })}

      {/* Events overlay */}
      {events
        .filter(e => isSameDay(e.startTime, currentDate))
        .map((event) => (
          <EventBlock
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
            startHour={startHour}
            slotHeight={slotHeight}
          />
        ))}

      {/* Now indicator line */}
      {nowLineTop !== null && (
        <div
          className="absolute left-14 right-0 border-t-2 border-destructive z-10 pointer-events-none"
          style={{ top: nowLineTop }}
        >
          <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-destructive" />
        </div>
      )}
    </div>
  );
}
