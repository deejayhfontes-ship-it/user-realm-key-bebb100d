import { useState } from 'react';
import { Layers, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TrelloCard {
  id: string;
  nome: string;
  cor_label?: string;
}

interface TrelloLista {
  nome: string;
  cards_count: number;
  cards: TrelloCard[];
}

interface TrelloData {
  configurado: boolean;
  listas: TrelloLista[];
}

// Mock data - replace with real API call
const mockTrelloData: TrelloData = {
  configurado: true,
  listas: [
    {
      nome: 'A Fazer',
      cards_count: 5,
      cards: [
        { id: '1', nome: 'Design logo empresa X', cor_label: '#ef4444' },
        { id: '2', nome: 'Revisão identidade visual', cor_label: '#3b82f6' },
        { id: '3', nome: 'Arte para redes sociais', cor_label: '#10b981' },
      ],
    },
    {
      nome: 'Em Progresso',
      cards_count: 3,
      cards: [
        { id: '4', nome: 'Website institucional', cor_label: '#8b5cf6' },
        { id: '5', nome: 'Apresentação comercial', cor_label: '#f59e0b' },
      ],
    },
    {
      nome: 'Concluído',
      cards_count: 8,
      cards: [
        { id: '6', nome: 'Cartão de visita digital', cor_label: '#10b981' },
        { id: '7', nome: 'Banner promocional', cor_label: '#ec4899' },
      ],
    },
  ],
};

export function TrelloCard() {
  const [data] = useState<TrelloData>(mockTrelloData);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  if (!data.configurado) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Configure o Trello</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Conecte sua conta Trello para visualizar seus projetos aqui
        </p>
        <Button asChild>
          <Link to="/admin/settings">Configurar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Projetos (Trello)</h3>
            <p className="text-sm text-muted-foreground">Status dos trabalhos</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
        </Button>
      </div>

      {/* Trello Lists */}
      <div className="flex-1 grid grid-cols-3 gap-3">
        {data.listas.map((lista) => (
          <div key={lista.nome} className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {lista.nome}
              </span>
              <span className="text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                {lista.cards_count}
              </span>
            </div>
            
            <div className="space-y-2 flex-1">
              {lista.cards.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  className="bg-background border border-border rounded-lg p-2 shadow-sm"
                  style={{ borderLeftWidth: '3px', borderLeftColor: card.cor_label || '#e5e7eb' }}
                >
                  <p className="text-xs text-foreground line-clamp-2">{card.nome}</p>
                </div>
              ))}
              {lista.cards_count > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{lista.cards_count - 3} mais
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-border flex items-center justify-between">
        <a 
          href="https://trello.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Abrir Trello <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
