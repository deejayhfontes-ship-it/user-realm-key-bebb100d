import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, ChevronDown, ChevronRight, ImageIcon,
  Palette, AlignLeft, AlignCenter, AlignRight,
  Image, Wand2, User, Sun, Moon
} from 'lucide-react';
import { PREMIUM_FONTS, OVERLAY_OPTIONS } from '@/types/carrossel-constants';
import type { SlideConfig } from '@/types/carrossel-v2';
import { cn } from '@/lib/utils';

interface EditorSidebarV2Props {
  config: SlideConfig;
  onChange: (updates: Partial<SlideConfig>) => void;
  onRefineIA: (prompt: string) => void;
  onApplyToAll: () => void;
  onDownloadSlide: () => void;
  onDownloadAll: () => void;
  onGenerateCaption?: () => void;
  onGenerateImage?: () => void;
  slideIndex: number;
  postStyle: 'minimalista' | 'profile';
  onPostStyleChange: (style: 'minimalista' | 'profile') => void;
  isDark: boolean;
}

// ─── Seção expansível ─────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        className="w-full flex items-center justify-between py-3 px-5 text-left hover:bg-white/2 transition-colors"
        onClick={() => setOpen(o => !o)}
        title={open ? `Recolher ${title}` : `Expandir ${title}`}
      >
        <span className="flex items-center gap-2.5 text-xs text-white/70">
          {Icon && <Icon className="w-3.5 h-3.5 opacity-60" />}
          {title}
        </span>
        {open
          ? <ChevronDown className="w-3 h-3 text-white/30" />
          : <ChevronRight className="w-3 h-3 text-white/30" />
        }
      </button>
      {open && <div className="px-5 pb-4 space-y-4">{children}</div>}
    </div>
  );
};

