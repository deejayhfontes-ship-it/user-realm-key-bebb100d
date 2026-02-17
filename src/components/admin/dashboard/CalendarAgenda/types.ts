import type { AgendaEvent } from "@/hooks/useAgendaEvents";

export type ViewMode = 'day' | 'week';

export interface CalendarAgendaProps {
  className?: string;
}

export interface TimeSlotProps {
  hour: number;
  events: AgendaEvent[];
  slotHeight: number;
  onEventClick: (event: AgendaEvent) => void;
}

export interface EventBlockProps {
  event: AgendaEvent;
  onClick: () => void;
  startHour: number;
  slotHeight: number;
}

export interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onDateChange: (date: Date) => void;
  onAddEvent: () => void;
}
