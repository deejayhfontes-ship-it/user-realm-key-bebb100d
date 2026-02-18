import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Download, Upload, Plus, Minus, Move, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Undo2 } from "lucide-react";
import logoHeliodora from "@/assets/prefeitura/logo-heliodora.png";
import baseCarrossel from "@/assets/prefeitura/base-carrossel.png";

interface SlideData {
  backgroundImage: string | null;
  titulo: string;
  palavraGrande: string;
  descricao: string;
  personagem: string | null;
  personagemScale: number;
  personagemX: number;
  personagemY: number;
  tituloY: number;
  imageScale: number;
  imageX: number;
  imageY: number;
}

interface CarrosselInteracoesProps {
  onBack?: () => void;
}

const CarrosselInteracoes = ({ onBack }: CarrosselInteracoesProps) => {
  const [numSlides, setNumSlides] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [corTraco, setCorTraco] = useState("#F5C518");
  const [corFundo, setCorFundo] = useState("#004691");
  const [secretaria, setSecretaria] = useState("ESPORTE E LAZER");
  const [tipoSecretaria, setTipoSecretaria] = useState("DIRETORIA");
  const [tituloShadow, setTituloShadow] = useState(true);

  const [slides, setSlides] = useState<SlideData[]>([
    {
      backgroundImage: null,
      titulo: "GRADUAÇÃO\nDO JIU-JITSU\nPROJETO\nJOVEM SAMURAI",
      palavraGrande: "JIU JITSU",
      descricao: "Aqui não se ganha faixa. Se\nconquista caráter.",
      personagem: null,
      personagemScale: 1,
      personagemX: 850,
      personagemY: 750,
      tituloY: 480,
      imageScale: 1,
      imageX: 50, // percentage for object-position (0-100)
      imageY: 50, // percentage for object-position (0-100)
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraggingPersonagem, setIsDraggingPersonagem] = useState(false);
  const [isDraggingTitulo, setIsDraggingTitulo] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personagemInputRef = useRef<HTMLInputElement>(null);

  // Histórico para undo (Ctrl+Z)
  const [history, setHistory] = useState<SlideData[][]>([]);
  const maxHistoryLength = 50;

  // Salva estado no histórico antes de cada mudança
  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = [...prev, JSON.parse(JSON.stringify(slides))];
      if (newHistory.length > maxHistoryLength) {
        return newHistory.slice(-maxHistoryLength);
      }
      return newHistory;
    });
  }, [slides]);

  // Função de undo
  const undo = useCallback(() => {
    if (history.length === 0) {
      toast.info("Nada para desfazer");
      return;
    }
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setSlides(previousState);
    toast.success("Ação desfeita");
  }, [history]);

  // Listener para Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo]);

  const updateSlide = (index: number, data: Partial<SlideData>) => {
    saveToHistory();
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[index] = { ...newSlides[index], ...data };
      return newSlides;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSlide(currentSlide, { backgroundImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonagemUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSlide(currentSlide, { personagem: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNumSlidesChange = (num: number) => {
    if (num >= 1 && num <= 4) {
      setNumSlides(num);
      if (currentSlide >= num) {
        setCurrentSlide(num - 1);
      }
      // Ajusta array de slides
      if (num > slides.length) {
        const newSlides = [...slides];
        for (let i = slides.length; i < num; i++) {
          newSlides.push({
            backgroundImage: null,
            titulo: "TÍTULO",
            palavraGrande: "PALAVRA",
            descricao: "Descrição do slide.",
            personagem: null,
            personagemScale: 1,
            personagemX: 700,
            personagemY: 900,
            tituloY: 480,
            imageScale: 1,
            imageX: 50,
            imageY: 50,
          });
        }
        setSlides(newSlides);
      }
    }
  };

  const generateImages = async () => {
    if (!previewRef.current) return;

    setIsGenerating(true);
    try {
      for (let i = 0; i < numSlides; i++) {
        setCurrentSlide(i);
        // Wait for slide to render properly
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Create a clone of the preview element for capture
        const cloneContainer = document.createElement("div");
        cloneContainer.style.position = "fixed";
        cloneContainer.style.left = "-9999px";
        cloneContainer.style.top = "0";
        cloneContainer.style.width = "1080px";
        cloneContainer.style.height = "1350px";
        cloneContainer.style.overflow = "hidden";
        cloneContainer.style.zIndex = "-1";
        document.body.appendChild(cloneContainer);

        // Clone the preview content
        const clone = previewRef.current.cloneNode(true) as HTMLElement;
        clone.style.transform = "none";
        clone.style.width = "1080px";
        clone.style.height = "1350px";
        cloneContainer.appendChild(clone);

        // Wait for fonts and images to load in the clone
        await new Promise((resolve) => setTimeout(resolve, 200));

        const canvas = await html2canvas(clone, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 1080,
          height: 1350,
          logging: false,
          onclone: (clonedDoc) => {
            // Ensure fonts are loaded in cloned document
            const clonedElement = clonedDoc.querySelector('[data-preview-content]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.transform = "none";
            }
          },
        });

        // Remove clone container
        document.body.removeChild(cloneContainer);

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/png", 1.0)
        );
        saveAs(blob, `carrossel_slide${i + 1}_${String(Date.now()).slice(-4)}.png`);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      toast.success("Imagens geradas com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar imagens:", error);
      toast.error("Erro ao gerar imagens");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSlideData = slides[currentSlide] || slides[0];

  // Define layout alternado baseado no índice do slide
  const getLayoutType = (index: number) => {
    // Layout 1: imagem full width com overlay (slide 0)
    // Layout 2: imagem à esquerda + texto à direita (slide 1, 3)
    // Layout 3: duas fotos empilhadas (slide 2)
    if (index === 0) return "full";
    if (index === 2) return "stacked";
    return "split";
  };

  const layoutType = getLayoutType(currentSlide);

  const dragStartRef = useRef<{ x: number; y: number; imageX: number; imageY: number } | null>(null);

  const handleDrag = (e: React.MouseEvent) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleY = 1350 / rect.height;
    const scaleX = 1080 / rect.width;
    const y = (e.clientY - rect.top) * scaleY;
    const x = (e.clientX - rect.left) * scaleX;

    if (isDraggingPersonagem) {
      updateSlide(currentSlide, { personagemX: x, personagemY: y });
    }

    if (isDraggingTitulo) {
      updateSlide(currentSlide, { tituloY: Math.max(100, Math.min(700, y)) });
    }

    if (isDraggingImage && dragStartRef.current) {
      // Calculate delta as percentage (inverse direction for natural feel)
      const deltaX = ((x - dragStartRef.current.x) / 1080) * 100;
      const deltaY = ((y - dragStartRef.current.y) / 1350) * 100;

      updateSlide(currentSlide, {
        imageX: Math.max(0, Math.min(100, dragStartRef.current.imageX - deltaX)),
        imageY: Math.max(0, Math.min(100, dragStartRef.current.imageY - deltaY))
      });
    }
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = 1080 / rect.width;
    const scaleY = 1350 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    dragStartRef.current = {
      x,
      y,
      imageX: currentSlideData.imageX,
      imageY: currentSlideData.imageY
    };
    setIsDraggingImage(true);
  };

  const handleMouseUp = () => {
    setIsDraggingPersonagem(false);
    setIsDraggingTitulo(false);
    setIsDraggingImage(false);
    dragStartRef.current = null;
  };

  const titleShadowStyle = tituloShadow ? "2px 4px 8px rgba(0,0,0,0.6)" : "none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">
            Carrossel de Interações
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={history.length === 0}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Desfazer
          </Button>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-4 bg-card p-6 rounded-lg border border-border max-h-[80vh] overflow-y-auto">
          {/* Número de slides */}
          <div>
            <Label className="text-foreground">Número de Lâminas</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((num) => (
                <Button
                  key={num}
                  variant={numSlides === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNumSlidesChange(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {/* Navegação de slides */}
          <div>
            <Label className="text-foreground">Slide Atual</Label>
            <div className="flex gap-2 mt-2">
              {Array.from({ length: numSlides }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentSlide === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSlide(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>

          {/* Cores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Cor do Traço</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={corTraco}
                  onChange={(e) => setCorTraco(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={corTraco}
                  onChange={(e) => setCorTraco(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Cor do Fundo</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={corFundo}
                  onChange={(e) => setCorFundo(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={corFundo}
                  onChange={(e) => setCorFundo(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Secretaria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Tipo (ex: DIRETORIA)</Label>
              <Input
                value={tipoSecretaria}
                onChange={(e) => setTipoSecretaria(e.target.value.toUpperCase())}
                placeholder="DIRETORIA"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-foreground">Nome da Secretaria</Label>
              <Input
                value={secretaria}
                onChange={(e) => setSecretaria(e.target.value.toUpperCase())}
                placeholder="ESPORTE E LAZER"
                className="mt-2"
              />
            </div>
          </div>

          {/* Imagem de fundo */}
          <div>
            <Label className="text-foreground">Imagem de Fundo</Label>
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-16 border-dashed"
              >
                <Upload className="mr-2 h-5 w-5" />
                {currentSlideData.backgroundImage ? "Trocar imagem" : "Carregar imagem"}
              </Button>
            </div>
          </div>

          {/* Controles de Imagem */}
          {currentSlideData.backgroundImage && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
              <Label className="text-foreground text-sm font-medium">Ajustes da Imagem</Label>

              {/* Zoom */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-16">Zoom</Label>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSlide(currentSlide, {
                      imageScale: Math.max(1, currentSlideData.imageScale - 0.1),
                    })
                  }
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-sm w-14 text-center">
                  {(currentSlideData.imageScale * 100).toFixed(0)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSlide(currentSlide, {
                      imageScale: Math.min(3, currentSlideData.imageScale + 0.1),
                    })
                  }
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              {/* Posição X (0-100%) */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-16">Horizontal</Label>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSlide(currentSlide, {
                      imageX: Math.max(0, currentSlideData.imageX - 5),
                    })
                  }
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
                <span className="text-sm w-14 text-center">
                  {currentSlideData.imageX}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSlide(currentSlide, {
                      imageX: Math.min(100, currentSlideData.imageX + 5),
                    })
                  }
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>

              {/* Posição Y (0-100%) */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-16">Vertical</Label>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSlide(currentSlide, {
                      imageY: Math.max(0, currentSlideData.imageY - 5),
                    })
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm w-14 text-center">
                  {currentSlideData.imageY}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateSlide(currentSlide, {
                      imageY: Math.min(100, currentSlideData.imageY + 5),
                    })
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Move className="h-3 w-3" /> Arraste a imagem no preview para reposicionar
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSlide(currentSlide, { imageX: 50, imageY: 50, imageScale: 1 })}
                className="w-full"
              >
                Resetar posição
              </Button>
            </div>
          )}

          {/* Título */}
          <div>
            <Label className="text-foreground">Título (Chandler Mountain 66px)</Label>
            <Textarea
              value={currentSlideData.titulo}
              onChange={(e) => updateSlide(currentSlide, { titulo: e.target.value })}
              placeholder="CONQUISTA &\nRECONHECIMENTO"
              className="mt-2"
            />
          </div>

          {/* Shadow do título */}
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Sombra no Título</Label>
            <Switch
              checked={tituloShadow}
              onCheckedChange={setTituloShadow}
            />
          </div>

          {/* Palavra Grande */}
          <div>
            <Label className="text-foreground">Palavra Grande (na área colorida)</Label>
            <Input
              value={currentSlideData.palavraGrande}
              onChange={(e) => updateSlide(currentSlide, { palavraGrande: e.target.value.toUpperCase() })}
              placeholder="JIU JITSU"
              className="mt-2"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-foreground">Descrição (Sora 18px)</Label>
            <Textarea
              value={currentSlideData.descricao}
              onChange={(e) => updateSlide(currentSlide, { descricao: e.target.value })}
              placeholder="Descrição do slide..."
              className="mt-2"
            />
          </div>

          {/* Dica de arrastar */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <Move className="h-3 w-3 inline mr-1" />
            Arraste o título, imagem ou personagem no preview para reposicionar
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Personagem (opcional)</Label>
            <input
              type="file"
              ref={personagemInputRef}
              onChange={handlePersonagemUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => personagemInputRef.current?.click()}
              className="w-full h-12 border-dashed"
            >
              <Upload className="mr-2 h-4 w-4" />
              {currentSlideData.personagem ? "Trocar personagem" : "Carregar personagem"}
            </Button>

            {currentSlideData.personagem && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Tamanho do Personagem</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateSlide(currentSlide, {
                        personagemScale: Math.max(0.3, currentSlideData.personagemScale - 0.1),
                      })
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-16 text-center">
                    {(currentSlideData.personagemScale * 100).toFixed(0)}%
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateSlide(currentSlide, {
                        personagemScale: Math.min(2, currentSlideData.personagemScale + 0.1),
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Move className="h-3 w-3" /> Clique e arraste no preview para mover
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSlide(currentSlide, { personagem: null })}
                  className="w-full"
                >
                  Remover personagem
                </Button>
              </div>
            )}
          </div>

          <Button
            onClick={generateImages}
            disabled={isGenerating}
            className="w-full h-12 text-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            {isGenerating ? "Gerando..." : `Gerar ${numSlides} Imagem(ns) PNG`}
          </Button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-4">
            Preview - Slide {currentSlide + 1} ({layoutType})
          </p>

          <div
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{
              width: "360px",
              height: "450px",
            }}
          >
            <div
              style={{
                transform: "scale(0.3333)",
                transformOrigin: "top left",
                width: "1080px",
                height: "1350px",
              }}
            >
              {/* Preview real (1080x1350) - formato carrossel Instagram */}
              <div
                ref={previewRef}
                style={{
                  width: "1080px",
                  height: "1350px",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                }}
                onMouseMove={handleDrag}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Layout baseado no tipo */}
                {layoutType === "full" && (
                  <>
                    {/* Imagem de fundo full - altura até antes da área azul */}
                    {currentSlideData.backgroundImage && (
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "880px",
                          overflow: "hidden",
                          cursor: "grab",
                        }}
                        onMouseDown={handleImageMouseDown}
                      >
                        <img
                          src={currentSlideData.backgroundImage}
                          alt="Background"
                          style={{
                            width: "100%",
                            height: "auto",
                            minHeight: "100%",
                            objectFit: "cover",
                            objectPosition: `${currentSlideData.imageX}% ${currentSlideData.imageY}%`,
                            transform: `scale(${currentSlideData.imageScale})`,
                            transformOrigin: `${currentSlideData.imageX}% ${currentSlideData.imageY}%`,
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    )}

                    {/* Traço amarelo acima do título */}
                    <div
                      style={{
                        position: "absolute",
                        top: `${currentSlideData.tituloY}px`,
                        left: "100px",
                        width: "160px",
                        height: "8px",
                        backgroundColor: corTraco,
                        cursor: "grab",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingTitulo(true);
                      }}
                    />

                    {/* Título - Chandler Mountain - posicionado sobre a imagem */}
                    <div
                      style={{
                        position: "absolute",
                        top: `${currentSlideData.tituloY + 25}px`,
                        left: "100px",
                        right: "100px",
                        zIndex: 10,
                        cursor: "grab",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingTitulo(true);
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "ChandlerMountain, sans-serif",
                          fontSize: "80px",
                          lineHeight: 1.05,
                          color: "white",
                          textShadow: titleShadowStyle,
                          whiteSpace: "pre-line",
                          textTransform: "uppercase",
                          pointerEvents: "none",
                        }}
                      >
                        {currentSlideData.titulo}
                      </h2>
                    </div>
                  </>
                )}

                {layoutType === "split" && (
                  <>
                    {/* Imagem à esquerda - ajustada para cobrir até área azul */}
                    {currentSlideData.backgroundImage && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "55%",
                          height: "880px",
                          overflow: "hidden",
                          cursor: "grab",
                        }}
                        onMouseDown={handleImageMouseDown}
                      >
                        <img
                          src={currentSlideData.backgroundImage}
                          alt="Background"
                          style={{
                            width: "100%",
                            height: "auto",
                            minHeight: "100%",
                            objectFit: "cover",
                            objectPosition: `${currentSlideData.imageX}% ${currentSlideData.imageY}%`,
                            transform: `scale(${currentSlideData.imageScale})`,
                            transformOrigin: `${currentSlideData.imageX}% ${currentSlideData.imageY}%`,
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    )}

                    {/* Área azul à direita */}
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "50%",
                        height: "880px",
                        backgroundColor: corFundo,
                        overflow: "hidden",
                      }}
                    >
                      {/* Traço arrastável */}
                      <div
                        style={{
                          position: "absolute",
                          top: `${currentSlideData.tituloY - 400}px`,
                          left: "40px",
                          width: "160px",
                          height: "8px",
                          backgroundColor: corTraco,
                          cursor: "grab",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setIsDraggingTitulo(true);
                        }}
                      />
                      {/* Título arrastável */}
                      <div
                        style={{
                          position: "absolute",
                          top: `${currentSlideData.tituloY - 400 + 25}px`,
                          left: "40px",
                          right: "40px",
                          cursor: "grab",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setIsDraggingTitulo(true);
                        }}
                      >
                        <h2
                          style={{
                            fontFamily: "ChandlerMountain, sans-serif",
                            fontSize: "80px",
                            lineHeight: 1.05,
                            color: "white",
                            textShadow: titleShadowStyle,
                            whiteSpace: "pre-line",
                            pointerEvents: "none",
                          }}
                        >
                          {currentSlideData.titulo}
                        </h2>
                      </div>
                    </div>
                  </>
                )}

                {layoutType === "stacked" && (
                  <>
                    {/* Duas imagens empilhadas */}
                    {currentSlideData.backgroundImage && (
                      <>
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "32.5%",
                            overflow: "hidden",
                            cursor: "grab",
                          }}
                          onMouseDown={handleImageMouseDown}
                        >
                          <img
                            src={currentSlideData.backgroundImage}
                            alt="Background 1"
                            style={{
                              width: "100%",
                              height: "auto",
                              minHeight: "100%",
                              objectFit: "cover",
                              objectPosition: `${currentSlideData.imageX}% ${currentSlideData.imageY}%`,
                              transform: `scale(${currentSlideData.imageScale})`,
                              transformOrigin: `${currentSlideData.imageX}% ${currentSlideData.imageY}%`,
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "32.5%",
                            width: "100%",
                            height: "32.5%",
                            overflow: "hidden",
                            cursor: "grab",
                          }}
                          onMouseDown={handleImageMouseDown}
                        >
                          <img
                            src={currentSlideData.backgroundImage}
                            alt="Background 2"
                            style={{
                              width: "100%",
                              height: "auto",
                              minHeight: "100%",
                              objectFit: "cover",
                              objectPosition: `${currentSlideData.imageX}% ${100 - currentSlideData.imageY}%`,
                              transform: `scale(${currentSlideData.imageScale})`,
                              transformOrigin: `${currentSlideData.imageX}% ${100 - currentSlideData.imageY}%`,
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                      </>
                    )}

                    {/* Traço arrastável */}
                    <div
                      style={{
                        position: "absolute",
                        top: `${currentSlideData.tituloY}px`,
                        left: "100px",
                        width: "160px",
                        height: "8px",
                        backgroundColor: corTraco,
                        cursor: "grab",
                        zIndex: 10,
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingTitulo(true);
                      }}
                    />

                    {/* Título arrastável */}
                    <div
                      style={{
                        position: "absolute",
                        top: `${currentSlideData.tituloY + 25}px`,
                        left: "100px",
                        right: "100px",
                        zIndex: 10,
                        cursor: "grab",
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingTitulo(true);
                      }}
                    >
                      <h2
                        style={{
                          fontFamily: "ChandlerMountain, sans-serif",
                          fontSize: "80px",
                          lineHeight: 1.05,
                          color: "white",
                          textShadow: titleShadowStyle,
                          whiteSpace: "pre-line",
                          textTransform: "uppercase",
                          pointerEvents: "none",
                        }}
                      >
                        {currentSlideData.titulo}
                      </h2>
                    </div>
                  </>
                )}

                {/* Área azul inferior */}
                <div
                  style={{
                    position: "absolute",
                    top: "880px",
                    left: 0,
                    right: 0,
                    height: "290px",
                    backgroundColor: corFundo,
                    overflow: "hidden",
                  }}
                >
                  {/* Palavra grande com opacidade - de fora a fora */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-80px",
                      right: "-80px",
                      top: "32px",
                      fontFamily: "ChandlerMountain, sans-serif",
                      fontSize: "380px",
                      color: "rgba(255,255,255,0.12)",
                      letterSpacing: "-0.03em",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                      textTransform: "uppercase",
                      lineHeight: 0.85,
                    }}
                  >
                    {currentSlideData.palavraGrande}
                  </div>

                  {/* Descrição - Sora */}
                  <div
                    style={{
                      position: "absolute",
                      left: "100px",
                      right: "400px",
                      top: "40px",
                      zIndex: 5,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Sora, sans-serif",
                        fontSize: "24px",
                        lineHeight: 1.5,
                        color: "white",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {currentSlideData.descricao}
                    </p>
                  </div>
                </div>

                {/* Personagem */}
                {currentSlideData.personagem && (
                  <div
                    style={{
                      position: "absolute",
                      left: currentSlideData.personagemX - 150 * currentSlideData.personagemScale,
                      top: currentSlideData.personagemY - 200 * currentSlideData.personagemScale,
                      cursor: "grab",
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsDraggingPersonagem(true);
                    }}
                  >
                    <img
                      src={currentSlideData.personagem}
                      alt="Personagem"
                      style={{
                        height: `${400 * currentSlideData.personagemScale}px`,
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                )}

                {/* Área branca do rodapé com logo e secretaria */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "180px",
                    backgroundColor: "white",
                  }}
                >
                  {/* Base com bandeiras */}
                  <img
                    src={baseCarrossel}
                    alt="Base"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "60px",
                      objectFit: "cover",
                      objectPosition: "bottom",
                    }}
                  />

                  {/* Logo + Secretaria centralizado */}
                  <div
                    style={{
                      position: "absolute",
                      top: "35px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    {/* Logo */}
                    <img
                      src={logoHeliodora}
                      alt="Prefeitura de Heliodora"
                      style={{
                        height: "66px",
                        objectFit: "contain",
                      }}
                    />

                    {/* Separador */}
                    <div
                      style={{
                        width: "2px",
                        height: "51px",
                        backgroundColor: "#1a1a1a",
                      }}
                    />

                    {/* Secretaria */}
                    <div style={{ textAlign: "left" }}>
                      <p
                        style={{
                          fontFamily: "Aspekta, sans-serif",
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#1a1a1a",
                          marginBottom: "0px",
                          lineHeight: 1.1,
                          letterSpacing: "-0.05em",
                        }}
                      >
                        {tipoSecretaria}<span style={{ fontSize: "9px", marginLeft: "2px" }}>de</span>
                      </p>
                      <p
                        style={{
                          fontFamily: "Aspekta, sans-serif",
                          fontWeight: 800,
                          fontSize: "18px",
                          color: "#1a1a1a",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                        }}
                      >
                        {secretaria}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrosselInteracoes;
