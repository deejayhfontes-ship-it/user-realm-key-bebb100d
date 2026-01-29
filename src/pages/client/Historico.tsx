import { useState } from 'react';
import { 
  Image as ImageIcon, 
  Download,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClientData } from '@/data/mockClientData';

// TODO: Substituir por busca real do Supabase
// const { data: arts } = await supabase.from('generations')
//   .select('*, generators(name)')
//   .eq('client_id', clientId)
//   .order('created_at', { ascending: false })

const periodFilters = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: 'all', label: 'Todos' },
];

const generatorFilters = [
  { value: 'all', label: 'Todos os geradores' },
  { value: 'Stories', label: 'Stories' },
  { value: 'Derivações IA', label: 'Derivações IA' },
  { value: 'Carrossel', label: 'Carrossel' },
];

export default function ClientHistorico() {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [generatorFilter, setGeneratorFilter] = useState('all');
  const { recentArts } = mockClientData;

  // Filter arts based on selected filters
  const filteredArts = recentArts.filter((art) => {
    // Generator filter
    if (generatorFilter !== 'all' && art.generator !== generatorFilter) {
      return false;
    }

    // Period filter
    if (periodFilter !== 'all') {
      const artDate = new Date(art.date);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - artDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > parseInt(periodFilter)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minhas Artes</h1>
        <p className="text-muted-foreground mt-1">
          Histórico de todas as artes geradas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {periodFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={generatorFilter} onValueChange={setGeneratorFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Gerador" />
          </SelectTrigger>
          <SelectContent>
            {generatorFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(periodFilter !== 'all' || generatorFilter !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setPeriodFilter('all');
              setGeneratorFilter('all');
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredArts.length} {filteredArts.length === 1 ? 'arte' : 'artes'}
      </div>

      {/* Arts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredArts.map((art) => (
          <Card 
            key={art.id} 
            className="border-none shadow-sm bg-card overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-muted flex items-center justify-center relative">
              {art.thumbnail ? (
                <img src={art.thumbnail} alt={art.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" className="h-9 w-9">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="h-9 w-9">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <CardContent className="p-4">
              <p className="font-medium text-foreground truncate mb-1">{art.name}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {new Date(art.date).toLocaleDateString('pt-BR')}
                </p>
                <Badge variant="secondary" className="text-xs font-normal">
                  {art.generator}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredArts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Nenhuma arte encontrada</h3>
          <p className="text-muted-foreground text-sm">
            Não há artes para os filtros selecionados
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => {
              setPeriodFilter('all');
              setGeneratorFilter('all');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Load more */}
      {filteredArts.length > 0 && filteredArts.length >= 8 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Carregar mais...
          </Button>
        </div>
      )}
    </div>
  );
}
