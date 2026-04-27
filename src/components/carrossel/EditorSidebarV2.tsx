import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles, ChevronDown, ChevronRight, ImageIcon,
  Sun, Moon, User, Layers, Type, Grid2X2, BookOpen,
  Bookmark, Heart, Share2, MessageCircle, Minus, Save,
  Square, Eye
} from 'lucide-react';
import { PREMIUM_FONTS, OVERLAY_OPTIONS } from '@/types/carrossel-constants';
import type { SlideConfig } from '@/types/carrossel-v2';
import { cn } from '@/lib/utils';

/* ─── CONSTANTS ──────────────────────────────────────────────────────── */

const OVERLAY_LABELS: Record<string, string> = {
  none: 'Nenhum', gradient: 'Gradiente', 'gradient-strong': 'Gradiente forte',
  vignette: 'Vinheta', 'vignette-strong': 'Vinheta forte',
  dark: 'Base escura', 'dark-strong': 'Base forte',
  bottom: 'Baixo', 'bottom-strong': 'Baixo forte', 'bottom-intense': 'Baixo intenso',
  top: 'Topo', 'top-strong': 'Topo forte', 'top-intense': 'Topo intenso',
  frame: 'Frame', 'frame-strong': 'Frame forte',
  left: 'Esquerda', right: 'Direita',
  'diag-bl': 'Diagonal ↗', 'diag-br': 'Diagonal ↖',
  'diag-tl': 'Diagonal ↘', 'diag-tr': 'Diagonal ↙',
};

const LAYOUT_POSITIONS = [
  { y: 15, align: 'left'   as const, label: 'Sup. esq.'   },
  { y: 15, align: 'center' as const, label: 'Sup. centro' },
  { y: 15, align: 'right'  as const, label: 'Sup. dir.'   },
  { y: 50, align: 'left'   as const, label: 'Meio esq.'   },
  { y: 50, align: 'center' as const, label: 'Meio'         },
  { y: 50, align: 'right'  as const, label: 'Meio dir.'   },
  { y: 85, align: 'left'   as const, label: 'Inf. esq.'   },
  { y: 85, align: 'center' as const, label: 'Inf. centro' },
  { y: 85, align: 'right'  as const, label: 'Inf. dir.'   },
];

const LAYOUT_SHORT = [
  'SUP.ESQ.','SUP. CENTRO','SUP.DIR.',
  'MEIO ESQ.','MEIO','MEIO DIR.',
  'INF.ESQ.','INF. CENTRO','INF.DIR.',
];

const TITLE_COLOR_SWATCHES = [
  { label: 'Auto', value: '', special: true },
  { label: 'Branco',  value: '#ffffff' },
  { label: 'Preto',   value: '#000000' },
  { label: 'Amarelo', value: '#FFD700' },
  { label: 'Vermelho',value: '#FF4444' },
  { label: 'Azul',    value: '#4488FF' },
  { label: 'Verde',   value: '#22CC66' },
  { label: 'Laranja', value: '#FF8800' },
  { label: 'Roxo',    value: '#AA44FF' },
  { label: 'Transp.', value: 'transparent', transparent: true },
];

const HIGHLIGHT_COLORS = [
  '#FFD700','#FF4444','#4488FF','#22CC66',
  '#FF8800','#AA44FF','#FF44BB','#44DDFF',
];

const FONT_WEIGHTS = [100,200,300,400,500,600,700,800,900];

const CORNER_ICONS = [
  { id: 'none',      el: <Minus size={14}/> },
  { id: 'bookmark',  el: <Bookmark size={14}/> },
  { id: 'swipe',     el: <span style={{fontSize:14,fontWeight:700}}>&gt;</span> },
  { id: 'heart',     el: <Heart size={14}/> },
  { id: 'share',     el: <Share2 size={14}/> },
  { id: 'comment',   el: <MessageCircle size={14}/> },
  { id: 'click',     el: <Sparkles size={14}/> },
];

/* ─── PROPS ──────────────────────────────────────────────────────────── */

interface EditorSidebarV2Props {
  config: SlideConfig;
  onChange: (updates: Partial<SlideConfig>) => void;
  onRefineIA: (prompt: string) => void;
  onGenerateCarousel?: (topic: string, slideCount: number, refImages: string[]) => void;
  onApplyToAll: () => void;
  onApplyToAllSlides?: (updates: Partial<SlideConfig>) => void;
  onDownloadSlide: () => void;
  onDownloadAll: () => void;
  onGenerateCaption?: () => void;
  onGenerateImage?: () => void;
  onSaveTemplate?: (name: string) => void;
  onApplyTemplate?: (id: string) => void;
  savedTemplates?: { id: string; name: string; post_style: string }[];
  slideIndex: number;
  postStyle: 'minimalista' | 'profile';
  onPostStyleChange: (style: 'minimalista' | 'profile') => void;
  isDark: boolean;
}

/* ─── PANEL SECTION (collapsible) ───────────────────────────────────── */

const PanelSection = ({
  title, icon: Icon, open, onToggle, isDark, children
}: {
  title: string;
  icon?: React.ElementType;
  open: boolean;
  onToggle: () => void;
  isDark: boolean;
  children: React.ReactNode;
}) => {
  const border = isDark ? 'rgba(255,255,255,0.07)' : '#e8e8e8';
  const bg     = isDark ? '#111' : '#fff';
  const color  = isDark ? '#e0e0e0' : '#1a1a1a';
  const bgOpen = isDark ? '#1a1a1a' : '#ebebeb';
  const bgClosed = isDark ? '#111' : '#f4f4f4';

  return (
    <div style={{ borderBottom: `1px solid ${border}` }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '12px 14px',
          border: 'none', background: open ? bgOpen : bgClosed,
          color, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.01em',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={14} style={{ opacity: 0.8 }} />}
          {title}
        </span>
        {open
          ? <ChevronDown size={14} style={{ opacity: 0.5 }} />
          : <ChevronRight size={14} style={{ opacity: 0.5 }} />
        }
      </button>
      {open && (
        <div style={{
          padding: '14px', borderTop: `1px solid ${border}`,
          background: isDark ? '#141414' : '#fafafa',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── SMALL HELPERS ─────────────────────────────────────────────────── */

const SectionLabel = ({ isDark, children }: { isDark: boolean; children: React.ReactNode }) => (
  <div style={{
    fontSize: 10, color: isDark ? '#666' : '#aaa',
    fontWeight: 600, letterSpacing: '0.05em', marginBottom: 2,
  }}>
    {children}
  </div>
);

const SliderRow = ({
  label, value, min, max, step = 1, onChange, isDark, hint
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; isDark: boolean; hint?: string;
}) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 10, color: isDark ? '#666' : '#aaa', fontWeight: 600, letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: isDark ? '#888' : '#777', fontWeight: 600 }}>{value}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: isDark ? '#fff' : '#000', display: 'block' }}
    />
    {hint && (
      <div style={{ fontSize: 10, color: isDark ? '#444' : '#bbb', marginTop: 3 }}>{hint}</div>
    )}
  </div>
);

const ToggleRow = ({
  label, checked, onChange, isDark
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void; isDark: boolean;
}) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
    <span style={{ fontSize: 11, color: isDark ? '#ccc' : '#333' }}>{label}</span>
    <input
      type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ width: 14, height: 14, accentColor: isDark ? '#fff' : '#000', cursor: 'pointer' }}
    />
  </label>
);

