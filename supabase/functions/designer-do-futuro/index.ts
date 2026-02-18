// ============================================================
// Edge Function — Designer do Futuro
// Handler principal: busca API key, executa pipeline
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { refinePrompt } from "./refiner.ts";
import { assemblePrompt } from "./assembler.ts";
import { generateImage } from "./generator.ts";
import { STYLES, FRAMINGS, DIMENSIONS } from "./constants.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

const DESIGNER_SLUG = "designer-do-futuro";

interface RequestBody {
    action: "generate" | "config";
    config?: Record<string, any>;
    referenceImage?: {
        base64: string;
        mimeType: string;
    };
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body: RequestBody = await req.json();

        // Action: config — retorna opções disponíveis
        if (body.action === "config") {
            return new Response(
                JSON.stringify({
                    styles: STYLES,
                    framings: FRAMINGS,
                    dimensions: DIMENSIONS,
                }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Action: generate — pipeline completo
        if (body.action !== "generate" || !body.config) {
            return new Response(
                JSON.stringify({ error: "Action inválida. Use 'generate' ou 'config'." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 1. Buscar API key da tabela ai_providers
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: provider, error: providerError } = await supabase
            .from("ai_providers")
            .select("*")
            .eq("slug", DESIGNER_SLUG)
            .eq("is_active", true)
            .single();

        if (providerError || !provider) {
            return new Response(
                JSON.stringify({
                    error:
                        "Provedor Google Gemini não configurado. Vá em Admin > Provedores de IA > Designer do Futuro.",
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const apiKey = provider.api_key_encrypted;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "API Key não configurada no provedor Designer do Futuro." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse model names
        const imageModel = provider.model_name || "gemini-2.5-flash-image";
        let textModel = "gemini-2.5-flash";
        try {
            const meta = provider.system_prompt ? JSON.parse(provider.system_prompt) : null;
            if (meta?.model_text) textModel = meta.model_text;
        } catch {
            // system_prompt is plain text
        }

        // 2. Refinar prompt
        const refinedPrompt = await refinePrompt(apiKey, textModel, body.config);

        // 3. Montar prompt final
        const finalPrompt = assemblePrompt(refinedPrompt, body.config);

        // 4. Gerar imagem
        const result = await generateImage({
            apiKey,
            modelName: imageModel,
            prompt: finalPrompt,
            referenceImageBase64: body.referenceImage?.base64,
            referenceImageMimeType: body.referenceImage?.mimeType,
            dimensionId: body.config.dimension,
        });

        // 5. Atualizar estatísticas
        await supabase
            .from("ai_providers")
            .update({
                total_requests: (provider.total_requests || 0) + 1,
                last_test_at: new Date().toISOString(),
                last_test_success: true,
            })
            .eq("id", provider.id);

        return new Response(
            JSON.stringify({
                success: true,
                image: result.imageBase64,
                mimeType: result.mimeType,
                promptUsed: result.promptUsed,
                refinedPrompt,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error: any) {
        console.error("Designer do Futuro error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || "Erro interno na geração.",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
