import { 
  User, 
  Mail, 
  Phone,
  CreditCard,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientData } from '@/hooks/useClientData';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClientPerfil() {
  const { profile } = useAuth();
  const { client, creditsInfo, generators, isLoading } = useClientData();
  
  // Calculate credits percentage
  const creditsTotal = creditsInfo.total === Infinity ? 100 : creditsInfo.total;
  const creditsPercentage = creditsTotal > 0 ? (creditsInfo.used / creditsTotal) * 100 : 0;
  
  // Generate mock monthly usage based on real data (last 6 months)
  const monthlyUsage = [
    { month: 'Ago', credits: 0 },
    { month: 'Set', credits: 0 },
    { month: 'Out', credits: 0 },
    { month: 'Nov', credits: 0 },
    { month: 'Dez', credits: 0 },
    { month: 'Jan', credits: creditsInfo.used },
  ];
  
  // Build plan features based on client data
  const planFeatures = [
    `${creditsTotal === Infinity ? 'Ilimitado' : creditsTotal} créditos ${client?.type === 'fixed' ? 'por mês' : 'no pacote'}`,
    `${generators?.length || 0} geradores ativos`,
    'Suporte prioritário',
    'Histórico completo',
  ];
  
  const planName = client?.type === 'fixed' ? 'Mensal' : 'Pacote';

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações e acompanhe seu consumo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Empresa */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                {client?.logo_url ? (
                  <img src={client.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-5 w-20" />
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg text-foreground">{client?.name || 'Carregando...'}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {client?.status === 'active' ? 'Cliente Ativo' : client?.status === 'blocked' ? 'Bloqueado' : 'Expirado'}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    <p className="text-sm font-medium text-foreground">{client?.email || profile?.email || '-'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <p className="text-sm font-medium text-foreground">{client?.phone || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plano Atual */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-primary" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                {isLoading ? (
                  <Skeleton className="h-5 w-32" />
                ) : (
                  <h3 className="font-semibold text-lg text-foreground">Plano {planName}</h3>
                )}
                <Badge className="bg-primary">{client?.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {creditsTotal === Infinity ? 'Créditos ilimitados' : `${creditsTotal} créditos ${client?.type === 'fixed' ? 'por mês' : 'no pacote'}`}
              </p>
            </div>

            {/* Credits usage */}
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Créditos usados</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="text-sm font-bold text-foreground">
                    {creditsInfo.used}/{creditsTotal === Infinity ? '∞' : creditsTotal}
                  </span>
                )}
              </div>
              <Progress value={creditsPercentage} className="h-2" />
              {client?.access_expires_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Expira em {new Date(client.access_expires_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Recursos inclusos:</p>
              {planFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consumo Mensal */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Consumo dos Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="credits" 
                  name="Créditos"
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
