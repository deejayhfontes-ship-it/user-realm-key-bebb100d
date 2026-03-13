import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Crown, Download, Palette, FileImage, Eye, ChevronDown, X,
  Package, GraduationCap, Heart, Hammer, Sprout, HandHeart, Dumbbell,
  Clapperboard, Landmark, ExternalLink, FolderOpen, Building2, Star
} from 'lucide-react';
import { useState } from 'react';
import {
  SECRETARIAS, GOVERNO_LOGOS, CORES, FOLDER_IDS,
  driveFolderUrl,
  type LogoItem, type SecretariaData
} from './brand-kit-data';

// ─── Mapa de ícones ───────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap, Heart, Hammer, Sprout, HandHeart,
  Dumbbell, Clapperboard, Landmark, Building2,
};

// ─── Card individual de logo ─────────────────────────────────────────────────
function LogoCard({
  logo,
  accentText,
  accentBg,
  accentBorder,
  FallbackIcon,
  onPreview,
}: {
  logo: LogoItem;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  FallbackIcon: React.ComponentType<{ className?: string }>;
  onPreview: (url: string) => void;
}) {
  const [imgOk, setImgOk] = useState(!!logo.previewSrc);
  const thumbUrl = logo.previewSrc || null;
  const downloadUrl = logo.downloadUrl;
  const viewUrl = logo.driveFolder ? driveFolderUrl(logo.driveFolder) : downloadUrl;

  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-xl p-3 group hover:border-white/[0.15] transition-all">
      {/* Preview */}
      <div
        className="aspect-[4/3] bg-[#1a1a1a] rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer relative border border-white/[0.04]"
        onClick={() => thumbUrl && imgOk && onPreview(thumbUrl)}
        style={{ cursor: thumbUrl && imgOk ? 'pointer' : 'default' }}
      >
        {thumbUrl && imgOk ? (
          <img
            src={thumbUrl}
            alt={logo.nome}
            className="max-w-full max-h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FallbackIcon className={`w-8 h-8 ${accentText} opacity-40`} />
            <span className="text-[10px] text-zinc-600">Ver no Drive</span>
          </div>
        )}
        {thumbUrl && imgOk && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Eye className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Info + ações */}
      <div>
        <h4 className={`font-bold text-sm ${accentText} truncate`}>{logo.tipo}</h4>
        <p className="text-[10px] text-zinc-600 truncate mb-2">{logo.nome}</p>
        <div className="flex gap-1.5">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-medium rounded-lg border ${accentBorder} ${accentBg} ${accentText} hover:opacity-80 transition-opacity`}
          >
            <Download className="w-3 h-3" />
            Baixar
          </a>
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Abrir no Drive"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function BrandKit() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white" style={{ colorScheme: 'dark' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/80 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/prefeitura')}
              className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>

            <h1 className="text-xl font-bold text-white">🏛️ Brand Kit Prefeitura</h1>

            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ───────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ══ 00 — PREFEITURA, BRASÃO & GOVERNO (DESTAQUE) ══════════════ */}
        <section>
          {/* Badge de destaque */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Identidade Principal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Prefeitura, Brasão & Governo</h2>
              <p className="text-sm text-zinc-500">Logos oficiais da administração municipal</p>
            </div>
            <a
              href={driveFolderUrl(FOLDER_IDS.pasta00)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Abrir pasta no Drive
            </a>
          </div>

          {/* Cards destacados — layout maior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GOVERNO_LOGOS.map((logo) => (
              <div
                key={logo.tipo}
                className="bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/10 hover:border-amber-400/30 rounded-2xl p-5 transition-all group"
              >
                {/* Preview maior */}
                <div
                  className="aspect-video bg-[#0a0a0a] rounded-xl mb-4 flex items-center justify-center border border-white/[0.04] overflow-hidden cursor-pointer relative"
                  onClick={() => {
                    if (logo.previewSrc) setPreviewUrl(logo.previewSrc);
                  }}
                >
                  {logo.previewSrc ? (
                    <img
                      src={logo.previewSrc}
                      alt={logo.nome}
                      className="max-w-full max-h-full object-contain p-4 opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement
                          ?.querySelector('.fallback-icon')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`fallback-icon ${logo.previewSrc ? 'hidden' : ''} flex flex-col items-center gap-2`}>
                    <Building2 className="w-12 h-12 text-amber-500/30" />
                    <span className="text-xs text-zinc-600">Clique para ver no Drive</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="font-bold text-white mb-0.5">{logo.nome}</h3>
                <p className="text-xs text-zinc-500 mb-4">{logo.tipo}</p>

                <div className="flex gap-2">
                  <a
                    href={logo.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:border-amber-400/40 rounded-xl hover:bg-amber-500/15 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </a>
                  <a
                    href={logo.driveFolder ? driveFolderUrl(logo.driveFolder) : logo.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Abrir no Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ PALETA DE CORES ════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Paleta de Cores</h2>
              <p className="text-sm text-zinc-500">Clique em qualquer cor para copiar o hex</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CORES.map((cor) => (
              <button
                key={cor.hex}
                onClick={() => handleCopy(cor.hex)}
                className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4 hover:border-rose-400/30 transition-all text-left group relative overflow-hidden"
                title="Clique para copiar"
              >
                {copied === cor.hex && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-2xl z-10">
                    <span className="text-green-400 text-sm font-bold">Copiado!</span>
                  </div>
                )}
                <div className="w-full aspect-square rounded-xl mb-3 border border-white/[0.06]" style={{ backgroundColor: cor.hex }} />
                <h3 className="font-bold text-white text-sm">{cor.nome}</h3>
                <p className="text-xs text-zinc-500 mb-1">{cor.uso}</p>
                <code className="text-xs text-rose-400 group-hover:text-rose-300 font-mono">{cor.hex}</code>
              </button>
            ))}
          </div>
        </section>

        {/* ══ LOGOS DAS SECRETARIAS ══════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Logos das Secretarias</h2>
              <p className="text-sm text-zinc-500">Clique em uma secretaria para expandir e baixar</p>
            </div>
            <a
              href={driveFolderUrl(FOLDER_IDS.raiz)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Ver todas no Drive
            </a>
          </div>

          <p className="text-xs text-zinc-600 mb-8 ml-[52px]">
            Versões Colorida, Monocromática e Negativa — alta resolução
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {SECRETARIAS.map((sec) => {
              const Icone = ICON_MAP[sec.iconeKey] ?? Building2;
              const isExpanded = expandedCard === sec.pasta;

              return (
                <div
                  key={sec.pasta}
                  className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? `col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 ${sec.corBorda}`
                      : `bg-[#111111] ${sec.corBorda}`
                  }`}
                >
                  {/* Header do card */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : sec.pasta)}
                    className="w-full text-left p-5 flex items-center gap-4 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sec.cor} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icone className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{sec.nome}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {sec.logos.length} versões disponíveis
                      </p>
                    </div>
                    <ChevronDown className={`w-5 h-5 ${sec.corTexto} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Conteúdo expandido */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/[0.06] pt-5 bg-[#0a0a0a]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
                        {sec.logos.map((logo) => (
                          <LogoCard
                            key={logo.tipo}
                            logo={logo}
                            accentText={sec.corTexto}
                            accentBg={sec.corBg}
                            accentBorder={sec.corBorda}
                            FallbackIcon={ICON_MAP[sec.iconeKey] ?? Building2}
                            onPreview={setPreviewUrl}
                          />
                        ))}
                      </div>

                      {/* Rodapé — abre pasta no Drive */}
                      <div className="flex items-center justify-between bg-[#111111] rounded-xl px-4 py-3 border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <FolderOpen className={`w-5 h-5 ${sec.corTexto}`} />
                          <div>
                            <p className="text-sm font-medium text-white">Ver todos no Google Drive</p>
                            <p className="text-[10px] text-zinc-500">PNG alta resolução • Pasta {sec.pasta}</p>
                          </div>
                        </div>
                        <a
                          href={driveFolderUrl(sec.folderId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${sec.cor} text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir no Drive
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── Modal de Preview Fullscreen ────────────────────────────────── */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="Preview" className="w-full rounded-2xl shadow-2xl" />
            <div className="flex items-center justify-center gap-4 mt-6">
              <a
                href={previewUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Baixar Imagem
              </a>
              <button
                onClick={() => setPreviewUrl(null)}
                className="px-6 py-3 text-zinc-400 hover:text-white border border-white/10 rounded-xl hover:border-white/30 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
