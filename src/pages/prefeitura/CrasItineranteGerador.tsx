import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

// Assets locais salvos do Figma
import imgLogoCras from '@/assets/prefeitura/arte/logo-cras-itinerante.png';
import imgVan      from '@/assets/prefeitura/arte/van-cras.png';
import imgRodape   from '@/assets/prefeitura/rodape-heliodora.png';

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
    'Participe de uma tarde especial de acolhimento, informação e convivência para toda a comunidade. Será um momento para esclarecer dúvidas, conhecer serviços, fortalecer vínculos e garantir direitos. Sua presença é muito importante.\nEsperamos por você!',
};

const W = 1080;
const H = 1440;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(r => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload  = () => r(i);
    i.onerror = () => r(null);
    i.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
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

    // ═══════════════════════════════════════════════════════════
    // 1. FUNDO — azul muito claro → branco (exato do Figma)
    // ═══════════════════════════════════════════════════════════
    const bg = ctx.createLinearGradient(0, 0, W * 0.8, H * 0.5);
    bg.addColorStop(0.0, '#d6eef8');
    bg.addColorStop(0.4, '#e8f6ff');
    bg.addColorStop(0.7, '#f4faff');
    bg.addColorStop(1.0, '#ffffff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Glow ciano superior-direito
    const gc = ctx.createRadialGradient(W * 0.85, H * 0.05, 0, W * 0.85, H * 0.05, W * 0.7);
    gc.addColorStop(0, 'rgba(120,220,240,0.40)');
    gc.addColorStop(1, 'rgba(120,220,240,0)');
    ctx.fillStyle = gc;
    ctx.fillRect(0, 0, W, H);

    // ═══════════════════════════════════════════════════════════
    // 2. LOGO CRAS ITINERANTE — topo esquerdo
    //    No Figma: x=53, y=42, w=498, h=268
    //    Proporção: 1080 canvas → mantemos escala
    // ═══════════════════════════════════════════════════════════
    if (logo) {
      const lw = 520;
      const lh = (logo.height / logo.width) * lw;
      ctx.drawImage(logo, 40, 30, lw, lh);
    }

    // ═══════════════════════════════════════════════════════════
    // 3. DATA + HORA + LOCAL — topo direito (como no Figma)
    // ═══════════════════════════════════════════════════════════
    ctx.save();
    ctx.textAlign = 'right';
    // Data + hora — bold grande
    ctx.font = '800 56px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0d2d4a';
    ctx.fillText(`${campos.data} ${campos.hora}`, W - 50, 110);
    // Bairro (local referência) — regular menor, azul
    ctx.font = '400 42px Inter, Arial, sans-serif';
    ctx.fillStyle = '#3a7aaa';
    ctx.fillText(campos.local, W - 50, 168);
    ctx.restore();

    // ═══════════════════════════════════════════════════════════
    // 4. "O CRAS vai até você!" — texto grande navy
    //    No Figma: x=80, y=350, fonte ~110px bold
    // ═══════════════════════════════════════════════════════════
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '800 112px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0d2d4a';
    const headline1 = 'O CRAS';
    const headline2 = 'vai até você!';
    ctx.fillText(headline1, 70, 420);
    ctx.fillText(headline2, 70, 545);
    ctx.restore();

    // ═══════════════════════════════════════════════════════════
    // 5. BAIRRO — texto editável grande azul-ciano
    //    No Figma: x=80, y=589, fonte ~100px bold azul
    // ═══════════════════════════════════════════════════════════
    const bairroText = campos.bairro.toLowerCase();
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '700 100px Inter, Arial, sans-serif';
    ctx.fillStyle = '#005fa3';

    // Auto-quebra se bairro for longo (max ~430px de largura — metade do card)
    const bMaxW = 420;
    const bLines = wrap(ctx, bairroText, bMaxW);
    let by = 680;
    for (const line of bLines) {
      ctx.fillText(line, 70, by);
      by += 118;
    }
    ctx.restore();

    // ═══════════════════════════════════════════════════════════
    // 6. TEXTO DESCRITIVO — menor, cinza-escuro
    //    No Figma: x=80, y=759, fonte ~28-30px regular
    // ═══════════════════════════════════════════════════════════
    if (campos.texto) {
      ctx.save();
      ctx.font = '400 32px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a3a52';
      ctx.textAlign = 'left';
      const tLines = wrap(ctx, campos.texto, 420);
      let ty = by + 30;
      for (const line of tLines) {
        if (!line) { ty += 18; continue; }
        ctx.fillText(line, 70, ty);
        ty += 44;
      }
      ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════
    // 7. VAN CRAS ITINERANTE — direita, ocupa metade inferior
    //    No Figma: x=353+51=404, y=324+233=557, w~685, h~665
    // ═══════════════════════════════════════════════════════════
    if (van) {
      // A van ocupa a metade direita da arte, do meio pra baixo
      const vw = 660;
      const vh = (van.height / van.width) * vw;
      const vx = W - vw - 20;  // alinhada à direita
      const vy = 580;
      ctx.drawImage(van, vx, vy, vw, vh);
    }

    // ═══════════════════════════════════════════════════════════
    // 8. RODAPÉ — centralizado, como no Figma
    //    Logo Heliodora + Secretaria de Assistência Social
    // ═══════════════════════════════════════════════════════════
    const rpH = 104;
    const rpY = H - rpH - 14;

    if (rodape) {
      const rpW = (rodape.width / rodape.height) * rpH;
      const rpX = (W - rpW) / 2;
      ctx.drawImage(rodape, rpX, rpY, rpW, rpH);
    }

    // Linha fina na base
    ctx.save();
    const lg = ctx.createLinearGradient(0, H - 10, W, H - 10);
    lg.addColorStop(0,   'rgba(0,100,180,0)');
    lg.addColorStop(0.1, '#005fa3');
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
    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all bg-white`;
  const lbl = 'block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-400';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#d6f0fc 0%,#f0faff 100%)' }}>

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
            style={{ background: 'linear-gradient(135deg,#00c8b0,#005fa3)' }}>
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

            {/* BAIRRO */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-bairro" className={lbl + ' !text-blue-500'}>
                📍  Nome do Bairro — destaque principal
              </label>
              <input id="f-bairro" type="text" value={campos.bairro} onChange={set('bairro')}
                placeholder="Ex: bairro da floresta"
                className={inp + ' text-xl font-bold text-blue-600'} />
            </div>

            {/* DATA + HORA + LOCAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className={lbl}>Data, Hora e Local</p>
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

            {/* TEXTO */}
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
                style={{ background: 'linear-gradient(135deg,#00c8b0,#005fa3)' }}>
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
