import { useState, useMemo } from 'react';
import { Calendar, Plus, Clock, MoreVertical, CheckCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAgendaEvents, EVENT_LABELS } from '@/hooks/useAgendaEvents';
import { format } from 'date-fns';

interface AgendaItem {
  id: string;
  tipo: 'pedido' | 'briefing' | 'tarefa' | 'reuniao' | 'lembrete' | 'entrega' | 'pagamento';
  horario: string;
  descricao: string;
  link?: string;
  concluido: boolean;
  isLocal?: boolean; // items adicionados localmente pelo modal
}

const tipoColors: Record<string, string> = {
  pedido: 'bg-blue-100 text-blue-700',
  entrega: 'bg-blue-100 text-blue-700',
  briefing: 'bg-purple-100 text-purple-700',
  tarefa: 'bg-emerald-100 text-emerald-700',
  reuniao: 'bg-amber-100 text-amber-700',
  lembrete: 'bg-gray-100 text-gray-700',
  pagamento: 'bg-orange-100 text-orange-700',
};

export function AgendaCard() {
  const today = new Date();
  const { data: agendaEvents, isLoading } = useAgendaEvents({ date: today, view: 'day' });

  const [localItems, setLocalItems] = useState<AgendaItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ horario: '', descricao: '', tipo: 'tarefa' });

  const todayLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Combinar eventos reais + items locais
  const items: AgendaItem[] = useMemo(() => {
    const fromSupabase: AgendaItem[] = (agendaEvents || []).map(event => ({
      id: event.id,
      tipo: event.type as AgendaItem['tipo'],
      horario: format(event.startTime, 'HH:mm'),
      descricao: event.title + (event.clientName ? ` — ${event.clientName}` : ''),
      link: event.pedidoId ? `/admin/pedidos/${event.pedidoId}` : undefined,
      concluido: completedIds.has(event.id),
    }));

    const combined = [...fromSupabase, ...localItems];
    return combined.sort((a, b) => a.horario.localeCompare(b.horario));
  }, [agendaEvents, localItems, completedIds]);

  const toggleConcluido = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Para itens locais, também atualizar
    setLocalItems(prev => prev.map(item =>
      item.id === id ? { ...item, concluido: !item.concluido } : item
    ));
  };

  const handleAddItem = () => {
    if (newItem.horario && newItem.descricao) {
      setLocalItems(prev => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          tipo: newItem.tipo as AgendaItem['tipo'],
          horario: newItem.horario,
          descricao: newItem.descricao,
          concluido: false,
          isLocal: true,
        },
      ]);
      setNewItem({ horario: '', descricao: '', tipo: 'tarefa' });
      setIsAddDialogOpen(false);
    }
  };

  const deleteItem = (id: string) => {
    setLocalItems(prev => prev.filter(item => item.id !== id));
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Agenda do Dia</h3>
            <p className="text-sm text-muted-foreground capitalize">{todayLabel}</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  type="time"
                  value={newItem.horario}
                  onChange={(e) => setNewItem({ ...newItem, horario: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={newItem.tipo}
                  onValueChange={(value) => setNewItem({ ...newItem, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarefa">Tarefa</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="lembrete">Lembrete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={newItem.descricao}
                  onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                  placeholder="O que precisa ser feito?"
                />
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500/30 mb-3" />
              <p className="text-muted-foreground">Nenhum item na agenda</p>
              <p className="text-sm text-muted-foreground/70">Clique em + para adicionar</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  "bg-muted/50 hover:bg-primary/5",
                  item.concluido && "opacity-50"
                )}
              >
                <Checkbox
                  checked={item.concluido}
                  onCheckedChange={() => toggleConcluido(item.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />

                <div className="flex items-center gap-2 text-sm font-medium text-foreground min-w-[50px]">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {item.horario}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm truncate",
                    item.concluido && "line-through"
                  )}>
                    {item.link ? (
                      <Link to={item.link} className="hover:text-primary transition-colors">
                        {item.descricao}
                        <LinkIcon className="w-3 h-3 inline ml-1" />
                      </Link>
                    ) : (
                      item.descricao
                    )}
                  </p>
                </div>

                <Badge variant="secondary" className={cn("text-xs", tipoColors[item.tipo] || tipoColors.tarefa)}>
                  {EVENT_LABELS[item.tipo as keyof typeof EVENT_LABELS] || item.tipo}
                </Badge>

                {item.isLocal && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteItem(item.id)}>
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-border">
        <Link
          to="/admin/agenda"
          className="text-sm text-primary hover:underline"
        >
          Ver agenda completa →
        </Link>
      </div>
    </div>
  );
}
