import { useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Layers } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GeneratorFormData } from '@/types/generator';
import { carrosselConfig, slideOptions, layoutStyles } from './config';

/**
 * ═══════════════════════════════════════════════
 * FORMULÁRIO DO GERADOR DE CARROSSEL
 * ═══════════════════════════════════════════════
 * 
 * Campos:
 * ✓ Número de slides
 * ✓ Estilo de layout
 * ✓ Upload de fundo padrão
 * ✓ Configuração por slide (foto + texto)
 * 
 * TODO: Adicionar templates prontos
 * TODO: Adicionar reorganização de slides (drag & drop)
 */

interface CarrosselFormProps {
  formData: GeneratorFormData;
  setFormData: (data: GeneratorFormData) => void;
}

interface SlideData {
  photo: File | null;
  title: string;
  subtitle: string;
}

export function CarrosselForm({ formData, setFormData }: CarrosselFormProps) {
  const numSlides = (formData.numSlides as number) || 3;
  const layoutStyle = (formData.layoutStyle as string) || 'cover';
  const background = formData.background as File | null;
  const slides = (formData.slides as SlideData[]) || 
    Array.from({ length: numSlides }, () => ({ photo: null, title: '', subtitle: '' }));

  // Atualizar número de slides
  const handleNumSlidesChange = useCallback((value: string) => {
    const num = parseInt(value);
    const newSlides = [...slides];
    
    // Adicionar ou remover slides
    while (newSlides.length < num) {
      newSlides.push({ photo: null, title: '', subtitle: '' });
    }
    while (newSlides.length > num) {
      newSlides.pop();
    }
    
    setFormData({ ...formData, numSlides: num, slides: newSlides });
  }, [formData, slides, setFormData]);

  // Atualizar slide específico
  const updateSlide = useCallback((index: number, updates: Partial<SlideData>) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setFormData({ ...formData, slides: newSlides });
  }, [formData, slides, setFormData]);

  // Upload de foto para slide
  const handleSlidePhotoUpload = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateSlide(index, { photo: file });
    }
  }, [updateSlide]);

  // Remover foto do slide
  const handleRemoveSlidePhoto = useCallback((index: number) => {
    updateSlide(index, { photo: null });
  }, [updateSlide]);

  // Upload de fundo padrão
  const handleBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, background: file });
    }
  }, [formData, setFormData]);

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <div className="grid grid-cols-2 gap-4">
        {/* Número de Slides */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Número de Slides</Label>
          <Select value={String(numSlides)} onValueChange={handleNumSlidesChange}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {slideOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estilo de Layout */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Estilo</Label>
          <Select 
            value={layoutStyle} 
            onValueChange={(value) => setFormData({ ...formData, layoutStyle: value })}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layoutStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fundo Padrão (opcional) */}
      {carrosselConfig.features.backgroundUpload && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fundo Padrão (opcional)</Label>
          {background ? (
            <div className="relative h-20 bg-muted rounded-lg overflow-hidden group">
              <img
                src={URL.createObjectURL(background)}
                alt="Fundo"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setFormData({ ...formData, background: null })}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="h-20 bg-muted/50 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
                <span className="text-sm">Adicionar fundo padrão</span>
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

      {/* Configuração por Slide */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Slides ({numSlides})</Label>
        </div>
        
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="w-full flex overflow-x-auto">
            {slides.map((_, index) => (
              <TabsTrigger 
                key={index} 
                value={String(index)}
                className="flex-1 min-w-[60px] text-xs"
              >
                {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {slides.map((slide, index) => (
            <TabsContent key={index} value={String(index)} className="space-y-4 pt-4">
              {/* Upload de Foto do Slide */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Foto do Slide {index + 1}</Label>
                {slide.photo ? (
                  <div className="relative h-28 bg-muted rounded-lg overflow-hidden group">
                    <img
                      src={URL.createObjectURL(slide.photo)}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveSlidePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="h-28 bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Adicionar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlidePhotoUpload(index, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Título do Slide */}
              {carrosselConfig.features.textOverlay && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Título</Label>
                    <Input
                      value={slide.title}
                      onChange={(e) => updateSlide(index, { title: e.target.value })}
                      placeholder="Título do slide..."
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Subtítulo/Texto</Label>
                    <Textarea
                      value={slide.subtitle}
                      onChange={(e) => updateSlide(index, { subtitle: e.target.value })}
                      placeholder="Texto adicional..."
                      className="bg-background/50 min-h-[60px] resize-none"
                    />
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* TODO: Templates de carrossel */}
      {carrosselConfig.features.templates && (
        <Button variant="secondary" className="w-full" disabled>
          📋 Usar Template (em breve)
        </Button>
      )}

      {/* TODO: Variações IA */}
      {carrosselConfig.features.aiVariations && (
        <Button variant="secondary" className="w-full" disabled>
          🎨 Gerar variações com IA (em breve)
        </Button>
      )}
    </div>
  );
}

export default CarrosselForm;
