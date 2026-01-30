import { useState } from 'react';
import { Target, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

interface MetaData {
  meta: number;
  atual: number;
  percentual: number;
  dias_restantes: number;
  previsao: number;
}

// Mock data - replace with real API call
const mockMeta: MetaData = {
  meta: 50000,
  atual: 45000,
  percentual: 90,
  dias_restantes: 5,
  previsao: 52000,
};

export function MetaCard() {
  const [data, setData] = useState<MetaData>(mockMeta);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newMeta, setNewMeta] = useState(data.meta.toString());
  const { toast } = useToast();

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

    const newPercentual = Math.round((data.atual / metaValue) * 100);
    setData({
      ...data,
      meta: metaValue,
      percentual: newPercentual,
    });
    setIsEditOpen(false);
    toast({
      title: 'Meta atualizada!',
      description: `Nova meta: ${formatCurrency(metaValue)}`,
    });
  };

  const faltando = data.meta - data.atual;
  const isAcimaDaMeta = data.previsao >= data.meta;
  const previsaoPercentual = ((data.previsao - data.meta) / data.meta) * 100;

  return (
    <>
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Meta do Mês</h3>
              <p className="text-sm text-muted-foreground">
                Objetivo: {formatCurrency(data.meta)}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsEditOpen(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrency(data.atual)}
            </span>
            <span className="text-lg font-semibold text-violet-500">
              {data.percentual}%
            </span>
          </div>
          
          <Progress 
            value={Math.min(data.percentual, 100)} 
            className="h-3 bg-violet-500/20"
          />
          
          <p className="text-sm text-muted-foreground mt-2">
            de {formatCurrency(data.meta)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Faltam</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(Math.max(faltando, 0))}
            </p>
            <p className="text-sm text-muted-foreground">para a meta</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Dias restantes</p>
            <p className="text-xl font-bold text-foreground">
              {data.dias_restantes} dias
            </p>
            <p className="text-xs text-muted-foreground">até o fim do mês</p>
          </div>

          <div className={cn(
            "p-4 rounded-xl",
            isAcimaDaMeta ? "bg-emerald-500/10" : "bg-amber-500/10"
          )}>
            <div className="flex items-center gap-2 mb-1">
              {isAcimaDaMeta ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-500" />
              )}
              <p className="text-sm text-muted-foreground">Previsão</p>
            </div>
            <p className={cn(
              "text-xl font-bold",
              isAcimaDaMeta ? "text-emerald-600" : "text-amber-600"
            )}>
              {formatCurrency(data.previsao)}
            </p>
            <p className={cn(
              "text-sm",
              isAcimaDaMeta ? "text-emerald-600" : "text-amber-600"
            )}>
              {isAcimaDaMeta 
                ? `↑ ${Math.abs(previsaoPercentual).toFixed(0)}% acima da meta`
                : `↓ ${Math.abs(previsaoPercentual).toFixed(0)}% abaixo da meta`
              }
            </p>
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
