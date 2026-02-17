import { Wand2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GeneratorCard } from './GeneratorCard';
import { Generator } from '@/hooks/useGenerators';

interface InstalledGeneratorsTabProps {
  generators: Generator[] | undefined;
  isLoading: boolean;
  onView: (generator: Generator) => void;
  onEdit: (generator: Generator) => void;
  onToggleStatus: (generator: Generator) => void;
  onNewGenerator: () => void;
}

export function InstalledGeneratorsTab({
  generators,
  isLoading,
  onView,
  onEdit,
  onToggleStatus,
  onNewGenerator
}: InstalledGeneratorsTabProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!generators || generators.length === 0) {
    return (
      <div className="soft-card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
          <Wand2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum gerador cadastrado
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Crie seu primeiro gerador para começar a produzir arte personalizada para seus clientes.
        </p>
        <Button 
          onClick={onNewGenerator} 
          className="gap-2 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Criar Primeiro Gerador
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {generators.map((generator) => (
        <GeneratorCard
          key={generator.id}
          generator={generator}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
