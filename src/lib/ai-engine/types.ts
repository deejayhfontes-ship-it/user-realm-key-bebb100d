// Tipos para o sistema de IA agnóstico

export type APIType = 'openai' | 'anthropic' | 'google' | 'lovable' | 'custom';

export interface AIProviderConfig {
  id: string;
  name: string;
  slug: string;
  apiType: APIType;
  endpointUrl: string;
  apiKey?: string;
  modelName?: string;
  customHeaders?: Record<string, string>;
  requestTemplate?: Record<string, unknown>;
  responsePath?: string;
  systemPrompt?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

export interface AIRequest {
  prompt: string;
  context: Record<string, unknown>; // Config atual do gerador
  provider: AIProviderConfig;
  conversationHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  success: boolean;
  newConfig?: Record<string, unknown>;
  message?: string;
  tokensUsed?: number;
  processingTime?: number;
  needsClarification?: boolean;
  error?: string;
}

export interface AIProviderFromDB {
  id: string;
  name: string;
  slug: string;
  api_type: APIType;
  endpoint_url: string;
  api_key_encrypted: string | null;
  model_name: string | null;
  custom_headers: Record<string, string> | null;
  request_template: Record<string, unknown> | null;
  response_path: string | null;
  system_prompt: string | null;
  timeout_seconds: number;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  is_default: boolean;
  supports_images: boolean;
  last_test_at: string | null;
  last_test_success: boolean | null;
  last_error: string | null;
  total_requests: number;
  total_tokens_used: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Tipo para imagem anexada
export interface AIImageAttachment {
  name: string;
  type: string;
  base64: string;
}

// Templates pré-configurados para providers comuns
export const providerTemplates: Record<string, Partial<AIProviderConfig>> = {
  lovable: {
    name: 'Lovable AI',
    apiType: 'lovable',
    endpointUrl: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    modelName: 'google/gemini-3-flash-preview',
    responsePath: 'choices[0].message.content',
    systemPrompt: 'Você é um especialista em modificar configurações JSON de geradores de arte. Você recebe a configuração atual e uma instrução do usuário, e deve retornar APENAS o JSON modificado, sem explicações adicionais. Mantenha a estrutura válida.',
  },
  openai: {
    name: 'OpenAI (GPT-4)',
    apiType: 'openai',
    endpointUrl: 'https://api.openai.com/v1/chat/completions',
    modelName: 'gpt-4',
    responsePath: 'choices[0].message.content',
    systemPrompt: 'Você é um especialista em modificar configurações JSON de geradores de arte. Você recebe a configuração atual e uma instrução do usuário, e deve retornar APENAS o JSON modificado, sem explicações adicionais. Mantenha a estrutura válida.',
  },
  anthropic: {
    name: 'Claude (Anthropic)',
    apiType: 'anthropic',
    endpointUrl: 'https://api.anthropic.com/v1/messages',
    modelName: 'claude-sonnet-4-20250514',
    responsePath: 'content[0].text',
    systemPrompt: 'Você é um especialista em modificar configurações JSON de geradores de arte. Você recebe a configuração atual e uma instrução do usuário, e deve retornar APENAS o JSON modificado, sem explicações adicionais. Mantenha a estrutura válida.',
  },
  google: {
    name: 'Google Gemini',
    apiType: 'google',
    endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    responsePath: 'candidates[0].content.parts[0].text',
    systemPrompt: 'Você é um especialista em modificar configurações JSON de geradores de arte. Você recebe a configuração atual e uma instrução do usuário, e deve retornar APENAS o JSON modificado, sem explicações adicionais. Mantenha a estrutura válida.',
  },
};
