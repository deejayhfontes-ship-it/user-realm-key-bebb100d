import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      providerId,
      apiType,
      endpointUrl,
      apiKey,
      modelName,
      customHeaders
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Se providerId foi passado, buscar do banco
    let testConfig = { apiType, endpointUrl, apiKey, modelName, customHeaders };

    if (providerId) {
      const { data: provider, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error || !provider) {
        return new Response(
          JSON.stringify({ success: false, error: "Provider não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      testConfig = {
        apiType: provider.api_type,
        endpointUrl: provider.endpoint_url,
        apiKey: provider.api_type === 'lovable' ? lovableApiKey : provider.api_key_encrypted,
        modelName: provider.model_name,
        customHeaders: provider.custom_headers,
      };
    }

    // Usar Lovable API key se for tipo lovable
    if (testConfig.apiType === 'lovable') {
      testConfig.apiKey = lovableApiKey;
    }

    if (!testConfig.apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "API key não configurada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construir request de teste
    let testRequest: Record<string, unknown>;
    const testPrompt = "Responda apenas com: OK";

    switch (testConfig.apiType) {
      case 'lovable':
      case 'openai':
        testRequest = {
          model: testConfig.modelName || 'gpt-4',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
        };
        break;
      case 'anthropic':
        testRequest = {
          model: testConfig.modelName || 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: testPrompt }],
        };
        break;
      case 'google':
        testRequest = {
          contents: [{ parts: [{ text: testPrompt }] }],
          generationConfig: { maxOutputTokens: 10 },
        };
        break;
      default:
        testRequest = {
          model: testConfig.modelName,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
        };
    }

    // Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(testConfig.customHeaders || {}),
    };

    switch (testConfig.apiType) {
      case 'lovable':
      case 'openai':
        headers['Authorization'] = `Bearer ${testConfig.apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = testConfig.apiKey!;
        headers['anthropic-version'] = '2023-06-01';
        break;
    }

    // Endpoint
    let endpoint = testConfig.endpointUrl;
    if (testConfig.apiType === 'google') {
      // Se o endpoint não inclui o caminho do modelo, construir automaticamente
      if (!endpoint.includes(':generateContent') && !endpoint.includes(':streamGenerateContent')) {
        const model = testConfig.modelName || 'gemini-2.5-flash';
        endpoint = `${endpoint}/models/${model}:generateContent`;
      }
      endpoint = `${endpoint}?key=${testConfig.apiKey}`;
    }

    const startTime = Date.now();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(testRequest),
      signal: AbortSignal.timeout(15000),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();

      // Atualizar status do provider se existir
      if (providerId) {
        await supabase
          .from('ai_providers')
          .update({
            last_test_at: new Date().toISOString(),
            last_test_success: false,
            last_error: `${response.status}: ${errorText.substring(0, 200)}`,
          })
          .eq('id', providerId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ${response.status}: ${errorText.substring(0, 200)}`,
          latency,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Atualizar status do provider se existir
    if (providerId) {
      await supabase
        .from('ai_providers')
        .update({
          last_test_at: new Date().toISOString(),
          last_test_success: true,
          last_error: null,
        })
        .eq('id', providerId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Conexão bem sucedida!",
        latency,
        response: data,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("test-ai-provider error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
