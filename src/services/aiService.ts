/**
 * AI Service - Cliente para geração de conteúdo via edge functions
 * 
 * Usa os providers configurados no banco de dados (ai_providers)
 * Mantém as chaves seguras no backend
 */

import { supabase } from '@/integrations/supabase/client';

export interface GenerateTextOptions {
  /** Prompt para enviar à IA */
  prompt: string;
  /** ID do provider específico (opcional) */
  providerId?: string;
  /** Slug do provider (ex: 'gemini', 'openai') (opcional) */
  providerSlug?: string;
  /** System prompt customizado (opcional) */
  systemPrompt?: string;
  /** Máximo de tokens (opcional) */
  maxTokens?: number;
  /** Temperatura 0-1 (opcional) */
  temperature?: number;
}

export interface GenerateTextResult {
  success: boolean;
  text: string;
  provider: string;
  model: string;
  tokens?: number;
  latency?: number;
  error?: string;
}

/**
 * Gera texto usando os providers de IA configurados no backend
 * 
 * @example
 * ```tsx
 * const result = await AIService.generateText({
 *   prompt: "Escreva uma descrição para uma logo de pizzaria",
 *   temperature: 0.8
 * });
 * 
 * if (result.success) {
 *   console.log(result.text);
 * }
 * ```
 */
export class AIService {
  
  /**
   * Gera conteúdo de texto usando o provider configurado
   */
  static async generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
    const { prompt, providerId, providerSlug, systemPrompt, maxTokens, temperature } = options;

    if (!prompt?.trim()) {
      return {
        success: false,
        text: '',
        provider: '',
        model: '',
        error: 'Prompt é obrigatório'
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt,
          providerId,
          providerSlug,
          systemPrompt,
          maxTokens,
          temperature
        }
      });

      if (error) {
        console.error('AI Service error:', error);
        return {
          success: false,
          text: '',
          provider: '',
          model: '',
          error: error.message || 'Erro ao chamar serviço de IA'
        };
      }

      if (data.error) {
        return {
          success: false,
          text: '',
          provider: data.provider || '',
          model: data.model || '',
          error: data.error
        };
      }

      return {
        success: true,
        text: data.text || '',
        provider: data.provider || 'unknown',
        model: data.model || 'unknown',
        tokens: data.tokens,
        latency: data.latency
      };

    } catch (error) {
      console.error('AI Service exception:', error);
      return {
        success: false,
        text: '',
        provider: '',
        model: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Gera múltiplas variações de texto
   */
  static async generateVariations(
    prompt: string, 
    count: number = 3,
    options?: Omit<GenerateTextOptions, 'prompt'>
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const result = await this.generateText({
        ...options,
        prompt: `${prompt}\n\n[Variação ${i + 1} de ${count}]`,
        temperature: 0.8 + (i * 0.05) // Aumenta levemente a temperatura para cada variação
      });
      
      if (result.success && result.text) {
        results.push(result.text);
      }
    }
    
    return results;
  }

  /**
   * Gera texto estruturado (JSON)
   */
  static async generateJSON<T = Record<string, unknown>>(
    prompt: string,
    options?: Omit<GenerateTextOptions, 'prompt'>
  ): Promise<{ success: boolean; data: T | null; error?: string }> {
    const result = await this.generateText({
      ...options,
      prompt,
      systemPrompt: options?.systemPrompt || 'Você retorna APENAS JSON válido, sem explicações ou markdown. Responda somente com o objeto JSON.'
    });

    if (!result.success) {
      return { success: false, data: null, error: result.error };
    }

    try {
      // Tenta extrair JSON da resposta
      let jsonStr = result.text;
      
      // Remove código markdown se existir
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      
      // Tenta encontrar objeto JSON
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const data = JSON.parse(jsonStr) as T;
      return { success: true, data };
    } catch {
      return { 
        success: false, 
        data: null, 
        error: 'A IA não retornou um JSON válido' 
      };
    }
  }

  /**
   * Sugere texto baseado em contexto
   */
  static async suggest(
    context: string,
    type: 'title' | 'description' | 'tags' | 'hashtags' | 'caption'
  ): Promise<string> {
    const prompts: Record<typeof type, string> = {
      title: `Sugira um título criativo e impactante para: ${context}`,
      description: `Escreva uma descrição profissional e envolvente para: ${context}`,
      tags: `Liste 5-10 tags relevantes para: ${context}. Retorne apenas as tags separadas por vírgula.`,
      hashtags: `Crie 5-8 hashtags relevantes para Instagram sobre: ${context}. Retorne apenas as hashtags.`,
      caption: `Escreva uma legenda criativa para redes sociais sobre: ${context}`
    };

    const result = await this.generateText({
      prompt: prompts[type],
      maxTokens: 500,
      temperature: 0.7
    });

    return result.text;
  }

  /**
   * Melhora/reescreve um texto
   */
  static async improve(
    text: string,
    style: 'formal' | 'casual' | 'criativo' | 'técnico' | 'persuasivo' = 'criativo'
  ): Promise<string> {
    const stylePrompts: Record<typeof style, string> = {
      formal: 'Reescreva de forma mais formal e profissional',
      casual: 'Reescreva de forma mais casual e amigável',
      criativo: 'Reescreva de forma mais criativa e envolvente',
      técnico: 'Reescreva de forma mais técnica e precisa',
      persuasivo: 'Reescreva de forma mais persuasiva e convincente'
    };

    const result = await this.generateText({
      prompt: `${stylePrompts[style]}:\n\n"${text}"`,
      temperature: 0.6
    });

    return result.text;
  }
}

// Export default para conveniência
export default AIService;
