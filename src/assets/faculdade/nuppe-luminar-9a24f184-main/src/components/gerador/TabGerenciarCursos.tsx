import { useState } from "react";
import { type CursoData, type CursoCategoria } from "@/data/gerador-data";
import { cursosPostGraduacao, cursosLivres } from "@/data/gerador-data";
import { Plus, Pencil, Trash2, Save, X, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const emptycurso = (categoria: CursoCategoria): CursoData => ({
  id: `curso-${Date.now()}`,
  nome: "",
  categoria,
  cargaHoraria: "30 horas",
  duracao: categoria === "pos-graduacao" ? "12 meses" : undefined,
  valor: "",
  valorParcelado: categoria === "curso-livre" ? "4x sem juros" : undefined,
  diferenciais: ["Certificação FASB"],
  matriculas: "",
  inicioAulas: "",
});

export default function TabGerenciarCursos() {
  const [posGrad, setPosGrad] = useState<CursoData[]>([...cursosPostGraduacao]);
  const [livres, setLivres] = useState<CursoData[]>([...cursosLivres]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<CursoData | null>(null);
  const [activeCategory, setActiveCategory] = useState<CursoCategoria>("pos-graduacao");

  const cursos = activeCategory === "pos-graduacao" ? posGrad : livres;
  const setCursos = activeCategory === "pos-graduacao" ? setPosGrad : setLivres;

  const startEdit = (curso: CursoData) => {
    setEditingId(curso.id);
    setEditData({ ...curso, diferenciais: [...curso.diferenciais] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (!editData) return;
    if (!editData.nome.trim()) {
      toast({ title: "Erro", description: "Nome do curso é obrigatório", variant: "destructive" });
      return;
    }
    setCursos((prev) =>
      prev.map((c) => (c.id === editData.id ? editData : c))
    );
    setEditingId(null);
    setEditData(null);
    toast({ title: "Salvo!", description: "Curso atualizado com sucesso" });
  };

  const addCurso = () => {
    const novo = emptycurso(activeCategory);
    setCursos((prev) => [...prev, novo]);
    startEdit(novo);
    toast({ title: "Novo curso", description: "Preencha os dados do curso" });
  };

  const removeCurso = (id: string) => {
    setCursos((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) cancelEdit();
    toast({ title: "Removido", description: "Curso removido com sucesso" });
  };

  const updateField = (key: keyof CursoData, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [key]: value });
  };

  const updateDiferencial = (idx: number, value: string) => {
    if (!editData) return;
    const difs = [...editData.diferenciais];
    difs[idx] = value;
    setEditData({ ...editData, diferenciais: difs });
  };

  const addDiferencial = () => {
    if (!editData) return;
    setEditData({ ...editData, diferenciais: [...editData.diferenciais, ""] });
  };

  const removeDiferencial = (idx: number) => {
    if (!editData) return;
    setEditData({ ...editData, diferenciais: editData.diferenciais.filter((_, i) => i !== idx) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Category Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setActiveCategory("pos-graduacao"); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-bold tracking-wider uppercase transition-all ${
            activeCategory === "pos-graduacao"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Pós-Graduação
          <span className="ml-1 text-xs opacity-60">({posGrad.length})</span>
        </button>
        <button
          onClick={() => { setActiveCategory("curso-livre"); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-bold tracking-wider uppercase transition-all ${
            activeCategory === "curso-livre"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Cursos Livres
          <span className="ml-1 text-xs opacity-60">({livres.length})</span>
        </button>

        <div className="flex-1" />

        <Button onClick={addCurso} className="btn-nuppe text-xs" size="sm">
          <Plus className="w-3.5 h-3.5 mr-2" />
          Adicionar Curso
        </Button>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {cursos.map((curso) => {
          const isEditing = editingId === curso.id;
          const data = isEditing && editData ? editData : curso;

          return (
            <div
              key={curso.id}
              className={`glass-card rounded-lg overflow-hidden transition-all ${
                isEditing ? "ring-1 ring-primary/40" : ""
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      value={data.nome}
                      onChange={(e) => updateField("nome", e.target.value)}
                      placeholder="Nome do curso"
                      className="w-full bg-background/50 border border-border rounded px-3 py-1.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <h4 className="text-sm font-semibold text-foreground truncate">{curso.nome || "Sem nome"}</h4>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={saveEdit} className="h-8 w-8 p-0 text-primary hover:text-primary">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0 text-muted-foreground">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(curso)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeCurso(curso.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Summary chips (collapsed) */}
              {!isEditing && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{curso.cargaHoraria}</span>
                  {curso.duracao && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{curso.duracao}</span>}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{curso.valor || "—"}</span>
                  {curso.valorParcelado && <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{curso.valorParcelado}</span>}
                </div>
              )}

              {/* Edit form (expanded) */}
              {isEditing && editData && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Field label="Valor" value={data.valor} onChange={(v) => updateField("valor", v)} placeholder="Ex: 12x de R$ 420,00" />
                    <Field label="Valor Parcelado" value={data.valorParcelado || ""} onChange={(v) => updateField("valorParcelado" as any, v)} placeholder="Ex: 4x sem juros" />
                    <Field label="Carga Horária" value={data.cargaHoraria} onChange={(v) => updateField("cargaHoraria", v)} placeholder="Ex: 360 horas" />
                    {activeCategory === "pos-graduacao" && (
                      <Field label="Duração" value={data.duracao || ""} onChange={(v) => updateField("duracao" as any, v)} placeholder="Ex: 12 meses" />
                    )}
                    <Field label="Matrículas" value={data.matriculas} onChange={(v) => updateField("matriculas", v)} placeholder="Ex: 15/01 a 13/02" />
                    <Field label="Início das Aulas" value={data.inicioAulas} onChange={(v) => updateField("inicioAulas", v)} placeholder="Ex: Março/2026" />
                  </div>

                  {/* Diferenciais */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-display font-semibold block">
                      Diferenciais
                    </label>
                    {data.diferenciais.map((dif, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={dif}
                          onChange={(e) => updateDiferencial(idx, e.target.value)}
                          placeholder="Diferencial"
                          className="flex-1 bg-background/50 border border-border rounded px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          onClick={() => removeDiferencial(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addDiferencial}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar diferencial
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {cursos.length === 0 && (
          <div className="glass-card rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm">Nenhum curso cadastrado nesta categoria.</p>
            <Button onClick={addCurso} variant="outline" className="mt-3 text-xs" size="sm">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Adicionar primeiro curso
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Reusable field component ── */
function Field({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wider font-display font-semibold mb-1 block">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background/50 border border-border rounded px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
      />
    </div>
  );
}
