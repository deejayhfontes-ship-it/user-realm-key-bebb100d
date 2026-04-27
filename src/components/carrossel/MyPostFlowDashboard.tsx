import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, Sparkles, BookOpen, PenLine, Search,
  FolderOpen, RefreshCw, Sun, Moon, CopyPlus, Trash2,
  ExternalLink, LayoutGrid,
} from 'lucide-react';
import {
  listCarousels, deleteCarousel, duplicateCarousel,
  type SavedCarousel,
} from '@/services/carrossel-service';
import { useToast } from '@/hooks/use-toast';
import type { CarouselV2 } from '@/types/carrossel-v2';

export interface MyPostFlowDashboardProps {
  onBack: () => void;
  onOpenStudio: (mode: 'ai' | 'scratch' | 'train') => void;
  onOpenCarousel?: (carousel: CarouselV2) => void;
  isAdmin?: boolean;
}

// Formata data relativa
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

// Mapa de label por formato
const FORMAT_LABEL: Record<string, string> = {
  carousel: 'Carrossel',
  square: 'Quadrado',
  story: 'Stories',
};

// Card shimmer placeholder
function ShimmerCard() {
  return (
    <div className="bg-[#161616] rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.07)]">
      <div className="w-full aspect-[4/5] bg-[linear-gradient(110deg,#1a1a1a_8%,#222_18%,#1a1a1a_33%)] bg-[length:200%_100%] animate-[shimmer_1.5s_linear_infinite]" />
      <div className="px-3 pt-3 pb-3 space-y-2">
        <div className="h-[14px] w-[70%] rounded-md bg-[#1e1e1e]" />
        <div className="h-[10px] w-[40%] rounded-md bg-[#1a1a1a]" />
      </div>
    </div>
  );
}

