import { campanhas, todosCursos } from "@/data/gerador-data";
import { FileImage, Tag } from "lucide-react";

interface BibliotecaItem {
  nome: string;
  vinculo: string;
  formatos: string;
  status: "rascunho" | "final";
}

export default function TabBiblioteca() {
  const items: BibliotecaItem[] = [];

  campanhas.forEach((c) => {
    c.pecas.forEach((p) => {
      items.push({
        nome: p.nome,
        vinculo: c.nome,
        formatos: "1080×1080 • 1080×1440 • 1080×1920",
        status: p.status,
      });
    });
  });

  todosCursos.forEach((c) => {
    items.push({
      nome: `Peça — ${c.nome}`,
      vinculo: c.categoria === "pos-graduacao" ? "Pós-Graduação" : "Curso Livre",
      formatos: "1080×1080 • 1080×1440 • 1080×1920",
      status: "rascunho",
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase">
          Biblioteca de Peças ({items.length})
        </h3>
      </div>

      <div className="grid gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="glass-card rounded-lg px-4 py-3 flex items-center gap-4 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <FileImage className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.nome}</p>
              <p className="text-xs text-muted-foreground truncate">{item.vinculo}</p>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">{item.formatos}</p>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
              item.status === "final"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}>
              <Tag className="w-3 h-3" />
              {item.status === "final" ? "Final" : "Rascunho"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
