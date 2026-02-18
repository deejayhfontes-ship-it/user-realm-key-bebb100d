import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, RefreshCw, Loader2, Trash2, AlertTriangle, Bot } from 'lucide-react';
import { formatCurrency } from '@/lib/budget-pdf';
import type { CatalogItem } from '@/types/budget';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SuggestedItem {
  id: string;
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  selected: boolean;
  is_new_catalog_item: boolean;
}

interface AIBudgetGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  catalogItems: CatalogItem[];
  onApplyItems: (items: Array<{
    catalog_item_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    discount_type: 'fixed' | 'percent';
    discount_value: number;
    total: number;
  }>) => void;
}

export function AIBudgetGeneratorModal({
  open,
  onClose,
  catalogItems,
  onApplyItems
}: AIBudgetGeneratorModalProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [providerName, setProviderName] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);

  // Form state
  const [description, setDescription] = useState('');
  const [totalValue, setTotalValue] = useState('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);

  const generateSuggestions = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setAiError(null);
    setAiNotes('');

    try {
      // Preparar catálogo simplificado para enviar (evitar payload grande)
      const simplifiedCatalog = catalogItems
        .filter(i => i.is_active)
        .map(i => ({
          id: i.id,
          name: i.name,
          description: i.description,
          default_price: i.default_price,
          unit: i.unit,
          is_active: true,
        }));

      const { data, error } = await supabase.functions.invoke('ai-budget', {
        body: {
          description: description.trim(),
          totalValue: totalValue ? parseFloat(totalValue) : null,
          catalogItems: simplifiedCatalog,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        setAiError('Erro ao conectar com a IA. Verifique se há um provedor ativo em Configurações > AI Providers.');
        return;
      }

      if (!data.success) {
        setAiError(data.error || 'A IA não conseguiu gerar itens. Tente reformular a descrição.');
        return;
      }

      // Mapear resposta da IA para o formato do modal
      const aiItems: SuggestedItem[] = (data.items || []).map((item: {
        catalog_item_id: string | null;
        description: string;
        quantity: number;
        unit_price: number;
        is_new_catalog_item: boolean;
      }, index: number) => ({
        id: `ai-${index}`,
        catalog_item_id: item.catalog_item_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        selected: true,
        is_new_catalog_item: item.is_new_catalog_item || false,
      }));

      if (aiItems.length === 0) {
        setAiError('A IA não encontrou itens compatíveis. Tente uma descrição mais detalhada.');
        return;
      }

      setSuggestions(aiItems);
      setAiNotes(data.notes || '');
      setProviderName(data.provider || '');
      setProcessingTime(data.processingTime || 0);
      setStep('preview');

    } catch (err) {
      console.error('AI Budget error:', err);
      setAiError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSuggestions(prev => prev.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateSuggestionQuantity = (id: string, quantity: number) => {
    setSuggestions(prev => prev.map(item =>
      item.id === id
        ? { ...item, quantity, total: quantity * item.unit_price }
        : item
    ));
  };

  const updateSuggestionPrice = (id: string, unit_price: number) => {
    setSuggestions(prev => prev.map(item =>
      item.id === id
        ? { ...item, unit_price, total: item.quantity * unit_price }
        : item
    ));
  };

  const removeSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(item => item.id !== id));
  };

  const handleApply = () => {
    const selectedItems = suggestions
      .filter(s => s.selected)
      .map(s => ({
        catalog_item_id: s.catalog_item_id,
        description: s.description,
        quantity: s.quantity,
        unit_price: s.unit_price,
        discount_type: 'fixed' as const,
        discount_value: 0,
        total: s.total,
      }));

    onApplyItems(selectedItems);
    handleClose();
  };

  const handleClose = () => {
    setStep('input');
    setDescription('');
    setTotalValue('');
    setSuggestions([]);
    setAiError(null);
    setAiNotes('');
    setProviderName('');
    setProcessingTime(0);
    onClose();
  };

  const handleRegenerate = () => {
    setStep('input');
    setSuggestions([]);
    setAiError(null);
  };

  const selectedTotal = suggestions
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.total, 0);

  const newCatalogItems = suggestions.filter(s => s.is_new_catalog_item && s.selected);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistente de Orçamento IA
          </DialogTitle>
          <DialogDescription>
            {step === 'input'
              ? 'Descreva o projeto e a IA analisará e sugirá os itens do orçamento'
              : 'Revise e ajuste os itens sugeridos pela IA'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Projeto *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: O cliente precisa de 1 logo completa, 10 posts para Instagram, 5 stories animados e 1 banner para o site. O projeto é para uma clínica de estética."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor Total Estimado (opcional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="Deixe em branco para usar preços de tabela"
                  className="pl-10"
                />
              </div>
            </div>

            {aiError && (
              <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">{aiError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={generateSuggestions}
                disabled={!description.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Orçamento
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Provider badge */}
            {providerName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bot className="h-3.5 w-3.5" />
                <span>Gerado por {providerName} em {(processingTime / 1000).toFixed(1)}s</span>
              </div>
            )}

            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum item sugerido.</p>
                <p className="text-sm">Tente uma descrição diferente.</p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${item.selected ? 'border-primary/30 bg-primary/5' : 'border-border opacity-60'
                        }`}
                    >
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.catalog_item_id ? (
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Catálogo</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Novo</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateSuggestionQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateSuggestionPrice(item.id, parseFloat(e.target.value || '0'))}
                          className="w-24 text-right"
                        />
                        <span className="text-sm font-medium w-24 text-right">
                          {formatCurrency(item.total)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeSuggestion(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Notes */}
                {aiNotes && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Observações da IA:</p>
                    <p>{aiNotes}</p>
                  </div>
                )}

                {/* New items notice */}
                {newCatalogItems.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <p className="font-medium">📦 {newCatalogItems.length} item(s) novo(s): itens marcados como "Novo" não estão no catálogo e serão adicionados como item manual.</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Total sugerido:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(selectedTotal)}
                  </span>
                </div>
              </>
            )}

            <div className="flex flex-wrap justify-between gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Gerar Novamente
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={suggestions.filter(s => s.selected).length === 0}
                >
                  Aplicar Selecionados
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