// ─── Slider com label ─────────────────────────────────────────────
const LabeledSlider = ({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      <span className="text-[10px] text-white/30 font-mono">{value}</span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
  </div>
);

// ─── Color picker ─────────────────────────────────────────────────
const ColorPicker = ({ label, value, onPick }: { label: string; value: string; onPick: (v: string) => void }) => (
  <div className="space-y-1.5">
    <span className="text-[10px] uppercase tracking-wider text-white/30">{label}</span>
    <div className="flex gap-2 items-center">
      <button
        title={`Editar cor: ${label}`}
        className="w-7 h-7 rounded border border-white/10 shrink-0"
        style={{ backgroundColor: value }}
        onClick={() => {
          const inp = document.createElement('input');
          inp.type = 'color'; inp.value = value;
          inp.oninput = (e) => onPick((e.target as HTMLInputElement).value);
          inp.click();
        }}
      />
      <Input
        value={value}
        onChange={(e) => onPick(e.target.value)}
        className="font-mono text-[10px] h-7 border-white/5 bg-white/3"
        aria-label={label}
      />
    </div>
  </div>
);

export const EditorSidebarV2: React.FC<EditorSidebarV2Props> = ({
  config, onChange, onRefineIA, onApplyToAll, onDownloadSlide, onDownloadAll,
  onGenerateCaption, onGenerateImage,
  slideIndex, postStyle, onPostStyleChange, isDark
}) => {
  const [iaPrompt, setIaPrompt] = React.useState('');
  const [showIaRefine, setShowIaRefine] = React.useState(false);

  return (
    <aside className="w-[300px] border-r border-white/5 bg-[#0f0f0f] flex flex-col h-full overflow-hidden shrink-0">
      {/* ── PRESET STYLE ── */}
      <div className="px-3 pt-3 pb-0 space-y-2 shrink-0">
        {/* Minimalista / Profile */}
        <div className="flex rounded-lg overflow-hidden border border-white/8 bg-black/30">
          <button
            onClick={() => onPostStyleChange('minimalista')}
            className={cn(
              'flex-1 py-2 text-xs font-bold tracking-wide transition-all',
              postStyle === 'minimalista' ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'
            )}
          >
            MINIMALISTA
          </button>
          <button
            onClick={() => onPostStyleChange('profile')}
            className={cn(
              'flex-1 py-2 text-xs font-bold tracking-wide transition-all',
              postStyle === 'profile' ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'
            )}
          >
            PROFILE
          </button>
        </div>

        {/* Escuro / Claro */}
        <div className="flex rounded-lg overflow-hidden border border-white/8 bg-black/30">
          <button
            onClick={() => onChange({ slideDark: true })}
            className={cn(
              'flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              config.slideDark !== false ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            )}
          >
            <Moon className="w-3 h-3" /> Escuro
          </button>
          <button
            onClick={() => onChange({ slideDark: false })}
            className={cn(
              'flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
              config.slideDark === false ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            )}
          >
            <Sun className="w-3 h-3" /> Claro
          </button>
        </div>
      </div>

      {/* ── SEÇÃO GERAR COM IA ── */}
      <Section title="Gerar com IA" icon={Sparkles} defaultOpen={false}>
        <Input
          value={iaPrompt}
          onChange={(e) => setIaPrompt(e.target.value)}
          placeholder="Ex: deixe mais curto e agressivo"
          aria-label="Instrução para refinar com IA"
          className="h-8 text-xs bg-black/30 border-white/5"
        />
        <Button
          onClick={() => { onRefineIA(iaPrompt); setIaPrompt(''); }}
          size="sm" variant="outline"
          className="w-full h-8 text-xs gap-2 border-white/10"
          disabled={!iaPrompt}
        >
          <Wand2 className="w-3 h-3" /> Refinar Slide
        </Button>
      </Section>

      {/* ── SEÇÃO IDENTIDADE VISUAL ── */}
      <Section title="Identidade Visual" icon={User} defaultOpen={false}>
        {/* Badge de Perfil */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Badge de Perfil</span>
          <Switch
            checked={config.showProfileBadge ?? false}
            onCheckedChange={(c) => onChange({ showProfileBadge: c })}
          />
        </div>
        {config.showProfileBadge && (
          <div className="space-y-3 border-l border-white/5 pl-3">
            <div>
              <Label className="text-[10px] text-white/30">@handle</Label>
              <Input
                value={config.profileBadgeHandle ?? ''}
                onChange={(e) => onChange({ profileBadgeHandle: e.target.value })}
                placeholder="seu.perfil"
                aria-label="Handle do perfil"
                className="h-7 text-xs bg-black/30 border-white/5 mt-1"
              />
            </div>
            <div>
              <Label className="text-[10px] text-white/30">Foto (URL)</Label>
              <Input
                value={config.profileBadgePhotoUrl ?? ''}
                onChange={(e) => onChange({ profileBadgePhotoUrl: e.target.value })}
                placeholder="https://..."
                aria-label="URL da foto do perfil"
                className="h-7 text-xs bg-black/30 border-white/5 mt-1"
              />
            </div>
          </div>
        )}

        <div className="h-px bg-white/5" />

        {/* Logo */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Logo</span>
          <Switch
            checked={config.showLogoBadge ?? false}
            onCheckedChange={(c) => onChange({ showLogoBadge: c })}
          />
        </div>
        {config.showLogoBadge && (
          <div className="border-l border-white/5 pl-3">
            <Input
              value={config.logoBadgeUrl ?? ''}
              onChange={(e) => onChange({ logoBadgeUrl: e.target.value })}
              placeholder="https://... logo URL"
              aria-label="URL da logo"
              className="h-7 text-xs bg-black/30 border-white/5"
            />
          </div>
        )}
      </Section>

      {/* ── CONTEÚDO DO SLIDE ── */}
      <ScrollArea className="flex-1 min-h-0">
        <div>
          {/* Label de seção */}
          <div className="px-5 py-2.5 bg-white/2 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Conteúdo — Slide {slideIndex + 1}
            </span>
          </div>

          {/* ── Imagem de Fundo ── */}
          <Section title="Imagem de Fundo" icon={ImageIcon} defaultOpen={true}>
            {/* Área de drop */}
            <div
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 border border-dashed border-white/10 rounded-lg bg-white/2 cursor-pointer hover:border-white/20 transition-colors"
              onClick={() => {
                const inp = document.createElement('input');
                inp.type = 'file'; inp.accept = 'image/*';
                inp.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (r) => onChange({ imageUrl: r.target?.result as string });
                    reader.readAsDataURL(file);
                  }
                };
                inp.click();
              }}
            >
              <Image className="w-5 h-5 text-white/20" />
              <span className="text-[10px] text-white/30">Clique ou arraste</span>
            </div>

            {/* Colar URL */}
            <Input
              value={config.imageUrl ?? ''}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              placeholder="Cole a URL da imagem aqui"
              aria-label="URL da imagem de fundo"
              className="h-8 text-xs bg-black/30 border-white/5"
            />

            {/* Gerar com IA */}
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs gap-2 border-white/10"
              onClick={() => onGenerateImage?.()}
            >
              <Sparkles className="w-3 h-3" /> Gerar Imagem com IA
            </Button>

            {/* Controles de imagem (se houver URL) */}
            {config.imageUrl && (
              <div className="space-y-3 pt-1">
                <LabeledSlider label="Posição ←→" value={config.imagePositionX ?? 50} min={0} max={100} onChange={(v) => onChange({ imagePositionX: v })} />
                <LabeledSlider label="Posição ↑↓" value={config.imagePositionY ?? 50} min={0} max={100} onChange={(v) => onChange({ imagePositionY: v })} />
                <LabeledSlider label="Zoom %" value={config.imageZoom ?? 100} min={100} max={300} onChange={(v) => onChange({ imageZoom: v })} />
                <LabeledSlider label="Opacidade" value={config.imageOpacity ?? 100} min={0} max={100} onChange={(v) => onChange({ imageOpacity: v })} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Espelhar</span>
                  <Switch checked={config.imageFlipH ?? false} onCheckedChange={(c) => onChange({ imageFlipH: c })} />
                </div>
              </div>
            )}
          </Section>

          {/* ── Overlay ── */}
          <Section title="Overlay" icon={Palette} defaultOpen={false}>
            <div className="space-y-1">
              <Select value={config.overlayStyle} onValueChange={(v) => onChange({ overlayStyle: v as SlideConfig['overlayStyle'] })}>
                <SelectTrigger className="h-8 text-xs bg-black/30 border-white/5" aria-label="Estilo do overlay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-[220px]">
                  {OVERLAY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {config.overlayStyle !== 'none' && (
              <LabeledSlider label="Intensidade" value={config.overlayOpacity ?? 90} min={0} max={100} onChange={(v) => onChange({ overlayOpacity: v })} />
            )}
          </Section>

          {/* ── Texto ── */}
          <Section title="Texto" icon={AlignLeft} defaultOpen={true}>
            {/* Alinhamento */}
            <div className="flex gap-1.5">
              {(['left', 'center', 'right'] as const).map(a => {
                const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                return (
                  <Button key={a} variant={config.textAlign === a ? 'default' : 'outline'} size="sm"
                    className="flex-1 h-7 p-0" title={a} onClick={() => onChange({ textAlign: a })}>
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                );
              })}
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Título</span>
              <textarea
                value={config.title}
                onChange={(e) => onChange({ title: e.target.value })}
                aria-label="Título do slide"
                className="w-full min-h-[80px] bg-black/30 border border-white/5 rounded-lg p-2.5 text-xs text-white resize-none focus:ring-1 ring-white/20 outline-none"
              />
            </div>

            {/* Fonte do título */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Fonte</span>
              <Select value={config.titleFont ?? 'inter'} onValueChange={(v) => onChange({ titleFont: v })}>
                <SelectTrigger className="h-7 text-xs bg-black/30 border-white/5" aria-label="Fonte do título">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-[200px]">
                  {PREMIUM_FONTS.map(f => (
                    <SelectItem key={f.id} value={f.id} style={{ fontFamily: f.family }}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <LabeledSlider label="Tamanho" value={config.titleFontSize ?? 96} min={24} max={200} onChange={(v) => onChange({ titleFontSize: v })} />
            <ColorPicker label="Cor" value={config.titleColor || '#ffffff'} onPick={(v) => onChange({ titleColor: v })} />

            <div className="h-px bg-white/5" />

            {/* Subtítulo */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Subtítulo</span>
              <textarea
                value={config.subtitle}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                aria-label="Subtítulo do slide"
                className="w-full min-h-[60px] bg-black/30 border border-white/5 rounded-lg p-2.5 text-xs text-white resize-none focus:ring-1 ring-white/20 outline-none"
              />
            </div>
            <LabeledSlider label="Tamanho subtítulo" value={config.subtitleFontSize ?? 32} min={12} max={80} onChange={(v) => onChange({ subtitleFontSize: v })} />
            <ColorPicker label="Cor subtítulo" value={config.subtitleColor || 'rgba(255,255,255,0.7)'} onPick={(v) => onChange({ subtitleColor: v })} />

            <div className="h-px bg-white/5" />

            <LabeledSlider label="Posição vertical" value={config.titleBlockY ?? 50} min={0} max={100} onChange={(v) => onChange({ titleBlockY: v })} />
            <LabeledSlider label="Escala do texto" value={config.textScale ?? 100} min={40} max={200} onChange={(v) => onChange({ textScale: v })} />

            {/* Destaque */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Palavra em destaque</span>
              <Input
                value={config.highlightWord ?? ''}
                onChange={(e) => onChange({ highlightWord: e.target.value })}
                placeholder="Ex: viral, impacto"
                aria-label="Palavras em destaque"
                className="h-7 text-xs bg-black/30 border-white/5"
              />
              <ColorPicker label="Cor do destaque" value={config.highlightColor ?? '#ff4dca'} onPick={(v) => onChange({ highlightColor: v })} />
            </div>
          </Section>

          {/* ── Fundo ── */}
          <Section title="Fundo" icon={Palette} defaultOpen={false}>
            <ColorPicker label="Cor de fundo" value={config.bgColor || '#0a0a0a'} onPick={(v) => onChange({ bgColor: v })} />
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Padrão</span>
              <Select value={config.bgPattern} onValueChange={(v) => onChange({ bgPattern: v as SlideConfig['bgPattern'] })}>
                <SelectTrigger className="h-7 text-xs bg-black/30 border-white/5" aria-label="Padrão de fundo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {[{ v: 'none', l: 'Nenhum' }, { v: 'grid', l: 'Grade' }, { v: 'dots', l: 'Pontos' },
                    { v: 'lines', l: 'Linhas' }, { v: 'diagonal', l: 'Diagonal' }, { v: 'crosshatch', l: 'Xadrez' }]
                    .map(p => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {config.bgPattern !== 'none' && (
              <LabeledSlider label="Opacidade do padrão" value={config.bgPatternOpacity ?? 50} min={5} max={100} onChange={(v) => onChange({ bgPatternOpacity: v })} />
            )}
          </Section>

          {/* ── Botão CTA ── */}
          <Section title="Botão de Ação (CTA)" defaultOpen={false}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Exibir botão</span>
              <Switch checked={config.showButtons ?? false} onCheckedChange={(c) => onChange({ showButtons: c })} />
            </div>
            {config.showButtons && (
              <div className="space-y-3 border-l border-white/5 pl-3">
                <Input
                  value={config.button1?.label ?? ''}
                  onChange={(e) => onChange({ button1: { ...(config.button1 ?? { variant: 'primary', icon: '' }), label: e.target.value } })}
                  placeholder="Texto do botão"
                  aria-label="Texto do botão CTA"
                  className="h-7 text-xs bg-black/30 border-white/5"
                />
                <LabeledSlider label="Border radius" value={config.buttonBorderRadius ?? 100} min={0} max={100} onChange={(v) => onChange({ buttonBorderRadius: v })} />
                <LabeledSlider label="Tamanho da fonte" value={config.buttonFontSize ?? 15} min={10} max={30} onChange={(v) => onChange({ buttonFontSize: v })} />
              </div>
            )}
          </Section>

          {/* Espaçador final */}
          <div className="h-4" />
        </div>
      </ScrollArea>

      {/* ── FOOTER DE AÇÕES ── */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-white/5 space-y-2 bg-[#0a0a0a]">
        {/* Baixar Slide X */}
        <button
          onClick={onDownloadSlide}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar Slide {slideIndex + 1}
        </button>

        {/* Salvar + Baixar Todos */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/5 transition-all"
            onClick={onApplyToAll}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            Salvar
          </button>
          <button
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/5 transition-all"
            onClick={onDownloadAll}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Baixar Todos
          </button>
        </div>

        {/* Gerar Legenda */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/8 text-white/50 text-xs font-semibold hover:bg-white/5 transition-all"
          onClick={onGenerateCaption}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          Gerar Legenda
        </button>
      </div>
    </aside>
  );
};
