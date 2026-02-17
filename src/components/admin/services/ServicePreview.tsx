import { icons } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, DollarSign } from 'lucide-react';
import type { ServiceFormData } from '@/types/service';

interface ServicePreviewProps {
  service: ServiceFormData;
}

export function ServicePreview({ service }: ServicePreviewProps) {
  // Dynamic icon rendering
  const IconComponent = (icons as Record<string, any>)[service.icon] || icons.Palette;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        Preview: Como o serviço aparecerá na landing page
      </p>
      
      {/* Card Preview */}
      <Card className="overflow-hidden">
        {service.image_url && (
          <div className="h-40 bg-muted">
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{service.title || 'Nome do Serviço'}</h3>
                {service.is_active ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">Ativo</Badge>
                ) : (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {service.short_description || 'Descrição curta do serviço...'}
              </p>
            </div>
          </div>

          {/* Features */}
          {service.features.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">INCLUI:</p>
              <ul className="space-y-1">
                {service.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-3 h-3 text-primary" />
                    {feature}
                  </li>
                ))}
                {service.features.length > 4 && (
                  <li className="text-xs text-muted-foreground">
                    + {service.features.length - 4} mais...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            {service.price_range && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                {service.price_range}
              </div>
            )}
            {service.delivery_time && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {service.delivery_time}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full description preview */}
      {service.full_description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">DESCRIÇÃO COMPLETA:</p>
            <p className="text-sm whitespace-pre-wrap">{service.full_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Deliverables preview */}
      {service.deliverables.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">ENTREGÁVEIS:</p>
            <div className="flex flex-wrap gap-2">
              {service.deliverables.map((d, i) => (
                <Badge key={i} variant="outline">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
