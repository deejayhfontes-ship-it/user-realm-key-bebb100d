import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Download,
  Image,
  MoveHorizontal,
  MoveVertical,
  Pause,
  Play,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import {
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  VideoConfig,
  VideoImageSettings,
  LoadedAssets,
  MediaElement,
  drawFrame,
  getTotalDuration,
  loadFonts,
  loadImage,
  loadVideo,
} from "@/lib/prefeitura/videoTimeline";
import { exportVideo, pickSupportedMimeType } from "@/hooks/useCanvasVideoExport";

const CUSTOM_MASKS = [
  "/prefeitura-assets/mascaras/CAPA PARA INSTA - MASK LOGO color.png",
  "/prefeitura-assets/mascaras/02 CAPA PARA INSTA - MASK LOGO color.png",
  "/prefeitura-assets/mascaras/03 CAPA PARA INSTA - MASK LOGO color.png",
];
const defaultMask = CUSTOM_MASKS[1];

type PhotoCount = 1 | 2 | 3;

interface MediaItem {
  src: string; // dataURI (foto) ou objectURL (vídeo)
  isVideo: boolean;
}

const defaultImageSettings: VideoImageSettings = {
  scale: 1,
  positionX: 0,
  positionY: 0,
};

// Mesma regra do gerador de stories
const calculateFontSize = (text: string): number => {
  const length = text.length;
  if (length <= 100) return 55;
  if (length <= 150) return 52;
  if (length <= 200) return 50;
  if (length <= 300) return 48;
  return 45;
};

