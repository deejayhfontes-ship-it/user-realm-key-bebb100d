import { useState, useMemo, useEffect } from 'react';
import { Target, Settings, TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';

const META_STORAGE_KEY = 'dashboard_meta_mensal';
const DEFAULT_META = 50000;

export function MetaCard() {
  const { invoices, isLoading } = useInvoices();
  const [meta, setMeta] = useState<number>(() => {
    const saved = localStorage.getItem(META_STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_META;
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newMeta, setNewMeta] = useState(meta.toString());
  const { toast } = useToast();

  // Calcular progresso real a partir das invoices pagas no mês atual
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Invoices pagas neste mês
    const pagoNoMes = invoices
      .filter(inv => {
        if (inv.status !== 'paid') return false;
        const d = new Date(inv.date || inv.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, inv) => acc + (inv.total || 0), 0) / 100; // centavos → reais

    // Dias restantes no mês
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const diasRestantes = Math.max(0, lastDay - now.getDate());

    // Calcular porcentagem
    const percentual = meta > 0 ? Math.round((pagoNoMes / meta) * 100) : 0;

    // Previsão linear: se estamos no dia X e faturamos Y, previsão = Y * (dias_total / dia_atual)
    const diaAtual = now.getDate();
    const previsao = diaAtual > 0 ? Math.round((pagoNoMes / diaAtual) * lastDay) : 0;

    return { atual: pagoNoMes, percentual, diasRestantes, previsao };
  }, [invoices, meta]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSaveMeta = () => {
    const metaValue = parseFloat(newMeta);
    if (isNaN(metaValue) || metaValue <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Por favor, insira um valor válido para a meta.',
        variant: 'destructive',
      });
      return;
    }

    setMeta(metaValue);
    localStorage.setItem(META_STORAGE_KEY, metaValue.toString());
    setIsEditOpen(false);
    toast({
      title: 'Meta atualizada!',
      description: `Nova meta: ${formatCurrency(metaValue)}`,
    });
  };

  const isAcimaDaMeta = stats.previsao >= meta;

  if (isLoading) {
    return (
      <div
        className="rounded-[24px] p-7 flex flex-col min-h-[340px] items-center justify-center"
        style={{ background: '#b5b9aa' }}
      >
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin mb-3" />
        <p className="text-sm text-gray-700 font-medium">Carregando meta...</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="rounded-[24px] p-7 flex flex-col min-h-[340px] hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
        style={{ background: '#b5b9aa' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Meta do mês</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-white/40"
            onClick={() => {
              setNewMeta(meta.toString());
              setIsEditOpen(true);
            }}
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Big Number */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-6xl font-black text-gray-900 tracking-tight leading-none mb-1">
            {stats.percentual}%
          </p>
          <p className="text-sm font-medium text-gray-600 mb-4">
            {formatCurrency(stats.atual)} de {formatCurrency(meta)}
          </p>

          {/* Progress Bar */}
          <div className="h-2.5 bg-white/40 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(stats.percentual, 100)}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/30 rounded-xl p-3">
              <p className="text-xs text-gray-600 font-medium">Restam</p>
              <p className="text-lg font-bold text-gray-900">{stats.diasRestantes} dias</p>
            </div>
            <div className={cn(
              "rounded-xl p-3",
              isAcimaDaMeta ? "bg-[#d5e636]/30" : "bg-amber-300/30"
            )}>
              <div className="flex items-center gap-1">
                {isAcimaDaMeta ? (
                  <TrendingUp className="w-3.5 h-3.5 text-gray-700" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
                )}
                <p className="text-xs text-gray-600 font-medium">Previsão</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.previsao)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Meta Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Meta do Mês</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meta">Meta mensal (R$)</Label>
              <Input
                id="meta"
                type="number"
                value={newMeta}
                onChange={(e) => setNewMeta(e.target.value)}
                placeholder="50000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMeta}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
