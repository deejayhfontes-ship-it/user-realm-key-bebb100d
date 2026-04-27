import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, X, ChevronLeft, ArrowRight,
  PenLine, Clipboard, Upload, Image, Wand2, Check,
  ChevronDown, BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { gerarCarrossel } from '@/services/carrossel-api';
import { CarouselStudioV2View } from '@/components/carrossel/CarouselStudioV2View';
import { MyPostFlowDashboard } from '@/components/carrossel/MyPostFlowDashboard';
import { TrainingPage } from '@/components/carrossel/TrainingPage';
import { getTraining, listTemplates, type SavedTemplate } from '@/services/carrossel-service';
import type { CarouselV2, SlideConfig, SlideFormat } from '@/types/carrossel-v2';
import { PREMIUM_FONTS } from '@/types/carrossel-constants';

/* ── Tipos ── */
type PostStyle = 'minimalista' | 'profile';
type ImageMode = 'none' | 'bg' | 'grid' | 'alternate';
type ModalStep = 0 | 1 | 2 | 3 | 4;

interface IAConfig {
  topic: string;
  exactContent: boolean;
  language: string;
  slideCount: number;
  imageMode: ImageMode;
  generateAiImages: boolean;
  instagramHandle: string;
  fontCombo: string;
  brandBg: string;
  brandTitle: string;
  brandSub: string;
  accentColor: string;
}

const FONT_COMBOS = [
  { id: 'space-inter',      title: 'space-grotesk', sub: 'inter',        label: 'Space',       subLabel: 'Inter' },
  { id: 'caveat-space',     title: 'caveat',        sub: 'space-grotesk',label: 'Caveat',      subLabel: 'Space' },
  { id: 'playfair-dm',      title: 'playfair',      sub: 'dm-sans',      label: 'Playfair',    subLabel: 'DM Sans' },
  { id: 'syne-dm',          title: 'syne',          sub: 'dm-sans',      label: 'Syne',        subLabel: 'DM Sans' },
  { id: 'bebas-raleway',    title: 'bebas-neue',    sub: 'raleway',      label: 'Bebas',       subLabel: 'Raleway' },
  { id: 'outfit-space',     title: 'outfit',        sub: 'space-grotesk',label: 'Outfit',      subLabel: 'Space' },
  { id: 'montserrat-inter', title: 'montserrat',    sub: 'inter',        label: 'Montserrat',  subLabel: 'Inter' },
  { id: 'jakarta-inter',    title: 'plus-jakarta',  sub: 'inter',        label: 'Jakarta',     subLabel: 'Inter' },
  { id: 'manrope-space',    title: 'manrope',       sub: 'space-grotesk',label: 'Manrope',     subLabel: 'Space' },
  { id: 'urbanist-inter',   title: 'urbanist',      sub: 'inter',        label: 'Urbanist',    subLabel: 'Inter' },
  { id: 'jakarta-manrope',  title: 'plus-jakarta',  sub: 'manrope',      label: 'Jakarta',     subLabel: 'Manrope' },
  { id: 'manrope-inter',    title: 'manrope',       sub: 'inter',        label: 'Manrope',     subLabel: 'Inter' },
];

const DEFAULT_IA: IAConfig = {
  topic: '', exactContent: false, language: 'Português (BR)',
  slideCount: 5, imageMode: 'none', generateAiImages: false,
  instagramHandle: '', fontCombo: 'space-inter',
  brandBg: '', brandTitle: '', brandSub: '', accentColor: '',
};

const LANGUAGES = ['Português (BR)', 'Português (PT)', 'English', 'Español', 'Français', 'Italiano', 'Deutsch', '日本語', '中文 (简体)'];

/* ── Extrai cores dominantes de uma imagem via canvas ── */
async function extractColorsFromImage(src: string): Promise<{ bg: string; title: string; sub: string }> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 100 / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve({ bg: '#0a0a0a', title: '#ffffff', sub: '#aaaaaa' }); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < d.length; i += 16) {
          r += d[i]; g += d[i + 1]; b += d[i + 2]; count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        const toHex = (v: number) => v.toString(16).padStart(2, '0');
        const bg = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        resolve({ bg, title: lum > 0.5 ? '#000000' : '#ffffff', sub: lum > 0.5 ? '#333333' : '#aaaaaa' });
      } catch {
        resolve({ bg: '#0a0a0a', title: '#ffffff', sub: '#aaaaaa' });
      }
    };
    img.onerror = () => resolve({ bg: '#0a0a0a', title: '#ffffff', sub: '#aaaaaa' });
    img.src = src;
  });
}