const GeradorVideo = () => {
  const { user } = useAuth();
  const [photoCount, setPhotoCount] = useState<PhotoCount>(1);
  const [backgroundMedia, setBackgroundMedia] = useState<(MediaItem | null)[]>([null, null, null]);
  const [imageSettings, setImageSettings] = useState<VideoImageSettings[]>([
    { ...defaultImageSettings },
    { ...defaultImageSettings },
    { ...defaultImageSettings },
  ]);
  const [secretaria, setSecretaria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [maskSrc, setMaskSrc] = useState(defaultMask);
  const [gradientIntensity, setGradientIntensity] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const assetsRef = useRef<LoadedAssets | null>(null);
  const configRef = useRef<VideoConfig | null>(null);
  const playStartRef = useRef(0);
  const previewTimeRef = useRef(0);
  const rafRef = useRef(0);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const fontSize = calculateFontSize(descricao);
  const totalDuration = getTotalDuration(photoCount);

  // Config sempre atual para o loop de desenho
  configRef.current = {
    photoCount,
    imageSettings,
    secretaria,
    descricao,
    formattedDate,
    gradientIntensity,
    fontSize,
  };

  const hasRequiredImages = useCallback(() => {
    for (let i = 0; i < photoCount; i++) {
      if (!backgroundMedia[i]) return false;
    }
    return true;
  }, [photoCount, backgroundMedia]);

  // Sincroniza os vídeos de fundo com o estado do preview
  const setVideosPlaying = useCallback((playing: boolean) => {
    const assets = assetsRef.current;
    if (!assets) return;
    for (const el of assets.media) {
      if (el instanceof HTMLVideoElement) {
        if (playing) el.play().catch(() => undefined);
        else el.pause();
      }
    }
  }, []);

  const drawPreviewFrame = useCallback((tMs: number) => {
    const canvas = previewCanvasRef.current;
    const assets = assetsRef.current;
    const config = configRef.current;
    if (!canvas || !assets || !config) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, assets, config, tMs);
  }, []);

  // Carrega mídias (foto/vídeo) + máscara + fontes sempre que mudarem
  useEffect(() => {
    let cancelled = false;
    const items = backgroundMedia.slice(0, photoCount).filter(Boolean) as MediaItem[];
    if (items.length < photoCount) {
      assetsRef.current = null;
      const canvas = previewCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      }
      return;
    }
    (async () => {
      try {
        await loadFonts();
        const [mask, ...media] = await Promise.all([
          loadImage(maskSrc),
          ...items.map((item): Promise<MediaElement> =>
            item.isVideo ? loadVideo(item.src) : loadImage(item.src)
          ),
        ]);
        if (cancelled) return;
        assetsRef.current = { media, mask };
        drawPreviewFrame(previewTimeRef.current);
      } catch (error) {
        console.error("Erro ao carregar mídias do vídeo:", error);
        if (!cancelled) toast.error("Erro ao carregar as mídias");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backgroundMedia, photoCount, maskSrc, drawPreviewFrame]);

  // Redesenha o frame pausado quando texto/sliders mudam
  useEffect(() => {
    if (!isPlaying) drawPreviewFrame(previewTimeRef.current);
  }, [
    isPlaying,
    secretaria,
    descricao,
    gradientIntensity,
    imageSettings,
    photoCount,
    drawPreviewFrame,
  ]);

  // Loop de reprodução do preview
  useEffect(() => {
    if (!isPlaying) {
      setVideosPlaying(false);
      return;
    }
    setVideosPlaying(true);
    playStartRef.current = performance.now() - previewTimeRef.current;
    const loop = () => {
      let t = performance.now() - playStartRef.current;
      if (t >= totalDuration) {
        // Loop contínuo do preview
        playStartRef.current = performance.now();
        t = 0;
      }
      previewTimeRef.current = t;
      setPreviewTime(t);
      drawPreviewFrame(t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, totalDuration, drawPreviewFrame, setVideosPlaying]);

  const seekPreview = (tMs: number) => {
    previewTimeRef.current = tMs;
    setPreviewTime(tMs);
    playStartRef.current = performance.now() - tMs;
    // Vídeos acompanham o scrub
    const assets = assetsRef.current;
    if (assets) {
      const segMs = totalDuration / photoCount;
      assets.media.forEach((el, i) => {
        if (el instanceof HTMLVideoElement && el.duration) {
          const local = Math.max(0, (tMs - i * segMs) / 1000);
          el.currentTime = local % el.duration;
        }
      });
    }
    if (!isPlaying) drawPreviewFrame(tMs);
  };

  const handleImageUpload = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      // Vídeo: objectURL (dataURI de vídeo estoura memória). Nada sobe pra servidor.
      const item: MediaItem = { src: URL.createObjectURL(file), isVideo: true };
      setBackgroundMedia((prev) => {
        const next = [...prev];
        if (next[index]?.isVideo) URL.revokeObjectURL(next[index]!.src);
        next[index] = item;
        return next;
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundMedia((prev) => {
          const next = [...prev];
          if (next[index]?.isVideo) URL.revokeObjectURL(next[index]!.src);
          next[index] = { src: e.target?.result as string, isVideo: false };
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setBackgroundMedia((prev) => {
      const next = [...prev];
      if (next[index]?.isVideo) URL.revokeObjectURL(next[index]!.src);
      next[index] = null;
      return next;
    });
    const newSettings = [...imageSettings];
    newSettings[index] = { ...defaultImageSettings };
    setImageSettings(newSettings);
  };

  const updateImageSetting = (index: number, key: keyof VideoImageSettings, value: number) => {
    setImageSettings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handlePhotoCountChange = (count: PhotoCount) => {
    setPhotoCount(count);
    if (count < photoCount) {
      const newSettings = [...imageSettings];
      setBackgroundMedia((prev) => {
        const next = [...prev];
        for (let i = count; i < 3; i++) {
          if (next[i]?.isVideo) URL.revokeObjectURL(next[i]!.src);
          next[i] = null;
        }
        return next;
      });
      for (let i = count; i < 3; i++) {
        newSettings[i] = { ...defaultImageSettings };
      }
      setImageSettings(newSettings);
    }
    previewTimeRef.current = 0;
    setPreviewTime(0);
  };

  // Arrastar no preview reposiciona a foto do segmento visível (com preview pausado)
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (isPlaying || !hasRequiredImages()) return;
    e.preventDefault();
    const segMs = totalDuration / photoCount;
    const index = Math.min(photoCount - 1, Math.floor(previewTimeRef.current / segMs));
    setDraggingIndex(index);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = imageSettings[index].positionX;
    const startPosY = imageSettings[index].positionY;

    const handleMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const scaleFactor = 0.5;
      const newX = Math.max(-50, Math.min(50, startPosX + (moveEvent.clientX - startX) * scaleFactor));
      const newY = Math.max(-50, Math.min(50, startPosY + (moveEvent.clientY - startY) * scaleFactor));
      updateImageSetting(index, "positionX", newX);
      updateImageSetting(index, "positionY", newY);
    };

    const handleUp = () => {
      setDraggingIndex(null);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const generateVideo = async () => {
    const assets = assetsRef.current;
    const config = configRef.current;
    if (!assets || !config) return;

    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    // Canvas de exportação em resolução cheia, fora da tela (nunca display:none)
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = VIDEO_WIDTH;
    exportCanvas.height = VIDEO_HEIGHT;
    exportCanvas.style.position = "fixed";
    exportCanvas.style.left = "-9999px";
    exportCanvas.style.top = "0";
    document.body.appendChild(exportCanvas);
    const ctx = exportCanvas.getContext("2d");

    try {
      if (!ctx) throw new Error("Canvas 2D indisponível");
      await loadFonts();

      // Vídeos de fundo tocam do início durante a gravação (tempo real)
      for (const el of assets.media) {
        if (el instanceof HTMLVideoElement) {
          el.currentTime = 0;
          await el.play().catch(() => undefined);
        }
      }

      const result = await exportVideo({
        canvas: exportCanvas,
        durationMs: totalDuration,
        draw: (tMs) => drawFrame(ctx, assets, config, tMs),
        onProgress: setExportProgress,
      });

      setVideosPlaying(false);

      const filename = `videoprefeitura_${String(Date.now()).slice(-4)}.${result.extension}`;
      saveAs(result.blob, filename);

      if (result.extension === "webm") {
        toast.info(
          "Vídeo gerado em WebM. Para MP4 (Instagram/WhatsApp), use Chrome ou Safari atualizados."
        );
      } else {
        toast.success("Vídeo MP4 gerado com sucesso!");
      }
      // Sem backup remoto: nada é enviado a servidor nenhum (Supabase/HostGator)
    } catch (error) {
      console.error("Erro ao gerar vídeo:", error);
      toast.error("Erro ao gerar o vídeo");
    } finally {
      exportCanvas.remove();
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const mimeInfo = pickSupportedMimeType();
  const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {user && (
            <Link to="/prefeitura">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Gerador de Vídeos - Prefeitura
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
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
              <p className="text-xs text-muted-foreground mt-2">
                Duração do vídeo: {formatTime(totalDuration)} — fotos ganham zoom suave; vídeos
                tocam direto (sem áudio). Tudo passa em sequência com transição.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-foreground">
                {photoCount === 1 ? "Foto ou Vídeo de Fundo" : `Fotos ou Vídeos de Fundo (${photoCount})`}
              </Label>

              {Array.from({ length: photoCount }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    onChange={handleImageUpload(index)}
                    accept="image/*,video/*"
                    className="hidden"
                  />

                  {backgroundMedia[index] ? (
                    <div className="space-y-2">
                      <div className="relative h-20 rounded-lg overflow-hidden border border-border">
                        {backgroundMedia[index]!.isVideo ? (
                          <video
                            src={backgroundMedia[index]!.src}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={backgroundMedia[index]!.src}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
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
                          {backgroundMedia[index]!.isVideo ? "Vídeo" : "Foto"} {index + 1}
                        </span>
                      </div>

                      <div className="bg-secondary/30 p-3 rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                          <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Slider
                            value={[imageSettings[index].scale]}
                            onValueChange={(value) => updateImageSetting(index, "scale", value[0])}
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
                            onValueChange={(value) => updateImageSetting(index, "positionX", value[0])}
                            min={-50}
                            max={50}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {imageSettings[index].positionX > 0 ? "+" : ""}
                            {Math.round(imageSettings[index].positionX)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MoveVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Slider
                            value={[imageSettings[index].positionY]}
                            onValueChange={(value) => updateImageSetting(index, "positionY", value[0])}
                            min={-50}
                            max={50}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {imageSettings[index].positionY > 0 ? "+" : ""}
                            {Math.round(imageSettings[index].positionY)}
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
                      Carregar Foto/Vídeo {index + 1}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Máscara oficial */}
            <div className="space-y-4">
              <Label className="text-foreground block">Máscara Oficial</Label>
              <div className="grid grid-cols-3 gap-4">
                {CUSTOM_MASKS.map((mask, index) => (
                  <div
                    key={index}
                    onClick={() => setMaskSrc(mask)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 aspect-[9/16] border-2 group ${
                      maskSrc === mask
                        ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                        : "border-border/50 hover:border-primary/50 hover:scale-[1.02]"
                    }`}
                    style={{
                      backgroundColor: "#1a1a2e",
                      backgroundImage: "radial-gradient(#2a2a3e 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }}
                  >
                    <img
                      src={mask}
                      alt={`Máscara ${index + 1}`}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div
                      className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-300 shadow-lg ${
                        maskSrc === mask
                          ? "bg-primary text-primary-foreground opacity-100 scale-100"
                          : "bg-background/50 text-muted-foreground opacity-0 scale-75 group-hover:opacity-100"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Intensidade do Fundo Azul</Label>
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
                Manchete Principal
              </Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Digite a manchete do vídeo..."
                className="mt-2 min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tamanho da fonte: {fontSize}px — a manchete entra com animação no início do vídeo
              </p>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg">
              <Label className="text-foreground">Data</Label>
              <p className="text-lg font-medium text-foreground mt-1">{formattedDate}</p>
            </div>

            <Button
              onClick={generateVideo}
              disabled={isExporting || !hasRequiredImages()}
              className="w-full h-12 text-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {isExporting
                ? `Gravando vídeo... ${Math.round(exportProgress * 100)}%`
                : `Gerar Vídeo ${mimeInfo?.extension === "mp4" ? "MP4" : "WebM"} (1080x1920)`}
            </Button>
            {isExporting && (
              <p className="text-xs text-muted-foreground text-center">
                A gravação leva {formatTime(totalDuration)} (tempo real). Não troque de aba durante
                a gravação.
              </p>
            )}
            {mimeInfo?.extension === "webm" && !isExporting && (
              <p className="text-xs text-muted-foreground text-center">
                Este navegador exporta em WebM. Para MP4 (Instagram/WhatsApp), use Chrome ou Safari.
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-4">
              Preview do vídeo {!isPlaying && "(pause e arraste para posicionar a foto)"}
            </p>

            <div
              className="relative overflow-hidden rounded-lg shadow-lg"
              style={{ width: "324px", height: "576px" }}
            >
              <canvas
                ref={previewCanvasRef}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                onMouseDown={handlePreviewMouseDown}
                style={{
                  width: "324px",
                  height: "576px",
                  cursor: isPlaying ? "default" : "move",
                  backgroundColor: "#1a1a2e",
                }}
              />
              {draggingIndex !== null && (
                <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none rounded-lg" />
              )}
            </div>

            <div className="flex items-center gap-3 mt-4 w-full max-w-[324px]">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPlaying((p) => !p)}
                disabled={!hasRequiredImages() || isExporting}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Slider
                value={[previewTime]}
                onValueChange={(value) => seekPreview(value[0])}
                min={0}
                max={totalDuration}
                step={50}
                className="flex-1"
                disabled={!hasRequiredImages() || isExporting}
              />
              <span className="text-xs text-muted-foreground w-14 text-right">
                {formatTime(previewTime)} / {formatTime(totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeradorVideo;
