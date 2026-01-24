import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIProvider {
  id: string;
  name: string;
  slug: string;
  api_type: string;
  endpoint_url: string;
  api_key_encrypted: string | null;
  model_name: string | null;
  custom_headers: Record<string, string> | null;
  response_path: string | null;
  system_prompt: string | null;
  timeout_seconds: number;
  max_tokens: number;
  temperature: number;
  supports_images: boolean;
}

interface ImageAttachment {
  name: string;
  type: string;
  base64: string;
}

// Extrai valor de objeto usando path
function getValueByPath(obj: unknown, path: string): string {
  if (!path) return JSON.stringify(obj);
  
  const parts = path.match(/[^.[\]]+|\[\d+\]/g) || [];
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return '';
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

// Extrai JSON de texto
function extractJSON(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch { /* continue */ }
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch { /* failed */ }
    }
  }
  return null;
}

// Constrói content multimodal para mensagens com imagens
function buildMultimodalContent(
  textContent: string,
  images: ImageAttachment[] | undefined,
  provider: AIProvider
): unknown {
  if (!images || images.length === 0) {
    return textContent;
  }

  switch (provider.api_type) {
    case 'lovable':
    case 'openai':
      // OpenAI/Lovable format
      return [
        { type: 'text', text: textContent },
        ...images.map(img => ({
          type: 'image_url',
          image_url: { url: `data:${img.type};base64,${img.base64}` }
        }))
      ];
      
    case 'anthropic':
      // Anthropic format
      return [
        { type: 'text', text: textContent },
        ...images.map(img => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.type,
            data: img.base64
          }
        }))
      ];
      
    case 'google':
      // Google format - handled differently in buildRequest
      return textContent;
      
    default:
      return textContent;
  }
}

// Constrói request baseado no tipo de API
function buildRequest(
  provider: AIProvider,
  fullPrompt: string,
  systemPrompt: string,
  images?: ImageAttachment[]
): Record<string, unknown> {
  const hasImages = images && images.length > 0;
  const multimodalContent = buildMultimodalContent(fullPrompt, images, provider);

  switch (provider.api_type) {
    case 'lovable':
    case 'openai':
      return {
        model: provider.model_name || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: multimodalContent }
        ],
        max_tokens: provider.max_tokens,
        temperature: provider.temperature,
      };
      
    case 'anthropic':
      return {
        model: provider.model_name || 'claude-sonnet-4-20250514',
        max_tokens: provider.max_tokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: multimodalContent }],
      };
      
    case 'google':
      const parts: unknown[] = [{ text: `${systemPrompt}\n\n${fullPrompt}` }];
      if (hasImages) {
        images!.forEach(img => {
          parts.push({
            inline_data: {
              mime_type: img.type,
              data: img.base64
            }
          });
        });
      }
      return {
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: provider.max_tokens,
          temperature: provider.temperature,
        }
      };
      
    default:
      return {
        model: provider.model_name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: multimodalContent }
        ],
        max_tokens: provider.max_tokens,
        temperature: provider.temperature,
      };
  }
}

