import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Image as ImageIcon, 
  Download,
  Calendar,
  Filter,
  Eye,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const periodFilters = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 3 meses' },
  { value: 'all', label: 'Todos' },
];

const generatorFilters = [
  { value: 'all', label: 'Todos os geradores' },
  { value: 'stories', label: 'Stories' },
  { value: 'derivations', label: 'Derivações IA' },
  { value: 'carousel', label: 'Carrossel' },
];

interface Generation {
  id: string;
  created_at: string;
  success: boolean;
  prompt: string | null;
  generator_id: string;
  generator_name?: string;
  generator_type?: string;
}

export default function ClientHistorico() {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [generatorFilter, setGeneratorFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  const { profile } = useAuth();

  // Fetch generations from Supabase
  const { data: generationsData, isLoading, isFetching } = useQuery({
    queryKey: ['client-generations-history', profile?.client_id, periodFilter, generatorFilter, page],
    queryFn: async () => {
      if (!profile?.client_id) return { generations: [], count: 0 };

      let query = supabase
        .from('generations')
        .select(`
          id,
          created_at,
          success,
          prompt,
          generator_id,
          generators (name, type)
        `, { count: 'exact' })
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false });

      // Period filter
      if (periodFilter !== 'all') {
        const daysAgo = parseInt(periodFilter);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        query = query.gte('created_at', date.toISOString());
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Map data
      let generations: Generation[] = (data || []).map((item) => ({
        id: item.id,
        created_at: item.created_at,
        success: item.success,
        prompt: item.prompt,
        generator_id: item.generator_id,
        generator_name: (item.generators as { name: string; type: string })?.name,
        generator_type: (item.generators as { name: string; type: string })?.type,
      }));

      // Generator type filter (client-side since it's from joined table)
      if (generatorFilter !== 'all') {
        generations = generations.filter(g => g.generator_type === generatorFilter);
      }

      return { generations, count: count || 0 };
    },
    enabled: !!profile?.client_id,
  });

  const generations = generationsData?.generations || [];
  const totalCount = generationsData?.count || 0;
  const hasMore = page * pageSize < totalCount;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
          <Skeleton className="h-4 w-56 sm:w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Minhas Artes</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Histórico de todas as artes geradas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={periodFilter} onValueChange={(v) => { setPeriodFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
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

        <Select value={generatorFilter} onValueChange={(v) => { setGeneratorFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[200px]">
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
              setPage(1);
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {generations.length} de {totalCount} {totalCount === 1 ? 'arte' : 'artes'}
        {isFetching && <Loader2 className="w-4 h-4 inline ml-2 animate-spin" />}
      </div>

      {/* Arts Grid */}
      {generations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {generations.map((gen) => (
            <Card 
              key={gen.id} 
              className="border-none shadow-sm bg-card overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon" className="h-9 w-9">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-9 w-9">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Success indicator */}
                {!gen.success && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="text-xs">Erro</Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <CardContent className="p-4">
                <p className="font-medium text-foreground truncate mb-1">
                  {gen.prompt || gen.generator_name || 'Geração'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(gen.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  {gen.generator_name && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {gen.generator_name.replace('Gerador de ', '')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Nenhuma arte encontrada</h3>
          <p className="text-muted-foreground text-sm">
            {periodFilter !== 'all' || generatorFilter !== 'all'
              ? 'Não há artes para os filtros selecionados'
              : 'Você ainda não gerou nenhuma arte'}
          </p>
          {(periodFilter !== 'all' || generatorFilter !== 'all') && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => {
                setPeriodFilter('all');
                setGeneratorFilter('all');
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar mais...'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
