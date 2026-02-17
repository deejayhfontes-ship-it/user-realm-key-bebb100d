<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Search, FileDown, Save, Sparkles, Loader2 } from 'lucide-react';
import { useCatalogItems, useBudgets, useBudgetSettings } from '@/hooks/useBudgets';
import { formatCurrency, downloadBudgetPDF } from '@/lib/budget-pdf';
import type { Budget, NewBudgetLine, BudgetWithLines } from '@/types/budget';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface BudgetFormProps {
  editingBudget?: BudgetWithLines | null;
  onSaved?: () => void;
}

export function BudgetForm({ editingBudget, onSaved }: BudgetFormProps) {
  const { items: catalogItems } = useCatalogItems();
  const { createBudget, updateBudget, fetchBudgetWithLines } = useBudgets();
  const { settings, saveSettings } = useBudgetSettings();
  const [saving, setSaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showFontesLogo, setShowFontesLogo] = useState(settings?.show_fontes_logo ?? false);
  const [showCriateLogo, setShowCriateLogo] = useState(settings?.show_criate_logo ?? false);

  // PDF display options
  const [showItemPrices, setShowItemPrices] = useState(true);
  const [showItemTotals, setShowItemTotals] = useState(true);
  const [showTotals, setShowTotals] = useState(true);

  // Sync logo settings when settings load
  useEffect(() => {
    if (settings) {
      setShowFontesLogo(settings.show_fontes_logo ?? false);
      setShowCriateLogo(settings.show_criate_logo ?? false);
    }
  }, [settings]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    validity_days: 7,
    client_name: '',
    client_document: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    notes: '',
    global_discount_type: 'fixed' as 'fixed' | 'percent',
    global_discount_value: 0,
    shipping: 0,
  });

  const [lines, setLines] = useState<NewBudgetLine[]>([]);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        date: editingBudget.date,
        validity_days: editingBudget.validity_days,
        client_name: editingBudget.client_name,
        client_document: editingBudget.client_document || '',
        client_email: editingBudget.client_email || '',
        client_phone: editingBudget.client_phone || '',
        client_address: editingBudget.client_address || '',
        notes: editingBudget.notes || '',
        global_discount_type: editingBudget.global_discount_type as 'fixed' | 'percent',
        global_discount_value: editingBudget.global_discount_value,
        shipping: editingBudget.shipping,
      });
      setLines(editingBudget.lines.map(l => ({
        catalog_item_id: l.catalog_item_id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        discount_type: l.discount_type,
        discount_value: l.discount_value,
        total: l.total,
      })));
    }
  }, [editingBudget]);

  const calculateLineTotal = (line: NewBudgetLine): number => {
    const gross = line.quantity * line.unit_price;
    if (line.discount_type === 'percent') {
      return gross * (1 - line.discount_value / 100);
    }
    return gross - line.discount_value;
  };

  const updateLine = (index: number, updates: Partial<NewBudgetLine>) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], ...updates };
      newLines[index].total = calculateLineTotal(newLines[index]);
      return newLines;
    });
  };

  const addFromCatalog = (itemId: string) => {
    const item = catalogItems.find(i => i.id === itemId);
    if (!item) return;

    const newLine: NewBudgetLine = {
      catalog_item_id: item.id,
      description: item.name,
      quantity: 1,
      unit_price: item.default_price,
      discount_type: 'fixed',
      discount_value: 0,
      total: item.default_price,
    };
    setLines(prev => [...prev, newLine]);
    setSearchOpen(false);
  };

  const addManualLine = () => {
    const newLine: NewBudgetLine = {
      catalog_item_id: null,
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_type: 'fixed',
      discount_value: 0,
      total: 0,
    };
    setLines(prev => [...prev, newLine]);
  };

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleAIProcess = async () => {
    if (!aiText.trim()) {
      toast.error('Cole o texto do orçamento antes de processar');
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-budget', {
        body: { text: aiText.trim() },
      });

      if (error) {
        toast.error('Erro ao processar: ' + error.message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.items && data.items.length > 0) {
        const newLines: NewBudgetLine[] = data.items.map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
          catalog_item_id: null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: 'fixed' as const,
          discount_value: 0,
          total: item.total,
        }));
        setLines(prev => [...prev, ...newLines]);
        setAiText('');
        const savedMsg = data.savedToCatalog > 0 ? ` | ${data.savedToCatalog} salvo(s) no catálogo` : '';
        toast.success(`${newLines.length} item(s) adicionado(s)${savedMsg}`);
      } else {
        toast.error('Nenhum item encontrado no texto');
      }
    } catch (err) {
      console.error('AI process error:', err);
      toast.error('Erro inesperado ao processar com IA');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle logo toggle changes
  const handleLogoToggle = async (type: 'fontes' | 'criate', value: boolean) => {
    if (type === 'fontes') {
      setShowFontesLogo(value);
      await saveSettings({ show_fontes_logo: value });
    } else {
      setShowCriateLogo(value);
      await saveSettings({ show_criate_logo: value });
    }
  };

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const discountAmount = formData.global_discount_type === 'percent'
    ? subtotal * (formData.global_discount_value / 100)
    : formData.global_discount_value;
  const total = subtotal - discountAmount + formData.shipping;

  const handleSave = async (generatePdf = false) => {
    if (!formData.client_name) {
      toast.error('Informe o nome do cliente');
      return;
    }
    if (lines.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    setSaving(true);
    try {
      const budgetData: Partial<Budget> = {
        date: formData.date,
        validity_days: formData.validity_days,
        client_name: formData.client_name,
        client_document: formData.client_document || null,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone || null,
        client_address: formData.client_address || null,
        notes: formData.notes || null,
        global_discount_type: formData.global_discount_type,
        global_discount_value: formData.global_discount_value,
        shipping: formData.shipping,
        subtotal,
        total,
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData, lines);
        if (generatePdf) {
          const updated = await fetchBudgetWithLines(editingBudget.id);
          if (updated) downloadBudgetPDF(updated, settings, { showItemPrices, showItemTotals, showTotals });
        }
      } else {
        const newBudget = await createBudget(budgetData, lines);
        if (generatePdf && newBudget) {
          const full = await fetchBudgetWithLines(newBudget.id);
          if (full) downloadBudgetPDF(full, settings, { showItemPrices, showItemTotals, showTotals });
        }
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          validity_days: 7,
          client_name: '',
          client_document: '',
          client_email: '',
          client_phone: '',
          client_address: '',
          notes: '',
          global_discount_type: 'fixed',
          global_discount_value: 0,
          shipping: 0,
        });
        setLines([]);
      }

      onSaved?.();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const activeItems = catalogItems.filter(i => i.is_active);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Budget Info */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Dados do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Validade (dias)</Label>
                <Input
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 7 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome/Razão Social *</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input
                  value={formData.client_document}
                  onChange={(e) => setFormData({ ...formData, client_document: e.target.value })}
                  placeholder="Documento"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.client_address}
                onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Importar com IA */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Importar com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder={`Cole aqui os itens do orçamento...\n\nExemplo:\nFlyer dos DJs (8): R$ 1.240,00\n4 tipos de flyer final: R$ 760,00\n10 flyers eletrônicos: R$ 1.000,00\nLogo marca: R$ 2.500,00`}
            rows={6}
            disabled={aiLoading}
          />
          <Button
            onClick={handleAIProcess}
            disabled={aiLoading || !aiText.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {aiLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Processar e Adicionar Itens</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            A IA irá extrair descrição, quantidade, valor unitário e total. Os itens também serão salvos no catálogo.
          </p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Itens do Orçamento</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Catálogo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Buscar item..." />
                    <CommandList>
                      <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                      <CommandGroup>
                        {activeItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => addFromCatalog(item.id)}
                          >
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(item.default_price)} / {item.unit}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={addManualLine}>
                <Plus className="h-4 w-4 mr-2" />
                Manual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="border border-dashed border-primary/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Adicione itens do catálogo ou manualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="border border-primary/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(index, { description: e.target.value })}
                        placeholder="Descrição do item"
                        className="font-medium"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, { quantity: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.unit_price}
                        onChange={(e) => updateLine(index, { unit_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Desc. Tipo</Label>
                      <Select
                        value={line.discount_type}
                        onValueChange={(v) => updateLine(index, { discount_type: v as 'fixed' | 'percent' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">R$</SelectItem>
                          <SelectItem value="percent">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Desconto</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.discount_value}
                        onChange={(e) => updateLine(index, { discount_value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="h-10 flex items-center px-3 bg-muted rounded-md font-medium">
                        {formatCurrency(line.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Condições, prazo de entrega, forma de pagamento..."
              rows={5}
            />
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Totais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={formData.global_discount_type}
                onValueChange={(v) => setFormData({ ...formData, global_discount_type: v as 'fixed' | 'percent' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">R$</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.global_discount_value}
                onChange={(e) => setFormData({ ...formData, global_discount_value: parseFloat(e.target.value) || 0 })}
                placeholder="Desconto"
                className="col-span-2"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Frete/Taxas</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.shipping}
                onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="border-t pt-4 flex justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Options */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Opções do PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Exibição de Valores</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showItemPrices}
                  onCheckedChange={setShowItemPrices}
                />
                <Label className="text-sm">Preço unitário</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showItemTotals}
                  onCheckedChange={setShowItemTotals}
                />
                <Label className="text-sm">Total por item</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showTotals}
                  onCheckedChange={setShowTotals}
                />
                <Label className="text-sm">Subtotal e descontos</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              O valor total final sempre será exibido. Desative as opções para mostrar apenas itens e quantidades.
            </p>
          </div>

          {/* Logo options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Logos de Parceiros</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showFontesLogo}
                  onCheckedChange={(v) => handleLogoToggle('fontes', v)}
                />
                <Label className="text-sm">Fontes Graphics</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showCriateLogo}
                  onCheckedChange={(v) => handleLogoToggle('criate', v)}
                />
                <Label className="text-sm">Criate</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving} className="bg-primary text-primary-foreground">
          <FileDown className="h-4 w-4 mr-2" />
          Salvar e Gerar PDF
        </Button>
      </div>


    </div>
  );
}
=======
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Search, FileDown, Save, Sparkles, Loader2 } from 'lucide-react';
import { useCatalogItems, useBudgets, useBudgetSettings } from '@/hooks/useBudgets';
import { formatCurrency, downloadBudgetPDF } from '@/lib/budget-pdf';
import type { Budget, NewBudgetLine, BudgetWithLines } from '@/types/budget';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface BudgetFormProps {
  editingBudget?: BudgetWithLines | null;
  onSaved?: () => void;
}

export function BudgetForm({ editingBudget, onSaved }: BudgetFormProps) {
  const { items: catalogItems } = useCatalogItems();
  const { createBudget, updateBudget, fetchBudgetWithLines } = useBudgets();
  const { settings, saveSettings } = useBudgetSettings();
  const [saving, setSaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showFontesLogo, setShowFontesLogo] = useState(settings?.show_fontes_logo ?? false);
  const [showCriateLogo, setShowCriateLogo] = useState(settings?.show_criate_logo ?? false);

  // PDF display options
  const [showItemPrices, setShowItemPrices] = useState(true);
  const [showItemTotals, setShowItemTotals] = useState(true);
  const [showTotals, setShowTotals] = useState(true);

  // Sync logo settings when settings load
  useEffect(() => {
    if (settings) {
      setShowFontesLogo(settings.show_fontes_logo ?? false);
      setShowCriateLogo(settings.show_criate_logo ?? false);
    }
  }, [settings]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    validity_days: 7,
    client_name: '',
    client_document: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    notes: '',
    global_discount_type: 'fixed' as 'fixed' | 'percent',
    global_discount_value: 0,
    shipping: 0,
  });

  const [lines, setLines] = useState<NewBudgetLine[]>([]);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        date: editingBudget.date,
        validity_days: editingBudget.validity_days,
        client_name: editingBudget.client_name,
        client_document: editingBudget.client_document || '',
        client_email: editingBudget.client_email || '',
        client_phone: editingBudget.client_phone || '',
        client_address: editingBudget.client_address || '',
        notes: editingBudget.notes || '',
        global_discount_type: editingBudget.global_discount_type as 'fixed' | 'percent',
        global_discount_value: editingBudget.global_discount_value,
        shipping: editingBudget.shipping,
      });
      setLines(editingBudget.lines.map(l => ({
        catalog_item_id: l.catalog_item_id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        discount_type: l.discount_type,
        discount_value: l.discount_value,
        total: l.total,
      })));
    }
  }, [editingBudget]);

  const calculateLineTotal = (line: NewBudgetLine): number => {
    const gross = line.quantity * line.unit_price;
    if (line.discount_type === 'percent') {
      return gross * (1 - line.discount_value / 100);
    }
    return gross - line.discount_value;
  };

  const updateLine = (index: number, updates: Partial<NewBudgetLine>) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], ...updates };
      newLines[index].total = calculateLineTotal(newLines[index]);
      return newLines;
    });
  };

  const addFromCatalog = (itemId: string) => {
    const item = catalogItems.find(i => i.id === itemId);
    if (!item) return;

    const newLine: NewBudgetLine = {
      catalog_item_id: item.id,
      description: item.name,
      quantity: 1,
      unit_price: item.default_price,
      discount_type: 'fixed',
      discount_value: 0,
      total: item.default_price,
    };
    setLines(prev => [...prev, newLine]);
    setSearchOpen(false);
  };

  const addManualLine = () => {
    const newLine: NewBudgetLine = {
      catalog_item_id: null,
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_type: 'fixed',
      discount_value: 0,
      total: 0,
    };
    setLines(prev => [...prev, newLine]);
  };

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleAIProcess = async () => {
    if (!aiText.trim()) {
      toast.error('Cole o texto do orçamento antes de processar');
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-budget', {
        body: { text: aiText.trim() },
      });

      if (error) {
        toast.error('Erro ao processar: ' + error.message);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.items && data.items.length > 0) {
        const newLines: NewBudgetLine[] = data.items.map((item: { description: string; quantity: number; unit_price: number; total: number }) => ({
          catalog_item_id: null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: 'fixed' as const,
          discount_value: 0,
          total: item.total,
        }));
        setLines(prev => [...prev, ...newLines]);
        setAiText('');
        const savedMsg = data.savedToCatalog > 0 ? ` | ${data.savedToCatalog} salvo(s) no catálogo` : '';
        toast.success(`${newLines.length} item(s) adicionado(s)${savedMsg}`);
      } else {
        toast.error('Nenhum item encontrado no texto');
      }
    } catch (err) {
      console.error('AI process error:', err);
      toast.error('Erro inesperado ao processar com IA');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle logo toggle changes
  const handleLogoToggle = async (type: 'fontes' | 'criate', value: boolean) => {
    if (type === 'fontes') {
      setShowFontesLogo(value);
      await saveSettings({ show_fontes_logo: value });
    } else {
      setShowCriateLogo(value);
      await saveSettings({ show_criate_logo: value });
    }
  };

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const discountAmount = formData.global_discount_type === 'percent'
    ? subtotal * (formData.global_discount_value / 100)
    : formData.global_discount_value;
  const total = subtotal - discountAmount + formData.shipping;

  const handleSave = async (generatePdf = false) => {
    if (!formData.client_name) {
      toast.error('Informe o nome do cliente');
      return;
    }
    if (lines.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    setSaving(true);
    try {
      const budgetData: Partial<Budget> = {
        date: formData.date,
        validity_days: formData.validity_days,
        client_name: formData.client_name,
        client_document: formData.client_document || null,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone || null,
        client_address: formData.client_address || null,
        notes: formData.notes || null,
        global_discount_type: formData.global_discount_type,
        global_discount_value: formData.global_discount_value,
        shipping: formData.shipping,
        subtotal,
        total,
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData, lines);
        if (generatePdf) {
          const updated = await fetchBudgetWithLines(editingBudget.id);
          if (updated) downloadBudgetPDF(updated, settings, { showItemPrices, showItemTotals, showTotals });
        }
      } else {
        const newBudget = await createBudget(budgetData, lines);
        if (generatePdf && newBudget) {
          const full = await fetchBudgetWithLines(newBudget.id);
          if (full) downloadBudgetPDF(full, settings, { showItemPrices, showItemTotals, showTotals });
        }
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          validity_days: 7,
          client_name: '',
          client_document: '',
          client_email: '',
          client_phone: '',
          client_address: '',
          notes: '',
          global_discount_type: 'fixed',
          global_discount_value: 0,
          shipping: 0,
        });
        setLines([]);
      }

      onSaved?.();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const activeItems = catalogItems.filter(i => i.is_active);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Budget Info */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Dados do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Validade (dias)</Label>
                <Input
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 7 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome/Razão Social *</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input
                  value={formData.client_document}
                  onChange={(e) => setFormData({ ...formData, client_document: e.target.value })}
                  placeholder="Documento"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.client_address}
                onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Importar com IA */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Importar com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder={`Cole aqui os itens do orçamento...\n\nExemplo:\nFlyer dos DJs (8): R$ 1.240,00\n4 tipos de flyer final: R$ 760,00\n10 flyers eletrônicos: R$ 1.000,00\nLogo marca: R$ 2.500,00`}
            rows={6}
            disabled={aiLoading}
          />
          <Button
            onClick={handleAIProcess}
            disabled={aiLoading || !aiText.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {aiLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Processar e Adicionar Itens</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            A IA irá extrair descrição, quantidade, valor unitário e total. Os itens também serão salvos no catálogo.
          </p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Itens do Orçamento</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Catálogo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Buscar item..." />
                    <CommandList>
                      <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                      <CommandGroup>
                        {activeItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => addFromCatalog(item.id)}
                          >
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(item.default_price)} / {item.unit}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={addManualLine}>
                <Plus className="h-4 w-4 mr-2" />
                Manual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="border border-dashed border-primary/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Adicione itens do catálogo ou manualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="border border-primary/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(index, { description: e.target.value })}
                        placeholder="Descrição do item"
                        className="font-medium"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(index, { quantity: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.unit_price}
                        onChange={(e) => updateLine(index, { unit_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Desc. Tipo</Label>
                      <Select
                        value={line.discount_type}
                        onValueChange={(v) => updateLine(index, { discount_type: v as 'fixed' | 'percent' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">R$</SelectItem>
                          <SelectItem value="percent">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Desconto</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.discount_value}
                        onChange={(e) => updateLine(index, { discount_value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="h-10 flex items-center px-3 bg-muted rounded-md font-medium">
                        {formatCurrency(line.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Condições, prazo de entrega, forma de pagamento..."
              rows={5}
            />
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Totais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={formData.global_discount_type}
                onValueChange={(v) => setFormData({ ...formData, global_discount_type: v as 'fixed' | 'percent' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">R$</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.global_discount_value}
                onChange={(e) => setFormData({ ...formData, global_discount_value: parseFloat(e.target.value) || 0 })}
                placeholder="Desconto"
                className="col-span-2"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Frete/Taxas</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.shipping}
                onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="border-t pt-4 flex justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Options */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Opções do PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Exibição de Valores</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showItemPrices}
                  onCheckedChange={setShowItemPrices}
                />
                <Label className="text-sm">Preço unitário</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showItemTotals}
                  onCheckedChange={setShowItemTotals}
                />
                <Label className="text-sm">Total por item</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showTotals}
                  onCheckedChange={setShowTotals}
                />
                <Label className="text-sm">Subtotal e descontos</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              O valor total final sempre será exibido. Desative as opções para mostrar apenas itens e quantidades.
            </p>
          </div>

          {/* Logo options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Logos de Parceiros</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showFontesLogo}
                  onCheckedChange={(v) => handleLogoToggle('fontes', v)}
                />
                <Label className="text-sm">Fontes Graphics</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showCriateLogo}
                  onCheckedChange={(v) => handleLogoToggle('criate', v)}
                />
                <Label className="text-sm">Criate</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving} className="bg-primary text-primary-foreground">
          <FileDown className="h-4 w-4 mr-2" />
          Salvar e Gerar PDF
        </Button>
      </div>


    </div>
  );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
