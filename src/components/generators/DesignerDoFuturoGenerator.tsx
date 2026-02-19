import React, { useState, useCallback, useRef, useEffect } from 'react';
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
    Bot,
    PackageOpen,
    FolderPlus,
    Pencil,
    Trash2,
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
import { AIChatPanel } from './AIChatPanel';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ── Tipos ──
interface ReferenceImage {
    base64: string;
    mimeType: string;
    preview: string;
    description?: string;
    category?: 'style' | 'environment';
}

interface GeneratedImage {
    src: string;
    prompt: string;
    timestamp: number;
}

interface Project {
    id: string;
    name: string;
    config: DesignerConfig;
    gallery: GeneratedImage[];
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
const PROJECTS_STORAGE_KEY = 'designer-projects';
const MAX_GALLERY_ITEMS = 50;

const createProject = (name: string): Project => ({
    id: crypto.randomUUID(),
    name,
    config: { ...DEFAULT_CONFIG },
    gallery: [],
});

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
    const { generate, inpaintImage, reframeImage, extractPromptFromImage, brainstormScenes, isGenerating, progress, lastForensicLog } = useGeminiImageGeneration();
    const [refinementText, setRefinementText] = useState('');
    const [forensicOpen, setForensicOpen] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    const [sidebarTab, setSidebarTab] = useState<'create' | 'explore' | 'gallery'>('create');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    // ── Projetos ──
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { }
        return [createProject('Projeto Alpha')];
    });
    const [activeProjectId, setActiveProjectId] = useState<string>(() => {
        try {
            const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[0]?.id || '';
            }
        } catch { }
        return '';
    });
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    // Sync activeProjectId on first render
    useEffect(() => {
        if (!activeProjectId && projects.length > 0) {
            setActiveProjectId(projects[0].id);
        }
    }, [projects, activeProjectId]);

    // Persist projects
    useEffect(() => {
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
        } catch (e) {
            console.warn('[PROJECTS] localStorage cheio, não foi possível salvar projetos.');
        }
    }, [projects]);

    const addProject = () => {
        const newProject = createProject(`Projeto ${projects.length + 1}`);
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
        setConfig({ ...DEFAULT_CONFIG });
        setGallery([]);
        toast({ title: `✨ ${newProject.name} criado!` });
    };

    const deleteProject = (projectId: string) => {
        if (projects.length <= 1) {
            toast({ title: 'Não é possível excluir o único projeto.', variant: 'destructive' });
            return;
        }
        setProjects(prev => {
            const filtered = prev.filter(p => p.id !== projectId);
            if (activeProjectId === projectId) {
                setActiveProjectId(filtered[0].id);
                setConfig(filtered[0].config);
                setGallery(filtered[0].gallery);
            }
            return filtered;
        });
        toast({ title: '🗑️ Projeto removido.' });
    };

    const switchProject = (projectId: string) => {
        // Save current project state
        setProjects(prev => prev.map(p =>
            p.id === activeProjectId ? { ...p, config: { ...config }, gallery: [...gallery] } : p
        ));
        // Load new project
        const target = projects.find(p => p.id === projectId);
        if (target) {
            setActiveProjectId(projectId);
            setConfig({ ...target.config });
            setGallery([...target.gallery]);
        }
    };

    const renameProject = (projectId: string, newName: string) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId ? { ...p, name: newName } : p
        ));
        setEditingProjectId(null);
    };

    // Sync current project on config/gallery changes
    useEffect(() => {
        if (activeProjectId) {
            setProjects(prev => prev.map(p =>
                p.id === activeProjectId ? { ...p, config: { ...config }, gallery: [...gallery] } : p
            ));
        }
    }, [config, gallery]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handler: Refinar (inpaint sem máscara → edição global) ──
    const handleRefine = useCallback(async () => {
        if (!refinementText.trim() || gallery.length === 0 || isGenerating) return;
        setIsRefining(true);
        try {
            // Usa a última imagem da galeria + texto como editPrompt
            const lastImg = gallery[0];
            const result = await inpaintImage(
                lastImg.src,
                '', // sem máscara = inpaint "full"
                refinementText,
            );
            const refined: GeneratedImage = {
                src: `data:${result.mimeType};base64,${result.imageBase64}`,
                prompt: `[Refinado] ${refinementText}`,
                timestamp: Date.now(),
            };
            setGallery(prev => [refined, ...prev]);
            setRefinementText('');
            toast({ title: '✨ Refinamento aplicado!', className: 'bg-lime-500 text-white border-none' });
        } catch (err: any) {
            toast({ title: 'Erro no refinamento', description: err.message, variant: 'destructive' });
        } finally {
            setIsRefining(false);
        }
    }, [refinementText, gallery, isGenerating, inpaintImage]);

    // ── Handler: Refine via Lightbox (inline no lightbox) ──
    const handleLightboxRefine = useCallback(async (imageSrc: string, refinePrompt: string) => {
        toast({ title: '✨ Refinando imagem...', className: 'bg-fuchsia-600 text-white border-none' });
        try {
            const result = await inpaintImage(imageSrc, '', refinePrompt);
            const refined: GeneratedImage = {
                src: `data:${result.mimeType};base64,${result.imageBase64}`,
                prompt: `[Refinado] ${refinePrompt}`,
                timestamp: Date.now(),
            };
            setGallery(prev => [refined, ...prev]);
            setLightboxIndex(0); // Move para a imagem refinada
            toast({ title: '✨ Refinamento concluído!', className: 'bg-emerald-600 text-white border-none' });
        } catch (err: any) {
            toast({ title: 'Erro no refinamento', description: err.message, variant: 'destructive' });
        }
    }, [inpaintImage]);

    // ── Handler: Inpaint (via Lightbox MaskPainter) ──
    const handleInpaint = useCallback(async (imageSrc: string, maskBase64: string, editPrompt: string) => {
        toast({ title: '🎨 Aplicando inpainting...', className: 'bg-lime-500 text-white border-none' });
        try {
            const result = await inpaintImage(imageSrc, maskBase64, editPrompt);
            const edited: GeneratedImage = {
                src: `data:${result.mimeType};base64,${result.imageBase64}`,
                prompt: `[Inpaint] ${editPrompt}`,
                timestamp: Date.now(),
            };
            setGallery(prev => [edited, ...prev]);
            setLightboxOpen(false);
            toast({ title: '🎨 Inpainting concluído!', className: 'bg-emerald-600 text-white border-none' });
        } catch (err: any) {
            toast({ title: 'Erro no inpainting', description: err.message, variant: 'destructive' });
        }
    }, [inpaintImage]);

    // ── Handler: Reframe (via Lightbox) ──
    const handleReframe = useCallback(async (imageSrc: string, targetRatio: string, direction: 'vertical' | 'horizontal') => {
        toast({ title: `↔ Reframe ${targetRatio}...`, className: 'bg-indigo-600 text-white border-none' });
        try {
            const result = await reframeImage(imageSrc, targetRatio, direction);
            const reframed: GeneratedImage = {
                src: `data:${result.mimeType};base64,${result.imageBase64}`,
                prompt: `[Reframe ${targetRatio}]`,
                timestamp: Date.now(),
            };
            setGallery(prev => [reframed, ...prev]);
            setLightboxOpen(false);
            toast({ title: `✅ Reframe ${targetRatio} concluído!`, className: 'bg-emerald-600 text-white border-none' });
        } catch (err: any) {
            toast({ title: 'Erro no reframe', description: err.message, variant: 'destructive' });
        }
    }, [reframeImage]);

    // ── Handler: Text Overlay Saved ──
    const handleTextOverlay = useCallback((resultBase64: string) => {
        const overlayed: GeneratedImage = {
            src: resultBase64,
            prompt: '[Texto Overlay]',
            timestamp: Date.now(),
        };
        setGallery(prev => [overlayed, ...prev]);
        setLightboxOpen(false);
        toast({ title: '✅ Imagem salva com textos!', className: 'bg-emerald-600 text-white border-none' });
    }, []);


    // ── Handler: Export ZIP ──
    const handleExportZip = useCallback(async () => {
        if (gallery.length === 0) return;
        toast({ title: '📦 Gerando ZIP...' });
        try {
            const zip = new JSZip();
            for (let i = 0; i < gallery.length; i++) {
                const img = gallery[i];
                const d = new Date(img.timestamp);
                const pad = (n: number) => String(n).padStart(2, '0');
                const name = `design-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}_${i + 1}.png`;
                // Convert data URI to binary
                const response = await fetch(img.src);
                const blob = await response.blob();
                zip.file(name, blob);
            }
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `design-gallery-${Date.now()}.zip`);
            toast({ title: `📦 ${gallery.length} imagens exportadas!`, className: 'bg-emerald-600 text-white border-none' });
        } catch (err: any) {
            toast({ title: 'Erro ao exportar ZIP', description: err.message, variant: 'destructive' });
        }
    }, [gallery]);

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
                toast({ title: '📸 Foto do sujeito carregada!', className: 'bg-lime-500 text-white border-none' });
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
                // Adiciona referência imediatamente na galeria
                setConfig(prev => ({
                    ...prev,
                    styleReferences: [...prev.styleReferences, img]
                }));

                // ── Auto-describe: analisa referência via IA ──
                setIsExtracting(true);
                toast({ title: '🔍 Analisando referência de estilo...', className: 'bg-lime-500 text-white border-none' });
                try {
                    const result = await extractPromptFromImage(
                        `data:${img.mimeType};base64,${img.base64}`
                    );
                    // Atualiza a description da referência recém-adicionada
                    setConfig(prev => {
                        const refs = [...prev.styleReferences];
                        const lastIdx = refs.length - 1;
                        if (lastIdx >= 0) {
                            refs[lastIdx] = { ...refs[lastIdx], description: result.suggestedPrompt };
                        }
                        return { ...prev, styleReferences: refs };
                    });
                    toast({
                        title: '✅ Referência descrita automaticamente!',
                        description: `Estilo: ${result.lighting} | Câmera: ${result.cameraAngle}`,
                        className: 'bg-emerald-600 text-white border-none',
                    });
                } catch (extractErr: any) {
                    console.warn('[RefUpload] Auto-describe failed:', extractErr);
                    toast({ title: '⚠️ Não foi possível descrever a referência', description: 'Descreva manualmente no campo abaixo', className: 'bg-amber-500 text-white border-none' });
                } finally {
                    setIsExtracting(false);
                }
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
                // textOverlay — lógica exata do concorrente
                ...(config.useText && (config.textH1 || config.textH2) ? {
                    textOverlay: {
                        h1: config.textH1,
                        h2: config.textH2,
                        cta: config.textCTA,
                        position: config.position === 'LEFT' ? 'right side' : config.position === 'RIGHT' ? 'left side' : 'top area',
                        useGradient: config.useGradient,
                    }
                } : {}),
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
                    description: ref.description,
                    category: ref.category || 'style',
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
        <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/60 mb-3.5 mt-1">
            {children}
        </div>
    );

    const Separator = () => (
        <div className="h-px bg-white/5 my-5" />
    );

    const SelectionButton = ({ active, onClick, children, className }: any) => (
        <button
            onClick={onClick}
            className={`
                flex-1 py-1.5 px-3 rounded-lg text-[10px] uppercase font-bold text-center border transition-all
                ${active
                    ? 'bg-lime-500/20 text-lime-300 border-lime-400/50 shadow-sm shadow-lime-400/10'
                    : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60'
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
                        ? 'bg-lime-500/20 text-lime-300'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    <Compass className="w-5 h-5" />
                    Explorar
                </button>
                <button
                    onClick={() => setSidebarTab('create')}
                    className={`flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all text-[8px] font-bold uppercase tracking-wider ${sidebarTab === 'create'
                        ? 'bg-lime-500/20 text-lime-300'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    <Brush className="w-5 h-5" />
                    Criar
                </button>
                <button
                    onClick={() => setSidebarTab('gallery')}
                    className={`flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl transition-all text-[8px] font-bold uppercase tracking-wider ${sidebarTab === 'gallery'
                        ? 'bg-lime-500/20 text-lime-300'
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
                                        className="w-full aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-lime-400/50 transition-colors opacity-80 hover:opacity-100"
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
                <div className="w-full lg:w-[420px] bg-[#111111] rounded-none lg:rounded-none border-r border-white/5 flex flex-col shadow-sm shrink-0">

                    {/* ── TABS DE PROJETO ── */}
                    <div className="h-[38px] border-b border-white/5 flex items-center gap-0 px-1 overflow-x-auto scrollbar-hide">
                        {projects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => switchProject(project.id)}
                                onDoubleClick={() => {
                                    setEditingProjectId(project.id);
                                    setEditingName(project.name);
                                }}
                                className={`group relative flex items-center gap-1.5 px-3 h-full text-[9px] font-bold uppercase tracking-[0.08em] whitespace-nowrap transition-all border-b-2 ${activeProjectId === project.id
                                    ? 'text-lime-300 border-lime-400 bg-lime-500/5'
                                    : 'text-white/30 border-transparent hover:text-white/50 hover:bg-white/5'
                                    }`}
                            >
                                {editingProjectId === project.id ? (
                                    <input
                                        className="bg-transparent border-b border-lime-400 text-lime-300 text-[9px] font-bold uppercase w-20 outline-none"
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        onBlur={() => renameProject(project.id, editingName)}
                                        onKeyDown={e => { if (e.key === 'Enter') renameProject(project.id, editingName); }}
                                        autoFocus
                                    />
                                ) : (
                                    <span>{project.name}</span>
                                )}
                                {projects.length > 1 && activeProjectId === project.id && (
                                    <button
                                        onClick={e => { e.stopPropagation(); deleteProject(project.id); }}
                                        className="opacity-0 group-hover:opacity-100 ml-1 text-white/20 hover:text-red-400 transition-all"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                )}
                            </button>
                        ))}
                        <button
                            onClick={addProject}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/20 hover:text-lime-300 hover:bg-lime-500/10 transition-all ml-1 shrink-0"
                            title="Novo Projeto"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-1">

                            {/* SUJEITO PRINCIPAL */}
                            <SectionTitle>Sujeito Principal</SectionTitle>

                            {/* Upload */}
                            <div className="mb-3">
                                <Label className="text-[9px] uppercase font-bold tracking-wider text-white/40 mb-1.5 block">Fotos do Sujeito</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                                    h-24 border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group
                                    ${config.subjectImage ? 'border-lime-400 bg-lime-400/10' : 'border-white/10 hover:border-white/20 bg-white/5'}
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
                                            <Upload className="w-5 h-5 text-white/30 mb-1" />
                                            <span className="text-[10px] font-bold text-white/30 uppercase">Upload</span>
                                        </>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleSubjectUpload} />
                                </div>
                            </div>

                            {/* Quantidade */}
                            <div className="mb-3">
                                <Label className="text-[9px] uppercase font-bold tracking-wider text-white/40 mb-1.5 block">Quantidade</Label>
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
                                <Label className="text-[9px] uppercase font-bold tracking-wider text-white/40 mb-1.5 block">Gênero</Label>
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
                                className="bg-white/5 border-white/10 text-xs text-white resize-none focus:border-lime-400/50 focus:ring-0 min-h-[60px] rounded-xl placeholder:text-white/30"
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
                                                ? 'border-lime-400/50 bg-lime-500/10'
                                                : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }
                                    `}
                                    >
                                        <div className="w-full px-4 flex flex-col h-full justify-center">
                                            <div className={`flex flex-col ${pos.align} w-full gap-0.5`}>
                                                <div className={`w-3 h-3 rounded-full ${config.position === pos.id ? 'bg-lime-300' : 'bg-white/20'}`} />
                                                <div className="w-full h-0.5 bg-white/10 rounded-full" />
                                            </div>
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase ${config.position === pos.id ? 'text-lime-300' : 'text-white/30'}`}>
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
                                                ? 'border-lime-400/50 bg-lime-500/10 text-lime-300'
                                                : 'border-white/10 text-white/40 hover:bg-white/10'
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
                                        className="h-8 text-xs border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                        placeholder="Headline (H1)"
                                        value={config.textH1}
                                        onChange={e => updateConfig('textH1', e.target.value)}
                                    />
                                    <Input
                                        className="h-8 text-xs border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                        placeholder="Subheadline (H2)"
                                        value={config.textH2}
                                        onChange={e => updateConfig('textH2', e.target.value)}
                                    />
                                    <Input
                                        className="h-8 text-xs border-white/10 bg-white/5 text-white placeholder:text-white/30"
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
                                className="h-9 mb-2 text-xs border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                placeholder="Nicho/Projeto (Ex: Trader de Elite)"
                                value={config.niche}
                                onChange={e => updateConfig('niche', e.target.value)}
                            />
                            <Input
                                className="h-9 mb-2 text-xs border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                placeholder="Ambiente (Ex: Escritório Moderno)"
                                value={config.environment}
                                onChange={e => updateConfig('environment', e.target.value)}
                            />

                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-white/40">Usar fotos de cenário?</span>
                                <Switch checked={config.useSceneImages} onCheckedChange={v => updateConfig('useSceneImages', v)} />
                            </div>

                            <Separator />

                            {/* CORES & ILUMINAÇÃO */}
                            <SectionTitle>Cores & Iluminação</SectionTitle>

                            {/* Ambiente */}
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => toggleColor('ambient')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${config.activeColors.ambient ? 'bg-lime-500 text-white border-lime-400' : 'bg-white/5 text-white/30 border-white/10'}`}
                                >
                                    <Palette className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
                                    <span className="text-[10px] font-bold text-white/50 uppercase flex-1">Cor do Ambiente</span>
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
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${config.activeColors.rim ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-white/5 text-white/30 border-white/10'}`}
                                >
                                    <Sun className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
                                    <span className="text-[10px] font-bold text-white/50 uppercase flex-1">Luz de Recorte</span>
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
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${config.activeColors.complementary ? 'bg-purple-500 text-white border-purple-400' : 'bg-white/5 text-white/30 border-white/10'}`}
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
                                    <span className="text-[10px] font-bold text-white/50 uppercase flex-1">Luz Complementar</span>
                                    <input
                                        type="color"
                                        value={config.colors.complementary}
                                        onChange={e => updateColor('complementary', e.target.value)}
                                        className="w-5 h-5 rounded overflow-hidden border-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Opacidade do ambiente */}
                            <div className="bg-white/5 rounded-xl p-3 mb-3">
                                <div className="flex justify-between mb-2">
                                    <Label className="text-[10px] uppercase font-bold text-white/50">Opacidade do Ambiente</Label>
                                    <span className="text-[10px] font-bold text-white">{config.ambientOpacity}%</span>
                                </div>
                                <Slider
                                    value={[config.ambientOpacity]}
                                    onValueChange={([v]) => updateConfig('ambientOpacity', v)}
                                    max={100}
                                    step={5}
                                    className="mb-1"
                                />
                                <div className="flex justify-between text-[8px] uppercase font-bold text-white/30">
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
                                                ? 'border-lime-400/50 bg-lime-500/10'
                                                : 'border-white/10 hover:bg-white/10'
                                            }
                                    `}
                                    >
                                        <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center
                                        ${config.framing === item.id ? 'bg-lime-500 text-white' : 'bg-white/10 text-white/40'}
                                    `}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-white">{item.label}</div>
                                            <div className="text-[9px] text-white/40">{item.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-white/40">Elementos Flutuantes?</span>
                                <Switch checked={config.useFloatingElements} onCheckedChange={v => updateConfig('useFloatingElements', v)} />
                            </div>

                            <Separator />

                            {/* REFERÊNCIAS DE ESTILO (Ref Upload) */}
                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-4">
                                <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/50 mb-3">
                                    Referências de Estilo
                                </div>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    {config.styleReferences.map((ref, idx) => (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 group">
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
                                            <input
                                                type="text"
                                                placeholder="Desc..."
                                                value={ref.description || ''}
                                                onChange={e => {
                                                    const newRefs = [...config.styleReferences];
                                                    newRefs[idx] = { ...newRefs[idx], description: e.target.value };
                                                    updateConfig('styleReferences', newRefs);
                                                }}
                                                className="w-14 text-[7px] px-1 py-0.5 border border-white/10 rounded bg-white/5 text-white/70 placeholder:text-white/30"
                                            />
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => refInputRef.current?.click()}
                                        className="w-14 h-14 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400/50 hover:bg-lime-500/10 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-white/40" />
                                    </div>
                                </div>
                                <input ref={refInputRef} type="file" className="hidden" accept="image/*" onChange={handleRefUpload} />
                            </div>

                            {/* ATRIBUTOS VISUAIS */}
                            <SectionTitle>Atributos Visuais & Estilo</SectionTitle>

                            <div className="bg-white/5 rounded-xl p-3 mb-4">
                                <div className="flex justify-between mb-2">
                                    <Label className="text-[10px] uppercase font-bold text-white/50">Sobriedade</Label>
                                    <span className="text-[10px] font-bold text-white">{config.sobriety}</span>
                                </div>
                                <Slider
                                    value={[config.sobriety]}
                                    onValueChange={([v]) => updateConfig('sobriety', v)}
                                    max={100}
                                    step={1}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-[8px] uppercase font-bold text-white/30">
                                    <span>Criativo</span>
                                    <span>Profissional</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">Ativar Estilo Visual</span>
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
                                                ? 'bg-lime-500/30 text-lime-200 border-lime-400/50'
                                                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                                            }
                                    `}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-white/40">Desfoque (Blur)</span>
                                <Switch checked={config.useBlur} onCheckedChange={v => updateConfig('useBlur', v)} />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-white/40">Degradê Lateral</span>
                                <Switch checked={config.useGradient} onCheckedChange={v => updateConfig('useGradient', v)} />
                            </div>

                            <Separator />

                            {/* Prompt Adicional */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-[10px] font-bold uppercase text-white/40">Prompt Adicional</span>
                                <Switch checked={config.useExtraPrompt} onCheckedChange={v => updateConfig('useExtraPrompt', v)} />
                            </div>
                            {config.useExtraPrompt && (
                                <Textarea
                                    placeholder="Instruções extras..."
                                    className="text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30"
                                    value={config.extraPrompt}
                                    onChange={e => updateConfig('extraPrompt', e.target.value)}
                                />
                            )}



                            {/* BOTÕES DE AÇÃO */}
                            <div className="sticky bottom-0 bg-[#111111] pt-4 pb-2 border-t border-white/5 mt-4 space-y-2 z-10">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className={`
                                    w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider
                                    ${isGenerating
                                            ? 'bg-lime-900/30 text-lime-300'
                                            : 'bg-lime-500 text-white hover:bg-lime-400 hover:scale-[1.01] transition-transform'
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
                                    variant="ghost"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                                    className="w-full h-9 rounded-xl text-[10px] font-bold border border-white/10 hover:!bg-lime-500/10 hover:!text-lime-300 hover:border-lime-400/30"
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
                                    variant="ghost"
                                    style={forensicOpen
                                        ? { backgroundColor: 'rgba(245,158,11,0.2)', color: 'rgb(251,191,36)' }
                                        : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }
                                    }
                                    className={`w-full h-9 rounded-xl text-[10px] font-bold tracking-wider border ${forensicOpen
                                        ? 'border-amber-500/30'
                                        : 'border-white/10 hover:!bg-amber-500/10 hover:!text-amber-400 hover:border-amber-500/20'
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
                                        ? 'border-lime-400 bg-lime-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-lime-400/50 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-lg">
                                        {style.label}
                                    </span>
                                    {config.selectedStyle === style.id && (
                                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center">
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
                        <button
                            onClick={handleExportZip}
                            disabled={gallery.length === 0}
                            className="bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-40 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors"
                            title="Exportar todas como ZIP"
                        >
                            <PackageOpen className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => setChatOpen(o => !o)}
                            className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors ${chatOpen ? 'bg-lime-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                            title="Chat IA"
                        >
                            <Bot className="w-3 h-3" />
                        </button>
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
                                    <Loader2 className="w-4 h-4 text-lime-300 animate-spin shrink-0" />
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
                            <div key={idx} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 group relative animate-in fade-in slide-in-from-bottom-4 duration-500 hover:border-lime-400/30 transition-colors">
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
                                                let blob = await response.blob();
                                                if (!blob.type || blob.type === 'application/octet-stream') {
                                                    blob = new Blob([blob], { type: 'image/png' });
                                                }
                                                const d = new Date(img.timestamp);
                                                const pad = (n: number) => String(n).padStart(2, '0');
                                                const safeName = `design-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.png`;
                                                saveAs(blob, safeName);
                                                toast({ title: `📥 Baixando ${safeName}` });
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


            </div>

            {/* LIGHTBOX */}
            <ImageLightbox
                images={gallery}
                currentIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onIndexChange={setLightboxIndex}
                onInpaint={handleInpaint}
                onReframe={handleReframe}
                onTextOverlay={handleTextOverlay}
                onRefine={handleLightboxRefine}
                initialTexts={{ h1: config.textH1, h2: config.textH2, cta: config.textCTA }}
            />

            {/* CHAT IA PANEL */}
            <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

            {/* FORENSIC PANEL */}
            <ForensicPanel
                log={lastForensicLog}
                isOpen={forensicOpen}
                onClose={() => setForensicOpen(false)}
            />
        </div>
    );
}

// ── Error Boundary ──
class DesignerErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: string }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: '' };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message };
    }
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[DesignerErrorBoundary] Crash capturado:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white gap-4">
                    <div className="text-6xl">⚠️</div>
                    <h2 className="text-xl font-bold">Algo deu errado</h2>
                    <p className="text-white/50 text-sm max-w-md text-center">{this.state.error}</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: '' });
                            window.location.reload();
                        }}
                        className="px-6 py-2 bg-lime-500 text-black font-bold rounded-xl hover:bg-lime-400 transition-colors"
                    >
                        🔄 Recarregar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function DesignerDoFuturoWithBoundary() {
    return (
        <DesignerErrorBoundary>
            <DesignerDoFuturoGenerator />
        </DesignerErrorBoundary>
    );
}

export default DesignerDoFuturoWithBoundary;
