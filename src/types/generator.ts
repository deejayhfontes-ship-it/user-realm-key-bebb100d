import { ReactNode } from 'react';

// ═══════════════════════════════════════════════
// TIPOS BASE PARA TODOS OS GERADORES
// ═══════════════════════════════════════════════

export interface GeneratorDimensions {
  width: number;
  height: number;
}

export interface GeneratorFeatures {
  multiplePhotos?: boolean;
  backgroundUpload?: boolean;
  textOverlay?: boolean;
  dateField?: boolean;
  // TODO: Ativar quando implementar
  filters?: boolean;
  aiEnhancement?: boolean;
  templates?: boolean;
  aiVariations?: boolean;
}

export interface GeneratorConfig {
  id: string;
  name: string;
  slug: string;
  type: 'stories' | 'derivacoes' | 'carrossel' | 'avisos' | 'outro';
  dimensions: GeneratorDimensions;
  creditsPerGeneration: number;
  allowedFormats: ('png' | 'jpg' | 'pdf')[];
  features: GeneratorFeatures;
  maxPhotos?: number;
  description?: string;
}

export interface GeneratorFormData {
  [key: string]: unknown;
}

export interface GeneratorBaseProps {
  /** Nome do gerador exibido na UI */
  name: string;
  /** Configurações específicas do gerador */
  config: GeneratorConfig;
  /** Função de geração que retorna o Blob da imagem */
  onGenerate: (data: GeneratorFormData) => Promise<Blob | Blob[]>;
  /** Formulário customizado do gerador */
  renderForm: (formData: GeneratorFormData, setFormData: (data: GeneratorFormData) => void) => ReactNode;
  /** Preview customizado do gerador */
  renderPreview: (formData: GeneratorFormData) => ReactNode;
  /** Validar se o formulário está pronto para gerar */
  validateForm?: (formData: GeneratorFormData) => boolean;
}

export interface GenerationResult {
  id: string;
  blob: Blob;
  timestamp: Date;
  config: GeneratorConfig;
  formData: GeneratorFormData;
}

// ═══════════════════════════════════════════════
// TIPOS PARA PLUGINS (EXPANSÃO FUTURA)
// ═══════════════════════════════════════════════

export type FilterType = 'vintage' | 'pb' | 'sepia' | 'vivid' | 'warm' | 'cool';

export interface PluginContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  dimensions: GeneratorDimensions;
}

// TODO: Adicionar mais tipos conforme plugins são criados
// export interface AIEnhanceOptions { ... }
// export interface TemplateConfig { ... }
