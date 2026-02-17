import { useMemo } from 'react';
import { ImageIcon } from 'lucide-react';
import type { GeneratorFormData } from '@/types/generator';
import { storiesConfig } from './config';

/**
 * ═══════════════════════════════════════════════
 * PREVIEW DO GERADOR DE STORIES
 * ═══════════════════════════════════════════════
 * 
 * Renderiza preview em tempo real do story sendo criado.
 * Usa as mesmas proporções do output final (1080x1920).
 * 
 * Layout baseado na quantidade de fotos:
 * - 1 foto: Foto centralizada
 * - 2 fotos: Dividido horizontal
 * - 3 fotos: Grid 2+1
 * 
 * TODO: Adicionar preview de filtros
 * TODO: Adicionar animações de preview
 */

interface StoriesPreviewProps {
  formData: GeneratorFormData;
}

export function StoriesPreview({ formData }: StoriesPreviewProps) {
  const photos = (formData.photos as File[]) || [];
  const background = formData.background as File | null;
  const photoQuantity = (formData.photoQuantity as number) || 1;
  const secretaria = (formData.secretaria as string) || '';
  const descricao = (formData.descricao as string) || '';
  const data = (formData.data as string) || '';

  // Gerar URLs das imagens
  const photoUrls = useMemo(() => {
    return photos.map((photo) => URL.createObjectURL(photo));
  }, [photos]);

  const backgroundUrl = useMemo(() => {
    return background ? URL.createObjectURL(background) : null;
  }, [background]);

  // Formatar data para exibição
  const formattedDate = useMemo(() => {
    if (!data) return '';
    const dateObj = new Date(data + 'T00:00:00');
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [data]);

  // Verificar se está vazio
  const isEmpty = photos.length === 0 && !background && !secretaria && !descricao;

  if (isEmpty) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">Adicione fotos para ver o preview</p>
        <p className="text-xs opacity-70 mt-1">
          {storiesConfig.dimensions.width}x{storiesConfig.dimensions.height}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg">
      {/* Fundo */}
      {backgroundUrl ? (
        <img
          src={backgroundUrl}
          alt="Fundo"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
      )}

      {/* Overlay escuro para texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Grid de fotos */}
      <div className="absolute inset-0 p-4">
        {photoQuantity === 1 && photoUrls[0] && (
          <div className="w-full h-3/5 mt-8 rounded-xl overflow-hidden shadow-2xl">
            <img
              src={photoUrls[0]}
              alt="Foto principal"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {photoQuantity === 2 && (
          <div className="flex flex-col gap-3 h-3/5 mt-8">
            {photoUrls.slice(0, 2).map((url, i) => (
              <div key={i} className="flex-1 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {photoUrls.length < 2 && (
              <div className="flex-1 rounded-xl bg-muted/30 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}

        {photoQuantity === 3 && (
          <div className="h-3/5 mt-8 flex flex-col gap-3">
            <div className="flex gap-3 flex-1">
              {photoUrls.slice(0, 2).map((url, i) => (
                <div key={i} className="flex-1 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {photoUrls.length < 2 &&
                Array.from({ length: 2 - photoUrls.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex-1 rounded-xl bg-muted/30 flex items-center justify-center"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                ))}
            </div>
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
              {photoUrls[2] ? (
                <img
                  src={photoUrls[2]}
                  alt="Foto 3"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Textos na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {secretaria && (
          <p className="text-xs uppercase tracking-wider opacity-80 mb-2">
            {secretaria}
          </p>
        )}

        {descricao && (
          <p className="text-lg font-semibold leading-tight mb-3 line-clamp-3">
            {descricao}
          </p>
        )}

        {formattedDate && (
          <p className="text-sm opacity-70">{formattedDate}</p>
        )}
      </div>
    </div>
  );
}

export default StoriesPreview;
