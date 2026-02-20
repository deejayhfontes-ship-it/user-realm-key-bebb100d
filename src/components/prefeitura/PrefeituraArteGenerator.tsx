import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Sparkles,
    Upload,
    Download,
    Loader2,
    AlertCircle,
    X,
    Image as ImageIcon,
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
    Check,
    Wand2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig } from '@/hooks/useGeminiImageGeneration';
import { ImageLightbox } from '@/components/generators/ImageLightbox';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { usePrefeituraAssets } from '@/hooks/usePrefeituraAssets';

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

// ── Opções de formulário ──
const SECRETARIAS = [
    'Saúde', 'Educação', 'Cultura', 'Esporte e Lazer',
    'Obras e Infraestrutura', 'Meio Ambiente', 'Assistência Social',
    'Administração', 'Gabinete', 'Comunicação', 'Outro',
];

const INTENCOES = [
    { id: 'informar', label: '📰 Informar', desc: 'Noticiar fato ou ação' },
    { id: 'avisar', label: '⚠️ Avisar', desc: 'Alertar sobre prazo ou mudança' },
    { id: 'convocar', label: '📢 Convocar', desc: 'Chamar para reunião ou evento' },
    { id: 'conscientizar', label: '💡 Conscientizar', desc: 'Campanha de saúde, meio ambiente' },
    { id: 'evento', label: '🎉 Evento', desc: 'Divulgar evento da prefeitura' },
    { id: 'utilidade', label: '🏛️ Utilidade Pública', desc: 'Horário, endereço, serviço' },
    { id: 'cta', label: '👉 Chamada para Ação', desc: 'Inscrição, cadastro, comparecimento' },
];

const TIPOS_PECA = [
    { id: 'story', label: 'Story', dimension: '1080x1920', icon: '📱' },
    { id: 'post', label: 'Post', dimension: '1080x1080', icon: '📷' },
    { id: 'carrossel', label: 'Carrossel', dimension: '1080x1080', icon: '🎠' },
    { id: 'banner', label: 'Banner', dimension: '1920x1080', icon: '🖼️' },
    { id: 'cartaz', label: 'Cartaz A4', dimension: '1080x1527', icon: '📄' },
];

const FORMATOS = [
    { id: 'quadrado', label: 'Quadrado', ratio: '1:1', dimension: '1080x1080' },
    { id: 'vertical', label: 'Vertical', ratio: '9:16', dimension: '1080x1920' },
    { id: 'paisagem', label: 'Paisagem', ratio: '16:9', dimension: '1920x1080' },
];

const ESTILOS = [
    { id: 'institutional', label: '🏛️ Institucional' },
    { id: 'classic', label: '📐 Clássico' },
    { id: 'minimalist', label: '⚪ Minimalista' },
    { id: 'playful', label: '🎨 Colorido' },
    { id: 'ultra_realistic', label: '📸 Realista' },
    { id: 'elegant', label: '✨ Elegante' },
];

// ── Storage Keys (isolados da versão original) ──
const PREF_GALLERY_KEY = 'prefeitura_gallery';
const MAX_GALLERY = 50;

