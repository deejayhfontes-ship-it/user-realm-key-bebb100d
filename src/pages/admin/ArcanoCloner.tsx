import { useState, useRef, useCallback } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig, ReferenceImage } from '@/hooks/useGeminiImageGeneration';
import { Upload, X, Sparkles, Loader2, Download } from 'lucide-react';

const PROPORCOES = [
    { id: '9:16', label: 'Stories', sub: '9:16' },
    { id: '1:1', label: 'Quadrado', sub: '1:1' },
    { id: '3:4', label: 'Feed Vert.', sub: '3:4' },
    { id: '16:9', label: 'Retangular', sub: '16:9' },
];

function UploadBox({
    label, value, onChange, onClear
}: { label: string; value: string | null; onChange: (b64: string) => void; onClear: () => void }) {
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
                <div className="relative rounded-xl overflow-hidden border border-lime-300/30 h-40">
                    <img src={value} className="w-full h-full object-cover" alt={label} />
                    <button
                        onClick={onClear}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                    >
                        <X className="w-3 h-3 text-white" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => ref.current?.click()}
                    onPaste={handlePaste}
                    className="w-full h-40 rounded-xl border-2 border-dashed border-white/15 hover:border-lime-300/40 hover:bg-lime-300/5 flex flex-col items-center justify-center gap-2 transition-all"
                >
                    <div className="w-10 h-10 rounded-full bg-lime-300/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-lime-300" />
                    </div>
                    <p className="text-xs text-white/40 font-medium">Arraste ou clique</p>
                    <p className="text-[10px] text-lime-300/70">Ctrl+V para colar</p>
                </button>
            )}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
}

export default function ArcanoCloner() {
    const [suaFoto, setSuaFoto] = useState<string | null>(null);
    const [fotoRef, setFotoRef] = useState<string | null>(null);
    const [proporcao, setProporcao] = useState('1:1');
    const [criatividade, setCriatividade] = useState([20]);
    const [instrucoes, setInstrucoes] = useState('');
    const [showInstrucoes, setShowInstrucoes] = useState(false);
    const [resultado, setResultado] = useState<string | null>(null);

    const { generate, isGenerating, progress } = useGeminiImageGeneration();

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
                <div className="flex flex-1 overflow-hidden">
                    {/* Coluna esquerda: configurações */}
                    <div className="w-[340px] shrink-0 overflow-y-auto p-5 space-y-5 border-r border-white/5"
                        style={{ background: '#110820' }}>

                        {/* Upload Sua Foto */}
                        <UploadBox
                            label="Sua Foto"
                            value={suaFoto}
                            onChange={setSuaFoto}
                            onClear={() => setSuaFoto(null)}
                        />

                        {/* Upload Foto Referência */}
                        <UploadBox
                            label="Foto de Referência"
                            value={fotoRef}
                            onChange={setFotoRef}
                            onClear={() => setFotoRef(null)}
                        />

                        {/* Proporção */}
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                                <span>⬛</span> Proporção
                            </p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {PROPORCOES.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setProporcao(p.id)}
                                        className={`
                      flex flex-col items-center justify-center py-2 rounded-xl border text-center transition-all
                      ${proporcao === p.id
                                                ? 'text-black font-bold'
                                                : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                                            }
                    `}
                                    >
                                        <span className="text-[9px] font-bold">{p.label}</span>
                                        <span className="text-[8px] text-white/30 mt-0.5">{p.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Criatividade */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                                    <span>✨</span> Criatividade da IA
                                </p>
                                <span className="text-sm font-bold text-white">{criatividade[0]}</span>
                            </div>
                            <Slider
                                value={criatividade}
                                onValueChange={setCriatividade}
                                min={0} max={100} step={1}
                                className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-500"
                            />
                            <div className="flex justify-between text-[9px] text-white/25 mt-1">
                                <span>Mais fiel</span>
                                <span className="text-white/40 font-medium">Recomendado: entre 0 e 30</span>
                                <span>Muito criativo</span>
                            </div>
                        </div>

                        {/* Instruções personalizadas */}
                        <div>
                            <label className="flex items-center justify-between cursor-pointer">
                                <p className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                                    <span>💬</span> Instruções Personalizadas
                                </p>
                                <button
                                    onClick={() => setShowInstrucoes(!showInstrucoes)}
                                    className={`w-10 h-5 rounded-full transition-all relative ${showInstrucoes ? 'bg-violet-600' : 'bg-white/15'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${showInstrucoes ? 'left-5' : 'left-0.5'}`} />
                                </button>
                            </label>
                            {showInstrucoes && (
                                <Textarea
                                    value={instrucoes}
                                    onChange={(e) => setInstrucoes(e.target.value)}
                                    placeholder="Ex: Use um fundo branco, adicione óculos escuros..."
                                    className="mt-2 bg-white/5 border-white/10 text-white text-xs resize-none h-20"
                                />
                            )}
                        </div>

                        {/* Botão gerar */}
                        <Button
                            onClick={handleGerar}
                            disabled={isGenerating || !suaFoto || !fotoRef}
                            className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                            style={{ background: '#D8FF9A', color: '#000' }}
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{progress || 'Gerando...'}</>
                            ) : (
                                <><Sparkles className="w-4 h-4 mr-2" />Gerar Imagem</>
                            )}
                        </Button>
                    </div>

                    {/* Coluna direita: resultado */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center">
                        {resultado ? (
                            <div className="w-full max-w-lg">
                                <div className="rounded-2xl overflow-hidden border border-white/10 mb-3">
                                    <img src={resultado} className="w-full block" alt="Resultado Arcano Cloner" />
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all hover:brightness-110"
                                    style={{ background: '#D8FF9A', color: '#000' }}
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar PNG
                                </button>
                            </div>
                        ) : (
                            <div className="text-center opacity-50">
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 mx-auto flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="3" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21,15 16,10 5,21" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-white/40">O resultado aparecerá aqui</p>
                                <p className="text-xs text-lime-300/60 mt-1">Envie as imagens e clique em "Gerar Imagem"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ArcanoLayout>
    );
}
