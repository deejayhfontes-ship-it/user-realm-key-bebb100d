import { useCallback, useEffect, useState } from 'react';
import { GeneratorBase } from '@/components/generators/GeneratorBase';
import { StoriesForm } from './Form';
import { StoriesPreview } from './Preview';
import { storiesConfig } from './config';
import { loadImage, canvasToBlob, drawWrappedText, createTextOverlay } from '@/lib/canvas/plugins';
import { supabase } from '@/integrations/supabase/client';
import type { GeneratorFormData, GeneratorConfig } from '@/types/generator';

/**
 * ═══════════════════════════════════════════════
 * STORIES GENERATOR
 * ═══════════════════════════════════════════════
 * 
 * Gerador de stories para Instagram (1080x1920).
 * Usa o GeneratorBase com formulário e preview customizados.
 * 
 * Fluxo de geração:
 * 1. Cria canvas com dimensões corretas
 * 2. Desenha fundo (imagem ou cor sólida)
 * 3. Desenha fotos no layout escolhido
 * 4. Aplica overlay de gradiente
 * 5. Desenha textos (secretaria, descrição, data)
 * 6. Exporta como PNG
 * 
 * TODO: Adicionar filtros antes do export
 * TODO: Adicionar variações com IA
 */

export function StoriesGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(storiesConfig);

  // Buscar ID do gerador no banco
  useEffect(() => {
    async function fetchGeneratorId() {
      const { data } = await supabase
        .from('generators')
        .select('id')
        .eq('slug', 'stories')
        .single();

      if (data?.id) {
        setConfig((prev) => ({ ...prev, id: data.id }));
      }
    }
    fetchGeneratorId();
  }, []);

  // Função de geração principal
  const handleGenerate = useCallback(async (formData: GeneratorFormData): Promise<Blob> => {
    const { width, height } = config.dimensions;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const photos = (formData.photos as File[]) || [];
    const background = formData.background as File | null;
    const secretaria = (formData.secretaria as string) || '';
    const descricao = (formData.descricao as string) || '';
    const data = (formData.data as string) || '';
    const photoQuantity = (formData.photoQuantity as number) || 1;

    // 1. Desenhar fundo
    if (background) {
      const bgImg = await loadImage(background);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      // Gradiente padrão
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Desenhar fotos
    const padding = 40;
    const photoAreaTop = 120;
    const photoAreaHeight = height * 0.55;
    const cornerRadius = 24;

    // Helper para desenhar imagem com bordas arredondadas
    const drawRoundedImage = async (
      file: File,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      const img = await loadImage(file);
      
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, cornerRadius);
      ctx.clip();
      
      // Calcular cover
      const imgRatio = img.width / img.height;
      const boxRatio = w / h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      
      if (imgRatio > boxRatio) {
        sw = img.height * boxRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / boxRatio;
        sy = (img.height - sh) / 2;
      }
      
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      ctx.restore();
      
      // Sombra
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, cornerRadius);
      ctx.stroke();
      ctx.restore();
    };

    // Layout baseado na quantidade
    if (photoQuantity === 1 && photos[0]) {
      const photoWidth = width - padding * 2;
      const photoHeight = photoAreaHeight;
      await drawRoundedImage(photos[0], padding, photoAreaTop, photoWidth, photoHeight);
    } else if (photoQuantity === 2) {
      const photoWidth = width - padding * 2;
      const photoHeight = (photoAreaHeight - padding) / 2;
      
      if (photos[0]) {
        await drawRoundedImage(photos[0], padding, photoAreaTop, photoWidth, photoHeight);
      }
      if (photos[1]) {
        await drawRoundedImage(photos[1], padding, photoAreaTop + photoHeight + padding, photoWidth, photoHeight);
      }
    } else if (photoQuantity === 3) {
      const halfWidth = (width - padding * 3) / 2;
      const topHeight = (photoAreaHeight - padding) * 0.6;
      const bottomHeight = (photoAreaHeight - padding) * 0.4;
      
      if (photos[0]) {
        await drawRoundedImage(photos[0], padding, photoAreaTop, halfWidth, topHeight);
      }
      if (photos[1]) {
        await drawRoundedImage(photos[1], padding * 2 + halfWidth, photoAreaTop, halfWidth, topHeight);
      }
      if (photos[2]) {
        await drawRoundedImage(photos[2], padding, photoAreaTop + topHeight + padding, width - padding * 2, bottomHeight);
      }
    }

    // 3. Overlay de gradiente para texto
    const overlay = createTextOverlay(ctx, width, height, 'bottom');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // 4. Desenhar textos
    const textPadding = 60;
    let textY = height - 200;

    // Secretaria
    if (secretaria) {
      ctx.font = '600 28px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.letterSpacing = '2px';
      ctx.fillText(secretaria.toUpperCase(), textPadding, textY);
      textY += 50;
    }

    // Descrição
    if (descricao) {
      ctx.font = '700 48px system-ui, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      drawWrappedText(ctx, descricao, textPadding, textY, width - textPadding * 2, 56);
      textY += Math.ceil(descricao.length / 30) * 56 + 30;
    }

    // Data
    if (data) {
      const dateObj = new Date(data + 'T00:00:00');
      const formattedDate = dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      ctx.font = '400 32px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(formattedDate, textPadding, height - 80);
    }

    // TODO: Aplicar filtros aqui quando implementar
    // if (formData.filter && config.features.filters) {
    //   applyFilter({ canvas, ctx, dimensions: config.dimensions }, formData.filter);
    // }

    // 5. Exportar como PNG
    return canvasToBlob(canvas, 'png');
  }, [config]);

  // Validar formulário
  const validateForm = useCallback((formData: GeneratorFormData): boolean => {
    const photos = (formData.photos as File[]) || [];
    return photos.length > 0;
  }, []);

  // Render do formulário
  const renderForm = useCallback(
    (formData: GeneratorFormData, setFormData: (data: GeneratorFormData) => void) => (
      <StoriesForm formData={formData} setFormData={setFormData} />
    ),
    []
  );

  // Render do preview
  const renderPreview = useCallback(
    (formData: GeneratorFormData) => <StoriesPreview formData={formData} />,
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

export default StoriesGenerator;
