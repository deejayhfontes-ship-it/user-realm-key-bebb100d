import React, { useState } from 'react';
import {
  Sparkles, Download, Heart, Globe, RotateCcw, Star,
  Pencil, Paperclip, Send, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isGenerating: boolean;
  resultImage: string | null;
  finalPrompt?: string;
  onGenerate: () => void;
  niche: string;
}

export default function ResultArea({ isGenerating, resultImage, finalPrompt, onGenerate, niche }: Props) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [liked, setLiked] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Estado vazio — sem geração ainda
  if (!isGenerating && !resultImage) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-xs space-y-5">
          <div className="mx-auto h-24 w-24 rounded-3xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center"
            style={{ boxShadow: 'inset 0 0 30px rgba(168,85,247,0.05)' }}>
            <Sparkles className="h-12 w-12 text-zinc-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Preview 8K</h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Configure os parâmetros na barra lateral e clique em{' '}
              <span className="text-violet-400 font-semibold">Gerar Imagem</span> para começar.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Formato', 'Sujeito', 'Estilo'].map(label => (
              <div key={label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
                <div className="h-1 w-full rounded-full bg-white/[0.05] mb-2" />
                <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Gerando
  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-violet-400/40 animate-spin" />
            <div className="absolute inset-4 flex items-center justify-center rounded-full bg-violet-500/10">
              <Sparkles className="h-7 w-7 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-400 animate-pulse">
              Processando IA...
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {niche ? `Criando visual para "${niche}"` : 'Gerando imagem...'}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {['Analisando', 'Compondo', 'Renderizando'].map((step, i) => (
              <span key={step} className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1 text-[9px] text-zinc-500 border border-white/[0.05]">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500/50 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Funções de ação ──────────────────────────────────────────
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `designbuilder-${(niche || 'imagem').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download iniciado!');
  };

  const handleCopyPrompt = () => {
    const text = finalPrompt || '';
    if (!text) { toast.error('Prompt não disponível.'); return; }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Prompt copiado!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Resultado gerado
  return (
    <div className="relative flex h-full flex-col">

      {/* ── Painel do Prompt (expansível) ── */}
      {finalPrompt && (
        <div className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ${showPrompt ? 'max-h-56' : 'max-h-0'} overflow-hidden`}>
          <div className="mx-4 mt-4 rounded-xl border border-violet-500/20 bg-black/90 backdrop-blur-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Prompt Final Gerado</span>
              <button
                onClick={handleCopyPrompt}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                }`}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed overflow-y-auto max-h-28 pr-1 font-mono">
              {finalPrompt}
            </p>
          </div>
        </div>
      )}

      {/* Imagem resultado */}
      <div className="group relative flex-1 overflow-hidden m-4 rounded-2xl border border-white/[0.06] bg-black/20">
        <img
          src={resultImage!}
          alt="Resultado gerado"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />

        {/* Overlay gradiente no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ── Botões inferiores esquerda ── */}
      <div className="absolute bottom-[84px] left-8 z-30 flex items-center gap-1.5">
        <button
          onClick={onGenerate}
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium bg-black/70 text-zinc-300 hover:text-white backdrop-blur-sm transition-all border border-white/[0.06] hover:border-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reutilizar
        </button>
        <button
          onClick={() => setLiked(l => !l)}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium bg-black/70 backdrop-blur-sm transition-all border ${
            liked ? 'text-pink-400 border-pink-500/20' : 'text-zinc-300 hover:text-white border-white/[0.06] hover:border-white/10'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Favoritado' : 'Favoritar'}
        </button>
        <button
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium bg-black/70 text-zinc-300 hover:text-white backdrop-blur-sm transition-all border border-white/[0.06] hover:border-white/10"
        >
          <Globe className="h-3.5 w-3.5" />
          Publicar
        </button>
        
        {/* ── Botão Ver Prompt ── */}
        {finalPrompt && (
          <button
            onClick={() => setShowPrompt(s => !s)}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium backdrop-blur-sm transition-all border ${
              showPrompt
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                : 'bg-black/70 text-zinc-300 hover:text-white border-white/[0.06] hover:border-white/10'
            }`}
          >
            <Copy className="h-3.5 w-3.5" />
            {showPrompt ? 'Fechar Prompt' : 'Ver Prompt'}
          </button>
        )}
      </div>

      {/* ── Botões inferiores direita ── */}
      <div className="absolute bottom-[84px] right-8 z-30 flex items-center gap-1.5">
        {/* Avaliação por estrelas */}
        <div className="flex items-center gap-0.5 rounded-lg bg-black/55 px-2.5 py-2 backdrop-blur-sm border border-white/[0.06]">
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v}
              type="button"
              onMouseEnter={() => setHoverStars(v)}
              onMouseLeave={() => setHoverStars(0)}
              onClick={() => setStars(v)}
              className="p-0.5 transition-all hover:scale-110"
            >
              <Star className={`h-4 w-4 transition-colors ${v <= (hoverStars || stars) ? 'fill-current text-amber-400' : 'text-zinc-600'}`} />
            </button>
          ))}
        </div>

        {/* ── DOWNLOAD REAL ── */}
        <button
          onClick={handleDownload}
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white backdrop-blur-sm transition-all border border-violet-500/40 hover:scale-105 active:scale-95"
          style={{ boxShadow: '0 0 14px rgba(139,92,246,0.35)' }}
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>

      {/* ── Magic Bar (refinamento) ── */}
      <div className="absolute bottom-6 left-1/2 z-20 w-[calc(100%-120px)] max-w-[480px] -translate-x-1/2 overflow-hidden rounded-[22px] border border-white/[0.08] bg-black/70 backdrop-blur-2xl"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-300/80 transition-all hover:bg-violet-500/20 hover:text-violet-200 hover:scale-105"
            title="Marcar área"
          >
            <Pencil className="h-[17px] w-[17px]" />
          </button>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-300/80 transition-all hover:bg-violet-500/20 hover:text-violet-200 hover:scale-105"
            title="Anexar imagem"
          >
            <Paperclip className="h-[17px] w-[17px]" />
          </button>
          <input
            type="text"
            value={refineText}
            onChange={e => setRefineText(e.target.value)}
            placeholder="Descreva a alteração mágica..."
            className="min-w-0 flex-1 bg-transparent px-1 text-[14px] text-zinc-100 outline-none placeholder-zinc-600"
          />
          <button
            disabled={!refineText.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 bg-violet-600 text-white hover:bg-violet-500"
            style={refineText.trim() ? { boxShadow: '0 0 12px rgba(139,92,246,0.5)' } : undefined}
          >
            <Send className="h-[16px] w-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
