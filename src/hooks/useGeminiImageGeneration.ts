import { useState, useCallback, useRef } from 'react';
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
}

export interface ReferenceImage {
    data: string;
    mimeType: string;
}

export interface GenerationResult {
    imageBase64: string;
    mimeType: string;
    finalPrompt: string;
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
const API_VERSION = 'v1beta';

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
    
    Nenhum texto especificado.
    
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
// Monta regras de composição para a etapa 2 (igual concorrente)
// ============================================================
function buildCompositionRules(config: GenerationConfig, referenceImages: ReferenceImage[]): string {
    const side = config.safeAreaSide || 'CENTER';
    const parts = config.dimension.split('x');
    const w = parseInt(parts[0]) || 1920;
    const h = parseInt(parts[1]) || 800;
    const rules: string[] = [];

    // Style references (se tiver imagens de referência)
    if (referenceImages.length > 1) {
        rules.push(`STYLE REFERENCES: Use the provided reference images as style inspiration and blend these elements with the requested ${config.niche} theme.`);
    }

    // Sobriety adjustment (igual concorrente: sobriety > 70)
    if (config.sobriety > 70) {
        rules.push('ADJUSTMENT: Prioritize clean textures, professional environment, and neutral skin tones. Avoid lens flares and neon.');
    }

    // Safe area rule
    rules.push(`SAFE AREA RULE: Maintain a significant margin of exactly 10% of the total canvas width on the ${side} side. The subject must NOT be clipped or touch the extreme edge; they should be positioned with breathing room for UI elements.`);

    // Critical composition rule (ultra-wide header)
    rules.push(`CRITICAL COMPOSITION RULE: This image must be composed as an ULTRA-WIDE CINEMATIC HEADER. The intended view area is ${w}x${h}. Center all critical action and the subject's face vertically so they are not cut off. Use the full horizontal space for environment storytelling.`);

    // Composition rule por posição (igual JR do concorrente)
    if (side === 'LEFT') {
        rules.push('COMPOSITION RULE: Position the subject centered specifically between the left edge and the vertical center line (approx. at the 25% horizontal mark). The subject should NOT be touching the edge.\n\nNEGATIVE SPACE RULE: The entire RIGHT side (from center to right edge) must be kept open for text.');
    } else if (side === 'RIGHT') {
        rules.push('COMPOSITION RULE: Position the subject centered specifically between the vertical center line and the right edge (approx. at the 75% horizontal mark). The subject should NOT be touching the edge.\n\nNEGATIVE SPACE RULE: The entire LEFT side (from left edge to center) must be kept open for text.');
    } else {
        rules.push('COMPOSITION RULE: Position the subject strictly in the geometric center of the image. Balance the negative space equally on both sides.');
    }

    return rules.join('\n\n');
}

// ============================================================
// Pool de API Keys com retry (replicado do concorrente Bs())
// ============================================================
async function callWithKeyPool<T>(
    keys: string[],
    fn: (apiKey: string) => Promise<T>,
    maxRetries = 3,
    rounds = 2,
    baseDelay = 7000
): Promise<T> {
    if (keys.length === 0) throw new Error('Nenhuma API key disponível.');

    // Se só tem 1 key, tenta direto sem pool
    if (keys.length === 1) {
        return fn(keys[0]);
    }

    // Embaralha as keys aleatoriamente (igual concorrente)
    const shuffled = [...keys].sort(() => 0.5 - Math.random());

    for (let round = 0; round < rounds; round++) {
        for (const key of shuffled) {
            for (let retry = 0; retry < maxRetries; retry++) {
                try {
                    return await fn(key);
                } catch (err: any) {
                    const msg = err?.message || '';
                    const is429 = msg.includes('429') || err?.status === 429 || msg.includes('quota');
                    if (!is429) throw err; // Erro real, não rate limit
                    if (retry < maxRetries - 1) {
                        const delay = baseDelay * Math.pow(2, retry);
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
            }
        }
    }

    throw new Error('Todas as chaves do pool falharam após múltiplas tentativas. Tente novamente em alguns minutos.');
}

// ============================================================
// Hook principal
// ============================================================
export function useGeminiImageGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState('');

    // Cache do provider data
    const providerCache = useRef<{
        keys: string[];
        textModel: string;
        imageModel: string;
    } | null>(null);

    // ============================================================
    // Busca as API keys e modelos do Supabase (com cache)
    // ============================================================
    const getProviderData = useCallback(async () => {
        if (providerCache.current) return providerCache.current;

        const { data, error } = await (supabase
            .from('ai_providers') as any)
            .select('api_key_encrypted, model_name, system_prompt')
            .eq('slug', 'designer-do-futuro')
            .eq('is_active', true)
            .limit(1)
            .single();

        // Extrair keys e modelos
        const keys: string[] = [];
        let textModel = DEFAULT_TEXT_MODEL;
        let imageModel = DEFAULT_IMAGE_MODEL;

        if (data) {
            imageModel = data.model_name || DEFAULT_IMAGE_MODEL;

            // A key principal vem de api_key_encrypted
            if (data.api_key_encrypted) {
                keys.push(data.api_key_encrypted);
            }

            // Keys extras e model_text são armazenados no system_prompt como JSON
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

        // Se não tem nenhuma key configurada, orientar o usuário
        if (keys.length === 0) {
            throw new Error('Nenhuma API key configurada. Vá em Provedores IA > Designer do Futuro e adicione suas keys.');
        }

        const result = { keys, textModel, imageModel };
        providerCache.current = result;
        return result;
    }, []);

    // ============================================================
    // Etapa 1: Gera o prompt de texto via systemInstruction
    // (usa config: { systemInstruction } igual ao SDK do concorrente)
    // ============================================================
    const generatePromptText = useCallback(async (
        keys: string[],
        textModel: string,
        config: GenerationConfig,
        styleLabel: string
    ): Promise<string> => {
        const userMessage = buildUserMessage(config);

        // Substituir placeholder no system prompt
        const systemPrompt = SYSTEM_PROMPT.replace(/{estilo_selecionado}/g, styleLabel);

        return callWithKeyPool(keys, async (apiKey) => {
            const body = {
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [
                    { role: 'user', parts: [{ text: userMessage }] }
                ],
                generationConfig: {}
            };

            const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${textModel}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const msg = err?.error?.message || response.statusText;
                if (response.status === 429) throw new Error('429: ' + msg);
                throw new Error(`Erro ao gerar prompt: ${msg}`);
            }

            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Nenhum prompt retornado pela API.');
            return text.trim();
        });
    }, []);

    // ============================================================
    // Etapa 2: Gera a imagem com imageConfig (SEM responseModalities)
    // ============================================================
    const generateImage = useCallback(async (
        keys: string[],
        imageModel: string,
        finalPrompt: string,
        config: GenerationConfig,
        referenceImages: ReferenceImage[]
    ): Promise<{ imageBase64: string; mimeType: string }> => {
        const aspectRatio = getAspectRatio(config.dimension);
        const compositionRules = buildCompositionRules(config, referenceImages);
        const fullPrompt = `${finalPrompt}\n\n${compositionRules}`;

        return callWithKeyPool(keys, async (apiKey) => {
            // Monta as parts: imagens primeiro, depois o texto (igual concorrente)
            const parts: any[] = [];
            for (const img of referenceImages) {
                parts.push({
                    inlineData: {
                        data: img.data.replace(/^data:[^,]+,/, ''),
                        mimeType: img.mimeType
                    }
                });
            }
            parts.push({ text: fullPrompt });

            const body = {
                contents: { parts },
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {
                        aspectRatio,
                        imageSize: '2K',
                    },
                },
            };

            const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${imageModel}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const msg = err?.error?.message || response.statusText;
                if (response.status === 429) throw new Error('429: ' + msg);
                throw new Error(`Erro ao gerar imagem: ${msg}`);
            }

            const result = await response.json();
            const candidates = result?.candidates;
            if (!candidates?.length) throw new Error('Nenhum candidato retornado pela API.');

            for (const part of candidates[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return {
                        imageBase64: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png',
                    };
                }
            }

            throw new Error('Nenhuma imagem encontrada na resposta da API.');
        });
    }, []);

    // ============================================================
    // Função principal de geração (2 etapas)
    // ============================================================
    const generate = useCallback(async (
        config: GenerationConfig,
        referenceImages: ReferenceImage[] = []
    ): Promise<GenerationResult> => {
        setIsGenerating(true);
        setProgress('Conectando...');

        try {
            const { keys, textModel, imageModel } = await getProviderData();

            const styleLabel = config.useStyle && config.style ? config.style : 'Standard premium commercial';

            // Etapa 1: Gera o prompt refinado
            setProgress('Montando prompt...');
            const finalPrompt = await generatePromptText(keys, textModel, config, styleLabel);

            // Etapa 2: Gera a imagem
            setProgress('Gerando imagem...');
            const { imageBase64, mimeType } = await generateImage(
                keys,
                imageModel,
                finalPrompt,
                config,
                referenceImages
            );

            setProgress('Concluído!');
            return { imageBase64, mimeType, finalPrompt };

        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            throw new Error(msg);
        } finally {
            setIsGenerating(false);
        }
    }, [getProviderData, generatePromptText, generateImage]);

    return { generate, isGenerating, progress };
}
