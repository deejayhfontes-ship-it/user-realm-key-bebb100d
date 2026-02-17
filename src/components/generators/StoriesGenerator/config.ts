import type { GeneratorConfig } from '@/types/generator';

/**
 * ═══════════════════════════════════════════════
 * CONFIGURAÇÃO DO GERADOR DE STORIES
 * ═══════════════════════════════════════════════
 * 
 * Dimensões: 1080x1920 (formato vertical Stories)
 * Créditos: 1 por geração
 * 
 * FEATURES ATIVAS:
 * ✓ multiplePhotos: Suporta 1, 2 ou 3 fotos
 * ✓ backgroundUpload: Upload de imagem de fundo
 * ✓ textOverlay: Texto sobre a imagem
 * ✓ dateField: Campo de data
 * 
 * FEATURES FUTURAS (desativadas):
 * ○ filters: Filtros de imagem (vintage, p/b, sepia)
 * ○ aiEnhancement: Melhorias com IA
 * ○ templates: Templates salvos
 * ○ aiVariations: Gerar variações com IA
 */

export const storiesConfig: GeneratorConfig = {
  id: '', // Será preenchido com ID do banco
  name: 'Gerador de Stories',
  slug: 'stories',
  type: 'stories',
  description: 'Crie stories profissionais para Instagram com fotos e textos personalizados.',
  dimensions: {
    width: 1080,
    height: 1920,
  },
  creditsPerGeneration: 1,
  allowedFormats: ['png'],
  maxPhotos: 3,
  features: {
    multiplePhotos: true,
    backgroundUpload: true,
    textOverlay: true,
    dateField: true,
    // ═══════════════════════════════════════════
    // ESPAÇO PARA ADICIONAR DEPOIS:
    // ═══════════════════════════════════════════
    filters: false,        // ← Ativar quando implementar filtros
    aiEnhancement: false,  // ← Ativar quando implementar IA
    templates: false,      // ← Ativar quando implementar templates
    aiVariations: false,   // ← Ativar quando implementar variações IA
  },
};

// Opções de quantidade de fotos
export const photoQuantityOptions = [
  { value: 1, label: '1 Foto' },
  { value: 2, label: '2 Fotos' },
  { value: 3, label: '3 Fotos' },
];

// Cores disponíveis para o overlay de texto
export const overlayColors = [
  { value: '#000000', label: 'Preto' },
  { value: '#FFFFFF', label: 'Branco' },
  { value: '#1a1a2e', label: 'Azul Escuro' },
  { value: '#892e13', label: 'Terracota' },
];

// TODO: Adicionar mais opções quando implementar filtros
// export const filterOptions = [
//   { value: 'none', label: 'Sem filtro' },
//   { value: 'vintage', label: 'Vintage' },
//   { value: 'pb', label: 'Preto e Branco' },
//   { value: 'sepia', label: 'Sépia' },
// ];
