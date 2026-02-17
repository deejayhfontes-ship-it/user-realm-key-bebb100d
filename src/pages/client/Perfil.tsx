import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClientPerfil() {
  const { profile } = useAuth();
  const { client, creditsInfo, generators, isLoading } = useClientData();
  
  // Fetch monthly usage from generations table
  const { data: monthlyUsage } = useQuery({
    queryKey: ['client-monthly-usage', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      // Get generations from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data, error } = await supabase
        .from('generations')
        .select('created_at')
        .eq('client_id', profile.client_id)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Group by month
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const months: Record<string, number> = {};
      
      // Initialize last 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]}`;
        months[key] = 0;
      }
      
      // Count generations per month
      for (const gen of data || []) {
        const date = new Date(gen.created_at);
        const key = `${monthNames[date.getMonth()]}`;
        if (key in months) {
          months[key]++;
        }
      }
      
      return Object.entries(months).map(([month, credits]) => ({ month, credits }));
    },
    enabled: !!profile?.client_id,
  });
  
  // Calculate credits percentage
  const creditsTotal = creditsInfo.total === Infinity ? 100 : creditsInfo.total;
  const creditsPercentage = creditsTotal > 0 ? (creditsInfo.used / creditsTotal) * 100 : 0;
  
  // Build plan features based on client data
  const planFeatures = [
    `${creditsTotal === Infinity ? 'Ilimitado' : creditsTotal} créditos ${client?.type === 'fixed' ? 'por mês' : 'no pacote'}`,
    `${generators?.length || 0} geradores ativos`,
    'Suporte prioritário',
    'Histórico completo',
  ];
  
  const planName = client?.type === 'fixed' ? 'Mensal' : 'Pacote';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gerencie suas informações e acompanhe seu consumo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
              <BarChart data={monthlyUsage || []}>
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
