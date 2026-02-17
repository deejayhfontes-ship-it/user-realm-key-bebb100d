import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AIImageAttachment } from '@/lib/ai-engine/types';

export type GeneratorType = 'stories' | 'carrossel' | 'carrossel_vertical' | 'post' | 'custom';

export interface OutputFormat {
  name: string;
  dimensions: { width: number; height: number };
  label: string;
}

export interface DraggableTextField {
  id: string;
  label: string;
  defaultText: string;
  position: { x: number; y: number }; // percentual 0-100
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
  maxWidth?: number;
  draggable: boolean;
}

export interface CreateGeneratorParams {
  name: string;
  type: GeneratorType;
  customDimensions?: { width: number; height: number };
  userPrompt: string;
  providerId?: string;
  images?: AIImageAttachment[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  success?: boolean;
  tokensUsed?: number;
  processingTime?: number;
  images?: AIImageAttachment[];
}

// Templates base por tipo de gerador
export const BASE_TEMPLATES: Record<GeneratorType, Record<string, unknown>> = {
  stories: {
    dimensions: { width: 1080, height: 1920 },
    output_formats: [
      { name: 'stories', dimensions: { width: 1080, height: 1920 }, label: 'Stories (1080×1920)' },
    ],
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#FF0000',
    },
    features: {
      upload: true,
      draggable_text: true,
      text_fields: [],
      preview: true,
      output_format: 'png',
    },
    text_layers: [
      {
        id: 'titulo',
        label: 'Título',
        defaultText: 'Seu texto aqui',
        position: { x: 50, y: 30 },
        fontSize: 48,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        draggable: true,
      },
    ],
    form_fields: [
      {
        name: 'imagem_fundo',
        type: 'file',
        label: 'Imagem de Fundo',
        required: true,
      },
    ],
    credits_per_use: 1,
  },
  carrossel: {
    dimensions: { width: 1080, height: 1080 },
    output_formats: [
      { name: 'quadrado', dimensions: { width: 1080, height: 1080 }, label: 'Quadrado (1080×1080)' },
      { name: 'vertical', dimensions: { width: 1080, height: 1440 }, label: 'Vertical (1080×1440)' },
      { name: 'stories', dimensions: { width: 1080, height: 1920 }, label: 'Stories (1080×1920)' },
    ],
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#0000FF',
    },
    features: {
      upload: true,
      multiple_slides: true,
      draggable_text: true,
      text_fields: [],
      preview: true,
      output_format: 'zip',
    },
    text_layers: [
      {
        id: 'titulo',
        label: 'Título',
        defaultText: 'Título do Slide',
        position: { x: 50, y: 20 },
        fontSize: 42,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        draggable: true,
      },
      {
        id: 'subtitulo',
        label: 'Subtítulo',
        defaultText: 'Subtítulo ou descrição',
        position: { x: 50, y: 80 },
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        draggable: true,
      },
    ],
    form_fields: [],
    credits_per_use: 2,
  },
  carrossel_vertical: {
    dimensions: { width: 1080, height: 1440 },
    output_formats: [
      { name: 'vertical', dimensions: { width: 1080, height: 1440 }, label: 'Vertical (1080×1440)' },
      { name: 'quadrado', dimensions: { width: 1080, height: 1080 }, label: 'Quadrado (1080×1080)' },
      { name: 'stories', dimensions: { width: 1080, height: 1920 }, label: 'Stories (1080×1920)' },
    ],
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#0000FF',
    },
    features: {
      upload: true,
      multiple_slides: true,
      draggable_text: true,
      text_fields: [],
      preview: true,
      output_format: 'zip',
    },
    text_layers: [
      {
        id: 'titulo',
        label: 'Título',
        defaultText: 'Título do Slide',
        position: { x: 50, y: 15 },
        fontSize: 42,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        draggable: true,
      },
      {
        id: 'corpo',
        label: 'Corpo do Texto',
        defaultText: 'Conteúdo principal aqui',
        position: { x: 50, y: 50 },
        fontSize: 28,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        maxWidth: 80,
        draggable: true,
      },
      {
        id: 'rodape',
        label: 'Rodapé',
        defaultText: '@seuperfil',
        position: { x: 50, y: 90 },
        fontSize: 20,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        draggable: true,
      },
    ],
    form_fields: [],
    credits_per_use: 2,
  },
  post: {
    dimensions: { width: 1080, height: 1080 },
    output_formats: [
      { name: 'quadrado', dimensions: { width: 1080, height: 1080 }, label: 'Quadrado (1080×1080)' },
      { name: 'vertical', dimensions: { width: 1080, height: 1350 }, label: 'Vertical (1080×1350)' },
    ],
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
    features: {
      upload: true,
      draggable_text: true,
      text_fields: [],
      preview: true,
      output_format: 'png',
    },
    text_layers: [
      {
        id: 'titulo',
        label: 'Título',
        defaultText: 'Seu título',
        position: { x: 50, y: 50 },
        fontSize: 36,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        align: 'center',
        draggable: true,
      },
    ],
    form_fields: [],
    credits_per_use: 1,
  },
  custom: {
    dimensions: { width: 1080, height: 1080 },
    output_formats: [],
    colors: {},
    features: {
      upload: false,
      draggable_text: true,
      text_fields: [],
      preview: true,
      output_format: 'png',
    },
    text_layers: [],
    form_fields: [],
    credits_per_use: 1,
  },
};