function FontGrid({ value, onChange, isDark }: {
  value: string; onChange: (v: string) => void; isDark: boolean;
}) {
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
      {PREMIUM_FONTS.map(f => {
        const sel = value === f.id;
        return (
          <button
            key={f.id} type="button" onClick={() => onChange(f.id)}
            style={{
              padding: '8px 6px', borderRadius: 8, fontSize: 13, textAlign: 'left',
              border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' : border}`,
              background: sel ? isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)' : isDark ? '#1a1a1a' : '#f4f4f4',
              color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#888' : '#555',
              cursor: 'pointer', fontFamily: f.family, fontWeight: f.weight,
            }}
          >
            {f.name}
          </button>
        );
      })}
    </div>
  );
}

function WeightGrid({ value, onChange, isDark }: {
  value: number; onChange: (v: number) => void; isDark: boolean;
}) {
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5';
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {FONT_WEIGHTS.map(w => {
        const sel = value === w;
        return (
          <button
            key={w} type="button" onClick={() => onChange(w)}
            style={{
              minWidth: 36, padding: '5px 4px', borderRadius: 7, fontSize: 11,
              border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' : border}`,
              background: sel ? isDark ? 'rgba(255,255,255,0.14)' : '#0a0a0a' : 'transparent',
              color: sel ? isDark ? '#e8e8e8' : '#fff' : isDark ? '#888' : '#666',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: w,
            }}
          >
            {w}
          </button>
        );
      })}
    </div>
  );
}

