import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// SYSTEM PROMPT — replicado do Design Builder (P0 / ZR)
// ============================================================
const SYSTEM_PROMPT = `Você é um Especialista em Prompts de IA. Sua missão é completar a estrutura abaixo para criar imagens de altíssima conversão.

REGRA DE SOBRIEDADE (STYLE RANGE):
O usuário define um nível de sobriedade de 0 a 100.
- Se Sobriedade > 70: Use estética CORPORATIVA, LIMPA, PROFISSIONAL. Iluminação suave/natural (daylight). Evite neons e efeitos dramáticos. Foco em realismo para nichos como advocacia/medicina.
- Se Sobriedade < 30: Use estética CRIATIVA, VIBRANTE, ALTO IMPACTO. Iluminação dramática, contrastes fortes, estilo comercial moderno.

REGRA DE ESTILO (PRESET):
Se o Estilo Escolhido "{estilo_selecionado}" for fornecido, incorpore as características visuais fundamentais desse estilo (ex: texturas, paleta de cores típica, clima artístico) em toda a composição para que a imagem respire esse preset, sem perder a qualidade fotorrealista.

REGRA DE OURO (FIDELIDADE):
O início do prompt é IMUTÁVEL e deve ser EXATAMENTE:
"Create an 8K ultra-realistic cinematic action portrait, format 1080x1440, perfectly replicating the subject's physical traits, facial expression, and overall look from the reference image"

ESTRUTURA OBRIGATÓRIA DO PROMPT (Preencha os [BLOCOS]):

[BASE STRING]: (Insira a frase obrigatória de fidelidade acima).

[NICHE CONTEXT]: 
Se o input '{descricao_sujeito}' for fornecido, USE-O PRIORITARIAMENTE para descrever a roupa e a pose.
Caso contrário, com base no Nicho "{nicho_usuario}", descreva a roupa e a ação.

[STYLE PRESET]:
Se ativado, aplique as diretrizes do estilo "{estilo_selecionado}".

[LIGHTING SETUP]: 
Combine a sobriedade solicitada com: "Cinematic lighting setup, volumetric lighting, dramatic shadows on face."
Se {usar_cor_recorte} for "SIM": Adicione "{cor_recorte} RIM LIGHT".

[BACKGROUND]:
Baseado em '{ambiente_usuario}'.
Se {usar_blur} for "SIM": "Heavy Bokeh/Blur".
Se {usar_cor_fundo} for "SIM": "Tinged with {cor_fundo} at {intensidade_opacidade}% opacity".

[FOREGROUND]:
Se {usar_elementos_flutuantes} for "SIM": Descreva elementos do nicho flutuando.

[SUPPLEMENTARY INSTRUCTIONS]:
Se fornecido, anexe as instruções do usuário EXATAMENTE ao final do prompt: "{instrucoes_adicionais}"

[STYLE FINISH]: "8k resolution, commercial photography aesthetic, shot on 85mm lens f/1.4."

Retorne APENAS o prompt final montado, em inglês.`;

// ============================================================
// Tipos
// ============================================================
export interface GenerationConfig {
    niche: string;
    gender: string;
    subjectDescription?: string;
    environment?: string;
    sobriety: number;
    style?: string;
    useStyle?: boolean;
    colors: {
        ambient: string;
        rim: string;
        complementary: string;
    };
    colorFlags: {
        ambient: boolean;
        rim: boolean;
        complementary: boolean;
    };
    ambientOpacity: number;
    useBlur: boolean;
    useGradient: boolean;
    useFloatingElements: boolean;
    floatingElementsDescription?: string;
    shotType: string;
    additionalInstructions?: string;
    dimension: string;
    safeAreaSide?: 'LEFT' | 'RIGHT' | 'CENTER';
    personCount?: number;
    textOverlay?: {
        h1: string;
        h2: string;
        cta: string;
        position: string;
        useGradient?: boolean;
    };
}

export interface ReferenceImage {
    data: string;
    mimeType: string;
    description?: string;
    category?: 'style' | 'environment';
}

export interface GenerationResult {
    imageBase64: string;
    mimeType: string;
    finalPrompt: string;
}

// ============================================================
// FORENSIC LOG — captura 100% do que influencia a geração
// ============================================================
export interface ForensicRequestSnapshot {
    url: string;
    model: string;
    body: Record<string, any>;
    systemInstruction?: string;
    compositionRules?: string;
    promptFinal?: string;
    timestamp: number;
    attempt: number;
    keyIndex: number;
}

export interface ForensicStepLog {
    step: 'prompt_text' | 'image_generation' | 'inpainting' | 'reframe';
    requests: ForensicRequestSnapshot[];
    responseStatus?: number;
    responseTimeMs?: number;
    error?: string;
}

export interface ForensicLog {
    correlationId: string;
    codepath: 'SDK_GENAI';
    startedAt: number;
    completedAt?: number;
    totalDurationMs?: number;

