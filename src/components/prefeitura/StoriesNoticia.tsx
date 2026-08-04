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
  // Paleta oficial do design system da prefeitura (brand-kit-data.ts + config das secretarias)
  { nome: "Azul Prefeitura", cor: "#004691", textoTarja: "#ffffff" },
  { nome: "Verde Institucional", cor: "#2D7D46", textoTarja: "#ffffff" },
  { nome: "Verde Saúde", cor: "#00995D", textoTarja: "#ffffff" },
  { nome: "Azul Educação", cor: "#005EB8", textoTarja: "#ffffff" },
  { nome: "Roxo Cultura", cor: "#9C27B0", textoTarja: "#ffffff" },
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

type PhotoCount = 1 | 2 | 3;

const StoriesNoticia = () => {
  const [format, setFormat] = useState<FormatType>("story");
  const [photoCount, setPhotoCount] = useState<PhotoCount>(1);
  const [backgroundImages, setBackgroundImages] = useState<(string | null)[]>([null, null, null]);
  const [imageSettings, setImageSettings] = useState<ImageSettings[]>([
    { ...defaultImageSettings },
    { ...defaultImageSettings },
    { ...defaultImageSettings },
  ]);
  const [secretaria, setSecretaria] = useState("");
  const [manchete, setManchete] = useState("");
  const [colorPreset, setColorPreset] = useState<ColorPreset>(COLOR_PRESETS[0]);
  const [maskImage, setMaskImage] = useState<string>(MASKS[0]);
  const [logoPost, setLogoPost] = useState<typeof LOGOS_POST[number]>(LOGOS_POST[0]);
  const [gradientIntensity, setGradientIntensity] = useState<number>(100);
  const [fontSizeOverride, setFontSizeOverride] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  // Data automática formatada (igual ao gerador de stories original)
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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

  const handleImageUpload = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImages((prev) => {
          const next = [...prev];
          next[index] = e.target?.result as string;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setBackgroundImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setImageSettings((prev) => {
      const next = [...prev];
      next[index] = { ...defaultImageSettings };
      return next;
    });
  };

  const updateImageSetting = (index: number, key: keyof ImageSettings, value: number) => {
    setImageSettings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handlePhotoCountChange = (count: PhotoCount) => {
    setPhotoCount(count);
    // limpa fotos extras se diminuir
    if (count < photoCount) {
      setBackgroundImages((prev) => prev.map((img, i) => (i < count ? img : null)));
      setImageSettings((prev) => prev.map((s, i) => (i < count ? s : { ...defaultImageSettings })));
    }
  };

  const hasRequiredImages = () => {
    for (let i = 0; i < photoCount; i++) {
      if (!backgroundImages[i]) return false;
    }
    return true;
  };

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(index);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = imageSettings[index].positionX;
    const startPosY = imageSettings[index].positionY;

    const handleMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const scaleFactor = 0.5;
      const deltaX = (moveEvent.clientX - startX) * scaleFactor;
      const deltaY = (moveEvent.clientY - startY) * scaleFactor;
      const newX = Math.max(-50, Math.min(50, startPosX + deltaX));
      const newY = Math.max(-50, Math.min(50, startPosY + deltaY));
      setImageSettings((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], positionX: newX, positionY: newY };
        return next;
      });
    };

    const handleUp = () => {
      setDraggingIndex(null);
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
      {/* Fotos de fundo empilhadas (1 a 3, cada uma com altura frame/quantidade) */}
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
              onMouseDown={interactive ? handleMouseDown(index) : undefined}
              style={{
                width: "100%",
                height: `${fmt.height / photoCount}px`,
                overflow: "hidden",
                position: "relative",
                cursor: interactive ? "move" : undefined,
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
              {interactive && backgroundImages[index] && (
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

      {/* Story: máscara 9:16 original em altura total, renderizada em 3 janelas de
          recorte que excluem só o retângulo da tarjinha azul original (x227-853,
          últimos 30px) — assim a tarjinha nova pode ser menor sem sobra azul.
          Post: logo avulsa no topo-direita (a máscara corta feio no frame 4:5). */}
      {format === "story" ? (
        <>
          {[
            { left: 0, width: 227, height: fmt.height, imgLeft: 0 },
            { left: 853, width: fmt.width - 853, height: fmt.height, imgLeft: -853 },
            { left: 227, width: 626, height: fmt.height - 30, imgLeft: -227 },
          ].map((win, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: `${win.left}px`,
                width: `${win.width}px`,
                height: `${win.height}px`,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <img
                src={maskImage}
                alt=""
                crossOrigin="anonymous"
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${win.imgLeft}px`,
                  width: `${fmt.width}px`,
                  height: `${fmt.height}px`,
                  // Tailwind aplica max-width:100% em img — dentro da janela estreita
                  // isso encolhia a máscara e bagunçava o alinhamento
                  maxWidth: "none",
                }}
              />
            </div>
          ))}
        </>
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

      {/* Tarjinha do rodapé na cor do preset — largura da original, altura reduzida
          (a azul original da máscara é excluída pelo recorte acima) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: `${Math.round((fmt.width - Math.round(622 * maskScale)) / 2)}px`,
          width: `${Math.round(622 * maskScale)}px`,
          height: `${format === "story" ? 14 : 10}px`,
          borderRadius: format === "story" ? "7px 7px 0 0" : "5px 5px 0 0",
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
                // encurta a barra pra alinhar com o texto (desconta o respiro do
                // line-height acima da primeira letra e abaixo da última linha)
                margin: `${Math.round(fontSize * 0.2)}px 0 ${Math.round(fontSize * 0.12)}px`,
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
              {/* html2canvas desenha o texto ~0.45em abaixo do navegador (baseline);
                  o span interno compensa só no render de export, sem mover a barra */}
              <span
                style={{
                  position: "relative",
                  top: interactive ? "0" : `${-Math.round(fontSize * 0.45)}px`,
                }}
              >
                {manchete}
              </span>
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

      {/* Data e setinha (igual ao gerador de stories original) */}
      <div
        style={{
          position: "absolute",
          bottom: format === "story" ? "150px" : "105px",
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

          {/* Quantidade de fotos */}
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
                  {count} {count === 1 ? "Foto" : "Fotos"}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cada foto ocupa {fmt.width}x{Math.round(fmt.height / photoCount)}px
            </p>
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
                        <Button variant="destructive" size="sm" onClick={() => removeImage(index)}>
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
                    {photoCount === 1 ? "Carregue aqui sua foto" : `Carregue aqui a foto ${index + 1}`}
                  </Button>
                )}
              </div>
            ))}
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
            disabled={isGenerating || !hasRequiredImages() || !manchete}
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
