import { campanhas, todosCursos } from "./gerador-data";
import { Download, Package, FolderDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function TabExportacao() {
  const handleExport = (label: string) => {
    toast({
      title: "Exportação em desenvolvimento",
      description: `A exportação "${label}" será implementada com o módulo de renderização em lote.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-lg p-6 space-y-4">
        <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase flex items-center gap-2">
          <Package className="w-4 h-4" />
          Campanhas Completas
        </h3>
        <p className="text-sm text-muted-foreground">
          Baixe todas as peças de uma campanha nos 3 formatos (1080×1080, 1080×1440, 1080×1920).
        </p>
        <div className="space-y-2">
          {campanhas.map((c) => (
            <Button
              key={c.id}
              variant="outline"
              className="w-full justify-start text-sm border-border text-muted-foreground hover:text-foreground"
              onClick={() => handleExport(c.nome)}
            >
              <Download className="w-4 h-4 mr-3" />
              {c.nome} ({c.pecas.length * 3} peças)
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-4">
        <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Todos os Cursos
        </h3>
        <p className="text-sm text-muted-foreground">
          Gere e baixe peças individuais para todos os {todosCursos.length} cursos.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="justify-start text-sm border-border text-muted-foreground hover:text-foreground"
            onClick={() => handleExport("Pós-Graduação")}
          >
            <FolderDown className="w-4 h-4 mr-3" />
            Pós-Graduação ({todosCursos.filter((c) => c.categoria === "pos-graduacao").length * 3} peças)
          </Button>
          <Button
            variant="outline"
            className="justify-start text-sm border-border text-muted-foreground hover:text-foreground"
            onClick={() => handleExport("Cursos Livres")}
          >
            <FolderDown className="w-4 h-4 mr-3" />
            Cursos Livres ({todosCursos.filter((c) => c.categoria === "curso-livre").length * 3} peças)
          </Button>
        </div>
        <Button
          className="w-full btn-nuppe text-xs"
          onClick={() => handleExport("Todos os Cursos")}
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Todos ({todosCursos.length * 3} peças)
        </Button>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-4">
        <h3 className="font-display text-sm font-bold tracking-wider text-primary uppercase flex items-center gap-2">
          <Download className="w-4 h-4" />
          Pacote Completo
        </h3>
        <p className="text-sm text-muted-foreground">
          Baixe absolutamente todas as peças do NUPPE 2026 em um único arquivo ZIP.
        </p>
        <Button
          className="w-full btn-nuppe text-sm"
          onClick={() => handleExport("Pacote Completo")}
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Tudo ({(campanhas.reduce((a, c) => a + c.pecas.length, 0) + todosCursos.length) * 3} peças PNG)
        </Button>
      </div>
    </div>
  );
}
