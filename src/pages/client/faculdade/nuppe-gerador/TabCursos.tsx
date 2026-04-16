import { useState, useRef } from "react";
import { todosCursos, type PecaFormato, type CursoData } from "./gerador-data";
import PecaCursoCanvas from "./PecaCursoCanvas";
import { exportPecaPng } from "./useExport";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const formatos: PecaFormato[] = ["1080x1080", "1080x1440", "1080x1920"];

export default function TabCursos() {
  const [cursoIdx, setCursoIdx] = useState(0);
  const [formato, setFormato] = useState<PecaFormato>("1080x1080");
  const [bgImages, setBgImages] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const curso = todosCursos[cursoIdx];
  const cursoOverrides = overrides[curso.id] || {};

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBgImages((prev) => ({ ...prev, [curso.id]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    toast({ title: "Exportando..." });
    await exportPecaPng(canvasRef.current, `${curso.id}-${formato}`);
    toast({ title: "Pronto!" });
  };

  const handleOverride = (key: string, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [curso.id]: { ...(prev[curso.id] || {}), [key]: value },
    }));
  };

  const previewScale = formato === "1080x1080" ? 0.58 : formato === "1080x1440" ? 0.5 : 0.42;
  const posGrad = todosCursos.filter((c) => c.categoria === "pos-graduacao");
  const livres = todosCursos.filter((c) => c.categoria === "curso-livre");

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 space-y-4 overflow-y-auto max-h-[80vh]">
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">Pós-Graduação</h3>
          {posGrad.map((c) => {
            const idx = todosCursos.indexOf(c);
            return (
              <button
                key={c.id}
                onClick={() => setCursoIdx(idx)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all ${
                  cursoIdx === idx
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {c.nome}
              </button>
            );
          })}
        </div>

        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">Cursos Livres</h3>
          {livres.map((c) => {
            const idx = todosCursos.indexOf(c);
            return (
              <button
                key={c.id}
                onClick={() => setCursoIdx(idx)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-all ${
                  cursoIdx === idx
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {c.nome}
              </button>
            );
          })}
        </div>

        {/* Format */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">Formato</h3>
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

        {/* Bg Upload */}
        <div className="glass-card rounded-lg p-4 space-y-2">
          <h3 className="font-display text-xs font-bold tracking-wider text-primary uppercase">Imagem de Fundo</h3>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
            <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
          </label>
          {bgImages[curso.id] && (
            <button
              onClick={() => setBgImages((prev) => { const n = { ...prev }; delete n[curso.id]; return n; })}
              className="text-xs text-destructive hover:underline"
            >
              Remover fundo
            </button>
          )}
        </div>

        <Button onClick={handleExport} className="w-full btn-nuppe text-xs" size="sm">
          <Download className="w-3.5 h-3.5 mr-2" />
          Baixar Peça
        </Button>
      </div>

      {/* Preview + Editor */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="glass-card rounded-lg p-3 lg:p-5 flex items-center justify-center overflow-auto" style={{ minHeight: 760 }}>
          <PecaCursoCanvas
            ref={canvasRef}
            curso={curso}
            formato={formato}
            scale={previewScale}
            bgImage={bgImages[curso.id]}
            textoOverrides={cursoOverrides}
          />
        </div>

        <div className="glass-card rounded-lg p-4 space-y-3">
          <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">Editar Textos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "nome", label: "Nome do Curso", val: cursoOverrides.nome || curso.nome },
              { key: "valor", label: "Valor", val: cursoOverrides.valor || curso.valor },
            ].map(({ key, label, val }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-display font-semibold mb-1 block">{label}</label>
                <input
                  value={val}
                  onChange={(e) => handleOverride(key, e.target.value)}
                  className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
