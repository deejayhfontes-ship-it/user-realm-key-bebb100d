import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_COLORS, EVENT_LABELS, type AgendaEvent } from '@/hooks/useAgendaEvents';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EventBlockProps {
  event: AgendaEvent;
  onClick: () => void;
  startHour: number;
  slotHeight: number;
  style?: React.CSSProperties;
}

export function EventBlock({ event, onClick, startHour, slotHeight, style }: EventBlockProps) {
  const colors = EVENT_COLORS[event.type];
  
  // Calcular posição e altura
  const eventStartHour = event.startTime.getHours() + event.startTime.getMinutes() / 60;
  const eventEndHour = event.endTime.getHours() + event.endTime.getMinutes() / 60;
  const duration = eventEndHour - eventStartHour;
  
  const top = (eventStartHour - startHour) * slotHeight;
  const height = Math.max(duration * slotHeight, 28); // min 28px

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "absolute left-16 right-2 rounded-lg border-l-4 px-3 py-1.5",
              "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
              "text-left overflow-hidden group",
              colors.bg,
              colors.border
            )}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              minHeight: '28px',
              ...style,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium text-sm truncate", colors.text)}>
                  {event.title}
                </p>
                {height > 40 && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                  </p>
                )}
                {height > 60 && event.clientName && (
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                    {event.clientName}
                  </p>
                )}
              </div>
              {event.pedidoId && (
                <ExternalLink className={cn(
                  "w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  colors.text
                )} />
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
            </p>
            {event.description && (
              <p className="text-xs">{event.description}</p>
            )}
            {event.clientName && (
              <p className="text-xs text-muted-foreground">Cliente: {event.clientName}</p>
            )}
            {event.pedidoProtocolo && (
              <p className="text-xs font-mono text-primary">#{event.pedidoProtocolo}</p>
            )}
            <div className="pt-1">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                colors.bg, colors.text
              )}>
                {EVENT_LABELS[event.type]}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
