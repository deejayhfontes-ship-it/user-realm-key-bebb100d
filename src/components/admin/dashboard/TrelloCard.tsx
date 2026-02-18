import { useState, useMemo } from 'react';
import { Layers, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePedidos } from '@/hooks/usePedidos';

// Mapeamento de colunas Kanban: status → grupo visual
const kanbanGroups: { label: string; statuses: string[]; color: string }[] = [
  {
    label: 'A Fazer',
    statuses: ['novo', 'orcamento_enviado', 'briefing'],
    color: '#d5e636',
  },
  {
    label: 'Em Progresso',
    statuses: ['em_producao', 'revisao', 'aprovado', 'confeccao'],
    color: '#b5b9aa',
  },
  {
    label: 'Concluído',
    statuses: ['entregue', 'finalizado'],
    color: '#d5e636',
  },
];

export function TrelloCard() {
  const { data: pedidos, isLoading, refetch } = usePedidos();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await refetch();
    setIsSyncing(false);
  };

  // Agrupar pedidos nas colunas kanban
  const listas = useMemo(() => {
    if (!pedidos) return [];

    return kanbanGroups.map(group => {
      const groupPedidos = pedidos.filter(p => group.statuses.includes(p.status));
      return {
        nome: group.label,
        color: group.color,
        cards_count: groupPedidos.length,
        cards: groupPedidos.slice(0, 3).map(p => ({
          id: p.id,
          nome: p.protocolo + ' — ' + (p.clients?.name || p.nome || 'Sem nome'),
          cor_label: group.color,
        })),
      };
    });
  }, [pedidos]);

  const totalCards = listas.reduce((acc, l) => acc + l.cards_count, 0);

  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[340px] flex flex-col items-center justify-center"
        style={{ background: '#e8e9e0' }}
      >
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-3" />
        <p className="text-sm text-gray-700 font-medium">Carregando projetos...</p>
      </div>
    );
  }

  if (totalCards === 0) {
    return (
      <div
        className="rounded-[24px] p-7 min-h-[340px] flex flex-col items-center justify-center"
        style={{ background: '#e8e9e0' }}
      >
        <Layers className="w-12 h-12 text-gray-400/30 mb-3" />
        <h3 className="font-bold text-gray-900 mb-2">Nenhum projeto ativo</h3>
        <p className="text-sm text-gray-600 text-center">
          Quando houver pedidos em andamento, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[24px] p-7 flex flex-col min-h-[340px] hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: '#e8e9e0' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Projetos</h3>
            <p className="text-sm text-gray-500 font-medium">Status dos trabalhos</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-white/60"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={cn("w-4 h-4 text-gray-600", isSyncing && "animate-spin")} />
        </Button>
      </div>

      {/* Kanban bars */}
      <div className="flex-1 space-y-3 mb-4">
        {listas.map((lista) => {
          const percent = totalCards > 0 ? Math.round((lista.cards_count / totalCards) * 100) : 0;

          return (
            <div key={lista.nome} className="flex items-center gap-3">
              <div
                className="h-11 rounded-xl flex items-center px-4 gap-2 transition-all duration-500"
                style={{
                  background: lista.color,
                  width: `${Math.max(percent, 30)}%`,
                }}
              >
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{lista.nome}</span>
                <span className="text-xs font-semibold text-gray-700 ml-auto">{percent}%</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-white/60 px-2 py-1 rounded-lg">
                {lista.cards_count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cards preview */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {listas.map((lista) => (
          <div key={lista.nome} className="space-y-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{lista.nome}</p>
            {lista.cards.slice(0, 2).map((card) => (
              <div
                key={card.id}
                className="bg-white/70 rounded-lg p-2 text-xs text-gray-700 truncate"
                style={{ borderLeft: `3px solid ${card.cor_label || '#e5e7eb'}` }}
              >
                {card.nome}
              </div>
            ))}
            {lista.cards_count > 2 && (
              <p className="text-[10px] text-gray-400 text-center">+{lista.cards_count - 2} mais</p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-300/50">
        <Link
          to="/admin/pedidos"
          className="text-sm font-semibold text-gray-700 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
        >
          Ver todos os pedidos <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

