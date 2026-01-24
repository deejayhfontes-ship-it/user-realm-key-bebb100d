import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  History as HistoryIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Search,
  Filter,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Generation {
  id: string;
  generator_id: string;
  created_at: string;
  success: boolean;
  prompt: string | null;
  processing_time_ms: number | null;
  generated_images: any;
  generator_name?: string;
}

const PAGE_SIZE = 10;

export default function ClientHistory() {
  const { profile } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [generatorFilter, setGeneratorFilter] = useState<string>('all');

  // Fetch generators for filter
  const { data: generators } = useQuery({
    queryKey: ['client-generators-list', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      const { data } = await supabase
        .from('client_generators')
        .select('generator_id, generators (id, name)')
        .eq('client_id', profile.client_id);

      return (data || []).map((item: any) => item.generators);
    },
    enabled: !!profile?.client_id,
  });

  // Fetch history with pagination
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['client-history', profile?.client_id, page, statusFilter, generatorFilter],
    queryFn: async () => {
      if (!profile?.client_id) return { generations: [], hasMore: false };
      
      let query = supabase
        .from('generations')
        .select(`
          id,
          generator_id,
          created_at,
          success,
          prompt,
          processing_time_ms,
          generated_images,
          generators (name)
        `)
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

      if (statusFilter === 'success') {
        query = query.eq('success', true);
      } else if (statusFilter === 'failed') {
        query = query.eq('success', false);
      }

      if (generatorFilter !== 'all') {
        query = query.eq('generator_id', generatorFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const generations = (data || []).map((item: any) => ({
        ...item,
        generator_name: item.generators?.name
      }));

      return {
        generations,
        hasMore: generations.length === PAGE_SIZE + 1
      };
    },
    enabled: !!profile?.client_id,
  });

  const filteredGenerations = data?.generations?.filter(gen => 
    !search || 
    gen.generator_name?.toLowerCase().includes(search.toLowerCase()) ||
    gen.prompt?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Histórico de Gerações</h1>
        <p className="text-muted-foreground mt-1">
          Visualize todas as suas gerações anteriores
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-muted/50 border-0"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[140px] rounded-full bg-muted/50 border-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="failed">Falha</SelectItem>
          </SelectContent>
        </Select>

        <Select value={generatorFilter} onValueChange={(v) => { setGeneratorFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px] rounded-full bg-muted/50 border-0">
            <SelectValue placeholder="Gerador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os geradores</SelectItem>
            {generators?.map((gen: any) => (
              <SelectItem key={gen.id} value={gen.id}>{gen.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* History List */}
      {filteredGenerations.length > 0 ? (
        <div className="space-y-4">
          {filteredGenerations.map((gen) => (
            <Card key={gen.id} className="soft-card border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      gen.success ? "bg-primary/15" : "bg-destructive/15"
                    )}>
                      {gen.success ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{gen.generator_name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            gen.success ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {gen.success ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                      {gen.prompt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{gen.prompt}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(gen.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {gen.processing_time_ms && (
                          <span>{(gen.processing_time_ms / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {gen.success && gen.generated_images && (
                    <Button variant="outline" size="sm" className="rounded-full flex-shrink-0">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
              className="rounded-full"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore || isFetching}
              className="rounded-full"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Próxima'}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="soft-card border-0">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl text-foreground mb-2">
              Nenhuma geração encontrada
            </h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== 'all' || generatorFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Suas gerações aparecerão aqui'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
