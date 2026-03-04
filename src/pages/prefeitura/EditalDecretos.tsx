import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, ArrowLeft, Type, AlignLeft, AlignCenter, AlignRight, Bold, FileText } from "lucide-react";

// The template images
import modeloDecretoPg1 from "./assets/decreto_edital/modeloEDUCACAODECRETO01.png";

// Page dimensions (based on template image: 1080×1350px)
const PAGE_W = 1080;
const PAGE_H = 1350;
const MARGIN_TOP = 190;
const MARGIN_LEFT = 150;
const MARGIN_RIGHT = 150;
const MARGIN_BOTTOM = 270;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 780px
const CONTENT_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM; // 890px

const EditalDecretos = () => {
    const [titulo, setTitulo] = useState("EDITAL DE CONVOCAÇÃO\nPARA CONTRATAÇÃO\nTEMPORÁRIA SME\nNº 004/2026");
    const [subtitulo, setSubtitulo] = useState("COMUNICADO\nIMPORTANTE");
    // Single body text - auto-paginated
    const [corpoTexto, setCorpoTexto] = useState(
        "Pelo presente Edital a Comissão de Avaliação de Currículos, faz saber a todos, que estão abertas as inscrições para cargo de PROFISSIONAL DE APOIO PARA EDUCAÇÃO ESPECIAL.\n\nDAS INSCRIÇÕES:\nDeverão ser feitas através do formulário abaixo:\nhttps://forms.gle/bRf4F4G72eQ9k4rE8\n\nAs inscrições ocorrerão do dia 27/02 até às 12h do dia 03/03 de 2026."
    );
    // Auto-computed pages
    const [paginasBody, setPaginasBody] = useState<string[]>([""]);

    const [styles, setStyles] = useState({
        titleSize: 56,
        subSize: 22,
        contentSize: 22,
        align: "left" as "left" | "center" | "right",
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const captureRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const titleMeasureRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(0.5);

    // Responsive preview scale
    useEffect(() => {
        const updateScale = () => {
            if (previewContainerRef.current) {
                const containerWidth = previewContainerRef.current.offsetWidth;
                const scale = Math.min(1, containerWidth / PAGE_W);
                setPreviewScale(scale);
            }
        };
        updateScale();
        const observer = new ResizeObserver(updateScale);
        if (previewContainerRef.current) observer.observe(previewContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // Find how many characters fit within maxHeight in the measure div
    const findSplitPoint = useCallback((text: string, maxHeight: number): number => {
        const div = measureRef.current;
        if (!div) return text.length;

        let lo = 0;
        let hi = text.length;

        // Binary search for max characters that fit
        while (lo < hi) {
            const mid = Math.floor((lo + hi + 1) / 2);
            div.innerHTML = text.slice(0, mid).replace(/\n/g, "<br>");
            if (div.scrollHeight <= maxHeight) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }

        // Snap to nearest word boundary
        if (lo < text.length) {
            const sub = text.slice(0, lo);
            const lastSpace = Math.max(sub.lastIndexOf(" "), sub.lastIndexOf("\n"));
            if (lastSpace > lo * 0.5) lo = lastSpace;
        }

        return lo;
    }, []);

    // Auto-paginate whenever text or styles change
    useEffect(() => {
        if (!measureRef.current || !titleMeasureRef.current) return;

        // Measure title block height on page 1
        const titleBlockH = titleMeasureRef.current.offsetHeight;
        const gapH = 24; // gap between elements
        const titleTotalH = (titulo ? titleBlockH + gapH : 0) + (subtitulo ? styles.subSize * 2 + gapH : 0);

        const page1BodyH = Math.max(100, CONTENT_H - titleTotalH - gapH);
        const restBodyH = CONTENT_H;

        const pages: string[] = [];
        let remaining = corpoTexto;

        // Configure measure div
        const div = measureRef.current;
        div.style.fontSize = `${styles.contentSize}px`;
        div.style.lineHeight = "1.6";
        div.style.width = `${CONTENT_W}px`;
        div.style.fontFamily = "'Globo Text', Arial, sans-serif";
        div.style.wordBreak = "break-word";
        div.style.whiteSpace = "pre-wrap";

        let pageIndex = 0;
        while (remaining.length > 0 && pageIndex < 30) {
            const maxH = pageIndex === 0 ? page1BodyH : restBodyH;
            const split = findSplitPoint(remaining, maxH);

            if (split === 0) {
                // Can't fit even one character - force a line
                pages.push(remaining.slice(0, 10));
                remaining = remaining.slice(10).trimStart();
            } else if (split >= remaining.length) {
                pages.push(remaining);
                remaining = "";
            } else {
                pages.push(remaining.slice(0, split).trimEnd());
                remaining = remaining.slice(split).trimStart();
            }
            pageIndex++;
        }

        if (pages.length === 0) pages.push("");
        setPaginasBody(pages);
    }, [corpoTexto, titulo, subtitulo, styles.contentSize, styles.titleSize, styles.subSize, findSplitPoint]);

    const formatConteudo = (text: string) => {
        return text.replace(/\n/g, "<br/>");
    };

    const handleBold = () => {
        const textarea = document.getElementById("corpo-textarea") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start !== end) {
            const textToBold = corpoTexto.substring(start, end);
            const newText = corpoTexto.substring(0, start) + `<b>${textToBold}</b>` + corpoTexto.substring(end);
            setCorpoTexto(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start, start + textToBold.length + 7);
            }, 10);
        } else {
            toast.info("Selecione um trecho do texto antes de clicar em Negrito.");
        }
    };


    const generateImages = async () => {
        setIsGenerating(true);
        try {
            // Abordagem idêntica ao CarrosselInteracoes (que funciona):
            // Clonar o preview visível e injetar no body para captura
            await document.fonts.ready;

            for (let i = 0; i < paginasBody.length; i++) {
                // Busca o preview visível da página i
                const previewEl = document.getElementById(`preview-page-${i}`);
                if (!previewEl) continue;

                // Cria container clone no body (mesma técnica do CarrosselInteracoes)
                const cloneContainer = document.createElement("div");
                cloneContainer.style.position = "fixed";
                cloneContainer.style.left = "-9999px";
                cloneContainer.style.top = "0";
                cloneContainer.style.width = `${PAGE_W}px`;
                cloneContainer.style.height = `${PAGE_H}px`;
                cloneContainer.style.overflow = "hidden";
                cloneContainer.style.zIndex = "-1";
                document.body.appendChild(cloneContainer);

                // Clona o preview sem transform
                const clone = previewEl.cloneNode(true) as HTMLElement;
                clone.style.transform = "none";
                clone.style.width = `${PAGE_W}px`;
                clone.style.height = `${PAGE_H}px`;
                cloneContainer.appendChild(clone);

                // Aguarda renderização do clone
                await new Promise((resolve) => setTimeout(resolve, 300));

                const canvas = await html2canvas(clone, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    width: PAGE_W,
                    height: PAGE_H,
                    logging: false,
                });

                // Remove clone
                document.body.removeChild(cloneContainer);

                // saveAs com blob — padrão do CarrosselInteracoes
                const suffix = paginasBody.length > 1 ? `_pag${i + 1}` : "";
                const blob = await new Promise<Blob>((resolve) =>
                    canvas.toBlob((b) => resolve(b!), "image/png", 1.0)
                );
                saveAs(blob, `decreto${suffix}_${String(Date.now()).slice(-4)}.png`);

                if (i < paginasBody.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }

            toast.success(paginasBody.length > 1 ? "Decretos gerados com sucesso!" : "Decreto gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar imagem:", error);
            toast.error("Erro ao gerar imagem");
        } finally {
            setIsGenerating(false);
        }
    };


    const updateStyle = (key: keyof typeof styles, value: any) => {
        setStyles((prev) => ({ ...prev, [key]: value }));
    };

    const DocumentPage = ({ index, conteudo, idPrefix }: { index: number; conteudo: string; idPrefix: "capture" | "preview" }) => {
        return (
            <div
                id={`${idPrefix}-page-${index}`}
                style={{
                    width: `${PAGE_W}px`,
                    height: `${PAGE_H}px`,
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    flexShrink: 0,
                }}
            >
                <img
                    src={modeloDecretoPg1}
                    alt={`Modelo Decreto Página ${index + 1}`}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                />

                <div
                    style={{
                        position: "absolute",
                        top: `${MARGIN_TOP}px`,
                        left: `${MARGIN_LEFT}px`,
                        right: `${MARGIN_RIGHT}px`,
                        bottom: `${MARGIN_BOTTOM}px`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        textAlign: styles.align,
                        overflow: "hidden",
                    }}
                >
                    {index === 0 && subtitulo && (
                        <div
                            style={{
                                fontFamily: "'GLOBO RD BD', 'Globo Text', Arial, sans-serif",
                                fontWeight: "bold",
                                fontSize: `${styles.subSize}px`,
                                color: "#1a1a1a",
                                lineHeight: "1.3",
                                whiteSpace: "pre-wrap",
                                flexShrink: 0,
                            }}
                        >
                            {subtitulo}
                        </div>
                    )}

                    {index === 0 && titulo && (
                        <div
                            style={{
                                fontFamily: "'GLOBO-TX-BD', 'Globo Text', Arial, sans-serif",
                                fontWeight: "700",
                                fontSize: `${styles.titleSize}px`,
                                color: "#1a1a1a",
                                lineHeight: "1.1",
                                whiteSpace: "pre-wrap",
                                flexShrink: 0,
                            }}
                        >
                            {titulo}
                        </div>
                    )}

                    {conteudo && (
                        <div
                            style={{
                                fontFamily: "'Globo Text', 'GLOBO-TX-BK', Arial, sans-serif",
                                fontWeight: "normal",
                                fontSize: `${styles.contentSize}px`,
                                color: "#111111",
                                lineHeight: "1.6",
                                overflow: "hidden",
                            }}
                            dangerouslySetInnerHTML={{ __html: formatConteudo(conteudo) }}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] p-4 md:p-8 relative">
            {/* Hidden divs for measurement */}
            <div
                ref={measureRef}
                style={{
                    position: "fixed",
                    top: "-9999px",
                    left: "-9999px",
                    visibility: "hidden",
                    width: `${CONTENT_W}px`,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    pointerEvents: "none",
                }}
            />
            {/* Title block measurement */}
            <div
                ref={titleMeasureRef}
                style={{
                    position: "fixed",
                    top: "-9999px",
                    left: "-9999px",
                    visibility: "hidden",
                    width: `${CONTENT_W}px`,
                    fontFamily: "'GLOBO CD BD', 'Globo Condensed', Arial, sans-serif",
                    fontWeight: "900",
                    fontSize: `${styles.titleSize}px`,
                    lineHeight: "1.1",
                    whiteSpace: "pre-wrap",
                    pointerEvents: "none",
                }}
            >
                {titulo}
            </div>

            {/* Hidden capture container */}
            <div
                ref={captureRef}
                style={{
                    position: "absolute",
                    top: "-9999px",
                    left: "-9999px",
                    display: "none",
                    width: `${PAGE_W}px`,
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {paginasBody.map((conteudo, index) => (
                    <DocumentPage key={`capture-${index}`} index={index} conteudo={conteudo} idPrefix="capture" />
                ))}
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/prefeitura/modelos-oficiais">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                            <ArrowLeft className="h-5 w-5 text-zinc-400" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Editor de Editais e Decretos</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Formulário - 5 colunas */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[#111111] p-6 rounded-2xl border border-white/[0.08] space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Type className="w-5 h-5 text-blue-400" />
                                    Textos do Documento
                                </h2>
                                {/* Page counter badge */}
                                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-3 py-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {paginasBody.length} página{paginasBody.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Subtítulo / Epígrafe */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-300">Epígrafe / Identificador</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-500">Tamanho:</span>
                                        <input
                                            type="range"
                                            min="16"
                                            max="48"
                                            value={styles.subSize}
                                            onChange={(e) => updateStyle("subSize", Number(e.target.value))}
                                            className="w-20 accent-blue-400"
                                        />
                                    </div>
                                </div>
                                <Textarea
                                    value={subtitulo}
                                    onChange={(e) => setSubtitulo(e.target.value)}
                                    placeholder="Ex: COMUNICADO IMPORTANTE"
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-blue-400/50 text-white min-h-[60px]"
                                />
                            </div>

                            {/* Título Principal */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-zinc-300">Título Principal</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-500">Tamanho:</span>
                                        <input
                                            type="range"
                                            min="24"
                                            max="90"
                                            value={styles.titleSize}
                                            onChange={(e) => updateStyle("titleSize", Number(e.target.value))}
                                            className="w-20 accent-blue-400"
                                        />
                                    </div>
                                </div>
                                <Textarea
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ex: EDITAL DE CONVOCAÇÃO..."
                                    className="bg-zinc-900/50 border-zinc-800 focus:border-blue-400/50 text-white min-h-[80px]"
                                />
                            </div>

                            {/* Corpo do Texto - único campo, paginação automática */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <Label className="text-zinc-300 text-lg">Corpo do Texto</Label>
                                        <p className="text-xs text-zinc-500 mt-0.5">As páginas são criadas automaticamente</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-500">Fonte:</span>
                                        <input
                                            type="range"
                                            min="14"
                                            max="40"
                                            value={styles.contentSize}
                                            onChange={(e) => updateStyle("contentSize", Number(e.target.value))}
                                            className="w-20 accent-blue-400"
                                        />
                                    </div>
                                </div>

                                {/* Alinhamento */}
                                <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg inline-flex">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${styles.align === "left" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}
                                        onClick={() => updateStyle("align", "left")}
                                    >
                                        <AlignLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${styles.align === "center" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}
                                        onClick={() => updateStyle("align", "center")}
                                    >
                                        <AlignCenter className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${styles.align === "right" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"}`}
                                        onClick={() => updateStyle("align", "right")}
                                    >
                                        <AlignRight className="w-4 h-4" />
                                    </Button>
                                    <div className="w-px bg-zinc-700 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBold}
                                        className="h-8 text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2"
                                        title="Selecione texto e clique para negrito"
                                    >
                                        <Bold className="w-3.5 h-3.5" /> Negrito
                                    </Button>
                                </div>

                                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <Textarea
                                        id="corpo-textarea"
                                        value={corpoTexto}
                                        onChange={(e) => setCorpoTexto(e.target.value)}
                                        placeholder="Digite todo o conteúdo do documento aqui. As páginas serão criadas automaticamente conforme o texto preencher o espaço disponível..."
                                        className="bg-zinc-900/50 border-zinc-800 focus:border-blue-400/50 text-white min-h-[250px] font-mono text-sm leading-relaxed resize-y"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={generateImages}
                                disabled={isGenerating}
                                className="w-full h-12 text-md mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all shadow-lg hover:shadow-cyan-500/25"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                {isGenerating ? "Gerando Documento(s)..." : `Salvar ${paginasBody.length > 1 ? `${paginasBody.length} Páginas` : "Decreto"} (PNG HD)`}
                            </Button>
                        </div>
                    </div>

                    {/* Preview - 7 colunas */}
                    <div className="lg:col-span-7 flex flex-col items-start">
                        <p className="text-sm text-zinc-500 mb-4 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Previsualização em Tempo Real
                            <span className="text-zinc-600">•</span>
                            <span>{paginasBody.length} página{paginasBody.length !== 1 ? "s" : ""}</span>
                        </p>

                        {/* Preview responsivo - uma página por vez com scroll */}
                        <div
                            ref={previewContainerRef}
                            className="w-full flex flex-col gap-6"
                        >
                            {paginasBody.map((conteudo, index) => (
                                <div key={`preview-wrap-${index}`} className="flex flex-col items-start">
                                    <span className="text-xs text-blue-400 font-semibold mb-2 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Página {index + 1}
                                    </span>
                                    <div
                                        className="relative shadow-2xl rounded-sm border border-white/[0.04]"
                                        style={{
                                            width: `${PAGE_W * previewScale}px`,
                                            height: `${PAGE_H * previewScale}px`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                transform: `scale(${previewScale})`,
                                                transformOrigin: "top left",
                                                width: `${PAGE_W}px`,
                                                height: `${PAGE_H}px`,
                                            }}
                                        >
                                            <DocumentPage index={index} conteudo={conteudo} idPrefix="preview" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditalDecretos;