// Gerar slug a partir do nome
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Validar config gerado pela IA
export function validateGeneratorConfig(config: unknown): boolean {
  if (!config || typeof config !== 'object') return false;

  const obj = config as Record<string, unknown>;

  // Campos obrigatórios
  if (!obj.dimensions) return false;
  const dims = obj.dimensions as Record<string, unknown>;
  if (!dims.width || !dims.height) return false;

  if (!obj.features) return false;

  // form_fields pode não existir, mas se existir deve ser array
  if (obj.form_fields !== undefined && !Array.isArray(obj.form_fields)) {
    return false;
  }

  // Validar cada form_field
  if (Array.isArray(obj.form_fields)) {
    for (const field of obj.form_fields) {
      if (!field || typeof field !== 'object') return false;
      const f = field as Record<string, unknown>;
      if (!f.name || !f.type || !f.label) return false;

      const validTypes = ['text', 'textarea', 'file', 'date', 'select', 'number', 'color', 'checkbox'];
      if (!validTypes.includes(f.type as string)) return false;
    }
  }

  // Dimensões razoáveis
  const width = dims.width as number;
  const height = dims.height as number;
  if (width < 100 || width > 5000) return false;
  if (height < 100 || height > 5000) return false;

  return true;
}

export function useAICreate() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [createdGeneratorId, setCreatedGeneratorId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (params: CreateGeneratorParams) => {
      // Gerar slug
      const slug = slugify(params.name);

      // Obter template base
      const baseConfig = { ...BASE_TEMPLATES[params.type] };
      if (params.type === 'custom' && params.customDimensions) {
        baseConfig.dimensions = params.customDimensions;
      }

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('ai-edit', {
        body: {
          mode: 'create',
          generatorName: params.name,
          generatorSlug: slug,
          generatorType: params.type,
          baseConfig,
          userPrompt: params.userPrompt,
          providerId: params.providerId,
          images: params.images,
        },
      });

      if (error) throw error;

      return {
        ...(data as {
          success: boolean;
          generatorId?: string;
          newConfig?: Record<string, unknown>;
          message?: string;
          tokensUsed?: number;
          processingTime?: number;
          error?: string;
        }),
        slug,
        name: params.name,
        images: params.images,
      };
    },
    onMutate: ({ userPrompt, images }) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userPrompt,
        timestamp: new Date(),
        images,
      };
      setMessages((prev) => [...prev, userMessage]);
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.success
          ? `✅ Gerador "${data.name}" criado com sucesso!`
          : `❌ ${data.error || 'Erro ao criar gerador'}`,
        timestamp: new Date(),
        success: data.success,
        tokensUsed: data.tokensUsed,
        processingTime: data.processingTime,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.success && data.generatorId) {
        setCreatedGeneratorId(data.generatorId);
        queryClient.invalidateQueries({ queryKey: ['generators'] });
        queryClient.invalidateQueries({ queryKey: ['generators-list'] });
        toast({
          title: 'Gerador criado!',
          description: `O gerador "${data.name}" foi criado pela IA.`,
        });
      }
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Erro: ${error.message}`,
        timestamp: new Date(),
        success: false,
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: 'Erro ao criar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const clearMessages = () => {
    setMessages([]);
    setCreatedGeneratorId(null);
  };

  return {
    messages,
    sendCreate: createMutation.mutate,
    isCreating: createMutation.isPending,
    createdGeneratorId,
    clearMessages,
  };
}