    // Config de entrada
    inputConfig: GenerationConfig;
    referenceImageCount: number;

    // Provider
    provider: {
        keyCount: number;
        textModel: string;
        imageModel: string;
        cacheHit: boolean;
    };

    // Defaults / hardcoded
    hardcodedValues: {
        sdkVersion: string;
        imageSize: string;
        forcedMimeType: string;
        responseModalities: string;
        outputMimeType: string;
        temperature: string;
        topP: string;
        seed: string;
        maxOutputTokens: string;
        retryConfig: {
            maxRetries: number;
            rounds: number;
            baseDelayMs: number;
        };
    };

    // System prompt completo (expandido)
    systemPromptExpanded: string;

    // Regras de composição aplicadas
    compositionRulesApplied: string[];

    // Etapas
    steps: ForensicStepLog[];

    // Resultado
    success: boolean;
    error?: string;
}

// ============================================================
// Mapeamento de shot types (igual ao concorrente U0)
// ============================================================
const SHOT_TYPES: Record<string, string> = {
    CLOSE_UP: 'Extreme Close-up shot, focusing on facial expressions and eyes, cutting off at the neck/shoulders.',
    MEDIUM: 'Medium Shot (Mid-shot), capturing the subject from the waist up, focusing on body language and expression.',
    AMERICAN: 'American Shot (Cowboy Shot), capturing the subject from the knees up, including hand gestures and posture.',
};

// ============================================================
// Modelos padrão — Gemini 3 (confirmado no HAR do concorrente)
// ============================================================
const DEFAULT_TEXT_MODEL = 'gemini-3-pro-preview';
const DEFAULT_IMAGE_MODEL = 'gemini-3-pro-image-preview';
const SDK_VERSION = '@google/genai@^1.30.0';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// ============================================================
// Calcula aspectRatio (igual ao concorrente)
// ============================================================
function getAspectRatio(dimension: string): string {
    const parts = dimension.toLowerCase().split('x');
    if (parts.length !== 2) return '9:16';
    const w = parseInt(parts[0]);
    const h = parseInt(parts[1]);
    if (!w || !h) return '9:16';
    const ratio = w / h;
    if (Math.abs(ratio - 1) < 0.05) return '1:1';
    if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16';
    if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9';
    if (Math.abs(ratio - 4 / 5) < 0.05) return '4:5';
    if (Math.abs(ratio - 3 / 4) < 0.05) return '3:4';
    if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3';
    return ratio < 1 ? '9:16' : '16:9';
}

// ============================================================
// Monta o user message para a etapa 1 (geração do prompt)
// ============================================================
function buildUserMessage(config: GenerationConfig): string {
    const shotPrompt = SHOT_TYPES[config.shotType] || 'Standard portrait framing';
    const styleLabel = config.useStyle && config.style ? config.style : 'Padrão (Infoproduto)';
    const personCount = config.personCount || 1;

    const multiSubjectBlock = personCount > 1
        ? `\n    VOCÊ DEVE UNIR/MESCLAR ${personCount} PESSOAS NA MESMA CENA.
    - O usuário quer EXATAMENTE ${personCount} pessoas visíveis.
    - Se houver múltiplas fotos de referência, combine-as. Se houver apenas 1 foto mas o pedido for para mais pessoas, duplique ou crie variações consistentes.
    - Não gere sujeitos isolados ou colagens separadas.
    - Posicione-os juntos de forma natural (ex: lado a lado, conversando, ou posando como uma equipe).
    `
        : 'Foque em um único sujeito principal.';

    return `
    INPUTS DO USUÁRIO:
    - Nicho: ${config.niche}
    - Gênero: ${config.gender}
    - Descrição do Sujeito: ${config.subjectDescription || 'Não especificado'}
    - Ambiente Específico: ${config.environment || 'Não especificado'}
    
    ESTILO E TOM:
    - Nível de Sobriedade (0-100): ${config.sobriety} (0=Criativo/Vibrante, 100=Sóbrio/Formal/Limpo)
    - Estilo Escolhido: ${styleLabel}
    - Instruções Adicionais: ${config.additionalInstructions || 'Nenhuma'}
    
    ${config.textOverlay && (config.textOverlay.h1 || config.textOverlay.h2) ? `
    INSERÇÃO DE TEXTO OBRIGATÓRIA:
    O usuário solicitou que a imagem tenha espaço para:
    - "${config.textOverlay.h1}"
    - "${config.textOverlay.h2}"
    - "${config.textOverlay.cta}"
    - Posição: ${config.textOverlay.position}

    CRITICAL INSTRUCTION - TEXT GENERATION:
    You are a visual artist, NOT a writer.
    DO NOT WRITE labels like "H1:", "Header:", "CTA Button:" inside the image.
    ONLY render the CONTENT of the text provided above (e.g. if H1 is "SALE", write "SALE", do not write "H1: SALE").
    If you cannot render perfect text, leave specific negative space.
    
    NEGATIVE PROMPT (TEXT): Avoid writing: "H1", "H2", "CTA", "Header", "Subheader", "Button", "Lorem Ipsum", placeholder text.
    ` : 'Nenhum texto especificado.'}
    
    CONFIGURAÇÃO DE CORES:
    - Usar Cor Fundo: ${config.colorFlags.ambient ? 'SIM' : 'NÃO'} (Cor: ${config.colors.ambient}, Opacidade: ${config.ambientOpacity}%)
    - Usar Cor Recorte: ${config.colorFlags.rim ? 'SIM' : 'NÃO'} (Cor: ${config.colors.rim})
    - Usar Cor Complementar: ${config.colorFlags.complementary ? 'SIM' : 'NÃO'} (Cor: ${config.colors.complementary})
    
    ATRIBUTOS VISUAIS:
    - Usar Blur: ${config.useBlur}
    - Usar Degradê Lateral: ${config.useGradient}
    - Enquadramento: ${shotPrompt}
    - Usar Elementos Flutuantes: ${config.useFloatingElements ? 'SIM' : 'NÃO'}
    - Descrição Elementos Flutuantes: ${config.floatingElementsDescription || 'Auto'}

    INSTRUÇÃO DE SUJEITOS (CRÍTICO):
    Quantidade de Pessoas na Cena: ${personCount}
    ${multiSubjectBlock}
    `;
}

