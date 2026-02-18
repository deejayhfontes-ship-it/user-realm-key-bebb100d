import { useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Download, Upload, ArrowLeft, X, Image, ZoomIn, MoveHorizontal, MoveVertical } from "lucide-react";
import maskImage from "@/assets/prefeitura/mask-storie.png";
import CarrosselInteracoes from "@/components/prefeitura/CarrosselInteracoes";

type GeneratorType = "stories" | "carrossel";
type PhotoCount = 1 | 2 | 3;

interface ImageSettings {
  scale: number;
  positionX: number; // -50 a 50 (offset em %)
  positionY: number; // -50 a 50 (offset em %)
}

const defaultImageSettings: ImageSettings = {
  scale: 1,
  positionX: 0,
  positionY: 0,
};

const PrefeituraMaisFacil = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'carrossel' ? 'carrossel' : 'stories';
  const [generatorType, setGeneratorType] = useState<GeneratorType>(initialTab);
  const [photoCount, setPhotoCount] = useState<PhotoCount>(1);
  const [backgroundImages, setBackgroundImages] = useState<(string | null)[]>([null, null, null]);
  const [imageSettings, setImageSettings] = useState<ImageSettings[]>([
    { ...defaultImageSettings },
    { ...defaultImageSettings },
    { ...defaultImageSettings },
  ]);
  const [secretaria, setSecretaria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  // Data automática formatada
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Calcula o tamanho da fonte baseado no comprimento do texto
  const calculateFontSize = (text: string): number => {
    const baseSize = 55;
    const minSize = 45;
    const length = text.length;

    if (length <= 100) return baseSize;
    if (length <= 150) return 52;
    if (length <= 200) return 50;
    if (length <= 300) return 48;
    return minSize;
  };

  const handleImageUpload = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...backgroundImages];
        newImages[index] = e.target?.result as string;
        setBackgroundImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...backgroundImages];
    newImages[index] = null;
    setBackgroundImages(newImages);
    // Reset settings
    const newSettings = [...imageSettings];
    newSettings[index] = { ...defaultImageSettings };
    setImageSettings(newSettings);
  };

  const updateImageSetting = (index: number, key: keyof ImageSettings, value: number) => {
    const newSettings = [...imageSettings];
    newSettings[index] = { ...newSettings[index], [key]: value };
    setImageSettings(newSettings);
  };

  const handlePhotoCountChange = (count: PhotoCount) => {
    setPhotoCount(count);
    // Limpar imagens extras se diminuir o número
    if (count < photoCount) {
      const newImages = [...backgroundImages];
      const newSettings = [...imageSettings];
      for (let i = count; i < 3; i++) {
        newImages[i] = null;
        newSettings[i] = { ...defaultImageSettings };
      }
      setBackgroundImages(newImages);
      setImageSettings(newSettings);
    }
  };

  const hasRequiredImages = () => {
    for (let i = 0; i < photoCount; i++) {
      if (!backgroundImages[i]) return false;
    }
    return true;
  };

  // Drag handlers para posicionar imagem
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(index);

    // Guardar posição inicial do mouse
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = imageSettings[index].positionX;
    const startPosY = imageSettings[index].positionY;

    const handleMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      // Calcular delta - compensar a escala de 0.3 do preview (dividir por 0.3 = multiplicar por ~3.3)
      // Sensibilidade ajustada para movimento mais natural
      const scaleFactor = 0.5; // Sensibilidade do movimento
      const deltaX = (moveEvent.clientX - startX) * scaleFactor;
      const deltaY = (moveEvent.clientY - startY) * scaleFactor;

      // Mover na mesma direção do arraste
      const newX = Math.max(-50, Math.min(50, startPosX + deltaX));
      const newY = Math.max(-50, Math.min(50, startPosY + deltaY));

      updateImageSetting(index, 'positionX', newX);
      updateImageSetting(index, 'positionY', newY);
    };

    const handleUp = () => {
      setDraggingIndex(null);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const generateImage = async () => {
    if (!captureRef.current) return;

    setIsGenerating(true);
    try {
      const captureEl = captureRef.current;

      // Posicionar fora da tela mas visível para html2canvas
      captureEl.style.position = 'fixed';
      captureEl.style.left = '-9999px';
      captureEl.style.top = '0px';
      captureEl.style.display = 'block';
      captureEl.style.visibility = 'visible';
      captureEl.style.opacity = '1';
      captureEl.style.zIndex = '-9999';

      // Aguardar renderização completa
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(captureEl, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#1a1a2e",
        logging: false,
        windowWidth: 1080,
        windowHeight: 1920,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      // Esconder elemento novamente
      captureEl.style.display = 'none';

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png", 1.0)
      );
      saveAs(blob, `storieprefeitura_${String(Date.now()).slice(-4)}.png`);

      toast.success("Imagem gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      if (captureRef.current) {
        captureRef.current.style.display = 'none';
      }
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsGenerating(false);
    }
  };

  const fontSize = calculateFontSize(descricao);
  const getImageHeight = () => 1920 / photoCount;

  // Componente de conteúdo do story reutilizável
  const StoryContent = () => (
    <div
      style={{
        width: "1080px",
        height: "1920px",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#1a1a2e",
      }}
    >
      {/* Imagens de fundo empilhadas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Array.from({ length: photoCount }).map((_, index) => {
          const settings = imageSettings[index];
          return (
            <div
              key={index}
              style={{
                width: "100%",
                height: `${getImageHeight()}px`,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {backgroundImages[index] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${backgroundImages[index]})`,
                    backgroundSize: `${settings.scale * 100}%`,
                    backgroundPosition: `${50 + settings.positionX}% ${50 + settings.positionY}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Gradiente overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "960px",
          background: "linear-gradient(to top, #004691 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Máscara/Template overlay */}
      <img
        src={maskImage}
        alt="Mask"
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      {/* Container do texto */}
      <div
        style={{
          position: "absolute",
          bottom: "240px",
          left: "90px",
          right: "90px",
          width: "900px",
        }}
      >
        {secretaria && (
          <div
            style={{
              fontFamily: "'Aspekta', Arial, sans-serif",
              fontWeight: 800,
              fontSize: "24px",
              color: "#ffffff",
              marginBottom: "16px",
              textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
              letterSpacing: "0.5px",
            }}
          >
            {secretaria}
          </div>
        )}

        {descricao && (
          <div
            style={{
              fontFamily: "'Aspekta', Arial, sans-serif",
              fontWeight: 500,
              fontSize: `${fontSize}px`,
              lineHeight: "1.1",
              color: "#ffffff",
              textAlign: "left",
              textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {descricao}
          </div>
        )}
      </div>

      {/* Data e setinha */}
      <div
        style={{
          position: "absolute",
          bottom: "150px",
          right: "90px",
          display: "flex",
          alignItems: "center",
          gap: "60px",
        }}
      >
        <span
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 400,
            fontSize: "24px",
            color: "#ffffff",
            textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
            letterSpacing: "1px",
          }}
        >
          {formattedDate}
        </span>
        <span style={{ color: "#ffffff", fontSize: "32px" }}>→</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      {/* Elemento de captura oculto - fora da viewport */}
      <div
        ref={captureRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          display: "none",
          width: "1080px",
          height: "1920px",
          overflow: "hidden",
        }}
      >
        <StoryContent />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/prefeitura">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Gerador de Conteúdo - Prefeitura
          </h1>
        </div>

        {/* Seletor de tipo de gerador */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={generatorType === "stories" ? "default" : "outline"}
            onClick={() => setGeneratorType("stories")}
            className="flex-1 md:flex-none"
          >
            Gerador de Stories
          </Button>
          <Button
            variant={generatorType === "carrossel" ? "default" : "outline"}
            onClick={() => setGeneratorType("carrossel")}
            className="flex-1 md:flex-none"
          >
            Carrossel de Interações
          </Button>
        </div>

        {generatorType === "carrossel" ? (
          <CarrosselInteracoes />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário */}
            <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
              {/* Seletor de quantidade de fotos */}
              <div>
                <Label className="text-foreground mb-3 block">Quantidade de Fotos</Label>
                <div className="flex gap-2">
                  {([1, 2, 3] as PhotoCount[]).map((count) => (
                    <Button
                      key={count}
                      variant={photoCount === count ? "default" : "outline"}
                      onClick={() => handlePhotoCountChange(count)}
                      className="flex-1"
                    >
                      <Image className="mr-2 h-4 w-4" />
                      {count} {count === 1 ? "Foto" : "Fotos"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Upload de imagens */}
              <div className="space-y-4">
                <Label className="text-foreground">
                  {photoCount === 1 ? "Imagem de Fundo" : `Imagens de Fundo (${photoCount})`}
                </Label>

                {Array.from({ length: photoCount }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      onChange={handleImageUpload(index)}
                      accept="image/*"
                      className="hidden"
                    />

                    {backgroundImages[index] ? (
                      <div className="space-y-2">
                        <div className="relative h-20 rounded-lg overflow-hidden border border-border">
                          <img
                            src={backgroundImages[index]!}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => fileInputRefs.current[index]?.click()}
                            >
                              Trocar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Foto {index + 1}
                          </span>
                        </div>

                        {/* Controles de zoom e posição */}
                        <div className="bg-secondary/30 p-3 rounded-lg space-y-3">
                          <div className="flex items-center gap-3">
                            <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Slider
                              value={[imageSettings[index].scale]}
                              onValueChange={(value) => updateImageSetting(index, 'scale', value[0])}
                              min={1}
                              max={3}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {Math.round(imageSettings[index].scale * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MoveHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Slider
                              value={[imageSettings[index].positionX]}
                              onValueChange={(value) => updateImageSetting(index, 'positionX', value[0])}
                              min={-50}
                              max={50}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {imageSettings[index].positionX > 0 ? '+' : ''}{Math.round(imageSettings[index].positionX)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MoveVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Slider
                              value={[imageSettings[index].positionY]}
                              onValueChange={(value) => updateImageSetting(index, 'positionY', value[0])}
                              min={-50}
                              max={50}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {imageSettings[index].positionY > 0 ? '+' : ''}{Math.round(imageSettings[index].positionY)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="w-full h-16 border-dashed"
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Carregar Foto {index + 1}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="secretaria" className="text-foreground">
                  Secretaria (opcional)
                </Label>
                <Input
                  id="secretaria"
                  value={secretaria}
                  onChange={(e) => setSecretaria(e.target.value.toUpperCase())}
                  placeholder="Ex: SAÚDE"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="text-foreground">
                  Descrição Principal
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Digite a descrição do post..."
                  className="mt-2 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tamanho da fonte: {fontSize}px
                </p>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg">
                <Label className="text-foreground">Data</Label>
                <p className="text-lg font-medium text-foreground mt-1">
                  {formattedDate}
                </p>
              </div>

              <Button
                onClick={generateImage}
                disabled={isGenerating || !hasRequiredImages()}
                className="w-full h-12 text-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {isGenerating ? "Gerando..." : "Gerar Imagem PNG (1080x1920)"}
              </Button>
            </div>

            {/* Preview Container */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-4">
                Preview (clique e arraste para posicionar)
              </p>

              {/* Preview escalado para caber na tela */}
              <div
                className="relative overflow-hidden rounded-lg shadow-lg cursor-crosshair"
                style={{
                  width: "324px",
                  height: "576px",
                }}
              >
                <div
                  style={{
                    transform: "scale(0.3)",
                    transformOrigin: "top left",
                  }}
                >
                  {/* Preview interativo */}
                  <div
                    style={{
                      width: "1080px",
                      height: "1920px",
                      position: "relative",
                      overflow: "hidden",
                      backgroundColor: "#1a1a2e",
                    }}
                  >
                    {/* Imagens de fundo empilhadas */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {Array.from({ length: photoCount }).map((_, index) => {
                        const settings = imageSettings[index];

                        return (
                          <div
                            key={index}
                            onMouseDown={(e) => handleMouseDown(index, e)}
                            style={{
                              width: "100%",
                              height: `${getImageHeight()}px`,
                              overflow: "hidden",
                              position: "relative",
                              cursor: "move",
                            }}
                          >
                            {backgroundImages[index] && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  backgroundImage: `url(${backgroundImages[index]})`,
                                  backgroundSize: `${settings.scale * 100}%`,
                                  backgroundPosition: `${50 + settings.positionX}% ${50 + settings.positionY}%`,
                                  backgroundRepeat: "no-repeat",
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                            {/* Indicador de área arrastável */}
                            {backgroundImages[index] && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  border: draggingIndex === index ? "4px solid #3b82f6" : "2px dashed rgba(255,255,255,0.3)",
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Gradiente overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "960px",
                        background: "linear-gradient(to top, #004691 0%, transparent 100%)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Máscara/Template overlay */}
                    <img
                      src={maskImage}
                      alt="Mask"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Container do texto */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "240px",
                        left: "90px",
                        right: "90px",
                        width: "900px",
                        pointerEvents: "none",
                      }}
                    >
                      {secretaria && (
                        <div
                          style={{
                            fontFamily: "'Aspekta', Arial, sans-serif",
                            fontWeight: 800,
                            fontSize: "24px",
                            color: "#ffffff",
                            marginBottom: "16px",
                            textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {secretaria}
                        </div>
                      )}

                      {descricao && (
                        <div
                          style={{
                            fontFamily: "'Aspekta', Arial, sans-serif",
                            fontWeight: 500,
                            fontSize: `${fontSize}px`,
                            lineHeight: "1.1",
                            color: "#ffffff",
                            textAlign: "left",
                            textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
                            wordWrap: "break-word",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {descricao}
                        </div>
                      )}
                    </div>

                    {/* Data e setinha */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "150px",
                        right: "90px",
                        display: "flex",
                        alignItems: "center",
                        gap: "60px",
                        pointerEvents: "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Arial, sans-serif",
                          fontWeight: 400,
                          fontSize: "24px",
                          color: "#ffffff",
                          textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
                          letterSpacing: "1px",
                        }}
                      >
                        {formattedDate}
                      </span>
                      <span style={{ color: "#ffffff", fontSize: "32px" }}>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrefeituraMaisFacil;
