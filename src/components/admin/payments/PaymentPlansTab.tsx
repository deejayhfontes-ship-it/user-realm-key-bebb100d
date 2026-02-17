import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Star, CreditCard } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface PaymentPlan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval: string;
  credits_included: number;
  features: Json;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export default function PaymentPlansTab() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceReais, setPriceReais] = useState('');
  const [credits, setCredits] = useState('');
  const [interval, setInterval] = useState<'month' | 'year' | 'one_time'>('month');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriceReais('');
    setCredits('');
    setInterval('month');
    setFeatures('');
    setIsActive(true);
    setIsFeatured(false);
    setEditingPlan(null);
  };

  const openNewModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (plan: PaymentPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description || '');
    setPriceReais((plan.price_cents / 100).toFixed(2));
    setCredits(plan.credits_included.toString());
    setInterval(plan.interval as 'month' | 'year' | 'one_time');
    const featuresArray = Array.isArray(plan.features) ? plan.features : [];
    setFeatures(featuresArray.join('\n'));
    setIsActive(plan.is_active);
    setIsFeatured(plan.is_featured);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !priceReais || !credits) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const priceCents = Math.round(parseFloat(priceReais) * 100);
      const featuresArray = features.split('\n').filter(f => f.trim());

      const planData = {
        name,
        description: description || null,
        price_cents: priceCents,
        credits_included: parseInt(credits),
        interval,
        features: featuresArray,
        is_active: isActive,
        is_featured: isFeatured,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('payment_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Plano atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('payment_plans')
          .insert({
            ...planData,
            sort_order: plans.length + 1,
          });

        if (error) throw error;
        toast.success('Plano criado com sucesso!');
      }

      setModalOpen(false);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('payment_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Plano excluído com sucesso!');
      loadPlans();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir plano');
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const intervalLabels: Record<string, string> = {
    month: 'Mensal',
    year: 'Anual',
    one_time: 'Único',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Planos de Preço
            </CardTitle>
            <CardDescription>
              Gerencie os planos que aparecem na landing page
            </CardDescription>
          </div>
          <Button onClick={openNewModal}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {plan.name}
                      {plan.is_featured && (
                        <Badge variant="default" className="bg-primary">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(plan.price_cents)}</TableCell>
                  <TableCell>{plan.credits_included}</TableCell>
                  <TableCell>{intervalLabels[plan.interval]}</TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(plan)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum plano cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Novo/Editar Plano */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Atualize as informações do plano' : 'Preencha os dados do novo plano'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do plano *</Label>
              <Input
                id="name"
                placeholder="Ex: Starter, Pro, Enterprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição curta do plano"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="97.00"
                  value={priceReais}
                  onChange={(e) => setPriceReais(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Créditos *</Label>
                <Input
                  id="credits"
                  type="number"
                  placeholder="100"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recorrência *</Label>
              <Select value={interval} onValueChange={(v) => setInterval(v as 'month' | 'year' | 'one_time')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                  <SelectItem value="one_time">Pagamento Único</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (uma por linha)</Label>
              <Textarea
                id="features"
                placeholder="100 créditos/mês&#10;Suporte por email&#10;Templates básicos"
                rows={4}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Plano ativo</Label>
                <p className="text-xs text-muted-foreground">Visível na landing page</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Plano destacado</Label>
                <p className="text-xs text-muted-foreground">Badge "Mais popular"</p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPlan ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
