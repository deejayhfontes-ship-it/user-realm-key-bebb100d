import { useState, useRef } from "react";
import { backupImageToHostGator } from '@/hooks/useImageBackup';
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Download, Upload, X, ZoomIn, MoveHorizontal, MoveVertical, Check } from "lucide-react";

const MASKS = [
  "/prefeitura-assets/mascaras/CAPA PARA INSTA - MASK LOGO color.png",
  "/prefeitura-assets/mascaras/02 CAPA PARA INSTA - MASK LOGO color.png",
  "/prefeitura-assets/mascaras/03 CAPA PARA INSTA - MASK LOGO color.png",
];

// Logos avulsas usadas no formato post (a máscara 9:16 não serve pro 4:5)
const LOGOS_POST = [
  {
    nome: "Branca",
    src: "/prefeitura-assets/logosecretariasegoverno/SECRETARIAS E APLICAÇÕES/00 GOVERNO LOGOS DA PREFEITURA/LOGOS GOVERNO/MONOOUTLINES_BRANCA_HELIODORA.png",
  },
  {
    nome: "Colorida",
    src: "/prefeitura-assets/logosecretariasegoverno/SECRETARIAS E APLICAÇÕES/00 GOVERNO LOGOS DA PREFEITURA/LOGOS GOVERNO/80X300.png",
  },
];

type FormatType = "story" | "post";

const FORMATS: Record<FormatType, { label: string; width: number; height: number; gradientHeight: number; textBottom: number }> = {
  story: { label: "Story (1080x1920)", width: 1080, height: 1920, gradientHeight: 1100, textBottom: 280 },
  post: { label: "Post (1080x1350)", width: 1080, height: 1350, gradientHeight: 800, textBottom: 200 },
};

interface ColorPreset {
  nome: string;
  cor: string;
  textoTarja: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { nome: "Verde", cor: "#5CB136", textoTarja: "#ffffff" },
  { nome: "Azul Claro", cor: "#3B9EDD", textoTarja: "#ffffff" },
  { nome: "Azul Escuro", cor: "#14395C", textoTarja: "#ffffff" },
  { nome: "Amarelo", cor: "#F8C617", textoTarja: "#14395C" },
];

interface ImageSettings {
  scale: number;
  positionX: number;
  positionY: number;
}

const defaultImageSettings: ImageSettings = {
  scale: 1,
  positionX: 0,
  positionY: 0,
};

