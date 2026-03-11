import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Eye } from 'lucide-react';

// ─── Assets do Figma (Figma Dev Mode MCP local na porta 3845) ─────────────────
const IMG_LOGO  = 'http://localhost:3845/assets/52add733f1e2711ee7ac0494890ee51c52ba9920.png';
const IMG_VAN   = 'http://localhost:3845/assets/67b7a86baa773398eb36970d809477b850f48bdd.png';
const IMG_RODAPE = 'http://localhost:3845/assets/9c9293deb83f8fb9ac456ee714f3a40fdf34b966.png';

// ─── Tipagens ─────────────────────────────────────────────────────────────────
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
  texto: 'Participe de uma tarde especial de acolhimento, informação e convivência para toda a comunidade. Será um momento para esclarecer dúvidas, conhecer serviços, fortalecer vínculos e garantir direitos. Sua presença é muito importante.\nEsperamos por você!',
};

// ─── Canvas: 1080 × 1440 ─────────────────────────────────────────────────────
const W = 1080;
const H = 1440;

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
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
      if (ctx.measureText(test).width <= maxW) { line = test; }
      else { if (line) out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}

// Renderiza texto com contorno
function strokeText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, strokeColor: string, fillColor: string, width = 4) {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
}

export default function CrasItineranteGerador() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [campos, setCampos] = useState<Campos>(DEFAULT);
  const [erro, setErro] = useState(false);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    // ── 1. FUNDO ─────────────────────────────────────────────────────────────
    // Gradiente azul claro premium
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0.00, '#d6eeff');
    bgGrad.addColorStop(0.35, '#b8dcf5');
    bgGrad.addColorStop(0.70, '#9fcde8');
    bgGrad.addColorStop(1.00, '#7ab8da');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Padrão de pontos decorativos (textura sutil)
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let x = 0; x < W; x += 40) {
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#043555';
        ctx.fill();
      }
    }
    ctx.restore();

    // Onda decorativa superior (arco azul escuro)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, 260);
    ctx.quadraticCurveTo(W / 2, 320, 0, 260);
    ctx.closePath();
    ctx.fillStyle = '#043555';
    ctx.fill();
    ctx.restore();

    // Linha decorativa na borda da onda
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 260);
    ctx.quadraticCurveTo(W / 2, 320, W, 260);
    ctx.strokeStyle = '#0771b6';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // ── 2. LOGO + DATA/HORA (sobre onda escura) ───────────────────────────────
    const [imgLogo, imgVan, imgRodape] = await Promise.all([
      loadImg(IMG_LOGO), loadImg(IMG_VAN), loadImg(IMG_RODAPE),
    ]);
    setErro(!imgLogo && !imgVan && !imgRodape);

    if (imgLogo) {
      const lw = 420;
      const lh = (imgLogo.height / imgLogo.width) * lw;
      ctx.drawImage(imgLogo, 50, 30, lw, lh);
    } else {
      // fallback texto logo
      ctx.font = 'bold 80px Inter, Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('CRAS ITINERANTE', 50, 130);
    }

    // Data + Hora (canto superior direito, sobre a onda escura)
    ctx.textAlign = 'right';
    ctx.font = '900 56px Inter, Arial, sans-serif';
    ctx.fillStyle = '#f5c400';  // amarelo
    ctx.fillText(`${campos.data.toUpperCase()} • ${campos.hora.toUpperCase()}`, W - 50, 110);

    // Local (abaixo da data)
    ctx.font = '500 34px Inter, Arial, sans-serif';
    ctx.fillStyle = '#b8dcf5';
    ctx.fillText(campos.local, W - 50, 160);

    ctx.textAlign = 'left';

    // ── 3. TÍTULO PRINCIPAL ───────────────────────────────────────────────────
    // "O CRAS" – navy escuro grande
    ctx.font = '900 110px Inter, Arial, sans-serif';
    const titleGrad = ctx.createLinearGradient(50, 320, 50, 550);
    titleGrad.addColorStop(0, '#022b44');
    titleGrad.addColorStop(1, '#0771b6');
    ctx.fillStyle = titleGrad;
    ctx.fillText('O CRAS', 50, 440);

    // "vai até você!" – peso semibold
    ctx.font = '700 90px Inter, Arial, sans-serif';
    ctx.fillStyle = '#0a4b7a';
    ctx.fillText('vai até você!', 50, 545);

    // ── 4. FAIXA BAIRRO ───────────────────────────────────────────────────────
    const faixaY = 580;
    const faixaH = 140;

    // Sombra da faixa
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#043555';
    ctx.fillRect(0, faixaY, W, faixaH);
    ctx.restore();

    // Faixa principal gradient azul profundo
    const faixaGrad = ctx.createLinearGradient(0, faixaY, W, faixaY + faixaH);
    faixaGrad.addColorStop(0, '#02273d');
    faixaGrad.addColorStop(0.5, '#043555');
    faixaGrad.addColorStop(1, '#055080');
    ctx.fillStyle = faixaGrad;
    ctx.fillRect(0, faixaY, W, faixaH);

    // Linha dourada superior da faixa
    ctx.fillStyle = '#f5c400';
    ctx.fillRect(0, faixaY, W, 5);

    // Linha dourada inferior
    ctx.fillStyle = '#0771b6';
    ctx.fillRect(0, faixaY + faixaH - 5, W, 5);

    // Texto bairro – Inter ExtraBold, amarelo com contorno para legibilidade máxima
    const bairroUpper = campos.bairro.toUpperCase();
    let faixaFontSize = 80;
    ctx.font = `900 ${faixaFontSize}px Inter, Arial, sans-serif`;
    while (ctx.measureText(bairroUpper).width > W - 100 && faixaFontSize > 40) {
      faixaFontSize -= 4;
      ctx.font = `900 ${faixaFontSize}px Inter, Arial, sans-serif`;
    }
    ctx.textAlign = 'center';
    strokeText(ctx, bairroUpper, W / 2, faixaY + faixaH / 2 + faixaFontSize * 0.36, '#022b44', '#f5c400', 8);
    ctx.textAlign = 'left';

    // ── 5. IMAGEM VAN ─────────────────────────────────────────────────────────
    if (imgVan) {
      const vanW = 820;
      const vanH = (imgVan.height / imgVan.width) * vanW;
      // Posiciona a van centralizada abaixo da faixa, sobrepondo levemente
      ctx.drawImage(imgVan, (W - vanW) / 2, faixaY + faixaH - 40, vanW, vanH);
    }

    // ── 6. TEXTO DESCRITIVO ───────────────────────────────────────────────────
    const descrY = imgVan
      ? faixaY + faixaH - 40 + (imgVan.height / imgVan.width) * 820 - 20
      : faixaY + faixaH + 300;
    const descrMaxW = W - 100;

    // Caixa de fundo semitransparente para melhorar legibilidade
    const linhas = wrapText(ctx, campos.texto, descrMaxW);
    const lineH = 44;
    const boxH = linhas.length * lineH + 60;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#022b44';
    ctx.beginPath();
    const bx = 40, by = descrY, bw = W - 80, br = 16;
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + bw - br, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
    ctx.lineTo(bx + bw, by + boxH - br);
    ctx.quadraticCurveTo(bx + bw, by + boxH, bx + bw - br, by + boxH);
    ctx.lineTo(bx + br, by + boxH);
    ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - br);
    ctx.lineTo(bx, by + br);
    ctx.quadraticCurveTo(bx, by, bx + br, by);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.font = '400 30px Inter, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    let ty = descrY + 40;
    for (const linha of linhas) {
      ctx.fillText(linha, 70, ty);
      ty += lineH;
    }

    // ── 7. RODAPÉ ─────────────────────────────────────────────────────────────
    const rpH = 110;
    const rpY = H - rpH;

    if (imgRodape) {
      ctx.drawImage(imgRodape, 0, rpY, W, rpH);
    } else {
      ctx.fillStyle = '#022b44';
      ctx.fillRect(0, rpY, W, rpH);
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px Inter, Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('PREFEITURA MUNICIPAL DE HELIODORA | SECRETARIA DE ASSISTÊNCIA SOCIAL', W / 2, rpY + 60);
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
          <div>
            <h1 className="text-lg font-bold text-white text-center">CRAS Itinerante — Gerador</h1>
            <p className="text-xs text-zinc-500 text-center">1080 × 1440 px · Instagram Portrait</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/* ── Formulário ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Personalizar Arte</h2>
            <p className="text-zinc-400 text-sm -mt-2">Preview ao vivo · Exportação em PNG 1080×1440</p>

            {erro && (
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
                ⚠️ Imagens do template não encontradas (requer Figma Desktop aberto). Layout base mantido.
              </div>
            )}

            {/* Bairro */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label htmlFor="f-bairro" className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">
                Nome do Bairro
              </label>
              <input
                id="f-bairro"
                title="Nome do Bairro"
                type="text"
                value={campos.bairro}
                onChange={campo('bairro')}
                placeholder="Ex: Centro, Vila Nova..."
                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
              <p className="text-[11px] text-zinc-600 mt-1">Aparece em destaque na faixa azul da arte</p>
            </div>

            {/* Data + Hora */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">
                Data e Hora
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-data" className="block text-xs text-zinc-500 mb-1">Data</label>
                  <input
                    id="f-data"
                    title="Data do Evento"
                    type="text"
                    value={campos.data}
                    onChange={campo('data')}
                    placeholder="22 de Março"
                    className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="f-hora" className="block text-xs text-zinc-500 mb-1">Hora</label>
                  <input
                    id="f-hora"
                    title="Hora do Evento"
                    type="text"
                    value={campos.hora}
                    onChange={campo('hora')}
                    placeholder="13H"
                    className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Local */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label htmlFor="f-local" className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">
                Local
              </label>
              <input
                id="f-local"
                title="Local do Evento"
                type="text"
                value={campos.local}
                onChange={campo('local')}
                placeholder="Ex: Praça Principal, Salão Comunitário..."
                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
            </div>

            {/* Texto descritivo */}
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
              <label htmlFor="f-texto" className="block text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">
                Texto Descritivo
              </label>
              <textarea
                id="f-texto"
                title="Texto Descritivo"
                value={campos.texto}
                onChange={campo('texto')}
                rows={5}
                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button
                onClick={() => setCampos(DEFAULT)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Resetar
              </button>
              <button
                onClick={baixar}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold transition-all shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)]"
              >
                <Download className="w-5 h-5" />
                Baixar PNG (1080 × 1440)
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
              {/* aspect-ratio 3/4 */}
              <div
                className="w-full overflow-hidden rounded-xl bg-[#0a0a0a]"
                style={{ aspectRatio: '3/4' }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ imageRendering: 'crisp-edges', display: 'block' }}
                />
              </div>
              <p className="text-center text-xs text-zinc-600 mt-3">
                Proporção 3:4 · Ideal para Instagram (Feed Portrait)
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
