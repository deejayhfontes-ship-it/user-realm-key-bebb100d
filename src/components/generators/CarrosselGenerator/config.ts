import type { GeneratorConfig } from '@/types/generator';

/**
 * ═══════════════════════════════════════════════
 * CONFIGURAÇÃO DO GERADOR DE CARROSSEL
 * ═══════════════════════════════════════════════
 * 
 * Dimensões: 1080x1080 (formato quadrado)
 * Créditos: 1 por slide (mínimo 2 slides)
 * 
 * FEATURES ATIVAS:
 * ✓ multiplePhotos: Múltiplas fotos para slides
 * ✓ backgroundUpload: Upload de fundo padrão
 * ✓ textOverlay: Texto em cada slide
 * 
 * FEATURES FUTURAS (desativadas):
 * ○ filters: Filtros de imagem
 * ○ aiEnhancement: Melhorias com IA
 * ○ templates: Templates de carrossel
 * ○ aiVariations: Gerar variações com IA
 */

export const carrosselConfig: GeneratorConfig = {
  id: '', // Será preenchido com ID do banco
  name: 'Gerador de Carrossel',
  slug: 'carrossel',
  type: 'carrossel',
  description: 'Crie carrosséis profissionais para Instagram com múltiplos slides.',
  dimensions: {
    width: 1080,
    height: 1080,
  },
  creditsPerGeneration: 1, // Por slide
  allowedFormats: ['png'],
  maxPhotos: 10,
  features: {
    multiplePhotos: true,
    backgroundUpload: true,
    textOverlay: true,
    dateField: false, // Carrossel não precisa de data
    // ═══════════════════════════════════════════
    // ESPAÇO PARA ADICIONAR DEPOIS:
    // ═══════════════════════════════════════════
    filters: false,
    aiEnhancement: false,
    templates: false,
    aiVariations: false,
  },
};

// Número de slides
export const slideOptions = [
  { value: 2, label: '2 Slides' },
  { value: 3, label: '3 Slides' },
  { value: 4, label: '4 Slides' },
  { value: 5, label: '5 Slides' },
  { value: 6, label: '6 Slides' },
  { value: 8, label: '8 Slides' },
  { value: 10, label: '10 Slides' },
];

// Estilos de layout do carrossel
export const layoutStyles = [
  { value: 'cover', label: 'Foto Cover', description: 'Foto ocupa tudo' },
  { value: 'centered', label: 'Centralizado', description: 'Foto com margem' },
  { value: 'text-bottom', label: 'Texto Inferior', description: 'Área de texto embaixo' },
];

// TODO: Adicionar templates de carrossel
// export const carrosselTemplates = [
//   { id: 'edu', name: 'Educacional', slides: ['intro', 'content', 'content', 'cta'] },
//   { id: 'before-after', name: 'Antes e Depois', slides: ['before', 'after'] },
// ];
