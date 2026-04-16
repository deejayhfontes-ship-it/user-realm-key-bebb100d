import { useState, useRef, useCallback } from "react";
import { campanhas, type PecaFormato, type PecaData, type PecaTom } from "@/data/gerador-data";
import PecaCanvas from "./PecaCanvas";
import { exportPecaPng, exportMultiplePng } from "./useExport";
import { Download, Upload, Copy, RefreshCw, ZoomIn, ZoomOut, Replace, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

const formatos: PecaFormato[] = ["1080x1080", "1080x1440", "1080x1920"];
const tons: { value: PecaTom; label: string }[] = [
  { value: "institucional", label: "Institucional" },
  { value: "comercial", label: "Comercial" },
  { value: "jovem", label: "Jovem" },
  { value: "informativo", label: "Informativo" },
];

export default function TabCampanhas() {
  const [campIdx, setCampIdx] = useState(0);
  const [pecaIdx, setPecaIdx] = useState(0);
  const [formato, setFormato] = useState<PecaFormato>("1080x1080");
  const [editedPecas, setEditedPecas] = useState<Record<string, PecaData>>({});
  const [bgImages, setBgImages] = useState<Record<string, string>>({});
  const [bgZooms, setBgZooms] = useState<Record<string, number>>({});
  const [bgPositions, setBgPositions] = useState<Record<string, { x: number; y: number }>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const campanha = campanhas[campIdx];
  const originalPeca = campanha.pecas[pecaIdx];
  const peca: PecaData = editedPecas[originalPeca.id] || originalPeca;
  const bgZoom = bgZooms[peca.id] ?? 100;
  const bgPos = bgPositions[peca.id] ?? { x: 0, y: 0 };
  const pecaWithBg = { ...peca, bgImage: bgImages[peca.id] || peca.bgImage, bgZoom, bgPosX: bgPos.x, bgPosY: bgPos.y };

  const handleTextEdit = useCallback(
    (key: string, value: string) => {
      setEditedPecas((prev) => ({
        ...prev,
        [peca.id]: {
          ...peca,
          textos: { ...peca.textos, [key]: value },
        },
      }));
    },
    [peca]
  );

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImages((prev) => ({ ...prev, [peca.id]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleTomChange = (tom: PecaTom) => {
    setEditedPecas((prev) => ({
      ...prev,
      [peca.id]: { ...peca, tom },
    }));
  };

  const handleExportPeca = async () => {
    if (!canvasRef.current) return;
    toast({ title: "Exportando...", description: "Gerando PNG de alta qualidade" });
    await exportPecaPng(canvasRef.current, `${peca.id}-${formato}`);
    toast({ title: "Pronto!", description: "Peça exportada com sucesso" });
  };

  const previewScale = formato === "1080x1080" ? 0.55 : formato === "1080x1440" ? 0.45 : 0.38;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Campaign selector */}
        <div className="glass-card rounded-lg p-4 space-y-3">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Campanha</h3>
          {campanhas.map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setCampIdx(i); setPecaIdx(0); }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-all ${
                campIdx === i
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {/* Pieces */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Peças</h3>
          {campanha.pecas.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPecaIdx(i)}
              className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all ${
                pecaIdx === i
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {p.nome.split(" — ")[1] || p.nome}
            </button>
          ))}
        </div>

        {/* Format */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Formato</h3>
          <div className="flex gap-2">
            {formatos.map((f) => (
              <button
                key={f}
                onClick={() => setFormato(f)}
                className={`flex-1 py-2 rounded text-xs font-bold font-display tracking-wider transition-all ${
                  formato === f
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted/50 border border-transparent"
                }`}
              >
                {f.replace("1080x", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Tom */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Tom</h3>
          <div className="grid grid-cols-2 gap-2">
            {tons.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTomChange(t.value)}
                className={`py-1.5 rounded text-xs font-medium transition-all ${
                  peca.tom === t.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted/50 border border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bg Upload + Zoom */}
        <div className="glass-card rounded-lg p-4 space-y-3">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Imagem de Fundo</h3>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload de imagem</span>
            <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
          </label>

          {/* Zoom control */}
          {(bgImages[peca.id] || peca.bgImage) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Zoom</span>
                <span className="text-xs text-muted-foreground font-mono">{bgZoom}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Slider
                  value={[bgZoom]}
                  onValueChange={([v]) => setBgZooms((prev) => ({ ...prev, [peca.id]: v }))}
                  min={50}
                  max={300}
                  step={5}
                  className="flex-1"
                />
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </div>
            </div>
          )}

          {/* Position controls */}
          {(bgImages[peca.id] || peca.bgImage) && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Posição</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Horizontal</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{bgPos.x}%</span>
                </div>
                <Slider
                  value={[bgPos.x]}
                  onValueChange={([v]) => setBgPositions((prev) => ({ ...prev, [peca.id]: { ...bgPos, x: v } }))}
                  min={-50}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Vertical</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{bgPos.y}%</span>
                </div>
                <Slider
                  value={[bgPos.y]}
                  onValueChange={([v]) => setBgPositions((prev) => ({ ...prev, [peca.id]: { ...bgPos, y: v } }))}
                  min={-50}
                  max={50}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Replace / Remove */}
          {(bgImages[peca.id] || peca.bgImage) && (
            <div className="flex gap-2">
              <button
                onClick={() => replaceInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Replace className="w-3.5 h-3.5" />
                Substituir
              </button>
              <input ref={replaceInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
              <button
                onClick={() => {
                  setBgImages((prev) => { const n = { ...prev }; delete n[peca.id]; return n; });
                  setBgZooms((prev) => { const n = { ...prev }; delete n[peca.id]; return n; });
                  setBgPositions((prev) => { const n = { ...prev }; delete n[peca.id]; return n; });
                }}
                className="text-xs text-destructive hover:underline"
              >
                Remover
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button onClick={handleExportPeca} className="w-full btn-nuppe text-xs" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" />
            Baixar Peça
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs border-border text-muted-foreground hover:text-foreground"
            size="sm"
            onClick={() => toast({ title: "Em breve", description: "Funcionalidade de duplicar em desenvolvimento" })}
          >
            <Copy className="w-3.5 h-3.5 mr-2" />
            Duplicar Peça
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs border-border text-muted-foreground hover:text-foreground"
            size="sm"
            onClick={() => toast({ title: "Em breve", description: "Geração de variações em desenvolvimento" })}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Gerar Variações
          </Button>
        </div>
      </div>

      {/* Preview + Editor */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Canvas Preview */}
        <div className="glass-card rounded-lg p-6 flex items-start justify-center overflow-auto" style={{ minHeight: 420 }}>
          <PecaCanvas ref={canvasRef} peca={pecaWithBg} formato={formato} scale={previewScale} />
        </div>

        {/* Text editor */}
        <div className="glass-card rounded-lg p-4 space-y-3">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Editar Textos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(peca.textos).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-display font-semibold mb-1 block">
                  {key}
                </label>
                {value.includes("\n") ? (
                  <textarea
                    value={value}
                    onChange={(e) => handleTextEdit(key, e.target.value)}
                    className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                    rows={3}
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(e) => handleTextEdit(key, e.target.value)}
                    className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
