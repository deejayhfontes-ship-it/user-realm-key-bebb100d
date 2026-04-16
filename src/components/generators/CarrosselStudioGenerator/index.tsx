import { useState, useCallback, useRef } from 'react';
import {
  Layers,
  Play,
  BookOpen,
  FileImage,
  ArrowRight,
  LayoutGrid,
  Sparkles,
  Loader2,
  Download,
  Copy,
  Check,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WEBHOOK_URL = 'https://n8n.srv1489998.hstgr.cloud/webhook/carrossel-studio-squad';

const CLOUDINARY = {
  cloudName: 'ddto8zcma',
  uploadPreset: 'carrossel_slides',
  apiKey: '432465428693172',
};

interface Slide {
  index: number;
  url: string;
  title: string;
  content: string;
  cloudinaryUrl?: string;
}

interface GenerationResult {
  slides: Slide[];
  caption?: string;
  hashtags?: string;
  hook?: string;
}

const FORMAT_OPTIONS = [
  { id: 'square',    label: 'Feed 1:1',    w: 1080, h: 1080, icon: '⬛', desc: '1080 × 1080px' },
  { id: 'portrait',  label: 'Retrato 3:4', w: 1080, h: 1440, icon: '📱', desc: '1080 × 1440px' },
  { id: 'landscape', label: 'Widescreen',  w: 1920, h: 1080, icon: '🖥️', desc: '1920 × 1080px' },
] as const;

type FormatId = typeof FORMAT_OPTIONS[number]['id'];

const PIPELINE_STEPS = [
  { id: 1, emoji: '🔎', agent: 'Pedro Pauta',    title: 'Pesquisa de Pautas',  description: 'Busca temas relevantes e tendências do nicho' },
  { id: 2, emoji: '✍️', agent: 'Clara Carrossel', title: 'Copywriting',         description: 'Cria hook, slides, caption e hashtags' },
  { id: 3, emoji: '🎨', agent: 'Diego Design',    title: 'Design Visual',       description: 'Gera o HTML/CSS de cada slide' },
  { id: 4, emoji: '📸', agent: 'Igor Imagem',     title: 'Renderização',        description: 'Converte slides em imagens JPEG' },
  { id: 5, emoji: '✅', agent: 'Vera Veredito',   title: 'Revisão de Qualidade', description: 'Pontua o conteúdo e aprova' },
];

export function CarrosselStudioGenerator() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents'>('overview');
  const [topic, setTopic] = useState('');
  const [nicho, setNicho] = useState('marketing digital');
  const [status, setStatus] = useState<'idle' | 'loading' | 'rendering' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [renderProgress, setRenderProgress] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<FormatId>('square');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentFormat = FORMAT_OPTIONS.find(f => f.id === selectedFormat) ?? FORMAT_OPTIONS[0];

  /* ── Renderiza slide como imagem via Canvas (Design System: Diego Design) ── */
  const renderSlideToCanvas = useCallback((slide: Slide, slideCount: number, W = 1080, H = 1080): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      const scaleX = W / 1080;
      const scaleY = H / 1080;
      const px = (n: number) => Math.round(n * scaleX);
      const py = (n: number) => Math.round(n * scaleY);

      // ── DESIGN TOKENS (Diego Design System) ──
      const BG      = '#0D0D0D'; // preto fundo
      const CARD    = '#1A1A1A'; // card escuro
      const ACCENT  = '#C9FF4D'; // verde-lima elétrico
      const TEXT    = '#FFFFFF'; // branco
      const MUTED   = '#888888'; // texto secundário

      // 1. Fundo principal
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // 2. Card de conteúdo (ocupa área central)
      const cardX = px(72);
      const cardY = py(160);
      const cardW = W - px(144);
      const cardH = H - py(320);
      ctx.fillStyle = CARD;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, px(16));
      ctx.fill();

      // 3. Accent bar vertical (4px à esquerda do card)
      ctx.fillStyle = ACCENT;
      ctx.fillRect(cardX, cardY + py(32), px(4), py(48));

      // 4. Número do slide — grande, no canto inferior direito do card (watermark)
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = TEXT;
      ctx.font = `900 ${px(280)}px Arial, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(String(slide.index), cardX + cardW - px(32), cardY + cardH - py(16));
      ctx.globalAlpha = 1;

      // 5. Título (Space Grotesk bold - equivalente Arial bold)
      ctx.fillStyle = TEXT;
      ctx.font = `700 ${px(52)}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      const titleY = cardY + py(72);
      const titleLines = wrapTextLines(ctx, slide.title || `Slide ${slide.index}`, cardX + px(32), cardW - px(64), px(64));
      let currentY = titleY;
      for (const line of titleLines) {
        ctx.fillText(line, cardX + px(32), currentY);
        currentY += px(64);
      }

      // 6. Linha separadora verde-lima
      const sepY = currentY + py(24);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(cardX + px(32), sepY, px(48), px(4));

      // 7. Conteúdo / body text
      ctx.fillStyle = 'rgba(255,255,255,0.80)';
      ctx.font = `500 ${px(32)}px Arial, sans-serif`;
      const contentY = sepY + py(40);
      const contentLines = wrapTextLines(ctx, slide.content || '', cardX + px(32), cardW - px(64), px(44));
      let cy2 = contentY;
      for (const line of contentLines.slice(0, 7)) { // max 7 linhas
        ctx.fillText(line, cardX + px(32), cy2);
        cy2 += py(44);
      }

      // 8. Badge de índice (topo esquerdo, verde)
      const badgeLabel = `${slide.index} / ${slideCount}`;
      ctx.font = `700 ${px(22)}px Arial, sans-serif`;
      const badgeW2 = ctx.measureText(badgeLabel).width + px(32);
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.roundRect(px(72), py(84), badgeW2, py(40), py(20));
      ctx.fill();
      ctx.fillStyle = '#0D0D0D';
      ctx.textAlign = 'left';
      ctx.fillText(badgeLabel, px(88), py(110));

      // 9. Footer branding
      ctx.fillStyle = MUTED;
      ctx.font = `500 ${px(20)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('FONTES GRAPHICS • DESIGN DO FUTURO', W / 2, H - py(40));

      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.93);
    });
  }, []);

  /* ── Quebra texto em array de linhas ── */
  function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, _x: number, maxW: number, _lineH: number): string[] {
    const words = (text || '').split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = test;
      }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  /* ── Upload para Cloudinary ── */
  const uploadToCloudinary = async (blob: Blob, slideIndex: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', blob, `slide-${slideIndex}.jpg`);
    formData.append('upload_preset', CLOUDINARY.uploadPreset);
    formData.append('folder', 'carrossel-studio');
    formData.append('api_key', CLOUDINARY.apiKey);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url || data.url || '';
    } catch {
      // Se falhar, retorna URL local do blob
      return URL.createObjectURL(blob);
    }
  };

  /* ── Gerar carrossel ── */
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    setActiveStep(1);

    // simula progresso visual enquanto n8n processa
    const timer = setInterval(() => {
      setActiveStep((s) => (s < 5 ? s + 1 : s));
    }, 18000); // ~90s total para 5 etapas

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), nicho }),
      });

      clearInterval(timer);

      if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);

      const data = await res.json();

      // normaliza diferentes formatos que o n8n pode retornar
      const slides: Slide[] = normalizeSlides(data);

      const caption = data.caption ?? data.legenda ?? '';
      const hashtags = data.hashtags ?? data.tags ?? '';
      const hook = data.hook ?? '';

      // Primeiro mostra resultado com placeholders
      setResult({ slides, caption, hashtags, hook });
      setStatus('rendering');
      setRenderProgress('Renderizando slides...');

      // Renderiza cada slide via Canvas e faz upload ao Cloudinary
      const fmt = FORMAT_OPTIONS.find(f => f.id === selectedFormat) ?? FORMAT_OPTIONS[0];
      const renderedSlides: Slide[] = [];
      for (let i = 0; i < slides.length; i++) {
        setRenderProgress(`Renderizando slide ${i + 1} de ${slides.length} (${fmt.desc})...`);
        const blob = await renderSlideToCanvas(slides[i], slides.length, fmt.w, fmt.h);
        const cloudUrl = await uploadToCloudinary(blob, slides[i].index);
        renderedSlides.push({
          ...slides[i],
          url: cloudUrl || slides[i].url,
          cloudinaryUrl: cloudUrl,
        });
      }

      setResult({ slides: renderedSlides, caption, hashtags, hook });
      setStatus('done');
      setActiveStep(5);
    } catch (err: unknown) {
      clearInterval(timer);
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorMsg(msg);
      setStatus('error');
      setActiveStep(0);
    }
  };

  /* normaliza diferentes formatos de resposta do n8n */
  const normalizeSlides = (data: unknown): Slide[] => {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d?.slides)) {
      return (d.slides as Array<Record<string, unknown>>).map((s, i) => ({
        index: (s.index as number) || i + 1,
        url: (s.url as string) || `https://placehold.co/1080x1080/1a1a2e/ffffff?text=Slide+${i + 1}`,
        title: (s.title as string) || (s.titulo as string) || `Slide ${i + 1}`,
        content: (s.content as string) || (s.texto as string) || '',
      }));
    }
    return [{ index: 1, url: '', title: 'Sem dados', content: '' }];
  };

  /* ── Copiar caption + hashtags ── */
  const handleCopy = () => {
    const text = [result?.caption, result?.hashtags].filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Download imagem ── */
  const handleDownload = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `slide-${idx}.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    } catch {
      // fallback: abre em nova aba
      window.open(url, '_blank');
    }
  };

  /* ── Download todos ── */
  const handleDownloadAll = async () => {
    if (!result) return;
    for (let i = 0; i < result.slides.length; i++) {
      await handleDownload(result.slides[i].url, result.slides[i].index);
      if (i < result.slides.length - 1) await new Promise(r => setTimeout(r, 800));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Hero */}
      <div className="rounded-3xl p-8 bg-foreground text-background flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-background/15 flex items-center justify-center flex-shrink-0">
          <Layers className="w-8 h-8 text-background" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-background">Carrossel Studio</h1>
            <span className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border',
              status === 'done'
                ? 'bg-emerald-500/20 text-background border-emerald-400/30'
                : 'bg-background/20 text-background border-background/30'
            )}>
              {status === 'loading' ? '⚙️ Gerando...' : status === 'rendering' ? '🎨 Renderizando...' : status === 'done' ? '✅ Pronto' : '🤖 Powered by n8n'}
            </span>
          </div>
          <p className="text-background/75 leading-relaxed">
            Squad de IA completo para criar carrosséis — pesquisa, copy, design e renderização
            com o Gemini 3.1 Pro. Imagens entregues via Cloudinary.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {(['overview', 'agents'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'overview' ? '🎯 Visão Geral' : '🤖 Agentes'}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Formatos de saída */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Formato de exportação
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  disabled={status === 'loading' || status === 'rendering'}
                  className={cn(
                    'soft-card p-4 border text-left transition-all rounded-2xl hover:border-foreground/40 disabled:opacity-50',
                    selectedFormat === fmt.id
                      ? 'border-foreground bg-foreground/5 ring-2 ring-foreground/20'
                      : 'border-border'
                  )}
                >
                  <span className="text-2xl mb-2 block">{fmt.icon}</span>
                  <p className="font-semibold text-foreground text-sm">{fmt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt.desc}</p>
                  {selectedFormat === fmt.id && (
                    <span className="text-xs text-foreground font-semibold mt-1 block">✓ Selecionado</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Pipeline com progresso */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Pipeline de produção — 5 checkpoints
            </h2>
            <div className="space-y-3">
              {PIPELINE_STEPS.map((step, idx) => {
                const done = status === 'loading' ? idx < activeStep : status === 'done';
                const active = status === 'loading' && idx === activeStep - 1;
                return (
                  <div key={step.id} className="relative">
                    {idx < PIPELINE_STEPS.length - 1 && (
                      <div className={cn(
                        'absolute left-5 top-12 w-px h-4 transition-colors',
                        done ? 'bg-emerald-500/60' : 'bg-border/70'
                      )} />
                    )}
                    <div className={cn(
                      'soft-card p-4 flex items-start gap-4 transition-all',
                      active && 'ring-2 ring-foreground/20 bg-muted/50',
                      done && 'opacity-70'
                    )}>
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-colors',
                        active ? 'bg-foreground text-background animate-pulse' : 'bg-muted'
                      )}>
                        {done && !active ? '✅' : step.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-foreground">{step.agent}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{step.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 flex-shrink-0">
                        {idx + 1}/5
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Resultado ── */}
          {(status === 'done' || status === 'rendering') && result && (
            <section className="space-y-4">
              {/* Hook */}
              {result.hook && (
                <div className="soft-card p-5 border border-border bg-gradient-to-r from-orange-500/10 to-pink-500/10">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">🎣 Hook</p>
                  <p className="text-lg font-bold text-foreground leading-snug">{result.hook}</p>
                </div>
              )}

              {status === 'rendering' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {renderProgress}
                </div>
              )}

              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Slides gerados — {result.slides.length} imagens
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {result.slides.map((slide) => (
                  <div key={slide.index} className="group relative rounded-2xl overflow-hidden border border-border aspect-square bg-muted">
                    {slide.cloudinaryUrl || slide.url ? (
                      <img
                        src={slide.cloudinaryUrl || slide.url}
                        alt={slide.title || `Slide ${slide.index}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-4xl font-bold text-white/10 mb-2">{slide.index}</span>
                        <p className="text-white font-bold text-sm mb-1 line-clamp-2">{slide.title}</p>
                        <p className="text-white/60 text-xs line-clamp-3">{slide.content}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5 text-xs"
                        onClick={() => handleDownload(slide.cloudinaryUrl || slide.url, slide.index)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar
                      </Button>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
                      {slide.index}
                    </span>
                    <span className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs rounded-lg px-2 py-1 line-clamp-1">
                      {slide.title}
                    </span>
                  </div>
                ))}
              </div>

              {(result.caption || result.hashtags) && (
                <div className="soft-card p-5 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-sm">Caption + Hashtags</p>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={handleCopy}>
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  {result.caption && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.caption}</p>}
                  {result.hashtags && <p className="text-xs text-blue-500 font-medium">{result.hashtags}</p>}
                </div>
              )}
            </section>
          )}

          {/* ── Erro ── */}
          {status === 'error' && (
            <div className="soft-card p-5 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">Falha na geração</p>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verifique se o workflow n8n está ativo e as credenciais configuradas.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Agentes ── */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          {[
            { emoji: '🔎', name: 'Pedro Pauta',    role: 'Pesquisador',          desc: 'Busca pautas trending e ranqueia as 5 melhores para o nicho escolhido.' },
            { emoji: '✍️', name: 'Clara Carrossel', role: 'Copywriter',           desc: 'Gera hook, slides, caption e hashtags. Define ângulo e tom de voz.' },
            { emoji: '🎨', name: 'Diego Design',    role: 'Designer Visual',      desc: 'Cria HTML/CSS auto-contido para cada slide respeitando o design system.' },
            { emoji: '📸', name: 'Igor Imagem',     role: 'Renderizador',         desc: 'Converte HTML em JPEG 1080px e faz upload no Cloudinary.' },
            { emoji: '✅', name: 'Vera Veredito',   role: 'Revisora de Qualidade', desc: 'Pontua copy (hook, CTA) e design (hierarquia, contraste). Aprova ou solicita loop de correção.' },
          ].map((agent) => (
            <div key={agent.name} className="soft-card p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {agent.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{agent.name}</span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {agent.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CTA — campo de tema + botão ── */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && status !== 'loading' && handleGenerate()}
            placeholder="Qual o tema do carrossel? Ex: dicas de produtividade"
            disabled={status === 'loading'}
            className="flex-1 rounded-full px-5 h-11 border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
          />
          <select
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            disabled={status === 'loading'}
            className="rounded-full px-4 h-11 border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
          >
            <option value="marketing digital">📣 Marketing</option>
            <option value="tecnologia">💻 Tecnologia</option>
            <option value="saúde e bem-estar">🌿 Saúde</option>
            <option value="educação">📚 Educação</option>
            <option value="negócios">💼 Negócios</option>
            <option value="moda">👗 Moda</option>
          </select>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={status === 'loading' || !topic.trim()}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 h-11 shadow-sm disabled:opacity-50"
          >
            {status === 'loading' || status === 'rendering' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {status === 'rendering' ? 'Renderizando...' : 'Gerando... (~90s)'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {status === 'done' ? 'Gerar Novamente' : 'Iniciar Geração'}
              </>
            )}
          </Button>
          {status === 'done' && result && result.slides.length > 0 && (
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              className="gap-2 rounded-full px-6 h-11"
            >
              <Download className="w-4 h-4" />
              Baixar Todos ({result.slides.length})
            </Button>
          )}
          {status === 'idle' && (
            <Button variant="outline" className="gap-2 rounded-full px-6 h-11" disabled>
              <BookOpen className="w-4 h-4" />
              Ver Documentação
            </Button>
          )}
        </div>

        {(status === 'loading' || status === 'rendering') && (
          <p className="text-xs text-muted-foreground px-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            {status === 'rendering'
              ? renderProgress || 'Renderizando slides e enviando ao Cloudinary...'
              : 'O Gemini 3.1 Pro está pesquisando, escrevendo e renderizando seus slides...'}
          </p>
        )}
      </div>
    </div>
  );
}

export default CarrosselStudioGenerator;
