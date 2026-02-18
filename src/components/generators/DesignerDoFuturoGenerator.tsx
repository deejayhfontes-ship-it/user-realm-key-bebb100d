import { useState, useCallback, useRef } from 'react';
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
];

export function DesignerDoFuturoGenerator() {
    const [config, setConfig] = useState<DesignerConfig>(DEFAULT_CONFIG);
    const [gallery, setGallery] = useState<GeneratedImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const refInputRef = useRef<HTMLInputElement>(null);
    const { generate, isGenerating, progress } = useGeminiImageGeneration();
    const [refinementText, setRefinementText] = useState('');

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
                ambientOpacity: 50,
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

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-2 bg-[#f9f9f9] p-2 rounded-2xl overflow-hidden font-sans">

            {/* ── PAINEL ESQUERDO ── */}
            <div className="w-full lg:w-[420px] bg-white rounded-xl border border-[#e0ddd7] flex flex-col shadow-sm">
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
                        </div>

                    </div>
                </ScrollArea>
            </div>


            {/* ── PAINEL DIREITO (GALERIA) ── */}
            <div className="flex-1 bg-[#f0ede8] rounded-xl flex flex-col min-w-0 border border-[#e0ddd7] ml-0 lg:ml-2">
                <div className="h-[38px] border-b border-[#e0ddd7] flex items-center justify-between px-4 bg-[#f0ede8] rounded-t-xl">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#aaa]">Galeria</span>
                    <div id="apiBadge" className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#052e16] text-[#4ade80] text-[9px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        API OK
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">

                    {/* Empty State */}
                    {gallery.length === 0 && !isGenerating && (
                        <div className="text-center mt-20 opacity-60">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-[#e0ddd7] flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <ImageIcon className="w-6 h-6 text-[#ccc]" />
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#bbb]">Aguardando Criação</p>
                        </div>
                    )}

                    {/* Masonry Grid */}
                    <div className="w-full columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">

                        {/* Skeleton Loading */}
                        {isGenerating && (
                            <div className="break-inside-avoid mb-3 rounded-xl overflow-hidden bg-white border border-[#e0ddd7] shadow-sm animate-pulse">
                                <div className="w-full aspect-[9/16] bg-gradient-to-r from-[#e8e5df] via-[#f0ede8] to-[#e8e5df] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                            </div>
                        )}

                        {/* Gallery Items */}
                        {gallery.map((img, idx) => (
                            <div key={idx} className="break-inside-avoid mb-3 rounded-xl overflow-hidden bg-white border border-[#e0ddd7] shadow-sm group relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <img src={img.src} className="w-full block" loading="lazy" />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-input from-transparent via-black/20 to-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 gap-2">
                                    <button
                                        onClick={() => {
                                            const dataUri = img.src;
                                            const [header, b64] = dataUri.split(',');
                                            const mime = header.match(/data:([^;]+)/)?.[1] || 'image/png';
                                            const binary = atob(b64);
                                            const bytes = new Uint8Array(binary.length);
                                            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                                            const blob = new Blob([bytes], { type: mime });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `design-${img.timestamp}.png`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="flex-1 py-1.5 rounded-lg bg-white text-black text-[9px] font-extrabold uppercase hover:scale-105 transition-transform"
                                    >
                                        <Download className="w-3 h-3 inline mr-1" /> Baixar
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(img.prompt);
                                            toast({ title: 'Prompt copiado!' });
                                        }}
                                        className="flex-1 py-1.5 rounded-lg bg-[#27272a] text-white text-[9px] font-extrabold uppercase hover:bg-black hover:scale-105 transition-transform"
                                    >
                                        <Copy className="w-3 h-3 inline mr-1" /> Prompt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="h-12 border-t border-[#e0ddd7] flex items-center gap-2 px-3 bg-[#f0ede8] rounded-b-xl">
                    <input
                        className="flex-1 bg-white border border-[#d5d2cc] rounded-full px-4 py-2 text-[11px] outline-none placeholder:text-[#bbb] focus:border-[#c8e64a]"
                        placeholder="Ajuste fino: descreva alterações..."
                        value={refinementText}
                        onChange={e => setRefinementText(e.target.value)}
                    />
                    <button className="bg-[#1a1a1a] text-white text-[9px] font-extrabold px-4 py-2 rounded-full uppercase tracking-wider hover:bg-[#333]">
                        Refinar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DesignerDoFuturoGenerator;
