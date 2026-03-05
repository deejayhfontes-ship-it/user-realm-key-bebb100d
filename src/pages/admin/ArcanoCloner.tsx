import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig, ReferenceImage } from '@/hooks/useGeminiImageGeneration';
import {
    Upload, X, Sparkles, Loader2, Download, ChevronLeft,
    Camera, Building2, Sun, TreePine, Star, Briefcase
} from 'lucide-react';

const ESTILOS = [
    { id: 'studio', label: 'Estúdio Premium', icon: Camera, prompt: 'luxury photography studio with soft bokeh background, professional lighting setup, clean white and gray tones' },
    { id: 'outdoor', label: 'Outdoor Urbano', icon: Building2, prompt: 'urban outdoor environment, modern city background, natural sunlight, architectural elements' },
    { id: 'nature', label: 'Natureza', icon: TreePine, prompt: 'nature environment, lush green vegetation, soft natural light, peaceful landscape' },
    { id: 'golden', label: 'Golden Hour', icon: Sun, prompt: 'golden hour outdoor, warm sunset lighting, cinematic orange and amber tones, dramatic sky' },
    { id: 'fashion', label: 'Fashion Editorial', icon: Star, prompt: 'high-end fashion editorial, magazine quality, dramatic lighting, high contrast aesthetic' },
    { id: 'corporate', label: 'Corporativo', icon: Briefcase, prompt: 'professional corporate environment, modern office background, clean and confident atmosphere' },
];