function ColorSwatches({ value, onChange, isDark, swatches = TITLE_COLOR_SWATCHES }: {
  value: string; onChange: (v: string) => void; isDark: boolean;
  swatches?: typeof TITLE_COLOR_SWATCHES;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {swatches.map(s => {
        const sel = value === s.value;
        return (
          <button
            key={s.label} type="button" title={s.label} onClick={() => onChange(s.value)}
            style={{
              width: 28, height: 28, borderRadius: 7, border: `2px solid ${sel ? isDark ? '#fff' : '#000' : 'transparent'}`,
              background: s.transparent ? 'repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 0/10px 10px'
                : s.special ? 'linear-gradient(135deg,#ff0,#f0f,#0ff)' : s.value,
              cursor: 'pointer', outline: 'none', position: 'relative',
              boxShadow: sel ? `0 0 0 1px ${isDark ? '#fff' : '#000'}` : `0 0 0 1px ${isDark ? 'rgba(255,255,255,0.12)' : '#ddd'}`,
            }}
          >
            {s.special && (
              <span style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, fontWeight: 900,
                color: '#000', fontFamily: 'serif',
              }}>A</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function HighlightSwatches({ value, onChange, isDark }: {
  value: string; onChange: (v: string) => void; isDark: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
      {HIGHLIGHT_COLORS.map(c => {
        const sel = value?.toLowerCase() === c.toLowerCase();
        return (
          <button
            key={c} type="button" onClick={() => onChange(c)}
            style={{
              width: 32, height: 32, borderRadius: 8, background: c,
              border: `2px solid ${sel ? isDark ? '#fff' : '#000' : 'transparent'}`,
              cursor: 'pointer', outline: 'none',
              boxShadow: sel ? `0 0 0 1px ${isDark ? '#fff' : '#000'}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

function ImageDropZone({ url, label, isDark, onFile, onClear, onPaste, onGenerate }: {
  url?: string; label?: string; isDark: boolean;
  onFile: (base64: string) => void;
  onClear?: () => void;
  onPaste?: (base64: string) => void;
  onGenerate?: () => void;
}) {
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5';
  const bg = isDark ? '#161616' : '#fff';
  const color = isDark ? '#f0f0f0' : '#0a0a0a';
  const btnBg = isDark ? '#1a1a1a' : '#f4f4f4';
  const btnColor = isDark ? '#aaa' : '#555';

  const handleFile = (file: File) => {
    const r = new FileReader();
    r.onload = e => onFile(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find(t => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          const r = new FileReader();
          r.onload = e => onPaste?.(e.target?.result as string);
          r.readAsDataURL(blob);
          return;
        }
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      {label && <SectionLabel isDark={isDark}>{label}</SectionLabel>}
      {url ? (
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <img src={url} alt="" style={{ width: '100%', borderRadius: 8, maxHeight: 80, objectFit: 'cover', display: 'block' }} />
          {onClear && (
            <button type="button" onClick={onClear}
              style={{
                position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          )}
        </div>
      ) : (
        <label style={{ display: 'block', cursor: 'pointer', marginBottom: 6 }}>
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '14px', borderRadius: 9, border: `1.5px dashed ${border}`,
            background: isDark ? '#1a1a1a' : '#f9f9f9', color: isDark ? '#555' : '#aaa',
            fontSize: 11, cursor: 'pointer',
          }}>
            <ImageIcon size={14} /> Clique ou arraste
          </div>
        </label>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" onClick={handlePaste}
          style={{
            flex: 1, padding: '8px 6px', borderRadius: 8, border: `1px solid ${border}`,
            background: btnBg, color: btnColor, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
        >
          <Square size={11} /> Colar Imagem
        </button>
        {onGenerate && (
          <button type="button" onClick={onGenerate}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: 8, border: `1px solid ${border}`,
              background: btnBg, color: btnColor, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
          >
            <Sparkles size={11} /> Gerar Imagem com IA
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── WORD CHIPS (Destaque / Formatação) ────────────────────────────── */

function WordChips({ text, selectedWord, onSelect, isDark }: {
  text: string; selectedWord: string; onSelect: (w: string) => void; isDark: boolean;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5';
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {words.map((w, i) => {
        const clean = w.replace(/[*_~]/g, '');
        const sel = selectedWord === clean;
        return (
          <button
            key={i} type="button" onClick={() => onSelect(sel ? '' : clean)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 12,
              border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : border}`,
              background: sel ? isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)' : 'transparent',
              color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#888' : '#666',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {clean}
          </button>
        );
      })}
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────── */

type PanelKey =
  | 'aiPanel' | 'brandPanel' | 'bgImage' | 'overlay' | 'bgPattern'
  | 'imageGrid' | 'content' | 'profileBadge' | 'globalCorners'
  | 'globalButtons' | 'templates';

export const EditorSidebarV2: React.FC<EditorSidebarV2Props> = ({
  config, onChange, onRefineIA, onGenerateCarousel,
  onApplyToAll, onApplyToAllSlides,
  onDownloadSlide, onDownloadAll, onGenerateCaption, onGenerateImage,
  onSaveTemplate, onApplyTemplate, savedTemplates = [],
  slideIndex, postStyle, onPostStyleChange, isDark,
}) => {
  /* panel open state */
  const [panels, setPanels] = React.useState<Record<PanelKey, boolean>>({
    aiPanel: false, brandPanel: false, bgImage: true, overlay: false,
    bgPattern: false, imageGrid: false, content: true, profileBadge: false,
    globalCorners: false, globalButtons: false, templates: false,
  });
  const togglePanel = (k: PanelKey) => setPanels(p => ({ ...p, [k]: !p[k] }));

  /* gerar com ia state */
  const [genTopic, setGenTopic]     = React.useState('');
  const [genSlides, setGenSlides]   = React.useState(5);
  const [genImages, setGenImages]   = React.useState<string[]>([]);
  const [generating, setGenerating] = React.useState(false);

  /* refine ia */
  const [iaPrompt, setIaPrompt]   = React.useState('');
  const [refining, setRefining]   = React.useState(false);

  /* highlight word selection */
  const [selectedWord, setSelectedWord] = React.useState('');
  const [formatTarget, setFormatTarget] = React.useState<'title' | 'subtitle' | null>(null);

  /* template */
  const [tplName, setTplName]     = React.useState('');
  const [savingTpl, setSavingTpl] = React.useState(false);
  const [applyingTpl, setApplyingTpl] = React.useState<string | null>(null);

  const border = isDark ? 'rgba(255,255,255,0.07)' : '#e8e8e8';
  const bg     = isDark ? '#111' : '#fff';
  const color  = isDark ? '#e0e0e0' : '#1a1a1a';
  const inputBg = isDark ? '#161616' : '#fff';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e5e5e5';
  const btnBg  = isDark ? '#1a1a1a' : '#f4f4f4';
  const btnColor = isDark ? '#aaa' : '#555';
  const mutedColor = isDark ? '#666' : '#aaa';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8, boxSizing: 'border-box',
    border: `1px solid ${inputBorder}`, background: inputBg, color,
    fontSize: 12, fontFamily: 'inherit',
  };

  /* paste image helper */
  const pasteImage = async (cb: (b64: string) => void) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const t = item.types.find(t => t.startsWith('image/'));
        if (t) {
          const blob = await item.getType(t);
          const r = new FileReader();
          r.onload = e => cb(e.target?.result as string);
          r.readAsDataURL(blob);
          return;
        }
      }
    } catch { /* ignore */ }
  };

  /* format button row (N/I/U/S) */
  const FormatButtons = ({ target }: { target: 'title' | 'subtitle' }) => {
    const isBold      = target === 'title' ? config.titleBold      : config.subtitleBold;
    const isItalic    = target === 'title' ? config.titleItalic    : config.subtitleItalic;
    const isUnderline = target === 'title' ? config.titleUnderline : config.subtitleUnderline;
    const isStrike    = target === 'title' ? config.titleStrikethrough : config.subtitleStrikethrough;
    const prefix = target === 'title' ? 'title' : 'subtitle';

    const btn = (label: string, active: boolean, key: string) => (
      <button key={label} type="button" onClick={() => onChange({ [key]: !active })}
        style={{
          flex: 1, height: 32, borderRadius: 7, fontSize: 12, fontWeight: 700,
          border: `1px solid ${active ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : inputBorder}`,
          background: active ? isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)' : 'transparent',
          color: active ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#888' : '#999',
          cursor: 'pointer', fontFamily: 'inherit',
          fontStyle: label === 'I' ? 'italic' : undefined,
          textDecoration: label === 'U' ? 'underline' : label === 'S' ? 'line-through' : undefined,
        }}
      >{label}</button>
    );

    return (
      <div style={{ display: 'flex', gap: 5 }}>
        {btn('N', !!isBold,      `${prefix}Bold`)}
        {btn('I', !!isItalic,    `${prefix}Italic`)}
        {btn('U', !!isUnderline, `${prefix}Underline`)}
        {btn('S', !!isStrike,    `${prefix}Strikethrough`)}
      </div>
    );
  };

  return (
    <aside style={{
      width: 300, borderRight: `1px solid ${border}`,
      background: bg, display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* ── TOP: MINIMALISTA / PROFILE + ESCURO / CLARO ── */}
      <div style={{ padding: '10px 10px 0', flexShrink: 0 }}>
        {/* Minimalista / Profile */}
        <div style={{
          display: 'flex', borderRadius: 9, overflow: 'hidden',
          border: `1px solid ${inputBorder}`, marginBottom: 8,
        }}>
          {(['minimalista', 'profile'] as const).map(s => (
            <button key={s} type="button" onClick={() => onPostStyleChange(s)}
              style={{
                flex: 1, padding: '9px 4px', border: 'none', cursor: 'pointer',
                background: postStyle === s ? isDark ? '#fff' : '#0a0a0a' : 'transparent',
                color: postStyle === s ? isDark ? '#000' : '#fff' : isDark ? '#666' : '#999',
                fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
                fontFamily: 'inherit', textTransform: 'uppercase',
              }}
            >
              {s === 'minimalista' ? 'MINIMALISTA' : 'PROFILE'}
            </button>
          ))}
        </div>

        {/* Escuro / Claro */}
        <div style={{
          display: 'flex', borderRadius: 9, overflow: 'hidden',
          border: `1px solid ${inputBorder}`, marginBottom: 6,
        }}>
          {[
            { v: true,  label: 'Escuro', icon: <Moon size={12}/> },
            { v: false, label: 'Claro',  icon: <Sun size={12}/>  },
          ].map(({ v, label, icon }) => {
            const active = config.slideDark !== false ? v === true : v === false;
            return (
              <button key={label} type="button" onClick={() => onChange({ slideDark: v })}
                style={{
                  flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
                  background: active ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' : 'transparent',
                  color: active ? isDark ? '#fff' : '#000' : isDark ? '#555' : '#aaa',
                  fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                {icon}{label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SCROLLABLE AREA ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* ══ GERAR COM IA ══ */}
        <PanelSection title="Gerar com IA" icon={Sparkles}
          open={panels.aiPanel} onToggle={() => togglePanel('aiPanel')} isDark={isDark}>
          <textarea
            value={genTopic} rows={3}
            onChange={e => setGenTopic(e.target.value)}
            placeholder="Descreva o tema... Ex: Como vender mais no Instagram sem aparecer"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <div>
            <SectionLabel isDark={isDark}>
              IMAGENS DE REFERÊNCIA <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional, máx 5)</span>
            </SectionLabel>
            {genImages.length < 5 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <button type="button"
                  onClick={() => pasteImage(b64 => setGenImages(p => p.length < 5 ? [...p, b64] : p))}
                  style={{ flex: 1, padding: '7px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: btnBg, color: btnColor, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  <Square size={11} /> Colar Imagem
                </button>
                <label style={{ flex: 1 }}>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={e => {
                      Array.from(e.target.files ?? []).slice(0, 5 - genImages.length).forEach(f => {
                        const r = new FileReader();
                        r.onload = ev => setGenImages(p => p.length < 5 ? [...p, ev.target?.result as string] : p);
                        r.readAsDataURL(f);
                      });
                      e.target.value = '';
                    }}
                  />
                  <div style={{ padding: '7px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: btnBg, color: btnColor, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <ImageIcon size={11} /> Upload
                  </div>
                </label>
              </div>
            )}
            {genImages.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {genImages.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    <button type="button" onClick={() => setGenImages(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ff4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: mutedColor, fontWeight: 600, letterSpacing: '0.05em' }}>SLIDES</span>
              <span style={{ fontSize: 10, color: mutedColor, fontWeight: 600 }}>{genSlides}</span>
            </div>
            <input type="range" min={1} max={20} value={genSlides}
              onChange={e => setGenSlides(Number(e.target.value))}
              style={{ width: '100%', accentColor: isDark ? '#fff' : '#000' }}
            />
          </div>
          <button type="button"
            disabled={!genTopic.trim() || generating || !onGenerateCarousel}
            onClick={async () => {
              if (!genTopic.trim() || !onGenerateCarousel) return;
              setGenerating(true);
              try { await onGenerateCarousel(genTopic, genSlides, genImages); }
              finally { setGenerating(false); }
            }}
            style={{
              padding: '9px', borderRadius: 8, border: 'none',
              background: genTopic.trim() ? isDark ? '#fff' : '#0a0a0a' : isDark ? '#2a2a2a' : '#ddd',
              color: genTopic.trim() ? isDark ? '#000' : '#fff' : isDark ? '#555' : '#aaa',
              fontSize: 12, fontWeight: 700, cursor: genTopic.trim() ? 'pointer' : 'default',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {generating
              ? <><Sparkles size={13} style={{ animation: 'spin 1s linear infinite' }} /> Gerando...</>
              : <><Sparkles size={13} /> ✨ Gerar {genSlides} slides</>
            }
          </button>
        </PanelSection>

        {/* ══ IDENTIDADE VISUAL ══ */}
        <PanelSection title="Identidade Visual" icon={User}
          open={panels.brandPanel} onToggle={() => togglePanel('brandPanel')} isDark={isDark}>
          <p style={{ fontSize: 10, color: mutedColor, margin: 0, lineHeight: 1.5 }}>
            Configure cores e fontes padrão para todos os slides.
          </p>
        </PanelSection>

        {/* ── CONTEÚDO — SLIDE N label ── */}
        <div style={{
          padding: '10px 14px 8px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f0f0f0',
          borderBottom: `1px solid ${border}`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: mutedColor, textTransform: 'uppercase' }}>
            Conteúdo — Slide {slideIndex + 1}
          </span>
        </div>

        {/* ══ IMAGEM DE FUNDO ══ */}
        <PanelSection title="Imagem de Fundo" icon={ImageIcon}
          open={panels.bgImage} onToggle={() => togglePanel('bgImage')} isDark={isDark}>
          <SectionLabel isDark={isDark}>FOTO</SectionLabel>
          <ImageDropZone
            url={config.imageUrl}
            isDark={isDark}
            onFile={b64 => onChange({ imageUrl: b64 })}
            onClear={() => onChange({ imageUrl: undefined })}
            onPaste={b64 => onChange({ imageUrl: b64 })}
            onGenerate={onGenerateImage}
          />
          {config.imageUrl && (
            <>
              <SliderRow label="POSIÇÃO ←→" value={config.imagePositionX ?? 50} min={0} max={100} onChange={v => onChange({ imagePositionX: v })} isDark={isDark} />
              <SliderRow label="POSIÇÃO ↑↓" value={config.imagePositionY ?? 50} min={0} max={100} onChange={v => onChange({ imagePositionY: v })} isDark={isDark} />
              <SliderRow label="ZOOM %" value={config.imageZoom ?? 100} min={100} max={300} onChange={v => onChange({ imageZoom: v })} isDark={isDark} />
              <SliderRow label="OPACIDADE" value={config.imageOpacity ?? 100} min={0} max={100} onChange={v => onChange({ imageOpacity: v })} isDark={isDark} />
              <ToggleRow label="Espelhar" checked={config.imageFlipH ?? false} onChange={v => onChange({ imageFlipH: v })} isDark={isDark} />
            </>
          )}
        </PanelSection>

        {/* ══ SOMBRA / OVERLAY ══ */}
        <PanelSection title="Sombra / Overlay" icon={Layers}
          open={panels.overlay} onToggle={() => togglePanel('overlay')} isDark={isDark}>
          <SectionLabel isDark={isDark}>Estilo</SectionLabel>
          <select
            value={config.overlayStyle}
            onChange={e => onChange({ overlayStyle: e.target.value as SlideConfig['overlayStyle'] })}
            style={{ ...inputStyle, padding: '9px 11px' }}
          >
            {Object.entries(OVERLAY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <SliderRow label="Opacidade" value={config.overlayOpacity ?? 90} min={0} max={200} onChange={v => onChange({ overlayOpacity: v })} isDark={isDark} />
        </PanelSection>

        {/* ══ FUNDO DO SLIDE ══ */}
        <PanelSection title="Fundo do Slide" icon={Square}
          open={panels.bgPattern} onToggle={() => togglePanel('bgPattern')} isDark={isDark}>
          <SectionLabel isDark={isDark}>Cor de fundo</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <input
              type="color"
              defaultValue={config.bgColor || (isDark ? '#0a0a0a' : '#f0f0f0')}
              onBlur={e => onChange({ bgColor: e.target.value })}
              key={`bgc-${slideIndex}-${config.bgColor}`}
              style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${inputBorder}`, padding: 2, cursor: 'pointer', background: 'none', flexShrink: 0 }}
            />
            <input
              type="text" value={config.bgColor || ''}
              placeholder={isDark ? '#0a0a0a' : '#f0f0f0'}
              onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange({ bgColor: v }); }}
              style={{ ...inputStyle, flex: 1, minWidth: 0, fontFamily: 'monospace' }}
            />
          </div>
          {config.bgColor && (
            <button type="button" onClick={() => onChange({ bgColor: undefined })}
              style={{ width: '100%', marginBottom: 4, padding: '6px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: 'transparent', color: mutedColor, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
            >Resetar cor de fundo</button>
          )}
          <SectionLabel isDark={isDark}>Padrão sobre o fundo</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              ['none', 'Nenhum'],
              ['grid', 'Grade (quadriculado)'],
              ['dots', 'Bolinhas'],
              ['lines', 'Linhas horizontais'],
              ['diagonal', 'Linhas diagonais'],
              ['crosshatch', 'Xadrez diagonal'],
            ].map(([v, l]) => {
              const sel = (config.bgPattern ?? 'none') === v;
              return (
                <button key={v} type="button" onClick={() => onChange({ bgPattern: v as SlideConfig['bgPattern'] })}
                  style={{
                    padding: '8px 12px', borderRadius: 9, textAlign: 'left',
                    border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : inputBorder}`,
                    background: sel ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' : isDark ? '#1a1a1a' : '#f4f4f4',
                    color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#aaa' : '#555',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{l}</button>
              );
            })}
          </div>
          {config.bgPattern && config.bgPattern !== 'none' && (
            <SliderRow label="Opacidade do padrão" value={config.bgPatternOpacity ?? 50} min={5} max={100} onChange={v => onChange({ bgPatternOpacity: v })} isDark={isDark} />
          )}
        </PanelSection>

        {/* ══ GRADE DE IMAGENS ══ */}
        <PanelSection title="Grade de Imagens" icon={Grid2X2}
          open={panels.imageGrid} onToggle={() => togglePanel('imageGrid')} isDark={isDark}>
          <ToggleRow label="Mostrar grade" checked={config.showImageGrid ?? false} onChange={v => onChange({ showImageGrid: v })} isDark={isDark} />
          {config.showImageGrid && (
            <>
              <SectionLabel isDark={isDark}>Layout</SectionLabel>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {[['1','1 imagem'],['2h','2 lado a lado'],['3','3 (1+2)']].map(([v, l]) => {
                  const sel = (config.imageGridLayout ?? '2h') === v;
                  return (
                    <button key={v} type="button" title={l} onClick={() => onChange({ imageGridLayout: v as SlideConfig['imageGridLayout'] })}
                      style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 10, fontWeight: 700, border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : inputBorder}`, background: sel ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' : isDark ? '#1a1a1a' : '#f0f0f0', color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#aaa' : '#555', cursor: 'pointer', fontFamily: 'inherit' }}
                    >{v}</button>
                  );
                })}
              </div>
              {[1, 2, 3].slice(0, config.imageGridLayout === '1' ? 1 : config.imageGridLayout === '2h' ? 2 : 3).map(n => (
                <ImageDropZone key={n} label={`IMAGEM ${n}`} isDark={isDark}
                  url={config[`imageGrid${n}Url` as keyof SlideConfig] as string | undefined}
                  onFile={b64 => onChange({ [`imageGrid${n}Url`]: b64 } as Partial<SlideConfig>)}
                  onClear={() => onChange({ [`imageGrid${n}Url`]: undefined } as Partial<SlideConfig>)}
                  onPaste={b64 => onChange({ [`imageGrid${n}Url`]: b64 } as Partial<SlideConfig>)}
                />
              ))}
              <SliderRow label="Posição vertical" value={config.imageGridY ?? 50} min={0} max={100} onChange={v => onChange({ imageGridY: v })} isDark={isDark} />
              <SliderRow label="Arredondamento" value={config.imageGridRadius ?? 20} min={0} max={60} onChange={v => onChange({ imageGridRadius: v })} isDark={isDark} />
            </>
          )}
        </PanelSection>

        {/* ══ TÍTULO & SUBTÍTULO ══ */}
        <PanelSection title="Título & Subtítulo" icon={Type}
          open={panels.content} onToggle={() => togglePanel('content')} isDark={isDark}>

          {/* Margens */}
          <SectionLabel isDark={isDark}>Margens do conteúdo</SectionLabel>
          <SliderRow
            label={`HORIZONTAL — ${config.contentMarginH ?? 170}PX`}
            value={config.contentMarginH ?? 170} min={0} max={400}
            onChange={v => onChange({ contentMarginH: v })} isDark={isDark}
            hint="Espaço entre o texto e as laterais do slide"
          />
          <SliderRow
            label={`VERTICAL — ${config.contentMarginV ?? 230}PX`}
            value={config.contentMarginV ?? 230} min={0} max={400}
            onChange={v => onChange({ contentMarginV: v })} isDark={isDark}
            hint="Espaço entre o texto e o topo/base do slide"
          />

          {/* Layout 3x3 */}
          <SectionLabel isDark={isDark}>Layout & posição</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 8 }}>
            {LAYOUT_POSITIONS.map((pos, i) => {
              const sel = Math.abs((config.titleBlockY ?? 50) - pos.y) < 5
                && (config.textAlign ?? 'center') === pos.align;
              return (
                <button key={i} type="button" title={pos.label}
                  onClick={() => onChange({ titleBlockY: pos.y, textAlign: pos.align })}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px 4px', borderRadius: 9, gap: 4,
                    border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : inputBorder}`,
                    background: sel ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' : isDark ? '#1a1a1a' : '#f4f4f4',
                    color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#999' : '#555',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ width: 26, height: 32, borderRadius: 3, border: `1.5px solid ${isDark ? '#333' : '#ddd'}`, position: 'relative', display: 'flex', alignItems: pos.y < 35 ? 'flex-start' : pos.y > 65 ? 'flex-end' : 'center', justifyContent: pos.align === 'left' ? 'flex-start' : pos.align === 'right' ? 'flex-end' : 'center', padding: 3 }}>
                    <div style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ height: 2.5, width: '100%', borderRadius: 1, background: sel ? isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' : isDark ? '#444' : '#ccc' }} />
                      <div style={{ height: 1.5, width: '60%', borderRadius: 1, background: sel ? isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' : isDark ? '#333' : '#ddd' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.02em' }}>{LAYOUT_SHORT[i]}</span>
                </button>
              );
            })}
          </div>

          {/* Alinhamento */}
          <SectionLabel isDark={isDark}>Alinhamento</SectionLabel>
          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
            {[['left','ESQ.'],['center','CENTRO'],['right','DIR.']] .map(([v, l]) => {
              const sel = (config.textAlign ?? 'center') === v;
              return (
                <button key={v} type="button" onClick={() => onChange({ textAlign: v as SlideConfig['textAlign'] })}
                  style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : inputBorder}`, background: sel ? isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' : 'transparent', color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#888' : '#888', cursor: 'pointer', fontFamily: 'inherit' }}
                >{l}</button>
              );
            })}
          </div>

          {/* Glass */}
          <ToggleRow label="Glass ao redor do conteúdo" checked={config.contentGlass ?? false} onChange={v => onChange({ contentGlass: v })} isDark={isDark} />

          <div style={{ height: 1, background: border, margin: '4px 0' }} />

          {/* Título textarea */}
          <SectionLabel isDark={isDark}>Título</SectionLabel>
          <textarea
            value={config.title} rows={3}
            onChange={e => onChange({ title: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
          />

          {/* Subtítulo textarea */}
          <SectionLabel isDark={isDark}>Subtítulo</SectionLabel>
          <textarea
            value={config.subtitle} rows={2}
            onChange={e => onChange({ subtitle: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
          />

          {/* Refinar com IA */}
          <SectionLabel isDark={isDark}>✨ Refinar slide com IA</SectionLabel>
          <textarea
            value={iaPrompt} rows={2}
            onChange={e => setIaPrompt(e.target.value)}
            placeholder='Ex: "deixe mais agressivo", "encurte o subtítulo"'
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <button type="button" disabled={!iaPrompt.trim() || refining}
            onClick={async () => { setRefining(true); try { await onRefineIA(iaPrompt); } finally { setRefining(false); } }}
            style={{ padding: '8px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: iaPrompt.trim() ? isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' : 'transparent', color: iaPrompt.trim() ? isDark ? '#e0e0e0' : '#222' : mutedColor, fontSize: 11, fontWeight: 700, cursor: iaPrompt.trim() ? 'pointer' : 'default', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Sparkles size={12} /> {refining ? 'Refinando...' : 'Refinar este slide'}
          </button>

          <div style={{ height: 1, background: border, margin: '4px 0' }} />

          {/* Escala global */}
          <SliderRow label={`ESCALA GLOBAL — ${config.textScale ?? 100}%`} value={config.textScale ?? 100} min={40} max={200} onChange={v => onChange({ textScale: v })} isDark={isDark} hint="Zoom no bloco inteiro (sem mudar quebras de linha)" />

          {/* Título font size */}
          <SliderRow label={`TÍTULO — ${config.titleFontSize ?? 96}PX`} value={config.titleFontSize ?? 96} min={24} max={200} onChange={v => onChange({ titleFontSize: v })} isDark={isDark} hint="Base (multiplicada pela escala)" />

          {/* Fonte do título */}
          <SectionLabel isDark={isDark}>Fonte do título</SectionLabel>
          <FontGrid value={config.titleFont ?? 'inter'} onChange={v => onChange({ titleFont: v })} isDark={isDark} />

          {/* Peso da fonte (título) */}
          <SectionLabel isDark={isDark}>Peso da fonte</SectionLabel>
          <WeightGrid value={config.titleFontWeight ?? 700} onChange={v => onChange({ titleFontWeight: v })} isDark={isDark} />

          {/* Cor do título */}
          <SectionLabel isDark={isDark}>Cor do título</SectionLabel>
          <ColorSwatches value={config.titleColor ?? ''} onChange={v => onChange({ titleColor: v })} isDark={isDark} />

          {/* Espaçamento título */}
          <SliderRow label={`ESPAÇAMENTO TÍTULO — ${config.titleLetterSpacing ?? 0}`} value={config.titleLetterSpacing ?? 0} min={-5} max={20} onChange={v => onChange({ titleLetterSpacing: v })} isDark={isDark} hint="Espaço entre caracteres (0 = padrão)" />

          <div style={{ height: 1, background: border, margin: '4px 0' }} />

          {/* Subtítulo font size */}
          <SliderRow label={`SUBTÍTULO — ${config.subtitleFontSize ?? 32}PX`} value={config.subtitleFontSize ?? 32} min={12} max={80} onChange={v => onChange({ subtitleFontSize: v })} isDark={isDark} hint="Base (multiplicada pela escala)" />

          {/* Fonte do subtítulo */}
          <SectionLabel isDark={isDark}>Fonte do subtítulo</SectionLabel>
          <FontGrid value={config.subtitleFont ?? 'inter'} onChange={v => onChange({ subtitleFont: v })} isDark={isDark} />

          {/* Peso (subtítulo) */}
          <SectionLabel isDark={isDark}>Peso da fonte</SectionLabel>
          <WeightGrid value={config.subtitleFontWeight ?? 400} onChange={v => onChange({ subtitleFontWeight: v })} isDark={isDark} />

          {/* Cor do subtítulo */}
          <SectionLabel isDark={isDark}>Cor do subtítulo</SectionLabel>
          <ColorSwatches value={config.subtitleColor ?? ''} onChange={v => onChange({ subtitleColor: v })} isDark={isDark} />

          {/* Espaçamento subtítulo */}
          <SliderRow label={`ESPAÇAMENTO SUBTÍTULO — ${config.subtitleLetterSpacing ?? 0}`} value={config.subtitleLetterSpacing ?? 0} min={-5} max={20} onChange={v => onChange({ subtitleLetterSpacing: v })} isDark={isDark} hint="Espaço entre caracteres (0 = padrão)" />

          {/* Espaçamento entre linhas */}
          <SliderRow label="ESPAÇAMENTO ENTRE LINHAS" value={config.lineHeight ?? 21} min={10} max={60} onChange={v => onChange({ lineHeight: v })} isDark={isDark} />

          <div style={{ height: 1, background: border, margin: '4px 0' }} />

          {/* Destaque de palavra */}
          <SectionLabel isDark={isDark}>Destaque de palavra</SectionLabel>
          <WordChips text={`${config.title} ${config.subtitle}`} selectedWord={config.highlightWord ?? ''} onSelect={w => onChange({ highlightWord: w })} isDark={isDark} />

          <SectionLabel isDark={isDark}>Cor do destaque</SectionLabel>
          <HighlightSwatches value={config.highlightColor ?? '#FFD700'} onChange={v => onChange({ highlightColor: v })} isDark={isDark} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: config.highlightColor ?? '#FFD700', border: `1px solid ${inputBorder}`, flexShrink: 0 }} />
            <input
              type="text" value={config.highlightColor ?? '#FFD700'}
              onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange({ highlightColor: e.target.value }); }}
              style={{ ...inputStyle, fontFamily: 'monospace', flex: 1 }}
            />
            <input
              type="color" value={config.highlightColor ?? '#FFD700'}
              onChange={e => onChange({ highlightColor: e.target.value })}
              style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${inputBorder}`, padding: 2, cursor: 'pointer', background: 'none', flexShrink: 0 }}
            />
          </div>

          <div style={{ height: 1, background: border, margin: '4px 0' }} />

          {/* Formatação de texto */}
          <SectionLabel isDark={isDark}>Formatação de texto</SectionLabel>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, color: mutedColor, marginBottom: 4 }}>Título</div>
            <WordChips text={config.title} selectedWord={formatTarget === 'title' ? 'title' : ''} onSelect={() => setFormatTarget('title')} isDark={isDark} />
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: mutedColor, marginBottom: 4 }}>Subtítulo</div>
            <WordChips text={config.subtitle} selectedWord={formatTarget === 'subtitle' ? 'subtitle' : ''} onSelect={() => setFormatTarget('subtitle')} isDark={isDark} />
          </div>
          <div style={{ fontSize: 10, color: mutedColor, marginBottom: 6 }}>
            {formatTarget ? `Aplicar formatação ao ${formatTarget}:` : 'Selecione título ou subtítulo acima'}
          </div>
          {formatTarget && <FormatButtons target={formatTarget} />}
        </PanelSection>

        {/* ══ BADGE OU LOGO DE PERFIL ══ */}
        <PanelSection title="Badge ou Logo de Perfil" icon={User}
          open={panels.profileBadge} onToggle={() => togglePanel('profileBadge')} isDark={isDark}>
          <p style={{ fontSize: 10, color: mutedColor, margin: 0, lineHeight: 1.5 }}>
            Overlay com foto e @ do perfil. Visibilidade individual por slide; config global compartilhada.
          </p>

          {/* Profile badge toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <ToggleRow
                label={`Exibir — slide ${slideIndex + 1}`}
                checked={config.showProfileBadge ?? false}
                onChange={v => onChange({ showProfileBadge: v })}
                isDark={isDark}
              />
            </div>
            {onApplyToAllSlides && (
              <button type="button" onClick={() => onApplyToAllSlides({ showProfileBadge: true })}
                style={{ flexShrink: 0, background: 'none', border: `1px solid ${inputBorder}`, borderRadius: 7, padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: mutedColor, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >Todos</button>
            )}
          </div>

          {config.showProfileBadge && (
            <>
              <SectionLabel isDark={isDark}>@ do perfil</SectionLabel>
              <input type="text" placeholder="seuperfil"
                value={config.profileBadgeHandle ?? ''}
                onChange={e => onChange({ profileBadgeHandle: e.target.value })}
                style={inputStyle}
              />
            </>
          )}

          <div style={{ height: 1, background: border, margin: '4px 0' }} />

          {/* Logo badge */}
          <SectionLabel isDark={isDark}>Logo / Marca (PNG)</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <ToggleRow
                label={`Exibir logo — slide ${slideIndex + 1}`}
                checked={config.showLogoBadge ?? false}
                onChange={v => onChange({ showLogoBadge: v })}
                isDark={isDark}
              />
            </div>
            {onApplyToAllSlides && (
              <button type="button" onClick={() => onApplyToAllSlides({ showLogoBadge: true })}
                style={{ flexShrink: 0, background: 'none', border: `1px solid ${inputBorder}`, borderRadius: 7, padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: mutedColor, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >Todos</button>
            )}
          </div>

          <SectionLabel isDark={isDark}>Arquivo PNG (Global)</SectionLabel>
          <SectionLabel isDark={isDark}>Logo PNG</SectionLabel>
          <ImageDropZone
            url={config.logoBadgeFile ?? config.logoBadgeUrl ?? undefined}
            isDark={isDark}
            onFile={b64 => onChange({ logoBadgeFile: b64, logoBadgeUrl: b64 })}
            onClear={() => onChange({ logoBadgeFile: undefined, logoBadgeUrl: undefined })}
            onPaste={b64 => onChange({ logoBadgeFile: b64, logoBadgeUrl: b64 })}
          />
        </PanelSection>

        {/* ── ESTILO GLOBAL label ── */}
        <div style={{ padding: '10px 14px 8px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f0f0f0', borderBottom: `1px solid ${border}`, borderTop: `1px solid ${border}` }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: mutedColor, textTransform: 'uppercase' }}>
            Estilo Global
          </span>
        </div>

        {/* ══ CANTOS ══ */}
        {postStyle === 'minimalista' && (
          <PanelSection title="Cantos" icon={Square}
            open={panels.globalCorners} onToggle={() => togglePanel('globalCorners')} isDark={isDark}>
            <SectionLabel isDark={isDark}>Textos</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {([
                ['cornerTopLeft',    'showCornerTL', 'Sup. esq.'],
                ['cornerTopRight',   'showCornerTR', 'Sup. dir.'],
                ['cornerBottomLeft', 'showCornerBL', 'Inf. esq.'],
                ['cornerBottomRight','showCornerBR', 'Inf. dir.'],
              ] as const).map(([field, visField, label]) => {
                const on = config[visField] ?? true;
                return (
                  <div key={field}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.05em', color: mutedColor, textTransform: 'uppercase' }}>{label}</span>
                      <button type="button" onClick={() => onChange({ [visField]: !on })}
                        style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, border: `1px solid ${inputBorder}`, cursor: 'pointer', fontFamily: 'inherit', background: on ? isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)' : 'transparent', color: on ? isDark ? '#e0e0e0' : '#333' : isDark ? '#555' : '#bbb' }}
                      >{on ? 'ON' : 'OFF'}</button>
                    </div>
                    <input type="text"
                      value={String(config[field] ?? '')}
                      onChange={e => onChange({ [field]: e.target.value })}
                      disabled={!on}
                      style={{ ...inputStyle, opacity: on ? 1 : 0.45, fontSize: 11 }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ height: 1, background: border, margin: '4px 0 12px' }} />
            <ToggleRow label="Exibir cantos" checked={config.showCorners ?? true} onChange={v => onChange({ showCorners: v })} isDark={isDark} />
            <ToggleRow label="Indicadores de quantidade (bolinhas)" checked={config.showCarouselDots ?? true} onChange={v => onChange({ showCarouselDots: v })} isDark={isDark} />

            {(config.showCorners ?? true) && (
              <>
                <SliderRow label="Tamanho da fonte" value={config.cornerFontSize ?? 20} min={10} max={48} onChange={v => onChange({ cornerFontSize: v })} isDark={isDark} />
                <SliderRow label={`Distância das bordas — ${config.cornerInset ?? 80}`} value={config.cornerInset ?? 80} min={20} max={200} onChange={v => onChange({ cornerInset: v })} isDark={isDark} />
                <SliderRow label={`Opacidade — ${config.cornerOpacity ?? 60}`} value={config.cornerOpacity ?? 60} min={0} max={100} onChange={v => onChange({ cornerOpacity: v })} isDark={isDark} />
                <ToggleRow label="Estilo glass (glassmorphism)" checked={config.cornerGlass ?? false} onChange={v => onChange({ cornerGlass: v })} isDark={isDark} />
                <ToggleRow label="Borda minimalista" checked={config.cornerBorders ?? false} onChange={v => onChange({ cornerBorders: v })} isDark={isDark} />

                <SectionLabel isDark={isDark}>Ícone — canto inferior direito</SectionLabel>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {CORNER_ICONS.map(ic => {
                    const sel = (config.cornerBottomRightIcon ?? 'none') === ic.id;
                    return (
                      <button key={ic.id} type="button" onClick={() => onChange({ cornerBottomRightIcon: ic.id })}
                        style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${inputBorder}`, background: sel ? isDark ? '#fff' : '#0a0a0a' : isDark ? '#1a1a1a' : '#f4f4f4', color: sel ? isDark ? '#000' : '#fff' : isDark ? '#aaa' : '#555', cursor: 'pointer' }}
                      >{ic.el}</button>
                    );
                  })}
                </div>
              </>
            )}
          </PanelSection>
        )}

        {/* ══ BOTÕES / CTAS ══ */}
        <PanelSection title="Botões / CTAs" icon={Eye}
          open={panels.globalButtons} onToggle={() => togglePanel('globalButtons')} isDark={isDark}>
          <ToggleRow label="Mostrar botões" checked={config.showButtons ?? false} onChange={v => onChange({ showButtons: v })} isDark={isDark} />
          {config.showButtons && (
            <>
              <div style={{ display: 'flex', gap: 5 }}>
                {[['solid','Sólido'],['outline','Contorno'],['glass','Glass']].map(([v,l]) => {
                  const sel = (config.buttonStyle ?? 'solid') === v;
                  return (
                    <button key={v} type="button" onClick={() => onChange({ buttonStyle: v as SlideConfig['buttonStyle'] })}
                      style={{ flex: 1, padding: '6px 4px', borderRadius: 7, fontSize: 11, fontWeight: 600, border: `1px solid ${sel ? isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' : inputBorder}`, background: sel ? isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)' : 'transparent', color: sel ? isDark ? '#e8e8e8' : '#0a0a0a' : isDark ? '#888' : '#999', cursor: 'pointer', fontFamily: 'inherit' }}
                    >{l}</button>
                  );
                })}
              </div>
              <input type="text" placeholder="Texto do botão"
                value={config.button1?.label ?? ''}
                onChange={e => onChange({ button1: { ...(config.button1 ?? { variant: 'primary', icon: '' }), label: e.target.value } })}
                style={inputStyle}
              />
              <SliderRow label="Border radius" value={config.buttonBorderRadius ?? 100} min={0} max={100} onChange={v => onChange({ buttonBorderRadius: v })} isDark={isDark} />
            </>
          )}
        </PanelSection>

        {/* ══ TEMPLATES DE ESTILO ══ */}
        <PanelSection title="Templates de Estilo" icon={BookOpen}
          open={panels.templates} onToggle={() => togglePanel('templates')} isDark={isDark}>
          <p style={{ fontSize: 10, color: mutedColor, margin: 0, lineHeight: 1.5 }}>
            Salve o estilo visual atual para reutilizar em novos carrosséis.
          </p>
          <SectionLabel isDark={isDark}>Nome do template</SectionLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input type="text" placeholder="Ex: Meu estilo principal" value={tplName}
              onChange={e => setTplName(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" disabled={!tplName.trim() || savingTpl}
              onClick={async () => { if (!tplName.trim() || !onSaveTemplate) return; setSavingTpl(true); try { await onSaveTemplate(tplName); setTplName(''); } finally { setSavingTpl(false); } }}
              style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tplName.trim() ? isDark ? '#fff' : '#0a0a0a' : isDark ? '#2a2a2a' : '#ddd', color: tplName.trim() ? isDark ? '#000' : '#fff' : isDark ? '#555' : '#aaa', cursor: tplName.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
            >
              <Save size={13} />
            </button>
          </div>
          {savedTemplates.filter(t => t.post_style === postStyle).length === 0 ? (
            <p style={{ fontSize: 11, color: mutedColor, margin: 0, fontStyle: 'italic' }}>Nenhum template salvo ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {savedTemplates.filter(t => t.post_style === postStyle).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: isDark ? '#1a1a1a' : '#f4f4f4' }}>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: isDark ? '#ddd' : '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  <button type="button" disabled={applyingTpl === t.id}
                    onClick={async () => { if (!onApplyTemplate) return; setApplyingTpl(t.id); try { await onApplyTemplate(t.id); } finally { setApplyingTpl(null); } }}
                    style={{ padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 10, fontWeight: 700, background: isDark ? '#fff' : '#0a0a0a', color: isDark ? '#000' : '#fff', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >{applyingTpl === t.id ? '...' : 'Aplicar'}</button>
                </div>
              ))}
            </div>
          )}
        </PanelSection>

        <div style={{ height: 8 }} />
      </div>

      {/* ── FOOTER FIXO ── */}
      <div style={{ flexShrink: 0, padding: '10px 10px 10px', borderTop: `1px solid ${border}`, background: isDark ? '#0a0a0a' : '#fff', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <button type="button" onClick={onDownloadSlide}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, background: isDark ? '#fff' : '#0a0a0a', color: isDark ? '#000' : '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Baixar Slide {slideIndex + 1}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={onApplyToAll}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: 'transparent', color: isDark ? '#888' : '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Save size={11} /> Salvar
          </button>
          <button type="button" onClick={onDownloadAll}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: 'transparent', color: isDark ? '#888' : '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar Todos
          </button>
        </div>
        <button type="button" onClick={onGenerateCaption}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: 'transparent', color: isDark ? '#666' : '#999', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Gerar Legenda
        </button>
      </div>
    </aside>
  );
};
