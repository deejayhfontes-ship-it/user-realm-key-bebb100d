// ============================================================
// CONSTANTES — Designer do Futuro (Edge Function)
// Portado de src/config/constants.js
// ============================================================

// ---- ESTILOS ----
export const STYLES = [
    { id: "classic", label: "Clássico" },
    { id: "formal", label: "Formal" },
    { id: "elegant", label: "Elegante" },
    { id: "sexy", label: "Sexy" },
    { id: "institutional", label: "Institucional" },
    { id: "tech", label: "Tecnológico" },
    { id: "glassmorphism", label: "Glassmorphism" },
    { id: "ui_interface", label: "Interface UI" },
    { id: "minimalist", label: "Minimalista" },
    { id: "playful", label: "Lúdico" },
    { id: "cartoon", label: "Cartoon" },
    { id: "infoproduct", label: "Infoproduto" },
    { id: "jovial", label: "Jovial" },
    { id: "gamer", label: "Gamer" },
    { id: "pro_portrait", label: "Retrato Profissional" },
    { id: "ultra_realistic", label: "Ultra Realista" },
    { id: "glow", label: "Glow" },
];

// ---- ENQUADRAMENTOS ----
export const FRAMINGS = [
    {
        id: "CLOSE_UP",
        label: "Close-up (Rosto)",
        prompt:
            "Extreme Close-up shot, focusing on facial expressions and eyes, cutting off at the neck/shoulders.",
    },
    {
        id: "MEDIUM",
        label: "Plano Médio (Busto)",
        prompt:
            "Medium Shot (Mid-shot), capturing the subject from the waist up, focusing on body language and expression.",
    },
    {
        id: "AMERICAN",
        label: "Plano Americano",
        prompt:
            "American Shot (Cowboy Shot), capturing the subject from the knees up, including hand gestures and posture.",
    },
];

// ---- DIMENSÕES ----
export const DIMENSIONS = [
    { id: "stories", label: "Stories (9:16)", width: 1080, height: 1920 },
    { id: "horizontal_16_9", label: "Horizontal (16:9)", width: 2752, height: 1536 },
    { id: "feed_square", label: "Feed Quadrado (1:1)", width: 1080, height: 1080 },
    { id: "feed_portrait", label: "Feed Retrato (4:5)", width: 1080, height: 1350 },
];

// ---- COMPOSIÇÃO / POSIÇÃO ----
export const POSITION_PROMPTS: Record<string, string> = {
    LEFT: `COMPOSITION RULE: Position the subject centered specifically between the left edge and the vertical center line (approx. at the 25% horizontal mark). The subject should NOT be touching the edge. 
NEGATIVE SPACE RULE: The entire RIGHT side (from center to right edge) must be kept open for text.`,
    CENTER:
        "COMPOSITION RULE: Position the subject strictly in the geometric center of the image. Balance the negative space equally on both sides.",
    RIGHT: `COMPOSITION RULE: Position the subject centered specifically between the vertical center line and the right edge (approx. at the 75% horizontal mark). The subject should NOT be touching the edge.
NEGATIVE SPACE RULE: The entire LEFT side (from left edge to center) must be kept open for text.`,
};

// ---- BLENDING / DEGRADÊ ----
export const GRADIENT_PROMPT =
    "BLENDING ATTRIBUTE: Apply a soft, seamless GRADIENT FADE on the negative space side. The gradient should use the DOMINANT BACKGROUND COLOR to fade out any complex details, ensuring maximum text readability.";

// ---- DEPTH / BLUR ----
export const BLUR_PROMPT =
    "DEPTH ATTRIBUTE (RACK FOCUS): First, render the entire image with full sharp details. THEN, overlay a subtle GRADIENT BLUR (Rack Focus effect) that is heaviest on the negative space edge and gradually fades to 0% blur towards the center/subject. The subject must remain 100% sharp.";

