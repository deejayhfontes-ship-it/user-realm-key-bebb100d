// ============================================================
// ASSEMBLER — Monta prompt final com regras técnicas
// Portado de src/core/assembler.js
// ============================================================

import {
    POSITION_PROMPTS,
    GRADIENT_PROMPT,
    BLUR_PROMPT,
    VISUAL_ARTIST_INSTRUCTION,
    safeAreaRule,
    cinematicComposition,
    SOBRIETY_ADJUSTMENT,
    FRAMINGS,
    DIMENSIONS,
} from "./constants.ts";

export function assemblePrompt(
    refinedPrompt: string,
    config: Record<string, any>
): string {
    const parts: string[] = [refinedPrompt];

    // Position / Composition
    const position = config.position || "CENTER";
    if (POSITION_PROMPTS[position]) {
        parts.push(POSITION_PROMPTS[position]);
    }

    // Safe area
    if (position === "LEFT") {
        parts.push(safeAreaRule("left"));
    } else if (position === "RIGHT") {
        parts.push(safeAreaRule("right"));
    }

    // Gradient
    if (config.useGradient) {
        parts.push(GRADIENT_PROMPT);
    }

    // Blur / Depth
    if (config.useBlur) {
        parts.push(BLUR_PROMPT);
    }

    // Framing
    const framing = FRAMINGS.find((f) => f.id === config.framing);
    if (framing) {
        parts.push(`FRAMING: ${framing.prompt}`);
    }

    // Dimensions
    const dim = DIMENSIONS.find((d) => d.id === config.dimension);
    if (dim) {
        parts.push(cinematicComposition(dim.width, dim.height));
    }

    // Sobriety adjustment (> 70)
    if ((config.sobriety || 50) > 70) {
        parts.push(SOBRIETY_ADJUSTMENT);
    }

    // Visual artist instruction (always)
    parts.push(VISUAL_ARTIST_INSTRUCTION);

    return parts.join("\n\n");
}
