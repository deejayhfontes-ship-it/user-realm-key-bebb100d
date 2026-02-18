import { useState, useCallback, useMemo, useEffect } from 'react';
import { Bell, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { CalendarAgenda } from '@/components/admin/dashboard/CalendarAgenda';
import { TrelloCard } from '@/components/admin/dashboard/TrelloCard';
import { CobrancasCard } from '@/components/admin/dashboard/CobrancasCard';
import { FaturamentoCard } from '@/components/admin/dashboard/FaturamentoCard';
import { MetaCard } from '@/components/admin/dashboard/MetaCard';
import { EntregasCard } from '@/components/admin/dashboard/EntregasCard';
import { SolicitacoesCard } from '@/components/admin/dashboard/SolicitacoesCard';
import { DashboardFAB } from '@/components/admin/dashboard/DashboardFAB';
import { DraggableCard } from '@/components/admin/dashboard/DraggableCard';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

// ─── Card registry ───────────────────────────────────────────────
type CardId = 'faturamento' | 'agenda' | 'trello' | 'cobrancas' | 'meta' | 'entregas' | 'solicitacoes';

const DEFAULT_ORDER: CardId[] = [
  'faturamento',
  'agenda',
  'trello',
  'cobrancas',
  'meta',
  'entregas',
  'solicitacoes',
];

const CARD_LABELS: Record<CardId, string> = {
  faturamento: 'Progresso de recebimento',
  agenda: 'Agenda',
  trello: 'Projetos (Trello)',
  cobrancas: 'Cobranças Pendentes',
  meta: 'Meta do mês',
  entregas: 'Entregas Pendentes',
  solicitacoes: 'Solicitações Prefeitura',
};

const STORAGE_KEY = 'dashboard-card-order';

function loadCardOrder(): CardId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER;
    const parsed: string[] = JSON.parse(raw);
    // Validar que todos os IDs estão presentes
    const validIds = new Set<string>(DEFAULT_ORDER);
    const filtered = parsed.filter((id) => validIds.has(id)) as CardId[];
    // Adicionar IDs faltantes
    const inList = new Set(filtered);
    for (const id of DEFAULT_ORDER) {
      if (!inList.has(id)) filtered.push(id);
    }
    return filtered;
  } catch {
    return DEFAULT_ORDER;
  }
}

function saveCardOrder(order: CardId[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

// ─── Card renderer ───────────────────────────────────────────────
function renderCard(id: CardId) {
  switch (id) {
    case 'faturamento':
      return <FaturamentoCard />;
    case 'agenda':
      return <CalendarAgenda className="" />;
    case 'trello':
      return <TrelloCard />;
    case 'cobrancas':
      return <CobrancasCard />;
    case 'meta':
      return <MetaCard />;
    case 'entregas':
      return <EntregasCard />;
    case 'solicitacoes':
      return <SolicitacoesCard />;
    default:
      return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────
function formatarTempo(dataISO: string): string {
  const diff = Date.now() - new Date(dataISO).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const dias = Math.floor(hrs / 24);
  return `há ${dias} dia${dias > 1 ? 's' : ''}`;
}

// ─── Dashboard ───────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, signOut } = useAuth();

  // ─── Notificações reais ────────────────────────────────────
  const [notificacoes, setNotificacoes] = useState<any[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
      const novas = data
        .filter((s: any) => !s.status || s.status === 'novo')
        .sort((a: any, b: any) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
        .slice(0, 5)
        .map((s: any) => ({
          titulo: `Nova solicitação: ${s.projeto?.titulo || 'Sem título'}`,
          protocolo: s.protocolo,
          tempo: formatarTempo(s.dataCriacao),
        }));
      setNotificacoes(novas);
    } catch {
      setNotificacoes([]);
    }
  }, []);

  const notificationCount = notificacoes.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = user?.email?.split('@')[0] || 'Admin';

  // ─── Drag & Drop State ─────────────────────────────────────
  const [cardOrder, setCardOrder] = useState<CardId[]>(loadCardOrder);
  const [activeId, setActiveId] = useState<CardId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as CardId);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setCardOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as CardId);
        const newIndex = prev.indexOf(over.id as CardId);
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        saveCardOrder(newOrder);
        return newOrder;
      });
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const cardIds = useMemo(() => cardOrder.map((id) => id), [cardOrder]);

  return (
    <div className="flex flex-col min-h-full" style={{ background: '#c5c9b8' }}>
      {/* Header — estilo referência tela2 */}
      <header className="sticky top-0 z-40" style={{ background: '#c5c9b8' }}>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Left side - Greeting */}
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {getGreeting()}, {userName}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5 font-medium">
                Aqui está um resumo do seu negócio hoje
              </p>
            </div>

            {/* Right side - Notifications & Avatar */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-sm"
                  >
                    <Bell className="w-5 h-5 text-gray-700" />
                    {notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notificacoes.length === 0 ? (
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                      <span className="text-muted-foreground text-sm">Nenhuma notificação</span>
                    </DropdownMenuItem>
                  ) : (
                    notificacoes.map((n, idx) => (
                      <DropdownMenuItem key={idx} className="flex flex-col items-start gap-1 py-3">
                        <span className="font-medium flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-orange-500" />
                          {n.titulo}
                        </span>
                        <span className="text-xs text-muted-foreground">{n.tempo} • {n.protocolo}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center text-primary">
                    Ver todas as notificações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Info button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow-sm"
              >
                <Info className="w-5 h-5 text-gray-700" />
              </Button>

              {/* Avatar & Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-[#d5e636] text-gray-900 font-bold">
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — Grid com Drag & Drop */}
      <main className="flex-1 px-6 lg:px-8 pb-8">
        <div className="max-w-[1600px] mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={cardIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {cardOrder.map((id) => (
                  <DraggableCard key={id} id={id}>
                    {renderCard(id)}
                  </DraggableCard>
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay — preview flutuante */}
            <DragOverlay adjustScale={false}>
              {activeId ? (
                <div
                  className="rounded-[24px] opacity-90 pointer-events-none"
                  style={{
                    boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                    transform: 'scale(1.03)',
                  }}
                >
                  {renderCard(activeId)}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Floating Action Button */}
      <DashboardFAB />
    </div>
  );
}
