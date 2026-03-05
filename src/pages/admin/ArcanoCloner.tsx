import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig, ReferenceImage } from '@/hooks/useGeminiImageGeneration';
import { Upload, X, Sparkles, Loader2, Download, BookOpen, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LIME = '#D8FF9A';

const PROPORCOES = [
    { id: '9:16', label: 'Stories', sub: '9:16', icon: '📱' },
    { id: '1:1', label: 'Quadrado', sub: '1:1', icon: '⬛' },
    { id: '3:4', label: 'Feed Vert.', sub: '3:4', icon: '📐' },
    { id: '16:9', label: 'Retangular', sub: '16:9', icon: '🖥️' },
];

function UploadBox({
    label, value, onChange, onClear, extraButton
}: {
    label: string;
    value: string | null;
    onChange: (b64: string) => void;
    onClear: () => void;
    extraButton?: React.ReactNode;
}) {
    const ref = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image'));
        if (!item) return;
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target?.result as string);
        reader.readAsDataURL(file);
    }, [onChange]);

    return (
        <div>
            <p className="text-xs font-medium text-white/60 mb-2">{label}</p>
            {value ? (
                <div className="relative rounded-xl overflow-hidden border h-44" style={{ borderColor: 'rgba(216,255,154,0.3)' }}>
                    <img src={value} className="w-full h-full object-cover" alt={label} />
                    <button
                        onClick={onClear}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                        title="Remover"
                    >
                        <X className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <button
                        onClick={() => ref.current?.click()}
                        onPaste={handlePaste}
                        className="w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(216,255,154,0.3)'; e.currentTarget.style.background = 'rgba(216,255,154,0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(216,255,154,0.1)' }}>
                            <Upload className="w-5 h-5" style={{ color: LIME }} />
                        </div>
                        <p className="text-xs text-white/40 font-medium">Arraste ou clique</p>
                        <p className="text-[10px]" style={{ color: 'rgba(216,255,154,0.6)' }}>Ctrl+V para colar</p>
                    </button>
                    {extraButton}
                </div>
            )}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
}

// Modal to pick from the prompt library
function BibliotecaModal({ isOpen, onClose, onSelect }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string, prompt: string) => void;
}) {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            setLoading(true);
            const { data } = await (supabase as any)
                .from('arcano_prompts')
                .select('id,title,image_url,thumbnail_url,prompt,category')
                .not('image_url', 'is', null)
                .order('click_count', { ascending: false })
                .limit(100);
            if (data) setPrompts(data);
            setLoading(false);
        })();
    }, [isOpen]);

    const filtered = search.trim()
        ? prompts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
        : prompts;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#141414' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h3 className="text-base font-bold text-white">Escolher da Biblioteca</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all" title="Fechar">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar referências..."
                        className="w-full px-4 py-2 rounded-xl text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-white/20 focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-5 pb-5">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${LIME} transparent ${LIME} ${LIME}` }} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {filtered.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { onSelect(p.image_url, p.prompt); onClose(); }}
                                    className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-white/30 transition-all hover:scale-[1.03] relative group"
                                >
                                    <img src={p.thumbnail_url || p.image_url} alt={p.title}
                                        className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                                        <p className="text-[9px] text-white font-bold p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                                            {p.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ArcanoCloner() {
    const location = useLocation();
    const navigate = useNavigate();
    const [suaFoto, setSuaFoto] = useState<string | null>(null);
    const [fotoRef, setFotoRef] = useState<string | null>(null);
    const [proporcao, setProporcao] = useState('1:1');
    const [criatividade, setCriatividade] = useState([20]);
    const [instrucoes, setInstrucoes] = useState('');
    const [showInstrucoes, setShowInstrucoes] = useState(false);
    const [resultado, setResultado] = useState<string | null>(null);
    const [showBiblioteca, setShowBiblioteca] = useState(false);

    const { generate, isGenerating, progress } = useGeminiImageGeneration();

    // Auto-fill from biblioteca navigation state
    useEffect(() => {
        const state = location.state as any;
        if (state?.referenceImage) {
            // Load the reference image from URL
            loadImageAsBase64(state.referenceImage).then(b64 => {
                if (b64) setFotoRef(b64);
            });
        }
        if (state?.prompt) {
            setInstrucoes(state.prompt);
            setShowInstrucoes(true);
        }
    }, [location.state]);

    async function loadImageAsBase64(url: string): Promise<string | null> {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    }

    function handleSelectFromBiblioteca(imageUrl: string, prompt: string) {
        loadImageAsBase64(imageUrl).then(b64 => {
            if (b64) setFotoRef(b64);
        });
        if (prompt) {
            setInstrucoes(prompt);
            setShowInstrucoes(true);
        }
    }

    const handleGerar = async () => {
        if (!suaFoto) {
            toast({ title: 'Faça upload da sua foto primeiro', variant: 'destructive' });
            return;
        }
        if (!fotoRef) {
            toast({ title: 'Adicione uma foto de referência', variant: 'destructive' });
            return;
        }

        try {
            const refs: ReferenceImage[] = [
                {
                    data: suaFoto.replace(/^data:[^,]+,/, ''),
                    mimeType: 'image/jpeg',
                    description: 'SUBJECT: this is the person — preserve face, skin, hair exactly',
                    category: 'style',
                },
                {
                    data: fotoRef.replace(/^data:[^,]+,/, ''),
                    mimeType: 'image/jpeg',
                    description: 'REFERENCE: clone this style, pose, scenario onto the subject',
                    category: 'environment',
                },
            ];

            const creativityLevel = criatividade[0];
            const sobriety = Math.max(10, 100 - creativityLevel);

            const config: GenerationConfig = {
                niche: 'Arcano Cloner — Ensaio Fotográfico',
                gender: 'neutral',
                subjectDescription: `Ultra-realistic photographic portrait of the person from the SUBJECT reference photo. 
