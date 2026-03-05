import { useState, useRef } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGeminiImageGeneration, GenerationConfig, ReferenceImage } from '@/hooks/useGeminiImageGeneration';
import { Upload, X, Sparkles, Loader2, Download } from 'lucide-react';

const TIPOS = [
    { id: 'pessoas', label: 'Pessoas' },
    { id: 'comida', label: 'Comida/Objeto' },
    { id: 'antiga', label: 'Foto Antiga' },
    { id: 'selo', label: 'Selo 3D' },
    { id: 'logo', label: 'Logo/Arte' },
];

const TIPOS_PESSOA = [
    { id: 'perto', label: 'De Perto', icon: '👤' },
    { id: 'longe', label: 'De Longe', icon: '🧍' },
];

const RESOLUCOES = ['2K', '4K'];
const MODOS = ['Standard', 'PRO'];

export default function ArcanoUpscaler() {
    const [imagem, setImagem] = useState<string | null>(null);
    const [modo, setModo] = useState('Standard');
    const [tipo, setTipo] = useState('pessoas');
    const [subTipo, setSubTipo] = useState('perto');
    const [resolucao, setResolucao] = useState('2K');
    const [resultado, setResultado] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const { generate, isGenerating, progress } = useGeminiImageGeneration();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setImagem(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleUpscale = async () => {
        if (!imagem) {
            toast({ title: 'Faça upload de uma imagem primeiro', variant: 'destructive' });
            return;
        }

        try {
            const tipoDescricao = tipo === 'pessoas'
                ? `portrait photo of a person ${subTipo === 'perto' ? 'close-up shot' : 'full body / distant shot'}`
                : tipo === 'comida' ? 'food or product photo'
                    : tipo === 'antiga' ? 'old vintage photograph'
                        : tipo === 'selo' ? '3D seal or emblem'
                            : 'logo or artwork';

            const refs: ReferenceImage[] = [{
                data: imagem.replace(/^data:[^,]+,/, ''),
                mimeType: 'image/jpeg',
                description: `Original image to upscale — ${tipoDescricao}`,
                category: 'style',
            }];

            const config: GenerationConfig = {
                niche: `Image Upscaler — ${resolucao} — ${tipoDescricao}`,
                gender: 'neutral',
                subjectDescription: `Upscale and enhance this ${tipoDescricao} to ${resolucao} quality.
Increase resolution dramatically while preserving all details, textures and colors.
Make it sharper, cleaner, and more detailed than the original.
${modo === 'PRO' ? 'PRO MODE: Apply maximum detail enhancement, noise reduction and sharpness.' : ''}`,
                environment: 'Same background as the original, enhanced and sharpened',
                sobriety: 90,
                style: 'photorealistic',
                useStyle: false,
                colors: { ambient: '#ffffff', rim: '#ffffff', complementary: '#ffffff' },
                colorFlags: { ambient: false, rim: false, complementary: false },
                ambientOpacity: 0,
                useBlur: false,
                useGradient: false,
                useFloatingElements: false,
                floatingElementsDescription: '',
                shotType: 'MEDIUM',
                additionalInstructions: `UPSCALER ${resolucao}: Recreate this image at maximum quality, ultra-sharp, ${resolucao} resolution. Preserve all original details and characteristics.`,
                dimension: '1:1',
                safeAreaSide: 'CENTER',
                personCount: 1,
            };

            const result = await generate(config, refs);
            const blob = await fetch(`data:${result.mimeType};base64,${result.imageBase64}`).then(r => r.blob());
            setResultado(URL.createObjectURL(blob));
            toast({ title: `✅ Upscale ${resolucao} concluído!` });
        } catch (err: any) {
            toast({ title: `Erro: ${err.message}`, variant: 'destructive' });
        }
    };

    const handleDownload = () => {
        if (!resultado) return;
        const a = document.createElement('a');
        a.href = resultado;
        a.download = `arcano-upscaler-${resolucao}-${Date.now()}.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <ArcanoLayout>
            <div className="min-h-full flex flex-col">
                <div className="text-center py-8 px-4 border-b border-white/5">
                    <h1 className="text-2xl font-black text-white">Upscaler Arcano V3</h1>
                    <p className="text-white/40 text-sm mt-1 max-w-md mx-auto">
                        Aumente a qualidade das suas imagens com inteligência artificial. Transforme fotos em alta resolução sem perder detalhes.
                    </p>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Esquerda */}
                    <div className="w-[340px] shrink-0 overflow-y-auto p-5 space-y-5 border-r border-white/5" style={{ background: '#110820' }}>

                        {/* Abas Standard / PRO */}
                        <div className="flex gap-1 p-1 rounded-xl bg-white/5">
                            {MODOS.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setModo(m)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${modo === m ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white'}`}
                                >
                                    {m === 'PRO' ? '⚙️ PRO' : m}
                                </button>
                            ))}
                        </div>

                        {/* Upload */}
                        {imagem ? (
                            <div className="relative rounded-xl overflow-hidden border border-violet-500/30">
                                <img src={imagem} className="w-full h-44 object-cover" alt="Para upscale" />
                                <button onClick={() => setImagem(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80">
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => fileRef.current?.click()}
                                className="w-full h-28 rounded-xl border-2 border-dashed border-white/15 hover:border-violet-500/50 hover:bg-violet-900/10 flex flex-col items-center justify-center gap-2 transition-all">
                                <Upload className="w-6 h-6 text-violet-400" />
                                <p className="text-xs text-white/40">Arraste sua imagem aqui</p>
                                <p className="text-[10px] text-white/25">PNG, JPG, WebP • Máximo 10MB</p>
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

                        {/* Tipo de imagem */}
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">🖼️ Tipo de Imagem</p>
                            <div className="flex flex-wrap gap-1.5">
                                {TIPOS.map((t) => (
                                    <button key={t.id} onClick={() => setTipo(t.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${tipo === t.id ? 'border-violet-500 bg-violet-600/30 text-white' : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            {tipo === 'pessoas' && (
                                <div className="flex gap-2 mt-2">
                                    {TIPOS_PESSOA.map((tp) => (
                                        <button key={tp.id} onClick={() => setSubTipo(tp.id)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${subTipo === tp.id ? 'border-violet-500 bg-violet-600/30 text-white' : 'border-white/10 bg-white/5 text-white/40'}`}>
                                            <span>{tp.icon}</span>{tp.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resolução */}
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-2">📐 Resolução</p>
                            <div className="flex gap-2">
                                {RESOLUCOES.map((r) => (
                                    <button key={r} onClick={() => setResolucao(r)}
                                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${resolucao === r ? 'border-violet-500 bg-violet-600/30 text-white' : 'border-white/10 bg-white/5 text-white/40'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleUpscale} disabled={isGenerating || !imagem}
                            className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{progress || 'Upscaling...'}</> : <><Sparkles className="w-4 h-4 mr-2" />Fazer Upscale {resolucao}</>}
                        </Button>
                    </div>

                    {/* Direita: resultado */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center">
                        {resultado ? (
                            <div className="w-full max-w-lg">
                                <div className="rounded-2xl overflow-hidden border border-white/10 mb-3">
                                    <img src={resultado} className="w-full block" alt="Resultado Upscaler" />
                                </div>
                                <button onClick={handleDownload}
                                    className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white hover:brightness-110"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                                    <Download className="w-4 h-4" />Baixar PNG {resolucao}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center opacity-50">
                                <Upload className="w-12 h-12 text-white/15 mx-auto mb-3" />
                                <p className="text-sm text-white/40">Carregue uma imagem para começar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ArcanoLayout>
    );
}
