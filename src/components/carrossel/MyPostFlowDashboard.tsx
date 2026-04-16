import React, { useState } from 'react';
import { ArrowRight, Sparkles, BookOpen, PenLine, Search, FolderOpen, RefreshCw, Sun, CopyPlus, Trash2, ExternalLink } from 'lucide-react';

export interface MyPostFlowDashboardProps {
  onBack: () => void;
  onOpenStudio: (mode: 'ai' | 'scratch' | 'train') => void;
  isAdmin?: boolean;
}

export function MyPostFlowDashboard({ onBack, onOpenStudio, isAdmin }: MyPostFlowDashboardProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] font-sans flex flex-col">
      {/* ── Header idêntico ao original ── */}
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-5 bg-[#0a0a0a]/97 border-b border-[rgba(255,255,255,0.07)] backdrop-blur">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center mr-1">
            <span className="text-[10px] font-black text-white">M</span>
          </div>
          <span className="text-[13px] font-bold text-white">MyPostFlow</span>
        </div>

        {/* Nav central */}
        <nav className="flex items-center gap-0.5">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[13px] font-medium"
          >Dashboard</button>
          <button
            onClick={() => onOpenStudio('scratch')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white text-[13px] transition-all"
          >Gerador</button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white text-[13px] transition-all"
          >Organização</button>
        </nav>

        {/* Direita: ícones + avatar */}
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:bg-white/5 hover:text-white transition-all" title="Atualizar">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:bg-white/5 hover:text-white transition-all" title="Alternância de tema">
            <Sun className="w-4 h-4" />
          </button>
          {/* Avatar */}
          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-white/8 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{isAdmin ? 'AD' : 'FO'}</span>
            </div>
            <span className="text-[13px] text-white/60">{isAdmin ? 'Admin' : 'fontescampanhas'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] w-full mx-auto px-7 py-10 flex-1">
        
        {/* Creation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 items-stretch">
          
          {/* Card 1: Criar com IA */}
          <button 
            type="button" 
            onClick={() => onOpenStudio('ai')}
            className="group bg-[#161616] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] rounded-[18px] p-7 pt-7 pb-6 cursor-pointer text-left flex flex-col gap-3 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 mt-1">
              <div className="text-[17px] font-extrabold tracking-[-0.02em] mb-1.5 leading-tight">
                Criar com IA
              </div>
              <div className="text-[13px] text-[#666666] leading-[1.55]">
                Dê um tópico e deixe a IA montar o carrossel completo — texto, layout e imagens.
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg bg-white text-[#0a0a0a] text-[13px] font-bold w-fit group-hover:opacity-90 transition-opacity">
              Começar <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
            </div>
          </button>

          {/* Card 2: Treinar Carrossel */}
          <button 
            type="button" 
            onClick={() => onOpenStudio('train')}
            className="group bg-[#111111] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] rounded-[18px] p-7 pt-7 pb-6 cursor-pointer text-left flex flex-col gap-3 transition-colors relative"
          >
            <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 mt-1">
              <div className="text-[17px] font-extrabold tracking-[-0.02em] mb-1.5 leading-tight">
                Treinar Carrossel
              </div>
              <div className="text-[13px] text-[#666666] leading-[1.55]">
                Configure seu nicho, tom e instruções uma vez. A IA usa seu perfil em todos os carrosséis.
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg bg-[rgba(255,255,255,0.07)] text-[#f0f0f0] text-[13px] font-bold w-fit group-hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              Configurar <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
            </div>
          </button>

          {/* Card 3: Criar do Zero */}
          <button 
            type="button"
            onClick={() => onOpenStudio('scratch')}
            className="group bg-[#111111] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] rounded-[18px] p-7 pt-7 pb-6 cursor-pointer text-left flex flex-col gap-3 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <PenLine className="w-[22px] h-[22px]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 mt-1">
              <div className="text-[17px] font-extrabold tracking-[-0.02em] mb-1.5 leading-tight">
                Criar do Zero
              </div>
              <div className="text-[13px] text-[#666666] leading-[1.55]">
                Abra o editor e construa seu carrossel manualmente, slide por slide, com controle total.
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg bg-[rgba(255,255,255,0.07)] text-[#f0f0f0] text-[13px] font-bold w-fit group-hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              Abrir editor <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
            </div>
          </button>

        </div>

        {/* Seção Posts Gerados */}
        <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
          <h2 className="m-0 text-[12px] font-bold tracking-[0.1em] uppercase text-[#666666] flex-shrink-0">
            Posts Gerados
          </h2>
          <div className="flex-1 min-w-[140px] relative">
            <Search className="absolute left-[9px] top-1/2 -translate-y-1/2 w-3 h-3 text-[#666666] pointer-events-none" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full box-border pl-7 pr-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] text-[#f0f0f0] text-[11px] outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
            />
          </div>
          <button className="flex items-center gap-1.5 shrink-0 px-3.5 py-[7px] rounded-[9px] text-[12px] font-semibold border border-[rgba(255,255,255,0.07)] bg-transparent text-[#666666] hover:text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.04)] transition-all">
            <FolderOpen className="w-[13px] h-[13px]" /> Organização
          </button>
        </div>

        {/* Grid de Posts — shimmer 3 colunas (igual ao original) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#161616] rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.07)] group relative">
              {/* Badges no topo */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 pt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-[10px] font-medium text-white/70">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  Minimalista
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-[10px] font-medium text-white/50">
                  {i === 2 ? '1' : '5'} slides
                </span>
              </div>
              {/* Thumbnail */}
              <div className="w-full aspect-[4/5] bg-[linear-gradient(110deg,#1a1a1a_8%,#222_18%,#1a1a1a_33%)] bg-[length:200%_100%] animate-[shimmer_1.5s_linear_infinite] relative">
                {/* Ícone de sem preview */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  <span className="text-[9px] uppercase tracking-widest">Sem preview</span>
                </div>
              </div>
              {/* Info */}
              <div className="px-3 pt-3 pb-2">
                <div className="h-[14px] w-[70%] rounded-md mb-2 bg-[#1e1e1e]" />
                <div className="text-[11px] text-white/25">{i === 1 ? '2h atrás' : i === 2 ? '2h atrás' : '16h atrás'}</div>
              </div>
              {/* Botões de ação (igual original) */}
              <div className="h-9 border-t border-[rgba(255,255,255,0.07)] flex items-stretch">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] text-white/40 hover:bg-white/4 hover:text-white/70 transition-all border-r border-white/5">
                  <ExternalLink className="w-3 h-3" /> Abrir
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] text-white/40 hover:bg-white/4 hover:text-white/70 transition-all border-r border-white/5">
                  <CopyPlus className="w-3 h-3" /> Duplicar
                </button>
                <button className="px-3 flex items-center justify-center text-[11px] text-red-500/40 hover:bg-red-500/5 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
      
      <style>{`
        @keyframes shimmer {
          to { background-position-x: -200%; }
        }
      `}</style>
    </div>
  );
}