// ---- SYSTEM PROMPT PRINCIPAL ----
export const SYSTEM_PROMPT = `
Você é um Especialista em Prompts de IA. Sua missão é completar a estrutura abaixo para criar imagens de altíssima conversão.

REGRA DE SOBRIEDADE (STYLE RANGE):
O usuário define um nível de sobriedade de 0 a 100.
- Se Sobriedade > 70: Use estética CORPORATIVA, LIMPA, PROFISSIONAL. Iluminação suave/natural (daylight). Evite neons e efeitos dramáticos. Foco em realismo para nichos como advocacia/medicina.
- Se Sobriedade < 30: Use estética CRIATIVA, VIBRANTE, ALTO IMPACTO. Iluminação dramática, contrastes fortes, estilo comercial moderno.

REGRA DE ESTILO (PRESET):
Se o Estilo Escolhido "{estilo_selecionado}" for fornecido, incorpore as características visuais fundamentais desse estilo em toda a composição.

REGRA DE OURO (FIDELIDADE):
O início do prompt é IMUTÁVEL e deve ser EXATAMENTE:
"Create an 8K ultra-realistic cinematic action portrait, format 1080x1440, perfectly replicating the subject's physical traits, facial expression, and overall look from the reference image"

ESTRUTURA OBRIGATÓRIA DO PROMPT:
[BASE STRING]: Insira a frase obrigatória de fidelidade acima.
[NICHE CONTEXT]: Use '{descricao_sujeito}' ou Nicho "{nicho_usuario}".
[STYLE PRESET]: Aplique diretrizes do estilo "{estilo_selecionado}".
[LIGHTING SETUP]: Combine sobriedade com "Cinematic lighting setup, volumetric lighting, dramatic shadows on face."
[BACKGROUND]: Baseado em '{ambiente_usuario}'.
[FOREGROUND]: Elementos flutuantes se solicitado.
[STYLE FINISH]: "8k resolution, commercial photography aesthetic, shot on 85mm lens f/1.4."

Retorne APENAS o prompt final montado, em inglês.`;

// ---- USER INPUT TEMPLATE ----
export function buildUserInputTemplate(config: Record<string, any>): string {
    return `
INPUTS DO USUÁRIO:
- Nicho: ${config.niche || "Não especificado"}
- Gênero: ${config.gender || "Não especificado"}
- Descrição do Sujeito: ${config.subject || "Não especificado"}
- Ambiente Específico: ${config.environment || "Não especificado"}

ESTILO E TOM:
- Nível de Sobriedade (0-100): ${config.sobriety || 50}
- Estilo Escolhido: ${config.style || "Padrão (Infoproduto)"}
- Instruções Adicionais: ${config.additionalInstructions || "Nenhuma"}

CONFIGURAÇÃO DE CORES:
- Usar Cor Fundo: ${config.useAmbientColor ? "SIM" : "NÃO"} (Cor: ${config.ambientColor || "N/A"})
- Usar Cor Recorte: ${config.useRimColor ? "SIM" : "NÃO"} (Cor: ${config.rimColor || "N/A"})

ATRIBUTOS VISUAIS:
- Usar Blur: ${config.useBlur ? "SIM" : "NÃO"}
- Usar Degradê Lateral: ${config.useGradient ? "SIM" : "NÃO"}
- Enquadramento: ${config.framingPrompt || "Medium Shot"}
- Usar Elementos Flutuantes: ${config.useFloating ? "SIM" : "NÃO"}`;
}

// ---- VISUAL ARTIST INSTRUCTION ----
export const VISUAL_ARTIST_INSTRUCTION = `You are a visual artist, NOT a writer. 
DO NOT WRITE labels like "H1:", "Header:", "CTA Button:", "Subheader:", "Button:" inside the image.
ONLY render the CONTENT of the text provided. If you cannot render perfect text, leave specific negative space.`;

// ---- SAFE AREA RULE ----
export function safeAreaRule(side: string): string {
    return `SAFE AREA RULE: Maintain a significant margin of exactly 10% of the total canvas width on the ${side} side. The subject must NOT be clipped or touch the extreme edge.`;
}

// ---- CINEMATIC COMPOSITION ----
export function cinematicComposition(width: number, height: number): string {
    return `CRITICAL COMPOSITION RULE: This image must be composed as an ULTRA-WIDE CINEMATIC HEADER. The intended view area is ${width}x${height}. Center all critical action and the subject's face vertically so they are not cut off.`;
}

// ---- SOBRIETY ADJUSTMENT ----
export const SOBRIETY_ADJUSTMENT =
    "ADJUSTMENT: Prioritize clean textures, professional environment, and neutral skin tones. Avoid lens flares and neon.";
