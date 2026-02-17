import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Sparkles, Download, Upload, Zap, Palette, Sun, Play,
  ArrowLeft, Copy, Check, Image as ImageIcon, Loader2, Type, Film, Layers,
  Ban, Scale, Hash, Monitor, Clock, FileVideo, Thermometer, CloudRain, User, Music,
  RotateCcw, Save, History, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import logo from '@/assets/logo-fontes-graphics.png';
import { supabase } from '@/integrations/supabase/client';

// Import motion videos
import rippleMorphVideo from '@/assets/motion/ripple-morph.webm';
import robotArmVideo from '@/assets/motion/robot-arm.webm';
import snorricamVideo from '@/assets/motion/snorricam.webm';
import setOnFireVideo from '@/assets/motion/set-on-fire.webm';
import orbitRightVideo from '@/assets/motion/orbit-right.webm';
import rotateVideo from '@/assets/motion/rotate.webm';
import eyesInVideo from '@/assets/motion/eyes-in.webm';
import mediumZoomInVideo from '@/assets/motion/medium-zoom-in.webm';
import mouthInVideo from '@/assets/motion/mouth-in.webm';
import nightVideo from '@/assets/motion/night.webm';
import lazySusanVideo from '@/assets/motion/lazy-susan.webm';
import dollyOutVideo from '@/assets/motion/dolly-out.webm';
import dutchAngleVideo from '@/assets/motion/dutch-angle.webm';
import handheldVideo from '@/assets/motion/handheld.webm';
import orbitLeftVideo from '@/assets/motion/orbit-left.webm';
import craneUpVideo from '@/assets/motion/crane-up.webm';
import dollyInVideo from '@/assets/motion/dolly-in.webm';
import dollyLeftVideo from '@/assets/motion/dolly-left.webm';
import dollyRightVideo from '@/assets/motion/dolly-right.webm';
import explosionVideo from '@/assets/motion/explosion.webm';
import metalVideo from '@/assets/motion/metal.webm';
import tiltUpVideo from '@/assets/motion/tilt-up.webm';
import craneDownVideo from '@/assets/motion/crane-down.webm';
import lensCrackVideo from '@/assets/motion/lens-crack.webm';
import floodVideo from '@/assets/motion/flood.webm';
import crashZoomOutVideo from '@/assets/motion/crash-zoom-out.webm';
import disintegrationVideo from '@/assets/motion/disintegration.webm';
import craneOverHeadVideo from '@/assets/motion/crane-over-head.webm';
import freezingVideo from '@/assets/motion/freezing.webm';
import lightMorphVideo from '@/assets/motion/light-morph.webm';
import bulletTimeVideo from '@/assets/motion/bullet-time.webm';

interface PromptGeneratorProps {
  onGerar?: () => void;
}

