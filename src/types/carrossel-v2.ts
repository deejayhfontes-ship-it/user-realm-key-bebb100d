
export type OverlayStyle =
  | 'none'
  | 'gradient' | 'gradient-strong'
  | 'vignette' | 'vignette-strong'
  | 'dark' | 'dark-strong'
  | 'bottom' | 'bottom-strong' | 'bottom-intense'
  | 'top' | 'top-strong' | 'top-intense'
  | 'frame' | 'frame-strong'
  | 'left' | 'right'
  | 'diag-bl' | 'diag-br' | 'diag-tl' | 'diag-tr';

export type BackgroundPattern =
  | 'none'
  | 'grid'
  | 'dots'
  | 'lines'
  | 'diagonal'
  | 'crosshatch';

export type SlideFormat = 'carousel' | 'square' | 'story';
export type PostStyle = 'minimalista' | 'profile';

export interface SlideConfig {
  id: string;
  title: string;
  subtitle: string;

  // Design
  bgColor?: string;
  slideDark?: boolean;
  overlayStyle: OverlayStyle;
  overlayOpacity: number;
  bgPattern: BackgroundPattern;
  bgPatternSize?: number;
  bgPatternOpacity?: number;

  // Typography
  titleFont?: string;
  titleFontSize?: number;
  titleFontWeight?: number;
  titleColor?: string;
  titleLetterSpacing?: number;
  titleBlockY?: number;
  titleBlockGap?: number;

  subtitleFont?: string;
  subtitleFontSize?: number;
  subtitleFontWeight?: number;
  subtitleColor?: string;
  subtitleLetterSpacing?: number;

  textAlign: 'left' | 'center' | 'right';
  textScale: number;
  highlightWord?: string;
  highlightColor?: string;

  // Images
  imageUrl?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  imageZoom?: number;
  imageFlipH?: boolean;
  imageOpacity?: number;

  // Infinite Carousel
  infiniteCarousel?: boolean;
  infiniteCarouselRight?: boolean;

  // Image Grid
  showImageGrid?: boolean;
  imageGridLayout?: '1' | '2h' | '3';
  imageGridRadius?: number;
  imageGridY?: number;
  imageGridAdapt?: boolean;
  imageGrid1Url?: string;
  imageGrid1PositionX?: number;
  imageGrid1PositionY?: number;
  imageGrid1Zoom?: number;
  imageGrid1FlipH?: boolean;
  imageGrid1Opacity?: number;
  imageGrid2Url?: string;
  imageGrid2PositionX?: number;
  imageGrid2PositionY?: number;
  imageGrid2Zoom?: number;
  imageGrid2FlipH?: boolean;
  imageGrid2Opacity?: number;
  imageGrid3Url?: string;
  imageGrid3PositionX?: number;
  imageGrid3PositionY?: number;
  imageGrid3Zoom?: number;
  imageGrid3FlipH?: boolean;
  imageGrid3Opacity?: number;
  imageGrid4Url?: string;

  // Content Box
  contentGlass?: boolean;
  contentGlassRadius?: number;
  contentGlassOpacity?: number;

  // Badges
  showProfileBadge?: boolean;
  profileBadgeHandle?: string;
  profileBadgePhotoUrl?: string;
  profileBadgeStyle?: 'glass' | 'solid' | 'minimal';
  profileBadgeSize?: number;
  profileBadgeSizeLocal?: number;
  profileBadgeRadius?: number;

  showLogoBadge?: boolean;
  logoBadgeUrl?: string;
  logoBadgeFile?: string;
  logoBadgeStyle?: 'glass' | 'solid' | 'minimal';
  logoBadgePosition?: string;
  logoBadgeSize?: number;
  logoBadgeSizeLocal?: number;
  logoBadgeRadius?: number;
  logoBadgeX?: number;
  logoBadgeY?: number;

  // Buttons/CTAs
  showButtons?: boolean;
  buttonStyle?: 'solid' | 'outline' | 'glass';
  buttonBorderRadius?: number;
  buttonFontSize?: number;
  button1?: {
    label: string;
    variant: 'primary' | 'secondary';
    icon: string;
  };
  showButton2?: boolean;
  button2?: {
    label: string;
    variant: 'primary' | 'secondary';
    icon: string;
  };

  // Typography extras
  titleBold?: boolean;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  titleStrikethrough?: boolean;
  titleTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  subtitleBold?: boolean;
  subtitleItalic?: boolean;
  subtitleUnderline?: boolean;
  subtitleStrikethrough?: boolean;
  subtitleTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  showTextShadows?: boolean;
  lineHeight?: number;

  // Content layout
  contentMarginH?: number;
  contentMarginV?: number;
  contentLayout?: string;

  // Corners (exact names from competitor source)
  showCorners?: boolean;
  showCarouselDots?: boolean;
  showCornerTL?: boolean;
  showCornerTR?: boolean;
  showCornerBL?: boolean;
  showCornerBR?: boolean;
  cornerTopLeft?: string;
  cornerTopRight?: string;
  cornerBottomLeft?: string;
  cornerBottomRight?: string;
  cornerFontSize?: number;
  cornerInset?: number;
  cornerOpacity?: number;
  cornerGlass?: boolean;
  cornerBorders?: boolean;
  cornerBorderRadius?: number;
  cornerBottomRightIcon?: string;
}

export interface CarouselV2 {
  id?: string;
  title: string;
  postStyle: PostStyle;
  slideFormat: SlideFormat;
  slides: SlideConfig[];
  userId?: string;
}