/* ── Step dots ── */
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-3 pb-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-[5px] rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-white' : 'w-[5px] bg-white/20'}`} />
      ))}
    </div>
  );
}

/* ── Style card ── */
function StyleCard({ label, desc, icon, selected, onClick }: {
  label: string; desc: string; icon: React.ReactNode; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button" onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl border-[1.5px] cursor-pointer text-center transition-all relative ${
        selected ? 'border-white/50 bg-white/[0.07]' : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center">{icon}</div>
      <div className="text-[14px] font-bold text-white">{label}</div>
      <div className="text-[11px] text-white/40 leading-[1.5]">{desc}</div>
    </button>
  );
}

/* ── Minimalista / Profile thumbnail ── */
function StyleThumbnail({ style }: { style: 'minimalista' | 'profile' }) {
  if (style === 'minimalista') {
    return (
      <div className="w-[52px] h-[65px] bg-[#1a1a1a] rounded-[6px] flex flex-col justify-end p-1.5 border border-white/5">
        <div className="w-full h-[3px] rounded-full bg-white/80 mb-[2px]" />
        <div className="w-[60%] h-[2px] rounded-full bg-white/30" />
      </div>
    );
  }
  return (
    <div className="w-[52px] h-[65px] bg-[#f5f5f5] rounded-[6px] flex flex-col items-center pt-2.5 gap-1.5 border border-black/5">
      <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-[8px] text-black/40 font-bold">X</div>
      <div className="w-[70%] h-[2px] rounded-full bg-black/15" />
      <div className="w-[55%] h-[2px] rounded-full bg-black/10" />
      <div className="w-[60%] h-[2px] rounded-full bg-black/10" />
    </div>
  );
}

