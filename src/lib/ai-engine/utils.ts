// Utilitários para o motor de IA

/**
 * Extrai um valor de um objeto usando path em formato string
 * Ex: "choices[0].message.content" -> obj.choices[0].message.content
 */
export function getValueByPath(obj: unknown, path: string): string {
  if (!path) return JSON.stringify(obj);
  
  const parts = path.match(/[^.[\]]+|\[\d+\]/g) || [];
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return '';
    }
    
    const cleanPart = part.replace(/^\[|\]$/g, '');
    const index = parseInt(cleanPart, 10);
    
    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[cleanPart];
    } else {
      return '';
    }
  }
  
  return typeof current === 'string' ? current : JSON.stringify(current);
}

/**
 * Aplica template de request substituindo placeholders
 */
export function applyTemplate(
  template: Record<string, unknown>,
  values: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'string') {
      // Substitui {{placeholder}} pelos valores
      let replaced = value;
      for (const [placeholder, replacement] of Object.entries(values)) {
        replaced = replaced.replace(
          new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'),
          String(replacement)
        );
      }
      result[key] = replaced;
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? applyTemplate(item as Record<string, unknown>, values)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = applyTemplate(value as Record<string, unknown>, values);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Extrai JSON de uma resposta de texto
 * Tenta encontrar blocos JSON mesmo com texto ao redor
 */
export function extractJSON(text: string): Record<string, unknown> | null {
  // Primeiro, tenta parsear diretamente
  try {
    return JSON.parse(text);
  } catch {
    // Continua tentando extrair
  }
  
  // Tenta encontrar blocos de código JSON
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // Continua tentando
    }
  }
  
  // Tenta encontrar objeto JSON no texto
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Falhou
    }
  }
  
  return null;
}

/**
 * Valida se uma config de gerador é válida
 */
export function validateGeneratorConfig(config: unknown): boolean {
  if (!config || typeof config !== 'object') return false;
  
  const obj = config as Record<string, unknown>;
  
  // Verifica campos básicos
  if (typeof obj.id !== 'string' && typeof obj.name !== 'string') {
    // Precisa ter pelo menos id ou name
    return Object.keys(obj).length > 0;
  }
  
  return true;
}

/**
 * Extrai contagem de tokens da resposta (se disponível)
 */
export function extractTokensUsage(data: unknown): number | undefined {
  if (!data || typeof data !== 'object') return undefined;
  
  const obj = data as Record<string, unknown>;
  
  // OpenAI style
  if (obj.usage && typeof obj.usage === 'object') {
    const usage = obj.usage as Record<string, unknown>;
    if (typeof usage.total_tokens === 'number') {
      return usage.total_tokens;
    }
  }
  
  // Anthropic style
  if (obj.usage && typeof obj.usage === 'object') {
    const usage = obj.usage as Record<string, unknown>;
    const input = typeof usage.input_tokens === 'number' ? usage.input_tokens : 0;
    const output = typeof usage.output_tokens === 'number' ? usage.output_tokens : 0;
    return input + output;
  }
  
  return undefined;
}

/**
 * Prompt system padrão para edição de geradores
 */
export const DEFAULT_SYSTEM_PROMPT = `Você é um especialista em modificar configurações JSON de geradores de arte.

REGRAS:
1. Você recebe a configuração atual do gerador e uma instrução do usuário
2. Modifique APENAS o que foi solicitado
3. Retorne SOMENTE o JSON completo modificado
4. NÃO inclua explicações, apenas o JSON
5. Mantenha a estrutura válida e todos os campos existentes
6. Se não entender a instrução, retorne o JSON original sem modificações

FORMATO DE RESPOSTA:
Apenas o JSON, sem markdown, sem explicações.`;