const PromptGenerator = ({ onGerar }: PromptGeneratorProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzing2, setAnalyzing2] = useState(false);
  const [analyzingCross, setAnalyzingCross] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageDescription, setImageDescription] = useState('');
  const [imageDescription2, setImageDescription2] = useState('');
  const [crossAnalysis, setCrossAnalysis] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Modo de geração: text-to-video, image-to-video, frames-to-video
  const [generationMode, setGenerationMode] = useState<'text-to-video' | 'image-to-video' | 'frames-to-video'>('text-to-video');

  const [selectedOptions, setSelectedOptions] = useState({
    ai: 'veo3',
    motionControl: 'none',
    cameraAngle: 'eye-level',
    lighting: 'natural',
    animationStyle: 'realistic',
    aesthetic: 'realistic',
    transitionSpeed: 'media'
  });

  // Opções Avançadas
  const [advancedOptions, setAdvancedOptions] = useState({
    negativePrompt: '',
    promptWeights: {} as Record<string, number>,
    seed: '',
    aspectRatio: '16:9',
    duration: '5s',
    resolution: '1080p',
    colorGrading: 'none',
    weather: 'none',
    characterConsistency: '',
    audioSuggestion: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [promptHistory, setPromptHistory] = useState<Array<{ prompt: string, timestamp: Date, settings: any }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [promptLanguage, setPromptLanguage] = useState<'en' | 'pt'>('pt');

  // Velocidades de transição para Frames to Video
  const transitionSpeeds = [
    { value: 'lenta', label: 'Lenta', description: 'Transição suave e contemplativa', icon: '🐢' },
    { value: 'media', label: 'Média', description: 'Velocidade balanceada', icon: '🚶' },
    { value: 'rapida', label: 'Rápida', description: 'Transição dinâmica e energética', icon: '⚡' },
    { value: 'rotacao-3d', label: 'Rotação 3D', description: 'Transição com rotação tridimensional', icon: '🔄' }
  ];

  // Aspect Ratios
  const aspectRatios = [
    { value: '16:9', label: '16:9', description: 'Widescreen (YouTube, TV)' },
    { value: '9:16', label: '9:16', description: 'Vertical (TikTok, Reels)' },
    { value: '1:1', label: '1:1', description: 'Quadrado (Instagram)' },
    { value: '4:3', label: '4:3', description: 'Clássico' },
    { value: '21:9', label: '21:9', description: 'Ultrawide (Cinema)' },
    { value: '2.35:1', label: '2.35:1', description: 'Cinemascope' }
  ];

  // Durações
  const durations = [
    { value: '3s', label: '3s', description: 'Curto' },
    { value: '5s', label: '5s', description: 'Padrão' },
    { value: '10s', label: '10s', description: 'Médio' },
    { value: '15s', label: '15s', description: 'Longo' },
    { value: '30s', label: '30s', description: 'Extenso' }
  ];

  // Resoluções
  const resolutions = [
    { value: '720p', label: '720p', description: 'HD' },
    { value: '1080p', label: '1080p', description: 'Full HD' },
    { value: '2K', label: '2K', description: 'Quad HD' },
    { value: '4K', label: '4K', description: 'Ultra HD' }
  ];

  // Color Grading
  const colorGradings = [
    { value: 'none', label: 'Nenhum', description: 'Cores naturais' },
    { value: 'cinematic', label: 'Cinematográfico', description: 'Teal & Orange' },
    { value: 'vintage', label: 'Vintage', description: 'Tons sépia e desbotados' },
    { value: 'noir', label: 'Film Noir', description: 'Alto contraste B&W' },
    { value: 'warm', label: 'Quente', description: 'Tons dourados' },
    { value: 'cool', label: 'Frio', description: 'Tons azulados' },
    { value: 'neon', label: 'Neon', description: 'Cores vibrantes e saturadas' },
    { value: 'pastel', label: 'Pastel', description: 'Cores suaves e delicadas' },
    { value: 'bleach-bypass', label: 'Bleach Bypass', description: 'Dessaturado com contraste' }
  ];

  // Weather/Environment
  const weatherOptions = [
    { value: 'none', label: 'Nenhum', description: 'Sem especificação' },
    { value: 'sunny', label: 'Ensolarado', description: 'Céu limpo, luz forte' },
    { value: 'cloudy', label: 'Nublado', description: 'Luz difusa' },
    { value: 'rainy', label: 'Chuvoso', description: 'Chuva visível' },
    { value: 'stormy', label: 'Tempestade', description: 'Raios e vento forte' },
    { value: 'foggy', label: 'Neblina', description: 'Atmosfera misteriosa' },
    { value: 'snowy', label: 'Neve', description: 'Flocos de neve caindo' },
    { value: 'golden-hour', label: 'Golden Hour', description: 'Luz dourada do entardecer' },
    { value: 'blue-hour', label: 'Blue Hour', description: 'Luz azulada do crepúsculo' },
    { value: 'night', label: 'Noite', description: 'Escuridão com luzes artificiais' }
  ];

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [exportFormat, setExportFormat] = useState('text');

  // Plataformas AI — Guidelines completas baseadas nas políticas oficiais de cada plataforma
  const aiPlatforms: Record<string, { name: string; maxLength: number; guidelines: string; forbidden: string[] }> = {
    veo3: {
      name: 'Google Veo 3',
      maxLength: 500,
      guidelines: 'Use linguagem NATURAL e DESCRITIVA como um diretor de fotografia. Estruture: [tipo de shot + câmera] → [sujeito] → [ação com verbos] → [ambiente + hora] → [iluminação técnica] → [atmosfera]. Máx 500 chars. Evite conceitos abstratos — foque em VISUAL. Descreva materiais, texturas e pesos. Inclua sugestão de áudio ambiente quando relevante. O Veo 3 é um motor de renderização — quanto mais precisa a descrição visual, melhor o resultado.',
      forbidden: ['violent', 'violence', 'gore', 'blood', 'kill', 'murder', 'weapon', 'gun', 'knife', 'bomb', 'explicit', 'nude', 'nudity', 'sexual', 'porn', 'erotic', 'nsfw', 'political figures', 'politician', 'president', 'copyrighted characters', 'disney', 'marvel', 'mario', 'pokemon', 'suicide', 'self-harm', 'drugs', 'illegal', 'terrorist', 'hate', 'racist', 'discrimination', 'child abuse', 'minor', 'deepfake', 'real person name', 'celebrity name']
    },
    kling: {
      name: 'Kling AI',
      maxLength: 400,
      guidelines: 'Use TIMELINE BEATS com tempos específicos (0-3s, 3-5s). Estruture: Beat [tempo]: [câmera] + [ação]. Adicione Audio: [tempo]: [SFX descrição]. Seja objetivo e claro — sem abstrações. Descreva expressões faciais e gestos para lip sync. O Kling é forte em sincronização com áudio e consistência de personagem.',
      forbidden: ['violence', 'nudity', 'political content', 'brand names', 'copyrighted', 'explicit', 'gore', 'weapon', 'hate speech', 'terrorism', 'drugs', 'self-harm', 'child exploitation', 'deepfake', 'real celebrities']
    },
    runway: {
      name: 'Runway Gen-3',
      maxLength: 350,
      guidelines: 'Use sintaxe FORCE-REACTION — descreva FÍSICA, não apenas aparência. Camera tokens: pan, truck, dolly in/out, boom up/down, tilt. Descreva peso (heavy/dense/solid), momentum, resistência. Materiais: rigidez, flexibilidade. Cada objeto precisa de propriedades físicas para evitar morphing. O Runway é um ESCULTOR CINÉTICO.',
      forbidden: ['explicit content', 'real people names', 'violence', 'gore', 'nudity', 'weapon', 'harmful', 'copyrighted characters', 'hate', 'terrorism', 'drugs', 'child safety', 'deepfake', 'political figures']
    },
    pika: {
      name: 'Pika Labs',
      maxLength: 300,
      guidelines: 'Seja DIRETO e VISUAL. Frases curtas. Estruture: [shot type] + [sujeito] + [ação simples] + [ambiente] + [luz]. Menos é mais — o Pika prefere prompts concisos e descritivos. Aceita termos de câmera básicos. Evite longas descrições — foque no essencial visual.',
      forbidden: ['harmful content', 'copyrighted material', 'violence', 'nudity', 'explicit', 'weapon', 'drugs', 'hate', 'terrorism', 'child exploitation', 'real people', 'deepfake', 'gore']
    },
    leonardo: {
      name: 'Leonardo.ai',
      maxLength: 450,
      guidelines: 'Suporta MOTION CONTROLS AVANÇADOS e descrição técnica detalhada. Estruture em camadas: [motion type + intensidade] → [composição técnica] → [estilo visual com referências] → [materiais e texturas] → [iluminação com setup]. Termos técnicos de fotografia e cinema são bem-vindos. O Leonardo é forte em detalhes de materiais e rendering.',
      forbidden: ['explicit content', 'violence', 'copyrighted material', 'nudity', 'gore', 'weapon', 'hate speech', 'terrorism', 'drugs', 'child safety', 'deepfake', 'real celebrities', 'political figures']
    }
  };

  // Motion Controls completos (41) com vídeos de referência cinematográfica
  const motionControls = [
    { value: 'none', label: 'None', description: 'Sem movimento', preview: '🚫', video: '' },
    { value: 'bullet-time', label: 'Bullet Time', description: 'Tempo congelado com rotação ao redor', preview: '🎯', video: bulletTimeVideo },
    { value: 'crane-down', label: 'Crane Down', description: 'Descida vertical da câmera', preview: '⬇️', video: craneDownVideo },
    { value: 'crane-over-head', label: 'Crane Over Head', description: 'Passa por cima do assunto', preview: '🔄', video: craneOverHeadVideo },
    { value: 'crane-up', label: 'Crane Up', description: 'Elevação vertical da câmera', preview: '⬆️', video: craneUpVideo },
    { value: 'crash-zoom-in', label: 'Crash Zoom In', description: 'Zoom rápido para dentro', preview: '⚡➡️', video: '' },
    { value: 'crash-zoom-out', label: 'Crash Zoom Out', description: 'Zoom rápido para fora', preview: '⚡⬅️', video: crashZoomOutVideo },
    { value: 'disintegration', label: 'Disintegration', description: 'Efeito de desintegração', preview: '✨', video: disintegrationVideo },
    { value: 'dolly-in', label: 'Dolly In', description: 'Aproximação suave', preview: '➡️', video: dollyInVideo },
    { value: 'dolly-left', label: 'Dolly Left', description: 'Movimento para esquerda', preview: '⬅️', video: dollyLeftVideo },
    { value: 'dolly-out', label: 'Dolly Out', description: 'Afastamento suave', preview: '⬅️', video: dollyOutVideo },
    { value: 'dolly-right', label: 'Dolly Right', description: 'Movimento para direita', preview: '➡️', video: dollyRightVideo },
    { value: 'dutch-angle', label: 'Dutch Angle', description: 'Câmera inclinada', preview: '🔄', video: dutchAngleVideo },
    { value: 'explosion', label: 'Explosion', description: 'Efeito de explosão', preview: '💥', video: explosionVideo },
    { value: 'eyes-in', label: 'Eyes In', description: 'Zoom nos olhos', preview: '👁️', video: eyesInVideo },
    { value: 'flood', label: 'Flood', description: 'Efeito de inundação', preview: '🌊', video: floodVideo },
    { value: 'freezing', label: 'Freezing', description: 'Efeito de congelamento', preview: '❄️', video: freezingVideo },
    { value: 'handheld', label: 'Handheld', description: 'Câmera na mão, tremido natural', preview: '🤳', video: handheldVideo },
    { value: 'lazy-susan', label: 'Lazy Susan', description: 'Rotação lenta 360°', preview: '🔄', video: lazySusanVideo },
    { value: 'lens-crack', label: 'Lens Crack', description: 'Efeito de lente rachada', preview: '💔', video: lensCrackVideo },
    { value: 'light-morph', label: 'Light Morph', description: 'Transformação de luz', preview: '💡', video: lightMorphVideo },
    { value: 'medium-zoom-in', label: 'Medium Zoom In', description: 'Zoom moderado para dentro', preview: '🔍', video: mediumZoomInVideo },
    { value: 'metal', label: 'Metal', description: 'Efeito metalizado', preview: '⚙️', video: metalVideo },
    { value: 'mouth-in', label: 'Mouth In', description: 'Zoom na boca', preview: '👄', video: mouthInVideo },
    { value: 'night', label: 'Night', description: 'Transição para noite', preview: '🌙', video: nightVideo },
    { value: 'orbit-left', label: 'Orbit Left', description: 'Órbita anti-horária', preview: '↪️', video: orbitLeftVideo },
    { value: 'orbit-right', label: 'Orbit Right', description: 'Órbita horária', preview: '↩️', video: orbitRightVideo },
    { value: 'ripple-morph', label: 'Ripple Morph', description: 'Efeito de ondulação', preview: '〰️', video: rippleMorphVideo },
    { value: 'robo-arm', label: 'Robo Arm', description: 'Movimento robótico preciso', preview: '🤖', video: robotArmVideo },
    { value: 'rotate', label: 'Rotate', description: 'Rotação completa', preview: '🔄', video: rotateVideo },
    { value: 'set-on-fire', label: 'Set on Fire', description: 'Efeito de fogo', preview: '🔥', video: setOnFireVideo },
    { value: 'snorricam', label: 'Snorricam', description: 'Câmera fixa no rosto, fundo gira', preview: '🎭', video: snorricamVideo },
    { value: 'super-dolly-in', label: 'Super Dolly In', description: 'Aproximação extrema', preview: '⚡➡️', video: '' },
    { value: 'super-dolly-out', label: 'Super Dolly Out', description: 'Afastamento extremo', preview: '⚡⬅️', video: '' },
    { value: 'tattoo-motion', label: 'Tattoo Motion', description: 'Movimento de tatuagem', preview: '🎨', video: '' },
    { value: 'thunder-god', label: 'Thunder God', description: 'Efeito de raios', preview: '⚡', video: '' },
    { value: 'tilt-down', label: 'Tilt Down', description: 'Inclinação para baixo', preview: '⤵️', video: '' },
    { value: 'tilt-up', label: 'Tilt Up', description: 'Inclinação para cima', preview: '⤴️', video: tiltUpVideo },
    { value: 'touch-glass', label: 'Touch Glass', description: 'Efeito de toque em vidro', preview: '👆', video: '' },
    { value: 'yoyo-zoom', label: 'YoYo Zoom', description: 'Zoom vai e volta', preview: '↔️', video: '' },
    { value: 'pan-left', label: 'Pan Left', description: 'Panorâmica para esquerda', preview: '⬅️', video: '' },
    { value: 'pan-right', label: 'Pan Right', description: 'Panorâmica para direita', preview: '➡️', video: '' }
  ];

  // Ângulos de Câmera (10)
  const cameraAngles = [
    { value: 'low-angle-closeup', label: 'Low-Angle Close-Up', description: 'Ângulo baixo, plano fechado', icon: '📐⬆️', technical: 'Câmera abaixo do nível dos olhos, enquadramento fechado' },
    { value: 'eye-level', label: 'Eye-Level', description: 'Altura dos olhos, neutro', icon: '👁️', technical: 'Câmera na altura dos olhos do assunto' },
    { value: 'eye-level-high-angle', label: 'Eye-Level High Angle', description: 'Altura dos olhos com ângulo superior', icon: '📐⬇️', technical: 'Nível dos olhos mas levemente acima' },
    { value: 'tight-closeup', label: 'Tight Close-Up', description: 'Plano bem fechado', icon: '🔍', technical: 'Enquadramento muito próximo, detalhes' },
    { value: 'three-quarter-side', label: 'Three-Quarter Side Shot', description: 'Ângulo de 3/4', icon: '↗️', technical: '45 graus em relação ao assunto' },
    { value: 'full-body-wide', label: 'Full-Body Wide Shot', description: 'Corpo inteiro, plano aberto', icon: '📏', technical: 'Enquadramento completo do corpo' },
    { value: 'high-angle', label: 'High Angle', description: 'Ângulo superior', icon: '⬇️', technical: 'Câmera acima olhando para baixo' },
    { value: 'birds-eye', label: "Bird's Eye View", description: 'Vista aérea', icon: '🦅', technical: 'Câmera diretamente acima' },
    { value: 'worms-eye', label: "Worm's Eye View", description: 'Vista de baixo', icon: '🐛', technical: 'Câmera diretamente abaixo' },
    { value: 'over-shoulder', label: 'Over-the-Shoulder', description: 'Por cima do ombro', icon: '👤', technical: 'Enquadramento por trás de um personagem' }
  ];

  // Iluminação (12)
  const lightingSetups = [
    { value: 'natural', label: 'Natural Light', description: 'Luz natural, sem setup', icon: '☀️', technical: 'Janelas, luz do dia, sem modificadores' },
    { value: 'strip', label: 'Strip Light', description: 'Luz em tira, estreita e direcional', icon: '🟫', technical: 'Softbox alongada, acentua contornos' },
    { value: 'beauty-dish', label: 'Beauty Dish', description: 'Luz suave e envolvente', icon: '⚪', technical: 'Refletor côncavo, luz de beleza clássica' },
    { value: 'octabox', label: 'Octabox', description: 'Luz suave octagonal', icon: '⬡', technical: 'Softbox de 8 lados, catchlight redondo' },
    { value: 'panela', label: 'Panela (Reflector Dish)', description: 'Luz dura e direcional', icon: '🔆', technical: 'Refletor parabólico, luz dura' },
    { value: 'bolao', label: 'Bolão (Lantern)', description: 'Luz 360° suave e omnidirecional', icon: '🏮', technical: 'Lanterna chinesa, iluminação global' },
    { value: 'softbox', label: 'Softbox', description: 'Luz suave retangular', icon: '▭', technical: 'Difusor retangular, luz suave' },
    { value: 'umbrella', label: 'Umbrella', description: 'Guarda-chuva difusor', icon: '☂️', technical: 'Luz rebatida ou difusa' },
    { value: 'ring-light', label: 'Ring Light', description: 'Luz circular sem sombras', icon: '⭕', technical: 'LED circular, catchlight característico' },
    { value: 'rim-light', label: 'Rim Light', description: 'Luz de contorno', icon: '◐', technical: 'Luz traseira, separa do fundo' },
    { value: 'three-point', label: 'Three-Point Lighting', description: 'Setup clássico de 3 luzes', icon: '△', technical: 'Key + Fill + Back light' },
    { value: 'dramatic', label: 'Dramatic/Low Key', description: 'Iluminação dramática, sombras fortes', icon: '🌓', technical: 'Alto contraste, sombras profundas' }
  ];

  const animationStyles = [
    { value: 'realistic', label: 'Realista', description: 'Máxima fidelidade à realidade' },
    { value: 'stylized', label: 'Estilizado', description: 'Interpretação artística' },
    { value: 'semi-realistic', label: 'Semi-Realista', description: 'Realismo com toque artístico' },
    { value: 'surreal', label: 'Surreal', description: 'Elementos fantásticos' },
    { value: 'hyperrealistic', label: 'Hiper-Realista', description: 'Realismo extremo, detalhes intensos' }
  ];

  const aesthetics = [
    { value: 'realistic', label: 'Realista', description: 'Fidelidade máxima' },
    { value: 'minimalist', label: 'Minimalista', description: 'Simplicidade e limpeza' },
    { value: 'vibrant', label: 'Vibrante', description: 'Cores intensas' },
    { value: 'moody', label: 'Atmosférico', description: 'Tons sombrios' },
    { value: 'bright', label: 'Iluminado', description: 'Alto brilho' },
    { value: 'cinematic', label: 'Cinematográfico', description: 'Estilo de cinema' },
    { value: 'vintage', label: 'Vintage', description: 'Estética retrô' }
  ];

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // Análise de imagem única
  const analyzeImage = async (file: File, imageNumber: 1 | 2 = 1) => {
    if (imageNumber === 1) {
      setAnalyzing(true);
    } else {
      setAnalyzing2(true);
    }
    try {
      const base64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'analyze',
          imageBase64: base64,
          imageType: file.type
        }
      });

      if (error) throw error;

      if (imageNumber === 1) {
        setImageDescription(data.result);
      } else {
        setImageDescription2(data.result);
      }
      toast.success(`Imagem ${imageNumber} analisada com sucesso!`);

      // Se ambas as imagens estiverem carregadas no modo frames-to-video, fazer análise cruzada
      if (generationMode === 'frames-to-video') {
        if (imageNumber === 1 && image2) {
          analyzeCrossImages(file, image2);
        } else if (imageNumber === 2 && image) {
          analyzeCrossImages(image, file);
        }
      }

    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      toast.error('Erro ao analisar a imagem. Tente novamente.');
      if (imageNumber === 1) {
        setImageDescription('');
      } else {
        setImageDescription2('');
      }
    } finally {
      if (imageNumber === 1) {
        setAnalyzing(false);
      } else {
        setAnalyzing2(false);
      }
    }
  };

  // Análise cruzada de duas imagens
  const analyzeCrossImages = async (file1: File, file2: File) => {
    setAnalyzingCross(true);
    try {
      const base64_1 = await fileToBase64(file1);
      const base64_2 = await fileToBase64(file2);

      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'analyze-cross',
          imageBase64: base64_1,
          imageType: file1.type,
          imageBase64_2: base64_2,
          imageType2: file2.type
        }
      });

      if (error) throw error;

      setCrossAnalysis(data.result);
      toast.success('Análise cruzada concluída!');

    } catch (error) {
      console.error('Erro na análise cruzada:', error);
      toast.error('Erro na análise cruzada.');
    } finally {
      setAnalyzingCross(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      analyzeImage(file, 1);
    }
  };

  const handleImage2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage2(file);
      setImagePreview2(URL.createObjectURL(file));
      analyzeImage(file, 2);
    }
  };

  // Geração do prompt
  const generatePrompt = async () => {
    setGenerating(true);

    try {
      const platform = aiPlatforms[selectedOptions.ai];
      const motion = motionControls.find(m => m.value === selectedOptions.motionControl)!;
      const angle = cameraAngles.find(a => a.value === selectedOptions.cameraAngle)!;
      const lighting = lightingSetups.find(l => l.value === selectedOptions.lighting)!;
      const animation = animationStyles.find(a => a.value === selectedOptions.animationStyle)!;
      const aesthetic = aesthetics.find(a => a.value === selectedOptions.aesthetic)!;

      // Montar descrição combinada para frames-to-video
      let combinedDescription = imageDescription;
      if (generationMode === 'frames-to-video' && imageDescription2) {
        const speedLabel = transitionSpeeds.find(s => s.value === selectedOptions.transitionSpeed);
        const speedText = speedLabel ? `Velocidade: ${speedLabel.label} (${speedLabel.description})` : '';
        combinedDescription = `[FRAME INICIAL] ${imageDescription}\n\n[FRAME FINAL] ${imageDescription2}\n\n[TRANSIÇÃO] ${speedText}`;

        // Adicionar análise cruzada se disponível
        if (crossAnalysis) {
          combinedDescription += `\n\n[ANÁLISE CRUZADA DAS IMAGENS]\n${crossAnalysis}`;
        }

        combinedDescription += '\n\nCriar uma transição cinematográfica fluida entre os dois frames.';
      }

      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'generate',
          imageDescription: combinedDescription,
          imageDescription2: generationMode === 'frames-to-video' ? imageDescription2 : undefined,
          generationMode,
          options: {
            platform,
            motion,
            angle,
            lighting,
            animation,
            aesthetic,
            transitionSpeed: selectedOptions.transitionSpeed,
            generationMode,
            language: promptLanguage
          },
          advancedOptions
        }
      });

      if (error) throw error;

      setGeneratedPrompt(data.result);

      // Salvar no histórico
      setPromptHistory(prev => [{
        prompt: data.result,
        timestamp: new Date(),
        settings: { ...selectedOptions, ...advancedOptions }
      }, ...prev.slice(0, 9)]);

      toast.success('Prompt gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar prompt:', error);
      toast.error('Erro ao gerar prompt. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  // Generate Image with Lovable AI
  const generateImageFromPrompt = async () => {
    if (!generatedPrompt) {
      toast.error('Gere um prompt primeiro!');
      return;
    }

    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-generator', {
        body: {
          action: 'generate-image',
          prompt: generatedPrompt
        }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success('Imagem gerada com sucesso!');
      } else {
        toast.error('Nenhuma imagem retornada');
      }

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.error('Erro ao gerar imagem. Tente novamente.');
    } finally {
      setGeneratingImage(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Prompt copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset all
  const resetAll = () => {
    setImage(null);
    setImagePreview(null);
    setImage2(null);
    setImagePreview2(null);
    setImageDescription('');
    setImageDescription2('');
    setCrossAnalysis('');
    setGeneratedPrompt('');
    setGeneratedImageUrl(null);
    setAdvancedOptions({
      negativePrompt: '',
      promptWeights: {},
      seed: '',
      aspectRatio: '16:9',
      duration: '5s',
      resolution: '1080p',
      colorGrading: 'none',
      weather: 'none',
      characterConsistency: '',
      audioSuggestion: ''
    });
    toast.success('Tudo resetado!');
  };

  // Load from history
  const loadFromHistory = (item: typeof promptHistory[0]) => {
    setGeneratedPrompt(item.prompt);
    setSelectedOptions(prev => ({
      ...prev,
      ...item.settings
    }));
    setShowHistory(false);
    toast.success('Prompt carregado do histórico!');
  };

  // Export
  const exportPrompt = () => {
    const platform = aiPlatforms[selectedOptions.ai];

    if (exportFormat === 'json') {
      const jsonData = {
        platform: platform.name,
        prompt: generatedPrompt,
        settings: {
          motionControl: selectedOptions.motionControl,
          cameraAngle: selectedOptions.cameraAngle,
          lighting: selectedOptions.lighting,
          animationStyle: selectedOptions.animationStyle,
          aesthetic: selectedOptions.aesthetic,
          transitionSpeed: selectedOptions.transitionSpeed
        },
        advancedSettings: advancedOptions,
        imageDescription: imageDescription,
        imageDescription2: imageDescription2,
        crossAnalysis: crossAnalysis,
        timestamp: new Date().toISOString(),
        metadata: {
          maxLength: platform.maxLength,
          guidelines: platform.guidelines
        }
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-${selectedOptions.ai}-${Date.now()}.json`;
      a.click();
    } else {
      const textData = `=== PROMPT GERADO ===
Plataforma: ${platform.name}
Data: ${new Date().toLocaleString('pt-BR')}

PROMPT:
${generatedPrompt}

CONFIGURAÇÕES TÉCNICAS:
- Motion Control: ${selectedOptions.motionControl}
- Ângulo: ${selectedOptions.cameraAngle}
- Iluminação: ${selectedOptions.lighting}
- Animação: ${selectedOptions.animationStyle}
- Estética: ${selectedOptions.aesthetic}
- Velocidade Transição: ${selectedOptions.transitionSpeed}

CONFIGURAÇÕES AVANÇADAS:
- Aspect Ratio: ${advancedOptions.aspectRatio}
- Duração: ${advancedOptions.duration}
- Resolução: ${advancedOptions.resolution}
- Color Grading: ${advancedOptions.colorGrading}
- Clima: ${advancedOptions.weather}
${advancedOptions.negativePrompt ? `- Negative Prompt: ${advancedOptions.negativePrompt}` : ''}
${advancedOptions.seed ? `- Seed: ${advancedOptions.seed}` : ''}
${advancedOptions.characterConsistency ? `- Personagem: ${advancedOptions.characterConsistency}` : ''}
${advancedOptions.audioSuggestion ? `- Áudio: ${advancedOptions.audioSuggestion}` : ''}

DESCRIÇÃO IMAGEM 1:
${imageDescription || 'Sem imagem de referência'}

${imageDescription2 ? `DESCRIÇÃO IMAGEM 2:\n${imageDescription2}` : ''}

${crossAnalysis ? `ANÁLISE CRUZADA:\n${crossAnalysis}` : ''}
`;

      const blob = new Blob([textData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-${selectedOptions.ai}-${Date.now()}.txt`;
      a.click();
    }
    toast.success('Arquivo baixado!');
  };

  return (
    <div className="min-h-screen bg-black text-white dark">
      {/* Header */}
      <header className="bg-primary py-3 px-4 sm:py-4 sm:px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-black hover:bg-black/20 h-8 w-8 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <img src={logo} alt="Fontes Graphics" className="h-7 sm:h-10" />
            <div className="border-l border-black/30 pl-2 sm:pl-4">
              <h1 className="text-xs sm:text-lg font-bold flex items-center gap-1 sm:gap-2 text-black">
                <Sparkles className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">GERADOR PREMIUM PRO MAX</span>
                <span className="sm:hidden">GERADOR PRO</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-black hover:bg-black/20 h-7 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm"
            >
              <History className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="text-black hover:bg-black/20 h-7 px-2 sm:h-9 sm:px-3 text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>
      </header>

      {/* History Panel */}
      {showHistory && promptHistory.length > 0 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border-2 border-primary p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Prompts
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>✕</Button>
            </div>
            <div className="space-y-3">
              {promptHistory.map((item, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 p-4 rounded-xl border border-primary/30 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => loadFromHistory(item)}
                >
                  <p className="text-xs text-zinc-400 mb-2">
                    {item.timestamp.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-white line-clamp-3">{item.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-4">
            {/* Modo de Geração */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Film className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Passo 1</span>
                  <h2 className="text-lg font-semibold text-white">Modo de Geração</h2>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setGenerationMode('text-to-video')}
                  className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1.5 ${generationMode === 'text-to-video'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                  <Type className="w-5 h-5" />
                  <span className="text-xs font-medium">Text to Video</span>
                </button>

                <button
                  onClick={() => setGenerationMode('image-to-video')}
                  className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1.5 ${generationMode === 'image-to-video'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Image to Video</span>
                </button>

                {selectedOptions.ai === 'veo3' && (
                  <button
                    onClick={() => setGenerationMode('frames-to-video')}
                    className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1.5 ${generationMode === 'frames-to-video'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span className="text-xs font-medium">Frames to Video</span>
                  </button>
                )}
              </div>

              {selectedOptions.ai !== 'veo3' && (
                <p className="text-zinc-500 text-xs mt-3 text-center">
                  Selecione Veo 3 para habilitar transição entre 2 imagens
                </p>
              )}
            </div>

            {/* Upload de Imagem(s) - Condicional */}
            {generationMode !== 'text-to-video' && (
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Passo 2</span>
                    <h2 className="text-lg font-semibold text-white">
                      {generationMode === 'frames-to-video' ? 'Upload das Imagens' : 'Upload da Imagem'}
                    </h2>
                  </div>
                </div>

                <div className={`grid gap-3 ${generationMode === 'frames-to-video' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Imagem 1 */}
                  <div className="space-y-2">
                    {generationMode === 'frames-to-video' && (
                      <p className="text-zinc-400 text-xs font-medium text-center">Frame Inicial</p>
                    )}
                    <div className="border border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-primary/50 hover:bg-zinc-800/50 transition-all cursor-pointer bg-zinc-800/30">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="mx-auto max-h-24 rounded-lg object-cover" />
                        ) : (
                          <>
                            <Camera className="w-8 h-8 mx-auto mb-1.5 text-zinc-500" />
                            <p className="text-zinc-400 text-xs">Clique para upload</p>
                          </>
                        )}
                      </label>
                    </div>
                    {analyzing && (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Analisando...</span>
                      </div>
                    )}
                  </div>

                  {/* Imagem 2 - Frames to Video */}
                  {generationMode === 'frames-to-video' && (
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-xs font-medium text-center">Frame Final</p>
                      <div className="border border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-primary/50 hover:bg-zinc-800/50 transition-all cursor-pointer bg-zinc-800/30">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImage2Upload}
                          className="hidden"
                          id="image-upload-2"
                        />
                        <label htmlFor="image-upload-2" className="cursor-pointer block">
                          {imagePreview2 ? (
                            <img src={imagePreview2} alt="Preview 2" className="mx-auto max-h-24 rounded-lg object-cover" />
                          ) : (
                            <>
                              <Camera className="w-8 h-8 mx-auto mb-1.5 text-zinc-500" />
                              <p className="text-zinc-400 text-xs">Clique para upload</p>
                            </>
                          )}
                        </label>
                      </div>
                      {analyzing2 && (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs">Analisando...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Análise Cruzada */}
                {generationMode === 'frames-to-video' && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-zinc-400 text-xs font-medium mb-2">Velocidade da Transição</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {transitionSpeeds.map((speed) => (
                        <button
                          key={speed.value}
                          onClick={() => setSelectedOptions({ ...selectedOptions, transitionSpeed: speed.value })}
                          className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-0.5 ${selectedOptions.transitionSpeed === speed.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <span className="text-base">{speed.icon}</span>
                          <span className="text-[10px] font-medium">{speed.label}</span>
                        </button>
                      ))}
                    </div>

                    {analyzingCross && (
                      <div className="flex items-center justify-center gap-2 text-primary mt-3">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Analisando conexões...</span>
                      </div>
                    )}

                    {crossAnalysis && !analyzingCross && (
                      <div className="mt-3 p-2 bg-green-950/50 border border-green-900 rounded-lg">
                        <p className="text-green-400 text-xs flex items-center gap-1">
                          <Check className="w-3 h-3" /> Análise concluída
                        </p>
                      </div>
                    )}

                    {image && image2 && !analyzingCross && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => analyzeCrossImages(image, image2)}
                        className="w-full mt-2 text-zinc-400 hover:text-primary text-xs h-8"
                      >
                        <RotateCcw className="w-3 h-3 mr-1.5" />
                        Refazer Análise
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Platform */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    Passo {generationMode === 'text-to-video' ? '2' : '3'}
                  </span>
                  <h2 className="text-lg font-semibold text-white">Plataforma AI</h2>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(aiPlatforms).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedOptions({ ...selectedOptions, ai: key });
                      if (key !== 'veo3' && generationMode === 'frames-to-video') {
                        setGenerationMode('image-to-video');
                      }
                    }}
                    className={`p-2 rounded-lg border transition-all ${selectedOptions.ai === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                  >
                    <span className="text-xs font-medium">{platform.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Idioma do Prompt */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Type className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    Passo {generationMode === 'text-to-video' ? '3' : '4'}
                  </span>
                  <h2 className="text-lg font-semibold text-white">Idioma do Prompt</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPromptLanguage('pt')}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${promptLanguage === 'pt'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                  <span className="text-lg">🇧🇷</span>
                  <span className="text-sm font-medium">Português</span>
                </button>

                <button
                  onClick={() => setPromptLanguage('en')}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${promptLanguage === 'en'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm font-medium">English</span>
                </button>
              </div>
            </div>

            {/* Opções Avançadas Toggle */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Opções Avançadas</h2>
                </div>
                <span className="text-zinc-400 text-lg">{showAdvanced ? '−' : '+'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-5 space-y-4 pt-4 border-t border-zinc-800">
                  {/* Negative Prompt */}
                  <div>
                    <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                      <Ban className="w-3 h-3" />
                      Prompt Negativo
                    </label>
                    <textarea
                      value={advancedOptions.negativePrompt}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, negativePrompt: e.target.value })}
                      placeholder="blur, low quality, distorted..."
                      className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm resize-none h-16 focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Seed */}
                  <div>
                    <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                      <Hash className="w-3 h-3" />
                      Seed
                    </label>
                    <input
                      type="text"
                      value={advancedOptions.seed}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, seed: e.target.value })}
                      placeholder="12345 (vazio = aleatório)"
                      className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Grid de configurações */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Aspect Ratio */}
                    <div>
                      <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                        <Monitor className="w-3 h-3" />
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {aspectRatios.map((ar) => (
                          <button
                            key={ar.value}
                            onClick={() => setAdvancedOptions({ ...advancedOptions, aspectRatio: ar.value })}
                            className={`p-1.5 rounded border transition-all text-center ${advancedOptions.aspectRatio === ar.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                              }`}
                          >
                            <span className="text-[10px] font-medium">{ar.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                        <Clock className="w-3 h-3" />
                        Duração
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {durations.slice(0, 3).map((d) => (
                          <button
                            key={d.value}
                            onClick={() => setAdvancedOptions({ ...advancedOptions, duration: d.value })}
                            className={`p-1.5 rounded border transition-all text-center ${advancedOptions.duration === d.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                              }`}
                          >
                            <span className="text-[10px] font-medium">{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resolution */}
                  <div>
                    <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                      <FileVideo className="w-3 h-3" />
                      Resolução
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {resolutions.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setAdvancedOptions({ ...advancedOptions, resolution: r.value })}
                          className={`p-1.5 rounded border transition-all text-center ${advancedOptions.resolution === r.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <span className="text-[10px] font-medium">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Grading */}
                  <div>
                    <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                      <Palette className="w-3 h-3" />
                      Color Grading
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {colorGradings.slice(0, 6).map((cg) => (
                        <button
                          key={cg.value}
                          onClick={() => setAdvancedOptions({ ...advancedOptions, colorGrading: cg.value })}
                          className={`p-1.5 rounded border transition-all text-center ${advancedOptions.colorGrading === cg.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <span className="text-[10px] font-medium">{cg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather */}
                  <div>
                    <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                      <CloudRain className="w-3 h-3" />
                      Clima
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {weatherOptions.slice(0, 5).map((w) => (
                        <button
                          key={w.value}
                          onClick={() => setAdvancedOptions({ ...advancedOptions, weather: w.value })}
                          className={`p-1.5 rounded border transition-all text-center ${advancedOptions.weather === w.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                            }`}
                        >
                          <span className="text-[10px] font-medium">{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character & Audio em grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                        <User className="w-3 h-3" />
                        Personagem
                      </label>
                      <input
                        type="text"
                        value={advancedOptions.characterConsistency}
                        onChange={(e) => setAdvancedOptions({ ...advancedOptions, characterConsistency: e.target.value })}
                        placeholder="Descrição..."
                        className="w-full p-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-zinc-300 text-xs font-medium mb-1.5">
                        <Music className="w-3 h-3" />
                        Áudio/SFX
                      </label>
                      <input
                        type="text"
                        value={advancedOptions.audioSuggestion}
                        onChange={(e) => setAdvancedOptions({ ...advancedOptions, audioSuggestion: e.target.value })}
                        placeholder="Sugestão..."
                        className="w-full p-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Motion Control */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white">Motion Control</h2>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {motionControls.map((motion) => (
                  <button
                    key={motion.value}
                    onClick={() => setSelectedOptions({ ...selectedOptions, motionControl: motion.value })}
                    className={`w-full rounded-xl border-2 transition-all overflow-hidden relative group ${selectedOptions.motionControl === motion.value
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                    title={motion.description}
                    style={{ paddingBottom: '100%' }}
                  >
                    {/* Video/Preview Background */}
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                      {motion.video ? (
                        <video
                          src={motion.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                          <span className="text-4xl opacity-50">{motion.preview}</span>
                        </div>
                      )}
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                      <span className={`text-sm font-medium block truncate ${selectedOptions.motionControl === motion.value
                          ? 'text-primary'
                          : 'text-white'
                        }`}>
                        {motion.label}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    {selectedOptions.motionControl === motion.value && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Angle */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white">Ângulo de Câmera</h2>
              </div>

              <div className="grid grid-cols-5 gap-1">
                {cameraAngles.map((angle) => (
                  <button
                    key={angle.value}
                    onClick={() => setSelectedOptions({ ...selectedOptions, cameraAngle: angle.value })}
                    className={`p-1.5 rounded border transition-all text-center ${selectedOptions.cameraAngle === angle.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    title={angle.technical}
                  >
                    <span className="text-sm">{angle.icon}</span>
                    <span className="text-[9px] block truncate">{angle.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Sun className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white">Iluminação</h2>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {lightingSetups.map((light) => (
                  <button
                    key={light.value}
                    onClick={() => setSelectedOptions({ ...selectedOptions, lighting: light.value })}
                    className={`p-1.5 rounded border transition-all text-center ${selectedOptions.lighting === light.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                      }`}
                    title={light.technical}
                  >
                    <span className="text-sm">{light.icon}</span>
                    <span className="text-[9px] block truncate">{light.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Style & Aesthetic em grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-white">Animação</h2>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {animationStyles.slice(0, 6).map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setSelectedOptions({ ...selectedOptions, animationStyle: style.value })}
                      className={`p-1.5 rounded border transition-all text-center ${selectedOptions.animationStyle === style.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                        }`}
                    >
                      <span className="text-[10px] font-medium">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-white">Estética</h2>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {aesthetics.slice(0, 6).map((aes) => (
                    <button
                      key={aes.value}
                      onClick={() => setSelectedOptions({ ...selectedOptions, aesthetic: aes.value })}
                      className={`p-1.5 rounded border transition-all text-center ${selectedOptions.aesthetic === aes.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                        }`}
                    >
                      <span className="text-[10px] font-medium">{aes.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4">
            {/* Generate Button */}
            <Button
              onClick={generatePrompt}
              disabled={generating}
              className="w-full py-5 text-lg font-semibold bg-primary hover:bg-primary/90 text-black rounded-xl shadow-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Prompt
                </>
              )}
            </Button>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Prompt Gerado
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-zinc-400 hover:text-primary h-8"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-3">
                  <p className="text-zinc-200 text-sm whitespace-pre-wrap">{generatedPrompt}</p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs"
                  >
                    <option value="text">TXT</option>
                    <option value="json">JSON</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportPrompt}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                  <Button
                    size="sm"
                    onClick={generateImageFromPrompt}
                    disabled={generatingImage}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />}
                    Imagem
                  </Button>
                </div>
              </div>
            )}

            {/* Generated Image */}
            {generatedImageUrl && (
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-3">Imagem Gerada</h2>
                <img src={generatedImageUrl} alt="Generated" className="w-full rounded-lg border border-zinc-800" />
              </div>
            )}

            {/* Image Descriptions */}
            {imageDescription && (
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-zinc-300 mb-2">
                  {generationMode === 'frames-to-video' ? 'Análise Frame 1' : 'Análise da Imagem'}
                </h2>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs whitespace-pre-wrap">{imageDescription}</p>
                </div>
              </div>
            )}

            {imageDescription2 && (
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-zinc-300 mb-2">Análise Frame 2</h2>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <p className="text-zinc-400 text-xs whitespace-pre-wrap">{imageDescription2}</p>
                </div>
              </div>
            )}

            {crossAnalysis && (
              <div className="bg-zinc-900/80 backdrop-blur-sm border border-green-900/50 rounded-xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold text-green-400 mb-2">Análise Cruzada</h2>
                <div className="bg-zinc-950 p-3 rounded-lg border border-green-900/30">
                  <p className="text-zinc-400 text-xs whitespace-pre-wrap">{crossAnalysis}</p>
                </div>
              </div>
            )}

            {/* Settings Summary */}
            <div className="bg-zinc-900 border-2 border-primary rounded-2xl p-6">
              <h2 className="text-xl font-bold text-primary mb-4">📋 Configurações Atuais</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Plataforma:</span>
                  <span className="text-white ml-2 font-bold">{aiPlatforms[selectedOptions.ai].name}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Motion:</span>
                  <span className="text-white ml-2 font-bold">{selectedOptions.motionControl}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Câmera:</span>
                  <span className="text-white ml-2 font-bold">{selectedOptions.cameraAngle}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Luz:</span>
                  <span className="text-white ml-2 font-bold">{selectedOptions.lighting}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Estilo:</span>
                  <span className="text-white ml-2 font-bold">{selectedOptions.animationStyle}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Estética:</span>
                  <span className="text-white ml-2 font-bold">{selectedOptions.aesthetic}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Ratio:</span>
                  <span className="text-white ml-2 font-bold">{advancedOptions.aspectRatio}</span>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="text-zinc-400">Duração:</span>
                  <span className="text-white ml-2 font-bold">{advancedOptions.duration}</span>
                </div>
              </div>
            </div>

            {/* Platform Guidelines */}
            <div className="bg-zinc-900 border-2 border-primary rounded-2xl p-6">
              <h2 className="text-xl font-bold text-primary mb-3">📖 Diretrizes {aiPlatforms[selectedOptions.ai].name}</h2>
              <p className="text-zinc-300 text-sm mb-2">{aiPlatforms[selectedOptions.ai].guidelines}</p>
              <p className="text-zinc-500 text-xs">
                Limite: {aiPlatforms[selectedOptions.ai].maxLength} caracteres
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-700">
                <p className="text-red-400 text-xs">
                  ⚠️ Evitar: {aiPlatforms[selectedOptions.ai].forbidden.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