const StoriesNoticia = () => {
  const [format, setFormat] = useState<FormatType>("story");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>({ ...defaultImageSettings });
  const [secretaria, setSecretaria] = useState("");
  const [manchete, setManchete] = useState("");
  const [colorPreset, setColorPreset] = useState<ColorPreset>(COLOR_PRESETS[0]);
  const [maskImage, setMaskImage] = useState<string>(MASKS[0]);
  const [logoPost, setLogoPost] = useState<typeof LOGOS_POST[number]>(LOGOS_POST[0]);
  const [gradientIntensity, setGradientIntensity] = useState<number>(100);
  const [fontSizeOverride, setFontSizeOverride] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonte auto-ajusta pelo comprimento da manchete (sem limite de caracteres)
  const calculateFontSize = (text: string): number => {
    const length = text.length;
    if (length <= 60) return 60;
    if (length <= 90) return 56;
    if (length <= 120) return 50;
    if (length <= 180) return 46;
    if (length <= 250) return 40;
    return 34;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBackgroundImage(null);
    setImageSettings({ ...defaultImageSettings });
  };

  const updateImageSetting = (key: keyof ImageSettings, value: number) => {
    setImageSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = imageSettings.positionX;
    const startPosY = imageSettings.positionY;

    const handleMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const scaleFactor = 0.5;
      const deltaX = (moveEvent.clientX - startX) * scaleFactor;
      const deltaY = (moveEvent.clientY - startY) * scaleFactor;
      const newX = Math.max(-50, Math.min(50, startPosX + deltaX));
      const newY = Math.max(-50, Math.min(50, startPosY + deltaY));
      setImageSettings((prev) => ({ ...prev, positionX: newX, positionY: newY }));
    };

    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const generateImage = async () => {
    if (!captureRef.current) return;

    setIsGenerating(true);
    try {
      const captureEl = captureRef.current;

      captureEl.style.position = 'fixed';
      captureEl.style.left = '-9999px';
      captureEl.style.top = '0px';
      captureEl.style.display = 'block';
      captureEl.style.visibility = 'visible';
      captureEl.style.opacity = '1';
      captureEl.style.zIndex = '-9999';

      // Garante que a Aspekta carregou antes de capturar — sem isso o html2canvas
      // pode desenhar com Arial (fallback) e o texto muda de posição entre exports
      try {
        await document.fonts.load("800 30px 'Aspekta'");
        await document.fonts.load("500 30px 'Aspekta'");
        await document.fonts.ready;
      } catch { /* segue com fallback se a fonte falhar */ }

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(captureEl, {
        width: FORMATS[format].width,
        height: FORMATS[format].height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#1a1a2e",
        logging: false,
        windowWidth: FORMATS[format].width,
        windowHeight: FORMATS[format].height,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      captureEl.style.display = 'none';

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png", 1.0)
      );
      const filename = `${format === "story" ? "storie" : "post"}noticia_${String(Date.now()).slice(-4)}.png`;
      saveAs(blob, filename);
      backupImageToHostGator(blob, {
        generator_type: 'stories_noticia',
        prompt: `${secretaria} - ${manchete}`,
        filename: filename.replace('.png', ''),
      });

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

  const fontSize = fontSizeOverride ?? calculateFontSize(manchete);

  const fmt = FORMATS[format];
  // No post, logo/tarjinha/textos reduzem na mesma proporção do frame (1350/1920)
  const maskScale = fmt.height / 1920;

  // Conteúdo da arte — interactive liga o drag no preview.
  // translate="no" impede o Google Tradutor do navegador de reescrever a manchete
  // (ex: "AS" virava "COMO" com a página traduzida).
  const renderStoryContent = (interactive: boolean) => (
    <div
      translate="no"
      style={{
        width: `${fmt.width}px`,
        height: `${fmt.height}px`,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#1a1a2e",
      }}
    >
      {/* Foto de fundo */}
      <div
        onMouseDown={interactive ? handleMouseDown : undefined}
        style={{
          position: "absolute",
          inset: 0,
          cursor: interactive ? "move" : undefined,
        }}
      >
        {backgroundImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: `${imageSettings.scale * 100}%`,
              backgroundPosition: `${50 + imageSettings.positionX}% ${50 + imageSettings.positionY}%`,
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
            }}
          />
        )}
        {interactive && backgroundImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: isDragging ? "4px solid #3b82f6" : "2px dashed rgba(255,255,255,0.3)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Gradiente escuro embaixo */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${fmt.gradientHeight}px`,
          background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.75) 25%, transparent 100%)",
          opacity: gradientIntensity / 100,
          pointerEvents: "none",
        }}
      />

      {/* Story: máscara 9:16 original. Post: logo avulsa no topo-direita
          (a máscara tem véu branco que corta feio no frame 4:5). */}
      {format === "story" ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${fmt.width}px`,
            height: `${fmt.height - 40}px`,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <img
            src={maskImage}
            alt="Mask"
            crossOrigin="anonymous"
            style={{
              width: `${fmt.width}px`,
              height: `${fmt.height}px`,
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        </div>
      ) : (
        <img
          src={logoPost.src}
          alt="Logo"
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            top: "80px",
            right: "70px",
            width: "340px",
            height: "auto",
            pointerEvents: "none",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
          }}
        />
      )}

      {/* Tarjinha do rodapé na cor do preset (medidas da original, escaladas por formato) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: `${Math.round((fmt.width - 622 * maskScale) / 2)}px`,
          width: `${Math.round(622 * maskScale)}px`,
          height: `${Math.round(26 * maskScale)}px`,
          borderRadius: `${Math.round(13 * maskScale)}px ${Math.round(13 * maskScale)}px 0 0`,
          backgroundColor: colorPreset.cor,
          pointerEvents: "none",
        }}
      />

      {/* Bloco da manchete — barra + texto + tarja, alinhamento travado */}
      <div
        style={{
          position: "absolute",
          bottom: `${fmt.textBottom}px`,
          left: "90px",
          right: "90px",
          pointerEvents: "none",
        }}
      >
        {manchete && (
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <div
              style={{
                width: "14px",
                flexShrink: 0,
                backgroundColor: colorPreset.cor,
              }}
            />
            <div
              style={{
                fontFamily: "'Aspekta', Arial, sans-serif",
                fontWeight: 800,
                fontSize: `${fontSize}px`,
                lineHeight: "1.15",
                color: "#ffffff",
                textAlign: "left",
                paddingLeft: "36px",
                textShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
                minWidth: 0,
                flex: 1,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {manchete}
            </div>
          </div>
        )}

        {secretaria && (
          <div style={{ marginTop: "48px", paddingLeft: "50px" }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: colorPreset.cor,
                color: colorPreset.textoTarja,
                fontFamily: "'Aspekta', Arial, sans-serif",
                fontWeight: 800,
                fontSize: "30px",
                letterSpacing: "1px",
                // altura fixa + line-height igual (sem padding vertical):
                // html2canvas desloca o texto pra cima quando há padding em inline-block
                height: "72px",
                lineHeight: "72px",
                padding: "0 48px",
              }}
            >
              {/* html2canvas desenha o texto ~14px abaixo do navegador (métrica de
                  baseline); o span interno compensa só no render de export */}
              <span style={{ position: "relative", top: interactive ? "0" : "-14px" }}>
                {secretaria}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Elemento de captura oculto */}
      <div
        ref={captureRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          display: "none",
          width: `${fmt.width}px`,
          height: `${fmt.height}px`,
          overflow: "hidden",
        }}
      >
        {renderStoryContent(false)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
          {/* Seletor de formato */}
          <div>
            <Label className="text-foreground mb-3 block">Formato</Label>
            <div className="flex gap-2">
              {(Object.keys(FORMATS) as FormatType[]).map((key) => (
                <Button
                  key={key}
                  variant={format === key ? "default" : "outline"}
                  onClick={() => setFormat(key)}
                  className="flex-1"
                >
                  {FORMATS[key].label}
                </Button>
              ))}
            </div>
          </div>

          {/* Upload de imagem */}
          <div className="space-y-2">
            <Label className="text-foreground">Imagem de Fundo</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {backgroundImage ? (
              <div className="space-y-2">
                <div className="relative h-20 rounded-lg overflow-hidden border border-border">
                  <img
                    src={backgroundImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Trocar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={removeImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Controles de zoom e posição */}
                <div className="bg-secondary/30 p-3 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Slider
                      value={[imageSettings.scale]}
                      onValueChange={(value) => updateImageSetting('scale', value[0])}
                      min={1}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {Math.round(imageSettings.scale * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoveHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Slider
                      value={[imageSettings.positionX]}
                      onValueChange={(value) => updateImageSetting('positionX', value[0])}
                      min={-50}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {imageSettings.positionX > 0 ? '+' : ''}{Math.round(imageSettings.positionX)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoveVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Slider
                      value={[imageSettings.positionY]}
                      onValueChange={(value) => updateImageSetting('positionY', value[0])}
                      min={-50}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {imageSettings.positionY > 0 ? '+' : ''}{Math.round(imageSettings.positionY)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-16 border-dashed"
              >
                <Upload className="mr-2 h-5 w-5" />
                Carregue aqui sua foto
              </Button>
            )}
          </div>

          {/* Seleção de logo: post usa logos avulsas (2 versões) */}
          {format === "post" && (
            <div className="space-y-4">
              <Label className="text-foreground block">Logo (escolha a versão)</Label>
              <div className="grid grid-cols-2 gap-4">
                {LOGOS_POST.map((logo) => (
                  <div
                    key={logo.nome}
                    onClick={() => setLogoPost(logo)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 border-2 group p-4 flex flex-col items-center gap-2 ${
                      logoPost.nome === logo.nome
                        ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                        : "border-border/50 hover:border-primary/50 hover:scale-[1.02]"
                    }`}
                    style={{
                      backgroundColor: "#1a1a2e",
                      backgroundImage: 'radial-gradient(#2a2a3e 1px, transparent 1px)',
                      backgroundSize: '10px 10px'
                    }}
                  >
                    <img
                      src={logo.src}
                      alt={`Logo ${logo.nome}`}
                      className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xs text-white/70">{logo.nome}</span>
                    <div className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-300 shadow-lg ${
                      logoPost.nome === logo.nome
                        ? "bg-primary text-primary-foreground opacity-100 scale-100"
                        : "bg-background/50 text-muted-foreground opacity-0 scale-75 group-hover:opacity-100"
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de máscara (logo padronizada) — só no story */}
          {format === "story" && (
          <div className="space-y-4">
            <Label className="text-foreground block">Logo (escolha a versão)</Label>
            <div className="grid grid-cols-3 gap-4">
              {MASKS.map((mask, index) => (
                <div
                  key={index}
                  onClick={() => setMaskImage(mask)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 aspect-[9/16] border-2 group ${
                    maskImage === mask
                      ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                      : "border-border/50 hover:border-primary/50 hover:scale-[1.02]"
                  }`}
                  style={{
                    backgroundColor: "#1a1a2e",
                    backgroundImage: 'radial-gradient(#2a2a3e 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                  }}
                >
                  <img
                    src={mask}
                    alt={`Logo ${index + 1}`}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-300 shadow-lg ${
                    maskImage === mask
                      ? "bg-primary text-primary-foreground opacity-100 scale-100"
                      : "bg-background/50 text-muted-foreground opacity-0 scale-75 group-hover:opacity-100"
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Presets de cor (barra + tarja) */}
          <div className="space-y-3">
            <Label className="text-foreground block">Cor de Destaque</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.nome}
                  type="button"
                  onClick={() => setColorPreset(preset)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                    colorPreset.nome === preset.nome
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-full border border-border/30"
                    style={{ backgroundColor: preset.cor }}
                  />
                  <span className="text-xs text-muted-foreground">{preset.nome}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensidade do gradiente */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Intensidade do Fundo Escuro</Label>
              <span className="text-sm text-muted-foreground">{gradientIntensity}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Claro</span>
              <Slider
                value={[gradientIntensity]}
                onValueChange={(value) => setGradientIntensity(value[0])}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">Forte</span>
            </div>
          </div>

          <div>
            <Label htmlFor="noticia-secretaria" className="text-foreground">
              Secretaria (tarja colorida)
            </Label>
            <Input
              id="noticia-secretaria"
              value={secretaria}
              onChange={(e) => setSecretaria(e.target.value.toUpperCase())}
              placeholder="Ex: SAÚDE"
              maxLength={40}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="noticia-manchete" className="text-foreground">
                Manchete
              </Label>
              <span className="text-xs text-muted-foreground">
                {manchete.length} caracteres
              </span>
            </div>
            <Textarea
              id="noticia-manchete"
              value={manchete}
              onChange={(e) => setManchete(e.target.value)}
              placeholder="Digite a manchete da notícia..."
              className="mt-2 min-h-[120px]"
            />
          </div>

          {/* Tamanho da fonte: automático pelo texto, com ajuste manual em paralelo */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-foreground">Tamanho da Fonte</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{fontSize}px</span>
                {fontSizeOverride !== null ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setFontSizeOverride(null)}
                  >
                    Voltar pro automático
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">(automático)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Menor</span>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSizeOverride(value[0])}
                min={26}
                max={72}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">Maior</span>
            </div>
          </div>

          <Button
            onClick={generateImage}
            disabled={isGenerating || !backgroundImage || !manchete}
            className="w-full h-12 text-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            {isGenerating ? "Gerando..." : `Gerar Imagem PNG (${fmt.width}x${fmt.height})`}
          </Button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-4">
            Preview (clique e arraste para posicionar)
          </p>

          <div
            className="relative overflow-hidden rounded-lg shadow-lg cursor-crosshair"
            style={{
              width: `${fmt.width * 0.3}px`,
              height: `${fmt.height * 0.3}px`,
            }}
          >
            <div
              style={{
                transform: "scale(0.3)",
                transformOrigin: "top left",
              }}
            >
              {renderStoryContent(true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesNoticia;
