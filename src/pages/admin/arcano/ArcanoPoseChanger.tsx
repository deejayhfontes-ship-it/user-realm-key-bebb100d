import { useState, useRef } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig, ReferenceImage } from '@/hooks/useGeminiImageGeneration';
import { Upload, X, Sparkles, Loader2, Download } from 'lucide-react';

function UploadBox({ label, value, onChange, onClear }: { label: string; value: string | null; onChange: (b: string) => void; onClear: () => void }) {
    const ref = useRef<HTMLInputElement>(null);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target?.result as string);
        reader.readAsDataURL(file);
    };
    return (
        <div>
            <p className="text-xs font-medium text-white/60 mb-2">{label}</p>
            {value ? (
                <div className="relative rounded-xl overflow-hidden border border-lime-300/30 h-40">
                    <img src={value} className="w-full h-full object-cover" alt={label} />
                    <button onClick={onClear} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80"><X className="w-3 h-3 text-white" /></button>
                </div>
            ) : (
                <button onClick={() => ref.current?.click()}
                    className="w-full h-40 rounded-xl border-2 border-dashed border-white/15 hover:border-lime-300/40 hover:bg-lime-300/5 flex flex-col items-center justify-center gap-2 transition-all">
                    <div className="w-10 h-10 rounded-full bg-lime-300/10 flex items-center justify-center"><Upload className="w-5 h-5 text-lime-300" /></div>
                    <p className="text-xs text-white/40 font-medium">Arraste ou clique</p>
                    <p className="text-[10px] text-lime-300/70">Ctrl+V para colar</p>
                </button>
            )}
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
}

export default function ArcanoPoseChanger() {
    const [suaFoto, setSuaFoto] = useState<string | null>(null);
    const [fotoRef, setFotoRef] = useState<string | null>(null);
    const [resultado, setResultado] = useState<string | null>(null);
    const { generate, isGenerating, progress } = useGeminiImageGeneration();

    const handleGerar = async () => {
        if (!suaFoto || !fotoRef) {
            toast({ title: 'Envie as duas fotos primeiro', variant: 'destructive' }); return;
        }
        try {
            const refs: ReferenceImage[] = [
                { data: suaFoto.replace(/^data:[^,]+,/, ''), mimeType: 'image/jpeg', description: 'SUBJECT PERSON — preserve face, skin, hair exactly', category: 'style' },
                { data: fotoRef.replace(/^data:[^,]+,/, ''), mimeType: 'image/jpeg', description: 'POSE REFERENCE — replicate this exact body position and angle', category: 'environment' },
            ];
            const config: GenerationConfig = {
                niche: 'Pose Changer — Troca de Pose IA',
                gender: 'neutral',
                subjectDescription: `Ultra-realistic photo of the SUBJECT person recreated with the exact pose from the POSE REFERENCE image.
CRITICAL: Keep the exact face, skin tone, hair and identity from the SUBJECT.
Apply ONLY the body position, angle and pose from the REFERENCE.
The background should be similar to the subject's original background.`,
                environment: 'Same or similar environment as original subject photo',
                sobriety: 80,
                style: 'photorealistic',
                useStyle: false,
                colors: { ambient: '#ffffff', rim: '#f0e8c8', complementary: '#c8d8f5' },
                colorFlags: { ambient: false, rim: true, complementary: false },
                ambientOpacity: 10,
                useBlur: false, useGradient: false, useFloatingElements: false, floatingElementsDescription: '',
                shotType: 'FULL',
                additionalInstructions: 'Pose Changer: Replicate the exact body pose from reference while maintaining the subject identity.',
                dimension: '3:4', safeAreaSide: 'CENTER', personCount: 1,
            };
            const result = await generate(config, refs);
            const blob = await fetch(`data:${result.mimeType};base64,${result.imageBase64}`).then(r => r.blob());
            setResultado(URL.createObjectURL(blob));
            toast({ title: '✅ Pose gerada!' });
        } catch (err: any) {
            toast({ title: `Erro: ${err.message}`, variant: 'destructive' });
        }
    };

    const handleDownload = () => {
        if (!resultado) return;
        const a = document.createElement('a');
        a.href = resultado; a.download = `arcano-pose-${Date.now()}.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <ArcanoLayout>
            <div className="min-h-full flex flex-col">
                <div className="text-center py-8 px-4 border-b border-white/5">
                    <h1 className="text-2xl font-black text-white">Pose Changer</h1>
                    <p className="text-white/40 text-sm mt-1 max-w-md mx-auto">
                        Mude a pose da sua foto usando qualquer imagem como referência. A IA replica a posição do corpo mantendo seu rosto.
                    </p>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-[340px] shrink-0 overflow-y-auto p-5 space-y-5 border-r border-white/5" style={{ background: '#110820' }}>
                        <UploadBox label="Sua Foto" value={suaFoto} onChange={setSuaFoto} onClear={() => setSuaFoto(null)} />
                        <UploadBox label="Foto de Referência (pose desejada)" value={fotoRef} onChange={setFotoRef} onClear={() => setFotoRef(null)} />
                        <Button onClick={handleGerar} disabled={isGenerating || !suaFoto || !fotoRef}
                            className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                            style={{ background: '#D8FF9A', color: '#000' }}>
                            {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{progress || 'Gerando...'}</> : <><Sparkles className="w-4 h-4 mr-2" />Gerar Pose</>}
                        </Button>
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center">
                        {resultado ? (
                            <div className="w-full max-w-md">
                                <div className="rounded-2xl overflow-hidden border border-white/10 mb-3">
                                    <img src={resultado} className="w-full block" alt="Resultado Pose Changer" />
                                </div>
                                <button onClick={handleDownload}
                                    className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white hover:brightness-110"
                                    style={{ background: '#D8FF9A', color: '#000' }}>
                                    <Download className="w-4 h-4" />Baixar PNG
                                </button>
                            </div>
                        ) : (
                            <div className="text-center opacity-50">
                                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/10 mx-auto flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8 text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                                </div>
                                <p className="text-sm text-white/40">O resultado aparecerá aqui</p>
                                <p className="text-xs text-lime-300/60 mt-1">Envie as imagens e clique em "Gerar Pose"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ArcanoLayout>
    );
}
