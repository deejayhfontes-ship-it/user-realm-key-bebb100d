
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, Save, Undo, Redo, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MyPostFlowSlideV2 } from './MyPostFlowSlideV2';
import { EditorSidebarV2 } from './EditorSidebarV2';
import type { SlideConfig, CarouselV2, SlideFormat } from '@/types/carrossel-v2';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';
import { refineSlideIA, gerarCarrossel } from '@/services/carrossel-api';
import { saveCarousel } from '@/services/carrossel-service';
import { cn } from '@/lib/utils';
import { PREMIUM_FONTS } from '@/types/carrossel-constants';

interface CarouselStudioV2ViewProps {
  initialData: CarouselV2;
  onBack: () => void;
}

// Dimensões originais
function getSlideHeight(f: SlideFormat) {
  return f === 'story' ? 1920 : f === 'square' ? 1080 : 1350;
}

// Slide padrão em branco
function newBlankSlide(idx: number): SlideConfig {
  return {
    id: `slide-${idx}-${Date.now()}`,
    title: 'TÍTULO DO POST',
    subtitle: 'Subtítulo ou frase de apoio',
    textAlign: 'center',
    textScale: 100,
    titleFontSize: 90,
    subtitleFontSize: 30,
    titleFont: PREMIUM_FONTS[0].id,
    subtitleFont: PREMIUM_FONTS[0].id,
    overlayStyle: 'bottom-strong',
    overlayOpacity: 90,
    bgPattern: 'none',
    slideDark: true,
    bgColor: '#0a0a0a',
    titleBlockY: 50,
    titleBlockGap: 20,
  };
}

// História de undo/redo
type HistoryEntry = CarouselV2;

