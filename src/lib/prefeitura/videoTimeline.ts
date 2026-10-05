// Motor de desenho do Gerador de Vídeos da Prefeitura.
// Módulo puro (sem React): o mesmo drawFrame é usado pelo preview (escala 0.3)
// e pela exportação (1080x1920), garantindo que o que se vê é o que se exporta.

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;

// Crossfade entre fotos (sobrepõe o fim de um segmento com o início do próximo)
const CROSSFADE_MS = 800;

// Intro dos overlays
const MASK_FADE_START = 300;
const MASK_FADE_END = 1100;
const TEXT_INTRO_START = 800;
const TEXT_ITEM_DURATION = 600;
const TEXT_ITEM_STAGGER = 120;
const TEXT_SLIDE_PX = 20;

export interface VideoImageSettings {
  scale: number;
  positionX: number; // -50 a 50 (offset em %)
  positionY: number; // -50 a 50 (offset em %)
}

export interface VideoConfig {
  photoCount: number;
  imageSettings: VideoImageSettings[];
  secretaria: string;
  descricao: string;
  formattedDate: string;
  gradientIntensity: number; // 0 a 100
  fontSize: number; // fonte da manchete (45-55, mesma regra do gerador de stories)
  accentColor: string;     // cor de destaque: gradiente de fundo e tarja da secretaria
  accentTextColor: string; // cor do texto dentro da tarja
}

export type MediaElement = HTMLImageElement | HTMLVideoElement;

export interface LoadedAssets {
  media: MediaElement[];
  mask: HTMLImageElement;
}

function mediaSize(el: MediaElement): { w: number; h: number } {
  if (el instanceof HTMLVideoElement) {
    return { w: el.videoWidth || 1, h: el.videoHeight || 1 };
  }
  return { w: el.naturalWidth || 1, h: el.naturalHeight || 1 };
}

export function getTotalDuration(photoCount: number): number {
  if (photoCount <= 1) return 10000;
  if (photoCount === 2) return 12000;
  return 15000;
}

export function getSegmentDuration(photoCount: number): number {
  return getTotalDuration(photoCount) / Math.max(1, photoCount);
}

const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  // Preserva quebras de linha digitadas (whiteSpace: pre-wrap no gerador de stories)
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

// Replica backgroundSize: `${scale*100}%` (largura, altura proporcional) e
// backgroundPosition: `${50+posX}% ${50+posY}%` do gerador de stories.
function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  img: MediaElement,
  settings: VideoImageSettings,
  kbScale: number,
  kbPanX: number,
  kbPanY: number
) {
  const { w, h } = mediaSize(img);
  const scale = settings.scale * kbScale;
  const drawW = VIDEO_WIDTH * scale;
  const drawH = drawW * (h / w);
  const posX = clampPos(settings.positionX + kbPanX);
  const posY = clampPos(settings.positionY + kbPanY);
  const x = (VIDEO_WIDTH - drawW) * ((50 + posX) / 100);
  const y = (VIDEO_HEIGHT - drawH) * ((50 + posY) / 100);
  ctx.drawImage(img, x, y, drawW, drawH);
}

const clampPos = (v: number) => Math.max(-50, Math.min(50, v));

interface SegmentState {
  index: number;
  alpha: number;
  progress: number; // 0-1 dentro do segmento
}

// Retorna quais fotos desenhar em tMs (1 ou 2 durante o crossfade)
function getActiveSegments(tMs: number, photoCount: number): SegmentState[] {
  const segMs = getSegmentDuration(photoCount);
  const total = getTotalDuration(photoCount);
  const t = Math.max(0, Math.min(total - 1, tMs));
  const index = Math.min(photoCount - 1, Math.floor(t / segMs));
  const local = t - index * segMs;
  const current: SegmentState = { index, alpha: 1, progress: local / segMs };

  // Últimos CROSSFADE_MS do segmento: próxima foto entra por cima
  if (index < photoCount - 1 && local > segMs - CROSSFADE_MS) {
    const fade = (local - (segMs - CROSSFADE_MS)) / CROSSFADE_MS;
    const next: SegmentState = {
      index: index + 1,
      alpha: easeInOutSine(fade),
      progress: 0,
    };
    return [current, next];
  }
  return [current];
}