export function MyPostFlowDashboard({
  onBack, onOpenStudio, onOpenCarousel, isAdmin,
}: MyPostFlowDashboardProps) {
  void onBack; // kept for API compat — logo uses navigate(-1) via parent
  const { toast } = useToast();
  const [carousels, setCarousels] = useState<SavedCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCarousels();
      setCarousels(data);
    } catch {
      // sem auth ou tabela ainda não existe — mostra vazio
      setCarousels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apagar este carrossel?')) return;
    try {
      await deleteCarousel(id);
      setCarousels(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Carrossel apagado' });
    } catch (err) {
      toast({ title: 'Erro ao apagar', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateCarousel(id);
      toast({ title: 'Duplicado!' });
      load();
    } catch {
      toast({ title: 'Erro ao duplicar', variant: 'destructive' });
    }
  };

  const handleOpen = (c: SavedCarousel) => {
    if (onOpenCarousel) {
      onOpenCarousel({
        id: c.id,
        title: c.title,
        postStyle: c.style,
        slideFormat: c.format,
        slides: c.slides,
      });
    }
  };

  const filtered = carousels.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-[#f0f0f0]' : 'bg-[#f5f5f5] text-[#0a0a0a]'} font-sans flex flex-col transition-colors`}>

      {/* ── Header ── */}
      <header className={`sticky top-0 z-50 h-14 flex items-center justify-between px-5 ${isDark ? 'bg-[#0a0a0a]/97 border-[rgba(255,255,255,0.07)]' : 'bg-[#f5f5f5]/97 border-black/10'} border-b backdrop-blur`}>
        {/* Logo */}
        <div className="flex items-center gap-1">
          <div className={`w-7 h-7 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center mr-1`}>
            <span className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-black'}`}>M</span>
          </div>
          <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>MyPostFlow</span>
        </div>

        {/* Nav central */}
        <nav className="flex items-center gap-0.5">
          <button type="button" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} text-[13px] font-medium`}>
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onOpenStudio('scratch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDark ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-black/50 hover:bg-black/5 hover:text-black'} text-[13px] transition-all`}
          >
            Gerador
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDark ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-black/50 hover:bg-black/5 hover:text-black'} text-[13px] transition-all`}
          >
            Organização
          </button>
        </nav>

        {/* Direita */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-white/30 hover:bg-white/5 hover:text-white' : 'text-black/30 hover:bg-black/5 hover:text-black'} transition-all`}
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsDark(d => !d)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-white/30 hover:bg-white/5 hover:text-white' : 'text-black/30 hover:bg-black/5 hover:text-black'} transition-all`}
            title="Alternar tema"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className={`flex items-center gap-2 ml-1 pl-3 ${isDark ? 'border-white/8' : 'border-black/10'} border-l cursor-pointer hover:opacity-80 transition-opacity`}>
            <div className={`w-7 h-7 rounded-full ${isDark ? 'bg-white/15' : 'bg-black/10'} flex items-center justify-center`}>
              <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>{isAdmin ? 'AD' : 'FO'}</span>
            </div>
            <span className={`text-[13px] ${isDark ? 'text-white/60' : 'text-black/50'}`}>{isAdmin ? 'Admin' : 'fontescampanhas'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-white/30' : 'text-black/30'}><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1280px] w-full mx-auto px-7 py-10 flex-1">

        {/* Cards de criação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 items-stretch">

          {/* Criar com IA */}
          <button
            type="button"
            onClick={() => onOpenStudio('ai')}
            className={`group ${isDark ? 'bg-[#161616] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]' : 'bg-white border-black/8 hover:border-black/20'} border rounded-[18px] p-7 pt-7 pb-6 cursor-pointer text-left flex flex-col gap-3 transition-colors`}
          >
            <div className={`w-11 h-11 rounded-xl ${isDark ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-black/5'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <Sparkles className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 mt-1">
              <div className={`text-[17px] font-extrabold tracking-[-0.02em] mb-1.5 leading-tight ${isDark ? '' : 'text-[#0a0a0a]'}`}>Criar com IA</div>
              <div className={`text-[13px] ${isDark ? 'text-[#666666]' : 'text-[#888888]'} leading-[1.55]`}>Dê um tópico e deixe a IA montar o carrossel completo — texto, layout e imagens.</div>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg bg-white text-[#0a0a0a] text-[13px] font-bold w-fit group-hover:opacity-90 transition-opacity`}>
              Começar <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
            </div>
          </button>

          {/* Treinar Carrossel */}
          <button
            type="button"
            onClick={() => onOpenStudio('train')}
            className={`group ${isDark ? 'bg-[#111111] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]' : 'bg-[#f9f9f9] border-black/8 hover:border-black/20'} border rounded-[18px] p-7 pt-7 pb-6 cursor-pointer text-left flex flex-col gap-3 transition-colors relative`}
          >
            <div className={`w-11 h-11 rounded-xl ${isDark ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-black/5'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <BookOpen className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 mt-1">
              <div className={`text-[17px] font-extrabold tracking-[-0.02em] mb-1.5 leading-tight ${isDark ? '' : 'text-[#0a0a0a]'}`}>Treinar Carrossel</div>
              <div className={`text-[13px] ${isDark ? 'text-[#666666]' : 'text-[#888888]'} leading-[1.55]`}>Configure seu nicho, tom e identidade visual. A IA usa seu perfil em todos os carrosséis.</div>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg ${isDark ? 'bg-[rgba(255,255,255,0.07)] text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)]' : 'bg-black/8 text-[#0a0a0a] hover:bg-black/12'} text-[13px] font-bold w-fit transition-colors`}>
              Configurar <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
            </div>
          </button>

          {/* Criar do Zero */}
          <button
            type="button"
            onClick={() => onOpenStudio('scratch')}
            className={`group ${isDark ? 'bg-[#111111] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)]' : 'bg-[#f9f9f9] border-black/8 hover:border-black/20'} border rounded-[18px] p-7 pt-7 pb-6 cursor-pointer text-left flex flex-col gap-3 transition-colors`}
          >
            <div className={`w-11 h-11 rounded-xl ${isDark ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-black/5'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <PenLine className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 mt-1">
              <div className={`text-[17px] font-extrabold tracking-[-0.02em] mb-1.5 leading-tight ${isDark ? '' : 'text-[#0a0a0a]'}`}>Criar do Zero</div>
              <div className={`text-[13px] ${isDark ? 'text-[#666666]' : 'text-[#888888]'} leading-[1.55]`}>Abra o editor e construa seu carrossel manualmente, slide por slide, com controle total.</div>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg ${isDark ? 'bg-[rgba(255,255,255,0.07)] text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)]' : 'bg-black/8 text-[#0a0a0a] hover:bg-black/12'} text-[13px] font-bold w-fit transition-colors`}>
              Abrir editor <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
            </div>
          </button>
        </div>

        {/* Seção Posts Gerados */}
        <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
          <h2 className={`m-0 text-[12px] font-bold tracking-[0.1em] uppercase ${isDark ? 'text-[#666666]' : 'text-[#999]'} flex-shrink-0`}>
            Posts Gerados
          </h2>
          <div className="flex-1 min-w-[140px] relative">
            <Search className={`absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? 'text-[#666666]' : 'text-[#999]'} pointer-events-none`} />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full box-border pl-7 pr-2.5 py-1.5 rounded-lg border ${isDark ? 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] text-[#f0f0f0] focus:border-[rgba(255,255,255,0.15)]' : 'border-black/8 bg-black/3 text-black focus:border-black/20'} text-[11px] outline-none transition-colors`}
            />
          </div>
          <button
            type="button"
            onClick={load}
            className={`flex items-center gap-1.5 shrink-0 px-3.5 py-[7px] rounded-[9px] text-[12px] font-semibold border ${isDark ? 'border-[rgba(255,255,255,0.07)] text-[#666666] hover:text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.04)]' : 'border-black/8 text-[#999] hover:text-black hover:bg-black/5'} bg-transparent transition-all`}
          >
            <FolderOpen className="w-[13px] h-[13px]" /> Organização
          </button>
        </div>

        {/* Grid de Posts */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <ShimmerCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 gap-4 ${isDark ? 'text-white/20' : 'text-black/20'}`}>
            <LayoutGrid className="w-10 h-10" strokeWidth={1} />
            <p className="text-[13px]">
              {search ? 'Nenhum resultado encontrado' : 'Nenhum carrossel salvo ainda'}
            </p>
            {!search && (
              <button
                type="button"
                onClick={() => onOpenStudio('ai')}
                className="text-[12px] font-semibold underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                Criar meu primeiro carrossel →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => (
              <div
                key={c.id}
                className={`${isDark ? 'bg-[#161616] border-[rgba(255,255,255,0.07)]' : 'bg-white border-black/8'} rounded-[14px] overflow-hidden border group relative cursor-pointer hover:border-white/15 transition-colors`}
                onClick={() => handleOpen(c)}
              >
                {/* Badges topo */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 pt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-[10px] font-medium text-white/70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    {FORMAT_LABEL[c.format] ?? c.format}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-[10px] font-medium text-white/50">
                    {c.slides.length} slides
                  </span>
                </div>

                {/* Thumbnail */}
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.title} className="w-full aspect-[4/5] object-cover" />
                ) : (
                  <div className={`w-full aspect-[4/5] ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#eee]'} relative flex flex-col items-center justify-center gap-2 ${isDark ? 'text-white/15' : 'text-black/15'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    <span className="text-[9px] uppercase tracking-widest">Sem preview</span>
                  </div>
                )}

                {/* Info */}
                <div className="px-3 pt-3 pb-2">
                  <p className={`text-[13px] font-semibold truncate ${isDark ? 'text-white/80' : 'text-black/80'} mb-1`}>{c.title}</p>
                  <div className={`text-[11px] ${isDark ? 'text-white/25' : 'text-black/30'}`}>{timeAgo(c.updated_at)}</div>
                </div>

                {/* Botões */}
                <div className={`h-9 border-t ${isDark ? 'border-[rgba(255,255,255,0.07)]' : 'border-black/6'} flex items-stretch`}>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleOpen(c); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] ${isDark ? 'text-white/40 hover:bg-white/4 hover:text-white/70' : 'text-black/40 hover:bg-black/4 hover:text-black/70'} transition-all border-r ${isDark ? 'border-white/5' : 'border-black/5'}`}
                  >
                    <ExternalLink className="w-3 h-3" /> Abrir
                  </button>
                  <button
                    type="button"
                    onClick={e => handleDuplicate(c.id, e)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] ${isDark ? 'text-white/40 hover:bg-white/4 hover:text-white/70' : 'text-black/40 hover:bg-black/4 hover:text-black/70'} transition-all border-r ${isDark ? 'border-white/5' : 'border-black/5'}`}
                  >
                    <CopyPlus className="w-3 h-3" /> Duplicar
                  </button>
                  <button
                    type="button"
                    title="Apagar carrossel"
                    onClick={e => handleDelete(c.id, e)}
                    className="px-3 flex items-center justify-center text-[11px] text-red-500/40 hover:bg-red-500/5 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer { to { background-position-x: -200%; } }
      `}</style>
    </div>
  );
}