// ============================================================
// Constantes de composição (KR e XR — replicadas do concorrente)
// ============================================================
const KR_BLENDING = 'BLENDING ATTRIBUTE: Apply a soft, seamless GRADIENT FADE on the negative space side. The gradient should use the DOMINANT BACKGROUND COLOR to fade out any complex details, ensuring maximum text readability.';

const XR_RACK_FOCUS = 'DEPTH ATTRIBUTE (RACK FOCUS): First, render the entire image with full sharp details. THEN, overlay a subtle GRADIENT BLUR (Rack Focus effect) that is heaviest on the negative space edge and gradually fades to 0% blur towards the center/subject. The subject must remain 100% sharp. The blur acts as a background softening layer for text overlay.';

function buildCompositionRules(config: GenerationConfig, referenceImages: ReferenceImage[]): string[] {
    const side = config.safeAreaSide || 'CENTER';
    const parts = config.dimension.split('x');
    const w = parseInt(parts[0]) || 1920;
    const h = parseInt(parts[1]) || 800;
    const rules: string[] = [];

    // Style references com description individual (lógica exata do concorrente)
    const styleRefs = referenceImages.filter(r => r.category === 'style' || !r.category);
    const envRefs = referenceImages.filter(r => r.category === 'environment');
    if (styleRefs.length > 0) {
        const withDesc = styleRefs.filter(r => r.description?.trim());
        if (withDesc.length > 0) {
            const descList = withDesc.map(r => `- ${r.description}`).join('\n');
            rules.push(`STYLE REFERENCES: Use the provided reference images with these specific instructions:\n${descList}\nBlend these elements with the requested ${config.niche} theme.`);
        } else {
            rules.push(`STYLE REFERENCES: Use the provided reference images as style inspiration and blend these elements with the requested ${config.niche} theme.`);
        }
    }
    if (envRefs.length > 0) {
        rules.push('ENVIRONMENT INSTRUCTION: Use the provided environment images to understand the architectural style/texture of the background, but render it according to the requested blur/sharpness settings.');
    }

    // Sobriety adjustment
    if (config.sobriety > 70) {
        rules.push('ADJUSTMENT: Prioritize clean textures, professional environment, and neutral skin tones. Avoid lens flares and neon.');
    }

    // Safe area rule
    rules.push(`SAFE AREA RULE: Maintain a significant margin of exactly 10% of the total canvas width on the ${side} side. The subject must NOT be clipped or touch the extreme edge; they should be positioned with breathing room for UI elements.`);

    // Critical composition rule
    rules.push(`CRITICAL COMPOSITION RULE: This image must be composed as an ULTRA-WIDE CINEMATIC HEADER. The intended view area is ${w}x${h}. Center all critical action and the subject's face vertically so they are not cut off. Use the full horizontal space for environment storytelling.`);

    // Composition rule por posição (JR do concorrente)
    if (side === 'LEFT') {
        rules.push('COMPOSITION RULE: Position the subject centered specifically between the left edge and the vertical center line (approx. at the 25% horizontal mark). The subject should NOT be touching the edge.\n\nNEGATIVE SPACE RULE: The entire RIGHT side (from center to right edge) must be kept open for text.');
    } else if (side === 'RIGHT') {
        rules.push('COMPOSITION RULE: Position the subject centered specifically between the vertical center line and the right edge (approx. at the 75% horizontal mark). The subject should NOT be touching the edge.\n\nNEGATIVE SPACE RULE: The entire LEFT side (from left edge to center) must be kept open for text.');
    } else {
        rules.push('COMPOSITION RULE: Position the subject strictly in the geometric center of the image. Balance the negative space equally on both sides.');
    }

    // KR — BLENDING ATTRIBUTE
    if (config.useGradient) {
        rules.push(KR_BLENDING);
    }

    // XR — DEPTH ATTRIBUTE / RACK FOCUS
    if (config.useBlur) {
        rules.push(XR_RACK_FOCUS);
    }

    // TEXT LAYOUT REQUIREMENT (lógica exata do concorrente)
    if (config.textOverlay && (config.textOverlay.h1 || config.textOverlay.h2)) {
        rules.push(`TEXT LAYOUT REQUIREMENT:
      The image MUST include the following text rendered in a high-quality, readable font matching the style:
      - HEADER: "${config.textOverlay.h1}"
      - SUBHEADER: "${config.textOverlay.h2}"
      - BUTTON: "${config.textOverlay.cta}"
      
      POSITION: Place text on the ${config.textOverlay.position}.
      ${config.textOverlay.useGradient ? 'BACKGROUND: Add a subtle gradient/scrim behind the text area to ensure readability.' : ''}
      Ensure the text does not overlap the subject's face.`);
    }

    return rules;
}

