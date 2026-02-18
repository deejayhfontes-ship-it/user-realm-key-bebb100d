// ============================================================
// REFINER — Refina o prompt do usuário com Gemini Text
// Portado de src/core/refiner.js
// ============================================================

import { SYSTEM_PROMPT, buildUserInputTemplate } from "./constants.ts";

export async function refinePrompt(
    apiKey: string,
    modelName: string,
    config: Record<string, any>
): Promise<string> {
    const userInput = buildUserInputTemplate(config);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const body = {
        system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
            {
                role: "user",
                parts: [{ text: userInput }],
            },
        ],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4000,
        },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro na API Gemini (refine): ${response.status} — ${errorBody}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Nenhum texto retornado pela API Gemini no refinamento.");
    }

    return text.trim();
}
