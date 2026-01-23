import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, Zap, CreditCard } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  generationsToday: number;
  creditsUsed: number;
}

interface ChartData {
  date: string;
  generations: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    generationsToday: 0,
    creditsUsed: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      // Total clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Active clients
      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Generations today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: generationsToday } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Credits used (sum of package_credits_used)
      const { data: creditsData } = await supabase
        .from('clients')
        .select('package_credits_used');
      
      const creditsUsed = creditsData?.reduce(
        (sum, client) => sum + (client.package_credits_used || 0), 
        0
      ) || 0;

      setStats({
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        generationsToday: generationsToday || 0,
        creditsUsed,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const days = 7;
      const data: ChartData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { count } = await supabase
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());

        data.push({
          date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
          generations: count || 0,
        });
      }

      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  // Accent color: hsl(33 35% 57%) = #B8956A
  const chartConfig = {
    generations: {
      label: 'Gerações',
      color: 'hsl(33 35% 57%)',
    },
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Gestão Inteligente de Conteúdo Visual"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Clientes"
            value={loading ? '...' : stats.totalClients}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Clientes Ativos"
            value={loading ? '...' : stats.activeClients}
            icon={UserCheck}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Gerações Hoje"
            value={loading ? '...' : stats.generationsToday}
            icon={Zap}
            variant="warning"
          />
          <StatCard
            title="Créditos Usados"
            value={loading ? '...' : stats.creditsUsed.toLocaleString()}
            icon={CreditCard}
            variant="default"
          />
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Gerações - Últimos 7 dias
          </h2>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGenerations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(33 35% 57%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(33 35% 57%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(220 9% 60%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(220 9% 60%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                cursor={{ stroke: 'hsl(33 35% 57%)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="generations"
                stroke="hsl(33 35% 57%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGenerations)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
