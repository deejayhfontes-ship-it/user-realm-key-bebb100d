import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Slide } from '@/services/carrossel-api';

// ─── Definição de Templates ─────────────────────────────────────────
export interface TemplateStyle {
  bg: string;           // cor de fundo principal
  bg2: string;          // cor de fundo secundária (gradiente)
  text: string;         // cor do texto principal
  textSub: string;      // cor do texto secundário
  accent: string;       // cor de destaque
  accent2: string;      // segunda cor destaque
  titleSize: string;    // tamanho do título no preview
  // Decorações especiais (serializáveis como string)
  decoType: 'diagonal' | 'faixas' | 'neon' | 'clean' | 'grid' | 'cross' | 'serif' | 'roxo';
}

const TEMPLATES: Record<string, TemplateStyle> = {
  // ── Academia: Diagonal bold vermelho ─────────────────────────────
  'Diagonal bold vermelho': {
    bg: '#0D0D0D', bg2: '#1A0000',
    text: '#FFFFFF', textSub: '#FF4444CC',
    accent: '#E63946', accent2: '#FF6B6B',
    titleSize: '0.85rem',
    decoType: 'diagonal',
  },
  // ── Prefeitura: Institucional azul com faixas BR ──────────────────
  'Institucional azul com faixas BR': {
    bg: '#003087', bg2: '#001A4D',
    text: '#FFFFFF', textSub: '#FFFFFFCC',
    accent: '#009C3B', accent2: '#FFDF00',
    titleSize: '0.8rem',
    decoType: 'faixas',
  },
  // ── Evento: Dark neon magenta ─────────────────────────────────────
  'Dark neon magenta': {
    bg: '#060010', bg2: '#150028',
    text: '#FFFFFF', textSub: '#FF00FFCC',
    accent: '#FF00FF', accent2: '#CC00CC',
    titleSize: '0.85rem',
    decoType: 'neon',
  },
  // ── Minimalista: Branco serif elegante ────────────────────────────
  'Branco serif elegante': {
    bg: '#FAFAFA', bg2: '#F0ECE6',
    text: '#1A1A1A', textSub: '#555555',
    accent: '#8C6D3F', accent2: '#C4A87A',
    titleSize: '0.8rem',
    decoType: 'clean',
  },
  // ── Futurista: Dark ciano com grid técnico ────────────────────────
  'Dark ciano com grid técnico': {
    bg: '#020C1B', bg2: '#051528',
    text: '#E0F7FA', textSub: '#00E5FFAA',
    accent: '#00E5FF', accent2: '#006064',
    titleSize: '0.8rem',
    decoType: 'grid',
  },
  // ── Saúde: Branco clínico verde ───────────────────────────────────
  'Branco clínico verde': {
    bg: '#FFFFFF', bg2: '#F0FFF4',
    text: '#1B5E20', textSub: '#2E7D3288',
    accent: '#43A047', accent2: '#81C784',
    titleSize: '0.8rem',
    decoType: 'cross',
  },
  // ── Advocacia: Serif dourado clássico ─────────────────────────────
  'Serif dourado clássico': {
    bg: '#1C1208', bg2: '#0D0904',
    text: '#F5E6C8', textSub: '#C9A83CAA',
    accent: '#C9A83C', accent2: '#A07820',
    titleSize: '0.75rem',
    decoType: 'serif',
  },
  // ── Faculdade: Roxo com preço e CTA ──────────────────────────────
  'Roxo com preço e CTA': {
    bg: '#2D0057', bg2: '#1A0033',
    text: '#FFFFFF', textSub: '#E1BEF1CC',
    accent: '#BF5AF2', accent2: '#9C27B0',
    titleSize: '0.8rem',
    decoType: 'roxo',
  },
  // ── Fallback padrão ───────────────────────────────────────────────
  'Automático por nicho': {
    bg: '#111827', bg2: '#1F2937',
    text: '#F9FAFB', textSub: '#9CA3AFCC',
    accent: '#6366F1', accent2: '#4338CA',
    titleSize: '0.8rem',
    decoType: 'clean',
  },
};

// Mapear nicho → template preferido
const NICHO_DEFAULT_TEMPLATE: Record<string, string> = {
  academia:    'Diagonal bold vermelho',
  prefeitura:  'Institucional azul com faixas BR',
  evento:      'Dark neon magenta',
  minimalista: 'Branco serif elegante',
  futurista:   'Dark ciano com grid técnico',
  saude:       'Branco clínico verde',
  advocacia:   'Serif dourado clássico',
  faculdade:   'Roxo com preço e CTA',
  geral:       'Automático por nicho',
};

function resolveTemplate(nicho: string, templateName?: string): TemplateStyle {
  const name = templateName || NICHO_DEFAULT_TEMPLATE[nicho] || 'Automático por nicho';
  return TEMPLATES[name] || TEMPLATES['Automático por nicho'];
}

