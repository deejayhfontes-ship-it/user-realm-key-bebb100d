import { useState } from 'react';
import { Plus, Download, Sparkles, Wand2, Upload, Link } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NewGeneratorModal } from '@/components/admin/generators/NewGeneratorModal';
import { EditGeneratorModal } from '@/components/admin/generators/EditGeneratorModal';
import { GeneratorDetailsDrawer } from '@/components/admin/generators/GeneratorDetailsDrawer';
import { InstalledGeneratorsTab } from '@/components/admin/generators/InstalledGeneratorsTab';
import { InstallGeneratorTab } from '@/components/admin/generators/InstallGeneratorTab';
import { AIEditorTab } from '@/components/admin/generators/AIEditorTab';
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
  const [activeTab, setActiveTab] = useState('installed');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editGenerator, setEditGenerator] = useState<Generator | null>(null);
  const [viewGenerator, setViewGenerator] = useState<Generator | null>(null);
  const [toggleStatusGenerator, setToggleStatusGenerator] = useState<Generator | null>(null);
  const [aiCreateMode, setAiCreateMode] = useState(false);

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

  const handleCreateWithAI = () => {
    setAiCreateMode(true);
    setActiveTab('ai-editor');
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Geradores" 
        subtitle="Gerenciar geradores de arte"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="gap-2 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-6 h-11 font-medium shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Novo Gerador
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsNewModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Criar Manualmente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('install')}>
                <Link className="h-4 w-4 mr-2" />
                Importar via URL/ZIP
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateWithAI} className="text-primary">
                <Wand2 className="h-4 w-4 mr-2" />
                ✨ Criar com IA
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      
      <div className="flex-1 p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full inline-flex">
            <TabsTrigger 
              value="installed" 
              className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Geradores Instalados
              {generators && generators.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                  {generators.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="install" 
              className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar Novo
            </TabsTrigger>
            <TabsTrigger 
              value="ai-editor" 
              className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Editor IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="mt-6">
            <InstalledGeneratorsTab
              generators={generators}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onNewGenerator={() => setIsNewModalOpen(true)}
            />
          </TabsContent>

          <TabsContent value="install" className="mt-6">
            <InstallGeneratorTab />
          </TabsContent>

          <TabsContent value="ai-editor" className="mt-6">
            <AIEditorTab initialMode={aiCreateMode ? 'create' : 'edit'} />
          </TabsContent>
        </Tabs>
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
