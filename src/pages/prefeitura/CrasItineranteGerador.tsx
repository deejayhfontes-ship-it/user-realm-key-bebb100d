import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

// Assets Figma Dev Mode
const IMG_RODAPE = 'http://localhost:3845/assets/9c9293deb83f8fb9ac456ee714f3a40fdf34b966.png';
const IMG_LOGO   = 'http://localhost:3845/assets/52add733f1e2711ee7ac0494890ee51c52ba9920.png';

interface Campos {
  bairro: string;
  data: string;
  hora: string;
  local: string;
  subtitulo: string;
  texto: string;
}

const DEFAULT: Campos = {
  bairro: 'Bairro da Floresta',
  data: '22 de Março',
  hora: '13H',
  local: 'Praça Principal',
  subtitulo: 'O CRAS vai até você com atendimento social, orientações e acesso a direitos.',
  texto: 'Venha participar. Sua presença fortalece nossa comunidade.',
};

const W = 1080;
const H = 1440;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(r => {
    const i = new Image(); i.crossOrigin = 'anonymous';
    i.onload = () => r(i); i.onerror = () => r(null);
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

// ── Paleta extraída do refe001 ──────────────────────────────────────────────
// Fundo: branco → azul claro → ciano suave (direita)
// Texto principal: azul #0053a0 → ciano #00e5c8
// Texto descritivo: cinza escuro #1a2d3d
// Seta: turquesa #00c8b0

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

    const [imgRodape, imgLogo] = await Promise.all([
      loadImg(IMG_RODAPE), loadImg(IMG_LOGO),
    ]);

    // ══════════════════════════════════════════════════════════════════════
    // 1. FUNDO — replica o gradiente do refe001:
    //    branco puro (sup-esq) → azul claro → ciano (dir) e branco (inf)
    // ══════════════════════════════════════════════════════════════════════
    const bg = ctx.createLinearGradient(0, 0, W, H * 0.6);
    bg.addColorStop(0.00, '#ffffff');
    bg.addColorStop(0.25, '#e8f8ff');
    bg.addColorStop(0.60, '#b8eef8');
    bg.addColorStop(1.00, '#c2f0f5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Glow radial direita superior (ciano vibrante como na ref)
    const gr = ctx.createRadialGradient(W * 0.9, H * 0.08, 0, W * 0.9, H * 0.08, W * 0.7);
    gr.addColorStop(0, 'rgba(0,229,200,0.30)');
    gr.addColorStop(1, 'rgba(0,229,200,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    // Glow azul centro
    const gb = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.6);
    gb.addColorStop(0, 'rgba(0,83,160,0.08)');
    gb.addColorStop(1, 'rgba(0,83,160,0)');
    ctx.fillStyle = gb;
    ctx.fillRect(0, 0, W, H);

    // Fade branco no rodapé (como na ref — base fica quase branca)
    const gf = ctx.createLinearGradient(0, H * 0.72, 0, H);
    gf.addColorStop(0, 'rgba(255,255,255,0)');
    gf.addColorStop(1, 'rgba(255,255,255,0.85)');
    ctx.fillStyle = gf;
    ctx.fillRect(0, H * 0.72, W, H * 0.28);

    // ══════════════════════════════════════════════════════════════════════
    // 2. TEXTO DECORATIVO OUTLINE grande no topo (exatamente como na ref)
    //    letras-fantasma em outline, muito claras
    // ══════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = '#005fad';
    ctx.lineWidth = 2.5;
    ctx.font = '900 400px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    // Retângulos-fantasma do texto decorativo (alinhados ao topo como no refe001)
    // Na referência vemos letras "IND" outline no topo
    ctx.strokeText('CRAS', -30, 310);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // 3. SETA — turquesa #00c8b0, traçado geométrico (igual à referência)
    // ══════════════════════════════════════════════════════════════════════
    const arrowX = 50;
    const arrowY = 340;
    const arrowSize = 100;

    ctx.save();
    ctx.strokeStyle = '#00c8b0';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Diagonal ↗
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + arrowSize);
    ctx.lineTo(arrowX + arrowSize, arrowY);
    ctx.stroke();
    // Braço horizontal (topo)
    ctx.beginPath();
    ctx.moveTo(arrowX + arrowSize * 0.35, arrowY);
    ctx.lineTo(arrowX + arrowSize, arrowY);
    ctx.stroke();
    // Braço vertical (direita)
    ctx.beginPath();
    ctx.moveTo(arrowX + arrowSize, arrowY);
    ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize * 0.65);
    ctx.stroke();
    ctx.restore();

    // ══════════════════════════════════════════════════════════════════════
    // 4. TEXTO DESCRITIVO (acima do bairro — estilo ref: light + bold mix)
    //    data + local em destaque menor
    // ══════════════════════════════════════════════════════════════════════
    // Data / Local / Hora — linha discreta
    ctx.font = '400 30px Inter, Arial, sans-serif';
    ctx.fillStyle = '#3a5f7a';
    ctx.textAlign = 'left';
    ctx.fillText(`${campos.data}  ·  ${campos.hora}  ·  ${campos.local}`, 50, 490);

    // Subtítulo — mistura regular + bold (como na ref: "Enquanto... nós substituímos...")
    const subLines = wrap(ctx, campos.subtitulo, W - 100);
    let ty = 560;
    ctx.textAlign = 'left';
    for (const line of subLines) {
      if (!line) { ty += 30; continue; }
      // Verifica se começa com marcadores de negrito simulado
      ctx.font = '400 40px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a2d3d';
      ctx.fillText(line, 50, ty);
      ty += 58;
    }

    // Texto complementar (menor)
    if (campos.texto) {
      ty += 10;
      ctx.font = '700 40px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a2d3d';
      const tLines = wrap(ctx, campos.texto, W - 100);
      for (const line of tLines) {
        if (!line) { ty += 20; continue; }
        ctx.fillText(line, 50, ty);
        ty += 58;
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    // 5. BAIRRO — tipografia gigante, gradiente azul→ciano (como "SISTEMAS AUTÔNOMOS")
    // ══════════════════════════════════════════════════════════════════════
    const bairroUP = campos.bairro.toUpperCase();
    const bWords = bairroUP.split(' ');

    // Quebra em até 2 linhas para maximizar o tamanho
    let bLines: string[];
    if (bWords.length === 1) {
      bLines = [bairroUP];
    } else {
      const mid = Math.ceil(bWords.length / 2);
      bLines = [bWords.slice(0, mid).join(' '), bWords.slice(mid).join(' ')];
    }

    // Tamanho máximo que cabe na largura
    let bsz = 170;
    const calcMaxW = (sz: number) => {
      ctx.font = `900 ${sz}px Inter, Arial, sans-serif`;
      return bLines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    };
    while (calcMaxW(bsz) > W - 80 && bsz > 60) bsz -= 6;

    ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;

    // Posição Y — abaixo do texto descritivo, na parte inferior da arte
    const bairroStartY = Math.max(ty + 50, H * 0.62);

    // Gradiente azul → ciano (exatamente como na ref)
    const bgText = ctx.createLinearGradient(0, bairroStartY - bsz, W * 0.9, bairroStartY + bLines.length * (bsz + 20));
    bgText.addColorStop(0,   '#0053a0');  // azul
    bgText.addColorStop(0.5, '#00a8d4');  // azul-ciano
    bgText.addColorStop(1,   '#00e5c8');  // ciano/turquesa
    ctx.fillStyle = bgText;
    ctx.textAlign = 'left';

    let by = bairroStartY;
    for (const bl of bLines) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,83,160,0.18)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = bgText;
      ctx.fillText(bl, 50, by);
      ctx.restore();
      by += bsz + 20;
    }

    // ══════════════════════════════════════════════════════════════════════
    // 6. RODAPÉ — exatamente como na refe001:
    //    Logo Prefeitura Heliodora | Secretaria de Assistência Social
    //    linha fina separadora abaixo
    // ══════════════════════════════════════════════════════════════════════
    const rpH = 110;
    const rpY = H - rpH - 20;

    if (imgRodape) {
      // Centraliza verticalmente o rodapé
      ctx.drawImage(imgRodape, 0, rpY, W, rpH);
    } else {
      // Fallback: logo CRAS + texto
      if (imgLogo) {
        const lw = 260;
        const lh = (imgLogo.height / imgLogo.width) * lw;
        const lx = (W - lw) / 2;
        ctx.drawImage(imgLogo, lx, rpY + (rpH - lh) / 2, lw, lh);
      }
      ctx.font = '400 22px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a2d3d';
      ctx.textAlign = 'center';
      ctx.fillText('Prefeitura Municipal de Heliodora  |  Secretaria de Assistência Social', W / 2, rpY + rpH * 0.65);
      ctx.textAlign = 'left';
    }

    // Linha fina separadora abaixo do rodapé (como na ref)
    ctx.save();
    const lineGrad = ctx.createLinearGradient(0, H - 18, W, H - 18);
    lineGrad.addColorStop(0,   'rgba(0,200,176,0)');
    lineGrad.addColorStop(0.15, '#00c8b0');
    lineGrad.addColorStop(0.85, '#0053a0');
    lineGrad.addColorStop(1,   'rgba(0,83,160,0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, H - 18);
    ctx.lineTo(W, H - 18);
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
    a.download = `cras-${campos.bairro.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
    a.href = cv.toDataURL('image/png', 1.0);
    a.click();
  }

  // ── Estilos do formulário (inspiração na refe001: fundo branco/azul claro)
  const inp = `w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800
    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all bg-white`;
  const lbl = 'block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-400';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#f0faff 0%,#e0f5fb 60%,#d0f0f8 100%)' }}>

      {/* Header — clean, como a referência */}
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
            style={{ background: 'linear-gradient(135deg,#00c8b0,#0053a0)' }}>
            <Download className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* ── FORMULÁRIO ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Personalizar Arte</h2>
              <p className="text-sm text-slate-500 mt-0.5">Preview ao vivo · PNG 1080×1440</p>
            </div>

            {/* BAIRRO */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-bairro" className={lbl + ' !text-cyan-500'}>
                ✦  Nome do Bairro — destaque principal
              </label>
              <input id="f-bairro" title="Bairro" type="text"
                value={campos.bairro} onChange={set('bairro')}
                placeholder="Ex: Centro, Vila Nova..."
                className={inp + ' text-xl font-bold'} />
            </div>

            {/* DATA + HORA */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className={lbl}>Data e Hora</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-data" className="block text-xs text-slate-400 mb-1">Data</label>
                  <input id="f-data" title="Data" type="text"
                    value={campos.data} onChange={set('data')}
                    placeholder="22 de Março" className={inp} />
                </div>
                <div>
                  <label htmlFor="f-hora" className="block text-xs text-slate-400 mb-1">Hora</label>
                  <input id="f-hora" title="Hora" type="text"
                    value={campos.hora} onChange={set('hora')}
                    placeholder="13H" className={inp} />
                </div>
              </div>
            </div>

            {/* LOCAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-local" className={lbl}>Local</label>
              <input id="f-local" title="Local" type="text"
                value={campos.local} onChange={set('local')}
                placeholder="Ex: Praça Principal" className={inp} />
            </div>

            {/* SUBTÍTULO */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-sub" className={lbl}>Texto de apoio (light)</label>
              <textarea id="f-sub" title="Subtítulo" rows={3}
                value={campos.subtitulo} onChange={set('subtitulo')}
                className={inp + ' resize-none text-sm'} />
            </div>

            {/* TEXTO BOLD */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-texto" className={lbl}>Texto de ênfase (bold)</label>
              <textarea id="f-texto" title="Texto" rows={2}
                value={campos.texto} onChange={set('texto')}
                className={inp + ' resize-none text-sm font-bold'} />
            </div>

            {/* AÇÕES */}
            <div className="flex gap-3">
              <button onClick={() => setCampos(DEFAULT)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all text-sm">
                <RefreshCw className="w-4 h-4" /> Resetar
              </button>
              <button onClick={baixar}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#00c8b0,#0053a0)' }}>
                <Download className="w-5 h-5" /> Baixar PNG (1080 × 1440)
              </button>
            </div>
          </div>

          {/* ── PREVIEW ─────────────────────────────────────────────────── */}
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
