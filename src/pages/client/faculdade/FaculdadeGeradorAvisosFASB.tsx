import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Image as ImageIcon, LayoutTemplate, Eye, EyeOff } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Imagens base
import baseImg from "@/assets/geradores/base01_FASB_.png";

export default function FaculdadeGeradorAvisosFASB() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const exportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Estado do formulário
    const [config, setConfig] = useState({
        titulo: { text: "RECESSO\nDE FINAL\nDE ANO", visible: true, scale: 100 },
        destaque1: { text: "20 de dezembro", visible: true },
        corpo: { text: "Retorno das atividades", visible: true },
        destaque2: { text: "06 de janeiro", visible: true }
    });

    const handleTextChange = (field: keyof typeof config, value: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: { ...prev[field], text: value }
        }));
    };

    const toggleVisibility = (field: keyof typeof config) => {
        setConfig(prev => ({
            ...prev,
            [field]: { ...prev[field], visible: !(prev[field] as { visible: boolean }).visible }
        }));
    };

    const handleScaleChange = (value: number) => {
        setConfig(prev => ({
            ...prev,
            titulo: { ...prev.titulo, scale: value }
        }));
    };

    const [cacheBuster] = useState(Date.now());

    const handleExport = async () => {
        if (!exportRef.current) return;
        
        try {
            setIsExporting(true);
            toast.loading("Gerando imagem...", { id: "export-toast" });

            const canvas = await html2canvas(exportRef.current, {
                scale: 2, // Mantém a qualidade inicial alta
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
            });

            // Lógica de compressão preventiva
            const MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB (margem de segurança para o limite de 5MB da API)
            let quality = 0.95;
            let finalDataUrl = canvas.toDataURL("image/webp", quality);
            let size = Math.round((finalDataUrl.length * 3) / 4);
            let wasOptimized = false;

            // Fase 1: Redução progressiva da qualidade do WebP
            if (size > MAX_SIZE_BYTES) {
                wasOptimized = true;
                while (size > MAX_SIZE_BYTES && quality > 0.5) {
                    quality -= 0.1;
                    finalDataUrl = canvas.toDataURL("image/webp", quality);
                    size = Math.round((finalDataUrl.length * 3) / 4);
                }
            }

            // Fase 2: Redimensionamento progressivo caso ainda ultrapasse o limite
            if (size > MAX_SIZE_BYTES) {
                let scale = 0.8;
                const tempCanvas = document.createElement("canvas");
                const ctx = tempCanvas.getContext("2d");
                
                if (ctx) {
                    while (size > MAX_SIZE_BYTES && scale >= 0.3) {
                        tempCanvas.width = canvas.width * scale;
                        tempCanvas.height = canvas.height * scale;
                        ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                        
                        finalDataUrl = tempCanvas.toDataURL("image/webp", 0.7);
                        size = Math.round((finalDataUrl.length * 3) / 4);
                        scale -= 0.15;
                    }
                }
            }

            // Trava de segurança final
            if (size > 5 * 1024 * 1024) {
                throw new Error("A imagem excede 5MB mesmo após compressão máxima. Tente reduzir menos conteúdo.");
            }

            const link = document.createElement("a");
            link.download = `aviso-fasb-${Date.now()}.webp`;
            link.href = finalDataUrl;
            link.click();

            if (wasOptimized) {
                toast.success("Imagem otimizada (reduzida para <5MB) e baixada com sucesso!", { id: "export-toast" });
            } else {
                toast.success("Imagem baixada com sucesso!", { id: "export-toast" });
            }
        } catch (error) {
            console.error("Erro ao exportar:", error);
            const msg = error instanceof Error ? error.message : "Erro ao gerar a imagem. Tente novamente.";
            toast.error(msg, { id: "export-toast" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/faculdade/geradores")}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                <LayoutTemplate className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Gerador de Avisos FASB</h1>
                                <p className="text-xs text-white/40">Crie comunicados oficiais instantaneamente</p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? "Gerando..." : "Baixar PNG"}
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col lg:flex-row gap-8">
                {/* Editor Sidebar */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <ImageIcon className="w-5 h-5 text-violet-400" />
                            <h2 className="text-lg font-semibold">Editar Conteúdo</h2>
                        </div>

                        <div className="space-y-5">
                            {/* TÍTULO */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Título</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2" title="Tamanho do Texto">
                                            <span className="text-[10px] text-white/40">Tamanho:</span>
                                            <input 
                                                type="range" 
                                                title="Tamanho do Texto"
                                                aria-label="Tamanho do Texto"
                                                min="50" max="150" 
                                                value={config.titulo.scale} 
                                                onChange={(e) => handleScaleChange(parseInt(e.target.value))} 
                                                className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <button onClick={() => toggleVisibility('titulo')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir">
                                            {config.titulo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={config.titulo.text}
                                    onChange={(e) => handleTextChange('titulo', e.target.value)}
                                    rows={4}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    placeholder="Ex: RECESSO\nDE FINAL\nDE ANO"
                                />
                            </div>

                            {/* DESTAQUE 1 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Destaque 1 (ex: Data Principal)</label>
                                    <button onClick={() => toggleVisibility('destaque1')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir">
                                        {config.destaque1.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.destaque1.text}
                                    onChange={(e) => handleTextChange('destaque1', e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    placeholder="Ex: 20 de dezembro"
                                />
                            </div>

                            {/* CORPO DE TEXTO */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Corpo do Texto ou Subtítulo</label>
                                    <button onClick={() => toggleVisibility('corpo')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir">
                                        {config.corpo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.corpo.text}
                                    onChange={(e) => handleTextChange('corpo', e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    placeholder="Ex: Retorno das atividades"
                                />
                            </div>

                            {/* DESTAQUE 2 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Destaque 2 (ex: Data Secundária)</label>
                                    <button onClick={() => toggleVisibility('destaque2')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir">
                                        {config.destaque2.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.destaque2.text}
                                    onChange={(e) => handleTextChange('destaque2', e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    placeholder="Ex: 06 de janeiro"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="w-full lg:w-2/3 flex flex-col items-center justify-center bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 overflow-hidden relative">
                    <div className="w-full max-w-[450px] relative rounded-lg overflow-hidden flex-shrink-0 shadow-2xl ring-1 ring-white/10">
                        {/* Container 4:5 Aspect Ratio */}
                        <div 
                            ref={exportRef}
                            className="relative w-full aspect-[4/5] bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${baseImg}?v=${cacheBuster})` }}
                        >
                            {/* ESTILOS DE FONTE INJETADOS NO COMPONENTE PARA FUNCIONAMENTO DO HTML2CANVAS */}
                            <style>
                                {/* Fonts here are Sora, let's include the ones needed */}
                                {`
                                    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
                                    
                                    .font-sora { font-family: 'Sora', sans-serif; }
                                `}
                            </style>

                            {/* TEXTOS ABSOLUTOS COM OVERFLOW GUARD */}
                            <div className="absolute top-[27%] bottom-[23%] left-[22%] right-[16%] flex flex-col justify-center overflow-hidden break-words">
                                
                                {/* TÍTULO */}
                                {config.titulo.visible && (
                                    <h1 
                                        className="text-[#ff5c00] font-sora font-[800] uppercase tracking-normal leading-[1.05] mb-3"
                                        style={{ 
                                            fontSize: `clamp(22px, ${6 * (config.titulo.scale/100)}cqw, ${34 * (config.titulo.scale/100)}px)`
                                        }}
                                    >
                                        {config.titulo.text.split('\n').map((line, i) => (
                                            <span key={i} className="block">{line}</span>
                                        ))}
                                    </h1>
                                )}

                                {/* DATA PRINCIPAL */}
                                {config.destaque1.visible && config.destaque1.text && (
                                    <p className="text-[#64efff] font-sora font-bold" style={{ fontSize: 'clamp(16px, 4cqw, 20px)' }}>
                                        {config.destaque1.text}
                                    </p>
                                )}
                                
                                {/* LINHA SEPARADORA (Se destaque1 OU corpo tiverem visíveis, mostrar linha divisória se condicional preencher algo) */}
                                {(config.titulo.visible || config.destaque1.visible || config.corpo.visible || config.destaque2.visible) && (
                                    <div className="w-[90%] h-[1px] bg-white/20 my-4 shrink-0" />
                                )}

                                {/* SUBTÍTULO */}
                                {config.corpo.visible && config.corpo.text && (
                                    <p className="text-white font-sora font-medium" style={{ fontSize: 'clamp(12px, 3cqw, 16px)' }}>
                                        {config.corpo.text}
                                    </p>
                                )}
                                
                                {/* DATA SECUNDÁRIA */}
                                {config.destaque2.visible && config.destaque2.text && (
                                    <p className="text-[#64efff] font-sora font-bold mt-1" style={{ fontSize: 'clamp(16px, 4cqw, 20px)' }}>
                                        {config.destaque2.text}
                                    </p>
                                )}
                                
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
