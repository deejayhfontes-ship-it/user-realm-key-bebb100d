import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

// Assets salvos localmente do Figma dev mode
import imgLogoCras from '@/assets/prefeitura/arte/logo-cras-itinerante.png';
import imgVan      from '@/assets/prefeitura/arte/van-cras.png';
import imgRodape   from '@/assets/prefeitura/arte/rodape-cras.png';

// ────────────────────────────────────────────────────────────────────────────
// O Figma original tem 1080×1350. Nosso canvas será 1080×1440.
// Fator de escala vertical: 1440/1350 ≈ 1.0667 — aplicado a todos os Y.
// ────────────────────────────────────────────────────────────────────────────
const W  = 1080;
const H  = 1440;
const SY = H / 1350;  // escala vertical ≈ 1.067

// Posições do Figma (Y escaladas)
const LOGO_X = 53;  const LOGO_Y = 42  * SY;  const LOGO_W = 498; const LOGO_H = 268 * SY;
const DATE_X = W - 50; // alinhado à direita
const DATE_Y = (80 + 40) * SY;
const TITLE_X = 80; const TITLE_Y = 350 * SY;
const BAIRRO_X = 80; const BAIRRO_Y = 589 * SY;
const VAN_X  = 353 + 51; const VAN_Y_F  = (324 + 233) * SY;
const VAN_W  = 717; const VAN_H_F  = 665 * SY;
const DESC_X = 80;  const DESC_Y  = 759 * SY;
const RP_Y   = (324 + 923) * SY;   // rodapé original: y=1247*SY → clampado
const RP_H   = 104 * SY;

interface Campos {
  bairro: string;
  data: string;
  hora: string;
  local: string;
  texto: string;
}

