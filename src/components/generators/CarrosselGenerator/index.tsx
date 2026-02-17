import { useCallback, useEffect, useState } from 'react';
import { GeneratorBase } from '@/components/generators/GeneratorBase';
import { CarrosselForm } from './Form';
import { CarrosselPreview } from './Preview';
import { carrosselConfig } from './config';
import { loadImage, canvasToBlob, drawWrappedText, createTextOverlay } from '@/lib/canvas/plugins';
import { supabase } from '@/integrations/supabase/client';
import type { GeneratorFormData, GeneratorConfig } from '@/types/generator';

/**
 * ═══════════════════════════════════════════════
 * CARROSSEL GENERATOR
 * ═══════════════════════════════════════════════
 * 
 * Gerador de carrossel para Instagram (1080x1080).
 * Gera múltiplas imagens (uma por slide).
 * 
 * Fluxo de geração:
 * 1. Para cada slide:
 *    a. Cria canvas com dimensões corretas
 *    b. Desenha fundo (imagem ou padrão)
 *    c. Desenha foto do slide no layout escolhido
 *    d. Aplica overlay se tiver texto
 *    e. Desenha textos (título, subtítulo)
 *    f. Exporta como PNG
 * 2. Retorna array de Blobs
 * 
 * TODO: Adicionar opção de download como ZIP
 * TODO: Adicionar templates de carrossel
 */

interface SlideData {
  photo: File | null;
  title: string;
  subtitle: string;
}

export function CarrosselGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>({
    ...carrosselConfig,
    creditsPerGeneration: 3, // Atualizado baseado no número de slides
  });

  // Buscar ID do gerador no banco
  useEffect(() => {
    async function fetchGeneratorId() {
      const { data } = await supabase
        .from('generators')
        .select('id')
        .eq('slug', 'carrossel')
        .single();

      if (data?.id) {
        setConfig((prev) => ({ ...prev, id: data.id }));
      }
    }
    fetchGeneratorId();
  }, []);

  // Função de geração principal (retorna múltiplos Blobs)
  const handleGenerate = useCallback(async (formData: GeneratorFormData): Promise<Blob[]> => {
    const { width, height } = config.dimensions;
    const slides = (formData.slides as SlideData[]) || [];
    const background = formData.background as File | null;
    const layoutStyle = (formData.layoutStyle as string) || 'cover';

    const blobs: Blob[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.photo && !slide.title) continue; // Pular slides vazios

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // 1. Desenhar fundo
      if (background && !slide.photo) {
        const bgImg = await loadImage(background);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } else if (slide.photo && layoutStyle === 'cover') {
        const img = await loadImage(slide.photo);
        // Cover: preencher todo o canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        
        if (imgRatio > canvasRatio) {
          sw = img.height * canvasRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / canvasRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      } else {
        // Gradiente padrão
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Layout Centered
      if (slide.photo && layoutStyle === 'centered') {
        const img = await loadImage(slide.photo);
        const padding = 80;
        const photoSize = width - padding * 2;
        const photoY = (height - photoSize) / 2;
        
        // Bordas arredondadas
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(padding, photoY, photoSize, photoSize, 24);
        ctx.clip();
        
        // Cover na área da foto
        const imgRatio = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (imgRatio > 1) {
          sw = img.height;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, padding, photoY, photoSize, photoSize);
        ctx.restore();
      }

      // 3. Layout Text Bottom
      if (layoutStyle === 'text-bottom') {
        const photoHeight = height * 0.65;
        const textAreaHeight = height - photoHeight;

        if (slide.photo) {
          const img = await loadImage(slide.photo);
          const imgRatio = img.width / img.height;
          const boxRatio = width / photoHeight;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          
          if (imgRatio > boxRatio) {
            sw = img.height * boxRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / boxRatio;
            sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, photoHeight);
        }

        // Área de texto
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, photoHeight, width, textAreaHeight);

        // Textos
        const textPadding = 60;
        let textY = photoHeight + 80;

        if (slide.title) {
          ctx.font = 'bold 48px system-ui, sans-serif';
          ctx.fillStyle = '#1a1a2e';
          drawWrappedText(ctx, slide.title, textPadding, textY, width - textPadding * 2, 56);
          textY += Math.ceil(slide.title.length / 25) * 56 + 20;
        }

        if (slide.subtitle) {
          ctx.font = '400 32px system-ui, sans-serif';
          ctx.fillStyle = '#666666';
          drawWrappedText(ctx, slide.subtitle, textPadding, textY, width - textPadding * 2, 40);
        }
      }

      // 4. Overlay e texto para cover/centered
      if (layoutStyle !== 'text-bottom' && (slide.title || slide.subtitle)) {
        const overlay = createTextOverlay(ctx, width, height, 'bottom');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, height * 0.5, width, height * 0.5);

        const textPadding = 60;
        let textY = height - 150;

        if (slide.title) {
          ctx.font = 'bold 56px system-ui, sans-serif';
          ctx.fillStyle = '#FFFFFF';
          drawWrappedText(ctx, slide.title, textPadding, textY, width - textPadding * 2, 64);
          textY += Math.ceil(slide.title.length / 20) * 64 + 20;
        }

        if (slide.subtitle) {
          ctx.font = '400 36px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          drawWrappedText(ctx, slide.subtitle, textPadding, textY, width - textPadding * 2, 44);
        }
      }

      // 5. Indicador de slide
      ctx.font = '600 24px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`${i + 1}/${slides.length}`, width - 80, 50);

      // 6. Exportar
      const blob = await canvasToBlob(canvas, 'png');
      blobs.push(blob);
    }

    return blobs;
  }, [config]);

  // Validar formulário
  const validateForm = useCallback((formData: GeneratorFormData): boolean => {
    const slides = (formData.slides as SlideData[]) || [];
    return slides.some((s) => s.photo || s.title);
  }, []);

  // Render do formulário
  const renderForm = useCallback(
    (formData: GeneratorFormData, setFormData: (data: GeneratorFormData) => void) => (
      <CarrosselForm formData={formData} setFormData={setFormData} />
    ),
    []
  );

  // Render do preview
  const renderPreview = useCallback(
    (formData: GeneratorFormData) => <CarrosselPreview formData={formData} />,
    []
  );

  return (
    <GeneratorBase
      name={config.name}
      config={config}
      onGenerate={handleGenerate}
      renderForm={renderForm}
      renderPreview={renderPreview}
      validateForm={validateForm}
    />
  );
}

export default CarrosselGenerator;
