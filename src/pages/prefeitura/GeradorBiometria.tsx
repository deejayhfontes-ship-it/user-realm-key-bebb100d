import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';

import imgFundo from '@/assets/prefeitura/arte/fundoBIOMETRIA.jpg';

// ─── Canvas 1080 × 1440 ─────────────────────────────────────────────────────
const W = 1080;
const H = 1440;

// ─── Apenas os campos EDITÁVEIS (o resto já está no fundo) ──────────────────
interface Campos {
  chamadaFaixaVerde: string;
  textoInformativo: string;
  horario: string;
  textoCaixaVerde: string;
}

const DEFAULT: Campos = {
  chamadaFaixaVerde: '4 de outubro é o Dia da Biometria',
  textoInformativo:
    'Todos os cartórios eleitorais e centrais\nde atendimento ao eleitor em Minas Gerais\nestarão abertos das {HORARIO}\npara atender você.',
  horario: '9h às 17h',
  textoCaixaVerde:
    'Quem ainda não fez a biometria,\nprecisa fazer.\nAproveite essa oportunidade!',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((r) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => r(i);
    i.onerror = () => r(null);
    i.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxLines: number
): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) {
      if (out.length < maxLines) out.push('');
      continue;
    }
    let line = '';
    for (const word of para.split(' ')) {
      if (out.length >= maxLines) break;
      const t = line ? `${line} ${word}` : word;
      if (ctx.measureText(t).width <= maxW) line = t;
      else {
        if (line) out.push(line);
        line = word;
      }
    }
    if (line && out.length < maxLines) out.push(line);
  }
  return out;
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function GeradorBiometria() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [campos, setCampos] = useState<Campos>(DEFAULT);

  const render = useCallback(async () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    cv.width = W;
    cv.height = H;
    ctx.clearRect(0, 0, W, H);

    // ── 1. FUNDO BASE — contém título, digital, logos, slogan já fixos ─────
    const fundo = await loadImg(imgFundo);
    if (fundo) {
      ctx.drawImage(fundo, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#2B4C8C';
      ctx.fillRect(0, 0, W, H);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // APENAS A ÁREA EDITÁVEL DO MEIO — tudo o mais vem do fundo
    // Posições e tamanhos extraídos do gabarito 00BIOMETRIA.jpg (1080×1440)
    // Verde = #99FF66 conforme referência
    // ══════════════════════════════════════════════════════════════════════════

    const VERDE = '#99FF66';
    const AZUL = '#2B4C8C';
    const BORDA = '#66CC44';

    // ── FAIXA VERDE — "4 de outubro é o Dia da Biometria" ──────────────────
    const faixaX = 42;
    const faixaY = 415;
    const faixaW = W - 84;
    const faixaH = 88;

    ctx.fillStyle = VERDE;
    ctx.fillRect(faixaX, faixaY, faixaW, faixaH);
    ctx.strokeStyle = BORDA;
    ctx.lineWidth = 4;
    ctx.strokeRect(faixaX, faixaY, faixaW, faixaH);

    ctx.save();
    ctx.fillStyle = AZUL;
    ctx.font = '900 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(campos.chamadaFaixaVerde, W / 2, faixaY + faixaH / 2);
    ctx.restore();

    // ── CAIXA BRANCA — texto informativo + horário destaque laranja ─────────
    const cxBY = faixaY + faixaH;
    const cxBH = 320;
    const cxBX = 42;
    const cxBW = W - 84;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cxBX, cxBY, cxBW, cxBH);
    ctx.strokeStyle = BORDA;
    ctx.lineWidth = 4;
    ctx.strokeRect(cxBX, cxBY, cxBW, cxBH);

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const textoComHorario = campos.textoInformativo.replace('{HORARIO}', '___H___');
    ctx.font = 'bold 42px Arial, sans-serif';
    const infoLines = wrapText(ctx, textoComHorario, cxBW - 80, 6);
    let infoY = cxBY + 28;
    const lineH = 52;

    for (const line of infoLines) {
      if (line.includes('___H___')) {
        const parts = line.split('___H___');
        let cx = cxBX + 40;

        ctx.fillStyle = AZUL;
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.fillText(parts[0], cx, infoY);
        cx += ctx.measureText(parts[0]).width;

        // Horário em caixa laranja
        ctx.font = 'bold 40px Arial, sans-serif';
        const horW = ctx.measureText(campos.horario).width;
        ctx.fillStyle = '#E8762B';
        ctx.fillRect(cx, infoY - 4, horW + 20, 56);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(campos.horario, cx + 10, infoY);
        cx += horW + 24;

        if (parts[1]) {
          ctx.fillStyle = AZUL;
          ctx.font = 'bold 42px Arial, sans-serif';
          ctx.fillText(parts[1], cx, infoY);
        }
      } else {
        ctx.fillStyle = AZUL;
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.fillText(line, cxBX + 40, infoY);
      }
      infoY += lineH;
    }
    ctx.restore();

    // ── CAIXA VERDE — texto motivacional ───────────────────────────────────
    const cxVY = cxBY + cxBH + 16;
    const cxVH = 250;
    const cxVX = 42;
    const cxVW = W - 84;

    ctx.fillStyle = VERDE;
    ctx.fillRect(cxVX, cxVY, cxVW, cxVH);
    ctx.strokeStyle = BORDA;
    ctx.lineWidth = 4;
    ctx.strokeRect(cxVX, cxVY, cxVW, cxVH);

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AZUL;
    ctx.font = 'bold 42px Arial, sans-serif';
    const greenLines = wrapText(ctx, campos.textoCaixaVerde, cxVW - 70, 5);
    let gy = cxVY + 28;
    for (const line of greenLines) {
      ctx.fillText(line, cxVX + 35, gy);
      gy += 54;
    }
    ctx.restore();
  }, [campos]);

  useEffect(() => {
    render();
  }, [render]);

  const set = <K extends keyof Campos>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCampos((p) => ({ ...p, [k]: e.target.value }));

  function baixar(formato: 'png' | 'jpeg') {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement('a');
    a.download = `post-biometria.${formato === 'jpeg' ? 'jpg' : formato}`;
    a.href = cv.toDataURL(`image/${formato}`, formato === 'jpeg' ? 0.95 : 1.0);
    a.click();
  }

  const inp = `w-full border border-blue-200 rounded-xl px-4 py-3 text-slate-800
    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white`;
  const lbl = 'block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-blue-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3370] via-[#2B4C8C] to-[#1a3370]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a3370]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/prefeitura/secretarias')}
            className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-white">Gerador de Post – Biometria</h1>
            <p className="text-xs text-white/40">1080 × 1440 · Instagram Portrait</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => baixar('png')}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-90 transition-all bg-white/10 hover:bg-white/20"
              title="Exportar PNG"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
          {/* ── FORMULÁRIO (apenas campos editáveis) ───────────────────── */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Personalizar Arte</h2>
              <p className="text-sm text-white/50 mt-0.5">Edite apenas os textos — layout fixo do modelo oficial</p>
            </div>

            {/* CHAMADA DA FAIXA VERDE */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <label htmlFor="f-faixa" className={lbl + ' !text-lime-400'}>
                🟩 Chamada da faixa verde
              </label>
              <input id="f-faixa" type="text" value={campos.chamadaFaixaVerde} onChange={set('chamadaFaixaVerde')}
                placeholder="4 de outubro é o Dia da Biometria" className={inp + ' font-bold'} />
            </div>

            {/* TEXTO INFORMATIVO + HORÁRIO */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <label htmlFor="f-info" className={lbl}>📋 Texto informativo (caixa branca)</label>
              <textarea id="f-info" rows={4} value={campos.textoInformativo} onChange={set('textoInformativo')}
                placeholder="Texto descritivo..."
                className={inp + ' resize-none text-sm leading-relaxed mb-3'} />
              <p className="text-xs text-white/30 mb-3">Use {'{HORARIO}'} para marcar onde o horário aparece em destaque laranja</p>

              <label htmlFor="f-hora" className={lbl + ' !text-orange-400'}>
                🕐 Horário (destaque laranja)
              </label>
              <input id="f-hora" type="text" value={campos.horario} onChange={set('horario')}
                placeholder="9h às 17h" className={inp + ' font-bold text-orange-600'} />
            </div>

            {/* CAIXA VERDE INFERIOR */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <label htmlFor="f-verde" className={lbl + ' !text-lime-400'}>
                🟢 Texto da caixa verde inferior
              </label>
              <textarea id="f-verde" rows={3} value={campos.textoCaixaVerde} onChange={set('textoCaixaVerde')}
                placeholder="Texto motivacional..."
                className={inp + ' resize-none text-sm leading-relaxed'} />
            </div>

            {/* AÇÕES */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setCampos(DEFAULT)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Restaurar modelo
              </button>
              <button
                onClick={() => baixar('png')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition-all bg-gradient-to-r from-[#A8D84E] to-[#7AA832]"
              >
                <Download className="w-5 h-5" /> Exportar PNG
              </button>
              <button
                onClick={() => baixar('jpeg')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-white/80 font-medium hover:opacity-90 transition-all border border-white/20 hover:bg-white/10"
              >
                <ImageIcon className="w-4 h-4" /> JPG
              </button>
            </div>
          </div>

          {/* ── PREVIEW ──────────────────────────────────────────────────── */}
          <div className="sticky top-24">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Preview ao vivo</span>
                <span className="text-xs text-white/20">1080 × 1440 px</span>
              </div>
              <div className="w-full overflow-hidden rounded-xl bg-[#2B4C8C]" style={{ aspectRatio: '3/4' }}>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: '100%', imageRendering: 'crisp-edges', display: 'block' }}
                />
              </div>
              <p className="text-center text-xs text-white/30 mt-3">3:4 · Instagram Portrait</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
