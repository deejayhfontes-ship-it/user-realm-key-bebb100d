/**
 * PROMPT ENGINE - COMPILADOR FOTOGRÁFICO DE ALTA FIDELIDADE
 * Baseado na engenharia reversa do DesignBuilder (Gemini 3 Pro / Imagen 3)
 */

class PromptEngine {
  static compile(agentSlug, formData) {
    switch (agentSlug) {
      case 'design-builder1-2':
      case 'orion-pro':
        return this.compileDesignBuilder(formData);
      case 'product-builder-v2':
        return this.compileHydraBuilder(formData);
      case 'ref-builder':
        return this.compileRefBuilder(formData);
      case 'enhance-builder':
        return this.compileEnhanceBuilder(formData);
      default:
        return this.compileGenericBuilder(agentSlug, formData);
    }
  }

  static compileDesignBuilder(data) {
    const parts = [];

    // 1. Definição do Tipo de Foto e Câmera
    const style = data.estilo_visual || 'ultra_realistic';
    const plano = data.plano || 'medium';
    const sobriety = parseInt(data.sobriedade_criatividade || '50', 10);

    // Mapeamento de Planos Fotográficos
    const shotMap = {
      'close_up': 'extreme close-up portrait, focusing on detailed facial expressions and eyes, tight composition',
      'medium': 'medium shot portrait, from chest up, balanced commercial framing, clear posture',
      'american': 'cowboy shot (medium-long shot), from knees up, cinematic stance, editorial fashion composition',
      'full_body': 'full-body wide shot, showcasing complete attire, footwear and surrounding environment'
    };
    parts.push(`Award-winning commercial photograph, ${shotMap[plano] || 'medium shot'}.`);

    // 2. Descrição do Sujeito
    const subjectDesc = data.subject_description || data.descricao_do_sujeito || 'professional person';
    const gender = data.genero || 'person';
    const quantity = data.quantidade || '1';

    let subjectPrompt = `${quantity === '1' ? 'A single' : quantity} ${gender} subject, ${subjectDesc}`;
    parts.push(subjectPrompt + '.');

    // 3. Posicionamento do Sujeito e Regra dos Terços (Espaço Negativo para Texto)
    const position = data.subject_position || 'center';
    if (position === 'left') {
      parts.push('Framed strictly on the left third of the composition using rule of thirds, leaving generous clean negative space on the right side for advertising typography.');
    } else if (position === 'right') {
      parts.push('Framed strictly on the right third of the composition using rule of thirds, leaving generous clean negative space on the left side for advertising typography.');
    } else {
      parts.push('Centered subject composition with balanced symmetrical margins and headroom.');
    }

    // 4. Cenário e Nicho
    const nicho = data.nicho_projeto || '';
    const cenario = data.cenario_contexto || '';
    if (nicho || cenario) {
      parts.push(`Setting & Context: High-end luxury environment tailored for "${nicho || 'commercial advertising'}", ${cenario || 'clean aesthetic studio backdrop'}.`);
    }

    // 5. Paleta de Cores e Iluminação de 3 Pontos
    if (data.color_palette && typeof data.color_palette === 'object' && Object.keys(data.color_palette).length > 0) {
      parts.push(`Curated color palette with primary tones: ${JSON.stringify(data.color_palette)}.`);
    }
    parts.push('Lighting setup: Master studio three-point lighting, sharp key light, subtle fill light, crisp edge rim lighting creating distinct separation from background.');

    // 6. Efeitos de Lente e Desfoque (Bokeh)
    if (data.usar_desfoque_blur === true || data.usar_desfoque_blur === 'true') {
      parts.push('Optics: 85mm f/1.4 prime lens, shallow depth of field, creamy smooth optical bokeh in background, sharp focus on subject eyes and texture.');
    } else {
      parts.push('Optics: 50mm f/4 lens, crisp edge-to-edge sharpness with clear architectural details.');
    }

    // 7. Modulação por Sobriedade
    if (sobriety > 70) {
      parts.push('Style demeanor: Formal, highly authentic, corporate dignity, natural skin tones, zero surrealism.');
    } else if (sobriety < 30) {
      parts.push('Style demeanor: Vibrant, ultra dynamic, high energy, bold modern contrast, striking commercial poster aesthetic.');
    } else {
      parts.push('Style demeanor: Modern polished commercial advertising style, sophisticated color grading.');
    }

    // 8. Textos da Imagem (se houver)
    if (data.textos_da_imagem) {
      parts.push(`Typography element placeholder integrated naturally: "${data.textos_da_imagem}".`);
    }

    // 9. Renderização e Parâmetros Finais
    const quality = data.quality || '1K';
    parts.push(`Resolution: Ultra high fidelity ${quality} render, 8k textures, subsurface scattering on skin, photorealistic details, Hasselblad H6D-100c medium format look.`);

    if (data.prompt_adicional) {
      parts.push(`Additional creative details: ${data.prompt_adicional}`);
    }

    return parts.join(' ');
  }

  static compileHydraBuilder(data) {
    const parts = [];
    parts.push('High-end commercial product photography.');
    if (data.foto_do_produto) parts.push('Preserving exact product packaging, brand identity and materials from reference.');
    if (data.posicao_do_produto) parts.push(`Positioning product at ${data.posicao_do_produto} of the frame.`);
    if (data.cor_principal) parts.push(`Primary visual accent color: ${data.cor_principal}.`);
    if (data.desfocar_fundo) parts.push('Cinematic shallow depth of field with blurred studio ambient background.');
    if (data.espaco_para_texto && data.espaco_para_texto !== 'nenhum') {
      parts.push(`Clear negative copy space reserved at the ${data.espaco_para_texto} section.`);
    }
    parts.push('Studio strobe lighting, softbox diffusion, acrylic pedestal reflection, crisp product highlights.');
    if (data.ajustes_adicionais) parts.push(data.ajustes_adicionais);
    return parts.join(' ');
  }

  static compileRefBuilder(data) {
    const parts = [];
    parts.push('High-end stylistic adaptation and reference synthesis.');
    parts.push('Synthesizing exact lighting style, color harmony, and visual mood from provided reference assets.');
    if (data.posicao_do_sujeito) parts.push(`Subject positioned at ${data.posicao_do_sujeito}.`);
    if (data.descricao_adicional) parts.push(data.descricao_adicional);
    parts.push('Hyper-realistic commercial quality, 8k resolution, cinematic color grading, professional art direction.');
    return parts.join(' ');
  }

  static compileEnhanceBuilder(data) {
    const parts = [];
    parts.push('AI image super-resolution, restoration and detail enhancement.');
    parts.push(`Target quality: ${data.qualidade || '4K'} ultra high definition remaster.`);
    parts.push('Restoring fine textures, removing artifacts, repairing blur, sharpening facial features, professional color balance.');
    if (data.instrucoes_adicionais) parts.push(data.instrucoes_adicionais);
    return parts.join(' ');
  }

  static compileGenericBuilder(slug, data) {
    const items = [];
    items.push(`Professional creative generation for ${slug}.`);
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val === 'string' && val.trim() !== '') {
        items.push(`${key}: ${val}`);
      }
    }
    items.push('Ultra-detailed, commercial quality, 8k render, professional composition.');
    return items.join(' | ');
  }
}

// Exportar para Node ou Navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
} else {
  window.PromptEngine = PromptEngine;
}
