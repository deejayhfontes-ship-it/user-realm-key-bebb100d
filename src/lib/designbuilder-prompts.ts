export interface GeneratorState {
  subjectPosition: 'left' | 'center' | 'right';
  subjectDescription: string;
  niche: string;
  sceneDescription: string;
  textPosition: 'align-left' | 'align-center' | 'align-right';
  hasText: boolean;
  ambientColor: string;
  complementaryLight: string;
  highlightColor: string;
  cameraShot: 'close-up' | 'medium' | 'american';
  floatingElements: string;
  visualStyle: string;
  sobriety: number;
  additionalPrompt: string;
}

export function buildDesignBuilderPrompt(state: GeneratorState): { systemPrompt: string, userPrompt: string } {
  // 1. Base Realism & Structure
  let systemPrompt = `You are a world-class AI Image Generator specialized in advertising, cinematic photography, and ultra-realistic visual creation.
Your primary objective is to generate an 8K ultra-realistic cinematic image based on the exact instructions provided.
Always output the absolute highest quality image, with hyper-realistic textures, perfect lighting, and flawless composition.

CRITICAL RULES:
1. NEVER generate or embed any actual TEXT or typography in the image. The user will add text later.
2. strictly follow the composition layout requested (Negative space).
3. If requested, respect the specific lighting, colors, and camera shot.
4. DO NOT make the image look like a cartoon or 3D render unless explicitly asked. Focus on commercial photography aesthetic.`;

  // 2. Build User Prompt sequentially
  let userPromptParts = [];

  // Anchor & Composition (Negative Space)
  if (state.hasText) {
    if (state.textPosition === 'align-left' || state.subjectPosition === 'right') {
      userPromptParts.push("COMPOSITION RULE: Position the main subject strongly on the RIGHT side of the frame. Leave the entire LEFT side completely empty as negative space for typography. Apply a soft gradient fade on the left side.");
    } else if (state.textPosition === 'align-right' || state.subjectPosition === 'left') {
      userPromptParts.push("COMPOSITION RULE: Position the main subject strongly on the LEFT side of the frame. Leave the entire RIGHT side completely empty as negative space for typography. Apply a soft gradient fade on the right side.");
    } else {
      userPromptParts.push("COMPOSITION RULE: Position the main subject in the center. Maintain a balanced composition.");
    }
  }

  // Camera Shot
  let shotDesc = "medium shot (bust)";
  if (state.cameraShot === 'close-up') shotDesc = "close-up portrait shot, capturing detailed facial features";
  if (state.cameraShot === 'american') shotDesc = "American shot (cowboy shot), framing from the knees up";
  
  // Subject & Niche
  userPromptParts.push(`Subject: ${state.subjectDescription || "A professional subject relevant to the niche."}`);
  userPromptParts.push(`Niche/Context: ${state.niche}`);
  
  if (state.sceneDescription) {
    userPromptParts.push(`Scene/Environment: ${state.sceneDescription}`);
  }

  // Lighting & Colors
  userPromptParts.push(`Lighting & Colors: Use ${state.ambientColor} as the ambient/background color, with ${state.complementaryLight} as a rim light/complementary light to separate the subject from the background. Include accents of ${state.highlightColor}.`);

  // Floating Elements
  if (state.floatingElements) {
    userPromptParts.push(`Floating Elements: Include floating elements in the scene: ${state.floatingElements}. They should look dynamic and integrated into the lighting.`);
  }

  // Sobriety & Style logic
  let styleAdjectives = "";
  if (state.sobriety >= 70) {
    styleAdjectives = "Corporate, highly professional, sober, natural daylight, clean, minimalist, trustworthy.";
  } else if (state.sobriety <= 30) {
    styleAdjectives = "Vibrant, high-impact, neon accents, dramatic lighting, highly creative, energetic.";
  } else {
    styleAdjectives = "Balanced commercial aesthetic, modern, appealing.";
  }

  userPromptParts.push(`Visual Style: ${state.visualStyle}. ${styleAdjectives}`);

  if (state.additionalPrompt) {
    userPromptParts.push(`Additional Instructions: ${state.additionalPrompt}`);
  }

  // The Grand Finale (The leaked magic string)
  userPromptParts.push(`[FINAL INSTRUCTION]: Create an 8K ultra-realistic cinematic portrait, perfectly replicating the subject's physical traits, facial expression, and overall look. 8k resolution, commercial photography aesthetic, shot on 85mm lens f/1.4, ${shotDesc}.`);

  return {
    systemPrompt,
    userPrompt: userPromptParts.join("\n\n")
  };
}
