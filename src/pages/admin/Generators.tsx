import { useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GeneratorCard } from '@/components/admin/generators/GeneratorCard';
import { NewGeneratorModal } from '@/components/admin/generators/NewGeneratorModal';
import { EditGeneratorModal } from '@/components/admin/generators/EditGeneratorModal';
import { GeneratorDetailsDrawer } from '@/components/admin/generators/GeneratorDetailsDrawer';
import { 
  useGeneratorsList, 
  useUpdateGeneratorStatus, 
  Generator 
} from '@/hooks/useGenerators';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminGenerators() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editGenerator, setEditGenerator] = useState<Generator | null>(null);
  const [viewGenerator, setViewGenerator] = useState<Generator | null>(null);
  const [toggleStatusGenerator, setToggleStatusGenerator] = useState<Generator | null>(null);

  const { data: generators, isLoading } = useGeneratorsList();
  const updateStatus = useUpdateGeneratorStatus();

  const handleView = (generator: Generator) => {
    setViewGenerator(generator);
  };

  const handleEdit = (generator: Generator) => {
    setEditGenerator(generator);
  };

  const handleToggleStatus = (generator: Generator) => {
    setToggleStatusGenerator(generator);
  };

  const confirmToggleStatus = () => {
    if (toggleStatusGenerator) {
      const newStatus = toggleStatusGenerator.status === 'disabled' ? 'ready' : 'disabled';
      updateStatus.mutate({ id: toggleStatusGenerator.id, status: newStatus });
      setToggleStatusGenerator(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Geradores" 
        subtitle="Gerenciar geradores de arte"
        action={
          <Button 
            onClick={() => setIsNewModalOpen(true)} 
            className="gap-2 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-6 h-11 font-medium shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Novo Gerador
          </Button>
        }
      />
      
      <div className="flex-1 p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-3xl" />
            ))}
          </div>
        ) : generators && generators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generators.map((generator) => (
              <GeneratorCard
                key={generator.id}
                generator={generator}
                onView={handleView}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
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
              onClick={() => setIsNewModalOpen(true)} 
              className="gap-2 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-6 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Gerador
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewGeneratorModal
        open={isNewModalOpen}
        onOpenChange={setIsNewModalOpen}
      />

      <EditGeneratorModal
        generator={editGenerator}
        open={!!editGenerator}
        onOpenChange={(open) => !open && setEditGenerator(null)}
      />

      <GeneratorDetailsDrawer
        generator={viewGenerator}
        open={!!viewGenerator}
        onOpenChange={(open) => !open && setViewGenerator(null)}
        onEdit={handleEdit}
      />

      {/* Toggle Status Confirmation */}
      <AlertDialog open={!!toggleStatusGenerator} onOpenChange={() => setToggleStatusGenerator(null)}>
        <AlertDialogContent className="soft-card-elevated border-0 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {toggleStatusGenerator?.status === 'disabled' ? 'Ativar' : 'Desativar'} gerador?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleStatusGenerator?.status === 'disabled'
                ? `O gerador "${toggleStatusGenerator?.name}" será ativado e ficará disponível para uso.`
                : `O gerador "${toggleStatusGenerator?.name}" será desativado e não estará mais disponível para os clientes.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleStatus}
              className="rounded-full bg-primary text-primary-foreground hover:brightness-105"
            >
              {toggleStatusGenerator?.status === 'disabled' ? 'Ativar' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