CRITICAL: Preserve exactly the face features, skin tone, hair color, eye color and full identity of the SUBJECT.
Clone the style, lighting, pose and environment from the REFERENCE photo onto the SUBJECT person.
${instrucoes ? `Additional instructions: ${instrucoes}` : ''}`,
                environment: 'Clone the exact environment and background from the reference photo',
                sobriety,
                style: 'cinematic',
                useStyle: false,
                colors: { ambient: '#ffffff', rim: '#f0e8c8', complementary: '#c8d8f5' },
                colorFlags: { ambient: false, rim: true, complementary: false },
                ambientOpacity: 15,
                useBlur: false,
                useGradient: false,
                useFloatingElements: false,
                floatingElementsDescription: '',
                shotType: 'MEDIUM',
                additionalInstructions: `Arcano Cloner - Creativity level: ${creativityLevel}/100. 
${creativityLevel <= 30 ? 'STAY FAITHFUL to reference — minimal creative liberties.' : 'Allow creative interpretation of the reference style.'}`,
                dimension: proporcao,
                safeAreaSide: 'CENTER',
                personCount: 1,
            };

            const result = await generate(config, refs);
            const blob = await fetch(`data:${result.mimeType};base64,${result.imageBase64}`).then(r => r.blob());
            setResultado(URL.createObjectURL(blob));
            toast({ title: '✅ Imagem gerada com sucesso!' });
        } catch (err: any) {
            toast({ title: `Erro: ${err.message}`, variant: 'destructive' });
        }
    };

    const handleDownload = () => {
        if (!resultado) return;
        const a = document.createElement('a');
        a.href = resultado;
        a.download = `arcano-cloner-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <ArcanoLayout>
            <div className="min-h-full flex flex-col">
                {/* Cabeçalho */}
                <div className="text-center py-8 px-4 border-b border-white/5">
                    <h1 className="text-2xl font-black text-white">Arcano Cloner</h1>
                    <p className="text-white/40 text-sm mt-1 max-w-md mx-auto">
                        Transforme sua foto usando qualquer imagem como referência. A IA clona o estilo, pose e cenário na sua pessoa.
                    </p>
                </div>

                {/* Corpo: 2 colunas */}
                <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
                    {/* Coluna esquerda: configurações */}
                    <div className="w-full lg:w-[360px] shrink-0 overflow-y-auto p-5 space-y-5 border-r border-white/5"
                        style={{ background: '#1a1a1a' }}>

                        {/* Upload Sua Foto */}
                        <UploadBox
                            label="📷 Sua Foto"
                            value={suaFoto}
                            onChange={setSuaFoto}
                            onClear={() => setSuaFoto(null)}
                        />

                        {/* Upload Foto Referência */}
                        <UploadBox
                            label="🎨 Foto de Referência"
                            value={fotoRef}
                            onChange={setFotoRef}
                            onClear={() => setFotoRef(null)}
                            extraButton={
                                <button
                                    onClick={() => setShowBiblioteca(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all"
                                    style={{ borderColor: 'rgba(216,255,154,0.2)', color: LIME, background: 'rgba(216,255,154,0.05)' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(216,255,154,0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(216,255,154,0.05)'; }}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Escolher da biblioteca
                                </button>
                            }
                        />

                        {/* Proporção */}
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                                ⬛ Proporção
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {PROPORCOES.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setProporcao(p.id)}
                                        className="flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition-all"
                                        style={{
                                            background: proporcao === p.id ? LIME : 'rgba(255,255,255,0.04)',
                                            color: proporcao === p.id ? '#000' : 'rgba(255,255,255,0.4)',
                                            borderColor: proporcao === p.id ? LIME : 'rgba(255,255,255,0.08)',
                                            fontWeight: proporcao === p.id ? 700 : 500,
                                        }}
                                    >
                                        <span className="text-xs">{p.icon}</span>
                                        <span className="text-[9px] font-bold mt-0.5">{p.label}</span>
                                        <span className="text-[8px] opacity-50 mt-0.5">{p.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Criatividade */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                                    ✨ Criatividade da IA
                                </p>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(216,255,154,0.15)', color: LIME }}>
                                    {criatividade[0]}
                                </span>
                            </div>
                            <Slider
                                value={criatividade}
                                onValueChange={setCriatividade}
                                min={0} max={100} step={1}
                                className="[&_[role=slider]]:bg-lime-300 [&_[role=slider]]:border-lime-300"
                            />
                            <div className="flex justify-between text-[9px] text-white/25 mt-1.5">
                                <span>Mais fiel</span>
                                <span className="text-white/40 font-medium">Recomendado: entre 0 e 30</span>
                                <span>Muito criativo</span>
                            </div>
                        </div>

                        {/* Instruções personalizadas */}
                        <div>
                            <label className="flex items-center justify-between cursor-pointer">
                                <p className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                                    💬 Instruções Personalizadas
                                </p>
                                <button
                                    onClick={() => setShowInstrucoes(!showInstrucoes)}
                                    className="w-10 h-5 rounded-full transition-all relative"
                                    style={{ background: showInstrucoes ? LIME : 'rgba(255,255,255,0.12)' }}
                                    title="Ativar instruções personalizadas"
                                >
                                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                                        style={{ left: showInstrucoes ? '1.25rem' : '0.125rem' }} />
                                </button>
                            </label>
                            {showInstrucoes && (
                                <Textarea
                                    value={instrucoes}
                                    onChange={(e) => setInstrucoes(e.target.value)}
                                    placeholder="Ex: Use roupas vermelhas, cenário na praia..."
                                    className="mt-2 bg-white/5 border-white/10 text-white text-xs resize-none h-24"
                                />
                            )}
                        </div>

                        {/* Botão gerar */}
                        <Button
                            onClick={handleGerar}
                            disabled={isGenerating || !suaFoto || !fotoRef}
                            className="w-full h-12 rounded-xl font-bold text-sm disabled:opacity-40"
                            style={{ background: LIME, color: '#000' }}
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{progress || 'Gerando...'}</>
                            ) : (
                                <><Sparkles className="w-4 h-4 mr-2" />Gerar Imagem</>
                            )}
                        </Button>
                    </div>

                    {/* Coluna direita: resultado */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[400px]">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-4">Resultado</p>
                        {resultado ? (
                            <div className="w-full max-w-lg">
                                <div className="rounded-2xl overflow-hidden border border-white/10 mb-3">
                                    <img src={resultado} className="w-full block" alt="Resultado Arcano Cloner" />
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:brightness-110"
                                    style={{ background: LIME, color: '#000' }}
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar PNG
                                </button>
                            </div>
                        ) : (
                            <div className="text-center opacity-50">
                                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-white/10 mx-auto flex items-center justify-center mb-4">
                                    <ImageIcon className="w-12 h-12 text-white/15" />
                                </div>
                                <p className="text-sm font-medium text-white/40">O resultado aparecerá aqui</p>
                                <p className="text-xs mt-1.5" style={{ color: 'rgba(216,255,154,0.5)' }}>
                                    Envie as imagens e clique em "Gerar Imagem"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Biblioteca Modal */}
            <BibliotecaModal
                isOpen={showBiblioteca}
                onClose={() => setShowBiblioteca(false)}
                onSelect={handleSelectFromBiblioteca}
            />
        </ArcanoLayout>
    );
}