export const CarouselStudioV2View: React.FC<CarouselStudioV2ViewProps> = ({
  initialData,
  onBack
}) => {
  const { toast } = useToast();
  const [carousel, setCarousel] = useState<CarouselV2>(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>(initialData.id);
  const [postStyle, setPostStyle] = useState<'minimalista' | 'profile'>('minimalista');

  // Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([initialData]);
  const [histIdx, setHistIdx] = useState(0);

  const currentSlide = carousel.slides[currentIndex] ?? carousel.slides[0];
  const slideFormat = carousel.slideFormat;
  const slideRealH = getSlideHeight(slideFormat);
  const aspectRatio = slideFormat === 'story' ? 9 / 16 : slideFormat === 'square' ? 1 : 4 / 5;
  const totalSlides = carousel.slides.length;

  // Preview scale (fixo — slides lado a lado igual ao original)
  const SLIDE_DISPLAY_H = 560;
  const scale = SLIDE_DISPLAY_H / slideRealH;

  const allSlideRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  allSlideRefs.current = carousel.slides.map((_, i) =>
    allSlideRefs.current[i] ?? React.createRef<HTMLDivElement>()
  );

  const pushHistory = useCallback((next: CarouselV2) => {
    setHistory(h => [...h.slice(0, histIdx + 1), next]);
    setHistIdx(i => i + 1);
    setCarousel(next);
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx > 0) {
      setHistIdx(i => i - 1);
      setCarousel(history[histIdx - 1]);
    }
  }, [histIdx, history]);

  const redo = useCallback(() => {
    if (histIdx < history.length - 1) {
      setHistIdx(i => i + 1);
      setCarousel(history[histIdx + 1]);
    }
  }, [histIdx, history]);

  const updateSlide = (updates: Partial<SlideConfig>) => {
    const next = {
      ...carousel,
      slides: carousel.slides.map((s, i) => i === currentIndex ? { ...s, ...updates } : s)
    };
    pushHistory(next);
  };

  const applyToAll = () => {
    const style = currentSlide;
    const next = {
      ...carousel,
      slides: carousel.slides.map(s => ({
        ...s,
        bgColor: style.bgColor,
        slideDark: style.slideDark,
        titleFont: style.titleFont,
        subtitleFont: style.subtitleFont,
        titleFontSize: style.titleFontSize,
        subtitleFontSize: style.subtitleFontSize,
        titleColor: style.titleColor,
        subtitleColor: style.subtitleColor,
        overlayStyle: style.overlayStyle,
        overlayOpacity: style.overlayOpacity,
        bgPattern: style.bgPattern,
        textAlign: style.textAlign,
        textScale: style.textScale,
      }))
    };
    pushHistory(next);
    toast({ title: "✅ Salvo!", description: "Estilo aplicado em todos os slides." });
  };

  const addSlide = () => {
    const newSlide = newBlankSlide(carousel.slides.length);
    const next = { ...carousel, slides: [...carousel.slides, newSlide] };
    pushHistory(next);
    setCurrentIndex(carousel.slides.length);
  };

  const removeSlide = (idx: number) => {
    if (carousel.slides.length <= 1) return;
    const next = { ...carousel, slides: carousel.slides.filter((_, i) => i !== idx) };
    pushHistory(next);
    if (currentIndex >= idx && currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // Exportar slide atual
  const exportSlide = async () => {
    const ref = allSlideRefs.current[currentIndex];
    if (!ref?.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(ref.current, { quality: 1, pixelRatio: 1 });
      const a = document.createElement('a');
      a.download = `slide-${currentIndex + 1}.png`;
      a.href = dataUrl; a.click();
      toast({ title: `Slide ${currentIndex + 1} exportado!` });
    } catch {
      toast({ title: "Erro na exportação", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar todos os slides
  const exportAll = async () => {
    toast({ title: "Exportando todos os slides..." });
    for (let i = 0; i < carousel.slides.length; i++) {
      const ref = allSlideRefs.current[i];
      if (!ref?.current) continue;
      try {
        const dataUrl = await toPng(ref.current, { quality: 1, pixelRatio: 1 });
        const a = document.createElement('a');
        a.download = `slide-${i + 1}.png`;
        a.href = dataUrl; a.click();
        await new Promise(r => setTimeout(r, 200));
      } catch { /* skip */ }
    }
    toast({ title: "✅ Todos os slides exportados!" });
  };

  // Salvar no Supabase (Ctrl+S)
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const toSave = { ...carousel, id: savedId };
      const id = await saveCarousel(toSave);
      setSavedId(id);
      setCarousel(c => ({ ...c, id }));
      toast({ title: '✅ Salvo!', description: 'Carrossel salvo na sua conta.' });
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Faça login para salvar carrosséis.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [carousel, savedId, toast]);

  const handleRefineIA = async (prompt: string) => {
    toast({ title: "IA Refinando..." });
    try {
      const result = await refineSlideIA(currentSlide, prompt);
      updateSlide({ title: result.title, subtitle: result.subtitle });
      toast({ title: "✅ Slide refinado!" });
    } catch {
      toast({ title: "Erro no refinamento", variant: "destructive" });
    }
  };

  const handleGenerateCarousel = async (topic: string, slideCount: number, _refImages: string[]) => {
    try {
      const result = await gerarCarrossel({
        angulo: { id: 0, tipo: 'IA', emoji: '✨', hook: topic, descricao: topic },
        pauta: { id: 0, titulo: topic, contexto: topic, potencial: 'alto' },
        formato: carousel.slideFormat === 'story' ? '1080x1920' : '1080x1440',
      });
      const newSlides: SlideConfig[] = result.copy.slides.slice(0, slideCount).map((s: { titulo: string; corpo: string }, idx: number) => ({
        id: `slide-${idx}-${Date.now()}`,
        title: s.titulo, subtitle: s.corpo,
        textAlign: 'center' as const, textScale: 100,
        titleFontSize: idx === 0 ? 90 : 64, subtitleFontSize: idx === 0 ? 28 : 30,
        titleFont: currentSlide.titleFont || PREMIUM_FONTS[0].id,
        subtitleFont: currentSlide.subtitleFont || PREMIUM_FONTS[0].id,
        overlayStyle: 'bottom-strong', overlayOpacity: 90,
        bgPattern: 'none', slideDark: true,
        bgColor: currentSlide.bgColor || '#0a0a0a',
        titleColor: currentSlide.titleColor,
        subtitleColor: currentSlide.subtitleColor,
      }));
      setCarousel(c => ({ ...c, slides: newSlides, title: topic.slice(0, 80) }));
      setCurrentIndex(0);
      toast({ title: `✅ ${newSlides.length} slides gerados!` });
    } catch (e) {
      toast({ title: 'Erro ao gerar', description: (e as Error).message, variant: 'destructive' });
    }
  };

  // Keyboard: setas para navegar slides, undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(totalSlides - 1, i + 1));
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(0, i - 1));
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [histIdx, history, totalSlides, handleSave, undo, redo]);

  return (
    <div className="fixed inset-0 z-50 bg-[#141414] text-white flex flex-col overflow-hidden">

      {/* ── HEADER (fiel ao original) ── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-[#0f0f0f] border-b border-white/5">
        {/* Logo + nav */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 hover:opacity-70 transition-opacity" title="Voltar ao dashboard">
            <span className="text-sm font-bold text-white">MyPostFlow</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <nav className="flex items-center gap-0.5">
            <button
              onClick={onBack}
              className="text-xs px-3 py-1.5 rounded-md text-white/50 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5"
            >
              Dashboard
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-md bg-white/10 text-white font-medium flex items-center gap-1.5"
            >
              Gerador
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-md text-white/50 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5"
            >
              Organização
            </button>
          </nav>
        </div>

        {/* Centro: título editável */}
        <input
          type="text"
          value={carousel.title}
          onChange={e => setCarousel(p => ({ ...p, title: e.target.value }))}
          className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-white/70 bg-transparent border-none outline-none text-center hover:text-white focus:text-white w-48 truncate"
          title="Nome do projeto"
        />

        {/* Direita: formato + undo/redo + save + download */}
        <div className="flex items-center gap-2">
          {/* Seletor de formato */}
          <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
            {([
              { fmt: 'carousel' as SlideFormat, label: 'Carrossel' },
              { fmt: 'square'   as SlideFormat, label: 'Quadrado' },
              { fmt: 'story'    as SlideFormat, label: 'Stories' },
            ] as const).map(({ fmt, label }) => (
              <button
                type="button"
                key={fmt}
                onClick={() => setCarousel(p => ({ ...p, slideFormat: fmt }))}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md transition-all font-medium',
                  carousel.slideFormat === fmt ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={histIdx === 0}
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20 transition-all"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={histIdx >= history.length - 1}
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20 transition-all"
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Slide counter */}
          <span className="text-xs text-white/30 font-mono">
            {currentIndex + 1}/{totalSlides}
          </span>

          <div className="w-px h-5 bg-white/10" />

          {/* Download */}
          <button
            type="button"
            onClick={exportAll}
            disabled={isExporting}
            title="Exportar todos os slides (PNG)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            title="Salvar (Ctrl+S)"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              isSaving
                ? 'bg-white/20 text-black/50 cursor-not-allowed'
                : 'bg-white text-black hover:bg-white/90'
            )}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Salvando…' : savedId ? 'Salvo ✓' : 'Salvar'}
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR ESQUERDA */}
        <EditorSidebarV2
          config={currentSlide}
          onChange={updateSlide}
          onRefineIA={handleRefineIA}
          onGenerateCarousel={handleGenerateCarousel}
          onApplyToAll={applyToAll}
          onApplyToAllSlides={(updates) => setCarousel(c => ({ ...c, slides: c.slides.map(s => ({ ...s, ...updates })) }))}
          onDownloadSlide={exportSlide}
          onDownloadAll={exportAll}
          onGenerateCaption={() => toast({ title: "Gerar Legenda — em breve!" })}
          onGenerateImage={() => toast({ title: "Gerar Imagem com IA — em breve!" })}
          slideIndex={currentIndex}
          postStyle={postStyle}
          onPostStyleChange={setPostStyle}
          isDark={currentSlide.slideDark !== false}
        />

        {/* CANVAS — slides lado a lado (igual ao original) */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Área de scroll horizontal com todos os slides */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center px-8 gap-4 py-6 bg-[#141414]">
            {carousel.slides.map((slide, idx) => (
              <div
                key={slide.id}
                tabIndex={0}
                onClick={() => setCurrentIndex(idx)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentIndex(idx)}
                className={cn(
                  'relative shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group',
                  idx === currentIndex
                    ? 'ring-2 ring-white shadow-2xl shadow-black/50 scale-[1.02]'
                    : 'opacity-60 hover:opacity-90 hover:scale-[1.01]'
                )}
                style={{ borderRadius: `${8 * scale}px` }}
              >
                {/* Número do slide + botão remover */}
                <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      fontSize: `${10 * scale}px`,
                      padding: `${2 * scale}px ${5 * scale}px`,
                      borderRadius: `${4 * scale}px`,
                      color: 'rgba(255,255,255,0.8)'
                    }}
                  >
                    {idx + 1}
                  </span>
                  {/* ⠿ drag handle visual */}
                  <span
                    className="opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ fontSize: `${10 * scale}px`, color: 'white' }}
                  >⠿</span>
                </div>

                {idx === currentIndex && carousel.slides.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSlide(idx); }}
                    className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover slide"
                    style={{
                      width: `${22 * scale}px`,
                      height: `${22 * scale}px`,
                      borderRadius: `${4 * scale}px`,
                      background: 'rgba(255,60,60,0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Trash2 style={{ width: `${10 * scale}px`, height: `${10 * scale}px`, color: 'white' }} />
                  </button>
                )}

                <MyPostFlowSlideV2
                  exportRef={allSlideRefs.current[idx]}
                  config={slide}
                  slideFormat={slideFormat}
                  slideIndex={idx}
                  totalSlides={totalSlides}
                  scale={scale}
                />
              </div>
            ))}

            {/* Botão adicionar slide */}
            <div
              tabIndex={0}
              onClick={addSlide}
              onKeyDown={(e) => e.key === 'Enter' && addSlide()}
              className="shrink-0 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 hover:bg-white/3 transition-all cursor-pointer"
              style={{
                width: `${1080 * scale}px`,
                height: `${slideRealH * scale}px`,
                borderRadius: `${8 * scale}px`,
              }}
            >
              <Plus style={{ width: `${28 * scale}px`, height: `${28 * scale}px`, color: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: `${11 * scale}px`, color: 'rgba(255,255,255,0.2)' }}>Novo slide</span>
            </div>
          </div>

          {/* Barra de status inferior (fiel ao original) */}
          <div className="h-8 shrink-0 border-t border-white/5 bg-[#0f0f0f] flex items-center px-4 gap-4">
            <span className="text-[10px] text-white/25">
              Slide {currentIndex + 1}/{totalSlides} · 1080 × {slideRealH} px · {postStyle === 'minimalista' ? 'Minimalista' : 'Profile'} · Clique para selecionar
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};
