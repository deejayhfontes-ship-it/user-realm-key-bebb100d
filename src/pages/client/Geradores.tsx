import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wand2, 
  Smartphone, 
  Sparkles, 
  Images,
  Filter,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockClientData } from '@/data/mockClientData';

// TODO: Substituir por busca real do Supabase
// const { data: generators } = await supabase.from('client_generators')
//   .select('*, generators(*)')
//   .eq('client_id', clientId)

const iconMap: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Sparkles: Sparkles,
  Images: Images,
};

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'stories', label: 'Stories' },
  { value: 'derivations', label: 'Posts' },
  { value: 'carousel', label: 'Carrossel' },
];

export default function ClientGeradores() {
  const [filter, setFilter] = useState('all');
  const { generators } = mockClientData;

  const filteredGenerators = filter === 'all' 
    ? generators 
    : generators.filter(g => g.type === filter);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus Geradores</h1>
        <p className="text-muted-foreground mt-1">
          Acesse os geradores disponíveis para seu plano
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-muted/50">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Generators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGenerators.map((generator) => {
          const Icon = iconMap[generator.icon] || Wand2;
          return (
            <Card 
              key={generator.id} 
              className="border-none shadow-sm bg-card hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground">{generator.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600">Disponível</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {generator.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {generator.tags.map((tag) => (
                    <Badge
                      key={tag} 
                      variant="secondary" 
                      className="bg-muted text-muted-foreground font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action */}
                <Link to={`/client/gerador/${generator.type}`}>
                  <Button className="w-full">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Acessar Gerador
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredGenerators.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Nenhum gerador encontrado</h3>
          <p className="text-muted-foreground text-sm">
            Não há geradores disponíveis para este filtro
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setFilter('all')}>
            Ver todos os geradores
          </Button>
        </div>
      )}
    </div>
  );
}
