import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Wand2, 
  Image as ImageIcon, 
  Smartphone, 
  Sparkles, 
  Images,
  ArrowRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockClientData } from '@/data/mockClientData';

// TODO: Substituir por busca real do Supabase
// import { useClientData } from '@/hooks/useClientData';
// const { client, generators, recentGenerations, creditsInfo } = useClientData();

const iconMap: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Sparkles: Sparkles,
  Images: Images,
};

export default function ClientDashboard() {
  const { user, credits, generators, recentArts } = mockClientData;
  const creditsPercentage = (credits.used / credits.total) * 100;
  const creditsRemaining = credits.total - credits.used;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Bem-vindo, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus geradores e acompanhe suas criações
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Créditos Disponíveis */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créditos Disponíveis</p>
                <p className="text-2xl font-bold text-foreground">
                  {creditsRemaining}
                  <span className="text-sm font-normal text-muted-foreground">/{credits.total}</span>
                </p>
              </div>
            </div>
            <Progress value={100 - creditsPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Renova em {new Date(credits.resetDate).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        {/* Geradores Liberados */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Geradores Liberados</p>
                <p className="text-2xl font-bold text-foreground">{generators.length}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-4">
              {generators.map((gen) => {
                const Icon = iconMap[gen.icon] || Wand2;
                return (
                  <div 
                    key={gen.id} 
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    title={gen.name}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Artes Geradas */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Artes Geradas</p>
                <p className="text-2xl font-bold text-foreground">{recentArts.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Este mês</p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status da Conta</p>
                <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 mt-1">
                  Ativo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meus Geradores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Meus Geradores</h2>
          <Link to="/client/geradores">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generators.map((generator) => {
            const Icon = iconMap[generator.icon] || Wand2;
            return (
              <Card key={generator.id} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{generator.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {generator.description}
                      </p>
                    </div>
                  </div>
                  <Link to={`/client/gerador/${generator.type}`}>
                    <Button className="w-full mt-4" size="sm">
                      Usar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Últimas Criações */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Últimas Criações</h2>
          <Link to="/client/historico">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Ver histórico <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentArts.slice(0, 4).map((art) => (
            <Card key={art.id} className="border-none shadow-sm bg-card overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {art.thumbnail ? (
                  <img src={art.thumbnail} alt={art.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                )}
                <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">Ver</Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{art.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(art.date).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
