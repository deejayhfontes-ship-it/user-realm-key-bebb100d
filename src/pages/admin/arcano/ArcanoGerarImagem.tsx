import { useState, useRef, useCallback } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig, ReferenceImage } from '@/hooks/useGeminiImageGeneration';
import { Sparkles, Loader2, Download, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROPORCOES = [
    { id: '9:16', label: 'Story' },
    { id: '1:1', label: 'Quadrado' },
    { id: '3:4', label: 'Retrato' },
    { id: '4:3', label: 'Clássico' },
    { id: '16:9', label: 'Wide' },
];

export default function ArcanoGerarImagem() {
    const [prompt, setPrompt] = useState('');
    const [proporcao, setProporcao] = useState('1:1');
    const [resultado, setResultado] = useState<string | null>(null);
    const [refImage, setRefImage] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const { generate, isGenerating, progress } = useGeminiImageGeneration();

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image'));
        if (!item) return;
        const file = item.getAsFile(); if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setRefImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setRefImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleGerar = async () => {
        if (!prompt.trim()) {
            toast({ title: 'Descreva a imagem que você quer gerar', variant: 'destructive' }); return;
        }
        try {
            const refs: ReferenceImage[] = refImage ? [{
                data: refImage.replace(/^data:[^,]+,/, ''),
                mimeType: 'image/jpeg',
                description: 'Style/composition reference image',
                category: 'style',
            }] : [];

            const config: GenerationConfig = {
                niche: 'Gerar Imagem — Arcano AI',
                gender: 'neutral',
                subjectDescription: prompt,
                environment: 'As described in the prompt',
                sobriety: 60,
                style: 'artistic',
                useStyle: false,
                colors: { ambient: '#ffffff', rim: '#ffffff', complementary: '#ffffff' },
                colorFlags: { ambient: false, rim: false, complementary: false },
                ambientOpacity: 0,
                useBlur: false, useGradient: false, useFloatingElements: false, floatingElementsDescription: '',
                shotType: 'MEDIUM',
                additionalInstructions: `Generate exactly what is described: "${prompt}". High quality, detailed, professional.`,
                dimension: proporcao,
                safeAreaSide: 'CENTER',
                personCount: 0,
            };

            const result = await generate(config, refs);
            const blob = await fetch(`data:${result.mimeType};base64,${result.imageBase64}`).then(r => r.blob());
            setResultado(URL.createObjectURL(blob));
            toast({ title: '✅ Imagem gerada!' });
        } catch (err: any) {
            toast({ title: `Erro: ${err.message}`, variant: 'destructive' });
        }
    };

    const handleDownload = () => {
        if (!resultado) return;
        const a = document.createElement('a');
        a.href = resultado; a.download = `arcano-imagem-${Date.now()}.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <ArcanoLayout>
            <div className="min-h-full flex flex-col" style={{ background: '#0d0714' }}>
                {/* Cabeçalho */}
                <div className="px-6 pt-5 pb-2 border-b border-white/5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-bold text-white">Gerar Imagem</span>
                    <span className="text-[10px] text-white/25 ml-1">NanoBanana • Google Gemini</span>
                </div>

                {/* Área de resultado */}
                <div className="flex-1 flex items-center justify-center p-6">
                    {resultado ? (
                        <div className="w-full max-w-lg">
                            <div className="rounded-2xl overflow-hidden border border-white/10 mb-3">
                                <img src={resultado} className="w-full block" alt="Imagem gerada" />
                            </div>
                            <button onClick={handleDownload}
                                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white hover:brightness-110"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                                <Download className="w-4 h-4" />Baixar PNG
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl text-violet-400 mx-auto flex items-center justify-center mb-3" style={{ background: '#1a0a2e' }}>
                                <Sparkles className="w-8 h-8" />
                            </div>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-white/40">{progress || 'Gerando imagem...'}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-violet-300 font-medium">Digite um prompt e clique em Gerar</p>
                                    <p className="text-xs text-white/25 mt-1">Arraste imagens aqui ou cole com Ctrl+V para adicionar referências</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Área de referência colada */}
                {refImage && (
                    <div className="px-4 pb-2">
                        <div className="relative inline-block">
                            <img src={refImage} className="h-16 w-16 rounded-lg object-cover border border-violet-500/40" alt="Referência" />
                            <button onClick={() => setRefImage(null)} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                <X className="w-2.5 h-2.5 text-white" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input de prompt + controles */}
                <div className="border-t border-white/5 px-4 py-3" style={{ background: '#110820' }}>
                    {/* Textarea */}
                    <div className="flex items-start gap-2 mb-3">
                        <button onClick={() => fileRef.current?.click()} className="mt-1 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onPaste={handlePaste}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGerar(); } }}
                            placeholder="Descreva a imagem que você quer gerar..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 resize-none outline-none min-h-[52px] max-h-32 leading-relaxed"
                            rows={2}
                        />
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                    {/* Controles inferiores */}
                    <div className="flex items-center justify-between">
                        {/* Proporções */}
                        <div className="flex items-center gap-1">
                            {PROPORCOES.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setProporcao(p.id)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all',
                                        proporcao === p.id
                                            ? 'border-violet-500 bg-violet-600/30 text-white'
                                            : 'border-white/10 text-white/30 hover:text-white/60'
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Botão Gerar */}
                        <button
                            onClick={handleGerar}
                            disabled={isGenerating || !prompt.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Gerar
                        </button>
                    </div>
                </div>
            </div>
        </ArcanoLayout>
    );
}