// ============================================================
// SDK Key Pool com retry (replicado do concorrente Bs())
// ============================================================
async function callWithKeyPool<T>(
    keys: string[],
    fn: (apiKey: string, keyIndex: number, attempt: number) => Promise<T>,
    maxRetries = 2,
    rounds = 1,
    baseDelay = 3000
): Promise<T> {
    if (keys.length === 0) throw new Error('Nenhuma API key disponível.');

    // Se só tem 1 key, tenta direto sem pool
    if (keys.length === 1) {
        return fn(keys[0], 0, 0);
    }

    // Embaralha as keys aleatoriamente (igual concorrente)
    const shuffled = [...keys].sort(() => 0.5 - Math.random());

    let globalAttempt = 0;
    for (let round = 0; round < rounds; round++) {
        for (let ki = 0; ki < shuffled.length; ki++) {
            const key = shuffled[ki];
            for (let retry = 0; retry < maxRetries; retry++) {
                try {
                    return await fn(key, ki, globalAttempt++);
                } catch (err: any) {
                    const msg = err?.message || '';
                    const status = err?.status || err?.httpCode || 0;
                    const is429 =
                        msg.includes('429') || status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
                    const is5xx =
                        msg.includes('503') || msg.includes('500') || status === 503 || status === 500 ||
                        msg.includes('SERVICE_UNAVAILABLE') || msg.includes('UNAVAILABLE') || msg.includes('INTERNAL') ||
                        msg.includes('overloaded') || msg.includes('temporarily') ||
                        (status >= 500 && status < 600);
                    const isRetryable = is429 || is5xx;
                    if (!isRetryable) throw err;
                    console.warn(`[KeyPool] Key ${ki + 1}/${shuffled.length} falhou (${status || msg.substring(0, 60)}), tentando próxima...`);

                    if (is5xx) {
                        // Erro de servidor → pular DIRETO pra próxima key, sem delay
                        break;
                    }
                    // Erro 429 (rate limit) → delay curto antes de retry na mesma key
                    if (retry < maxRetries - 1) {
                        const delay = baseDelay * Math.pow(1.5, retry);
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
            }
        }
    }

    throw new Error('Todas as chaves do pool falharam após múltiplas tentativas. Tente novamente em alguns minutos.');
}

// ============================================================
// Gera ID de correlação único
// ============================================================
function generateCorrelationId(): string {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `gen_${ts}_${rand}`;
}

// ============================================================
// Hook principal — Migrado para SDK @google/genai
// ============================================================
export function useGeminiImageGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState('');
    const [lastForensicLog, setLastForensicLog] = useState<ForensicLog | null>(null);

    // Guard de concorrência
    const generationRef = useRef(false);

    // Cache do provider data com TTL
    const providerCache = useRef<{
        keys: string[];
        textModel: string;
        imageModel: string;
        fetchedAt: number;
    } | null>(null);

    // ============================================================
    // Busca as API keys e modelos do Supabase (com cache + TTL)
    // ============================================================
    const getProviderData = useCallback(async () => {
        // Cache com TTL de 5 minutos
        if (providerCache.current && Date.now() - providerCache.current.fetchedAt < CACHE_TTL_MS) {
            return { ...providerCache.current, cacheHit: true };
        }

        const { data: rows, error } = await (supabase
            .from('ai_providers') as any)
            .select('api_key_encrypted, model_name, system_prompt')
            .eq('slug', 'designer-do-futuro')
            .eq('is_active', true)
            .limit(1);

        if (error) {
            console.error('[getProviderData] Erro ao buscar provider:', error);
        }

        const data = rows?.[0] || null;
        const keys: string[] = [];
        let textModel = DEFAULT_TEXT_MODEL;
        let imageModel = DEFAULT_IMAGE_MODEL;

        if (data) {
            imageModel = data.model_name || DEFAULT_IMAGE_MODEL;

            if (data.api_key_encrypted) {
                keys.push(data.api_key_encrypted);
            }

            if (data.system_prompt) {
                try {
                    const meta = JSON.parse(data.system_prompt);
                    if (meta.model_text) textModel = meta.model_text;
                    if (meta.api_keys && Array.isArray(meta.api_keys)) {
                        for (const k of meta.api_keys) {
                            if (k && typeof k === 'string' && !keys.includes(k)) {
                                keys.push(k);
                            }
                        }
                    }
                } catch {
                    // system_prompt não é JSON, ignorar
                }
            }
        }

        if (keys.length === 0) {
            throw new Error('Nenhuma API key configurada. Vá em Provedores IA > Designer do Futuro e adicione suas keys.');
        }

        const result = { keys, textModel, imageModel, fetchedAt: Date.now() };
        providerCache.current = result;
        return { ...result, cacheHit: false };
    }, []);

    // ============================================================
    // Etapa 1: Gera o prompt de texto via SDK (systemInstruction)
    // ============================================================
    const generatePromptText = useCallback(async (
        keys: string[],
        textModel: string,
        config: GenerationConfig,
        styleLabel: string,
        forensicSteps: ForensicStepLog[]
    ): Promise<string> => {
        const userMessage = buildUserMessage(config);
        const systemPrompt = SYSTEM_PROMPT.replace(/{estilo_selecionado}/g, styleLabel);

        const stepLog: ForensicStepLog = {
            step: 'prompt_text',
            requests: [],
        };

        const result = await callWithKeyPool(keys, async (apiKey, keyIndex, attempt) => {
            const genAI = new GoogleGenAI({ apiKey });

            // FORENSIC: captura request ANTES de enviar
            stepLog.requests.push({
                url: `SDK:${textModel}`,
                model: textModel,
                body: {
                    systemInstruction: `[SYSTEM PROMPT — ${systemPrompt.length} chars]`,
                    contents: `[USER MESSAGE — ${userMessage.length} chars]`,
                },
                systemInstruction: systemPrompt,
                promptFinal: userMessage,
                timestamp: Date.now(),
                attempt,
                keyIndex,
            });

            const startTime = Date.now();
            const response = await genAI.models.generateContent({
                model: textModel,
                contents: userMessage,
                config: {
                    systemInstruction: systemPrompt,
                },
            });

            stepLog.responseTimeMs = Date.now() - startTime;
            stepLog.responseStatus = 200;

            const text = response.text;
            if (!text) throw new Error('Nenhum prompt retornado pela API.');
            return text.trim();
        });

        forensicSteps.push(stepLog);
        return result;
    }, []);

    // ============================================================
    // Etapa 2: Gera a imagem via SDK — imageSize 2K (igual concorrente)
    // ============================================================
    const generateImage = useCallback(async (
        keys: string[],
        imageModel: string,
        finalPrompt: string,
        config: GenerationConfig,
        referenceImages: ReferenceImage[],
        compositionRulesArr: string[],
        forensicSteps: ForensicStepLog[]
    ): Promise<{ imageBase64: string; mimeType: string }> => {
        const aspectRatio = getAspectRatio(config.dimension);
        const compositionRules = compositionRulesArr.join('\n\n');
        const fullPrompt = `${finalPrompt}\n\n${compositionRules}`;

        const stepLog: ForensicStepLog = {
            step: 'image_generation',
            requests: [],
        };

        const result = await callWithKeyPool(keys, async (apiKey, keyIndex, attempt) => {
            const genAI = new GoogleGenAI({ apiKey });

            // Monta as parts: imagens primeiro, depois o texto (igual concorrente)
            const contentParts: any[] = [];
            for (const img of referenceImages) {
                contentParts.push({
                    inlineData: {
                        data: img.data.replace(/^data:[^,]+,/, ''),
                        mimeType: 'image/png', // ✅ Força PNG (igual concorrente)
                    }
                });
            }
            contentParts.push({ text: fullPrompt });

            // FORENSIC: captura request ANTES de enviar
            stepLog.requests.push({
                url: `SDK:${imageModel}`,
                model: imageModel,
                body: {
                    contents: [
                        ...referenceImages.map((_, i) => ({ inlineData: `[IMAGE_REF_${i} — base64 redacted]` })),
                        { text: `[PROMPT — ${fullPrompt.length} chars]` }
                    ],
                    config: {
                        imageConfig: { aspectRatio, imageSize: '2K' },
                    },
                },
                compositionRules,
                promptFinal: fullPrompt,
                timestamp: Date.now(),
                attempt,
                keyIndex,
            });

            const startTime = Date.now();

            // ✅ SDK call — igual ao concorrente (jR function)
            // Sem responseModalities, sem outputMimeType — concorrente NÃO usa
            const response = await genAI.models.generateContent({
                model: imageModel,
                contents: contentParts,
                config: {
                    imageConfig: {
                        aspectRatio,
                        imageSize: '4K', // ✅ 4K (confirmado no bundle do concorrente)
                    },
                },
            });

            stepLog.responseTimeMs = Date.now() - startTime;
            stepLog.responseStatus = 200;

            // Procura imagem na resposta
            const candidates = response.candidates;
            if (!candidates?.length) throw new Error('Nenhum candidato retornado pela API.');

            for (const part of candidates[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return {
                        imageBase64: part.inlineData.data || '',
                        mimeType: part.inlineData.mimeType || 'image/png',
                    };
                }
            }

            throw new Error('Nenhuma imagem encontrada na resposta da API.');
        });

        forensicSteps.push(stepLog);
        return result;
    }, []);

    // ============================================================
    // Inpainting — KR (igual concorrente: edição com máscara binária)
    // PRETO = área para editar, BRANCO = manter original
    // ============================================================
    const inpaintImage = useCallback(async (
        originalImageBase64: string,
        maskBase64: string,
        editPrompt: string,
        referenceConfig?: { dimension?: string }
    ): Promise<{ imageBase64: string; mimeType: string }> => {
        if (generationRef.current) {
            throw new Error('Já existe uma geração em andamento. Aguarde.');
        }
        generationRef.current = true;
        setIsGenerating(true);
        setProgress('✨ Preparando a mágica...');

        try {
            const providerResult = await getProviderData();
            const { keys, imageModel } = providerResult;

            const aspectRatio = referenceConfig?.dimension
                ? getAspectRatio(referenceConfig.dimension)
                : '9:16';

            const result = await callWithKeyPool(keys, async (apiKey) => {
                const genAI = new GoogleGenAI({ apiKey });

                setProgress('🎨 Refinando os detalhes...');

                // ✅ Inpainting via SDK — imagem original + máscara + prompt
                const response = await genAI.models.generateContent({
                    model: imageModel,
                    contents: [
                        {
                            inlineData: {
                                data: originalImageBase64.replace(/^data:[^,]+,/, ''),
                                mimeType: 'image/png',
                            }
                        },
                        {
                            inlineData: {
                                data: maskBase64.replace(/^data:[^,]+,/, ''),
                                mimeType: 'image/png',
                            }
                        },
                        {
                            text: `${maskBase64 ? 'INPAINTING TASK: Edit ONLY the masked areas of the first image.' : 'IMAGE REFINEMENT TASK: Apply the requested changes to the first image.'} Instructions: ${editPrompt}. 

${maskBase64 ? 'MASK INTERPRETATION: The second image is a binary mask - BLACK pixels indicate areas to edit, WHITE pixels must remain COMPLETELY UNCHANGED.' : ''}

CRITICAL OUTPUT REQUIREMENTS:
- PRESERVE the EXACT same image dimensions and aspect ratio as the original
- DO NOT add white borders, padding, or margins around the image
- DO NOT crop or resize the image - maintain pixel-perfect dimensions
- Output must be edge-to-edge with no empty space

${maskBase64 ? `STRICT PRESERVATION RULES:
- DO NOT alter any pixels outside the masked area
- DO NOT change lighting, shadows, or reflections in unmasked areas  
- DO NOT modify the subject's face, pose, or clothing unless specifically in the masked region
- DO NOT change the background composition, colors, or textures outside the mask
- DO NOT add new elements outside the masked area` : ''}

EDIT SCOPE: Apply changes ONLY within the designated edit area.` },
                    ],
                    config: {
                        imageConfig: {
                            aspectRatio,
                            imageSize: '2K',
                        },
                    },
                });

                const candidates = response.candidates;
                if (!candidates?.length) throw new Error('Inpainting: sem resultado.');

                for (const part of candidates[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        return {
                            imageBase64: part.inlineData.data || '',
                            mimeType: part.inlineData.mimeType || 'image/png',
                        };
                    }
                }
                throw new Error('Inpainting: nenhuma imagem na resposta.');
            });

            setProgress('🎉 Mágica concluída!');
            return result;
        } finally {
            setIsGenerating(false);
            generationRef.current = false;
        }
    }, [getProviderData]);

    // ============================================================
    // Reframe/Outpainting — XR (igual concorrente: expansão da imagem)
    // ============================================================
    const reframeImage = useCallback(async (
        originalImageBase64: string,
        targetAspectRatio: string,
        direction: 'vertical' | 'horizontal' = 'vertical'
    ): Promise<{ imageBase64: string; mimeType: string }> => {
        if (generationRef.current) {
            throw new Error('Já existe uma geração em andamento. Aguarde.');
        }
        generationRef.current = true;
        setIsGenerating(true);
        setProgress('✨ Preparando a mágica...');

        try {
            const providerResult = await getProviderData();
            const { keys, imageModel } = providerResult;

            const result = await callWithKeyPool(keys, async (apiKey) => {
                const genAI = new GoogleGenAI({ apiKey });

                setProgress('🖼️ Expandindo a arte...');

                const directionPrompt = direction === 'vertical'
                    ? 'Expand this image VERTICALLY (top and bottom) to fill the new aspect ratio. Seamlessly extend the background, maintaining consistency in lighting, style, and environment. Do NOT alter the original content.'
                    : 'Expand this image HORIZONTALLY (left and right) to fill the new aspect ratio. Seamlessly extend the background, maintaining consistency in lighting, style, and environment. Do NOT alter the original content.';

                const response = await genAI.models.generateContent({
                    model: imageModel,
                    contents: [
                        {
                            inlineData: {
                                data: originalImageBase64.replace(/^data:[^,]+,/, ''),
                                mimeType: 'image/png',
                            }
                        },
                        { text: `REFRAME/OUTPAINTING: ${directionPrompt}\n\nTarget aspect ratio: ${targetAspectRatio}` },
                    ],
                    config: {
                        imageConfig: {
                            aspectRatio: targetAspectRatio,
                            imageSize: '2K',
                        },
                    },
                });

                const candidates = response.candidates;
                if (!candidates?.length) throw new Error('Reframe: sem resultado.');

                for (const part of candidates[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        return {
                            imageBase64: part.inlineData.data || '',
                            mimeType: part.inlineData.mimeType || 'image/png',
                        };
                    }
                }
                throw new Error('Reframe: nenhuma imagem na resposta.');
            });

            setProgress('🎉 Mágica concluída!');
            return result;
        } finally {
            setIsGenerating(false);
            generationRef.current = false;
        }
    }, [getProviderData]);

    // ============================================================
    // Prompt Extractor — Analisa referência visual (igual concorrente)
    // ============================================================
    const extractPromptFromImage = useCallback(async (
        imageBase64: string
    ): Promise<{
        pose: string;
        clothing: string;
        lighting: string;
        cameraAngle: string;
        suggestedPrompt: string;
    }> => {
        const providerResult = await getProviderData();
        const { keys, textModel } = providerResult;

        const systemInstruction = `FOCO NO PERSONAGEM — /personagem. Geração de prompt baseada na referência visual enviada, extraindo: [Pose], [Roupa e textura do tecido], [Iluminação da cena], [Ângulo/tipo de câmera].
Atenção: nunca deve extrair características físicas do rosto ou corpo do personagem (ex: gênero, cor de pele, cabelo, rosto).
Retorne um JSON com os campos: pose, clothing, lighting, cameraAngle, suggestedPrompt.`;

        const result = await callWithKeyPool(keys, async (apiKey) => {
            const genAI = new GoogleGenAI({ apiKey });

            const imageData = imageBase64.replace(/^data:[^,]+,/, '');

            const response = await genAI.models.generateContent({
                model: textModel,
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    data: imageData,
                                    mimeType: 'image/png',
                                },
                            },
                            {
                                text: 'Analise esta imagem de referência e extraia as informações solicitadas.',
                            },
                        ],
                    },
                ],
                config: {
                    systemInstruction,
                },
            });

            const text = response.text || '';
            console.log('[ExtractRef] Response text:', text?.substring(0, 200));
            try {
                // Tenta parsear JSON
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch {
                // Se não é JSON válido, retorna estrutura manual
                console.warn('[ExtractRef] Falhou ao parsear JSON da resposta');
            }

            return {
                pose: 'Não identificada',
                clothing: 'Não identificada',
                lighting: 'Não identificada',
                cameraAngle: 'Não identificado',
                suggestedPrompt: text,
            };
        });

        return result;
    }, [getProviderData]);

    // ============================================================
    // Creative Assistant — Brainstorming de cenários (igual concorrente)
    // ============================================================
    const brainstormScenes = useCallback(async (
        niche: string,
        style: string
    ): Promise<string[]> => {
        const providerResult = await getProviderData();
        const { keys, textModel } = providerResult;

        const systemInstruction = `You are a creative design assistant. Help the user brainstorm concepts for landing page backgrounds. Focus on aesthetics, color psychology, and composition rules for web design (negative space for text).
Be concise and professional.
Return a JSON array of exactly 5 scene descriptions in Portuguese (Brazil). Each description should be 1-2 sentences.`;

        const result = await callWithKeyPool(keys, async (apiKey) => {
            const genAI = new GoogleGenAI({ apiKey });

            const response = await genAI.models.generateContent({
                model: textModel,
                contents: `Nicho: ${niche}\nEstilo visual: ${style}\n\nSugira 5 cenários criativos para background de landing page.`,
                config: {
                    systemInstruction,
                },
            });

            const text = response.text || '';
            try {
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch {
                // fallback
            }

            // Se não parseou JSON, divide por linhas
            return text.split('\n').filter(l => l.trim().length > 10).slice(0, 5);
        });

        return result;
    }, [getProviderData]);

    // ============================================================
    // Função principal de geração (2 etapas) — com ForensicLog via SDK
    // ============================================================
    const generate = useCallback(async (
        config: GenerationConfig,
        referenceImages: ReferenceImage[] = []
    ): Promise<GenerationResult> => {
        // Guard de concorrência
        if (generationRef.current) {
            throw new Error('Já existe uma geração em andamento. Aguarde.');
        }
        generationRef.current = true;

        setIsGenerating(true);
        setProgress('✨ Criando a mágica...');

        // [PATH-ACTIVE] Prova que o hook SDK é o caminho único ativo
        console.log('[PATH-ACTIVE] useGeminiImageGeneration.generate() — hook-sdk-direct | Edge Function NÃO utilizada');

        const correlationId = generateCorrelationId();
        const startedAt = Date.now();
        const forensicSteps: ForensicStepLog[] = [];

        try {
            const providerResult = await getProviderData();
            const { keys, textModel, imageModel } = providerResult;

            const styleLabel = config.useStyle && config.style ? config.style : 'Standard premium commercial';
            const systemPromptExpanded = SYSTEM_PROMPT.replace(/{estilo_selecionado}/g, styleLabel);
            const compositionRulesArr = buildCompositionRules(config, referenceImages);

            // Etapa 1: Gera o prompt refinado via SDK
            setProgress('🎨 Gerando a mágica...');
            const finalPrompt = await generatePromptText(keys, textModel, config, styleLabel, forensicSteps);

            // Etapa 2: Gera a imagem via SDK com 2K
            setProgress('🖼️ Gerando sua imagem...');
            const { imageBase64, mimeType } = await generateImage(
                keys,
                imageModel,
                finalPrompt,
                config,
                referenceImages,
                compositionRulesArr,
                forensicSteps
            );

            const completedAt = Date.now();
            setProgress('🎉 Mágica concluída!');

            // FORENSIC: montar log completo
            const forensicLog: ForensicLog = {
                correlationId,
                codepath: 'SDK_GENAI',
                startedAt,
                completedAt,
                totalDurationMs: completedAt - startedAt,
                inputConfig: config,
                referenceImageCount: referenceImages.length,
                provider: {
                    keyCount: keys.length,
                    textModel,
                    imageModel,
                    cacheHit: providerResult.cacheHit,
                },
                hardcodedValues: {
                    sdkVersion: SDK_VERSION,
                    imageSize: '2K',
                    forcedMimeType: 'image/png (todas as refs)',
                    responseModalities: 'NÃO USADO (SDK default)',
                    outputMimeType: 'NÃO USADO (SDK default)',
                    temperature: 'NÃO DEFINIDO (default API)',
                    topP: 'NÃO DEFINIDO (default API)',
                    seed: 'NÃO USADO',
                    maxOutputTokens: 'NÃO DEFINIDO (default API)',
                    retryConfig: {
                        maxRetries: 3,
                        rounds: 2,
                        baseDelayMs: 7000,
                    },
                },
                systemPromptExpanded,
                compositionRulesApplied: compositionRulesArr,
                steps: forensicSteps,
                success: true,
            };

            setLastForensicLog(forensicLog);
            return { imageBase64, mimeType, finalPrompt };

        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            const completedAt = Date.now();

            const forensicLog: ForensicLog = {
                correlationId,
                codepath: 'SDK_GENAI',
                startedAt,
                completedAt,
                totalDurationMs: completedAt - startedAt,
                inputConfig: config,
                referenceImageCount: referenceImages.length,
                provider: {
                    keyCount: 0,
                    textModel: DEFAULT_TEXT_MODEL,
                    imageModel: DEFAULT_IMAGE_MODEL,
                    cacheHit: false,
                },
                hardcodedValues: {
                    sdkVersion: SDK_VERSION,
                    imageSize: '2K',
                    forcedMimeType: 'image/png (todas as refs)',
                    responseModalities: 'NÃO USADO (SDK default)',
                    outputMimeType: 'NÃO USADO (SDK default)',
                    temperature: 'NÃO DEFINIDO (default API)',
                    topP: 'NÃO DEFINIDO (default API)',
                    seed: 'NÃO USADO',
                    maxOutputTokens: 'NÃO DEFINIDO (default API)',
                    retryConfig: { maxRetries: 3, rounds: 2, baseDelayMs: 7000 },
                },
                systemPromptExpanded: SYSTEM_PROMPT,
                compositionRulesApplied: [],
                steps: forensicSteps,
                success: false,
                error: msg,
            };

            setLastForensicLog(forensicLog);
            throw new Error(msg);
        } finally {
            setIsGenerating(false);
            setProgress('');
            generationRef.current = false;
        }
    }, [getProviderData, generatePromptText, generateImage]);

    return {
        generate,
        inpaintImage,
        reframeImage,
        extractPromptFromImage,
        brainstormScenes,
        isGenerating,
        progress,
        lastForensicLog,
    };
}
