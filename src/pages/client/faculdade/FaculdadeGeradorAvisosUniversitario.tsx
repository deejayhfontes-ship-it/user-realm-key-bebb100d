import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Image as ImageIcon, LayoutTemplate, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Imagens base
import baseFeed from "@/assets/geradores/unver_feed.png";
import baseStories from "@/assets/geradores/univers_sto.png";

// Fontes locais
import versusFont from "@/assets/geradores/versus-extrabold.otf";
import archivoFont from "@/assets/geradores/archivo-semi-bold.ttf";

type Formato = "feed" | "stories";

export default function FaculdadeGeradorAvisosUniversitario() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const exportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [formato, setFormato] = useState<Formato>("feed");

    // Estado do formulário — baseado no modelo
    const [config, setConfig] = useState({
        titulo: { text: "VOLTa às\nAULAs", visible: true, scale: 100 },
        corpo: { text: "Início das aulas para o", visible: true },
        destaque: { text: "9º ano EF ao 3º ano do EM", visible: true },
        complemento: { text: "no dia", visible: true },
        data: { text: "03/02", visible: true },
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
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
            });

            const MAX_SIZE_BYTES = 4.5 * 1024 * 1024;
            let quality = 0.95;
            let finalDataUrl = canvas.toDataURL("image/webp", quality);
            let size = Math.round((finalDataUrl.length * 3) / 4);
            let wasOptimized = false;

            if (size > MAX_SIZE_BYTES) {
                wasOptimized = true;
                while (size > MAX_SIZE_BYTES && quality > 0.5) {
                    quality -= 0.1;
                    finalDataUrl = canvas.toDataURL("image/webp", quality);
                    size = Math.round((finalDataUrl.length * 3) / 4);
                }
            }

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

            if (size > 5 * 1024 * 1024) {
                throw new Error("A imagem excede 5MB mesmo após compressão máxima.");
            }

            const link = document.createElement("a");
            link.download = `aviso-universitario-${formato}-${Date.now()}.webp`;
            link.href = finalDataUrl;
            link.click();

            if (wasOptimized) {
                toast.success("Imagem otimizada e baixada com sucesso!", { id: "export-toast" });
            } else {
                toast.success("Imagem baixada com sucesso!", { id: "export-toast" });
            }
        } catch (error) {
            console.error("Erro ao exportar:", error);
            const msg = error instanceof Error ? error.message : "Erro ao gerar a imagem.";
            toast.error(msg, { id: "export-toast" });
        } finally {
            setIsExporting(false);
        }
    };

    const baseImg = formato === "feed" ? baseFeed : baseStories;
    const aspectRatio = formato === "feed" ? "4/5" : "9/16";

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/faculdade/geradores")}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                            title="Voltar para Geradores"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                <LayoutTemplate className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Gerador de Avisos — Colégio Universitário</h1>
                                <p className="text-xs text-white/40">Crie comunicados oficiais instantaneamente</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Seletor de formato */}
                        <div className="flex items-center bg-white/5 rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setFormato("feed")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formato === "feed" ? "bg-teal-600 text-white" : "text-white/50 hover:text-white"}`}
                                title="Formato Feed"
                            >
                                <Monitor className="w-3.5 h-3.5" />
                                Feed
                            </button>
                            <button
                                onClick={() => setFormato("stories")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formato === "stories" ? "bg-teal-600 text-white" : "text-white/50 hover:text-white"}`}
                                title="Formato Stories"
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                Stories
                            </button>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            title="Baixar imagem"
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? "Gerando..." : "Baixar Imagem"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex flex-col lg:flex-row gap-8">
                {/* Editor Sidebar */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <ImageIcon className="w-5 h-5 text-teal-400" />
                            <h2 className="text-lg font-semibold">Editar Conteúdo</h2>
                        </div>

                        <div className="space-y-5">
                            {/* TÍTULO */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Título Principal</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2" title="Tamanho do Texto">
                                            <span className="text-[10px] text-white/40">Tamanho:</span>
                                            <input
                                                type="range"
                                                title="Tamanho do Título"
                                                aria-label="Tamanho do Título"
                                                min="50" max="150"
                                                value={config.titulo.scale}
                                                onChange={(e) => handleScaleChange(parseInt(e.target.value))}
                                                className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <button onClick={() => toggleVisibility('titulo')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir Título">
                                            {config.titulo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={config.titulo.text}
                                    onChange={(e) => handleTextChange('titulo', e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                                    placeholder="Ex: VOLTA ÀS&#10;AULAS"
                                />
                                <p className="text-[10px] text-white/30">Use Enter para quebrar linha</p>
                            </div>

                            {/* CORPO */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Corpo do Texto</label>
                                    <button onClick={() => toggleVisibility('corpo')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir Corpo">
                                        {config.corpo.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.corpo.text}
                                    onChange={(e) => handleTextChange('corpo', e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                    placeholder="Ex: Início das aulas para o"
                                />
                            </div>

                            {/* DESTAQUE (texto ciano) */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-teal-400/80">Destaque (Ciano)</label>
                                    <button onClick={() => toggleVisibility('destaque')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir Destaque">
                                        {config.destaque.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.destaque.text}
                                    onChange={(e) => handleTextChange('destaque', e.target.value)}
                                    className="w-full bg-[#111] border border-teal-500/20 rounded-xl px-4 py-2.5 text-sm text-teal-300 placeholder:text-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                    placeholder="Ex: 9º ano EF ao 3º ano do EM"
                                />
                            </div>

                            {/* COMPLEMENTO */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/60">Complemento</label>
                                    <button onClick={() => toggleVisibility('complemento')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir Complemento">
                                        {config.complemento.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.complemento.text}
                                    onChange={(e) => handleTextChange('complemento', e.target.value)}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                    placeholder="Ex: no dia"
                                />
                            </div>

                            {/* DATA */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-teal-400/80">Data (Ciano)</label>
                                    <button onClick={() => toggleVisibility('data')} className="text-white/40 hover:text-white transition-colors" title="Ocultar/Exibir Data">
                                        {config.data.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={config.data.text}
                                    onChange={(e) => handleTextChange('data', e.target.value)}
                                    className="w-full bg-[#111] border border-teal-500/20 rounded-xl px-4 py-2.5 text-sm text-teal-300 placeholder:text-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                    placeholder="Ex: 03/02"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="w-full lg:w-2/3 flex flex-col items-center justify-center bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 overflow-hidden relative">
                    <div className={`w-full ${formato === "feed" ? "max-w-[450px]" : "max-w-[320px]"} relative rounded-lg overflow-hidden flex-shrink-0 shadow-2xl ring-1 ring-white/10`}>
                        {/* Container com aspect ratio */}
                        <div
                            ref={exportRef}
                            className="relative w-full bg-cover bg-center bg-no-repeat"
                            style={{
                                aspectRatio: aspectRatio,
                                backgroundImage: `url(${baseImg}?v=${cacheBuster})`,
                                containerType: 'inline-size'
                            }}
                        >
                            {/* Fontes injetadas para html2canvas */}
                            <style>
                                {`
                                    @font-face {
                                        font-family: 'Versus';
                                        src: url('${versusFont}') format('opentype');
                                        font-weight: 800;
                                        font-style: normal;
                                    }
                                    @font-face {
                                        font-family: 'Archivo';
                                        src: url('${archivoFont}') format('truetype');
                                        font-weight: 600;
                                        font-style: normal;
                                    }
                                    .font-versus { font-family: 'Versus', sans-serif; }
                                    .font-archivo { font-family: 'Archivo', sans-serif; }
                                `}
                            </style>

                            {/* TEXTOS DENTRO DA ÁREA DA "TELA" DO NAVEGADOR */}
                            <div
                                className="absolute flex flex-col items-center justify-center overflow-hidden break-words text-center"
                                style={{
                                    top: formato === "feed" ? "42%" : "44%",
                                    bottom: formato === "feed" ? "18%" : "26%",
                                    left: formato === "feed" ? "6%" : "8%",
                                    right: formato === "feed" ? "6%" : "8%",
                                }}
                            >
                                {/* TÍTULO — Versus ExtraBold, Ciano com sombra 3D */}
                                {config.titulo.visible && (
                                    <h1
                                        className="font-versus leading-[0.9] mb-2"
                                        style={{
                                            fontSize: `${8.5 * (config.titulo.scale / 100)}cqi`,
                                            color: "#5ce0d6",
                                            textShadow: `
                                                1px 1px 0px #06313b,
                                                2px 2px 0px #06313b,
                                                3px 3px 0px #06313b,
                                                4px 4px 0px #06313b,
                                                5px 5px 0px #06313b,
                                                6px 6px 0px #06313b,
                                                8px 8px 10px rgba(0,0,0,0.6)
                                            `,
                                            WebkitTextStroke: "1px #3bc9bf",
                                            letterSpacing: "0.02em",
                                        }}
                                    >
                                        {config.titulo.text.split('\n').map((line, i) => (
                                            <span key={i} className="block">{line}</span>
                                        ))}
                                    </h1>
                                )}

                                {/* CORPO + DESTAQUE + COMPLEMENTO + DATA */}
                                <div className="mt-1 flex flex-col gap-0" style={{ fontSize: `${3.8 * (config.titulo.scale / 100)}cqi` }}>
                                    {/* Corpo branco */}
                                    {config.corpo.visible && config.corpo.text && (
                                        <p className="font-archivo text-white font-semibold leading-none tracking-wide">
                                            {config.corpo.text}
                                        </p>
                                    )}

                                    {/* Destaque ciano */}
                                    {config.destaque.visible && config.destaque.text && (
                                        <p className="font-archivo font-bold leading-none tracking-wide" style={{ color: "#5ce0d6" }}>
                                            {config.destaque.text}
                                        </p>
                                    )}

                                    {/* Complemento branco + Data ciano inline */}
                                    {(config.complemento.visible || config.data.visible) && (
                                        <p className="font-archivo text-white font-semibold leading-none tracking-wide">
                                            {config.complemento.visible && config.complemento.text && (
                                                <span>{config.complemento.text} </span>
                                            )}
                                            {config.data.visible && config.data.text && (
                                                <span style={{ color: "#5ce0d6" }}>{config.data.text}.</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