function kenBurns(segment: SegmentState) {
  const p = easeInOutSine(clamp01(segment.progress));
  const zoomIn = segment.index % 2 === 0;
  const kbScale = zoomIn ? 1 + 0.08 * p : 1.08 - 0.08 * p;
  const panDir = segment.index % 2 === 0 ? 1 : -1;
  return { kbScale, kbPanX: panDir * 2 * p, kbPanY: -1 * p };
}

// Intro: fade + slide-up com stagger. Retorna {alpha, offsetY} do item n.
function textIntro(tMs: number, itemIndex: number, composto = false) {
  if (composto) return { alpha: 1, offsetY: 0 };
  const start = TEXT_INTRO_START + itemIndex * TEXT_ITEM_STAGGER;
  const p = clamp01((tMs - start) / TEXT_ITEM_DURATION);
  const e = easeOutCubic(p);
  return { alpha: e, offsetY: (1 - e) * TEXT_SLIDE_PX };
}

function drawShadowedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  alpha: number
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // Equivale ao textShadow: 0 4px 4px rgba(0,0,0,0.25) do gerador de stories
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** #RRGGBB -> rgba(r,g,b,alpha). Usado para o gradiente sumir na cor certa. */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(0, 70, 145, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const TARJA_Y = 1894;   // topo da tarjinha dentro da mascara
const TARJA_H = 26;     // altura ate a base do canvas

let tarjaCache: { cor: string; mask: HTMLImageElement; canvas: HTMLCanvasElement } | null = null;

