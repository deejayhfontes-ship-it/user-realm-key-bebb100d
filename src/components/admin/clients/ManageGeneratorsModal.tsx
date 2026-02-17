import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Loader2, Plus, Package, Link, Sparkles, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/hooks/useClients';
import { GeneratorAssignmentCard } from './GeneratorAssignmentCard';

interface ManageGeneratorsModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface GeneratorAssignment {
  id: string;
  name: string;
  description: string | null;
  type: string;
  assigned: boolean;
  credits_limit: number | null;
  time_limit_start: string | null;
  time_limit_end: string | null;
  allowed_weekdays: number[];
}

export function ManageGeneratorsModal({ client, open, onOpenChange }: ManageGeneratorsModalProps) {
  const navigate = useNavigate();
  const [generators, setGenerators] = useState<GeneratorAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open && client) {
      loadGenerators();
    }
  }, [open, client]);

  const loadGenerators = async () => {
    if (!client) return;
    
    setIsLoading(true);
    try {
      // Fetch all ready generators
      const { data: allGenerators, error: genError } = await supabase
        .from('generators')
        .select('id, name, description, type')
        .eq('status', 'ready')
        .order('name');

      if (genError) throw genError;

      // Fetch client's current assignments
      const { data: assignments, error: assignError } = await supabase
        .from('client_generators')
        .select('*')
        .eq('client_id', client.id);

      if (assignError) throw assignError;

      // Combine data
      const combined = (allGenerators || []).map(gen => {
        const assignment = assignments?.find(a => a.generator_id === gen.id);
        return {
          ...gen,
          assigned: !!assignment && assignment.enabled !== false,
          credits_limit: assignment?.credits_limit ?? null,
          time_limit_start: assignment?.time_limit_start ?? null,
          time_limit_end: assignment?.time_limit_end ?? null,
          allowed_weekdays: assignment?.allowed_weekdays ?? [0, 1, 2, 3, 4, 5, 6]
        };
      });

      setGenerators(combined);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading generators:', error);
      toast.error('Erro ao carregar geradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (generatorId: string, assigned: boolean) => {
    setGenerators(prev => prev.map(gen => 
      gen.id === generatorId ? { ...gen, assigned } : gen
    ));
    setHasChanges(true);
  };

  const handleUpdateConfig = (generatorId: string, updates: Partial<GeneratorAssignment>) => {
    setGenerators(prev => prev.map(gen => 
      gen.id === generatorId ? { ...gen, ...updates } : gen
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!client) return;

    setIsSaving(true);
    try {
      // Get current assignments
      const { data: current, error: fetchError } = await supabase
        .from('client_generators')
        .select('generator_id')
        .eq('client_id', client.id);

      if (fetchError) throw fetchError;

      const currentIds = current?.map(c => c.generator_id) || [];
      const assignedGenerators = generators.filter(g => g.assigned);
      const newIds = assignedGenerators.map(g => g.id);

      // Remove unassigned generators
      const toRemove = currentIds.filter(id => !newIds.includes(id));
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('client_generators')
          .delete()
          .eq('client_id', client.id)
          .in('generator_id', toRemove);

        if (deleteError) throw deleteError;
      }

      // Upsert assigned generators
      for (const gen of assignedGenerators) {
        // Validate time restrictions
        if (gen.time_limit_start && gen.time_limit_end) {
          if (gen.time_limit_start >= gen.time_limit_end) {
            toast.error(`${gen.name}: Horário de início deve ser antes do fim`);
            setIsSaving(false);
            return;
          }
        }

        // Validate at least one weekday
        if (gen.allowed_weekdays.length === 0) {
          toast.error(`${gen.name}: Selecione pelo menos um dia da semana`);
          setIsSaving(false);
          return;
        }

        // Validate credit limit
        if (gen.credits_limit !== null && gen.credits_limit <= 0) {
          toast.error(`${gen.name}: Limite de créditos deve ser maior que zero`);
          setIsSaving(false);
          return;
        }

        const { error: upsertError } = await supabase
          .from('client_generators')
          .upsert({
            client_id: client.id,
            generator_id: gen.id,
            enabled: true,
            credits_limit: gen.credits_limit,
            time_limit_start: gen.time_limit_start || null,
            time_limit_end: gen.time_limit_end || null,
            allowed_weekdays: gen.allowed_weekdays
          }, {
            onConflict: 'client_id,generator_id'
          });

        if (upsertError) throw upsertError;
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        action: 'generators_assigned',
        entity_type: 'client',
        entity_id: client.id,
        new_data: {
          client_id: client.id,
          client_name: client.name,
          generators_assigned: newIds,
          generators_removed: toRemove,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Geradores atualizados com sucesso!');
      setHasChanges(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast.error('Erro ao salvar atribuições');
    } finally {
      setIsSaving(false);
    }
  };

  const assignedCount = generators.filter(g => g.assigned).length;
  const totalCount = generators.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col soft-card-elevated border-0">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Gerenciar Geradores
              </DialogTitle>
              <DialogDescription>
                {client?.name} - Escolha quais geradores este cliente pode acessar
              </DialogDescription>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit mt-2">
            {assignedCount} de {totalCount} geradores atribuídos
          </Badge>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : generators.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum gerador disponível no sistema.
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {generators.map((generator) => (
                <GeneratorAssignmentCard
                  key={generator.id}
                  generator={generator}
                  onToggle={(assigned) => handleToggle(generator.id, assigned)}
                  onUpdateConfig={(updates) => handleUpdateConfig(generator.id, updates)}
                />
              ))}

              {/* Informative message for few generators */}
              {totalCount <= 3 && totalCount > 0 && (
                <Alert className="bg-muted/50 border-muted-foreground/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você tem apenas {totalCount} gerador{totalCount > 1 ? 'es' : ''} no sistema. 
                    Adicione mais para oferecer aos clientes!
                  </AlertDescription>
                </Alert>
              )}

              {/* Add new generator dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 border-dashed">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Novo Gerador ao Sistema
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem 
                    onClick={() => window.open('/admin/generators?tab=instalar', '_blank')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Upload ZIP
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/admin/generators?tab=instalar', '_blank')}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Importar via URL
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/admin/generators?tab=editor', '_blank')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Criar com IA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
            className="rounded-full bg-primary text-primary-foreground hover:brightness-105"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Atribuições
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
