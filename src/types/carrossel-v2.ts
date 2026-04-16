
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

export interface BadgeConfig {
  show: boolean;
  style: 'glass' | 'solid' | 'minimal';
  handle?: string;
  photoUrl?: string;
  logoUrl?: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'free';
  x?: number;
  y?: number;
  radius?: number;
  size?: number;
}

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
  imageGrid2Url?: string;
  imageGrid3Url?: string;

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

  showLogoBadge?: boolean;
  logoBadgeUrl?: string;
  logoBadgePosition?: string;
  logoBadgeSize?: number;

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
}

export interface CarouselV2 {
  id?: string;
  title: string;
  postStyle: PostStyle;
  slideFormat: SlideFormat;
  slides: SlideConfig[];
  userId?: string;
}
