import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, BookOpen, User, Palette, Type, Sparkles } from 'lucide-react';
import { getTraining, saveTraining, type UserTraining } from '@/services/carrossel-service';
import { useToast } from '@/hooks/use-toast';
import { PREMIUM_FONTS } from '@/types/carrossel-constants';

interface TrainingPageProps {
  onBack: () => void;
}

const TONES = [
  { id: 'direto',       label: 'Direto e sem filtro',       desc: 'Frases curtas, peso emocional, primeira pessoa' },
  { id: 'educacional',  label: 'Educacional e com autoridade', desc: 'Dados, provas sociais, linguagem de especialista' },
  { id: 'comunitario',  label: 'Caloroso e comunitário',    desc: '"A gente", nostalgia, pertencimento, perguntas inclusivas' },
  { id: 'motivacional', label: 'Motivacional',              desc: 'Energia alta, chamadas para ação, inspiração' },
];

const FONT_COMBOS = [
  { id: 'space-inter',      title: 'space-grotesk', sub: 'inter',        label: 'Space',      subLabel: 'Inter' },
  { id: 'caveat-space',     title: 'caveat',        sub: 'space-grotesk',label: 'Caveat',     subLabel: 'Space' },
  { id: 'playfair-dm',      title: 'playfair',      sub: 'dm-sans',      label: 'Playfair',   subLabel: 'DM Sans' },
  { id: 'syne-dm',          title: 'syne',          sub: 'dm-sans',      label: 'Syne',       subLabel: 'DM Sans' },
  { id: 'bebas-raleway',    title: 'bebas-neue',    sub: 'raleway',      label: 'Bebas',      subLabel: 'Raleway' },
  { id: 'outfit-space',     title: 'outfit',        sub: 'space-grotesk',label: 'Outfit',     subLabel: 'Space' },
  { id: 'montserrat-inter', title: 'montserrat',    sub: 'inter',        label: 'Montserrat', subLabel: 'Inter' },
  { id: 'jakarta-inter',    title: 'plus-jakarta',  sub: 'inter',        label: 'Jakarta',    subLabel: 'Inter' },
  { id: 'manrope-space',    title: 'manrope',       sub: 'space-grotesk',label: 'Manrope',    subLabel: 'Space' },
  { id: 'urbanist-inter',   title: 'urbanist',      sub: 'inter',        label: 'Urbanist',   subLabel: 'Inter' },
  { id: 'jakarta-manrope',  title: 'plus-jakarta',  sub: 'manrope',      label: 'Jakarta',    subLabel: 'Manrope' },
  { id: 'manrope-inter',    title: 'manrope',       sub: 'inter',        label: 'Manrope',    subLabel: 'Inter' },
];

