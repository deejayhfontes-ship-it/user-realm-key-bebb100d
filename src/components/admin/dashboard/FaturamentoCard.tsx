<<<<<<< HEAD
import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Bell, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';

export function FaturamentoCard() {
  const { invoices, isLoading } = useInvoices();

  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar invoices do mês atual
    const mesAtualInvoices = invoices.filter(inv => {
      const d = new Date(inv.date || inv.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Filtrar invoices do mês anterior (para comparação)
    const mesAnteriorInvoices = invoices.filter(inv => {
      const d = new Date(inv.date || inv.created_at);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    // Totais do mês atual (invoice.total está em centavos)
    const pago = mesAtualInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    const pendente = mesAtualInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    const atrasado = mesAtualInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    const total = pago + pendente + atrasado;

    // Total do mês anterior
    const totalAnterior = mesAnteriorInvoices
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    // Comparativo
    let percentual = 0;
    let tipo: 'aumento' | 'queda' = 'aumento';
    if (totalAnterior > 0) {
      percentual = Math.round(((total - totalAnterior) / totalAnterior) * 100);
      tipo = percentual >= 0 ? 'aumento' : 'queda';
      percentual = Math.abs(percentual);
    }

    return {
      mes_atual: { total, pago, pendente, atrasado },
      comparativo: { percentual, tipo },
    };
  }, [invoices]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const progressPercent = data.mes_atual.total > 0
    ? Math.round((data.mes_atual.pago / data.mes_atual.total) * 100)
    : 0;

  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 flex flex-col min-h-[340px] items-center justify-center"
        style={{ background: '#d5e636' }}
      >
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-3" />
        <p className="text-sm text-gray-700 font-medium">Carregando faturamento...</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[24px] p-7 flex flex-col min-h-[340px] relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ background: '#d5e636' }}
    >
      {/* Top row: avatar + icons */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Faturamento</h3>
            <p className="text-sm text-gray-700 capitalize font-medium">{currentMonth}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4 text-gray-700" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors border border-gray-300/50">
            <Info className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-5">
        <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">
          {formatCurrency(data.mes_atual.total)}
        </p>

        {data.comparativo.percentual > 0 && (
          <div className={cn(
            "inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold",
            data.comparativo.tipo === 'aumento'
              ? 'bg-gray-900/10 text-gray-900'
              : 'bg-red-500/20 text-red-800'
          )}>
            {data.comparativo.tipo === 'aumento' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {data.comparativo.tipo === 'aumento' ? '↑' : '↓'} {data.comparativo.percentual}% vs mês anterior
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">Progresso de recebimento</span>
          <span className="font-bold text-gray-900">{progressPercent}%</span>
        </div>

        <div className="h-3 bg-gray-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Breakdown mini */}
        <div className="flex items-center gap-4 text-xs text-gray-700 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-900" />
            Pago {formatCurrency(data.mes_atual.pago)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-900/40" />
            Pendente {formatCurrency(data.mes_atual.pendente)}
          </span>
        </div>

        {/* Link to full report */}
        <Link
          to="/admin/payments"
          className="flex items-center gap-3 bg-white/70 hover:bg-white rounded-2xl px-4 py-3 transition-colors group mt-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 flex-1">Ver relatório completo</span>
          <span className="text-gray-500 group-hover:text-gray-900 transition-colors">→</span>
        </Link>
      </div>
    </div>
  );
}
=======
import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Bell, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';

export function FaturamentoCard() {
  const { invoices, isLoading } = useInvoices();

  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar invoices do mês atual
    const mesAtualInvoices = invoices.filter(inv => {
      const d = new Date(inv.date || inv.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Filtrar invoices do mês anterior (para comparação)
    const mesAnteriorInvoices = invoices.filter(inv => {
      const d = new Date(inv.date || inv.created_at);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    // Totais do mês atual (invoice.total está em centavos)
    const pago = mesAtualInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    const pendente = mesAtualInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    const atrasado = mesAtualInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    const total = pago + pendente + atrasado;

    // Total do mês anterior
    const totalAnterior = mesAnteriorInvoices
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100;

    // Comparativo
    let percentual = 0;
    let tipo: 'aumento' | 'queda' = 'aumento';
    if (totalAnterior > 0) {
      percentual = Math.round(((total - totalAnterior) / totalAnterior) * 100);
      tipo = percentual >= 0 ? 'aumento' : 'queda';
      percentual = Math.abs(percentual);
    }

    return {
      mes_atual: { total, pago, pendente, atrasado },
      comparativo: { percentual, tipo },
    };
  }, [invoices]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const progressPercent = data.mes_atual.total > 0
    ? Math.round((data.mes_atual.pago / data.mes_atual.total) * 100)
    : 0;

  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 flex flex-col min-h-[340px] items-center justify-center"
        style={{ background: '#d5e636' }}
      >
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-3" />
        <p className="text-sm text-gray-700 font-medium">Carregando faturamento...</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[24px] p-7 flex flex-col min-h-[340px] relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ background: '#d5e636' }}
    >
      {/* Top row: avatar + icons */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Faturamento</h3>
            <p className="text-sm text-gray-700 capitalize font-medium">{currentMonth}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4 text-gray-700" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors border border-gray-300/50">
            <Info className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-5">
        <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">
          {formatCurrency(data.mes_atual.total)}
        </p>

        {data.comparativo.percentual > 0 && (
          <div className={cn(
            "inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-sm font-semibold",
            data.comparativo.tipo === 'aumento'
              ? 'bg-gray-900/10 text-gray-900'
              : 'bg-red-500/20 text-red-800'
          )}>
            {data.comparativo.tipo === 'aumento' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {data.comparativo.tipo === 'aumento' ? '↑' : '↓'} {data.comparativo.percentual}% vs mês anterior
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">Progresso de recebimento</span>
          <span className="font-bold text-gray-900">{progressPercent}%</span>
        </div>

        <div className="h-3 bg-gray-900/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Breakdown mini */}
        <div className="flex items-center gap-4 text-xs text-gray-700 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-900" />
            Pago {formatCurrency(data.mes_atual.pago)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-900/40" />
            Pendente {formatCurrency(data.mes_atual.pendente)}
          </span>
        </div>

        {/* Link to full report */}
        <Link
          to="/admin/payments"
          className="flex items-center gap-3 bg-white/70 hover:bg-white rounded-2xl px-4 py-3 transition-colors group mt-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 flex-1">Ver relatório completo</span>
          <span className="text-gray-500 group-hover:text-gray-900 transition-colors">→</span>
        </Link>
      </div>
    </div>
  );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
