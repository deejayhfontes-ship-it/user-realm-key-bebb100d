// Órion Pro — construtor de prompt para o gerador de imagens de teste (2026).
// Concatena os campos do formulário na ordem definida e devolve o prompt final em EN.

export type OrionCategoria = 'pessoa' | 'produto' | 'livre';
export type OrionPlano = 'close-up' | 'medium' | 'american' | 'full';
export type OrionPosicao = 'left' | 'center' | 'right';
export type OrionDimensions = '9:16' | '4:5' | '1:1' | '16:9';
export type OrionQuality = '1K' | '2K' | '4K';

export interface OrionForm {
  categoria: OrionCategoria;
  quantidade: number;
  subject_description: string;
  plano: OrionPlano;
  subject_position: OrionPosicao;
  estilo_visual: string;
  cenario: string;
  nicho_projeto: string;
  color_palette: string;
  dimensions: OrionDimensions;
  quality: OrionQuality;
  sobriedade_criatividade: number; // 0-100
  textos: string;
}

// value => texto EN
export const ESTILOS: Record<string, string> = {
  cinema: 'cinematic film still, dramatic three-point lighting, anamorphic framing, moody color grade, shallow depth of field',
  classic: 'timeless classic portrait, warm tones, soft key light, old-Hollywood mood, subtle film grain',
  formal: 'clean corporate look, symmetric composition, neutral navy/graphite palette, even studio lighting',
  elegant: 'refined luxury, gold and champagne tones, glamour lighting, silky textures, premium editorial',
  sexy: 'sensual dramatic fashion editorial, low-key lighting, deep shadows, high contrast, chiaroscuro',
  institutional: 'trustworthy institutional look, neutral tones, balanced lighting, authoritative and credible',
  tech: 'futuristic tech aesthetic, blue and cyan palette, digital grids, LED glow, innovative mood',
  glassmorphism: 'glassmorphism, frosted translucent panels, soft blur, layered depth, gentle highlights',
  ui_interface: 'clean app UI mockup, cards and icons, digital product interface, flat modern design',
  minimalist: 'minimalist, generous negative space, few elements, restrained palette, elegant simplicity',
  playful: 'playful and colorful, organic shapes, cheerful palette, light-hearted mood',
  cartoon: 'stylized cartoon illustration, bold outlines, flat colors, animated look',
  infoproduct: 'high-conversion marketing creative, bold high-contrast colors, space for headline text, modern digital',
  jovial: 'warm approachable lifestyle photography, golden-hour light, natural smiles, candid feel',
  gamer: 'esports gamer aesthetic, dark background, RGB neon, aggressive angles, smoke, high energy',
  pro_portrait: 'professional studio portrait, clean backdrop, softbox lighting, tack-sharp eyes, magazine-cover quality',
  ultra_realistic: 'hyper-realistic, natural lighting, real skin texture and pores, photographic, no AI look, shot on 85mm',
  glow: 'ethereal glow, soft radiant light, bloom effect, angelic backlight, dreamy bokeh',
  advertising: 'high-impact advertising photo, vibrant colors, dramatic studio lighting, hero framing',
  flyer_sertanejo: 'sertanejo concert flyer, country party mood, stage lights, event promo layout',
  flyer_funk: 'funk party flyer, vibrant neon colors, urban energy, event promo layout',
  delivery: 'appetizing food/delivery shot, warm colors, menu or restaurant promo look, mouth-watering',
  brand_premium: 'premium brand look, sophisticated minimalist, luxury product feel',
};

// rótulos PT-BR para o select (mesma ordem)
export const ESTILOS_LABELS: Record<string, string> = {
  cinema: 'Cinema',
  classic: 'Clássico',
  formal: 'Formal',
  elegant: 'Elegante',
  sexy: 'Sexy',
  institutional: 'Institucional',
  tech: 'Tech',
  glassmorphism: 'Glassmorphism',
  ui_interface: 'UI / Interface',
  minimalist: 'Minimalista',
  playful: 'Divertido',
  cartoon: 'Cartoon',
  infoproduct: 'Infoproduto',
  jovial: 'Jovial',
  gamer: 'Gamer',
  pro_portrait: 'Retrato Profissional',
  ultra_realistic: 'Ultra Realista',
  glow: 'Glow',
  advertising: 'Publicidade',
  flyer_sertanejo: 'Flyer Sertanejo',
  flyer_funk: 'Flyer Funk',
  delivery: 'Delivery',
  brand_premium: 'Marca Premium',
};

export const PLANO: Record<OrionPlano, string> = {
  'close-up': 'extreme close-up on the face, 85mm portrait lens, tight crop',
  medium: 'medium shot from the chest up, 50mm lens',
  american: 'american shot from mid-thigh up, 35mm lens',
  full: 'full-body shot, subject fully in frame, 24-35mm lens',
};

export const POSICAO: Record<OrionPosicao, string> = {
  left: 'subject placed on the LEFT third, copy space on the right',
  center: 'subject centered in frame, balanced composition',
  right: 'subject placed on the RIGHT third, copy space on the left',
};

const CATEGORIA_BASE: Record<OrionCategoria, string> = {
  pessoa: 'Professional photograph of a person.',
  produto: 'Professional product shot.',
  livre: 'Creative visual composition.',
};

export function montarPrompt(form: OrionForm): string {
  const parts: string[] = [];

  // 1. base categoria
  parts.push(CATEGORIA_BASE[form.categoria] ?? CATEGORIA_BASE.pessoa);

  // 2. subject_description
  if (form.subject_description?.trim()) {
    parts.push(`Subject: ${form.subject_description.trim()}.`);
  }

  // 3. quantidade > 1
  if (form.quantidade > 1) {
    parts.push(`Show ${form.quantidade} subjects in the scene.`);
  }

  // 4. estilo
  const estilo = ESTILOS[form.estilo_visual];
  if (estilo) parts.push(`Style: ${estilo}`);

  // 5. plano
  const plano = PLANO[form.plano];
  if (plano) parts.push(`Framing: ${plano}`);

  // 6. posição
  const pos = POSICAO[form.subject_position];
  if (pos) parts.push(pos);

  // 7. cenário
  if (form.cenario?.trim()) {
    parts.push(`Scene/context: ${form.cenario.trim()}.`);
  }

  // 8. nicho/projeto
  if (form.nicho_projeto?.trim()) {
    parts.push(`Project/niche context: ${form.nicho_projeto.trim()}.`);
  }

  // 9. paleta
  if (form.color_palette?.trim()) {
    parts.push(`Color palette: ${form.color_palette.trim()}.`);
  }

  // 10. textos
  if (form.textos?.trim()) {
    parts.push(`Render this exact text in the image: "${form.textos.trim()}".`);
  }

  // 11. sobriedade / criatividade
  const s = form.sobriedade_criatividade;
  if (s <= 33) {
    parts.push('Follow the brief strictly and literally; conservative, faithful execution.');
  } else if (s <= 66) {
    parts.push('Balance faithfulness to the brief with tasteful creative choices.');
  } else {
    parts.push('Take creative liberty; bold expressive interpretation while keeping the subject identity.');
  }

  // 12. aspect ratio + quality
  let ar = `Aspect ratio: ${form.dimensions}.`;
  if (form.quality === '2K') ar += ' high detail, 2K resolution';
  else if (form.quality === '4K') ar += ' ultra-high detail, 4K resolution, crisp textures';
  parts.push(ar);

  // 13. rodapé fixo
  parts.push(
    "Photorealistic, professional composition, sharp focus, natural color, preserve the subject's face and identity from the reference images."
  );

  return parts.join(' ');
}
