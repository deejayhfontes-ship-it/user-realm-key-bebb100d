import { useState, useCallback, useRef, useEffect } from 'react';
import {
    Sparkles,
    Upload,
    Download,
    Loader2,
    AlertCircle,
    X,
    Image as ImageIcon,
    Copy,
    Check,
    Smartphone,
    Monitor,
    Box,
    RectangleVertical,
    Type,
    Palette,
    Sun,
    Wand2,
    User,
    UserCircle,
    ScanFace,
    MoveHorizontal,
    MoreHorizontal,
    Plus,
    Compass,
    Brush,
    GalleryHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGeminiImageGeneration } from '@/hooks/useGeminiImageGeneration';
import { ForensicPanel } from './ForensicPanel';
import { ImageLightbox } from './ImageLightbox';

// ── Tipos ──
interface ReferenceImage {
    base64: string;
    mimeType: string;
    preview: string;
}

interface GeneratedImage {
    src: string;
    prompt: string;
    timestamp: number;
}

interface DesignerConfig {
    // Sujeito
    subjectImage: ReferenceImage | null;
    quantity: number;
    gender: 'Masculino' | 'Feminino';
    subjectDescription: string;

    // Posição
    position: 'LEFT' | 'CENTER' | 'RIGHT';

    // Dimensões
    dimension: 'STORIES' | 'HORIZONTAL' | 'SQUARE' | 'PORTRAIT';

    // Texto
    useText: boolean;
    textH1: string;
    textH2: string;
    textCTA: string;

    // Projeto & Cenário
    niche: string;
    environment: string;
    useSceneImages: boolean;

    // Cores & Iluminação
    activeColors: {
        ambient: boolean;
        rim: boolean;
        complementary: boolean;
    };
    colors: {
        ambient: string;
        rim: string;
        complementary: string;
    };
    ambientOpacity: number;

    // Composição
    framing: 'CLOSE_UP' | 'MEDIUM' | 'AMERICAN';
    useFloatingElements: boolean;

    // Referências de Estilo
    styleReferences: ReferenceImage[];

    // Atributos Visuais
    sobriety: number;
    useVisualstyle: boolean;
    selectedStyle: string;
    useBlur: boolean;
    useGradient: boolean;

    // Prompt Adicional
    useExtraPrompt: boolean;
    extraPrompt: string;
}

// ── Constantes ──
const DEFAULT_CONFIG: DesignerConfig = {
    subjectImage: null,
    quantity: 1,
    gender: 'Masculino',
    subjectDescription: '',
    position: 'CENTER',
    dimension: 'HORIZONTAL',
    useText: false,
    textH1: '',
    textH2: '',
    textCTA: '',
    niche: '',
    environment: '',
    useSceneImages: false,
    activeColors: { ambient: false, rim: false, complementary: false },
    colors: { ambient: '#000000', rim: '#a3e635', complementary: '#6366f1' },
    ambientOpacity: 50,
    framing: 'MEDIUM',
    useFloatingElements: false,
    styleReferences: [],
    sobriety: 20,
    useVisualstyle: true,
    selectedStyle: 'ultra_realistic',
    useBlur: false,
    useGradient: false,
    useExtraPrompt: false,
    extraPrompt: '',
};

const STYLES = [
    { id: 'classic', label: 'Clássico' },
    { id: 'formal', label: 'Formal' },
    { id: 'elegant', label: 'Elegante' },
    { id: 'sexy', label: 'Sexy' },
    { id: 'institutional', label: 'Institucional' },
    { id: 'tech', label: 'Tecnológico' },
    { id: 'glassmorphism', label: 'Glass' },
    { id: 'ui_interface', label: 'UI' },
    { id: 'minimalist', label: 'Minimal' },
    { id: 'playful', label: 'Lúdico' },
    { id: 'cartoon', label: 'Cartoon' },
    { id: 'infoproduct', label: 'Infoprod' },
    { id: 'jovial', label: 'Jovial' },
    { id: 'gamer', label: 'Gamer' },
    { id: 'pro_portrait', label: 'Retrato' },
    { id: 'ultra_realistic', label: 'Realista' },
    { id: 'glow', label: 'Glow' },
    // ── 6 novos estilos (live bundle concorrente) ──
    { id: 'cinematic_render', label: 'Cinemático' },
    { id: '3d_unreal_engine', label: '3D Unreal' },
    { id: 'cyber_punk', label: 'Cyberpunk' },
    { id: 'minimalist_studio', label: 'Estúdio' },
    { id: 'dark_luxury', label: 'Luxo Dark' },
    { id: 'neon_futuristic', label: 'Neon' },
];

