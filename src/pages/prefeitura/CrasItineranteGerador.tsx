import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

// Assets locais (Vite resolve para URL correta em build e dev)
import rodapeImg from '@/assets/prefeitura/rodape-heliodora.png';
import logoImg   from '@/assets/prefeitura/logo-heliodora.png';

interface Campos {
  bairro: string;
  data: string;
  hora: string;
  local: string;
  subtituloLight: string;
  subtituloBold: string;
}

const DEFAULT: Campos = {
  bairro: 'Bairro da Floresta',
  data: '22 de Março',
  hora: '13H',
  local: 'Praça Principal',
  subtituloLight: 'O CRAS Itinerante vai até você com atendimento social, orientações e',
  subtituloBold: 'acesso a direitos para o seu Bairro.',
};

const W = 1080;
const H = 1440;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(r => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => r(i);
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

    // Carrega assets locais
    const [imgRodape, imgLogo] = await Promise.all([
      loadImg(rodapeImg),
      loadImg(logoImg),
    ]);

    // ════════════════════════════════════════════════════════════════════
    // 1. FUNDO — branco (sup-esq) → azul claro → ciano vibrante (sup-dir)
    //    exatamente como no refe001
    // ════════════════════════════════════════════════════════════════════
    const bg = ctx.createLinearGradient(0, 0, W, H * 0.55);
    bg.addColorStop(0.00, '#ffffff');
    bg.addColorStop(0.20, '#e4f7ff');
    bg.addColorStop(0.55, '#a8e8f5');
    bg.addColorStop(1.00, '#b8f0f5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Glow radial ciano — canto superior direito (como na referência)
    const gr = ctx.createRadialGradient(W * 0.88, H * 0.06, 0, W * 0.88, H * 0.06, W * 0.75);
    gr.addColorStop(0, 'rgba(0,229,200,0.45)');
    gr.addColorStop(0.5, 'rgba(0,180,230,0.20)');
    gr.addColorStop(1, 'rgba(0,180,230,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    // Fade branco no rodapé (área baixa mais clara, como na ref)
    const gf = ctx.createLinearGradient(0, H * 0.68, 0, H);
    gf.addColorStop(0, 'rgba(255,255,255,0)');
    gf.addColorStop(1, 'rgba(255,255,255,0.90)');
    ctx.fillStyle = gf;
    ctx.fillRect(0, H * 0.68, W, H * 0.32);

    // ════════════════════════════════════════════════════════════════════
    // 2. TEXTO OUTLINE DECORATIVO — GIGANTE no topo (≈560px)
    //    No refe001 vemos "IND" parcialmente, aqui usamos "CRAS" e "BAIRRO"
    //    São MUITO transparentes, apenas fantasma de contorno
    // ════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#006fad';
    ctx.lineWidth = 2;
    ctx.font = '900 560px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    // "CRAS" alinhado ao topo, saindo ligeiramente pela esquerda e direita
    ctx.strokeText('CRAS', -20, 430);
    ctx.restore();

    // ════════════════════════════════════════════════════════════════════
    // 3. ÍCONE SETA — turquesa #00c8b0, grande (~130px), como na referência
    // ════════════════════════════════════════════════════════════════════
    const ax = 60;           // X base
    const ay = 460;          // Y base (abaixo do outline)
    const as = 130;          // tamanho da seta

    ctx.save();
    ctx.strokeStyle = '#00c8b0';
    ctx.lineWidth = 18;
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
    // Diagonal ↗
    ctx.beginPath();
    ctx.moveTo(ax, ay + as);
    ctx.lineTo(ax + as, ay);
    ctx.stroke();
    // Braço horizontal (parte de cima, da esquerda até o ponto)
    ctx.beginPath();
    ctx.moveTo(ax + as * 0.38, ay);
    ctx.lineTo(ax + as, ay);
    ctx.stroke();
    // Braço vertical (desce pelo ponto)
    ctx.beginPath();
    ctx.moveTo(ax + as, ay);
    ctx.lineTo(ax + as, ay + as * 0.62);
    ctx.stroke();
    ctx.restore();

    // ════════════════════════════════════════════════════════════════════
    // 4. DATA · HORA · LOCAL — linha discreta, ~36px
    // ════════════════════════════════════════════════════════════════════
    ctx.save();
    ctx.font = '400 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#3d6a88';
    ctx.textAlign = 'left';
    ctx.fillText(`${campos.data}  ·  ${campos.hora}  ·  ${campos.local}`, 60, 650);
    ctx.restore();

    // ════════════════════════════════════════════════════════════════════
    // 5. SUBTÍTULO LIGHT (~52px) + BOLD (~56px)
    //    Na referência: 4 linhas light depois 2 linhas bold
    // ════════════════════════════════════════════════════════════════════
    let ty = 730;
    const maxTW = W - 120;

    // Light
    if (campos.subtituloLight) {
      ctx.font = '400 52px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a2d3d';
      ctx.textAlign = 'left';
      const lLines = wrap(ctx, campos.subtituloLight, maxTW);
      for (const line of lLines) {
        if (!line) { ty += 30; continue; }
        ctx.fillText(line, 60, ty);
        ty += 68;
      }
    }

    // Bold
    if (campos.subtituloBold) {
      ctx.font = '700 56px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a2d3d';
      const bLines2 = wrap(ctx, campos.subtituloBold, maxTW);
      for (const line of bLines2) {
        if (!line) { ty += 30; continue; }
        ctx.fillText(line, 60, ty);
        ty += 72;
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // 6. BAIRRO — tipografia GIGANTE (200-240px), gradiente azul→ciano
    //    Na referência "SISTEMAS" e "AUTÔNOMOS" ocupam quase toda a largura
    // ════════════════════════════════════════════════════════════════════
    const bairroUP = campos.bairro.toUpperCase();
    const bWords = bairroUP.split(' ');

    // Quebra em até 2 linhas para maximizar
    let bLines: string[];
    if (bWords.length === 1) {
      bLines = [bairroUP];
    } else if (bWords.length === 2) {
      bLines = [bWords[0], bWords[1]];
    } else {
      const mid = Math.ceil(bWords.length / 2);
      bLines = [bWords.slice(0, mid).join(' '), bWords.slice(mid).join(' ')];
    }

    // Ajusta tamanho para que cada linha caiba — começa em 230px
    let bsz = 230;
    const maxLineW = (sz: number) => {
      ctx.font = `900 ${sz}px Inter, Arial, sans-serif`;
      return bLines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    };
    while (maxLineW(bsz) > W - 110 && bsz > 80) bsz -= 5;

    ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;

    // Posição Y: abaixo do subtítulo + espaço, garantindo não recortar o rodapé
    const rodapeH = 130;
    const bairroStartY = Math.min(Math.max(ty + 55, H * 0.63), H - rodapeH - bLines.length * (bsz + 20) - 40);

    // Gradiente diagonal: azul puro → ciano vibrante (como "SISTEMAS AUTÔNOMOS")
    const bgText = ctx.createLinearGradient(0, bairroStartY, W, bairroStartY + bLines.length * (bsz + 20));
    bgText.addColorStop(0,   '#0060cc');  // azul
    bgText.addColorStop(0.45, '#00a8e8'); // azul-ciano
    bgText.addColorStop(1,   '#00e5c8'); // ciano/turquesa
    ctx.fillStyle = bgText;
    ctx.textAlign = 'left';

    let by = bairroStartY;
    for (const bl of bLines) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,83,160,0.15)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 6;
      ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
      ctx.fillStyle = bgText;
      ctx.fillText(bl, 55, by);
      ctx.restore();
      by += bsz + 20;
    }

    // ════════════════════════════════════════════════════════════════════
    // 7. RODAPÉ — imagem rodape-heliodora.png centralizada
    //    + linha fina separadora embaixo (exatamente como na referência)
    // ════════════════════════════════════════════════════════════════════
    const rpY = H - rodapeH - 16;

    if (imgRodape) {
      // Proporção original, centralizada
      const rpW = (imgRodape.width / imgRodape.height) * rodapeH;
      const rpX = (W - rpW) / 2;
      ctx.drawImage(imgRodape, rpX, rpY, rpW, rodapeH);
    } else if (imgLogo) {
      // Fallback: logo pequena + texto
      const lh = 70;
      const lw = (imgLogo.width / imgLogo.height) * lh;
      ctx.drawImage(imgLogo, (W - lw) / 2, rpY + 15, lw, lh);
      ctx.font = '600 26px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a2d3d';
      ctx.textAlign = 'center';
      ctx.fillText('SECRETARIA DE ASSISTÊNCIA SOCIAL', W / 2, rpY + lh + 40);
      ctx.textAlign = 'left';
    }

    // Linha fina na base (azul→ciano, como na referência)
    ctx.save();
    const lGrad = ctx.createLinearGradient(0, H - 12, W, H - 12);
    lGrad.addColorStop(0,   'rgba(0,200,176,0)');
    lGrad.addColorStop(0.1, '#00c8b0');
    lGrad.addColorStop(0.9, '#0060cc');
    lGrad.addColorStop(1,   'rgba(0,96,204,0)');
    ctx.strokeStyle = lGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, H - 12);
    ctx.lineTo(W, H - 12);
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#f0faff 0%,#e0f5fb 60%,#d0f0f8 100%)' }}>

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
            style={{ background: 'linear-gradient(135deg,#00c8b0,#0060cc)' }}>
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
              <label htmlFor="f-bairro" className={lbl + ' !text-cyan-500'}>
                ✦  Nome do Bairro — destaque principal
              </label>
              <input id="f-bairro" type="text" value={campos.bairro} onChange={set('bairro')}
                placeholder="Ex: Centro, Vila Nova..."
                className={inp + ' text-xl font-bold'} />
            </div>

            {/* DATA + HORA + LOCAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className={lbl}>Quando e onde</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="f-data" className="block text-xs text-slate-400 mb-1">Data</label>
                  <input id="f-data" type="text" value={campos.data} onChange={set('data')}
                    placeholder="22 de Março" className={inp} />
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

            {/* SUBTÍTULO LIGHT */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-sub-light" className={lbl}>Texto de apoio (leve)</label>
              <textarea id="f-sub-light" rows={3} value={campos.subtituloLight} onChange={set('subtituloLight')}
                className={inp + ' resize-none text-sm'} />
            </div>

            {/* SUBTÍTULO BOLD */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-sub-bold" className={lbl}>Texto de ênfase (negrito)</label>
              <textarea id="f-sub-bold" rows={2} value={campos.subtituloBold} onChange={set('subtituloBold')}
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
                style={{ background: 'linear-gradient(135deg,#00c8b0,#0060cc)' }}>
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
