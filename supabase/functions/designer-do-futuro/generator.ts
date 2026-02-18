// ============================================================
// GENERATOR — Gera imagem com Gemini Image API
// Portado de src/core/generator.js
// ============================================================

import { VISUAL_ARTIST_INSTRUCTION, DIMENSIONS } from "./constants.ts";

interface GenerateImageOptions {
    apiKey: string;
    modelName: string;
    prompt: string;
    referenceImageBase64?: string;
    referenceImageMimeType?: string;
    dimensionId?: string;
}

interface GenerateImageResult {
    imageBase64: string;
    mimeType: string;
    promptUsed: string;
}

export async function generateImage(
    options: GenerateImageOptions
): Promise<GenerateImageResult> {
    const { apiKey, modelName, prompt, referenceImageBase64, referenceImageMimeType, dimensionId } = options;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Build parts array
    const parts: any[] = [];

    // Add reference image if provided
    if (referenceImageBase64 && referenceImageMimeType) {
        parts.push({
            inlineData: {
                mimeType: referenceImageMimeType,
                data: referenceImageBase64,
            },
        });
    }

    // Add text prompt
    parts.push({ text: prompt });

    // Determine aspect ratio from dimension
    const dim = DIMENSIONS.find((d) => d.id === dimensionId);
    let aspectRatio = "1:1";
    if (dim) {
        if (dim.width === 1080 && dim.height === 1920) aspectRatio = "9:16";
        else if (dim.width === 2752 && dim.height === 1536) aspectRatio = "16:9";
        else if (dim.width === 1080 && dim.height === 1350) aspectRatio = "4:5";
        else if (dim.width === 1080 && dim.height === 1080) aspectRatio = "1:1";
    }

    const body = {
        contents: [
            {
                role: "user",
                parts,
            },
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            temperature: 1.0,
            maxOutputTokens: 8192,
        },
        systemInstruction: {
            parts: [{ text: VISUAL_ARTIST_INSTRUCTION }],
        },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro na API Gemini (generate): ${response.status} — ${errorBody}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];

    if (!candidate?.content?.parts) {
        throw new Error("Nenhuma resposta válida da API Gemini na geração de imagem.");
    }

    // Find the image part
    const imagePart = candidate.content.parts.find(
        (p: any) => p.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart) {
        // Maybe the API returned text instead of an image
        const textPart = candidate.content.parts.find((p: any) => p.text);
        throw new Error(
            `A API não retornou uma imagem. Resposta: ${textPart?.text || "vazio"}`
        );
    }

    return {
        imageBase64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
        promptUsed: prompt,
    };
}
