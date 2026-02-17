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

function getAuthHeaders(provider: AIProvider, apiKey: string): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
            break;
        default:
            headers['Authorization'] = `Bearer ${apiKey}`;
    }
    if (provider.custom_headers) {
        Object.assign(headers, provider.custom_headers);
    }
    return headers;
}

// Obtém provider ativo do banco — SEM fallback
async function getProvider(supabase: any) {
    const { data: provider, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

    if (error || !provider) {
        throw new Error("Nenhum provedor de IA configurado. Configure em /admin/ai-providers e marque como ativo e padrão.");
    }

    const typed = provider as AIProvider;
    const apiKey = typed.api_key_encrypted || '';
    let endpoint = typed.endpoint_url;
    if (typed.api_type === 'google' && apiKey) {
        endpoint = `${endpoint}?key=${apiKey}`;
    }
    return { provider: typed, apiKey, endpoint };
}

// Constrói mensagens para vision (análise de imagem)
function buildVisionMessages(provider: AIProvider, imageBase64: string, imageType: string, textPrompt: string) {
    if (provider.api_type === 'google') {
        return {
            contents: [{
                parts: [
                    { inline_data: { mime_type: imageType, data: imageBase64 } },
                    { text: textPrompt }
                ]
            }],
            generationConfig: { maxOutputTokens: 4000, temperature: 0.5 }
        };
    }
    // OpenAI / Lovable / default
    return {
        model: provider.model_name || 'google/gemini-2.5-flash',
        messages: [{
            role: "user",
            content: [
                { type: "image_url", image_url: { url: `data:${imageType};base64,${imageBase64}` } },
                { type: "text", text: textPrompt }
            ]
        }],
        max_tokens: 4000,
    };
}

// Constrói mensagens para vision com 2 imagens
function buildCrossVisionMessages(provider: AIProvider, img1Base64: string, img1Type: string, img2Base64: string, img2Type: string, textPrompt: string) {
    if (provider.api_type === 'google') {
        return {
            contents: [{
                parts: [
                    { inline_data: { mime_type: img1Type, data: img1Base64 } },
                    { inline_data: { mime_type: img2Type, data: img2Base64 } },
                    { text: textPrompt }
                ]
            }],
            generationConfig: { maxOutputTokens: 4000, temperature: 0.5 }
        };
    }
    return {
        model: provider.model_name || 'google/gemini-2.5-flash',
        messages: [{
            role: "user",
            content: [
                { type: "image_url", image_url: { url: `data:${img1Type};base64,${img1Base64}` } },
                { type: "image_url", image_url: { url: `data:${img2Type};base64,${img2Base64}` } },
                { type: "text", text: textPrompt }
            ]
        }],
        max_tokens: 4000,
    };
}

// ========== FIX 5: buildTextRequest corrigido — system ≠ user ==========
function buildTextRequest(provider: AIProvider, systemPrompt: string, userPrompt: string) {
    switch (provider.api_type) {
        case 'anthropic':
            return {
                model: provider.model_name || 'claude-sonnet-4-20250514',
                max_tokens: 3000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            };
        case 'google':
            return {
                contents: [
                    { role: 'user', parts: [{ text: userPrompt }] }
                ],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { maxOutputTokens: 3000, temperature: 0.8 }
            };
        default: // openai, lovable, custom
            return {
                model: provider.model_name || 'google/gemini-2.5-flash',
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 3000,
            };
    }
}

// ========== FIX 4: Templates de prompt especializados por plataforma ==========
function buildPlatformSpecificInstructions(platformKey: string): string {
    const templates: Record<string, string> = {
        veo3: `FORMATO DE SAÍDA PARA GOOGLE VEO 3:
Use linguagem NATURAL e DESCRITIVA. O Veo 3 funciona como um motor de renderização que entende descrições estruturadas.
Estruture o prompt assim:
1. ABERTURA: Tipo de shot + ângulo + movimento de câmera
2. SUJEITO: Descrição detalhada do que aparece na cena
3. AÇÃO: O que acontece, com verbos de movimento
4. AMBIENTE: Local, hora do dia, clima
5. ILUMINAÇÃO: Setup de luz com termos técnicos (key light, fill, rim)
6. ATMOSFERA: Mood, temperatura de cor, partículas no ar
7. ÁUDIO (se aplicável): Ambiente sonoro, SFX

EXEMPLO DE PROMPT VEO 3 EXCELENTE:
"Low angle close-up of a weathered fisherman's hands pulling a wet rope on a wooden boat deck. Camera slowly dollies in. Golden hour side lighting creates deep shadows across the rope texture. Salt water droplets catch the warm light. Ambient sound of gentle waves and creaking wood. The rope fibers stretch under tension as he pulls with deliberate force."

REGRAS VEO: Evite palavras proibidas. Use linguagem cinematográfica. Máximo 500 caracteres. Foque em VISUAL, não em conceitos abstratos.`,

        kling: `FORMATO DE SAÍDA PARA KLING AI:
O Kling funciona com TIMELINE SCRIPTS e AUDIO SYNC. Estruture com beats temporais.
Formato:
Beat 0-Xs: [Ângulo de câmera] + [Descrição da ação]
Beat Xs-Ys: [Mudança de câmera] + [Nova ação]
Audio: [Descrição do áudio ambiente e SFX sincronizados]

EXEMPLO DE PROMPT KLING EXCELENTE:
"Cinematic 16:9, moody lighting.
Beat 0-3s: Wide shot, rain-soaked city street. A figure walks toward camera under a neon sign.
Beat 3-5s: Medium close-up, the figure stops and looks up. Rain drops on their face.
Audio: 0-3s: Heavy rain on pavement, distant traffic. 3.5s: SFX: Thunder rumble."

REGRAS KLING: Descrições claras e objetivas. Evite abstrações. Máximo 400 caracteres. Sincronize ação com áudio.`,

        runway: `FORMATO DE SAÍDA PARA RUNWAY GEN-3:
O Runway é um ESCULTOR CINÉTICO. Descreva FORÇAS e FÍSICA, não apenas aparência.
Use a sintaxe Force-Reaction:
1. CÂMERA: Use tokens específicos (Camera pan left, Truck right, Dolly in, Boom up, Tilt down)
2. FÍSICA: Descreva peso, momentum, resistência, inércia
3. MATERIAIS: Descreva rigidez, flexibilidade, textura
4. MOVIMENTO: Velocidade, direção, aceleração

EXEMPLO DE PROMPT RUNWAY EXCELENTE:
"Camera slow dolly in on a heavy iron pendulum swinging through thick fog. The pendulum carries significant momentum, displacing the fog in its arc. Metal surface reflects dim warm light. Each swing creates subtle air currents that disturb nearby dust particles. Movement is deliberate and weighty."

REGRAS RUNWAY: Linguagem cinematográfica é aceita. Descreva rigidez de objetos para evitar morphing. Máximo 350 caracteres. Use descritores de peso (heavy, dense, solid).`,

        pika: `FORMATO DE SAÍDA PARA PIKA LABS:
O Pika aceita descrições VISUAIS DIRETAS com termos de câmera.
Estruture de forma simples e clara:
1. [Shot type], [sujeito]
2. [Ação principal]
3. [Ambiente e iluminação]
4. [Detalhe visual específico]

EXEMPLO DE PROMPT PIKA EXCELENTE:
"Close-up shot of a cat's eye reflecting a sunset. The pupil slowly dilates. Warm orange and purple light fills the iris. Soft bokeh background. Gentle eye movement."

REGRAS PIKA: Seja direto e visual. Evite frases longas. Máximo 300 caracteres. Menos é mais.`,

        leonardo: `FORMATO DE SAÍDA PARA LEONARDO.AI:
O Leonardo suporta MOTION CONTROLS AVANÇADOS e descrição técnica detalhada.
Estruture com camadas:
1. MOTION: Tipo de movimento específico e intensidade
2. COMPOSIÇÃO: Enquadramento técnico detalhado
3. ESTILO: Estética visual com referências
4. MATERIAIS: Texturas e superfícies detalhadas
5. ILUMINAÇÃO: Setup técnico com valores

EXEMPLO DE PROMPT LEONARDO EXCELENTE:
"Cinematic dolly zoom on a crystal wine glass on a marble table. Slow orbit motion. Studio three-point lighting: warm key light at 45 degrees, cool fill from left, strong rim light creating glass caustics. Crystal refracts rainbow spectrum. Shallow depth of field, f/1.4. Photorealistic style."

REGRAS LEONARDO: Termos técnicos são bem-vindos. Motion controls detalhados. Máximo 450 caracteres.`
    };

    return templates[platformKey] || templates['veo3'];
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { action, imageBase64, imageBase64_2, imageType, imageType2, options, imageDescription, imageDescription2, prompt, advancedOptions } = await req.json();

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { provider, apiKey, endpoint } = await getProvider(supabase);

        // ===== ACTION: GENERATE IMAGE (desabilitado na v1) =====
        if (action === "generate-image") {
            return new Response(JSON.stringify({
                error: "Geração de imagens está temporariamente desabilitada. Use a geração de prompts para criar seus vídeos."
            }), {
                status: 501,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // ===== FIX 2: ACTION ANALYZE — Análise cinematográfica avançada =====
        if (action === "analyze") {
            console.log("Analisando imagem com foco cinematográfico para vídeo AI...");

            const analyzePrompt = `Você é um DIRETOR DE FOTOGRAFIA DE HOLLYWOOD e SUPERVISOR DE VFX analisando um frame de referência para geração de vídeo AI.

Analise esta imagem com PRECISÃO TÉCNICA CINEMATOGRÁFICA. Sua análise será usada para gerar prompts de vídeo em plataformas como Veo 3, Runway, Kling e Pika. Seja EXTREMAMENTE específico e visual.

## ANÁLISE TÉCNICA OBRIGATÓRIA:

### 1. COMPOSIÇÃO E ENQUADRAMENTO
- Tipo de shot (close-up, medium, wide, extreme wide)
- Linha do horizonte e regra dos terços
- Linhas guia e ponto focal
- Profundidade de campo aparente

### 2. SUJEITO PRINCIPAL
- Descrição física PRECISA (idade aparente, vestimenta, postura, expressão)
- Posição no frame (centro, terço esquerdo, etc.)
- Estado emocional transmitido
- Para objetos: material, textura, peso aparente, dimensões relativas

### 3. FÍSICA E MOVIMENTO POTENCIAL
- Peso e rigidez dos objetos (sólido, flexível, líquido, gasoso)
- Vetores de força presentes (gravidade, vento, tensão)
- Pontos de articulação (onde o movimento começaria)
- Tipo de movimento mais natural: lento/contemplativo ou rápido/energético

### 4. ILUMINAÇÃO TÉCNICA
- Direção da luz principal (ângulo em graus aprox.)
- Tipo: natural, artificial, mista
- Qualidade: dura (sombras definidas) ou suave (sombras difusas)
- Cor da luz: temperatura em Kelvin aprox. (2700K quente, 5500K neutro, 8000K frio)
- Ratio de contraste: alto (dramático) ou baixo (flat)

### 5. PALETA DE CORES
- 3-4 cores dominantes com descrição (ex: "azul petróleo", "dourado âmbar")
- Temperatura geral: quente, fria, neutra
- Saturação: vivida, dessaturada, pastel
- Se há color grading aparente (teal & orange, vintage, noir, etc.)

### 6. AMBIENTE E ATMOSFERA
- Local específico (estúdio, exterior, interior)
- Hora do dia estimada
- Condições atmosféricas (neblina, poeira, chuva, partículas no ar)
- Depth cues: o que está no foreground, midground, background

### 7. TEXTURA E MATERIAIS
- Superfícies visíveis e suas propriedades (reflexivo, matte, translúcido, rugoso)
- Como a luz interage com esses materiais
- Detalhes microscópicos visíveis (gotas d'água, poros, fibras)

### 8. SOM POTENCIAL
- Que sons essa cena produziria naturalmente
- Ambiente sonoro provável (silêncio, urbano, natureza, industrial)

FORMATO DE RESPOSTA: Escreva uma descrição CONTÍNUA e FLUIDA em português brasileiro, como se estivesse briefando uma equipe de VFX. NÃO use bullet points na resposta final — escreva em parágrafos densos e descritivos. Cada detalhe é crucial.`;

            const body = buildVisionMessages(provider, imageBase64, imageType, analyzePrompt);
            const headers = getAuthHeaders(provider, apiKey);

            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(60000),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Vision error:", response.status, errorText);
                if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Aguarde." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const result = getValueByPath(data, provider.response_path || 'choices[0].message.content');
            return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // ===== FIX 3: ACTION ANALYZE CROSS — Cross-analysis focada em transição =====
        if (action === "analyze-cross") {
            console.log("Cross-analyzing duas imagens para transição cinematográfica...");

            const crossPrompt = `Você é um SUPERVISOR DE VFX e EDITOR DE CINEMA analisando dois frames para criar uma TRANSIÇÃO CINEMATOGRÁFICA perfeita entre eles.

Sua análise será usada para gerar um prompt de vídeo AI que transforma o Frame A no Frame B. Seja TECNICAMENTE PRECISO.

## ANÁLISE DO FRAME A (IMAGEM 1 — INÍCIO):
1. Sujeito principal: descrição precisa (posição, tamanho, material)
2. Cores dominantes e temperatura de cor
3. Direção e tipo de iluminação
4. Composição e ponto focal

## ANÁLISE DO FRAME B (IMAGEM 2 — FIM):
1. Sujeito principal: descrição precisa
2. Cores dominantes e temperatura de cor
3. Direção e tipo de iluminação
4. Composição e ponto focal

## MAPA DE TRANSIÇÃO (CRÍTICO):

### MORPHING POINTS — Elementos que se transformam:
- Identifique 3-5 elementos visuais que existem em AMBAS as imagens (ex: uma forma circular no Frame A que pode morphar na lua no Frame B)
- Para cada ponto: descreva a transformação visual específica

### VETORES DE MOVIMENTO:
- Direção do movimento principal (left→right, zoom in, orbit, etc.)
- Velocidade sugerida (lenta para contemplativo, média para narrativo, rápida para impacto)
- Tipo de easing (ease-in, ease-out, linear)

### CONTINUIDADE VISUAL:
- Elementos de COR que conectam os frames (um tom dourado que persiste, por exemplo)
- FORMAS geométricas que se repetem (círculos, linhas verticais, etc.)
- TEXTURAS que fazem ponte visual

### TIPO DE TRANSIÇÃO RECOMENDADO:
Escolha o MELHOR tipo e explique por quê:
- Morph/Dissolve: elementos se fundem gradualmente
- Wipe/Reveal: um frame revela o outro com direção
- Zoom Through: câmera atravessa um elemento para chegar ao próximo frame
- Match Cut: corte direto aproveitando elementos visuais similares
- Particle Transition: elementos se desintegram e recompõem
- Light Flash: flash de luz conecta os frames

### AUDIO BRIDGE:
- Que som conectaria naturalmente os dois frames
- Sugestão de SFX no ponto de transição

FORMATO DE RESPOSTA: Escreva em parágrafos fluidos em português brasileiro, como briefing técnico de VFX. Foque nos PONTOS DE CONEXÃO entre os frames — é isso que torna a transição cinematográfica.`;

            const body = buildCrossVisionMessages(provider, imageBase64, imageType, imageBase64_2, imageType2, crossPrompt);
            const headers = getAuthHeaders(provider, apiKey);

            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(60000),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Cross-vision error:", response.status, errorText);
                if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Aguarde." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const result = getValueByPath(data, provider.response_path || 'choices[0].message.content');
            return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // ===== FIX 1 + FIX 4: ACTION GENERATE — Prompts especializados por plataforma =====
        if (action === "generate") {
            const platform = options.platform;
            const motion = options.motion;
            const angle = options.angle;
            const lighting = options.lighting;
            const animation = options.animation;
            const language = options.language || 'pt';
            const aesthetic = options.aesthetic;
            const transitionSpeed = options.transitionSpeed;
            const generationMode = options.generationMode;

            const negativePrompt = advancedOptions?.negativePrompt || '';
            const seed = advancedOptions?.seed || '';
            const aspectRatio = advancedOptions?.aspectRatio || '16:9';
            const duration = advancedOptions?.duration || '5s';
            const resolution = advancedOptions?.resolution || '1080p';
            const colorGrading = advancedOptions?.colorGrading || 'none';
            const weather = advancedOptions?.weather || 'none';
            const characterConsistency = advancedOptions?.characterConsistency || '';
            const audioSuggestion = advancedOptions?.audioSuggestion || '';

            // Identificar key da plataforma para template específico
            const platformKeyMap: Record<string, string> = {
                'Google Veo 3': 'veo3',
                'Kling AI': 'kling',
                'Runway Gen-3': 'runway',
                'Pika Labs': 'pika',
                'Leonardo.ai': 'leonardo',
            };
            const platformKey = platformKeyMap[platform.name] || 'veo3';

            // ===== SYSTEM PROMPT: Persona + Regras + Template da plataforma =====
            const systemPrompt = `Você é o maior especialista MUNDIAL em criação de prompts para geração de vídeos AI. Você domina cinematografia, VFX, direção de fotografia e todas as plataformas de vídeo AI.

REGRAS ABSOLUTAS:
1. Respeite TODAS as diretrizes da plataforma — NUNCA use palavras proibidas
2. O prompt final DEVE ter no MÁXIMO ${platform.maxLength} caracteres
3. Retorne APENAS o prompt final — sem explicações, sem comentários, sem formatação markdown
4. Seja cinematográfico e profissional — como um diretor de fotografia de Hollywood
5. Integre TODOS os elementos técnicos de forma NATURAL no texto
6. Use linguagem descritiva e visual — verbos de ação, não estados
7. Mencione movimento de câmera EXPLICITAMENTE usando termos técnicos
8. Descreva iluminação com termos técnicos
9. Inclua detalhes de textura, material e peso dos objetos
10. Se houver prompt negativo, formule para EVITAR esses elementos
${negativePrompt ? `\nPROMPT NEGATIVO (elementos a EVITAR no prompt): ${negativePrompt}` : ''}

PLATAFORMA: ${platform.name}
DIRETRIZES: ${platform.guidelines}
PALAVRAS PROIBIDAS: ${platform.forbidden.join(', ')}

${buildPlatformSpecificInstructions(platformKey)}`;

            // ===== USER PROMPT: Descrição da cena + configurações (FIX 1: separado do system) =====
            let advancedBlock = '';
            if (colorGrading !== 'none') advancedBlock += `\n- Color Grading: ${colorGrading}`;
            if (weather !== 'none') advancedBlock += `\n- Clima/Ambiente: ${weather}`;
            if (characterConsistency) advancedBlock += `\n- Consistência de personagem: ${characterConsistency}`;
            if (audioSuggestion) advancedBlock += `\n- Sugestão de áudio/SFX: ${audioSuggestion}`;
            if (seed) advancedBlock += `\n- Seed: ${seed}`;

            let transitionBlock = '';
            if (generationMode === 'frames-to-video' && transitionSpeed) {
                const speedDescriptions: Record<string, string> = {
                    'lenta': 'Transição lenta e contemplativa, suave como um fade gradual.',
                    'media': 'Transição com ritmo balanceado, fluxo natural entre os frames.',
                    'rapida': 'Transição dinâmica e energética, corte rápido com impacto.',
                    'rotacao-3d': 'Transição com rotação tridimensional do espaço.'
                };
                transitionBlock = `\nTRANSIÇÃO ENTRE FRAMES:\n- Velocidade: ${transitionSpeed}\n- Estilo: ${speedDescriptions[transitionSpeed] || 'Transição cinematográfica'}`;
            }

            const languageLabel = language === 'en' ? 'ENGLISH' : 'PORTUGUÊS BRASILEIRO';

            const userPrompt = `Crie um prompt ${language === 'en' ? 'em INGLÊS' : 'em PORTUGUÊS BRASILEIRO'} para a plataforma ${platform.name}.

ESPECIFICAÇÕES TÉCNICAS:
- Motion Control: ${motion.label} — ${motion.description}
- Ângulo de Câmera: ${angle.label} — ${angle.technical}
- Iluminação: ${lighting.label} — ${lighting.technical}
- Estilo de Animação: ${animation.label} (${animation.description})
- Estética Visual: ${aesthetic.label} (${aesthetic.description})
- Aspect Ratio: ${aspectRatio}
- Duração: ${duration}
- Resolução: ${resolution}
${advancedBlock}
${transitionBlock}

${imageDescription ? `DESCRIÇÃO DA CENA (baseada na imagem de referência):\n${imageDescription}` : 'NOTA: Prompt baseado apenas em texto, sem imagem de referência. Crie uma cena cinematográfica original que utilize todas as especificações técnicas acima.'}

${imageDescription2 ? `DESCRIÇÃO DO SEGUNDO FRAME:\n${imageDescription2}` : ''}

IDIOMA DE SAÍDA: ${languageLabel}

Agora gere o prompt final. Lembre-se: APENAS o prompt, sem explicações. Máximo ${platform.maxLength} caracteres.`;

            // FIX 1: system e user são SEPARADOS corretamente
            const body = buildTextRequest(provider, systemPrompt, userPrompt);
            const headers = getAuthHeaders(provider, apiKey);

            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(60000),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Generate error:", response.status, errorText);
                if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Aguarde." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const result = getValueByPath(data, provider.response_path || 'choices[0].message.content');
            return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        throw new Error("Ação inválida. Use: analyze, analyze-cross, generate");

    } catch (error) {
        console.error("prompt-generator error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