const GALLERY_STORAGE_KEY = 'designer-gallery';
const MAX_GALLERY_ITEMS = 50;

export function DesignerDoFuturoGenerator() {
    const [config, setConfig] = useState<DesignerConfig>(DEFAULT_CONFIG);
    const [gallery, setGallery] = useState<GeneratedImage[]>(() => {
        try {
            const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const refInputRef = useRef<HTMLInputElement>(null);
    const { generate, extractPromptFromImage, brainstormScenes, isGenerating, progress, lastForensicLog } = useGeminiImageGeneration();
    const [refinementText, setRefinementText] = useState('');
    const [forensicOpen, setForensicOpen] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [sidebarTab, setSidebarTab] = useState<'create' | 'explore' | 'gallery'>('create');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Persiste galeria no localStorage
    useEffect(() => {
        try {
            const trimmed = gallery.slice(0, MAX_GALLERY_ITEMS);
            localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.warn('[GALLERY] localStorage cheio, limpando imagens antigas...');
            try {
                const minimal = gallery.slice(0, 10);
                localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(minimal));
            } catch { /* noop */ }
        }
    }, [gallery]);

    // Helpers
    const updateConfig = (key: keyof DesignerConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const updateColor = (key: 'ambient' | 'rim' | 'complementary', value: string) => {
        setConfig(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
    };

    const toggleColor = (key: 'ambient' | 'rim' | 'complementary') => {
        setConfig(prev => ({
            ...prev,
            activeColors: { ...prev.activeColors, [key]: !prev.activeColors[key] }
        }));
    };

    // Imagem Utils
    const processImage = async (file: File): Promise<ReferenceImage> => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) reject('Apenas imagens são permitidas');
            const reader = new FileReader();
            reader.onload = (e) => {
                const res = e.target?.result as string;
                resolve({
                    base64: res.split(',')[1],
                    mimeType: file.type,
                    preview: res
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const img = await processImage(file);
                updateConfig('subjectImage', img);
            } catch (err) {
                toast({ title: 'Erro', description: 'Arquivo inválido', variant: 'destructive' });
            }
        }
    };

    const handleRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const img = await processImage(file);
                setConfig(prev => ({
                    ...prev,
                    styleReferences: [...prev.styleReferences, img]
                }));
            } catch (err) {
                toast({ title: 'Erro', description: 'Arquivo inválido', variant: 'destructive' });
            }
        }
    };

    // Geração — chamada direta ao Gemini (igual ao Design Builder — 2 etapas)
    const handleGenerate = async () => {
        if (!config.niche && !config.subjectDescription) {
            toast({ title: 'Atenção', description: 'Preencha o Nicho ou a Descrição do Sujeito', variant: 'destructive' });
            return; // Fix C2: impede execução sem dados obrigatórios
        }

        // Mapeamento de dimensão para string "WxH"
        const dimensionMap: Record<string, string> = {
            STORIES: '1080x1920',
            HORIZONTAL: '1920x1080',
            SQUARE: '1080x1080',
            PORTRAIT: '1080x1350',
        };

        try {
            // Monta o GenerationConfig no formato do hook
            const generationConfig = {
                niche: config.niche,
                gender: config.gender,
                subjectDescription: config.subjectDescription,
                environment: config.environment,
                sobriety: config.sobriety,
                style: config.selectedStyle,
                useStyle: config.useVisualstyle,
                colors: config.colors,
                colorFlags: config.activeColors,
                ambientOpacity: config.ambientOpacity,
                useBlur: config.useBlur,
                useGradient: config.useGradient,
                useFloatingElements: config.useFloatingElements,
                floatingElementsDescription: '',
                shotType: config.framing || 'MEDIUM',
                additionalInstructions: config.useExtraPrompt ? config.extraPrompt : '',
                dimension: dimensionMap[config.dimension] || '1080x1920',
                safeAreaSide: config.position as 'LEFT' | 'RIGHT' | 'CENTER',
                personCount: config.quantity,
            };

            // Monta o array de imagens de referência (sujeito + estilos)
            const referenceImages = [];
            if (config.subjectImage) {
                referenceImages.push({
                    data: `data:${config.subjectImage.mimeType};base64,${config.subjectImage.base64}`,
                    mimeType: config.subjectImage.mimeType,
                });
            }
            for (const ref of config.styleReferences) {
                referenceImages.push({
                    data: `data:${ref.mimeType};base64,${ref.base64}`,
                    mimeType: ref.mimeType || 'image/jpeg',
                });
            }

            const result = await generate(generationConfig, referenceImages);

            const newImg: GeneratedImage = {
                src: `data:${result.mimeType};base64,${result.imageBase64}`,
                prompt: result.finalPrompt,
                timestamp: Date.now(),
            };
            setGallery(prev => [newImg, ...prev]);
            toast({ title: '✨ Imagem gerada!', className: 'bg-green-600 text-white border-none' });

        } catch (err: any) {
            console.error('Erro na geração:', err);
            toast({
                title: 'Erro na geração',
                description: err.message || 'Ocorreu um erro ao gerar a imagem.',
                variant: 'destructive',
            });
        }
    };

    // MarsIcon e VenusIcon duplicados aqui para evitar erros de importação se não existirem
    const MarsIcon = ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="m21 3-6.75 6.75" /><circle cx="10" cy="14" r="6" /></svg>
    )
    const VenusIcon = ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v7" /><path d="M9 19h6" /><circle cx="12" cy="9" r="6" /></svg>
    )


    // UI Components Helpers
    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-stone-500 mb-3.5 mt-1">
            {children}
        </div>
    );

    const Separator = () => (
        <div className="h-px bg-[#e0ddd7] my-5" />
    );

    const SelectionButton = ({ active, onClick, children, className }: any) => (
        <button
            onClick={onClick}
            className={`
                flex-1 py-1.5 px-3 rounded-lg text-[10px] uppercase font-bold text-center border transition-all
                ${active
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'bg-white text-stone-400 border-[#e0ddd7] hover:border-stone-400'
                }
                ${className}
            `}
        >
            {children}
        </button>
    );

    // Handler para abrir lightbox
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-0 bg-[#0a0a0a] p-0 rounded-2xl overflow-hidden font-sans">

            {/* ── SIDEBAR ── */}
            <div className="hidden lg:flex flex-col w-[68px] bg-[#111111] border-r border-white/5 items-center py-4 gap-1 shrink-0">
                <button
                    onClick={() => setSidebarTab('explore')}
                    className={`flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all text-[8px] font-bold uppercase tracking-wider ${sidebarTab === 'explore'
                        ? 'bg-violet-600/20 text-violet-400'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    <Compass className="w-5 h-5" />
                    Explorar
                </button>
                <button
                    onClick={() => setSidebarTab('create')}
                    className={`flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all text-[8px] font-bold uppercase tracking-wider ${sidebarTab === 'create'
                        ? 'bg-violet-600/20 text-violet-400'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    <Brush className="w-5 h-5" />
                    Criar
                </button>
                <button
                    onClick={() => setSidebarTab('gallery')}
                    className={`flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all text-[8px] font-bold uppercase tracking-wider ${sidebarTab === 'gallery'
                        ? 'bg-violet-600/20 text-violet-400'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    <GalleryHorizontal className="w-5 h-5" />
                    Galeria
                </button>

                {/* Thumbnails do histórico */}
                {gallery.length > 0 && (
                    <>
                        <div className="w-10 h-px bg-white/10 my-2" />
                        <ScrollArea className="flex-1 w-full px-1.5">
                            <div className="flex flex-col gap-1.5">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => openLightbox(idx)}
                                        className="w-full aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors opacity-80 hover:opacity-100"
                                    >
                                        <img src={img.src} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </>
                )}
            </div>

            {/* ── PAINEL ESQUERDO (CONFIGURAÇÕES) — só visível na tab Criar ── */}
            {sidebarTab === 'create' && (
                <div className="w-full lg:w-[420px] bg-white rounded-none lg:rounded-none border-r border-[#e0ddd7] flex flex-col shadow-sm shrink-0">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-1">

                            {/* SUJEITO PRINCIPAL */}
                            <SectionTitle>Sujeito Principal</SectionTitle>

                            {/* Upload */}
                            <div className="mb-3">
                                <Label className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 block">Fotos do Sujeito</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                                    h-24 border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group
                                    ${config.subjectImage ? 'border-violet-500 bg-violet-50' : 'border-[#e0ddd7] hover:border-stone-400 bg-stone-50'}
                                `}
                                >
                                    {config.subjectImage ? (
                                        <>
                                            <img src={config.subjectImage.preview} className="w-full h-full object-cover opacity-90" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold">Trocar Imagem</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-stone-300 mb-1" />
                                            <span className="text-[10px] font-bold text-stone-300 uppercase">Upload</span>
                                        </>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleSubjectUpload} />
                                </div>
                            </div>

                            {/* Quantidade */}
                            <div className="mb-3">
                                <Label className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 block">Quantidade</Label>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <SelectionButton
                                            key={n}
                                            active={config.quantity === n}
                                            onClick={() => updateConfig('quantity', n)}
                                        >
                                            {n}
                                        </SelectionButton>
                                    ))}
                                </div>
                            </div>

                            {/* Gênero */}
                            <div className="mb-3">
                                <Label className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-1.5 block">Gênero</Label>
                                <div className="flex gap-1.5">
                                    <SelectionButton
                                        active={config.gender === 'Masculino'}
                                        onClick={() => updateConfig('gender', 'Masculino')}
                                    >
                                        <MarsIcon className="w-3 h-3 inline mr-1" /> Masculino
                                    </SelectionButton>
                                    <SelectionButton
                                        active={config.gender === 'Feminino'}
                                        onClick={() => updateConfig('gender', 'Feminino')}
                                    >
                                        <VenusIcon className="w-3 h-3 inline mr-1" /> Feminino
                                    </SelectionButton>
                                </div>
                            </div>

                            {/* Descrição */}
                            <Textarea
                                placeholder="Descrição da pose ou roupa (opcional)..."
                                className="bg-[#fafaf9] border-[#e0ddd7] text-xs resize-none focus:border-stone-400 focus:ring-0 min-h-[60px] rounded-xl placeholder:text-stone-300"
                                value={config.subjectDescription}
                                onChange={e => updateConfig('subjectDescription', e.target.value)}
                            />

                            <Separator />

                            {/* POSIÇÃO */}
                            <div className="flex gap-2 mb-2">
                                {[
                                    { id: 'LEFT', label: 'Esquerda', align: 'items-start' },
                                    { id: 'CENTER', label: 'Centro', align: 'items-center' },
                                    { id: 'RIGHT', label: 'Direita', align: 'items-end' }
                                ].map((pos: any) => (
                                    <button
                                        key={pos.id}
                                        onClick={() => updateConfig('position', pos.id)}
                                        className={`
                                        flex-1 h-16 rounded-xl border flex flex-col items-center justify-end pb-1.5 gap-1.5 transition-all
                                        ${config.position === pos.id
                                                ? 'border-[#1a1a1a] bg-stone-50'
                                                : 'border-[#e0ddd7] hover:border-stone-300 bg-white'
                                            }
                                    `}
                                    >
                                        <div className="w-full px-4 flex flex-col h-full justify-center">
                                            <div className={`flex flex-col ${pos.align} w-full gap-0.5`}>
                                                <div className={`w-3 h-3 rounded-full ${config.position === pos.id ? 'bg-[#1a1a1a]' : 'bg-stone-200'}`} />
                                                <div className="w-full h-0.5 bg-stone-100 rounded-full" />
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase ${config.position === pos.id ? 'text-[#1a1a1a]' : 'text-stone-300'}`}>
                                            {pos.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* DIMENSÕES */}
                            <SectionTitle>Dimensões</SectionTitle>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {[
                                    { id: 'STORIES', label: 'Stories (9:16)', icon: Smartphone },
                                    { id: 'HORIZONTAL', label: 'Horiz. (16:9)', icon: Monitor },
                                    { id: 'SQUARE', label: 'Quadrado (1:1)', icon: Box },
                                    { id: 'PORTRAIT', label: 'Retrato (4:5)', icon: RectangleVertical },
                                ].map((dim: any) => (
                                    <button
                                        key={dim.id}
                                        onClick={() => updateConfig('dimension', dim.id)}
                                        className={`
                                        flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all
                                        ${config.dimension === dim.id
                                                ? 'border-[#c8e64a] bg-[#fcfef5] text-[#55691e]'
                                                : 'border-[#e0ddd7] text-stone-500 hover:bg-stone-50'
                                            }
                                    `}
                                    >
                                        <dim.icon className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold">{dim.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* TEXTO */}
                            <div className="flex items-center justify-between mb-2">
                                <SectionTitle>Texto</SectionTitle>
                                <Switch checked={config.useText} onCheckedChange={v => updateConfig('useText', v)} />
                            </div>

                            {config.useText && (
                                <div className="space-y-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Input
                                        className="h-8 text-xs border-[#e0ddd7] bg-[#fafaf9]"
                                        placeholder="Headline (H1)"
                                        value={config.textH1}
                                        onChange={e => updateConfig('textH1', e.target.value)}
                                    />
                                    <Input
                                        className="h-8 text-xs border-[#e0ddd7] bg-[#fafaf9]"
                                        placeholder="Subheadline (H2)"
                                        value={config.textH2}
                                        onChange={e => updateConfig('textH2', e.target.value)}
                                    />
                                    <Input
                                        className="h-8 text-xs border-[#e0ddd7] bg-[#fafaf9]"
                                        placeholder="Botão (CTA)"
                                        value={config.textCTA}
                                        onChange={e => updateConfig('textCTA', e.target.value)}
                                    />
                                </div>
                            )}

                            <Separator />

                            {/* PROJETO & CENÁRIO */}
                            <SectionTitle>Projeto & Cenário</SectionTitle>
                            <Input
                                className="h-9 mb-2 text-xs border-[#e0ddd7]"
                                placeholder="Nicho/Projeto (Ex: Trader de Elite)"
                                value={config.niche}
                                onChange={e => updateConfig('niche', e.target.value)}
                            />
                            <Input
                                className="h-9 mb-2 text-xs border-[#e0ddd7]"
                                placeholder="Ambiente (Ex: Escritório Moderno)"
                                value={config.environment}
                                onChange={e => updateConfig('environment', e.target.value)}
                            />

                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-stone-400">Usar fotos de cenário?</span>
                                <Switch checked={config.useSceneImages} onCheckedChange={v => updateConfig('useSceneImages', v)} />
                            </div>

                            <Separator />

                            {/* CORES & ILUMINAÇÃO */}
                            <SectionTitle>Cores & Iluminação</SectionTitle>

                            {/* Ambiente */}
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => toggleColor('ambient')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${config.activeColors.ambient ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-stone-300 border-[#e0ddd7]'}`}
                                >
                                    <Palette className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e0ddd7] bg-white">
                                    <span className="text-[10px] font-bold text-stone-500 uppercase flex-1">Cor do Ambiente</span>
                                    <input
                                        type="color"
                                        value={config.colors.ambient}
                                        onChange={e => updateColor('ambient', e.target.value)}
                                        className="w-5 h-5 rounded overflow-hidden border-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Recorte */}
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => toggleColor('rim')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${config.activeColors.rim ? 'bg-[#c8e64a] text-[#55691e] border-[#c8e64a]' : 'bg-white text-stone-300 border-[#e0ddd7]'}`}
                                >
                                    <Sun className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e0ddd7] bg-white">
                                    <span className="text-[10px] font-bold text-stone-500 uppercase flex-1">Luz de Recorte</span>
                                    <input
                                        type="color"
                                        value={config.colors.rim}
                                        onChange={e => updateColor('rim', e.target.value)}
                                        className="w-5 h-5 rounded overflow-hidden border-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Complementar */}
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => toggleColor('complementary')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${config.activeColors.complementary ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white text-stone-300 border-[#e0ddd7]'}`}
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e0ddd7] bg-white">
                                    <span className="text-[10px] font-bold text-stone-500 uppercase flex-1">Luz Complementar</span>
                                    <input
                                        type="color"
                                        value={config.colors.complementary}
                                        onChange={e => updateColor('complementary', e.target.value)}
                                        className="w-5 h-5 rounded overflow-hidden border-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Opacidade do ambiente */}
                            <div className="bg-stone-50 rounded-xl p-3 mb-3">
                                <div className="flex justify-between mb-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-500">Opacidade do Ambiente</Label>
                                    <span className="text-[10px] font-bold text-[#1a1a1a]">{config.ambientOpacity}%</span>
                                </div>
                                <Slider
                                    value={[config.ambientOpacity]}
                                    onValueChange={([v]) => updateConfig('ambientOpacity', v)}
                                    max={100}
                                    step={5}
                                    className="mb-1"
                                />
                                <div className="flex justify-between text-[8px] uppercase font-bold text-stone-400">
                                    <span>Sutil</span>
                                    <span>Intenso</span>
                                </div>
                            </div>

                            <Separator />

                            {/* COMPOSIÇÃO */}
                            <SectionTitle>Composição</SectionTitle>
                            <div className="grid grid-cols-1 gap-2 mb-3">
                                {[
                                    { id: 'CLOSE_UP', label: 'Close-up (Rosto)', desc: 'Foco no rosto', icon: UserCircle },
                                    { id: 'MEDIUM', label: 'Plano Médio (Busto)', desc: 'Da cintura pra cima', icon: User },
                                    { id: 'AMERICAN', label: 'Plano Americano', desc: 'Do joelho pra cima', icon: ScanFace },
                                ].map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => updateConfig('framing', item.id)}
                                        className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all
                                        ${config.framing === item.id
                                                ? 'border-[#1a1a1a] bg-stone-50'
                                                : 'border-[#e0ddd7] hover:bg-stone-50'
                                            }
                                    `}
                                    >
                                        <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center
                                        ${config.framing === item.id ? 'bg-[#1a1a1a] text-white' : 'bg-stone-100 text-stone-400'}
                                    `}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-[#1a1a1a]">{item.label}</div>
                                            <div className="text-[9px] text-stone-400">{item.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-stone-400">Elementos Flutuantes?</span>
                                <Switch checked={config.useFloatingElements} onCheckedChange={v => updateConfig('useFloatingElements', v)} />
                            </div>

                            <Separator />

                            {/* REFERÊNCIAS DE ESTILO (Ref Upload) */}
                            <div className="p-3 bg-[#f8f7f5] border border-[#e0ddd7] rounded-2xl mb-4">
                                <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-stone-500 mb-3">
                                    Referências de Estilo
                                </div>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    {config.styleReferences.map((ref, idx) => (
                                        <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#27272a] group">
                                            <img src={ref.preview} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => {
                                                    const newRefs = [...config.styleReferences];
                                                    newRefs.splice(idx, 1);
                                                    updateConfig('styleReferences', newRefs);
                                                }}
                                                className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => refInputRef.current?.click()}
                                        className="w-14 h-14 rounded-lg border border-dashed border-[#d5d2cc] flex flex-col items-center justify-center cursor-pointer hover:border-[#c8e64a] hover:bg-[#c8e64a]/10 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-stone-400" />
                                    </div>
                                </div>
                                <input ref={refInputRef} type="file" className="hidden" accept="image/*" onChange={handleRefUpload} />
                            </div>

                            {/* ATRIBUTOS VISUAIS */}
                            <SectionTitle>Atributos Visuais & Estilo</SectionTitle>

                            <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                <div className="flex justify-between mb-2">
                                    <Label className="text-[10px] uppercase font-bold text-stone-500">Sobriedade</Label>
                                    <span className="text-[10px] font-bold text-[#1a1a1a]">{config.sobriety}</span>
                                </div>
                                <Slider
                                    value={[config.sobriety]}
                                    onValueChange={([v]) => updateConfig('sobriety', v)}
                                    max={100}
                                    step={1}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-[8px] uppercase font-bold text-stone-400">
                                    <span>Criativo</span>
                                    <span>Profissional</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#1a1a1a]">Ativar Estilo Visual</span>
                                <Switch checked={config.useVisualstyle} onCheckedChange={v => updateConfig('useVisualstyle', v)} />
                            </div>

                            <div className={`grid grid-cols-3 gap-1.5 transition-opacity ${config.useVisualstyle ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                                {STYLES.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => updateConfig('selectedStyle', s.id)}
                                        className={`
                                        px-1 py-1.5 rounded text-[9px] font-bold border transition-colors truncate
                                        ${config.selectedStyle === s.id
                                                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                                                : 'bg-white text-stone-400 border-[#e0ddd7] hover:border-stone-300'
                                            }
                                    `}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-stone-400">Desfoque (Blur)</span>
                                <Switch checked={config.useBlur} onCheckedChange={v => updateConfig('useBlur', v)} />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-stone-400">Degradê Lateral</span>
                                <Switch checked={config.useGradient} onCheckedChange={v => updateConfig('useGradient', v)} />
                            </div>

                            <Separator />

                            {/* Prompt Adicional */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-stone-400">Prompt Adicional</span>
                                <Switch checked={config.useExtraPrompt} onCheckedChange={v => updateConfig('useExtraPrompt', v)} />
                            </div>
                            {config.useExtraPrompt && (
                                <Textarea
                                    placeholder="Instruções extras..."
                                    className="text-xs bg-stone-50 border-[#e0ddd7]"
                                    value={config.extraPrompt}
                                    onChange={e => updateConfig('extraPrompt', e.target.value)}
                                />
                            )}

                            {/* SUGESTÕES DA IA */}
                            {suggestions.length > 0 && (
                                <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-violet-500 mb-2">💡 Sugestões de Cenário</div>
                                    <div className="space-y-1.5">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    updateConfig('environment', s);
                                                    toast({ title: `Cenário aplicado: ${s.substring(0, 40)}...` });
                                                }}
                                                className="w-full text-left text-[10px] text-violet-800 bg-white hover:bg-violet-100 border border-violet-200 rounded-lg px-2.5 py-1.5 transition-colors"
                                            >
                                                <span className="font-bold text-violet-600 mr-1">{i + 1}.</span> {s}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSuggestions([])}
                                        className="mt-2 text-[8px] font-bold uppercase text-violet-400 hover:text-violet-600"
                                    >
                                        Fechar sugestões
                                    </button>
                                </div>
                            )}

                            {/* BOTÕES DE AÇÃO */}
                            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-[#e0ddd7] mt-4 space-y-2 z-10">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className={`
                                    w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider
                                    ${isGenerating
                                            ? 'bg-[#f0ede8] text-[#8aad2a]'
                                            : 'bg-[#1a1a1a] text-[#c8e64a] hover:bg-[#333] hover:scale-[1.01] transition-transform'
                                        }
                                `}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {progress || 'Gerando...'}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Gerar Imagem
                                        </>
                                    )}
                                </Button>

                                {/* AGENTES IA — Extrair Referência + Sugestões */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-9 rounded-xl text-[10px] font-bold text-violet-600 border-violet-300 hover:bg-violet-50 hover:border-violet-400 disabled:opacity-50"
                                        disabled={!config.subjectImage || isExtracting}
                                        onClick={async () => {
                                            if (!config.subjectImage) return;
                                            setIsExtracting(true);
                                            try {
                                                const result = await extractPromptFromImage(
                                                    `data:${config.subjectImage.mimeType};base64,${config.subjectImage.base64}`
                                                );
                                                updateConfig('subjectDescription', result.suggestedPrompt);
                                                toast({
                                                    title: '🔍 Referência Extraída!',
                                                    description: `Pose: ${result.pose} | Câmera: ${result.cameraAngle}`,
                                                    className: 'bg-violet-600 text-white border-none',
                                                });
                                            } catch (err: any) {
                                                toast({ title: 'Erro ao extrair', description: err.message, variant: 'destructive' });
                                            } finally {
                                                setIsExtracting(false);
                                            }
                                        }}
                                    >
                                        {isExtracting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : '🔍'}
                                        {isExtracting ? 'Analisando...' : 'Extrair Ref.'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="flex-1 h-9 rounded-xl text-[10px] font-bold text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50"
                                        disabled={!config.niche || isBrainstorming}
                                        onClick={async () => {
                                            if (!config.niche) return;
                                            setIsBrainstorming(true);
                                            try {
                                                const scenes = await brainstormScenes(config.niche, config.selectedStyle);
                                                setSuggestions(scenes);
                                                toast({
                                                    title: '💡 5 Cenários Sugeridos!',
                                                    className: 'bg-amber-500 text-white border-none',
                                                });
                                            } catch (err: any) {
                                                toast({ title: 'Erro nas sugestões', description: err.message, variant: 'destructive' });
                                            } finally {
                                                setIsBrainstorming(false);
                                            }
                                        }}
                                    >
                                        {isBrainstorming ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : '💡'}
                                        {isBrainstorming ? 'Pensando...' : 'Sugestões'}
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full h-9 rounded-xl text-[10px] font-bold text-stone-500 border-[#d5d2cc] hover:bg-[#c8e64a]/10 hover:text-[#1a1a1a] hover:border-[#c8e64a]"
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                                        toast({ title: 'Configuração copiada!' });
                                    }}
                                >
                                    <Copy className="w-3 h-3 mr-1.5" />
                                    Duplicar Configuração
                                </Button>

                                {/* MODO FORENSE */}
                                <Button
                                    variant="outline"
                                    className={`w-full h-9 rounded-xl text-[10px] font-bold tracking-wider ${forensicOpen
                                        ? 'bg-amber-100 text-amber-800 border-amber-400'
                                        : 'text-stone-400 border-[#d5d2cc] hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                                        }`}
                                    onClick={() => setForensicOpen(!forensicOpen)}
                                    disabled={!lastForensicLog}
                                >
                                    🔬 {forensicOpen ? 'Fechar' : 'Modo'} Forense
                                    {lastForensicLog && (
                                        <span className={`ml-1.5 w-1.5 h-1.5 rounded-full inline-block ${lastForensicLog.success ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                    )}
                                </Button>
                            </div>

                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* ── PAINEL ESQUERDO: EXPLORAR ── */}
            {sidebarTab === 'explore' && (
                <div className="w-full lg:w-[420px] bg-[#111111] border-r border-white/5 flex flex-col shrink-0">
                    <div className="h-[38px] border-b border-white/5 flex items-center px-4">
                        <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">Explorar Estilos</span>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => {
                                        updateConfig('selectedStyle', style.id);
                                        updateConfig('useVisualstyle', true);
                                        setSidebarTab('create');
                                        toast({ title: `🎨 Estilo "${style.label}" selecionado!` });
                                    }}
                                    className={`group relative overflow-hidden rounded-xl border transition-all h-24 flex items-end p-3 ${config.selectedStyle === style.id
                                        ? 'border-violet-500 bg-violet-600/20'
                                        : 'border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-lg">
                                        {style.label}
                                    </span>
                                    {config.selectedStyle === style.id && (
                                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* ── PAINEL DIREITO (PREVIEW + GALERIA) ── */}
            <div className="flex-1 bg-[#0f0f0f] flex flex-col min-w-0">
                <div className="h-[38px] border-b border-white/5 flex items-center justify-between px-4 bg-[#111111]">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/40">Galeria</span>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-medium text-white/30">{gallery.length} imagens</span>
                        <div id="apiBadge" className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 text-[9px] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            API OK
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">

                    {/* Progress bar */}
                    {isGenerating && progress && (
                        <div className="w-full max-w-md mx-auto mb-4 px-4">
                            <div className="bg-white/5 rounded-full p-3 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                                    <span className="text-xs text-white/70 font-medium truncate">{progress}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {gallery.length === 0 && !isGenerating && (
                        <div className="text-center mt-20 opacity-60">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                                <ImageIcon className="w-7 h-7 text-white/20" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25">Aguardando Criação</p>
                            <p className="text-[9px] text-white/15 mt-1">Configure e clique em Gerar</p>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                        {/* Skeleton Loading */}
                        {isGenerating && (
                            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 animate-pulse">
                                <div className="w-full aspect-[9/16] bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                            </div>
                        )}

                        {/* Gallery Items */}
                        {gallery.map((img, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 group relative animate-in fade-in slide-in-from-bottom-4 duration-500 hover:border-violet-500/30 transition-colors">
                                {/* Imagem clicável → abre lightbox */}
                                <button
                                    onClick={() => openLightbox(idx)}
                                    className="w-full block cursor-pointer"
                                >
                                    <img src={img.src} className="w-full block" loading="lazy" />
                                </button>

                                {/* Barra de ações sempre visível */}
                                <div className="flex items-center gap-1.5 p-2 bg-black/40 backdrop-blur-sm">
                                    <button
                                        onClick={() => openLightbox(idx)}
                                        className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider transition-colors"
                                    >
                                        🔍 Visualizar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(img.src);
                                                const blob = await response.blob();
                                                const d = new Date(img.timestamp);
                                                const pad = (n: number) => String(n).padStart(2, '0');
                                                const safeName = `design-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = `${safeName}.png`;
                                                link.click();
                                                setTimeout(() => URL.revokeObjectURL(url), 5000);
                                                toast({ title: `📥 Baixando ${safeName}.png` });
                                            } catch (err) {
                                                console.error('Erro no download:', err);
                                                toast({ title: 'Erro ao baixar', variant: 'destructive' });
                                            }
                                        }}
                                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <Download className="w-3 h-3 inline mr-1" /> PNG
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(img.prompt);
                                            toast({ title: 'Prompt copiado!' });
                                        }}
                                        className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <Copy className="w-3 h-3 inline" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="h-12 border-t border-white/5 flex items-center gap-2 px-3 bg-[#111111]">
                    <input
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[11px] text-white outline-none placeholder:text-white/30 focus:border-violet-500/50"
                        placeholder="Ajuste fino: descreva alterações..."
                        value={refinementText}
                        onChange={e => setRefinementText(e.target.value)}
                    />
                    <button className="bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-extrabold px-4 py-2 rounded-full uppercase tracking-wider transition-colors">
                        Refinar
                    </button>
                </div>
            </div>

            {/* LIGHTBOX */}
            <ImageLightbox
                images={gallery}
                currentIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onIndexChange={setLightboxIndex}
            />

            {/* FORENSIC PANEL */}
            <ForensicPanel
                log={lastForensicLog}
                isOpen={forensicOpen}
                onClose={() => setForensicOpen(false)}
            />
        </div>
    );
}

export default DesignerDoFuturoGenerator;
