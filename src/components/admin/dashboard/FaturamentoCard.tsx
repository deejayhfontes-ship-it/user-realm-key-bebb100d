import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FaturamentoData {
  mes_atual: {
    total: number;
    pago: number;
    pendente: number;
    atrasado: number;
  };
  comparativo: {
    percentual: number;
    tipo: 'aumento' | 'queda';
  };
}

// Mock data - replace with real API call
const mockFaturamento: FaturamentoData = {
  mes_atual: {
    total: 45000,
    pago: 30000,
    pendente: 10000,
    atrasado: 5000,
  },
  comparativo: {
    percentual: 12,
    tipo: 'aumento',
  },
};

export function FaturamentoCard() {
  const data = mockFaturamento;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Faturamento do Mês</h3>
            <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
          </div>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-6">
        <p className="text-4xl font-bold text-emerald-500 tracking-tight">
          {formatCurrency(data.mes_atual.total)}
        </p>
        
        <div className={cn(
          "inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-sm font-medium",
          data.comparativo.tipo === 'aumento' 
            ? 'bg-emerald-500/10 text-emerald-600' 
            : 'bg-destructive/10 text-destructive'
        )}>
          {data.comparativo.tipo === 'aumento' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {data.comparativo.tipo === 'aumento' ? '↑' : '↓'} {data.comparativo.percentual}% vs mês anterior
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex-1 space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Detalhamento
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-foreground">Pago</span>
            </div>
            <span className="text-sm font-semibold text-emerald-600">
              {formatCurrency(data.mes_atual.pago)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm text-foreground">Pendente</span>
            </div>
            <span className="text-sm font-semibold text-amber-600">
              {formatCurrency(data.mes_atual.pendente)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm text-foreground">Atrasado</span>
            </div>
            <span className="text-sm font-semibold text-destructive">
              {formatCurrency(data.mes_atual.atrasado)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4">
          <div className="h-3 bg-muted rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${(data.mes_atual.pago / data.mes_atual.total) * 100}%` }}
            />
            <div 
              className="bg-amber-500 transition-all duration-500"
              style={{ width: `${(data.mes_atual.pendente / data.mes_atual.total) * 100}%` }}
            />
            <div 
              className="bg-destructive transition-all duration-500"
              style={{ width: `${(data.mes_atual.atrasado / data.mes_atual.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-auto border-t border-border">
        <Link 
          to="/admin/financeiro" 
          className="text-sm text-primary hover:underline"
        >
          Ver relatório completo →
        </Link>
      </div>
    </div>
  );
}
