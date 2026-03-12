import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

import imgLogoCras from '@/assets/prefeitura/arte/logo-cras-itinerante.png';
import imgVan      from '@/assets/prefeitura/arte/van-cras.png';
import imgRodape   from '@/assets/prefeitura/arte/rodape-cras.png';
import imgAssist   from '@/assets/prefeitura/arte/LOGO ASSITENCIA SOCIAL.png';

// ─── Canvas 1080 × 1440 ────────────────────────────────────────────────────
const W = 1080;
const H = 1440;

// Posições absolutas (pixel perfeito dentro de 1440)
const LOGO_X = 53;   const LOGO_Y = 46;   const LOGO_W = 490; const LOGO_H = 260;
const DATE_X = W - 60;
const DATE_Y = 100;
const TITLE_X = 80;  const TITLE_Y = 440;          // "O CRAS"
const BAIRRO_X = 80; const BAIRRO_Y = 660;         // "bairro da floresta"
const VAN_X  = 450;  const VAN_Y  = 530;           // van mais à direita
const VAN_W  = 700;
const DESC_X = 80;  const DESC_Y  = 940;           // texto descritivo
const DESC_MAX_WIDTH = 410;                         // ½ esquerda → van ocupa direita
const DESC_LINE_H = 34;
const DESC_MAX_LINES = 8;                           // caber antes do rodapé
const RP_H = 0;   // calculado dinamicamente pelo aspect ratio
const RP_Y = 1250;                                      // rodapé fixo no fundo

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
  local: 'Praça Principal',
  texto:
    'Participe de uma tarde especial de acolhimento, informação e convivência para toda a comunidade. Esclareça dúvidas, conheça serviços, fortaleça vínculos e garanta direitos.\nEsperamos por você!',
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { if (out.length < maxLines) out.push(''); continue; }
    let line = '';
    for (const word of para.split(' ')) {
      if (out.length >= maxLines) break;
      const t = line ? `${line} ${word}` : word;
      if (ctx.measureText(t).width <= maxW) line = t;
      else { if (line) out.push(line); line = word; }
    }
    if (line && out.length < maxLines) out.push(line);
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

    const [logo, van, rodape, assist] = await Promise.all([
      loadImg(imgLogoCras),
      loadImg(imgVan),
      loadImg(imgRodape),
      loadImg(imgAssist),
    ]);

    // ── 1. FUNDO — estética refe001 ────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.55);
    bg.addColorStop(0.00, '#ffffff');
    bg.addColorStop(0.25, '#e4f5fc');
    bg.addColorStop(0.60, '#aaeaf7');
    bg.addColorStop(1.00, '#b5eef7');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Bloom ciano superior-direito
    const gc = ctx.createRadialGradient(W * 0.85, H * 0.07, 0, W * 0.85, H * 0.07, W * 0.75);
    gc.addColorStop(0, 'rgba(80, 215, 245, 0.52)');
    gc.addColorStop(0.5, 'rgba(90, 210, 240, 0.22)');
    gc.addColorStop(1, 'rgba(90, 210, 240, 0)');
    ctx.fillStyle = gc;
    ctx.fillRect(0, 0, W, H);

    // Fade branco na base (área do rodapé)
    const gf = ctx.createLinearGradient(0, H * 0.68, 0, H);
    gf.addColorStop(0, 'rgba(255,255,255,0)');
    gf.addColorStop(1, 'rgba(255,255,255,0.94)');
    ctx.fillStyle = gf;
    ctx.fillRect(0, H * 0.68, W, H * 0.32);

    // ── 2. TEXTO OUTLINE DECORATIVO (refe001) ─────────────────────────────
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#005fad';
    ctx.lineWidth = 3;
    ctx.font = '900 520px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.strokeText('CRAS', W + 40, 400);
    ctx.restore();

    // ── 3. LOGO CRAS ITINERANTE (topo esquerdo) ───────────────────────────
    if (logo) {
      ctx.drawImage(logo, LOGO_X, LOGO_Y, LOGO_W, LOGO_H);
    }

    // ── 4. DATA · HORA  (topo direito) ─────────────────────
    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = '900 52px Inter, Arial, sans-serif';
    ctx.fillStyle = '#022b44';
    ctx.strokeStyle = '#022b44';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.strokeText(`${campos.data} ${campos.hora}`, DATE_X, DATE_Y);
    ctx.fillText(`${campos.data} ${campos.hora}`, DATE_X, DATE_Y);
    ctx.font = '700 34px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0771b6';
    ctx.fillText(campos.local, DATE_X, DATE_Y + 60);
    ctx.restore();

    // ── 5. HEADLINE ─────────────────────────────────────────────────────────
    ctx.save();
    ctx.textAlign = 'left';
    // "O CRAS" — navy, extra-bold
    ctx.fillStyle = '#022b44';
    ctx.font = 'bold 110px Inter, Arial, sans-serif';
    ctx.strokeStyle = '#022b44';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.strokeText('O CRAS', TITLE_X - 5, TITLE_Y);
    ctx.fillText('O CRAS', TITLE_X - 5, TITLE_Y);
    // "vai até você!" — azul, menor
    ctx.fillStyle = '#0771b6';
    ctx.font = 'bold 65px Inter, Arial, sans-serif';
    ctx.fillText('vai até você!', TITLE_X, TITLE_Y + 72);
    ctx.restore();

    // ── 6. BAIRRO editável — tarja azul alinhada + texto branco ──────────────
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle'; // centraliza verticalmente na tarja
    const BFONT = 56;
    ctx.font = `bold ${BFONT}px Inter, Arial, sans-serif`;
    const bLines = wrapText(ctx, campos.bairro, 380, 3);
    const TARJA_PAD_X = 18;
    const TARJA_PAD_V = 12;
    const LINE_H = BFONT + 14;
    // 1º: tarjas — centradas no ponto by (meio do texto)
    let by = BAIRRO_Y;
    for (const line of bLines) {
      const tw = ctx.measureText(line).width;
      ctx.fillStyle = '#0771b6';
      ctx.fillRect(
        BAIRRO_X - TARJA_PAD_X,
        by - BFONT / 2 - TARJA_PAD_V,
        tw + TARJA_PAD_X * 2,
        BFONT + TARJA_PAD_V * 2
      );
      by += LINE_H;
    }
    // 2º: texto branco (baseline = middle → centralizado)
    ctx.fillStyle = '#ffffff';
    by = BAIRRO_Y;
    for (const line of bLines) {
      ctx.fillText(line, BAIRRO_X, by);
      by += LINE_H;
    }
    ctx.restore();

    // ── 7A. LOGO ASSISTÊNCIA SOCIAL — acima da van, alinhada com a data ──────
    if (assist) {
      const AS_H = 110;
      const asW = (assist.width / assist.height) * AS_H;
      // alinhada à direita com a data (DATE_X) e posicionada acima da van
      const asX = DATE_X - asW;
      const asY = 380;
      ctx.drawImage(assist, asX, asY, asW, AS_H);
    }

    // ── 7. VAN CRAS (lado direito, fundo) ─────────────────────────────────
    if (van) {
      const ratio = van.height / van.width;
      const vw = VAN_W;
      const vh = vw * ratio;
      ctx.drawImage(van, VAN_X, VAN_Y, vw, vh);
    }

    // ── 8. ACENTO azul sob o bairro ───────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = '#0771b6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(BAIRRO_X, by + 6);
    ctx.lineTo(BAIRRO_X + 280, by + 6);
    ctx.stroke();
    ctx.restore();

    // ── 9. TEXTO DESCRITIVO (coluna esquerda, limitado a DESC_MAX_LINES) ──
    if (campos.texto) {
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = '400 26px Inter, Arial, sans-serif';
      ctx.fillStyle = '#0771b6';
      const dLines = wrapText(ctx, campos.texto, DESC_MAX_WIDTH, DESC_MAX_LINES);
      let dy = DESC_Y;
      for (const line of dLines) {
        if (!line) { dy += DESC_LINE_H * 0.5; continue; }
        ctx.fillText(line, DESC_X, dy);
        dy += DESC_LINE_H;
      }
      ctx.restore();
    }

    // ── 10. RODAPÉ HELIODORA — largura total, altura proporcional ──────────
    if (rodape) {
      const rpW = W;                                    // canto a canto
      const rpH = (rodape.height / rodape.width) * rpW; // proporcional
      ctx.drawImage(rodape, 0, RP_Y, rpW, rpH);
    }

    // Linha fina base (refe001)
    ctx.save();
    const lg = ctx.createLinearGradient(80, H - 12, W - 80, H - 12);
    lg.addColorStop(0,   'rgba(7,113,182,0)');
    lg.addColorStop(0.1, '#0771b6');
    lg.addColorStop(0.9, '#00c8b0');
    lg.addColorStop(1,   'rgba(0,200,176,0)');
    ctx.strokeStyle = lg;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, H - 12);
    ctx.lineTo(W - 80, H - 12);
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
          <button onClick={baixar}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg,#0771b6,#00c8b0)' }}>
            <Download className="w-4 h-4 text-white" />
          </button>
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

            {/* BAIRRO */}
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-bairro" className={lbl + ' !text-blue-500'}>
                📍 Nome do Bairro — destaque principal
              </label>
              <input id="f-bairro" type="text" value={campos.bairro} onChange={set('bairro')}
                placeholder="Ex: bairro da floresta"
                className={inp + ' text-xl font-bold text-blue-700'} />
            </div>

            {/* DATA + HORA + LOCAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className={lbl}>Data · Hora · Local</p>
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
                  <label htmlFor="f-local" className="block text-xs text-slate-400 mb-1">Local</label>
                  <input id="f-local" type="text" value={campos.local} onChange={set('local')}
                    placeholder="Praça Principal" className={inp} />
                </div>
              </div>
            </div>

            {/* TEXTO DESCRITIVO */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-texto" className={lbl}>Texto descritivo</label>
              <textarea id="f-texto" rows={5} value={campos.texto} onChange={set('texto')}
                className={inp + ' resize-none text-sm leading-relaxed'} />
              <p className="text-xs text-slate-300 mt-2">Máx. 8 linhas renderizadas no canvas</p>
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
                <Download className="w-5 h-5" /> Baixar PNG
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
