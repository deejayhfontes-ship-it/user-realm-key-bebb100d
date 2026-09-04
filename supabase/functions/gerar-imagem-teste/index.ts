import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Modelo de imagem padrão — fácil de trocar aqui.
const IMAGE_MODEL = "gemini-3-pro-image"; // Nano Banana Pro (GA) — o "-preview" foi descontinuado (404)
// Se o model_name do provider for de imagem, é usado no lugar do padrão.
const IMAGE_MODEL_HINTS = ["image", "imagen"];

interface GooglePart {
  text?: string;
  inline_data?: { mime_type?: string; data?: string };
  inlineData?: { mimeType?: string; data?: string };
}

function extractImage(data: unknown): { image_base64: string; mime: string } | null {
  const obj = data as {
    candidates?: Array<{ content?: { parts?: GooglePart[] } }>;
  };
  const parts = obj?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const inline = p.inline_data ?? p.inlineData;
    if (inline?.data) {
      const mime = (inline as { mime_type?: string; mimeType?: string }).mime_type
        ?? (inline as { mimeType?: string }).mimeType
        ?? "image/png";
      return { image_base64: inline.data, mime };
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, imagens, dimensions } = body as {
      prompt?: string;
      imagens?: string[];
      dimensions?: string;
    };

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

    // Buscar provider do Google (reusa a mesma chave já configurada no site).
    const { data: provider, error: provError } = await supabase
      .from("ai_providers")
      .select("*")
      .eq("is_active", true)
      .eq("api_type", "google")
      .order("is_default", { ascending: false })
      .limit(1)
      .single();

    if (provError || !provider) {
      return new Response(
        JSON.stringify({ error: "Nenhum provider Google ativo em ai_providers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = provider.api_key_encrypted as string | null;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Provider Google sem api_key_encrypted configurada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Modelo: usa o do provider se já for de imagem, senão o padrão.
    const providerModel = (provider.model_name as string | null) ?? "";
    const model = IMAGE_MODEL_HINTS.some((h) => providerModel.toLowerCase().includes(h))
      ? providerModel
      : IMAGE_MODEL;

    const imagensBase64 = Array.isArray(imagens) ? imagens.filter(Boolean) : [];

    const parts: GooglePart[] = [
      { text: prompt },
      ...imagensBase64.map((b64) => ({
        inline_data: { mime_type: "image/png", data: b64 },
      })),
    ];

    const requestBody = {
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["IMAGE"] },
    };

    // Tentativa 1 — Google Generative Language.
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`; // key via header x-goog-api-key (keys AQ. falham em ?key=)
    let googleError = "";
    try {
      const gRes = await fetch(googleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(requestBody),
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const img = extractImage(gData);
        if (img) {
          return new Response(
            JSON.stringify({ ...img, provider: "google", model, dimensions }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        googleError = "Google respondeu sem imagem (parts[].inline_data ausente)";
      } else {
        googleError = `Google HTTP ${gRes.status}: ${(await gRes.text()).substring(0, 300)}`;
      }
    } catch (e) {
      googleError = `Falha ao chamar Google: ${e instanceof Error ? e.message : String(e)}`;
    }

    console.error("gerar-imagem-teste (google):", googleError);

    // Fallback opcional — OpenRouter via LOVABLE_API_KEY.
    if (lovableApiKey) {
      try {
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  ...imagensBase64.map((b64) => ({
                    type: "image_url",
                    image_url: { url: `data:image/png;base64,${b64}` },
                  })),
                ],
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const msg = orData?.choices?.[0]?.message;
          const orImg: string | undefined = msg?.images?.[0]?.image_url?.url;
          if (orImg && orImg.startsWith("data:")) {
            const [meta, b64] = orImg.split(",");
            const mime = meta.replace("data:", "").replace(";base64", "") || "image/png";
            return new Response(
              JSON.stringify({
                image_base64: b64,
                mime,
                provider: "openrouter",
                model: "google/gemini-3-pro-image",
                dimensions,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        console.error("gerar-imagem-teste (openrouter):", `HTTP ${orRes.status}`);
      } catch (e) {
        console.error("gerar-imagem-teste (openrouter):", e instanceof Error ? e.message : String(e));
      }
    }

    return new Response(
      JSON.stringify({
        error: lovableApiKey
          ? `Google falhou e fallback OpenRouter não retornou imagem. Detalhe: ${googleError}`
          : `Google falhou e não há LOVABLE_API_KEY para fallback. Detalhe: ${googleError}`,
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("gerar-imagem-teste error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
