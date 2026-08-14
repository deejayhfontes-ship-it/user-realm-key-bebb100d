// ============================================================
// Esquemas de direção de luz de estúdio — regra ADITIVA de prompt.
// Compartilhado entre a UI (DesignerDoFuturoGenerator) e o hook
// (useGeminiImageGeneration/buildCompositionRules). Não altera o
// SYSTEM_PROMPT nem o bloco [LIGHTING SETUP] existente.
// ============================================================

export interface LightingScheme {
    id: string;
    label: string;
    /** Descrição técnica em inglês, injetada como regra de composição. */
    prompt: string;
}

const COMPAT_CLAUSE =
    'Integrate this lighting direction with the overall cinematic lighting setup already requested; do not alter composition or framing.';

export const LIGHTING_SCHEMES: LightingScheme[] = [
    { id: 'none', label: 'Auto', prompt: '' },
    {
        id: 'rembrandt',
        label: 'Rembrandt',
        prompt: `(REMBRANDT): Key light positioned 45 degrees to the side and above the subject, creating the signature inverted triangle of light on the shadowed cheek. Soft shadow falloff, classic painterly portrait mood. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'butterfly',
        label: 'Butterfly',
        prompt: `(BUTTERFLY / PARAMOUNT): Key light directly in front of and above the subject, casting a small symmetrical butterfly-shaped shadow under the nose. Glamorous beauty lighting with even cheek illumination. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'split',
        label: 'Split',
        prompt: `(SPLIT): Key light at 90 degrees to the subject's side, illuminating exactly half of the face while the other half falls into shadow. Dramatic high-contrast chiaroscuro. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'loop',
        label: 'Loop',
        prompt: `(LOOP): Key light slightly above eye level, 30-45 degrees off axis, casting a small loop-shaped nose shadow toward the corner of the mouth. Flattering, versatile portrait light. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'backlight',
        label: 'Contraluz',
        prompt: `(BACKLIGHT / CONTRE-JOUR): Main light source behind the subject, creating a luminous rim outline around hair and shoulders, with gentle fill on the face to preserve detail. Strong subject-background separation. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'side',
        label: 'Lateral',
        prompt: `(SIDE LIGHT): Strong directional light from one side at subject height, sculpting facial structure with pronounced highlight-to-shadow modeling. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'top',
        label: 'Top Light',
        prompt: `(TOP LIGHT): Overhead light source directly above the subject, producing dramatic downward shadows under brows and chin. Moody editorial look. ${COMPAT_CLAUSE}`,
    },
    {
        id: 'golden_hour',
        label: 'Golden Hour',
        prompt: `(GOLDEN HOUR): Warm low-angle sunlight grazing the subject from near the horizon, long soft shadows, golden glow on skin with a gentle warm rim. ${COMPAT_CLAUSE}`,
    },
];

/** Retorna o esquema ativo, ou undefined para 'none'/desconhecido (nenhuma regra emitida). */
export function getLightingScheme(id?: string): LightingScheme | undefined {
    if (!id || id === 'none') return undefined;
    return LIGHTING_SCHEMES.find(s => s.id === id);
}
