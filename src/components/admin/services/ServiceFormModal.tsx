import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Service, ServiceFormData } from '@/types/service';
import { ServicePreview } from './ServicePreview';

const availableIcons = [
  'Palette', 'Video', 'Camera', 'Megaphone', 'PenTool', 'Layout', 'Monitor', 
  'Smartphone', 'Globe', 'ShoppingCart', 'Mail', 'FileText', 'Image', 'Film',
  'Music', 'Mic', 'Headphones', 'Tv', 'Play', 'Brush', 'Scissors', 'Layers',
  'Box', 'Package', 'Gift', 'Star', 'Heart', 'Zap', 'Target', 'Award'
];

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSubmit: (data: ServiceFormData) => Promise<boolean | null>;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ServiceFormModal({ open, onOpenChange, service, onSubmit }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    icon: 'Palette',
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    features: [],
    deliverables: [],
    price_range: '',
    delivery_time: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        icon: service.icon || 'Palette',
        title: service.title,
        slug: service.slug,
        short_description: service.short_description,
        full_description: service.full_description || '',
        features: service.features || [],
        deliverables: service.deliverables || [],
        price_range: service.price_range || '',
        delivery_time: service.delivery_time || '',
        image_url: service.image_url || '',
        display_order: service.display_order,
        is_active: service.is_active,
      });
    } else {
      setFormData({
        icon: 'Palette',
        title: '',
        slug: '',
        short_description: '',
        full_description: '',
        features: [],
        deliverables: [],
        price_range: '',
        delivery_time: '',
        image_url: '',
        display_order: 0,
        is_active: true,
      });
    }
    setShowPreview(false);
  }, [service, open]);

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !service ? generateSlug(title) : prev.slug,
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()],
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSubmit(formData);
    setSaving(false);
    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
        </DialogHeader>

        {showPreview ? (
          <div className="space-y-4">
            <ServicePreview service={formData} />
            <Button variant="outline" onClick={() => setShowPreview(false)} className="w-full">
              Voltar ao formulário
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ícone e Título */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = (LucideIcons as any)[formData.icon];
                          return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
                        })()}
                        <span>{formData.icon}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableIcons.map(icon => {
                      const IconComponent = (LucideIcons as any)[icon];
                      return (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <span>{icon}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 space-y-2">
                <Label>Nome do Serviço *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Produção de Vídeos"
                  required
                />
              </div>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="producao-de-videos"
              />
            </div>

            {/* Descrições */}
            <div className="space-y-2">
              <Label>Descrição Curta *</Label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                placeholder="Uma linha para exibir no card"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição Completa</Label>
              <Textarea
                value={formData.full_description}
                onChange={(e) => setFormData(prev => ({ ...prev, full_description: e.target.value }))}
                placeholder="Detalhamento completo do serviço..."
                rows={4}
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>O que está incluso</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ex: 20 posts por mês"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <Label>Entregáveis</Label>
              <div className="flex gap-2">
                <Input
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  placeholder="Ex: Arquivos PSD editáveis"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addDeliverable}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.deliverables.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      <span>{deliverable}</span>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preço e Prazo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Faixa de Preço</Label>
                <Input
                  value={formData.price_range}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                  placeholder="A partir de R$ 1.500"
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo de Entrega</Label>
                <Input
                  value={formData.delivery_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_time: e.target.value }))}
                  placeholder="7 dias úteis"
                />
              </div>
            </div>

            {/* Imagem e Ordem */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Serviço Ativo</Label>
                <p className="text-sm text-muted-foreground">Visível na landing page</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Salvando...' : service ? 'Salvar Alterações' : 'Criar Serviço'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