const DEFAULTS: UserTraining = {
  instagram_handle: '',
  niche: '',
  tone: 'direto',
  font_title: 'space-grotesk',
  font_subtitle: 'inter',
  brand_bg: '#0a0a0a',
  brand_title_color: '',
  brand_sub_color: '',
  accent_color: '',
  slide_count: 5,
};

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-white/40" />
        <h3 className="text-[12px] font-bold tracking-[0.08em] uppercase text-white/40">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function TrainingPage({ onBack }: TrainingPageProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState<UserTraining>(DEFAULTS);

  useEffect(() => {
    getTraining()
      .then(setTraining)
      .catch(() => setTraining(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<UserTraining>) =>
    setTraining(t => ({ ...t, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTraining(training);
      toast({ title: '✅ Perfil salvo!', description: 'A IA vai usar suas configurações em todos os carrosséis.' });
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Faça login para salvar seu perfil.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const selectedCombo = FONT_COMBOS.find(c => c.title === training.font_title) ?? FONT_COMBOS[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-5 bg-[#0a0a0a]/97 border-b border-white/7 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[13px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
            <span className="text-[9px] font-black text-white">M</span>
          </div>
          <span className="text-[13px] font-bold">MyPostFlow</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-black text-[13px] font-bold hover:bg-white/90 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Salvando…' : 'Salvar perfil'}
        </button>
      </header>

      {/* Body */}
      <main className="max-w-[640px] mx-auto w-full px-6 py-10 flex-1">
        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center">
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.03em]">Treinar Carrossel</h1>
            <p className="text-[13px] text-white/40 mt-0.5">Configure uma vez, a IA usa em todos os carrosséis.</p>
          </div>
        </div>

        {/* ── 1. Perfil ── */}
        <Section icon={User} title="Perfil">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">
                @ do Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-white/20 select-none">@</span>
                <input
                  type="text"
                  value={training.instagram_handle.replace(/^@/, '')}
                  onChange={e => update({ instagram_handle: e.target.value })}
                  placeholder="seuperfil"
                  className="w-full rounded-[10px] py-2.5 pl-7 pr-3 bg-white/[0.04] border border-white/[0.08] text-white text-[13px] outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/25">Aparece no badge de perfil de cada slide.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">
                Nicho / Mercado
              </label>
              <input
                type="text"
                value={training.niche}
                onChange={e => update({ niche: e.target.value })}
                placeholder="Ex: Marketing digital, Design, Fitness, Gastronomia…"
                className="w-full rounded-[10px] py-2.5 px-3 bg-white/[0.04] border border-white/[0.08] text-white text-[13px] outline-none focus:border-white/20 transition-colors"
              />
              <p className="mt-1.5 text-[11px] text-white/25">A IA vai criar conteúdo específico para o seu nicho.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-white/40 mb-1.5">
                Número padrão de slides
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update({ slide_count: n })}
                    className={`py-2.5 rounded-[10px] text-[13px] font-bold transition-all border-[1.5px] ${
                      training.slide_count === n
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-white/40 border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. Tom de Voz ── */}
        <Section icon={Sparkles} title="Tom de voz">
          <div className="space-y-2">
            {TONES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ tone: t.id })}
                className={`w-full text-left p-4 rounded-[12px] border-[1.5px] transition-all ${
                  training.tone === t.id
                    ? 'border-white/50 bg-white/[0.07]'
                    : 'border-white/[0.07] hover:border-white/20'
                }`}
              >
                <div className="text-[14px] font-bold text-white mb-0.5">{t.label}</div>
                <div className="text-[12px] text-white/40">{t.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 3. Fontes ── */}
        <Section icon={Type} title="Combinação de fontes">
          <div className="grid grid-cols-4 gap-2">
            {FONT_COMBOS.map(combo => {
              const titleFont = PREMIUM_FONTS.find(f => f.id === combo.title);
              const subFont   = PREMIUM_FONTS.find(f => f.id === combo.sub);
              const selected  = training.font_title === combo.title;
              return (
                <button
                  key={combo.id}
                  type="button"
                  onClick={() => update({ font_title: combo.title, font_subtitle: combo.sub })}
                  className={`p-4 rounded-[12px] border-[1.5px] text-left transition-all ${
                    selected
                      ? 'border-white/50 bg-white/[0.07]'
                      : 'border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div
                    className="text-[18px] font-bold leading-tight mb-0.5"
                    style={{ fontFamily: titleFont?.family }}
                  >
                    {combo.label}
                  </div>
                  <div
                    className="text-[11px] text-white/40"
                    style={{ fontFamily: subFont?.family }}
                  >
                    {combo.subLabel}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-white/25">
            Combo atual: <span className="text-white/50">{selectedCombo.label} + {selectedCombo.subLabel}</span>
          </p>
        </Section>

        {/* ── 4. Identidade Visual ── */}
        <Section icon={Palette} title="Identidade visual">
          <div className="space-y-3">
            {([
              { key: 'brand_bg'          as const, label: 'Fundo padrão',    placeholder: '#0a0a0a' },
              { key: 'brand_title_color' as const, label: 'Cor do título',   placeholder: '#ffffff' },
              { key: 'brand_sub_color'   as const, label: 'Cor do subtítulo',placeholder: '#aaaaaa' },
              { key: 'accent_color'      as const, label: 'Cor de destaque', placeholder: '#C9FF4D' },
            ]).map(({ key, label, placeholder }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="text-[12px] text-white/50 w-32 shrink-0">{label}</label>
                <input
                  type="color"
                  value={training[key] || placeholder}
                  onChange={e => update({ [key]: e.target.value })}
                  title={label}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] p-0.5 cursor-pointer bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={training[key]}
                  onChange={e => update({ [key]: e.target.value })}
                  placeholder={placeholder}
                  maxLength={7}
                  className="flex-1 py-2 px-3 rounded-[8px] text-[12px] font-mono border border-white/[0.08] bg-white/[0.04] text-white outline-none focus:border-white/20 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Preview */}
          <div
            className="mt-4 rounded-[12px] p-5 border border-white/[0.08] flex flex-col gap-1.5"
            style={{ background: training.brand_bg && /^#[0-9a-f]{6}$/i.test(training.brand_bg) ? training.brand_bg : '#0a0a0a' }}
          >
            <div
              className="text-[20px] font-bold"
              style={{ color: training.brand_title_color && /^#[0-9a-f]{6}$/i.test(training.brand_title_color) ? training.brand_title_color : '#ffffff',
                       fontFamily: PREMIUM_FONTS.find(f => f.id === training.font_title)?.family }}
            >
              Seu título aqui
            </div>
            <div
              className="text-[13px]"
              style={{ color: training.brand_sub_color && /^#[0-9a-f]{6}$/i.test(training.brand_sub_color) ? training.brand_sub_color : '#888888',
                       fontFamily: PREMIUM_FONTS.find(f => f.id === training.font_subtitle)?.family }}
            >
              Subtítulo e conteúdo do slide
            </div>
            {training.accent_color && /^#[0-9a-f]{6}$/i.test(training.accent_color) && (
              <span
                className="inline-block mt-1 text-[12px] font-bold px-2 py-0.5 rounded"
                style={{ background: training.accent_color, color: '#000' }}
              >
                Destaque
              </span>
            )}
          </div>
        </Section>

        {/* Salvar bottom */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-bold text-[14px] hover:bg-white/90 disabled:opacity-50 transition-all mt-2 mb-10"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando…' : 'Salvar perfil de treinamento'}
        </button>
      </main>
    </div>
  );
}