/** Devolve a faixa da tarjinha repintada na cor dada, preservando o contorno. */
function tarjaRecolorida(mask: HTMLImageElement, cor: string): HTMLCanvasElement {
  if (tarjaCache && tarjaCache.cor === cor && tarjaCache.mask === mask) {
    return tarjaCache.canvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = TARJA_H;
  const c = canvas.getContext("2d");
  if (c) {
    c.drawImage(mask, 0, TARJA_Y, VIDEO_WIDTH, TARJA_H, 0, 0, VIDEO_WIDTH, TARJA_H);
    c.globalCompositeOperation = "source-in";
    c.fillStyle = cor;
    c.fillRect(0, 0, VIDEO_WIDTH, TARJA_H);
  }
  tarjaCache = { cor, mask, canvas };
  return canvas;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  assets: LoadedAssets,
  config: VideoConfig,
  tMs: number,
  /** Pulа as animacoes de entrada: usado no preview pausado, para quem edita
   *  ver a arte montada em vez de uma tela vazia no instante 0. */
  composto = false
) {
  ctx.save();
  ctx.globalAlpha = 1;

  // Fundo
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  // Mídias em tela cheia sequenciais, com crossfade (Ken Burns só em foto —
  // vídeo já tem movimento próprio)
  for (const segment of getActiveSegments(tMs, config.photoCount)) {
    const el = assets.media[segment.index];
    if (!el) continue;
    const settings = config.imageSettings[segment.index];
    const isVideo = el instanceof HTMLVideoElement;
    const { kbScale, kbPanX, kbPanY } = isVideo
      ? { kbScale: 1, kbPanX: 0, kbPanY: 0 }
      : kenBurns(segment);
    ctx.save();
    ctx.globalAlpha = segment.alpha;
    drawCoverPhoto(ctx, el, settings, kbScale, kbPanX, kbPanY);
    ctx.restore();
  }

  // Gradiente da cor de destaque (linear-gradient(to top, cor, transparent), 960px)
  if (config.gradientIntensity > 0) {
    const gradient = ctx.createLinearGradient(0, VIDEO_HEIGHT, 0, VIDEO_HEIGHT - 960);
    const base = config.accentColor || "#004691";
    gradient.addColorStop(0, base);
    gradient.addColorStop(1, hexToRgba(base, 0));
    ctx.save();
    ctx.globalAlpha = config.gradientIntensity / 100;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, VIDEO_HEIGHT - 960, VIDEO_WIDTH, 960);
    ctx.restore();
  }

  // Máscara oficial com fade-in
  const maskAlpha = composto
    ? 1
    : easeInOutSine(clamp01((tMs - MASK_FADE_START) / (MASK_FADE_END - MASK_FADE_START)));
  if (maskAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = maskAlpha;
    ctx.drawImage(assets.mask, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    ctx.restore();

    // A tarjinha do rodape vem desenhada em azul dentro do PNG da mascara.
    // Recortar e cobrir com um retangulo deixava emenda, porque a forma real
    // vai de x=229 ate a borda direita e tem a ponta esquerda inclinada.
    // Entao repintamos a propria forma: recorta a faixa, usa source-in para
    // trocar a cor preservando o contorno, e devolve por cima.
    ctx.save();
    ctx.globalAlpha = maskAlpha;
    ctx.drawImage(tarjaRecolorida(assets.mask, config.accentColor || "#004691"), 0, TARJA_Y);
    ctx.restore();
  }

  // Bloco de texto — mesma estrutura do Stories Noticia: barra colorida de 14px,
  // manchete em peso 800 ao lado dela e, abaixo, a tarja da secretaria.
  const textLeft = 90;
  const barraW = 14;
  const barraGap = 36;
  const textX = textLeft + barraW + barraGap;
  const textMaxWidth = VIDEO_WIDTH - textLeft - 90 - barraW - barraGap;
  const textBottom = VIDEO_HEIGHT - 280;
  const lineHeight = config.fontSize * 1.15;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `800 ${config.fontSize}px 'Aspekta', Arial, sans-serif`;

  const descLines = config.descricao
    ? wrapText(ctx, config.descricao, textMaxWidth)
    : [];

  const mancheteH = descLines.length * lineHeight;
  const tarjaBlock = config.secretaria ? 48 + 72 : 0;
  let y = textBottom - mancheteH - tarjaBlock;
  let itemIndex = 0;

  // Manchete com a barra colorida a esquerda
  if (descLines.length) {
    const topoBarra = Math.round(config.fontSize * 0.2);
    const baseBarra = Math.round(config.fontSize * 0.12);
    const { alpha: barraAlpha, offsetY: barraOffset } = textIntro(tMs, 0, composto);
    ctx.save();
    ctx.globalAlpha = barraAlpha;
    ctx.fillStyle = config.accentColor || "#004691";
    ctx.fillRect(
      textLeft,
      y + topoBarra + barraOffset,
      barraW,
      Math.max(0, mancheteH - topoBarra - baseBarra)
    );
    ctx.restore();

    for (const line of descLines) {
      const { alpha, offsetY } = textIntro(tMs, itemIndex++, composto);
      drawShadowedText(ctx, line, textX, y + offsetY, alpha);
      y += lineHeight;
    }
  }

  // Tarja da secretaria, abaixo da manchete
  if (config.secretaria) {
    const { alpha, offsetY } = textIntro(tMs, itemIndex++, composto);
    const tarjaY = y + 48 + offsetY;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "800 30px 'Aspekta', Arial, sans-serif";
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "1px";
    const texto = config.secretaria;
    const tarjaW = ctx.measureText(texto).width + 96;
    const tarjaX = textLeft + 50;
    ctx.fillStyle = config.accentColor || "#004691";
    ctx.fillRect(tarjaX, tarjaY, tarjaW, 72);
    ctx.fillStyle = config.accentTextColor || "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, tarjaX + 48, tarjaY + 36);
    ctx.restore();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    y += 48 + 72;
  }

  // Data e setinha (bottom: 150px, right: 90px, gap 60px)
  const { alpha: footAlpha, offsetY: footOffset } = textIntro(tMs, itemIndex, composto);
  const footBaseline = VIDEO_HEIGHT - 150;
  ctx.textBaseline = "alphabetic";

  ctx.font = "32px Arial, sans-serif";
  const arrowWidth = ctx.measureText("→").width;
  ctx.textAlign = "right";
  drawShadowedText(ctx, "→", VIDEO_WIDTH - 90, footBaseline + footOffset, footAlpha);

  ctx.save();
  ctx.font = "400 24px Arial, sans-serif";
  // letterSpacing: 1px (suportado em canvas moderno; ignorado onde não houver)
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "1px";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  if (footAlpha > 0) {
    ctx.globalAlpha = footAlpha;
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      config.formattedDate,
      VIDEO_WIDTH - 90 - arrowWidth - 60,
      footBaseline - 4 + footOffset
    );
  }
  ctx.restore();

  ctx.restore();
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // decode() antecipado é só otimização — NÃO aguardar (trava em aba oculta)
      img.decode().catch(() => undefined);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src.slice(0, 80)}`));
    img.src = src;
  });
}

export function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error("Falha ao carregar vídeo"));
    video.src = src;
  });
}

export async function loadFonts(): Promise<void> {
  try {
    await document.fonts.load("800 30px 'Aspekta'");
    await document.fonts.load("500 30px 'Aspekta'");
    await document.fonts.ready;
  } catch {
    // Fallback silencioso: Arial assume se a Aspekta não carregar
  }
}
