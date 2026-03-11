import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

// Assets Figma
const IMG_LOGO   = 'http://localhost:3845/assets/52add733f1e2711ee7ac0494890ee51c52ba9920.png';
const IMG_RODAPE = 'http://localhost:3845/assets/9c9293deb83f8fb9ac456ee714f3a40fdf34b966.png';
const IMG_VAN    = 'http://localhost:3845/assets/67b7a86baa773398eb36970d809477b850f48bdd.png';

interface Campos {
  bairro: string;
  data: string;
  hora: string;
  local: string;
  texto: string;
}

const DEFAULT: Campos = {
  bairro: 'Bairro da Floresta',
  data: '22 de Março',
  hora: '13H',
  local: 'Praça Principal',
  texto: 'O CRAS vai até você com serviços de assistência social, escuta qualificada e acesso a direitos.\n\nVenha participar. Sua presença fortalece nossa comunidade.',
};

const W = 1080;
const H = 1440;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const i = new Image(); i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const [imgLogo, imgRodape, imgVan] = await Promise.all([
      loadImg(IMG_LOGO), loadImg(IMG_RODAPE), loadImg(IMG_VAN),
    ]);

    // ══════════════════════════════════════════════════════════════
    // 1. FUNDO — gradiente branco → azul claro (inspirado na referência)
    // ══════════════════════════════════════════════════════════════
    const bg = ctx.createLinearGradient(W, 0, 0, H);
    bg.addColorStop(0.00, '#e8f6ff');  // azul muito suave canto sup-dir
    bg.addColorStop(0.35, '#f5fbff');  // quase branco no meio
    bg.addColorStop(0.70, '#dff0fc');  // retoma azul suave
    bg.addColorStop(1.00, '#c5e4f7');  // azul mais vivo no rodapé
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Círculo de luz backdrop (efeito glow suave como na referência)
    const glow = ctx.createRadialGradient(W * 0.7, H * 0.15, 0, W * 0.7, H * 0.15, 600);
    glow.addColorStop(0, 'rgba(120,210,255,0.25)');
    glow.addColorStop(1, 'rgba(120,210,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.75, 0, W * 0.1, H * 0.75, 500);
    glow2.addColorStop(0, 'rgba(0,180,255,0.15)');
    glow2.addColorStop(1, 'rgba(0,180,255,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // ══════════════════════════════════════════════════════════════
    // 2. TEXTO DECORATIVO OUTLINE no fundo (como na referência)
    // ══════════════════════════════════════════════════════════════
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.font = '900 360px Inter, Arial, sans-serif';
    ctx.strokeStyle = '#0069a8';
    ctx.lineWidth = 3;
    ctx.textAlign = 'right';
    ctx.strokeText('CRAS', W + 40, 440);
    ctx.strokeText('BAIRRO', W + 60, 820);
    ctx.restore();

    // ══════════════════════════════════════════════════════════════
    // 3. VAN — discreta, como elemento decorativo no topo
    // ══════════════════════════════════════════════════════════════
    if (imgVan) {
      const vw = 480;
      const vh = (imgVan.height / imgVan.width) * vw;
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.drawImage(imgVan, W - vw - 10, 30, vw, vh);
      ctx.restore();
    }

    // ══════════════════════════════════════════════════════════════
    // 4. LOGO + ÍCONE DE SETA (como na referência)
    // ══════════════════════════════════════════════════════════════
    // Seta decorativa (estilo da referência — ícone geométrico em cyan)
    ctx.save();
    ctx.strokeStyle = '#00aadd';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Seta: diagonal + traços de base
    ctx.beginPath();
    ctx.moveTo(52, 180);
    ctx.lineTo(118, 114);   // diagonal principal
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(118, 114);
    ctx.lineTo(118, 158);   // braço vertical
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(72, 114);    // braço horizontal
    ctx.lineTo(118, 114);
    ctx.stroke();
    ctx.restore();

    // Logo CRAS
    if (imgLogo) {
      const lw = 340;
      const lh = (imgLogo.height / imgLogo.width) * lw;
      ctx.drawImage(imgLogo, 50, 40, lw, lh);
    } else {
      ctx.font = '900 54px Inter, Arial, sans-serif';
      ctx.fillStyle = '#022b44';
      ctx.textAlign = 'left';
      ctx.fillText('CRAS ITINERANTE', 50, 100);
    }

    // ══════════════════════════════════════════════════════════════
    // 5. DATA + LOCAL (bloco discreto, escuro)
    // ══════════════════════════════════════════════════════════════
    ctx.textAlign = 'left';
    ctx.font = '300 32px Inter, Arial, sans-serif';
    ctx.fillStyle = '#1a3a52';
    ctx.fillText(`${campos.data}  •  ${campos.hora}  •  ${campos.local}`, 50, 260);

    // Linha decorativa fina abaixo
    ctx.save();
    const lineGrad = ctx.createLinearGradient(50, 0, 500, 0);
    lineGrad.addColorStop(0, '#00aadd');
    lineGrad.addColorStop(1, 'rgba(0,170,221,0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 278);
    ctx.lineTo(600, 278);
    ctx.stroke();
    ctx.restore();

    // ══════════════════════════════════════════════════════════════
    // 6. TEXTO INTRODUTÓRIO (mistura light + bold como na referência)
    // ══════════════════════════════════════════════════════════════
    const introLines = wrapText(ctx, campos.texto, W - 100);
    let ty = 340;
    const lineH = 54;
    for (const line of introLines) {
      if (!line.trim()) { ty += lineH * 0.6; continue; }
      ctx.font = '400 36px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a3a52';
      ctx.fillText(line, 50, ty);
      ty += lineH;
    }

    // ══════════════════════════════════════════════════════════════
    // 7. TEXTO GRANDE — BAIRRO (estilo "SISTEMAS AUTÔNOMOS" da ref)
    //    Gradiente cyan → azul, fonte gigante, InterBlack
    // ══════════════════════════════════════════════════════════════
    const bairroY = 780;
    const bairroUP = campos.bairro.toUpperCase();

    // Ajusta tamanho para caber
    let bsz = 148;
    ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
    while (ctx.measureText(bairroUP).width > W - 80 && bsz > 52) {
      bsz -= 6;
      ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
    }

    // Se cabe em 1 linha → 1 linha; senão divide em 2
    const bWords = bairroUP.split(' ');
    const bLines: string[] = [];
    if (ctx.measureText(bairroUP).width <= W - 80) {
      bLines.push(bairroUP);
    } else {
      // Divide ao meio
      const mid = Math.ceil(bWords.length / 2);
      bLines.push(bWords.slice(0, mid).join(' '));
      bLines.push(bWords.slice(mid).join(' '));
      // Recalcula tamanho com 2 linhas
      bsz = 148;
      ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
      const maxW2 = bLines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
      while (maxW2 > W - 80 && bsz > 52) {
        bsz -= 4;
        ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
      }
    }

    // Gradiente cyan → azul para o texto grande
    const tGrad = ctx.createLinearGradient(0, bairroY - bsz, W, bairroY + bLines.length * (bsz + 10));
    tGrad.addColorStop(0,   '#00c6ff');  // cyan
    tGrad.addColorStop(0.5, '#0088cc');  // azul
    tGrad.addColorStop(1,   '#004e88');  // azul escuro
    ctx.fillStyle = tGrad;
    ctx.textAlign = 'left';
    ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;

    let bly = bairroY;
    for (const bl of bLines) {
      // Sombra suave para depth
      ctx.save();
      ctx.shadowColor = 'rgba(0,150,220,0.20)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = tGrad;
      ctx.fillText(bl, 50, bly);
      ctx.restore();
      bly += bsz + 14;
    }

    // Linha de acento abaixo do bairro
    ctx.save();
    const acGrad = ctx.createLinearGradient(50, 0, 700, 0);
    acGrad.addColorStop(0, '#00c6ff');
    acGrad.addColorStop(1, 'rgba(0,198,255,0)');
    ctx.strokeStyle = acGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, bly + 10);
    ctx.lineTo(700, bly + 10);
    ctx.stroke();
    ctx.restore();

    // ══════════════════════════════════════════════════════════════
    // 8. RODAPÉ — logo oficial + linha divisória (como na referência)
    // ══════════════════════════════════════════════════════════════
    const rpH = 120;
    const rpY = H - rpH;

    // Linha superior rodapé
    ctx.save();
    const divGrad = ctx.createLinearGradient(0, 0, W, 0);
    divGrad.addColorStop(0,   'rgba(0,100,180,0)');
    divGrad.addColorStop(0.2, '#0069a8');
    divGrad.addColorStop(0.8, '#0069a8');
    divGrad.addColorStop(1,   'rgba(0,100,180,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, rpY);
    ctx.lineTo(W, rpY);
    ctx.stroke();
    ctx.restore();

    if (imgRodape) {
      // Fundo translúcido para o rodapé
      ctx.save();
      ctx.globalAlpha = 0.96;
      // mantém fundo do gradiente — apenas estampa a imagem
      ctx.drawImage(imgRodape, 0, rpY, W, rpH);
      ctx.restore();
    } else {
      ctx.font = '400 24px Inter, Arial, sans-serif';
      ctx.fillStyle = '#1a3a52';
      ctx.textAlign = 'center';
      ctx.fillText('PREFEITURA MUNICIPAL DE HELIODORA  |  ASSISTÊNCIA SOCIAL', W / 2, rpY + 65);
      ctx.textAlign = 'left';
    }
  }, [campos]);

  useEffect(() => { render(); }, [render]);

  function campo<K extends keyof Campos>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCampos(p => ({ ...p, [key]: e.target.value }));
  }

  function baixar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `cras-${campos.bairro.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
  }

  const inp = "w-full bg-white/60 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";
  const lbl = "block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-slate-400";

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#e8f6ff 0%,#f5fbff 50%,#dff0fc 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/prefeitura/secretarias')}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-slate-700">CRAS Itinerante — Gerador</h1>
            <p className="text-xs text-slate-400">1080 × 1440 · Instagram Portrait</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#00aadd,#004e88)' }}>
            <Download className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Personalizar Arte</h2>
              <p className="text-sm text-slate-500 mt-0.5">Preview atualizado em tempo real</p>
            </div>

            {/* Bairro — destaque */}
            <div className="bg-white/80 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-bairro" className={lbl + " !text-blue-500"}>
                ✦ Nome do Bairro — aparece em grande destaque
              </label>
              <input id="f-bairro" title="Bairro" type="text" value={campos.bairro} onChange={campo('bairro')}
                placeholder="Ex: Centro, Vila Nova..." className={inp + " text-xl font-bold"} />
            </div>

            {/* Data + Hora */}
            <div className="bg-white/80 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <p className={lbl}>Data e Hora</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-data" className="block text-xs text-slate-400 mb-1">Data</label>
                  <input id="f-data" title="Data" type="text" value={campos.data} onChange={campo('data')}
                    placeholder="22 de Março" className={inp} />
                </div>
                <div>
                  <label htmlFor="f-hora" className="block text-xs text-slate-400 mb-1">Hora</label>
                  <input id="f-hora" title="Hora" type="text" value={campos.hora} onChange={campo('hora')}
                    placeholder="13H" className={inp} />
                </div>
              </div>
            </div>

            {/* Local */}
            <div className="bg-white/80 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-local" className={lbl}>Local</label>
              <input id="f-local" title="Local" type="text" value={campos.local} onChange={campo('local')}
                placeholder="Ex: Praça Principal" className={inp} />
            </div>

            {/* Texto */}
            <div className="bg-white/80 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <label htmlFor="f-texto" className={lbl}>Texto Descritivo</label>
              <textarea id="f-texto" title="Texto" value={campos.texto} onChange={campo('texto')} rows={5}
                className={inp + " resize-none text-sm leading-relaxed"} />
              <p className="text-[11px] text-slate-400 mt-1">Linha em branco = parágrafo</p>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button onClick={() => setCampos(DEFAULT)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-blue-100 hover:bg-blue-50 text-slate-500 hover:text-slate-700 transition-all text-sm">
                <RefreshCw className="w-4 h-4" /> Resetar
              </button>
              <button onClick={baixar}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg,#00aadd,#004e88)' }}>
                <Download className="w-5 h-5" /> Baixar PNG (1080 × 1440)
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="sticky top-24">
            <div className="bg-white/80 border border-blue-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preview ao vivo</span>
                <span className="text-xs text-slate-300">1080 × 1440 px</span>
              </div>
              <div className="w-full overflow-hidden rounded-xl bg-blue-50" style={{ aspectRatio: '3/4' }}>
                <canvas ref={canvasRef}
                  style={{ width: '100%', height: '100%', imageRendering: 'crisp-edges', display: 'block' }} />
              </div>
              <p className="text-center text-xs text-slate-400 mt-3">Proporção 3:4 · Instagram Feed Portrait</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
