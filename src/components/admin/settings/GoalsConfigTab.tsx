import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Plus, 
  Trash2, 
  Save,
  Edit2,
  Bell,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingBag,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CustomGoal {
  id: string;
  nome: string;
  tipo: 'faturamento' | 'pedidos' | 'clientes';
  valor: number;
  prazo: string;
  progresso: number;
  status: 'em_andamento' | 'concluida' | 'nao_atingida';
}

interface GoalHistory {
  id: string;
  periodo: string;
  meta: number;
  atingido: number;
  percentual: number;
  tipo: 'faturamento' | 'pedidos' | 'clientes';
  status: 'atingida' | 'nao_atingida';
}

export function GoalsConfigTab() {
  const mesAtual = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  
  const [metaMensal, setMetaMensal] = useState({
    valor: 50000,
    tipo: 'faturamento' as const,
  });

  const [notificacoes, setNotificacoes] = useState({
    '50': false,
    '75': false,
    '100': true,
    naoAtingida: false,
  });

  const [canais, setCanais] = useState({
    email: true,
    whatsapp: false,
    dashboard: true,
  });

  const [metas, setMetas] = useState<CustomGoal[]>([
    {
      id: '1',
      nome: 'Fechar 10 projetos',
      tipo: 'pedidos',
      valor: 10,
      prazo: '2025-01-31',
      progresso: 7,
      status: 'em_andamento',
    },
    {
      id: '2',
      nome: 'Conquistar 5 novos clientes',
      tipo: 'clientes',
      valor: 5,
      prazo: '2025-02-28',
      progresso: 2,
      status: 'em_andamento',
    },
  ]);

  const [historico] = useState<GoalHistory[]>([
    { id: '1', periodo: 'Dezembro 2024', meta: 45000, atingido: 48500, percentual: 108, tipo: 'faturamento', status: 'atingida' },
    { id: '2', periodo: 'Novembro 2024', meta: 40000, atingido: 38000, percentual: 95, tipo: 'faturamento', status: 'nao_atingida' },
    { id: '3', periodo: 'Outubro 2024', meta: 40000, atingido: 42000, percentual: 105, tipo: 'faturamento', status: 'atingida' },
    { id: '4', periodo: 'Setembro 2024', meta: 35000, atingido: 36500, percentual: 104, tipo: 'faturamento', status: 'atingida' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CustomGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    nome: '',
    tipo: 'pedidos' as const,
    valor: 0,
    prazo: '',
  });

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'faturamento': return <DollarSign className="w-4 h-4" />;
      case 'pedidos': return <ShoppingBag className="w-4 h-4" />;
      case 'clientes': return <Users className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'faturamento': return 'Faturamento';
      case 'pedidos': return 'Pedidos';
      case 'clientes': return 'Clientes';
      default: return tipo;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Em Andamento</Badge>;
      case 'concluida':
      case 'atingida':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Atingida</Badge>;
      case 'nao_atingida':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Não Atingida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddGoal = () => {
    if (!newGoal.nome || !newGoal.valor || !newGoal.prazo) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const goal: CustomGoal = {
      id: Date.now().toString(),
      ...newGoal,
      progresso: 0,
      status: 'em_andamento',
    };

    setMetas([...metas, goal]);
    setNewGoal({ nome: '', tipo: 'pedidos', valor: 0, prazo: '' });
    setModalOpen(false);
    toast({ title: 'Meta criada com sucesso!' });
  };

  const handleDeleteGoal = (id: string) => {
    setMetas(metas.filter(m => m.id !== id));
    toast({ title: 'Meta removida' });
  };

  const handleSave = () => {
    const config = {
      meta_mensal: {
        valor: metaMensal.valor,
        tipo: metaMensal.tipo,
        mes: format(new Date(), 'yyyy-MM'),
      },
      metas_personalizadas: metas,
      notificacoes,
      canais,
    };
    console.log('Salvando configurações de metas:', config);
    toast({ title: 'Configurações de metas salvas!' });
  };

  // Calcular progresso da meta mensal (mock)
  const progressoMensal = 45000;
  const percentualMensal = Math.round((progressoMensal / metaMensal.valor) * 100);

  return (
    <div className="space-y-6">
      {/* Header com botão salvar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Metas</h2>
          <p className="text-muted-foreground">Defina e acompanhe suas metas de negócio</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meta Mensal - Destaque */}
        <Card className="lg:col-span-2 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Meta Mensal
              <Badge variant="outline" className="ml-2 capitalize">{mesAtual}</Badge>
            </CardTitle>
            <CardDescription>Objetivo principal do mês atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor da Meta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input 
                    type="number"
                    value={metaMensal.valor}
                    onChange={(e) => setMetaMensal({ ...metaMensal, valor: Number(e.target.value) })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={metaMensal.tipo} 
                  onValueChange={(val) => setMetaMensal({ ...metaMensal, tipo: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faturamento">Faturamento</SelectItem>
                    <SelectItem value="pedidos">Pedidos</SelectItem>
                    <SelectItem value="clientes">Novos Clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Progresso Visual */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso Atual</span>
                <span className="text-2xl font-bold text-primary">{percentualMensal}%</span>
              </div>
              <Progress value={percentualMensal} className="h-4" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Atingido: <strong className="text-foreground">{formatCurrency(progressoMensal)}</strong>
                </span>
                <span className="text-muted-foreground">
                  Meta: <strong className="text-foreground">{formatCurrency(metaMensal.valor)}</strong>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Faltam <strong className="text-primary">{formatCurrency(metaMensal.valor - progressoMensal)}</strong> para atingir a meta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>Avisar quando atingir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={notificacoes['50']}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, '50': !!checked })}
                />
                <Label className="cursor-pointer">50% atingido</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={notificacoes['75']}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, '75': !!checked })}
                />
                <Label className="cursor-pointer">75% atingido</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={notificacoes['100']}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, '100': !!checked })}
                />
                <Label className="cursor-pointer">100% atingido</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={notificacoes.naoAtingida}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, naoAtingida: !!checked })}
                />
                <Label className="cursor-pointer">Meta não atingida</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Canais</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={canais.email}
                    onCheckedChange={(checked) => setCanais({ ...canais, email: !!checked })}
                  />
                  <Label className="cursor-pointer">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={canais.whatsapp}
                    onCheckedChange={(checked) => setCanais({ ...canais, whatsapp: !!checked })}
                  />
                  <Label className="cursor-pointer">WhatsApp</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={canais.dashboard}
                    onCheckedChange={(checked) => setCanais({ ...canais, dashboard: !!checked })}
                  />
                  <Label className="cursor-pointer">Dashboard</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metas Personalizadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Metas Personalizadas
            </CardTitle>
            <CardDescription>Crie metas específicas para seu negócio</CardDescription>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </CardHeader>
        <CardContent>
          {metas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma meta personalizada criada</p>
              <Button variant="outline" className="mt-4" onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {metas.map(meta => {
                const percentual = Math.round((meta.progresso / meta.valor) * 100);
                return (
                  <Card key={meta.id} className="border bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(meta.tipo)}
                          <span className="font-medium">{meta.nome}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteGoal(meta.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{meta.progresso} de {meta.valor}</span>
                        </div>
                        <Progress value={percentual} className="h-2" />
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(meta.prazo), 'dd/MM/yyyy')}
                          </div>
                          {getStatusBadge(meta.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Histórico de Metas
          </CardTitle>
          <CardDescription>Acompanhe o desempenho dos meses anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Atingido</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.periodo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(h.tipo)}
                      {getTypeLabel(h.tipo)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(h.meta)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.atingido)}</TableCell>
                  <TableCell className="text-right">
                    <span className={h.percentual >= 100 ? 'text-green-500' : 'text-red-500'}>
                      {h.percentual}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {h.status === 'atingida' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Nova Meta */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
            <DialogDescription>
              Crie uma meta personalizada para acompanhar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Meta</Label>
              <Input 
                placeholder="Ex: Fechar 10 projetos"
                value={newGoal.nome}
                onChange={(e) => setNewGoal({ ...newGoal, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={newGoal.tipo} 
                  onValueChange={(val) => setNewGoal({ ...newGoal, tipo: val as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faturamento">Faturamento</SelectItem>
                    <SelectItem value="pedidos">Pedidos</SelectItem>
                    <SelectItem value="clientes">Novos Clientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor Objetivo</Label>
                <Input 
                  type="number"
                  placeholder="10"
                  value={newGoal.valor || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, valor: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input 
                type="date"
                value={newGoal.prazo}
                onChange={(e) => setNewGoal({ ...newGoal, prazo: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