// ─── Decorações CSS por tipo de template ──────────────────────────
function DecoLayer({ tpl, tipo }: { tpl: TemplateStyle; tipo: string }) {
  const { decoType, accent, accent2 } = tpl;

  if (decoType === 'diagonal') {
    // Faixa diagonal vermelha no canto
    return (
      <>
        <div className="absolute top-0 right-0 w-0 h-0"
          style={{ borderLeft: '60px solid transparent', borderTop: `60px solid ${accent}` }} />
        <div className="absolute bottom-0 left-0 w-0 h-0"
          style={{ borderRight: '40px solid transparent', borderBottom: `40px solid ${accent}44` }} />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />
      </>
    );
  }
  if (decoType === 'faixas') {
    // Faixas verde+amarelo Brasil
    return (
      <>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />
        <div className="absolute top-1 left-0 right-0 h-0.5" style={{ background: accent2 }} />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: accent }} />
        <div className="absolute bottom-1 left-0 right-0 h-0.5" style={{ background: accent2 }} />
        <div className="absolute top-2 left-0 bottom-2 w-0.5" style={{ background: accent2 + '55' }} />
      </>
    );
  }
  if (decoType === 'neon') {
    // Borda neon pulsante
    return (
      <>
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${accent}33, 0 0 20px ${accent}22` }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent2}, transparent)` }} />
      </>
    );
  }
  if (decoType === 'grid') {
    // Grid técnico ciano
    return (
      <>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(${accent}44 1px, transparent 1px), linear-gradient(90deg, ${accent}44 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: accent }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: accent2 }} />
      </>
    );
  }
  if (decoType === 'cross') {
    // Cruz médica no canto
    return (
      <>
        <div className="absolute top-2 right-2 opacity-20 pointer-events-none" style={{ color: accent }}>
          <span style={{ fontSize: '18px' }}>✚</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})` }} />
      </>
    );
  }
  if (decoType === 'serif') {
    // Ornamento clássico dourado
    return (
      <>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${accent2}, transparent)` }} />
        <div className="absolute top-3 left-3 text-[8px]" style={{ color: accent, opacity: 0.4 }}>⟡</div>
        <div className="absolute top-3 right-3 text-[8px]" style={{ color: accent, opacity: 0.4 }}>⟡</div>
      </>
    );
  }
  if (decoType === 'roxo') {
    // Gradiente roxo com brilho
    return (
      <>
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-xl pointer-events-none"
          style={{ background: accent + '33' }} />
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${accent2}, ${accent})` }} />
      </>
    );
  }
  // clean / default
  return <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: accent }} />;
}

// ─── Export Canvas PNG ─────────────────────────────────────────────
function exportPNG(slide: Slide, tpl: TemplateStyle, formato: '1080x1440' | '1080x1920') {
  const [w, h] = formato.split('x').map(Number);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Fundo
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, tpl.bg); grad.addColorStop(1, tpl.bg2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

  // Faixa de acento topo
  ctx.fillStyle = tpl.accent; ctx.fillRect(0, 0, w, 10);

  // Decoração diagonal
  if (tpl.decoType === 'diagonal') {
    ctx.fillStyle = tpl.accent;
    ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w - 200, 0); ctx.lineTo(w, 200);
    ctx.closePath(); ctx.fill();
    // Linha vertical esquerda
    ctx.fillStyle = tpl.accent; ctx.fillRect(0, 0, 12, h);
  }

  // Grid técnico
  if (tpl.decoType === 'grid') {
    ctx.strokeStyle = tpl.accent + '33'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  // Badge número
  ctx.fillStyle = tpl.accent + '33'; ctx.fillRect(60, 60, 80, 40);
  ctx.fillStyle = tpl.accent; ctx.font = `bold 22px Inter,sans-serif`; ctx.textAlign = 'center';
  ctx.fillText(String(slide.num), 100, 86);

  // Tipo
  ctx.fillStyle = tpl.accent; ctx.font = `bold 18px Inter,sans-serif`; ctx.textAlign = 'left';
  ctx.fillText(slide.tipo.toUpperCase(), 160, 86);

  // Linha
  ctx.fillStyle = tpl.accent; ctx.fillRect(60, 120, 120, 5);

  // Título
  ctx.fillStyle = tpl.text; ctx.textAlign = 'center';
  const titleFontSize = slide.tipo === 'capa' ? 72 : 58;
  ctx.font = `900 ${titleFontSize}px Inter,sans-serif`;
  const maxW = w - 120; const words = slide.titulo.split(' ');
  const lines: string[] = []; let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW) { lines.push(line); line = word; } else { line = test; }
  } lines.push(line);
  const lh = slide.tipo === 'capa' ? 88 : 72;
  let y = h * 0.4 - (lines.length * lh) / 2;
  for (const l of lines) { ctx.fillText(l, w / 2, y); y += lh; }

  // Corpo
  ctx.fillStyle = tpl.textSub; ctx.font = `38px Inter,sans-serif`;
  const bodyWords = slide.corpo.split(' '); const bodyLines: string[] = []; let bodyLine = '';
  for (const bw of bodyWords) {
    const test = bodyLine ? `${bodyLine} ${bw}` : bw;
    if (ctx.measureText(test).width > maxW) { bodyLines.push(bodyLine); bodyLine = bw; } else { bodyLine = test; }
  } bodyLines.push(bodyLine);
  bodyLines.slice(0, 7).forEach((l, i) => { ctx.fillText(l, w / 2, h * 0.65 + i * 52); });

  // CTA button
  if (slide.tipo === 'cta') {
    const bx = w / 2 - 160; const by = h * 0.82;
    ctx.fillStyle = tpl.accent; ctx.fillRect(bx, by, 320, 72);
    ctx.fillStyle = '#FFFFFF'; ctx.font = `bold 32px Inter,sans-serif`;
    ctx.fillText('SAIBA MAIS →', w / 2, by + 46);
  }

  // Faixa rodapé
  ctx.fillStyle = tpl.accent; ctx.fillRect(0, h - 10, w, 10);

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `slide-${slide.num}-${slide.tipo}.png`;
    a.click(); URL.revokeObjectURL(url);
  }, 'image/png');
}

// ─── Card de Preview ───────────────────────────────────────────────
interface SlidePreviewProps {
  slide: Slide;
  nicho?: string;
  template?: string;
  formato?: '1080x1440' | '1080x1920';
}

export function SlidePreviewCard({ slide, nicho = 'geral', template, formato = '1080x1440' }: SlidePreviewProps) {
  const tpl = resolveTemplate(nicho, template);
  const aspectRatio = formato === '1080x1440' ? 3 / 4 : 9 / 16;
  const isLight = tpl.decoType === 'clean' || tpl.decoType === 'cross';

  return (
    <div className="group relative flex flex-col items-center gap-2">
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-xl transition-transform duration-200 group-hover:scale-[1.02]"
        style={{ aspectRatio, background: `linear-gradient(135deg, ${tpl.bg} 0%, ${tpl.bg2} 100%)` }}
      >
        {/* Decorações específicas do template */}
        <DecoLayer tpl={tpl} tipo={slide.tipo} />

        {/* Badge número + tipo */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: tpl.accent + '44', color: tpl.accent }}>
            {slide.num}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: tpl.accent }}>
            {slide.tipo}
          </span>
        </div>

        {/* Linha de acento */}
        <div className="absolute left-2.5 top-10 w-5 h-0.5" style={{ background: tpl.accent }} />

        {/* Conteúdo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center gap-1.5 z-10">
          <h3
            className="font-black leading-snug"
            style={{ color: tpl.text, fontSize: tpl.titleSize, textShadow: isLight ? 'none' : '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            {slide.titulo}
          </h3>
          <p className="leading-tight line-clamp-4 text-[0.58rem]" style={{ color: tpl.textSub }}>
            {slide.corpo}
          </p>
          {slide.tipo === 'cta' && (
            <div className="mt-1 px-2.5 py-0.5 rounded text-[0.55rem] font-bold"
              style={{ background: tpl.accent, color: isLight ? '#fff' : '#fff' }}>
              SAIBA MAIS →
            </div>
          )}
        </div>
      </div>

      {/* Botão download */}
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs h-7 opacity-0 group-hover:opacity-100 transition-all duration-200"
        onClick={() => exportPNG(slide, tpl, formato)}
      >
        <Download className="w-3 h-3 mr-1" /> Baixar PNG
      </Button>
    </div>
  );
}

// ─── Grid de Slides ────────────────────────────────────────────────
interface SlideGridProps {
  slides: Slide[];
  nicho?: string;
  template?: string;
  formato?: '1080x1440' | '1080x1920';
}

export function SlideGrid({ slides, nicho = 'geral', template, formato = '1080x1440' }: SlideGridProps) {
  const tpl = resolveTemplate(nicho, template);
  const templateName = template || NICHO_DEFAULT_TEMPLATE[nicho] || 'Automático por nicho';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{slides.length} slides gerados</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: tpl.accent + '22', color: tpl.accent, border: `1px solid ${tpl.accent}44` }}>
            {templateName}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slides.map((slide) => (
          <SlidePreviewCard
            key={slide.num}
            slide={slide}
            nicho={nicho}
            template={template}
            formato={formato}
          />
        ))}
      </div>
    </div>
  );
}
