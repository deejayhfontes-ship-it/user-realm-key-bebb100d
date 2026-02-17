import { useCallback } from 'react';
import { Upload, Calendar, X, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GeneratorFormData } from '@/types/generator';
import { storiesConfig, photoQuantityOptions } from './config';

/**
 * ═══════════════════════════════════════════════
 * FORMULÁRIO DO GERADOR DE STORIES
 * ═══════════════════════════════════════════════
 * 
 * Campos atuais:
 * ✓ Quantidade de fotos (1, 2 ou 3)
 * ✓ Upload de fotos
 * ✓ Upload de imagem de fundo
 * ✓ Secretaria (opcional)
 * ✓ Descrição/texto principal
 * ✓ Data
 * 
 * TODO: Adicionar seletor de filtros quando ativar
 * TODO: Adicionar botão de IA quando ativar
 * TODO: Adicionar seletor de templates quando ativar
 */

interface StoriesFormProps {
  formData: GeneratorFormData;
  setFormData: (data: GeneratorFormData) => void;
}

export function StoriesForm({ formData, setFormData }: StoriesFormProps) {
  const photos = (formData.photos as File[]) || [];
  const background = formData.background as File | null;
  const photoQuantity = (formData.photoQuantity as number) || 1;

  // Handler para upload de fotos
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxPhotos = photoQuantity;
    const newPhotos = [...photos, ...files].slice(0, maxPhotos);
    setFormData({ ...formData, photos: newPhotos });
  }, [formData, photos, photoQuantity, setFormData]);

  // Handler para remover foto
  const handleRemovePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  }, [formData, photos, setFormData]);

  // Handler para upload de fundo
  const handleBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, background: file });
    }
  }, [formData, setFormData]);

  // Handler para remover fundo
  const handleRemoveBackground = useCallback(() => {
    setFormData({ ...formData, background: null });
  }, [formData, setFormData]);

  return (
    <div className="space-y-6">
      {/* Quantidade de Fotos */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quantidade de Fotos</Label>
        <RadioGroup
          value={String(photoQuantity)}
          onValueChange={(value) => {
            const qty = parseInt(value);
            const limitedPhotos = photos.slice(0, qty);
            setFormData({ ...formData, photoQuantity: qty, photos: limitedPhotos });
          }}
          className="flex gap-3"
        >
          {photoQuantityOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={String(option.value)} id={`qty-${option.value}`} />
              <Label htmlFor={`qty-${option.value}`} className="cursor-pointer text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Upload de Fotos */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Fotos ({photos.length}/{photoQuantity})
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
            >
              <img
                src={URL.createObjectURL(photo)}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < photoQuantity && (
            <label className="aspect-square bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                multiple
              />
            </label>
          )}
        </div>
      </div>

      {/* Upload de Fundo */}
      {storiesConfig.features.backgroundUpload && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Imagem de Fundo (opcional)</Label>
          {background ? (
            <div className="relative h-24 bg-muted rounded-lg overflow-hidden group">
              <img
                src={URL.createObjectURL(background)}
                alt="Fundo"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveBackground}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="h-24 bg-muted/50 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm">Clique para adicionar fundo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Secretaria */}
      <div className="space-y-2">
        <Label htmlFor="secretaria" className="text-sm font-medium">
          Secretaria (opcional)
        </Label>
        <Input
          id="secretaria"
          value={(formData.secretaria as string) || ''}
          onChange={(e) => setFormData({ ...formData, secretaria: e.target.value })}
          placeholder="Ex: Secretaria de Cultura"
          className="bg-background/50"
        />
      </div>

      {/* Descrição */}
      {storiesConfig.features.textOverlay && (
        <div className="space-y-2">
          <Label htmlFor="descricao" className="text-sm font-medium">
            Descrição / Texto Principal
          </Label>
          <Textarea
            id="descricao"
            value={(formData.descricao as string) || ''}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Digite o texto que aparecerá no story..."
            className="bg-background/50 min-h-[80px] resize-none"
          />
        </div>
      )}

      {/* Data */}
      {storiesConfig.features.dateField && (
        <div className="space-y-2">
          <Label htmlFor="data" className="text-sm font-medium">
            Data
          </Label>
          <div className="relative">
            <Input
              id="data"
              type="date"
              value={(formData.data as string) || ''}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="bg-background/50"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          PLACEHOLDER: Funcionalidades futuras
          ═══════════════════════════════════════════ */}
      
      {/* TODO: Seletor de filtros */}
      {storiesConfig.features.filters && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filtro</Label>
          {/* <FilterSelector 
            value={formData.filter} 
            onChange={(filter) => setFormData({ ...formData, filter })} 
          /> */}
          <p className="text-xs text-muted-foreground">Filtros em breve...</p>
        </div>
      )}

      {/* TODO: Botão de IA */}
      {storiesConfig.features.aiEnhancement && (
        <Button variant="secondary" className="w-full" disabled>
          ✨ Melhorar com IA (em breve)
        </Button>
      )}

      {/* TODO: Botão de variações IA */}
      {storiesConfig.features.aiVariations && (
        <Button variant="secondary" className="w-full" disabled>
          🎨 Gerar 50 variações com IA (em breve)
        </Button>
      )}
    </div>
  );
}

export default StoriesForm;
