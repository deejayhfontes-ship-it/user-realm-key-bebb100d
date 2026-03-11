import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Eye } from 'lucide-react';

// ─── Assets do Figma ─────────────────────────────────────────────────────────
const IMG_LOGO   = 'http://localhost:3845/assets/52add733f1e2711ee7ac0494890ee51c52ba9920.png';
const IMG_VAN    = 'http://localhost:3845/assets/67b7a86baa773398eb36970d809477b850f48bdd.png';
const IMG_RODAPE = 'http://localhost:3845/assets/9c9293deb83f8fb9ac456ee714f3a40fdf34b966.png';

// ─── Tipos ────────────────────────────────────────────────────────────────────
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
  texto: 'Participe de uma tarde especial de acolhimento, informação e convivência para toda a comunidade.\n\nEsclareça dúvidas, conheça serviços e fortaleça vínculos. Sua presença é muito importante.\n\nEsperamos por você!',
};

// ─── Canvas 1080 × 1440 ───────────────────────────────────────────────────────
const W = 1080;
const H = 1440;
// Divisória: topo (foto+van) ocupa 55% ≈ 792px
const SPLIT = Math.round(H * 0.55);

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxW) line = test;
      else { if (line) out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}

// Diagonal/arco usado como divisória entre foto e conteúdo
function clipTopZone(ctx: CanvasRenderingContext2D, extraBottom = 60) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, SPLIT - 20);
  ctx.quadraticCurveTo(W / 2, SPLIT + extraBottom, 0, SPLIT - 20);
  ctx.closePath();
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
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const [imgLogo, imgVan, imgRodape] = await Promise.all([
      loadImg(IMG_LOGO), loadImg(IMG_VAN), loadImg(IMG_RODAPE),
    ]);

    // ════════════════════════════════════════════════════════════════
    // ZONA SUPERIOR — foto / van (área clippada em arco)
    // ════════════════════════════════════════════════════════════════
    ctx.save();
    clipTopZone(ctx, 80);
    ctx.clip();

    // Fundo da zona superior: gradiente azul claro → médio (simula céu/ambiente)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, SPLIT + 80);
    skyGrad.addColorStop(0,   '#c8e8f8');
    skyGrad.addColorStop(0.5, '#a0d0f0');
    skyGrad.addColorStop(1,   '#78b8e8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, SPLIT + 80);

    // Textura de bolinhas sutis
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let x = 0; x < W; x += 50)
      for (let y = 0; y < SPLIT + 80; y += 50) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#043555';
        ctx.fill();
      }
    ctx.restore();

    // Van centralizada nessa zona
    if (imgVan) {
      const vanW = 860;
      const vanH = (imgVan.height / imgVan.width) * vanW;
      const vanX = (W - vanW) / 2;
      const vanY = SPLIT - vanH + 40; // ligeiramente acima da linha de corte
      ctx.drawImage(imgVan, vanX, vanY, vanW, vanH);
    }

    ctx.restore(); // fim do clip

    // ════════════════════════════════════════════════════════════════
    // ZONA INFERIOR — conteúdo azul escuro
    // ════════════════════════════════════════════════════════════════
    // Preenche o restante com azul escuro sólido
    ctx.fillStyle = '#022b44';
    ctx.fillRect(0, SPLIT - 10, W, H - SPLIT + 10);

    // Arco de ondas que cobre a transição (sobreposto ao clip superior)
    // Onda 1: verde (acento — como na referência)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, SPLIT - 30);
    ctx.quadraticCurveTo(W / 2, SPLIT + 90, W, SPLIT - 30);
    ctx.lineTo(W, SPLIT + 10);
    ctx.quadraticCurveTo(W / 2, SPLIT + 120, 0, SPLIT + 10);
    ctx.closePath();
    ctx.fillStyle = '#1a9e3d'; // verde institucional
    ctx.fill();
    ctx.restore();

    // Onda 2: azul royal mais escuro (abaixo da verde)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, SPLIT + 10);
    ctx.quadraticCurveTo(W / 2, SPLIT + 140, W, SPLIT + 10);
    ctx.lineTo(W, SPLIT + 55);
    ctx.quadraticCurveTo(W / 2, SPLIT + 175, 0, SPLIT + 55);
    ctx.closePath();
    ctx.fillStyle = '#0348a1';
    ctx.fill();
    ctx.restore();

    // =================== TTULOS / FAIXAS NA ZONA SUPERIOR ==================
    // -- Logo CRAS (canto superior esquerdo, sobre o fundo claro)
    if (imgLogo) {
      const lw = 390;
      const lh = (imgLogo.height / imgLogo.width) * lw;
      ctx.drawImage(imgLogo, 40, 30, lw, lh);
    }

    // -- FAIXA TÍTULO 1: "O CRAS VAI ATÉ VOCÊ!" sobre a foto
    // Faixa azul escuro (direita da imagem)
    const fx1 = 380, fy1 = 36, fw1 = W - fx1 - 30;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#022b44';
    ctx.beginPath();
    ctx.roundRect(fx1, fy1, fw1, 72, 6);
    ctx.fill();
    ctx.restore();

    ctx.font = '900 52px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('O CRAS VAI ATÉ VOCÊ!', fx1 + 18, fy1 + 50);

    // Faixa verde abaixo (acento), texto amarelo
    const fx2 = fx1, fy2 = fy1 + 78, fw2 = fw1 * 0.65;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#1a9e3d';
    ctx.beginPath();
    ctx.roundRect(fx2, fy2, fw2, 58, 6);
    ctx.fill();
    ctx.restore();

    ctx.font = '900 40px Inter, Arial, sans-serif';
    ctx.fillStyle = '#f5c400';
    ctx.fillText('Assistência Social', fx2 + 16, fy2 + 42);

    // -- DATA + LOCAL em cima (canto sup direito, sobre fundo transparente)
    ctx.textAlign = 'right';
    ctx.font = '700 36px Inter, Arial, sans-serif';
    ctx.fillStyle = '#022b44';
    ctx.fillText(`${campos.data.toUpperCase()} • ${campos.hora.toUpperCase()}`, W - 40, 200);
    ctx.font = '500 28px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0a4b7a';
    ctx.fillText(campos.local, W - 40, 238);
    ctx.textAlign = 'left';

    // ════════════════════════════════════════════════════════════════
    // FAIXA BAIRRO — logo abaixo das ondas, sobre azul escuro
    // ════════════════════════════════════════════════════════════════
    const bairroY = SPLIT + 160;
    const bairroH = 136;

    // Faixa amarelo-dourado com bordas
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#f5c400';
    ctx.fillRect(0, bairroY, W, bairroH);
    ctx.restore();

    // Linhas de borda
    ctx.fillStyle = '#022b44';
    ctx.fillRect(0, bairroY, W, 5);
    ctx.fillStyle = '#1a9e3d';
    ctx.fillRect(0, bairroY + bairroH - 5, W, 5);

    // Texto bairro — Inter 900, azul escuro centralizado
    const bairroUp = campos.bairro.toUpperCase();
    let bsz = 90;
    ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
    while (ctx.measureText(bairroUp).width > W - 80 && bsz > 42) {
      bsz -= 4;
      ctx.font = `900 ${bsz}px Inter, Arial, sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#022b44';
    // Sombra leve para legibilidade
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 4;
    ctx.fillText(bairroUp, W / 2, bairroY + bairroH / 2 + bsz * 0.36);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';

    // ════════════════════════════════════════════════════════════════
    // TEXTO DESCRITIVO
    // ════════════════════════════════════════════════════════════════
    const txtY = bairroY + bairroH + 48;
    const txtMaxW = W - 100;
    const lines = wrapText(ctx, campos.texto, txtMaxW);
    const lh = 48;

    ctx.font = '500 30px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    let cy = txtY;
    for (const line of lines) {
      // Linha em branco vira espaçamento
      if (!line.trim()) { cy += lh * 0.5; continue; }
      ctx.fillText(line, 50, cy);
      cy += lh;
    }

    // ════════════════════════════════════════════════════════════════
    // RODAPÉ
    // ════════════════════════════════════════════════════════════════
    const rpH = 100;
    const rpY = H - rpH;
    if (imgRodape) {
      ctx.drawImage(imgRodape, 0, rpY, W, rpH);
    } else {
      ctx.fillStyle = '#0348a1';
      ctx.fillRect(0, rpY, W, rpH);
      ctx.font = 'bold 24px Inter, Arial, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('PREFEITURA MUNICIPAL • SECRETARIA DE ASSISTÊNCIA SOCIAL', W/2, rpY + 58);
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
    a.download = `cras-itinerante-${campos.bairro.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/prefeitura/secretarias')}
            title="Voltar para Secretarias"
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">CRAS Itinerante — Gerador</h1>
            <p className="text-xs text-zinc-500">1080 × 1440 px · Instagram Portrait</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* ── Formulário ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Personalizar Arte</h2>

            {/* Bairro */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label htmlFor="f-bairro" className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">
                Nome do Bairro ✦ Aparece em destaque
              </label>
              <input
                id="f-bairro"
                title="Nome do Bairro"
                type="text"
                value={campos.bairro}
                onChange={campo('bairro')}
                placeholder="Ex: Centro, Vila Nova..."
                className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-zinc-600 focus:outline-none focus:border-yellow-400/60 transition-colors"
              />
            </div>

            {/* Data + Hora */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Data e Hora</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-data" className="block text-xs text-zinc-500 mb-1">Data</label>
                  <input id="f-data" title="Data" type="text" value={campos.data} onChange={campo('data')} placeholder="22 de Março"
                    className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-400/50 transition-colors" />
                </div>
                <div>
                  <label htmlFor="f-hora" className="block text-xs text-zinc-500 mb-1">Hora</label>
                  <input id="f-hora" title="Hora" type="text" value={campos.hora} onChange={campo('hora')} placeholder="13H"
                    className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-400/50 transition-colors" />
                </div>
              </div>
            </div>

            {/* Local */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label htmlFor="f-local" className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Local</label>
              <input id="f-local" title="Local" type="text" value={campos.local} onChange={campo('local')} placeholder="Ex: Praça Principal"
                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-400/50 transition-colors" />
            </div>

            {/* Texto */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label htmlFor="f-texto" className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Texto Descritivo</label>
              <textarea id="f-texto" title="Texto descritivo" value={campos.texto} onChange={campo('texto')} rows={5}
                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-400/50 transition-colors resize-none text-sm leading-relaxed" />
              <p className="text-[11px] text-zinc-600 mt-1">Use linhas em branco para separar parágrafos</p>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button onClick={() => setCampos(DEFAULT)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> Resetar
              </button>
              <button onClick={baixar}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-bold transition-all shadow-[0_0_24px_-8px_rgba(59,130,246,0.5)]">
                <Download className="w-5 h-5" /> Baixar PNG (1080 × 1440)
              </button>
            </div>
          </div>

          {/* ── Preview Canvas ──────────────────────────────────────────────── */}
          <div className="sticky top-24">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview ao vivo</span>
                <span className="text-xs text-zinc-600">1080 × 1440 px</span>
              </div>
              <div className="w-full overflow-hidden rounded-xl bg-[#0a0a0a]" style={{ aspectRatio: '3/4' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', imageRendering: 'crisp-edges', display: 'block' }} />
              </div>
              <p className="text-center text-xs text-zinc-600 mt-3">Proporção 3:4 · Instagram Feed Portrait</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