// Obtém headers de autenticação
function getAuthHeaders(provider: AIProvider, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (provider.api_type) {
    case 'lovable':
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'google':
      // API key vai na URL para Google
      break;
    default:
      headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Adiciona headers customizados
  if (provider.custom_headers) {
    Object.assign(headers, provider.custom_headers);
  }

  return headers;
}

// Extrai tokens usados da resposta
function extractTokens(data: unknown): number | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const obj = data as Record<string, unknown>;
  
  if (obj.usage && typeof obj.usage === 'object') {
    const usage = obj.usage as Record<string, number>;
    return usage.total_tokens || (usage.input_tokens || 0) + (usage.output_tokens || 0);
  }
  return undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generatorId, userPrompt, providerId, images } = await req.json();

    if (!generatorId || !userPrompt) {
      return new Response(
        JSON.stringify({ error: "generatorId e userPrompt são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar generator
    const { data: generator, error: genError } = await supabase
      .from('generators')
      .select('id, config, name')
      .eq('id', generatorId)
      .single();

    if (genError || !generator) {
      return new Response(
        JSON.stringify({ error: "Gerador não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar provider
    let providerQuery = supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true);

    if (providerId) {
      providerQuery = providerQuery.eq('id', providerId);
    } else {
      providerQuery = providerQuery.eq('is_default', true);
    }

    const { data: provider, error: provError } = await providerQuery.single();

    if (provError || !provider) {
      return new Response(
        JSON.stringify({ error: "Nenhum provedor de IA configurado", needsSetup: true }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typedProvider = provider as AIProvider;

    // Verificar suporte a imagens
    const hasImages = images && Array.isArray(images) && images.length > 0;
    if (hasImages && !typedProvider.supports_images) {
      console.warn(`Provider ${typedProvider.name} não suporta imagens, serão ignoradas`);
    }

    // Determinar API key
    let apiKey = typedProvider.api_key_encrypted;
    if (typedProvider.api_type === 'lovable') {
      apiKey = lovableApiKey || '';
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key não configurada para este provider" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = typedProvider.system_prompt || 
      'Você modifica configurações JSON de geradores. Retorne APENAS o JSON modificado.';

    // Construir prompt completo
    const imageNote = hasImages && typedProvider.supports_images 
      ? `\n\n[${images.length} imagem(ns) anexada(s) para referência]` 
      : '';
    
    const fullPrompt = `GERADOR: ${generator.name}

CONFIG ATUAL:
${JSON.stringify(generator.config, null, 2)}

ALTERAÇÃO SOLICITADA:
${userPrompt}${imageNote}

Retorne APENAS o JSON modificado completo.`;

    const startTime = Date.now();

    // Construir endpoint (Google precisa da key na URL)
    let endpoint = typedProvider.endpoint_url;
    if (typedProvider.api_type === 'google') {
      endpoint = `${endpoint}?key=${apiKey}`;
    }

    // Preparar imagens para request (apenas se provider suporta)
    const imagesToSend = hasImages && typedProvider.supports_images ? images as ImageAttachment[] : undefined;

    // Fazer request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(typedProvider, apiKey),
      body: JSON.stringify(buildRequest(typedProvider, fullPrompt, systemPrompt, imagesToSend)),
      signal: AbortSignal.timeout(typedProvider.timeout_seconds * 1000),
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);

      // Salvar histórico com erro
      await supabase.from('generator_edit_history').insert({
        generator_id: generatorId,
        provider_id: typedProvider.id,
        old_config: generator.config,
        new_config: generator.config,
        user_prompt: userPrompt,
        processing_time_ms: processingTime,
        success: false,
        error_message: `API error ${response.status}: ${errorText.substring(0, 500)}`,
        attachments: hasImages ? images.map((img: ImageAttachment) => ({ name: img.name, type: img.type })) : [],
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido, tente novamente em alguns segundos" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro na API de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiText = getValueByPath(data, typedProvider.response_path || '');
    const tokensUsed = extractTokens(data);

    // Extrair JSON da resposta
    const newConfig = extractJSON(aiText);

    if (!newConfig) {
      await supabase.from('generator_edit_history').insert({
        generator_id: generatorId,
        provider_id: typedProvider.id,
        old_config: generator.config,
        new_config: generator.config,
        user_prompt: userPrompt,
        ai_response: aiText,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
        success: false,
        error_message: "Não foi possível extrair JSON válido da resposta",
        attachments: hasImages ? images.map((img: ImageAttachment) => ({ name: img.name, type: img.type })) : [],
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "A IA não retornou um JSON válido",
          message: aiText 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Salvar histórico de sucesso
    await supabase.from('generator_edit_history').insert({
      generator_id: generatorId,
      provider_id: typedProvider.id,
      old_config: generator.config,
      new_config: newConfig,
      user_prompt: userPrompt,
      ai_response: aiText,
      tokens_used: tokensUsed,
      processing_time_ms: processingTime,
      success: true,
      attachments: hasImages ? images.map((img: ImageAttachment) => ({ name: img.name, type: img.type })) : [],
    });

    // Atualizar config do generator
    await supabase
      .from('generators')
      .update({ config: newConfig, updated_at: new Date().toISOString() })
      .eq('id', generatorId);

    // Atualizar stats do provider
    await supabase
      .from('ai_providers')
      .update({
        total_requests: (provider.total_requests || 0) + 1,
        total_tokens_used: (provider.total_tokens_used || 0) + (tokensUsed || 0),
        last_test_at: new Date().toISOString(),
        last_test_success: true,
      })
      .eq('id', typedProvider.id);

    return new Response(
      JSON.stringify({
        success: true,
        newConfig,
        message: aiText,
        tokensUsed,
        processingTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ai-edit error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
