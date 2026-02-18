import { Eye, Pencil, Power, PowerOff, Wand2, LayoutGrid, Layers, Bell, Sparkles, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Generator } from '@/hooks/useGenerators';

interface GeneratorCardProps {
  generator: Generator;
  onView: (generator: Generator) => void;
  onEdit: (generator: Generator) => void;
  onToggleStatus: (generator: Generator) => void;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  stories: { label: 'Stories', icon: LayoutGrid, className: 'bg-primary text-primary-foreground' },
  derivacoes: { label: 'Derivações IA', icon: Sparkles, className: 'bg-accent text-accent-foreground' },
  carrossel: { label: 'Carrossel', icon: Layers, className: 'bg-secondary text-secondary-foreground' },
  avisos: { label: 'Avisos', icon: Bell, className: 'bg-muted text-muted-foreground' },
  outro: { label: 'Outro', icon: Wand2, className: 'bg-muted text-muted-foreground' }
};

const statusConfig: Record<string, { label: string; className: string }> = {
  ready: { label: 'Pronto', className: 'bg-primary/15 text-primary' },
  development: { label: 'Desenvolvimento', className: 'bg-warning/15 text-warning' },
  disabled: { label: 'Desabilitado', className: 'bg-muted text-muted-foreground' }
};

export function GeneratorCard({ generator, onView, onEdit, onToggleStatus }: GeneratorCardProps) {
  const type = typeConfig[generator.type] || typeConfig.outro;
  const status = statusConfig[generator.status || 'development'];
  const TypeIcon = type.icon;
  const isDisabled = generator.status === 'disabled';

  return (
    <div className={cn(
      "soft-card p-6 transition-all hover:scale-[1.02] duration-300 group",
      isDisabled && "opacity-60"
    )}>
      {/* Header with icon and badges */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center",
          type.className
        )}>
          <TypeIcon className="w-7 h-7" />
        </div>
        <div className="flex gap-2">
          <Badge className={cn("rounded-full px-3 py-1 text-xs font-medium border-0", status.className)}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-6">
        <h3 className="font-semibold text-lg text-foreground">{generator.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {generator.description || 'Sem descrição'}
        </p>
        <Badge className={cn("rounded-full px-3 py-1 text-xs font-medium border-0", type.className)}>
          {type.label}
        </Badge>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {/* Botão principal - Usar Gerador */}
        <Link to={`/admin/gerador/${generator.slug}`} className="block">
          <Button
            className="w-full rounded-full h-10 bg-primary text-primary-foreground hover:brightness-105 shadow-sm shadow-primary/20 gap-2"
            disabled={isDisabled}
          >
            <Play className="w-4 h-4" />
            Usar Gerador
          </Button>
        </Link>

        {/* Ações secundárias */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-full h-9 hover:bg-muted"
            onClick={() => onView(generator)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-full h-9 hover:bg-muted"
            onClick={() => onEdit(generator)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full",
              isDisabled ? "hover:bg-primary/10 hover:text-primary" : "hover:bg-destructive/10 hover:text-destructive"
            )}
            onClick={() => onToggleStatus(generator)}
            title={isDisabled ? 'Ativar' : 'Desativar'}
          >
            {isDisabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