// ── Componente Principal ──
export function PrefeituraArteGenerator() {
    const navigate = useNavigate();
    const { generate, isGenerating, progress } = useGeminiImageGeneration();

    // ── Estado do formulário ──
    const [step, setStep] = useState(1); // Wizard steps: 1=Info, 2=Visual, 3=Resultado
    const [secretaria, setSecretaria] = useState('');
    const [titulo, setTitulo] = useState('');
    const [intencao, setIntencao] = useState('');
    const [tipoPeca, setTipoPeca] = useState('post');
    const [formato, setFormato] = useState('quadrado');
    const [estilo, setEstilo] = useState('institutional');
    const [descricaoExtra, setDescricaoExtra] = useState('');
    const [subjectImage, setSubjectImage] = useState<ReferenceImage | null>(null);
    const [refImage, setRefImage] = useState<ReferenceImage | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const refInputRef = useRef<HTMLInputElement>(null);

    // Hook de Assets da Prefeitura (Agente Migrado)
    const { currentSecretaria, getStylePrompt, buildPrefeituraPrompt } = usePrefeituraAssets(secretaria);

    // ── Galeria Separada ──
    const [gallery, setGallery] = useState<GeneratedImage[]>(() => {
        try {
            const saved = localStorage.getItem(PREF_GALLERY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Persistir galeria
    useEffect(() => {
        try {
            const trimmed = gallery.slice(0, MAX_GALLERY);
            localStorage.setItem(PREF_GALLERY_KEY, JSON.stringify(trimmed));
        } catch {
            console.warn('[PREF-GALLERY] localStorage cheio');
        }
    }, [gallery]);

    // ── Process Image ──
    const processImage = async (file: File): Promise<ReferenceImage> => {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) reject('Apenas imagens');
            const reader = new FileReader();
            reader.onload = (e) => {
                const res = e.target?.result as string;
                resolve({ base64: res.split(',')[1], mimeType: file.type, preview: res });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const img = await processImage(file);
                setSubjectImage(img);
                toast({ title: '📸 Foto carregada!', className: 'bg-emerald-500 text-white border-none' });
            } catch {
                toast({ title: 'Arquivo inválido', variant: 'destructive' });
            }
        }
    };

    const handleRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const img = await processImage(file);
                setRefImage(img);
                toast({ title: '🎨 Referência carregada!', className: 'bg-emerald-500 text-white border-none' });
            } catch {
                toast({ title: 'Arquivo inválido', variant: 'destructive' });
            }
        }
    };

    // ── Resolve a dimensão ──
    const getDimension = (): string => {
        const tipoDef = TIPOS_PECA.find(t => t.id === tipoPeca);
        if (tipoPeca === 'story') return '1080x1920';
        if (tipoPeca === 'banner') return '1920x1080';
        if (tipoPeca === 'cartaz') return '1080x1527';
        // post e carrossel: usa o formato selecionado
        const fmtDef = FORMATOS.find(f => f.id === formato);
        return fmtDef?.dimension || tipoDef?.dimension || '1080x1080';
    };

    // ── Gerar ──
    const handleGenerate = async () => {
        if (!titulo.trim()) {
            toast({ title: 'Atenção', description: 'Preencha o título do criativo', variant: 'destructive' });
            return;
        }

        try {
            const intencaoLabel = INTENCOES.find(i => i.id === intencao)?.label || 'Informar';
            const secretariaLabel = secretaria || 'Prefeitura';
            const dimension = getDimension();

            // Montar niche baseado nos campos guiados
            const niche = `Prefeitura Municipal - ${secretariaLabel}`;
            const environment = `Official government communication, ${intencaoLabel.replace(/[^\w\s]/g, '')} tone, clean institutional design`;

            const tipoPecaLabel = TIPOS_PECA.find(t => t.id === tipoPeca)?.label || 'Arte';

            // Mapeamento de formato para dimensões
            const dimensions: Record<string, string> = {
                'quadrado': '1080x1080',
                'vertical': '1080x1920',
                'paisagem': '1920x1080'
            };

            // Usa o "Agente" migrado para construir o prompt
            const promptDoAgente = buildPrefeituraPrompt(
                tipoPecaLabel,
                titulo, // tema
                intencaoLabel, // intencao
                descricaoExtra // detalhes
            );

            const generationConfig: GenerationConfig = {
                niche,
                gender: 'neutral',
                subjectDescription: promptDoAgente, // Prompt rico gerado pelo agente
                environment,
                sobriety: 50, // Padrão balanceado
                style: estilo,
                useStyle: !!estilo,
                colors: { ambient: '#ffffff', rim: '#ffffff', complementary: '#ffffff' },
                colorFlags: { ambient: false, rim: false, complementary: false },
                ambientOpacity: 0,
                useBlur: false,
                useGradient: false,
                useFloatingElements: false,
                floatingElementsDescription: '',
                shotType: 'MEDIUM',
                additionalInstructions: descricaoExtra,
                dimension: dimensions[formato] || '1080x1080',
                safeAreaSide: 'CENTER',
                personCount: 1,
            };

            const referenceImages = [];
            if (subjectImage) {
                referenceImages.push({
                    data: `data:${subjectImage.mimeType};base64,${subjectImage.base64}`,
                    mimeType: subjectImage.mimeType,
                });
            }
            if (refImage) {
                referenceImages.push({
                    data: `data:${refImage.mimeType};base64,${refImage.base64}`,
                    mimeType: refImage.mimeType || 'image/jpeg',
                    description: refImage.description,
                    category: 'style' as const,
                });
            }

            const result = await generate(generationConfig, referenceImages);

            const newImg: GeneratedImage = {
                src: `data:${result.mimeType};base64,${result.imageBase64}`,
                prompt: result.finalPrompt,
                timestamp: Date.now(),
            };
            setGallery(prev => [newImg, ...prev]);
            setStep(3); // vai para resultado
            toast({ title: '✨ Arte gerada com sucesso!', className: 'bg-emerald-600 text-white border-none' });

        } catch (err: any) {
            console.error('[pref-generate] Erro:', err);
            toast({
                title: 'Erro na geração',
                description: err.message || 'Tente novamente em instantes.',
                variant: 'destructive',
            });
        }
    };

    // ── Download com Overlay (Agente Visual) ──
    const handleDownload = async (img: GeneratedImage) => {
        try {
            // Se não tiver logo ou configuração, baixa direto
            if (!currentSecretaria?.logoUrl) {
                const response = await fetch(img.src);
                let blob = await response.blob();
                if (!blob.type || blob.type === 'application/octet-stream') {
                    blob = new Blob([blob], { type: 'image/png' });
                }
                saveAs(blob, `prefeitura-${Date.now()}.png`);
                return;
            }

            // Processamento com Canvas para aplicar marca d'água
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const imageBase = new Image();
            imageBase.crossOrigin = "anonymous";
            imageBase.src = img.src;

            await new Promise((resolve, reject) => {
                imageBase.onload = resolve;
                imageBase.onerror = reject;
            });

            canvas.width = imageBase.width;
            canvas.height = imageBase.height;

            if (ctx) {
                // 1. Desenha imagem base
                ctx.drawImage(imageBase, 0, 0);

                // 2. Carrega e desenha Logo
                try {
                    const logo = new Image();
                    logo.crossOrigin = "anonymous";
                    logo.src = currentSecretaria.logoUrl;

                    await new Promise((resolve, reject) => {
                        logo.onload = resolve;
                        logo.onerror = reject;
                    });

                    // Cálculos de posicionamento (Canto Superior Direito)
                    const logoWidth = canvas.width * 0.20; // 20% da largura da arte
                    const scale = logoWidth / logo.width;
                    const logoHeight = logo.height * scale;
                    const margin = canvas.width * 0.05; // 5% de margem

                    // Sombra suave para garantir leitura
                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;

                    ctx.drawImage(logo, canvas.width - logoWidth - margin, margin, logoWidth, logoHeight);

                } catch (e) {
                    console.warn('Erro ao carregar logo para overlay, salvando sem logo.', e);
                }
            }

            // 3. Exporta e Salva
            canvas.toBlob((blob) => {
                if (blob) {
                    const d = new Date();
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const safeName = `prefeitura-${secretaria}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.png`;
                    saveAs(blob, safeName);
                    toast({ title: '📥 Baixando arte oficial com logo...' });
                } else {
                    throw new Error('Falha ao gerar blob do canvas');
                }
            }, 'image/png', 1.0);

        } catch (err) {
            console.error('Erro no download:', err);
            // Fallback
            saveAs(img.src, `prefeitura-backup-${Date.now()}.png`);
            toast({ title: 'Baixando versão simples (erro no overlay)', variant: 'destructive' });
        }
    };

    // ── Render ──
    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/prefeitura')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar</span>
                    </button>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Crie sua Arte
                    </h1>
                    <div className="w-20" /> {/* spacer */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    {[
                        { n: 1, label: 'Informações' },
                        { n: 2, label: 'Visual' },
                        { n: 3, label: 'Resultado' },
                    ].map((s) => (
                        <button
                            key={s.n}
                            onClick={() => s.n <= step && setStep(s.n)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === s.n
                                ? 'bg-emerald-500 text-black'
                                : step > s.n
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}
                        >
                            {step > s.n ? <Check className="w-4 h-4" /> : <span>{s.n}</span>}
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* === STEP 1: Informações === */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Secretaria */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                🏛️ Secretaria / Setor
                            </label>
                            <select
                                value={secretaria}
                                onChange={(e) => setSecretaria(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-400/50 text-white rounded-xl px-4 py-3 outline-none transition-colors"
                            >
                                <option value="">Selecione...</option>
                                {SECRETARIAS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Título */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                ✏️ Título do Criativo
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex: Vacinação contra a Gripe - Dia D"
                                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                            />
                        </div>

                        {/* Intenção */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                🎯 Intenção
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {INTENCOES.map(i => (
                                    <button
                                        key={i.id}
                                        onClick={() => setIntencao(i.id)}
                                        className={`p-3 rounded-xl text-left transition-all text-sm ${intencao === i.id
                                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                            : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="font-medium">{i.label}</span>
                                        <p className="text-xs mt-1 opacity-60">{i.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Descrição extra */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                📝 Detalhes adicionais <span className="text-zinc-600 font-normal">(opcional)</span>
                            </label>
                            <textarea
                                value={descricaoExtra}
                                onChange={(e) => setDescricaoExtra(e.target.value)}
                                placeholder="Ex: Incluir informações de data, horário, local. Cores azul e branco. Destacar logo da prefeitura..."
                                rows={3}
                                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors resize-none"
                            />
                        </div>

                        {/* Botão Próximo */}
                        <button
                            onClick={() => setStep(2)}
                            disabled={!titulo.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-400/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Próximo
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* === STEP 2: Visual === */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Tipo de peça */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                📐 Tipo de Peça
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {TIPOS_PECA.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTipoPeca(t.id)}
                                        className={`p-3 rounded-xl text-center transition-all ${tipoPeca === t.id
                                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                            : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="text-xl block mb-1">{t.icon}</span>
                                        <span className="text-xs font-medium">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Formato (só para post e carrossel) */}
                        {(tipoPeca === 'post' || tipoPeca === 'carrossel') && (
                            <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                    📏 Formato
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {FORMATOS.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFormato(f.id)}
                                            className={`p-4 rounded-xl text-center transition-all ${formato === f.id
                                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                                : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                                }`}
                                        >
                                            <span className="text-sm font-bold">{f.label}</span>
                                            <p className="text-xs mt-1 opacity-60">{f.ratio}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estilo Visual */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                🎨 Estilo Visual
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {ESTILOS.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setEstilo(s.id)}
                                        className={`p-3 rounded-xl text-center transition-all text-sm ${estilo === s.id
                                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                            : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload de foto (opcional) */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                📸 Foto principal <span className="text-zinc-600 font-normal">(opcional)</span>
                            </label>
                            {subjectImage ? (
                                <div className="relative inline-block">
                                    <img src={subjectImage.preview} className="w-32 h-32 object-cover rounded-xl border border-zinc-700" />
                                    <button
                                        onClick={() => setSubjectImage(null)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="block cursor-pointer">
                                    <div className="border-2 border-dashed border-zinc-800 hover:border-emerald-400/40 rounded-xl p-8 text-center transition-all group">
                                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 mx-auto mb-2 transition-colors" />
                                        <p className="text-zinc-500 text-sm">Clique para selecionar</p>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleSubjectUpload} />
                                </label>
                            )}
                        </div>

                        {/* Referência visual (opcional) */}
                        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3">
                                🎨 Referência visual <span className="text-zinc-600 font-normal">(opcional)</span>
                            </label>
                            {refImage ? (
                                <div className="relative inline-block">
                                    <img src={refImage.preview} className="w-32 h-32 object-cover rounded-xl border border-zinc-700" />
                                    <button
                                        onClick={() => setRefImage(null)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="block cursor-pointer">
                                    <div className="border-2 border-dashed border-zinc-800 hover:border-emerald-400/40 rounded-xl p-8 text-center transition-all group">
                                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 mx-auto mb-2 transition-colors" />
                                        <p className="text-zinc-500 text-sm">Clique para selecionar</p>
                                    </div>
                                    <input ref={refInputRef} type="file" className="hidden" accept="image/*" onChange={handleRefUpload} />
                                </label>
                            )}
                        </div>

                        {/* Botões Voltar/Gerar */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium py-4 rounded-xl hover:bg-zinc-800 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Voltar
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-400/25 transition-all disabled:opacity-60"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {progress || 'Gerando...'}
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        Gerar Arte
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Progress durante geração */}
                        {isGenerating && progress && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                                <p className="text-emerald-300 text-sm font-medium">{progress}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === STEP 3: Resultado === */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {gallery.length > 0 && (
                            <>
                                {/* Última imagem grande */}
                                <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-emerald-400" />
                                        Sua Arte
                                    </h3>
                                    <div
                                        className="relative cursor-pointer group"
                                        onClick={() => {
                                            setLightboxIndex(0);
                                            setLightboxOpen(true);
                                        }}
                                    >
                                        <img
                                            src={gallery[0].src}
                                            className="w-full rounded-xl border border-zinc-800 group-hover:border-emerald-500/30 transition-all"
                                            alt="Arte gerada"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm transition-opacity bg-black/50 px-4 py-2 rounded-full">
                                                Clique para ampliar
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botão Download */}
                                    <button
                                        onClick={() => handleDownload(gallery[0])}
                                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-400/25 transition-all"
                                    >
                                        <Download className="w-5 h-5" />
                                        Baixar PNG
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Galeria de artes anteriores */}
                        {gallery.length > 1 && (
                            <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-6">
                                <h3 className="text-sm font-semibold text-zinc-400 mb-4">
                                    📂 Artes Anteriores ({gallery.length - 1})
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {gallery.slice(1).map((img, idx) => (
                                        <div
                                            key={img.timestamp}
                                            className="relative group cursor-pointer"
                                            onClick={() => {
                                                setLightboxIndex(idx + 1);
                                                setLightboxOpen(true);
                                            }}
                                        >
                                            <img
                                                src={img.src}
                                                className="w-full aspect-square object-cover rounded-lg border border-zinc-800 group-hover:border-emerald-500/30 transition-all"
                                                alt={`Arte ${idx + 2}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botão Nova Arte */}
                        <button
                            onClick={() => {
                                setStep(1);
                                setTitulo('');
                                setSecretaria('');
                                setIntencao('');
                                setDescricaoExtra('');
                                setSubjectImage(null);
                                setRefImage(null);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium py-4 rounded-xl hover:bg-zinc-800 transition-all"
                        >
                            <Wand2 className="w-5 h-5" />
                            Criar Nova Arte
                        </button>
                    </div>
                )}
            </main>

            {/* Lightbox */}
            {lightboxOpen && gallery.length > 0 && (
                <ImageLightbox
                    images={gallery}
                    currentIndex={lightboxIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    onIndexChange={setLightboxIndex}
                />
            )}
        </div>
    );
}

// ── Error Boundary ──
class PrefeituraArteErrorBoundary extends React.Component<
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
        console.error('[pref-arte-boundary] Crash:', error, info);
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
                        className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                    >
                        🔄 Recarregar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function PrefeituraArteWithBoundary() {
    return (
        <PrefeituraArteErrorBoundary>
            <PrefeituraArteGenerator />
        </PrefeituraArteErrorBoundary>
    );
}
