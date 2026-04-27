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
  scale?: number;
}

function getDimensions(format: SlideFormat) {
  const width = 1080;
  const height = format === 'story' ? 1920 : format === 'square' ? 1080 : 1350;
  const sideInset = format === 'square' ? 120 : 170;
  const topInset  = format === 'square' ? 140 : 230;
  const botInset  = format === 'square' ? 140 : 240;
  return { width, height, sideInset, topInset, botInset };
}

const renderMarkdown = (text: string, highlightWord?: string, highlightColor?: string) => {
  if (!text) return null;
  let html = text;
  if (highlightWord && highlightColor) {
    highlightWord.split(',').map(w => w.trim()).filter(Boolean).forEach(word => {
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

// SVG icons for corner bottom-right
const CornerIcon: React.FC<{ icon: string; size: number; color: string }> = ({ icon, size, color }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (icon) {
    case 'swipe':    return <svg {...p}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
    case 'heart':    return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case 'share':    return <svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
    case 'comment':  return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'click':    return <svg {...p}><path d="M15 15l-2 5L9 9l11 4-5 2z"/><path d="M22 22l-5-5"/></svg>;
    case 'bookmark': return <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
    default: return null;
  }
};

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

  const effectiveSideInset = sideInset + (config.contentMarginH ?? 0);
  const marginV = config.contentMarginV ?? 0;

  // Text block positioning
  const blockY = config.titleBlockY ?? 50;
  const isTop = blockY < 35;
  const isBot = blockY > 65;
  let textPositioning: React.CSSProperties;
  if (isTop) {
    textPositioning = { position: 'absolute', top: `${(topInset + marginV) * scale}px` };
  } else if (isBot) {
    textPositioning = { position: 'absolute', bottom: `${(botInset - marginV) * scale}px` };
  } else {
    const offset = ((blockY - 50) / 30) * 220 + marginV;
    textPositioning = { position: 'absolute', top: '50%', transform: `translateY(calc(-50% + ${offset * scale}px)) scale(${(config.textScale ?? 100) / 100})` };
  }

  // Overlay — tint with bgColor if defined (matches competitor)
  const getOverlay = () => {
    if (!config.overlayStyle || config.overlayStyle === 'none') return null;
    let bg = OVERLAY_STYLES[config.overlayStyle] ?? 'none';
    if (config.bgColor?.startsWith('#') && bg) {
      const hex = config.bgColor.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      bg = bg.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/g, `rgba(${r},${g},${b},`);
    }
    return bg;
  };
  const overlayBg = getOverlay();

  // Background pattern (matches competitor sizing)
  const getPatternStyle = (): React.CSSProperties | null => {
    if (!config.bgPattern || config.bgPattern === 'none') return null;
    const sz = (config.bgPatternSize ?? 100) / 100;
    const op = (config.bgPatternOpacity ?? 50) / 100;
    const col = isDark
      ? `rgba(255,255,255,${(0.85 * op).toFixed(3)})`
      : `rgba(0,0,0,${(0.75 * op).toFixed(3)})`;
    const col2 = isDark
      ? `rgba(255,255,255,${op.toFixed(3)})`
      : `rgba(0,0,0,${(0.9 * op).toFixed(3)})`;

    let backgroundImage = '';
    let backgroundSize = '';
    if (config.bgPattern === 'grid') {
      const t = Math.round(40 * sz);
      backgroundImage = `linear-gradient(${col} 1px, transparent 1px), linear-gradient(90deg, ${col} 1px, transparent 1px)`;
      backgroundSize = `${t}px ${t}px`;
    } else if (config.bgPattern === 'dots') {
      const t = Math.round(26 * sz);
      const r = Math.max(1, Math.round(1.8 * sz));
      backgroundImage = `radial-gradient(circle, ${col2} ${r}px, transparent ${r}px)`;
      backgroundSize = `${t}px ${t}px`;
    } else if (config.bgPattern === 'lines') {
      const t = Math.round(32 * sz);
      backgroundImage = `repeating-linear-gradient(0deg, ${col} 0, ${col} 1px, transparent 1px, transparent ${t}px)`;
    } else if (config.bgPattern === 'diagonal') {
      const t = Math.round(20 * sz);
      backgroundImage = `repeating-linear-gradient(45deg, ${col} 0, ${col} 1px, transparent 1px, transparent ${t}px)`;
    } else if (config.bgPattern === 'crosshatch') {
      const t = Math.round(14 * sz);
      backgroundImage = `repeating-linear-gradient(45deg, ${col} 0, ${col} 1px, transparent 1px, transparent ${t}px), repeating-linear-gradient(-45deg, ${col} 0, ${col} 1px, transparent 1px, transparent ${t}px)`;
    }
    return backgroundImage ? { backgroundImage, backgroundSize: backgroundSize || undefined } : null;
  };

  // Corner style
  const cInset = (config.cornerInset ?? 40) * scale;
  const cFontSize = (config.cornerFontSize ?? 14) * scale;
  const cOpacity = (config.cornerOpacity ?? 80) / 100;
  const cRadius = (config.cornerBorderRadius ?? 8) * scale;
  const cColor = isDark ? `rgba(255,255,255,${cOpacity})` : `rgba(0,0,0,${cOpacity})`;

  const cornerStyle = (pos: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => ({
    position: 'absolute',
    zIndex: 35,
    ...(pos.startsWith('t') ? { top: `${cInset}px` } : { bottom: `${cInset}px` }),
    ...(pos.endsWith('l') ? { left: `${cInset}px` } : { right: `${cInset}px` }),
    fontSize: `${cFontSize}px`,
    fontWeight: 500,
    color: cColor,
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    textShadow: config.cornerBorders ? 'none' : isDark ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: `${8 * scale}px`,
    ...(config.cornerGlass ? {
      backdropFilter: 'blur(12px)',
      background: isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 100%)',
      border: isDark ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.9)',
      borderRadius: `${cRadius}px`,
      padding: `${4 * scale}px ${8 * scale}px`,
    } : config.cornerBorders ? {
      border: isDark ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.2)',
      borderRadius: `${cRadius}px`,
      padding: `${4 * scale}px ${8 * scale}px`,
    } : {}),
  });

  // Image grid — layout '3' = 1 large left (58%) + 2 small right stacked (matches competitor exactly)
  const gridW = width - 2 * sideInset;
  const gridH = { '1': 420, '2h': 380, '3': 440 }[config.imageGridLayout ?? '2h'] ?? 380;
  const scaledGridW = gridW * scale;
  const scaledGridH = gridH * scale;
  const gridRadius = (config.imageGridRadius ?? 20) * scale;

  const renderGridImg = (
    url: string | undefined, w: number, h: number,
    x = 50, y = 50, zoom = 100, flipH = false, opacity = 100
  ) => (
    <div style={{ width: `${w}px`, height: `${h}px`, borderRadius: `${gridRadius}px`, overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.11)' : '1px solid rgba(0,0,0,0.1)', flexShrink: 0, position: 'relative' }}>
      {url && <img src={url} alt="" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, transform: `scale(${zoom / 100})${flipH ? ' scaleX(-1)' : ''}`, transformOrigin: `${x}% ${y}%`, display: 'block', opacity: opacity < 100 ? opacity / 100 : undefined }} />}
    </div>
  );

  const renderImageGrid = () => {
    if (!config.showImageGrid) return null;
    const gridY = config.imageGridY ?? 50;
    const gridTop = config.imageGridAdapt
      ? (isTop ? height - botInset - gridH : isBot ? topInset : height - botInset - gridH)
      : topInset + (gridY / 100) * (height - topInset - botInset - gridH);

    const gap = 14 * scale;
    const layout = config.imageGridLayout ?? '2h';
    const g1 = { url: config.imageGrid1Url, x: config.imageGrid1PositionX ?? 50, y: config.imageGrid1PositionY ?? 50, z: config.imageGrid1Zoom ?? 100, f: config.imageGrid1FlipH ?? false, o: config.imageGrid1Opacity ?? 100 };
    const g2 = { url: config.imageGrid2Url, x: config.imageGrid2PositionX ?? 50, y: config.imageGrid2PositionY ?? 50, z: config.imageGrid2Zoom ?? 100, f: config.imageGrid2FlipH ?? false, o: config.imageGrid2Opacity ?? 100 };
    const g3 = { url: config.imageGrid3Url, x: config.imageGrid3PositionX ?? 50, y: config.imageGrid3PositionY ?? 50, z: config.imageGrid3Zoom ?? 100, f: config.imageGrid3FlipH ?? false, o: config.imageGrid3Opacity ?? 100 };

    return (
      <div style={{ position: 'absolute', left: `${sideInset * scale}px`, top: `${gridTop * scale}px`, zIndex: 15 }}>
        {layout === '1' && renderGridImg(g1.url, scaledGridW, scaledGridH, g1.x, g1.y, g1.z, g1.f, g1.o)}
        {layout === '2h' && (
          <div style={{ display: 'flex', gap: `${gap}px` }}>
            {renderGridImg(g1.url, (scaledGridW - gap) / 2, scaledGridH, g1.x, g1.y, g1.z, g1.f, g1.o)}
            {renderGridImg(g2.url, (scaledGridW - gap) / 2, scaledGridH, g2.x, g2.y, g2.z, g2.f, g2.o)}
          </div>
        )}
        {layout === '3' && (() => {
          const bigW = Math.floor(0.58 * scaledGridW);
          const smallW = scaledGridW - bigW - gap;
          const smallH = Math.floor((scaledGridH - gap) / 2);
          return (
            <div style={{ display: 'flex', gap: `${gap}px` }}>
              {renderGridImg(g1.url, bigW, scaledGridH, g1.x, g1.y, g1.z, g1.f, g1.o)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
                {renderGridImg(g2.url, smallW, smallH, g2.x, g2.y, g2.z, g2.f, g2.o)}
                {renderGridImg(g3.url, smallW, smallH, g3.x, g3.y, g3.z, g3.f, g3.o)}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // Profile badge
  const renderProfileBadge = () => {
    if (!config.showProfileBadge || (!config.profileBadgeHandle && !config.profileBadgePhotoUrl)) return null;
    const bStyle = config.profileBadgeStyle ?? 'glass';
    const szMul = ((config.profileBadgeSizeLocal ?? config.profileBadgeSize ?? 100) / 100) * scale;
    const photoSz = Math.round(48 * szMul);
    const fontSize = Math.round(18 * szMul);
    const padV = Math.round(10 * szMul);
    const padH = Math.round(16 * szMul);
    const gap = Math.round(12 * szMul);
    const radius = Math.round((4 + (config.profileBadgeRadius ?? 100) / 100 * 56) * szMul);

    const bgStyle: React.CSSProperties =
      bStyle === 'glass' ? {
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.13) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.68) 100%)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.26)' : '1px solid rgba(255,255,255,0.9)',
      } : bStyle === 'solid' ? {
        background: isDark ? 'rgba(20,20,20,0.88)' : 'rgba(255,255,255,0.94)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
      } : { background: 'transparent', border: 'none' };

    return (
      <div style={{ position: 'absolute', bottom: `${botInset * scale}px`, left: `${sideInset * scale}px`, zIndex: 30, display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, padding: `${padV}px ${padH}px ${padV}px ${padV}px`, borderRadius: `${radius}px`, ...bgStyle }}>
        <div style={{ width: `${photoSz}px`, height: `${photoSz}px`, borderRadius: '50%', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {config.profileBadgePhotoUrl
            ? <img src={config.profileBadgePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <svg width={Math.round(24 * szMul)} height={Math.round(24 * szMul)} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)'} /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)'} /></svg>
          }
        </div>
        {config.profileBadgeHandle && (
          <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 600, fontSize: `${fontSize}px`, color: isDark ? 'rgba(255,255,255,0.97)' : 'rgba(0,0,0,0.88)', whiteSpace: 'nowrap' }}>
            @{config.profileBadgeHandle.replace(/^@/, '')}
          </span>
        )}
      </div>
    );
  };

  // Content glass style (gradient, matches competitor)
  const glassWrap: React.CSSProperties | undefined = config.contentGlass ? {
    background: isDark
      ? `linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%)`
      : `linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 100%)`,
    border: isDark ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.9)',
    borderRadius: `${(config.contentGlassRadius ?? 16) * scale}px`,
    padding: `${10 * scale}px ${18 * scale}px`,
    backdropFilter: 'blur(12px)',
  } : undefined;

  const patternStyle = getPatternStyle();
  const gap = `${(config.titleBlockGap ?? 20) * scale}px`;

  const textContent = (
    <>
      <h2 style={{
        fontFamily: titleFont,
        fontSize: `${(config.titleFontSize ?? 96) * scale}px`,
        fontWeight: config.titleFontWeight ?? (config.titleBold !== false ? 800 : 500),
        fontStyle: config.titleItalic ? 'italic' : 'normal',
        textDecoration: config.titleUnderline ? 'underline' : config.titleStrikethrough ? 'line-through' : 'none',
        textTransform: (config.titleTransform as React.CSSProperties['textTransform']) ?? 'none',
        color: config.titleColor || defaultText,
        letterSpacing: `${(config.titleLetterSpacing ?? 0) * scale}px`,
        lineHeight: config.lineHeight ?? 1.08,
        margin: 0,
        textShadow: config.showTextShadows !== false ? '0 2px 24px rgba(0,0,0,0.5)' : 'none',
      }}>
        {renderMarkdown(config.title, config.highlightWord, config.highlightColor)}
      </h2>
      {config.subtitle && (
        <p style={{
          fontFamily: subtitleFont,
          fontSize: `${(config.subtitleFontSize ?? 32) * scale}px`,
          fontWeight: config.subtitleFontWeight ?? (config.subtitleBold ? 700 : 400),
          fontStyle: config.subtitleItalic ? 'italic' : 'normal',
          textDecoration: config.subtitleUnderline ? 'underline' : config.subtitleStrikethrough ? 'line-through' : 'none',
          textTransform: (config.subtitleTransform as React.CSSProperties['textTransform']) ?? 'none',
          color: config.subtitleColor || defaultSub,
          letterSpacing: `${(config.subtitleLetterSpacing ?? 0) * scale}px`,
          lineHeight: config.lineHeight ? config.lineHeight * 1.35 : 1.45,
          margin: 0,
          textShadow: config.showTextShadows !== false ? '0 1px 12px rgba(0,0,0,0.4)' : 'none',
        }}>
          {renderMarkdown(config.subtitle)}
        </p>
      )}
      {config.showButtons && config.button1 && (
        <div style={{ display: 'flex', gap: `${16 * scale}px`, flexWrap: 'wrap', justifyContent: config.textAlign === 'center' ? 'center' : config.textAlign === 'right' ? 'flex-end' : 'flex-start', marginTop: `${8 * scale}px` }}>
          {[config.button1, ...(config.showButton2 && config.button2 ? [config.button2] : [])].map((btn, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: `${Math.round((config.buttonFontSize ?? 15) * 0.75 * scale)}px ${Math.round((config.buttonFontSize ?? 15) * 1.45 * scale)}px`,
              borderRadius: `${(config.buttonBorderRadius ?? 100) * scale}px`,
              fontSize: `${(config.buttonFontSize ?? 15) * scale}px`,
              fontWeight: 700,
              background: btn.variant === 'primary' ? (isDark ? '#ffffff' : '#0a0a0a') : 'transparent',
              color: btn.variant === 'primary' ? (isDark ? '#0a0a0a' : '#ffffff') : defaultText,
              border: btn.variant === 'secondary' ? `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}` : 'none',
              backdropFilter: config.buttonStyle === 'glass' ? 'blur(8px)' : 'none',
            }}>{btn.label}</span>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div
      ref={exportRef}
      className={cn('select-none', className)}
      style={{ display: 'inline-flex', transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top center', ...style }}
    >
      <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative', overflow: 'hidden', borderRadius: 4, backgroundColor: config.bgColor || defaultBg, fontFamily: titleFont }}>

        {/* 1. Imagem de fundo */}
        {config.imageUrl && !config.infiniteCarousel && !config.infiniteCarouselRight && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${config.imageUrl})`, backgroundSize: `${config.imageZoom ?? 100}%`, backgroundRepeat: 'no-repeat', backgroundPosition: `${config.imagePositionX ?? 50}% ${config.imagePositionY ?? 50}%`, transform: config.imageFlipH ? 'scaleX(-1)' : undefined, opacity: (config.imageOpacity ?? 100) < 100 ? (config.imageOpacity ?? 100) / 100 : undefined }} />
        )}

        {/* 1b. Infinite Carousel */}
        {config.imageUrl && (config.infiniteCarousel || config.infiniteCarouselRight) && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: config.infiniteCarouselRight ? -1080 : 0, width: 2160, height, backgroundImage: `url(${config.imageUrl})`, backgroundSize: `${config.imageZoom ?? 100}% auto`, backgroundRepeat: 'no-repeat', backgroundPosition: `${config.imagePositionX ?? 50}% ${config.imagePositionY ?? 50}%` }} />
          </div>
        )}

        {/* 2. Padrão de fundo */}
        {patternStyle && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...patternStyle }} />
        )}

        {/* 3. Overlay */}
        {overlayBg && (
          <div style={{ position: 'absolute', inset: 0, background: overlayBg, opacity: (config.overlayOpacity ?? 90) / 100, pointerEvents: 'none' }} />
        )}

        {/* 4. Grade de imagens */}
        {renderImageGrid()}

        {/* 5. Bloco de texto */}
        <div style={{
          left: `${effectiveSideInset}px`,
          right: `${effectiveSideInset}px`,
          textAlign: config.textAlign,
          display: 'flex',
          flexDirection: 'column',
          gap,
          zIndex: 20,
          ...textPositioning,
          ...(!isTop && !isBot ? {} : { transform: `scale(${(config.textScale ?? 100) / 100})` }),
        }}>
          {glassWrap
            ? <div style={{ ...glassWrap, display: 'flex', flexDirection: 'column', gap }}>{textContent}</div>
            : textContent
          }
        </div>

        {/* 6. Badge de perfil */}
        {renderProfileBadge()}

        {/* 7. Logo badge */}
        {config.showLogoBadge && config.logoBadgeUrl && (() => {
          const pos = config.logoBadgePosition ?? 'top-right';
          const sz = (config.logoBadgeSizeLocal ?? config.logoBadgeSize ?? 60);
          const inset = 40;
          const ps: React.CSSProperties = { position: 'absolute', zIndex: 30, width: `${sz}px`, height: `${sz}px`, objectFit: 'contain' };
          if (pos.includes('top')) ps.top = `${inset}px`;
          if (pos.includes('bottom')) ps.bottom = `${inset}px`;
          if (pos.includes('left')) ps.left = `${inset}px`;
          if (pos.includes('right')) ps.right = `${inset}px`;
          if (pos === 'top-center' || pos === 'bottom-center') { ps.left = '50%'; (ps as React.CSSProperties).transform = 'translateX(-50%)'; }
          return <img src={config.logoBadgeUrl} alt="" style={ps} />;
        })()}

        {/* 8. Cantos */}
        {config.showCorners && (
          <>
            {config.showCornerTL !== false && <div style={cornerStyle('tl')}>{config.cornerTopLeft || ' '}</div>}
            {config.showCornerTR !== false && <div style={cornerStyle('tr')}>{config.cornerTopRight || ' '}</div>}
            {config.showCornerBL !== false && <div style={cornerStyle('bl')}>{config.cornerBottomLeft || ' '}</div>}
            {config.showCornerBR !== false && (
              <div style={cornerStyle('br')}>
                {config.cornerBottomRight}
                {config.cornerBottomRightIcon && config.cornerBottomRightIcon !== 'none' && (
                  <CornerIcon icon={config.cornerBottomRightIcon} size={cFontSize * 1.2} color={cColor} />
                )}
              </div>
            )}
          </>
        )}

        {/* 9. Carousel dots */}
        {config.showCarouselDots !== false && totalSlides > 1 && (
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, zIndex: 30 }}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} style={{ width: i === slideIndex ? 28 : 10, height: 10, borderRadius: 100, background: i === slideIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
