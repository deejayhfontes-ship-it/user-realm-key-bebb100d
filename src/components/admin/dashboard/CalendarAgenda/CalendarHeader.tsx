import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CalendarHeaderProps, ViewMode } from './types';
import { cn } from '@/lib/utils';

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onDateChange,
  onAddEvent,
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (view === 'day') {
      onDateChange(subDays(currentDate, 1));
    } else {
      onDateChange(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      onDateChange(addDays(currentDate, 1));
    } else {
      onDateChange(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formatDateDisplay = () => {
    if (view === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    }
    // Semana
    const startOfWeekDate = addDays(currentDate, -currentDate.getDay());
    const endOfWeekDate = addDays(startOfWeekDate, 6);
    return `${format(startOfWeekDate, "d 'de' MMM", { locale: ptBR })} - ${format(endOfWeekDate, "d 'de' MMM", { locale: ptBR })}`;
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Icon + Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Agenda</h3>
          <p className="text-sm text-muted-foreground capitalize">{formatDateDisplay()}</p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-md transition-all",
              view === 'day' && "bg-background shadow-sm"
            )}
            onClick={() => onViewChange('day')}
          >
            Dia
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-md transition-all",
              view === 'week' && "bg-background shadow-sm"
            )}
            onClick={() => onViewChange('week')}
          >
            Semana
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Event */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddEvent}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