const DEFAULT: Campos = {
  bairro: 'bairro da floresta',
  data: '22 MARÇO',
  hora: '13H',
  local: 'bairro da floresta',
  texto:
    'Participe de uma tarde especial de acolhimento, informação e convivência para toda a comunidade. Será um momento para esclarecer dúvidas, conhecer serviços, fortalecer vínculos e garantir direitos. Sua presença é muito importante.\nEsperamos por você!',
};

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(r => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload  = () => r(i);
    i.onerror = () => r(null);
    i.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? `${line} ${word}` : word;
      if (ctx.measureText(t).width <= maxW) line = t;
      else { if (line) out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}

export default function CrasItineranteGerador() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [campos, setCampos] = useState<Campos>(DEFAULT);

  const render = useCallback(async () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    cv.width = W; cv.height = H;
    ctx.clearRect(0, 0, W, H);

    const [logo, van, rodape] = await Promise.all([
      loadImg(imgLogoCras),
      loadImg(imgVan),
      loadImg(imgRodape),
    ]);

    // ══════════════════════════════════════════════════════════════════════
    // 1. FUNDO — estética refe001: branco (sup-esq) → ciano vibrante (sup-dir)
    // ══════════════════════════════════════════════════════════════════════
    const bg = ctx.createLinearGradient(0, 0, W, H * 0.6);
    bg.addColorStop(0.00, '#ffffff');
    bg.addColorStop(0.20, '#e2f5ff');
    bg.addColorStop(0.55, '#a5e5f5');
    bg.addColorStop(1.00, '#b8eef5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Bloom ciano superior-direito (refe001)
    const gc = ctx.createRadialGradient(W * 0.88, H * 0.06, 0, W * 0.88, H * 0.06, W * 0.72);
    gc.addColorStop(0, 'rgba(100, 220, 245, 0.50)');
    gc.addColorStop(0.5, 'rgba(100, 210, 235, 0.20)');
    gc.addColorStop(1, 'rgba(100, 210, 235, 0)');
    ctx.fillStyle = gc;
    ctx.fillRect(0, 0, W, H);

    // Fade branco na base (rodapé fica em área mais clara)
    const gf = ctx.createLinearGradient(0, H * 0.70, 0, H);
    gf.addColorStop(0, 'rgba(255,255,255,0)');
    gf.addColorStop(1, 'rgba(255,255,255,0.92)');
    ctx.fillStyle = gf;
    ctx.fillRect(0, H * 0.70, W, H * 0.30);

    // ══════════════════════════════════════════════════════════════════════
    // 2. TEXTO OUTLINE DECORATIVO — estética refe001 (outline gigante no topo)
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = '#005fad';
    ctx.lineWidth = 2;
    ctx.font = '900 500px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.strokeText('CRAS', W + 30, 390);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // 3. LOGO CRAS ITINERANTE — coordenadas Figma (topo esquerdo)
    // ══════════════════════════════════════════════════════════════════════
    if (logo) {
      ctx.drawImage(logo, LOGO_X, LOGO_Y, LOGO_W, LOGO_H);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. DATA · HORA · LOCAL — topo direito (Figma: x=80+616=696, y=80)
    //    Fonte: Inter Black 40px + Medium 32px, cor #0771b6
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = '900 40px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0771b6';
    ctx.fillText(`${campos.data} ${campos.hora}`, DATE_X, DATE_Y);
    ctx.font = '500 32px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0771b6';
    ctx.fillText(campos.local, DATE_X, DATE_Y + 44);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // 5. HEADLINE "O CRAS vai até você!"
    //    Figma: x=80, y=350, 96px ExtraBold, gradiente #043555→#0771b6
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.textAlign = 'left';
    const titleGrad = ctx.createLinearGradient(0, TITLE_Y - 96, 0, TITLE_Y + 96);
    titleGrad.addColorStop(0, '#043555');
    titleGrad.addColorStop(1, '#0771b6');
    ctx.fillStyle = titleGrad;
    ctx.font = '800 96px Inter, Arial, sans-serif';
    ctx.letterSpacing = '-4px';
    ctx.fillText('O CRAS', TITLE_X, TITLE_Y);
    ctx.font = '600 96px Inter, Arial, sans-serif';
    ctx.fillText('vai até você!', TITLE_X, TITLE_Y + 108);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // 6. BAIRRO — editável, Figma: x=80, y=589, 64px Bold, #0771b6
    //    max-width ≈ 430px (metade esquerda, van fica à direita)
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '700 64px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0771b6';
    const bLines = wrapText(ctx, campos.bairro.toLowerCase(), 430);
    let by = BAIRRO_Y;
    for (const line of bLines) {
      ctx.fillText(line, BAIRRO_X, by);
      by += 76;
    }
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // 7. VAN CRAS — direita, coordenadas Figma escaladas
    //    Original: left=404, top=557(escalado), w=717, h=665(escalado)
    // ══════════════════════════════════════════════════════════════════════
    if (van) {
      // Mantém proporção original da imagem
      const ratio = van.height / van.width;
      const vw = VAN_W;
      const vh = Math.min(vw * ratio, VAN_H_F * 1.05);
      ctx.drawImage(van, VAN_X - 10, VAN_Y_F - 40, vw, vh);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 8. TEXTO DESCRITIVO — Figma: x=80, y=759, 24px Medium, #0771b6
    // ══════════════════════════════════════════════════════════════════════
    if (campos.texto) {
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = '500 26px Inter, Arial, sans-serif';
      ctx.fillStyle = '#0771b6';
      const dLines = wrapText(ctx, campos.texto, 400);
      let dy = DESC_Y;
      for (const line of dLines) {
        if (!line) { dy += 16; continue; }
        ctx.fillText(line, DESC_X, dy);
        dy += 38;
      }
      ctx.restore();
    }

    // ══════════════════════════════════════════════════════════════════════
    // 9. RODAPÉ — Figma: y=1247(escalado)→clamp ao final do canvas
    //    Centralizado, h=104*SY
    // ══════════════════════════════════════════════════════════════════════
    if (rodape) {
      const rpY = Math.min(RP_Y, H - RP_H - 10);
      const rpW = (rodape.width / rodape.height) * RP_H;
      const rpX = (W - rpW) / 2;
      ctx.drawImage(rodape, rpX, rpY, rpW, RP_H);
    }

    // Linha fina na base — estética refe001 (turquesa → azul)
    ctx.save();
    const lg = ctx.createLinearGradient(0, H - 10, W, H - 10);
    lg.addColorStop(0,   'rgba(0,113,182,0)');
    lg.addColorStop(0.1, '#0771b6');
    lg.addColorStop(0.9, '#00c8b0');
    lg.addColorStop(1,   'rgba(0,200,176,0)');
    ctx.strokeStyle = lg;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, H - 10);
    ctx.lineTo(W, H - 10);
    ctx.stroke();
    ctx.restore();

  }, [campos]);

  useEffect(() => { render(); }, [render]);

  const set = <K extends keyof Campos>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCampos(p => ({ ...p, [k]: e.target.value }));

  function baixar() {
    const cv = canvasRef.current; if (!cv) return;
    const a = document.createElement('a');
    const slug = campos.bairro.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    a.download = `cras-itinerante-${slug}.png`;
    a.href = cv.toDataURL('image/png', 1.0);
    a.click();
  }

  const inp = `w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800
    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all bg-white`;
  const lbl = 'block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-400';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#e2f5ff 0%,#f0faff 100%)' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/prefeitura/secretarias')}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-slate-700">CRAS Itinerante — Gerador</h1>
            <p className="text-xs text-slate-400">1080 × 1440 · Instagram Portrait</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#0771b6,#00c8b0)' }}>
            <Download className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* ── FORMULÁRIO ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Personalizar Arte</h2>
              <p className="text-sm text-slate-500 mt-0.5">Preview ao vivo · PNG 1080 × 1440</p>
            </div>

            {/* BAIRRO — campo principal */}
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-bairro" className={lbl + ' !text-blue-500'}>
                📍  Nome do Bairro — destaque principal
              </label>
              <input id="f-bairro" type="text" value={campos.bairro} onChange={set('bairro')}
                placeholder="Ex: bairro da floresta"
                className={inp + ' text-xl font-bold text-blue-700'} />
            </div>

            {/* DATA + HORA + LOCAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className={lbl}>Quando e onde (canto superior direito)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="f-data" className="block text-xs text-slate-400 mb-1">Data</label>
                  <input id="f-data" type="text" value={campos.data} onChange={set('data')}
                    placeholder="22 MARÇO" className={inp} />
                </div>
                <div>
                  <label htmlFor="f-hora" className="block text-xs text-slate-400 mb-1">Hora</label>
                  <input id="f-hora" type="text" value={campos.hora} onChange={set('hora')}
                    placeholder="13H" className={inp} />
                </div>
                <div>
                  <label htmlFor="f-local" className="block text-xs text-slate-400 mb-1">Local / referência</label>
                  <input id="f-local" type="text" value={campos.local} onChange={set('local')}
                    placeholder="bairro da floresta" className={inp} />
                </div>
              </div>
            </div>

            {/* TEXTO DESCRITIVO */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-texto" className={lbl}>Texto descritivo</label>
              <textarea id="f-texto" rows={6} value={campos.texto} onChange={set('texto')}
                className={inp + ' resize-none text-sm leading-relaxed'} />
            </div>

            {/* AÇÕES */}
            <div className="flex gap-3">
              <button onClick={() => setCampos(DEFAULT)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all text-sm">
                <RefreshCw className="w-4 h-4" /> Resetar
              </button>
              <button onClick={baixar}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#0771b6,#00c8b0)' }}>
                <Download className="w-5 h-5" /> Baixar PNG (1080 × 1440)
              </button>
            </div>
          </div>

          {/* ── PREVIEW ──────────────────────────────────────────────────── */}
          <div className="sticky top-24">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preview ao vivo</span>
                <span className="text-xs text-slate-300">1080 × 1440 px</span>
              </div>
              <div style={{ aspectRatio: '3/4' }} className="w-full overflow-hidden rounded-xl bg-slate-50">
                <canvas ref={canvasRef}
                  style={{ width: '100%', height: '100%', imageRendering: 'crisp-edges', display: 'block' }} />
              </div>
              <p className="text-center text-xs text-slate-400 mt-3">3:4 · Instagram Portrait</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
