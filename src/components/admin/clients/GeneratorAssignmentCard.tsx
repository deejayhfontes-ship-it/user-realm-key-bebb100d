import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GeneratorAssignment } from './ManageGeneratorsModal';

interface GeneratorAssignmentCardProps {
  generator: GeneratorAssignment;
  onToggle: (assigned: boolean) => void;
  onUpdateConfig: (updates: Partial<GeneratorAssignment>) => void;
}

const WEEKDAYS = [
  { value: 0, label: 'Dom', shortLabel: 'D' },
  { value: 1, label: 'Seg', shortLabel: 'S' },
  { value: 2, label: 'Ter', shortLabel: 'T' },
  { value: 3, label: 'Qua', shortLabel: 'Q' },
  { value: 4, label: 'Qui', shortLabel: 'Q' },
  { value: 5, label: 'Sex', shortLabel: 'S' },
  { value: 6, label: 'Sáb', shortLabel: 'S' }
];

const typeIcons: Record<string, string> = {
  stories: '📱',
  carrossel: '🎠',
  post: '🖼️',
  custom: '⚙️'
};

export function GeneratorAssignmentCard({ 
  generator, 
  onToggle, 
  onUpdateConfig 
}: GeneratorAssignmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasTimeRestrictions = generator.time_limit_start && generator.time_limit_end;
  const hasWeekdayRestrictions = generator.allowed_weekdays.length < 7;
  const hasAnyRestriction = hasTimeRestrictions || hasWeekdayRestrictions || generator.credits_limit;

  const handleWeekdayToggle = (day: number, checked: boolean) => {
    const newDays = checked
      ? [...generator.allowed_weekdays, day].sort((a, b) => a - b)
      : generator.allowed_weekdays.filter(d => d !== day);
    onUpdateConfig({ allowed_weekdays: newDays });
  };

  const clearRestrictions = () => {
    onUpdateConfig({
      time_limit_start: null,
      time_limit_end: null,
      allowed_weekdays: [0, 1, 2, 3, 4, 5, 6]
    });
  };

  return (
    <Card className={`transition-all duration-200 ${
      generator.assigned 
        ? 'border-primary/50 bg-primary/5' 
        : 'border-border/50 opacity-75'
    }`}>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={generator.assigned}
              onCheckedChange={(checked) => onToggle(checked as boolean)}
              className="h-5 w-5"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl">{typeIcons[generator.type] || '📄'}</span>
              <div>
                <h4 className="font-semibold text-foreground">{generator.name}</h4>
                {generator.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {generator.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAnyRestriction && generator.assigned && (
              <Badge variant="outline" className="text-xs">
                Restrições
              </Badge>
            )}
            <Badge variant={generator.assigned ? 'default' : 'secondary'} className="rounded-full">
              {generator.assigned ? 'Atribuído' : 'Não atribuído'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {generator.assigned && (
        <CardContent className="pt-0 pb-4 space-y-4">
          {/* Credit Limit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Limite de créditos por geração:</Label>
            <RadioGroup
              value={generator.credits_limit ? 'custom' : 'unlimited'}
              onValueChange={(v) => {
                if (v === 'unlimited') {
                  onUpdateConfig({ credits_limit: null });
                } else {
                  onUpdateConfig({ credits_limit: 10 });
                }
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unlimited" id={`unlimited-${generator.id}`} />
                <Label htmlFor={`unlimited-${generator.id}`} className="text-sm font-normal cursor-pointer">
                  Sem limite (usa do plano)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="custom" id={`custom-${generator.id}`} />
                <Label htmlFor={`custom-${generator.id}`} className="text-sm font-normal cursor-pointer">
                  Limite específico:
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={generator.credits_limit || ''}
                  onChange={(e) => onUpdateConfig({ 
                    credits_limit: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-20 h-8"
                  placeholder="10"
                  disabled={!generator.credits_limit}
                />
                <span className="text-sm text-muted-foreground">créditos</span>
              </div>
            </RadioGroup>
          </div>

          {/* Time Restrictions Toggle */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{expanded ? 'Ocultar' : 'Configurar'} Restrições de Horário</span>
              </div>
              <div className="flex items-center gap-2">
                {hasAnyRestriction && !expanded && (
                  <Badge variant="secondary" className="text-xs">
                    Configurado
                  </Badge>
                )}
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </Button>

            {expanded && (
              <div className="mt-3 space-y-4 p-4 border border-border/50 rounded-lg bg-muted/30">
                {/* Time Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Horário permitido:</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Das:</Label>
                      <Input
                        type="time"
                        value={generator.time_limit_start || ''}
                        onChange={(e) => onUpdateConfig({ time_limit_start: e.target.value || null })}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Até:</Label>
                      <Input
                        type="time"
                        value={generator.time_limit_end || ''}
                        onChange={(e) => onUpdateConfig({ time_limit_end: e.target.value || null })}
                        className="h-9"
                      />
                    </div>
                  </div>
                  {!generator.time_limit_start && !generator.time_limit_end && (
                    <p className="text-xs text-muted-foreground">Deixe vazio para permitir a qualquer hora</p>
                  )}
                </div>

                {/* Weekdays */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dias da semana permitidos:</Label>
                  <div className="flex gap-1 flex-wrap">
                    {WEEKDAYS.map((day) => {
                      const isChecked = generator.allowed_weekdays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleWeekdayToggle(day.value, !isChecked)}
                          className={`
                            w-10 h-10 rounded-lg text-sm font-medium transition-all
                            ${isChecked 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }
                          `}
                          title={day.label}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Button */}
                {hasAnyRestriction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRestrictions}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar restrições de horário
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
