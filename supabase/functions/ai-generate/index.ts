import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

// Extrai valor de objeto usando path (ex: "choices[0].message.content")
function getValueByPath(obj: unknown, path: string): string {
  if (!path) return typeof obj === 'string' ? obj : JSON.stringify(obj);
  
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

// Constrói request baseado no tipo de API
function buildRequest(
  provider: AIProvider,
  prompt: string,
  systemPrompt: string,
  maxTokens?: number,
  temperature?: number
): Record<string, unknown> {
  const finalMaxTokens = maxTokens || provider.max_tokens;
  const finalTemperature = temperature ?? provider.temperature;

  switch (provider.api_type) {
    case 'lovable':
    case 'openai':
      return {
        model: provider.model_name || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: finalMaxTokens,
        temperature: finalTemperature,
      };
      
    case 'anthropic':
      return {
        model: provider.model_name || 'claude-sonnet-4-20250514',
        max_tokens: finalMaxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      };
      
    case 'google':
      return {
        contents: [{ 
          parts: [{ text: `${systemPrompt}\n\n${prompt}` }] 
        }],
        generationConfig: {
          maxOutputTokens: finalMaxTokens,
          temperature: finalTemperature,
        }
      };
      
    default:
      return {
        model: provider.model_name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: finalMaxTokens,
        temperature: finalTemperature,
      };
  }
}

// Obtém headers de autenticação baseado no tipo de provider
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
      // Google usa key na URL
      break;
    default:
      headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (provider.custom_headers) {
    Object.assign(headers, provider.custom_headers);
  }

  return headers;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      prompt, 
      providerId, 
      providerSlug,
      systemPrompt: customSystemPrompt,
      maxTokens,
      temperature
    } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar provider
    let providerQuery = supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true);

    if (providerId) {
      providerQuery = providerQuery.eq('id', providerId);
    } else if (providerSlug) {
      providerQuery = providerQuery.eq('slug', providerSlug);
    } else {
      providerQuery = providerQuery.eq('is_default', true);
    }

    const { data: provider, error: provError } = await providerQuery.single();

    if (provError || !provider) {
      // Fallback para Lovable AI Gateway se nenhum provider configurado
      console.log("Nenhum provider encontrado, usando Lovable AI Gateway...");
      
      if (!lovableApiKey) {
        return new Response(
          JSON.stringify({ error: "Nenhum provedor de IA configurado e LOVABLE_API_KEY não disponível" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Usar Lovable AI Gateway diretamente
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: customSystemPrompt || "Você é um assistente útil e criativo." },
            { role: "user", content: prompt }
          ],
          max_tokens: maxTokens || 4096,
          temperature: temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lovable AI error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "Erro na API de IA" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      const tokens = extractTokens(data);

      return new Response(
        JSON.stringify({ 
          success: true, 
          text,
          provider: "lovable",
          model: "google/gemini-3-flash-preview",
          tokens
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typedProvider = provider as AIProvider;

    // Determinar API key
    let apiKey = typedProvider.api_key_encrypted;
    if (typedProvider.api_type === 'lovable') {
      apiKey = lovableApiKey || '';
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key não configurada para ${typedProvider.name}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // System prompt
    const systemPrompt = customSystemPrompt || typedProvider.system_prompt || "Você é um assistente útil e criativo.";

    // Construir endpoint
    let endpoint = typedProvider.endpoint_url;
    if (typedProvider.api_type === 'google') {
      endpoint = `${endpoint}?key=${apiKey}`;
    }

    const startTime = Date.now();

    // Fazer request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(typedProvider, apiKey),
      body: JSON.stringify(buildRequest(typedProvider, prompt, systemPrompt, maxTokens, temperature)),
      signal: AbortSignal.timeout(typedProvider.timeout_seconds * 1000),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${typedProvider.name} error:`, response.status, errorText);

      // Atualizar status do provider
      await supabase
        .from('ai_providers')
        .update({ 
          last_test_at: new Date().toISOString(),
          last_test_success: false,
          last_error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`
        })
        .eq('id', typedProvider.id);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Erro na API ${typedProvider.name}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = getValueByPath(data, typedProvider.response_path || '');
    const tokens = extractTokens(data);

    // Atualizar estatísticas do provider
    await supabase
      .from('ai_providers')
      .update({ 
        last_test_at: new Date().toISOString(),
        last_test_success: true,
        last_error: null,
        total_requests: (typedProvider as any).total_requests + 1,
        total_tokens_used: ((typedProvider as any).total_tokens_used || 0) + (tokens || 0)
      })
      .eq('id', typedProvider.id);

    console.log(`[${typedProvider.name}] Geração concluída em ${latency}ms, ${tokens || 'N/A'} tokens`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        text,
        provider: typedProvider.slug,
        model: typedProvider.model_name,
        tokens,
        latency
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ai-generate error:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      return new Response(
        JSON.stringify({ error: "Timeout - a IA demorou muito para responder" }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
