import React from 'react';
import { PREMIUM_FONTS, OVERLAY_STYLES, BACKGROUND_PATTERNS } from '@/types/carrossel-constants';
import type { SlideConfig, SlideFormat } from '@/types/carrossel-v2';
import { cn } from '@/lib/utils';

interface MyPostFlowSlideV2Props {
  config: SlideConfig;
  slideFormat?: SlideFormat;
  slideIndex?: number;
  totalSlides?: number;
  className?: string;
  style?: React.CSSProperties;
  exportRef?: React.RefObject<HTMLDivElement>;
  /** Escala visual (0.1 - 1). O slide real sempre tem 1080px, mas aparece reduzido */
  scale?: number;
}

// ─── Dimensões originais (igual ao MyPostFlow) ───────────────────
function getDimensions(format: SlideFormat) {
  const width = 1080;
  const height = format === 'story' ? 1920 : format === 'square' ? 1080 : 1350;
  const sideInset = format === 'square' ? 120 : 170;
  const topInset  = format === 'square' ? 140 : 230;
  const botInset  = format === 'square' ? 140 : 240;
  return { width, height, sideInset, topInset, botInset };
}

// ─── Helper: Markdown simples ────────────────────────────────────
const renderMarkdown = (text: string, highlightWord?: string, highlightColor?: string) => {
  if (!text) return null;
  let html = text;

  if (highlightWord && highlightColor) {
    const words = highlightWord.split(',').map(w => w.trim()).filter(Boolean);
    words.forEach(word => {
      const safe = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(${safe})`, 'gi'), `<span style="color:${highlightColor};font-weight:800">$1</span>`);
    });
  }

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

// ─── Componente principal ─────────────────────────────────────────
export const MyPostFlowSlideV2: React.FC<MyPostFlowSlideV2Props> = ({
  config,
  slideFormat = 'carousel',
  slideIndex = 0,
  totalSlides = 1,
  className,
  style,
  exportRef,
  scale = 1,
}) => {
  const isDark = config.slideDark ?? true;
  const defaultBg   = isDark ? '#0a0a0a' : '#f0f0f0';
  const defaultText = isDark ? 'rgba(255,255,255,0.98)' : 'rgba(0,0,0,0.92)';
  const defaultSub  = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.70)';

  const { width, height, sideInset, topInset, botInset } = getDimensions(slideFormat);

  const titleFont    = PREMIUM_FONTS.find(f => f.id === config.titleFont)?.family    || PREMIUM_FONTS[0].family;
  const subtitleFont = PREMIUM_FONTS.find(f => f.id === config.subtitleFont)?.family || PREMIUM_FONTS[7].family;

  // titleBlockY: posição 0-100. <35 = topo, >65 = base, resto = centro
  const blockY = config.titleBlockY ?? 50;
  let textPositioning: React.CSSProperties;
  if (blockY < 35) {
    textPositioning = { top: `${topInset}px`, position: 'absolute' };
  } else if (blockY > 65) {
    textPositioning = { bottom: `${botInset}px`, position: 'absolute' };
  } else {
    const offset = ((blockY - 50) / 30) * 220;
    textPositioning = {
      position: 'absolute',
      top: '50%',
      transform: `translateY(calc(-50% + ${offset}px)) scale(${(config.textScale ?? 100) / 100})`,
    };
  }

  // Overlay
  const overlayBg = config.overlayStyle !== 'none'
    ? (OVERLAY_STYLES[config.overlayStyle] ?? 'none')
    : 'none';

  // Padrão de fundo
  const patternBg = config.bgPattern !== 'none'
    ? BACKGROUND_PATTERNS[config.bgPattern] ?? ''
    : '';

  return (
    <div
      ref={exportRef}
      className={cn('relative overflow-hidden select-none', className)}
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        backgroundColor: config.bgColor || defaultBg,
        fontFamily: titleFont,
        ...style,
      }}
    >
      {/* ── 1. Imagem de fundo ── */}
      {config.imageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${config.imageUrl})`,
            backgroundSize: `${config.imageZoom ?? 100}%`,
            backgroundPosition: `${config.imagePositionX ?? 50}% ${config.imagePositionY ?? 50}%`,
            backgroundRepeat: 'no-repeat',
            opacity: (config.imageOpacity ?? 100) / 100,
            transform: config.imageFlipH ? 'scaleX(-1)' : 'none',
          }}
        />
      )}

      {/* ── 2. Padrão de fundo ── */}
      {config.bgPattern !== 'none' && patternBg && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: patternBg,
            backgroundSize: `${(config.bgPatternSize ?? 100) / 4}px ${(config.bgPatternSize ?? 100) / 4}px`,
            opacity: (config.bgPatternOpacity ?? 50) / 400,
            color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── 3. Overlay ── */}
      {config.overlayStyle !== 'none' && overlayBg !== 'none' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayBg,
            opacity: (config.overlayOpacity ?? 90) / 100,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── 4. Bloco de texto ── */}
      <div
        style={{
          left: `${sideInset * scale}px`,
          right: `${sideInset * scale}px`,
          textAlign: config.textAlign,
          display: 'flex',
          flexDirection: 'column',
          gap: `${(config.titleBlockGap ?? 20) * scale}px`,
          zIndex: 20,
          ...textPositioning,
          ...(blockY >= 35 && blockY <= 65 ? {} : {
            transform: `scale(${(config.textScale ?? 100) / 100})`,
          }),
        }}
      >
        {/* Título */}
        <h2
          style={{
            fontFamily: titleFont,
            fontSize: `${(config.titleFontSize ?? 96) * scale}px`,
            fontWeight: config.titleBold !== false ? 800 : 500,
            fontStyle: config.titleItalic ? 'italic' : 'normal',
            textDecoration: config.titleUnderline ? 'underline' : config.titleStrikethrough ? 'line-through' : 'none',
            textTransform: (config.titleTransform as React.CSSProperties['textTransform']) ?? 'none',
            color: config.titleColor || defaultText,
            letterSpacing: `${(config.titleLetterSpacing ?? 0) * scale}px`,
            lineHeight: 1.08,
            margin: 0,
            textShadow: config.showTextShadows !== false ? '0 2px 24px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {renderMarkdown(config.title, config.highlightWord, config.highlightColor)}
        </h2>

        {/* Subtítulo */}
        {config.subtitle && (
          <p
            style={{
              fontFamily: subtitleFont,
              fontSize: `${(config.subtitleFontSize ?? 32) * scale}px`,
              fontWeight: config.subtitleBold ? 700 : 400,
              fontStyle: config.subtitleItalic ? 'italic' : 'normal',
              color: config.subtitleColor || defaultSub,
              letterSpacing: `${(config.subtitleLetterSpacing ?? 0) * scale}px`,
              lineHeight: 1.45,
              margin: 0,
              textShadow: config.showTextShadows !== false ? '0 1px 12px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            {renderMarkdown(config.subtitle)}
          </p>
        )}

        {/* Botões CTA */}
        {config.showButtons && config.button1 && (
          <div style={{ display: 'flex', gap: `${16 * scale}px`, justifyContent: config.textAlign === 'center' ? 'center' : config.textAlign === 'right' ? 'flex-end' : 'flex-start', marginTop: `${8 * scale}px` }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${Math.round((config.buttonFontSize ?? 15) * 0.75 * scale)}px ${Math.round((config.buttonFontSize ?? 15) * 1.45 * scale)}px`,
                borderRadius: `${(config.buttonBorderRadius ?? 100) * scale}px`,
                fontSize: `${(config.buttonFontSize ?? 15) * scale}px`,
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: config.button1.variant === 'primary' ? (isDark ? '#ffffff' : '#0a0a0a') : 'transparent',
                color: config.button1.variant === 'primary' ? (isDark ? '#0a0a0a' : '#ffffff') : defaultText,
                border: config.button1.variant === 'secondary' ? `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}` : 'none',
                backdropFilter: config.buttonStyle === 'glass' ? 'blur(8px)' : 'none',
              }}
            >
              {config.button1.label}
            </span>
          </div>
        )}
      </div>

      {/* ── 5. Badge de Perfil ── */}
      {config.showProfileBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: `${botInset * scale}px`,
            left: `${sideInset * scale}px`,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: `${12 * scale}px`,
            padding: `${10 * scale}px ${18 * scale}px`,
            borderRadius: `${100 * scale}px`,
            backdropFilter: config.profileBadgeStyle === 'glass' ? 'blur(12px)' : 'none',
            backgroundColor: config.profileBadgeStyle === 'glass'
              ? 'rgba(255,255,255,0.08)'
              : config.profileBadgeStyle === 'solid'
                ? (isDark ? '#161616' : '#ffffff')
                : 'transparent',
            border: config.profileBadgeStyle === 'glass' ? '1px solid rgba(255,255,255,0.15)' : 'none',
            transform: `scale(${(config.profileBadgeSize ?? 100) / 100})`,
            transformOrigin: 'bottom left',
          }}
        >
          {config.profileBadgePhotoUrl && (
            <img
              src={config.profileBadgePhotoUrl}
              style={{ width: `${48 * scale}px`, height: `${48 * scale}px`, borderRadius: '50%', objectFit: 'cover' }}
              alt=""
            />
          )}
          <span style={{ color: defaultText, fontWeight: 700, fontSize: `${18 * scale}px` }}>
            @{config.profileBadgeHandle || 'usuario'}
          </span>
        </div>
      )}

      {/* ── 6. Dots de carrossel ── */}
      {totalSlides > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: `${40 * scale}px`,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: `${10 * scale}px`,
            zIndex: 30,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              style={{
                width: `${(i === slideIndex ? 28 : 10) * scale}px`,
                height: `${10 * scale}px`,
                borderRadius: `${100 * scale}px`,
                backgroundColor: i === slideIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Estilos auxiliares inline para markdown */}
      <style>{`em { font-style: italic; } strong { font-weight: 900; } u { text-decoration: underline; } del { text-decoration: line-through; }`}</style>
    </div>
  );
};