export default function ArcanoCloner() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [selectedEstilo, setSelectedEstilo] = useState(ESTILOS[0]);
    const [quantity, setQuantity] = useState(1);
    const [results, setResults] = useState<Array<{ src: string; timestamp: number }>>([]);
    const [currentGenerating, setCurrentGenerating] = useState(0);

    const { generate, isGenerating, progress } = useGeminiImageGeneration();

    const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setUploadedPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!uploadedPhoto) {
            toast({ title: 'Faça upload de uma foto primeiro', variant: 'destructive' });
            return;
        }

        setCurrentGenerating(0);
        const newResults: Array<{ src: string; timestamp: number }> = [];

        try {
            // Foto do sujeito como referência principal
            const referenceImages: ReferenceImage[] = [
                {
                    data: uploadedPhoto.replace(/^data:[^,]+,/, ''),
                    mimeType: 'image/jpeg',
                    description: 'SUBJECT REFERENCE — preserve face, skin tone, hair color and identity exactly',
                    category: 'style',
                }
            ];

            const config: GenerationConfig = {
                niche: 'Arcano Cloner — Ensaio Fotográfico Ultra-Realista',
                gender: 'neutral',
                subjectDescription: `Ultra-realistic photographic portrait of the exact person from the reference photo.
CRITICAL: Preserve 100% the face features, skin tone, hair color, hair style, eye color, and identity.
The result must look like a real professional photograph of the same person.`,
                environment: selectedEstilo.prompt,
                sobriety: 75,
                style: 'cinematic',
                useStyle: true,
                colors: { ambient: '#ffffff', rim: '#f5e6c8', complementary: '#c8d8f5' },
                colorFlags: { ambient: false, rim: true, complementary: false },
                ambientOpacity: 20,
                useBlur: true,
                useGradient: false,
                useFloatingElements: false,
                floatingElementsDescription: '',
                shotType: 'MEDIUM',
                additionalInstructions: `Arcano Photo Cloner: The generated image MUST look like a real professional photograph of the exact same person from the reference. Ultra-realistic, no illustration, no AI-generated artifacts. Professional photoshoot quality. ${selectedEstilo.label} environment.`,
                dimension: '4:5',
                safeAreaSide: 'CENTER',
                personCount: 1,
            };

            for (let i = 0; i < quantity; i++) {
                setCurrentGenerating(i + 1);
                const result = await generate(config, referenceImages);
                const blob = await fetch(`data:${result.mimeType};base64,${result.imageBase64}`).then(r => r.blob());
                const src = URL.createObjectURL(blob);
                newResults.push({ src, timestamp: Date.now() });
                setResults(prev => [{ src, timestamp: Date.now() }, ...prev]);
            }

            toast({ title: `✅ ${newResults.length} imagem(ns) gerada(s) com sucesso!` });
        } catch (err: any) {
            toast({ title: `Erro: ${err.message}`, variant: 'destructive' });
        }
    }, [uploadedPhoto, selectedEstilo, quantity, generate]);

    const downloadImage = useCallback(async (src: string, index: number) => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = URL.createObjectURL(new Blob([blob], { type: 'image/png' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `arcano-cloner-${Date.now()}-${index + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            toast({ title: 'Erro ao baixar imagem', variant: 'destructive' });
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f]">
            <AdminHeader
                title="Arcano Cloner"
                subtitle="Crie ensaios fotográficos ultra-realistas com IA"
                action={
                    <button
                        onClick={() => navigate('/admin/arcano')}
                        className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Voltar
                    </button>
                }
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Painel esquerdo: configurações */}
                <div className="w-[360px] shrink-0 border-r border-white/5 bg-[#0d0d15] overflow-y-auto p-5 flex flex-col gap-5">

                    {/* Upload foto */}
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-3">
                            1. Foto de Referência
                        </p>
                        {uploadedPhoto ? (
                            <div className="relative rounded-2xl overflow-hidden border border-violet-500/30">
                                <img src={uploadedPhoto} className="w-full h-48 object-cover" alt="Referência" />
                                <button
                                    onClick={() => setUploadedPhoto(null)}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-violet-500/80 text-white text-[9px] font-bold">
                                    ✓ Foto carregada
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-44 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-400/40 hover:bg-violet-500/5 flex flex-col items-center justify-center gap-3 transition-all"
                            >
                                <Upload className="w-8 h-8 text-white/20" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white/40">Upload da foto</p>
                                    <p className="text-xs text-white/20">JPG, PNG até 10MB</p>
                                </div>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>

                    {/* Estilo / Ambiente */}
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-3">
                            2. Ambiente / Estilo
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {ESTILOS.map((estilo) => (
                                <button
                                    key={estilo.id}
                                    onClick={() => setSelectedEstilo(estilo)}
                                    className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all
                    ${selectedEstilo.id === estilo.id
                                            ? 'border-violet-400/60 bg-violet-500/20 text-violet-200'
                                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                                        }
                  `}
                                >
                                    <estilo.icon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="text-[10px] font-bold truncate">{estilo.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantidade */}
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-3">
                            3. Quantidade de Variações
                        </p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setQuantity(n)}
                                    className={`
                    flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all
                    ${quantity === n
                                            ? 'border-violet-400/60 bg-violet-500/20 text-violet-200'
                                            : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                                        }
                  `}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Botão gerar */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !uploadedPhoto}
                        className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm disabled:opacity-40 transition-all mt-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {progress || `Gerando ${currentGenerating}/${quantity}...`}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Gerar Ensaio Fotográfico
                            </>
                        )}
                    </Button>

                    {!uploadedPhoto && (
                        <p className="text-center text-xs text-white/20">Faça upload de uma foto para começar</p>
                    )}
                </div>

                {/* Painel direito: resultados */}
                <div className="flex-1 bg-[#0a0a0f] overflow-y-auto p-6">
                    {results.length === 0 && !isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <Camera className="w-8 h-8 text-white/20" />
                            </div>
                            <p className="text-sm font-bold text-white/30">Aguardando ensaio</p>
                            <p className="text-xs text-white/20 mt-1">Configure e clique em Gerar Ensaio Fotográfico</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {isGenerating && (
                                <div className="rounded-2xl overflow-hidden border border-violet-500/20 bg-violet-900/10 animate-pulse aspect-[4/5] flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-violet-400/70 font-medium">{progress || `${currentGenerating}/${quantity}`}</p>
                                    </div>
                                </div>
                            )}
                            {results.map((img, idx) => (
                                <div
                                    key={`${img.timestamp}-${idx}`}
                                    className="group rounded-2xl overflow-hidden border border-white/10 hover:border-violet-400/30 transition-colors relative"
                                >
                                    <img src={img.src} className="w-full block" loading="lazy" alt={`Resultado ${idx + 1}`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                        <button
                                            onClick={() => downloadImage(img.src, idx)}
                                            className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Baixar PNG
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
