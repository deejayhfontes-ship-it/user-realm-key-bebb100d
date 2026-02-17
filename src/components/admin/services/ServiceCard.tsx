import { icons, MoreVertical, Pencil, Copy, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Service } from '@/types/service';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDuplicate: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function ServiceCard({ service, onEdit, onDuplicate, onDelete, onToggleActive }: ServiceCardProps) {
  const IconComponent = (icons as Record<string, any>)[service.icon || 'Palette'] || icons.Palette;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div className="opacity-0 group-hover:opacity-50 cursor-grab pt-1">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{service.title}</h3>
              <Badge variant="outline" className="text-xs shrink-0">
                #{service.display_order}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.short_description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-2">
              {service.price_range && (
                <Badge variant="secondary" className="text-xs">
                  {service.price_range}
                </Badge>
              )}
              {service.features.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {service.features.length} itens inclusos
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={service.is_active}
              onCheckedChange={(checked) => onToggleActive(service.id, checked)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(service)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(service)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
