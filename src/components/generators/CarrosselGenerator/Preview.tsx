import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeneratorFormData } from '@/types/generator';
import { carrosselConfig } from './config';

/**
 * ═══════════════════════════════════════════════
 * PREVIEW DO GERADOR DE CARROSSEL
 * ═══════════════════════════════════════════════
 * 
 * Renderiza preview em tempo real do carrossel.
 * Permite navegar entre slides usando setas.
 * 
 * Layouts disponíveis:
 * - cover: Foto ocupa todo o espaço
 * - centered: Foto com margem
 * - text-bottom: Área de texto na parte inferior
 * 
 * TODO: Adicionar animação de transição entre slides
 * TODO: Adicionar indicadores de slide (dots)
 */

interface CarrosselPreviewProps {
  formData: GeneratorFormData;
}

interface SlideData {
  photo: File | null;
  title: string;
  subtitle: string;
}

export function CarrosselPreview({ formData }: CarrosselPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = (formData.slides as SlideData[]) || [];
  const background = formData.background as File | null;
  const layoutStyle = (formData.layoutStyle as string) || 'cover';
  const numSlides = slides.length;

  // URL do fundo
  const backgroundUrl = useMemo(() => {
    return background ? URL.createObjectURL(background) : null;
  }, [background]);

  // Navegação
  const goToPrev = () => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : numSlides - 1));
  const goToNext = () => setCurrentSlide((prev) => (prev < numSlides - 1 ? prev + 1 : 0));

  // Slide atual
  const slide = slides[currentSlide];
  const slidePhotoUrl = slide?.photo ? URL.createObjectURL(slide.photo) : null;

  // Verificar se está vazio
  const isEmpty = slides.every((s) => !s.photo && !s.title);

  if (isEmpty) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">Adicione fotos aos slides</p>
        <p className="text-xs opacity-70 mt-1">
          {carrosselConfig.dimensions.width}x{carrosselConfig.dimensions.height}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg">
      {/* Fundo */}
      {backgroundUrl && !slidePhotoUrl ? (
        <img
          src={backgroundUrl}
          alt="Fundo"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : slidePhotoUrl && layoutStyle === 'cover' ? (
        <img
          src={slidePhotoUrl}
          alt={`Slide ${currentSlide + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
      )}

      {/* Layout: Centered */}
      {layoutStyle === 'centered' && slidePhotoUrl && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-4/5 h-4/5 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={slidePhotoUrl}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Layout: Text Bottom */}
      {layoutStyle === 'text-bottom' && (
        <>
          {slidePhotoUrl && (
            <div className="absolute inset-x-0 top-0 h-2/3">
              <img
                src={slidePhotoUrl}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-background/95 flex flex-col justify-center px-6">
            {slide?.title && (
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                {slide.title}
              </h3>
            )}
            {slide?.subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {slide.subtitle}
              </p>
            )}
          </div>
        </>
      )}

      {/* Overlay de texto (para cover e centered) */}
      {layoutStyle !== 'text-bottom' && (slide?.title || slide?.subtitle) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {slide?.title && (
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{slide.title}</h3>
            )}
            {slide?.subtitle && (
              <p className="text-sm opacity-80 line-clamp-3">{slide.subtitle}</p>
            )}
          </div>
        </>
      )}

      {/* Navegação */}
      {numSlides > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/30 hover:bg-background/50 text-foreground h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/30 hover:bg-background/50 text-foreground h-8 w-8"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Indicadores */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-primary'
                    : 'bg-foreground/30 hover:bg-foreground/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Badge do slide atual */}
      <div className="absolute top-3 right-3 px-2 py-1 bg-background/50 rounded-full text-xs font-medium">
        {currentSlide + 1} / {numSlides}
      </div>
    </div>
  );
}

export default CarrosselPreview;