/* ── Botão primário do modal ── */
function PrimaryBtn({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all ${
        disabled ? 'bg-white/30 text-black/50 cursor-not-allowed opacity-40' : 'bg-white text-black hover:bg-white/90 cursor-pointer'
      }`}
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none font-inherit">
      <ChevronLeft className="w-[14px] h-[14px]" /> Voltar
    </button>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function MyPostFlowPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showStudio, setShowStudio] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [studioData, setStudioData] = useState<CarouselV2 | null>(null);

  // Modal state
  const [step, setStep] = useState<ModalStep>(0);
  const [slideFormat, setSlideFormat] = useState<SlideFormat>('carousel');
  const [postStyle, setPostStyle] = useState<PostStyle>('minimalista');
  const [iaConfig, setIaConfig] = useState<IAConfig>(DEFAULT_IA);
  const [loading, setLoading] = useState(false);
  const [refImages, setRefImages] = useState<string[]>([]);
  const [showFonts, setShowFonts] = useState(false);
  const [brandMode, setBrandMode] = useState<'manual' | 'image'>('manual');
  const [extractingColors, setExtractingColors] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const brandImageInputRef = useRef<HTMLInputElement>(null);

  const updateIA = (patch: Partial<IAConfig>) => setIaConfig(p => ({ ...p, ...patch }));

  /* Paste handler para imagens de referência */
  useEffect(() => {
    if (step !== 3) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          if (refImages.length >= 5) {
            toast({ title: 'Limite atingido', description: 'Máximo de 5 imagens de referência.', variant: 'destructive' });
            return;
          }
          const r = new FileReader();
          r.onload = ev => setRefImages(p => p.length < 5 ? [...p, ev.target?.result as string] : p);
          r.readAsDataURL(file);
          e.preventDefault();
          toast({ title: 'Imagem colada!', description: 'Imagem adicionada como referência.' });
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [step, refImages.length, toast]);

  const openAiModal = async () => {
    setStep(1);
    setSlideFormat('carousel');
    setPostStyle('minimalista');
    setRefImages([]);
    setShowFonts(false);
    setBrandMode('manual');
    setShowTemplates(false);
    // Pré-preencher com treinamento salvo
    try {
      const t = await getTraining();
      const combo = FONT_COMBOS.find(c => c.title === t.font_title);
      setIaConfig({
        ...DEFAULT_IA,
        instagramHandle: t.instagram_handle,
        fontCombo: combo?.id ?? DEFAULT_IA.fontCombo,
        brandBg: t.brand_bg !== '#0a0a0a' ? t.brand_bg : '',
        brandTitle: t.brand_title_color,
        brandSub: t.brand_sub_color,
        accentColor: t.accent_color,
        slideCount: t.slide_count,
      });
    } catch {
      setIaConfig(DEFAULT_IA);
    }
  };

  const closeModal = () => { setStep(0); setShowTemplates(false); };

  /* Carregar templates do Supabase */
  const handleToggleTemplates = async () => {
    const next = !showTemplates;
    setShowTemplates(next);
    if (next && templates.length === 0) {
      setLoadingTemplates(true);
      try {
        const list = await listTemplates();
        setTemplates(list);
      } catch {
        toast({ title: 'Erro ao carregar templates', variant: 'destructive' });
      } finally {
        setLoadingTemplates(false);
      }
    }
  };

  /* Aplicar template salvo */
  const applyTemplate = (tmpl: SavedTemplate) => {
    const firstSlide = tmpl.slides[0];
    const comboById = FONT_COMBOS.find(c => c.title === firstSlide?.titleFont);
    updateIA({
      slideCount: tmpl.slides.length,
      fontCombo: comboById?.id ?? iaConfig.fontCombo,
      brandBg: firstSlide?.bgColor ?? iaConfig.brandBg,
      brandTitle: firstSlide?.titleColor ?? iaConfig.brandTitle,
      brandSub: firstSlide?.subtitleColor ?? iaConfig.brandSub,
    });
    setPostStyle(tmpl.style as PostStyle);
    setSlideFormat(tmpl.format as SlideFormat);
    setShowTemplates(false);
    toast({ title: 'Template aplicado!', description: `"${tmpl.name}" carregado com sucesso.` });
  };

  /* Extrair cores de imagem (Via Imagem) */
  const handleBrandImageUpload = async (file: File) => {
    setExtractingColors(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const src = ev.target?.result as string;
      try {
        const colors = await extractColorsFromImage(src);
        updateIA({ brandBg: colors.bg, brandTitle: colors.title, brandSub: colors.sub });
        setBrandMode('manual');
        toast({ title: 'Cores extraídas!', description: 'Identidade visual aplicada automaticamente.' });
      } catch {
        toast({ title: 'Erro ao extrair cores', variant: 'destructive' });
      } finally {
        setExtractingColors(false);
      }
    };
    reader.readAsDataURL(file);
  };

  /* Gerar carrossel final */
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await gerarCarrossel({
        angulo: { id: 0, tipo: 'IA', emoji: '✨', hook: iaConfig.topic, descricao: iaConfig.topic },
        pauta: { id: 0, titulo: iaConfig.topic, contexto: iaConfig.topic, potencial: 'alto' },
        formato: slideFormat === 'story' ? '1080x1920' : '1080x1440'
      });
      const selectedCombo = FONT_COMBOS.find(c => c.id === iaConfig.fontCombo) ?? FONT_COMBOS[0];
      const slides: SlideConfig[] = result.copy.slides.map((s: { titulo: string; corpo: string }, idx: number) => ({
        id: `slide-${idx}-${Date.now()}`,
        title: s.titulo, subtitle: s.corpo,
        textAlign: 'center', textScale: 100,
        titleFontSize: idx === 0 ? 90 : 64,
        subtitleFontSize: idx === 0 ? 28 : 30,
        titleFont: selectedCombo.title,
        subtitleFont: selectedCombo.sub,
        overlayStyle: 'bottom-strong', overlayOpacity: 90,
        bgPattern: 'none', slideDark: true, bgColor: iaConfig.brandBg || '#0a0a0a',
        titleColor: iaConfig.brandTitle || undefined,
        subtitleColor: iaConfig.brandSub || undefined,
        ...(iaConfig.instagramHandle ? {
          profileBadgeHandle: iaConfig.instagramHandle.startsWith('@') ? iaConfig.instagramHandle : `@${iaConfig.instagramHandle}`,
          showProfileBadge: true
        } : {})
      }));
      setStudioData({ title: iaConfig.topic.slice(0, 80), postStyle, slideFormat, slides });
      closeModal();
      setShowStudio(true);
    } catch (e) {
      toast({ title: 'Erro ao gerar carrossel', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [iaConfig, slideFormat, postStyle, toast]);

  /* Abrir editor */
  const handleOpenStudio = (mode: 'ai' | 'scratch' | 'train') => {
    if (mode === 'ai') { openAiModal(); return; }
    if (mode === 'train') { setShowTraining(true); return; }
    // scratch
    const blankSlides: SlideConfig[] = Array.from({ length: 4 }).map((_, idx) => ({
      id: `slide-${idx}-${Date.now()}`,
      title: idx === 0 ? 'TÍTULO\nAQUI' : 'CONTEÚDO VAI AQUI',
      subtitle: idx === 0 ? 'Seu subtítulo explicativo' : 'Adicione os detalhes deste slide',
      textAlign: 'center', textScale: 100, titleFontSize: 80, subtitleFontSize: 30,
      titleFont: PREMIUM_FONTS[0].id, subtitleFont: PREMIUM_FONTS[0].id,
      overlayStyle: 'bottom-strong', overlayOpacity: 80, bgPattern: 'none',
      slideDark: true, bgColor: '#0a0a0a'
    }));
    setStudioData({ title: 'Novo Projeto', postStyle: 'minimalista', slideFormat: 'carousel', slides: blankSlides });
    setShowStudio(true);
  };

  /* Abrir carrossel salvo */
  const handleOpenCarousel = (carousel: CarouselV2) => {
    setStudioData(carousel);
    setShowStudio(true);
  };

  /* ── Treinar ── */
  if (showTraining) {
    return <TrainingPage onBack={() => setShowTraining(false)} />;
  }

  /* ── Studio ativo ── */
  if (showStudio && studioData) {
    return <CarouselStudioV2View initialData={studioData} onBack={() => setShowStudio(false)} />;
  }

  const isModalOpen = step > 0;
  const selectedCombo = FONT_COMBOS.find(c => c.id === iaConfig.fontCombo) ?? FONT_COMBOS[0];
  const selectedComboLabel = `${selectedCombo.label} + ${selectedCombo.subLabel}`;

  return (
    <>
      <MyPostFlowDashboard
        onBack={() => navigate(-1)}
        onOpenStudio={handleOpenStudio}
        onOpenCarousel={handleOpenCarousel}
      />

      {/* ══════════ MODAL ══════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-3 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[500px] rounded-[20px] border border-white/[0.08] relative my-auto"
              style={{ background: '#111', padding: '28px 22px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            >
              {step > 0 && (
                <button type="button" onClick={closeModal} aria-label="Fechar modal" className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer bg-transparent border-none p-1">
                  <X className="w-[18px] h-[18px]" />
                </button>
              )}

              {/* ═══ STEP 1: Formato e Estilo ═══ */}
              {step === 1 && (
                <div>
                  <StepDots total={4} current={0} />
                  <h2 className="text-[22px] font-[800] text-center tracking-[-0.03em] mt-0 mb-1.5">Formato e Estilo</h2>
                  <p className="text-[13px] text-white/40 text-center mb-5">Escolha o formato do post e depois o estilo visual</p>

                  <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-white/40 mb-2.5">Formato do post</p>
                  <div className="flex gap-2 mb-6">
                    {([
                      ['carousel', 'Carrossel', '4:5 · 1080×1350'],
                      ['square', 'Quadrado', '1:1 · 1080×1080'],
                      ['story', 'Stories', '9:16 · 1080×1920'],
                    ] as const).map(([fmt, label, desc]) => {
                      const sel = slideFormat === fmt;
                      return (
                        <button key={fmt} type="button" onClick={() => setSlideFormat(fmt)}
                          className={`flex-1 py-3 px-2 rounded-xl cursor-pointer text-center transition-all border-[1.5px] ${
                            sel ? 'border-white/60 bg-white/[0.07]' : 'border-white/[0.08] hover:border-white/15'
                          }`}
                        >
                          <div className="text-[13px] font-bold text-white mb-0.5">{label}</div>
                          <div className="text-[10px] text-white/30">{desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] font-bold tracking-[0.06em] uppercase text-white/40 mb-2.5">Estilo visual</p>
                  <div className="flex gap-3 mb-7">
                    <StyleCard
                      label="Minimalista"
                      desc="Texto em destaque, overlays cinematográficos, tipografia bold"
                      icon={<StyleThumbnail style="minimalista" />}
                      selected={postStyle === 'minimalista'}
                      onClick={() => setPostStyle('minimalista')}
                    />
                    <StyleCard
                      label="Profile (Twitter)"
                      desc="Estética de screenshot de tweet. Limpo, focado em texto"
                      icon={<StyleThumbnail style="profile" />}
                      selected={postStyle === 'profile'}
                      onClick={() => setPostStyle('profile')}
                    />
                  </div>

                  <PrimaryBtn onClick={() => setStep(2)}>Continuar <ArrowRight className="w-[14px] h-[14px]" /></PrimaryBtn>
                </div>
              )}

              {/* ═══ STEP 2: Como deseja começar? ═══ */}
              {step === 2 && (
                <div>
                  <StepDots total={4} current={1} />
                  <h2 className="text-[22px] font-[800] text-center tracking-[-0.03em] mt-0 mb-1.5">Como deseja começar?</h2>
                  <p className="text-[13px] text-white/40 text-center mb-7">Deixe a IA fazer o trabalho pesado ou comece do zero</p>

                  <div className="flex gap-3 mb-7">
                    <StyleCard
                      label="Usar IA"
                      desc="Dê um tópico e criamos slides com conteúdo, layout e imagens automaticamente"
                      icon={<Sparkles className="w-7 h-7" strokeWidth={1.5} />}
                      selected={false}
                      onClick={() => setStep(3)}
                    />
                    <StyleCard
                      label="Criação Manual"
                      desc="Comece do zero. Adicione slides, escreva textos e faça upload de imagens"
                      icon={<PenLine className="w-7 h-7" strokeWidth={1.5} />}
                      selected={false}
                      onClick={() => { closeModal(); handleOpenStudio('scratch'); }}
                    />
                  </div>

                  <BackBtn onClick={() => setStep(1)} />
                </div>
              )}

              {/* ═══ STEP 3: Configurar IA ═══ */}
              {step === 3 && (
                <div>
                  <StepDots total={4} current={2} />
                  <h2 className="text-[22px] font-[800] text-center tracking-[-0.03em] mt-0 mb-1.5">Configurar IA</h2>
                  <p className="text-[13px] text-white/40 text-center mb-5">Diga sobre o que é o conteúdo e como quer o carrossel</p>

                  <div className="mb-3.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">Sobre o que é o conteúdo?</label>
                    <textarea
                      value={iaConfig.topic} onChange={e => updateIA({ topic: e.target.value })}
                      placeholder="Ex: 5 prompts ultra realistas para foto de perfil com IA..."
                      rows={3}
                      className="w-full rounded-[10px] p-3 resize-y bg-white/[0.04] border border-white/[0.08] text-white text-[13px] leading-[1.5] outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 mb-4">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={iaConfig.exactContent} onChange={e => updateIA({ exactContent: e.target.checked })}
                        className="mt-0.5 shrink-0 w-[15px] h-[15px] accent-[#C13584] cursor-pointer" />
                      <span className="text-[12px] text-white leading-[1.45]">
                        <span className="font-bold">Manter conteúdo exato</span>
                        <span className="text-white/40"> — a IA distribui seu texto nos slides sem reescrever nada</span>
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white whitespace-nowrap">Idioma do carrossel:</span>
                      <select value={iaConfig.language} onChange={e => updateIA({ language: e.target.value })}
                        title="Idioma do carrossel"
                        className="flex-1 py-[7px] px-2.5 rounded-[9px] text-[12px] bg-white/[0.04] border border-white/[0.08] text-white cursor-pointer outline-none"
                      >
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Imagens de referência */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">
                      Imagens de referência <span className="font-normal text-white/30">(opcional)</span>
                    </label>
                    <p className="text-[11px] text-white/30 mb-2 leading-[1.5]">Anexe capturas de carrosséis — a IA analisa e cria conteúdo inspirado.</p>
                    {refImages.length < 5 && (
                      <div className="flex gap-2 mb-2.5">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const items = await navigator.clipboard.read();
                              for (const item of items) {
                                const imgType = item.types.find(t => t.startsWith('image/'));
                                if (imgType) {
                                  const blob = await item.getType(imgType);
                                  const r = new FileReader();
                                  r.onload = ev => setRefImages(p => p.length < 5 ? [...p, ev.target?.result as string] : p);
                                  r.readAsDataURL(blob);
                                  toast({ title: 'Imagem colada!' });
                                  return;
                                }
                              }
                              toast({ title: 'Nenhuma imagem na área de transferência', variant: 'destructive' });
                            } catch {
                              toast({ title: 'Cole com Ctrl+V', description: 'Use Ctrl+V para colar uma imagem copiada.' });
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white text-[12px] font-semibold cursor-pointer hover:bg-white/[0.06] transition-colors"
                        >
                          <Clipboard className="w-[13px] h-[13px]" /> Colar Imagem
                        </button>
                        <label className="flex-1 cursor-pointer">
                          <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                            Array.from(e.target.files ?? []).slice(0, 5 - refImages.length).forEach(f => {
                              const r = new FileReader(); r.onload = ev => setRefImages(p => p.length < 5 ? [...p, ev.target?.result as string] : p); r.readAsDataURL(f);
                            }); e.target.value = '';
                          }} />
                          <div className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-white text-[12px] font-semibold hover:bg-white/[0.06] transition-colors">
                            <Upload className="w-[13px] h-[13px]" /> Upload do Computador
                          </div>
                        </label>
                      </div>
                    )}
                    {refImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2.5 border border-white/[0.08] rounded-[10px] bg-white/[0.02]">
                        {refImages.map((src, i) => (
                          <div key={i} className="relative shrink-0">
                            <img src={src} alt="" className="w-[60px] h-[60px] object-cover rounded-lg block" />
                            <button type="button" onClick={() => setRefImages(p => p.filter((_, j) => j !== i))}
                              className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#e05c5c] border-none text-white text-[10px] cursor-pointer flex items-center justify-center p-0">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Número de slides */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">Número de slides</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} type="button" onClick={() => updateIA({ slideCount: n })}
                          className={`py-2.5 rounded-[10px] cursor-pointer text-[13px] font-bold transition-all border-[1.5px] ${
                            iaConfig.slideCount === n ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/[0.08] hover:border-white/20'
                          }`}
                        >{n}</button>
                      ))}
                    </div>
                  </div>

                  {/* Imagens no carrossel */}
                  <div className="mb-5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">Imagens no carrossel</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        ['none', 'Sem imagens', <span key="n" className="w-3.5 h-3.5 rounded-full border border-current opacity-60" />],
                        ['bg', 'Só imagem de fundo', <Image key="b" className="w-3.5 h-3.5" />],
                        ['grid', 'Só grade de imagens', <span key="g" className="w-3.5 h-3.5 grid grid-cols-2 gap-px opacity-60"><span className="bg-current rounded-sm" /><span className="bg-current rounded-sm" /><span className="bg-current rounded-sm" /><span className="bg-current rounded-sm" /></span>],
                        ['alternate', 'Intercalar ambas', <Sparkles key="a" className="w-3.5 h-3.5" />],
                      ] as [ImageMode, string, React.ReactNode][]).map(([mode, label, icon]) => (
                        <button key={mode} type="button" onClick={() => updateIA({ imageMode: mode })}
                          className={`flex items-center gap-2 py-2 px-3 rounded-[10px] text-left text-[12px] font-semibold cursor-pointer transition-all border-[1.5px] ${
                            iaConfig.imageMode === mode ? 'bg-white/[0.07] text-white border-white/30' : 'bg-transparent text-white/40 border-white/[0.08] hover:border-white/15'
                          }`}
                        >{icon} {label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <BackBtn onClick={() => setStep(2)} />
                    <PrimaryBtn onClick={() => setStep(4)} disabled={!iaConfig.topic.trim() && refImages.length === 0}>
                      Continuar <ArrowRight className="w-[14px] h-[14px]" />
                    </PrimaryBtn>
                  </div>
                </div>
              )}

              {/* ═══ STEP 4: Personalizar ═══ */}
              {step === 4 && (
                <div>
                  <StepDots total={4} current={3} />
                  <h2 className="text-[22px] font-[800] text-center tracking-[-0.03em] mt-0 mb-1.5">Personalizar</h2>
                  <p className="text-[13px] text-white/40 text-center mb-5">Identidade visual do seu carrossel</p>

                  {/* Usar template salvo */}
                  <div className="mb-5">
                    <button type="button" onClick={handleToggleTemplates}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] cursor-pointer text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="flex items-center gap-[7px] text-[13px] font-semibold text-white">
                        <Wand2 className="w-[13px] h-[13px] opacity-70" /> Usar template salvo
                      </span>
                      {loadingTemplates
                        ? <Loader2 className="w-[14px] h-[14px] text-white/30 animate-spin" />
                        : <ChevronDown className={`w-[14px] h-[14px] text-white/30 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                      }
                    </button>
                    {showTemplates && !loadingTemplates && (
                      <div className="mt-1.5 border border-white/[0.08] rounded-[10px] bg-white/[0.02] overflow-hidden">
                        {templates.length === 0 ? (
                          <div className="flex flex-col items-center py-6 text-white/30 text-[12px] gap-2">
                            <BookOpen className="w-5 h-5 opacity-40" />
                            <span>Nenhum template salvo ainda</span>
                          </div>
                        ) : (
                          templates.map(tmpl => (
                            <button key={tmpl.id} type="button" onClick={() => applyTemplate(tmpl)}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.05] last:border-b-0"
                            >
                              <span className="text-[13px] text-white font-medium">{tmpl.name}</span>
                              <span className="text-[11px] text-white/30">{tmpl.slides.length} slides</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* @ do Instagram */}
                  <div className="mb-5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">
                      @ do Instagram <span className="font-normal text-white/30">(opcional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] text-white/20 pointer-events-none select-none">@</span>
                      <input type="text"
                        value={iaConfig.instagramHandle.replace(/^@/, '')}
                        onChange={e => updateIA({ instagramHandle: e.target.value })}
                        placeholder="seuperfil"
                        className="w-full rounded-[10px] py-2.5 pl-[26px] pr-3 bg-white/[0.04] border border-white/[0.08] text-white text-[13px] outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-white/30">Aparece no canto superior esquerdo de cada slide.</p>
                  </div>

                  {/* Combinação de fontes */}
                  <div className="mb-5">
                    <button type="button" onClick={() => setShowFonts(p => !p)}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] cursor-pointer text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="text-[13px] font-semibold text-white">
                        Combinação de fontes <span className="text-[11px] font-normal text-white/30 ml-2">{selectedComboLabel}</span>
                      </span>
                      <ChevronDown className={`w-[14px] h-[14px] text-white/30 transition-transform ${showFonts ? 'rotate-180' : ''}`} />
                    </button>
                    {showFonts && (
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
                        {FONT_COMBOS.map(combo => {
                          const titleFont = PREMIUM_FONTS.find(f => f.id === combo.title);
                          const subFont   = PREMIUM_FONTS.find(f => f.id === combo.sub);
                          const selected  = iaConfig.fontCombo === combo.id;
                          return (
                            <button
                              key={combo.id}
                              type="button"
                              onClick={() => updateIA({ fontCombo: combo.id })}
                              className={`p-2.5 rounded-[10px] border-[1.5px] text-left transition-all ${
                                selected ? 'border-white/50 bg-white/[0.07]' : 'border-white/[0.07] hover:border-white/20'
                              }`}
                            >
                              <div className="text-[15px] font-bold leading-tight" style={{ fontFamily: titleFont?.family }}>
                                {combo.label}
                              </div>
                              <div className="text-[10px] text-white/40 mt-0.5" style={{ fontFamily: subFont?.family }}>
                                {combo.subLabel}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Identidade Visual */}
                  <div className="mb-6">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">
                      Identidade Visual <span className="font-normal text-white/30">(opcional)</span>
                    </label>
                    {/* Toggle Manual / Via Imagem */}
                    <div className="flex rounded-[10px] border border-white/[0.08] overflow-hidden mb-3.5">
                      {(['manual', 'image'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setBrandMode(m)}
                          className={`flex-1 py-2.5 px-1 text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none ${
                            brandMode === m ? 'bg-white/[0.07] text-white' : 'bg-transparent text-white/40'
                          }`}
                        >
                          {m === 'manual' ? <><PenLine className="w-3 h-3" /> Manual (Hex)</> : <><Image className="w-3 h-3" /> Via Imagem</>}
                        </button>
                      ))}
                    </div>

                    {brandMode === 'manual' && (
                      <div className="flex gap-2.5 items-stretch">
                        <div className="flex flex-col gap-[7px]">
                          {[
                            { label: 'Fundo', key: 'brandBg' as const },
                            { label: 'Título', key: 'brandTitle' as const },
                            { label: 'Subtítulo', key: 'brandSub' as const },
                          ].map(({ label, key }) => (
                            <div key={key} className="flex items-center gap-1.5">
                              <span className="text-[11px] text-white/40 w-[58px] shrink-0">{label}</span>
                              <input type="color" value={iaConfig[key] || '#1a1a1a'}
                                onChange={e => updateIA({ [key]: e.target.value })}
                                title={label}
                                aria-label={label}
                                className="w-[26px] h-[26px] rounded-[6px] border border-white/[0.08] p-0.5 cursor-pointer bg-transparent shrink-0" />
                              <input type="text" value={iaConfig[key]}
                                onChange={e => updateIA({ [key]: e.target.value })}
                                placeholder="#1A1A1A" maxLength={7}
                                className="w-[76px] py-1.5 px-[7px] rounded-[7px] text-[11px] font-mono border border-white/[0.08] bg-white/[0.04] text-white outline-none focus:border-white/20 transition-colors" />
                            </div>
                          ))}
                        </div>
                        {/* Preview */}
                        <div className="flex-1 flex items-stretch">
                          <div className="w-full rounded-[10px] border border-white/[0.08] flex flex-col justify-center gap-1.5 p-3"
                            style={{ background: iaConfig.brandBg && /^#[0-9a-f]{6}$/i.test(iaConfig.brandBg) ? iaConfig.brandBg : '#1a1a1a' }}
                          >
                            <div className="text-[13px] font-bold leading-[1.2]"
                              style={{ color: iaConfig.brandTitle && /^#[0-9a-f]{6}$/i.test(iaConfig.brandTitle) ? iaConfig.brandTitle : '#fff',
                                       fontFamily: PREMIUM_FONTS.find(f => f.id === (FONT_COMBOS.find(c => c.id === iaConfig.fontCombo)?.title))?.family }}
                            >Título</div>
                            <div className="text-[10px]"
                              style={{ color: iaConfig.brandSub && /^#[0-9a-f]{6}$/i.test(iaConfig.brandSub) ? iaConfig.brandSub : '#666',
                                       fontFamily: PREMIUM_FONTS.find(f => f.id === (FONT_COMBOS.find(c => c.id === iaConfig.fontCombo)?.sub))?.family }}
                            >Subtítulo</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {brandMode === 'image' && (
                      <div>
                        <input
                          ref={brandImageInputRef}
                          type="file"
                          accept="image/*"
                          title="Upload de imagem para extrair cores"
                          aria-label="Upload de imagem para extrair cores"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleBrandImageUpload(file);
                            e.target.value = '';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => brandImageInputRef.current?.click()}
                          disabled={extractingColors}
                          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/10 rounded-xl text-white/30 text-[12px] hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer gap-2"
                        >
                          {extractingColors ? (
                            <><Loader2 className="w-5 h-5 animate-spin opacity-50" /><span>Extraindo cores...</span></>
                          ) : (
                            <><Image className="w-5 h-5 opacity-40" /><span>Faça upload de logo ou banner</span><span className="text-[10px] opacity-60">As cores serão extraídas automaticamente</span></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex gap-2">
                    <BackBtn onClick={() => setStep(3)} />
                    <button type="button" onClick={handleGenerate} disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all ${
                        loading ? 'bg-white/30 text-black/50 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90 cursor-pointer'
                      }`}
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4" /> Gerar carrossel</>}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
