import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/budget-pdf';
import type { CatalogItem } from '@/types/budget';

interface SuggestedItem {
  id: string;
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  selected: boolean;
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

const STYLE_OPTIONS = [
  { value: 'corporate', label: 'Corporativo' },
  { value: 'creative', label: 'Criativo/Descontraído' },
  { value: 'urgent', label: 'Urgente/Promocional' },
  { value: 'minimal', label: 'Minimalista' },
];

// Keywords mapping for smart search
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  story: ['story', 'stories', 'storie', 'insta story'],
  post: ['post', 'feed', 'publicação', 'publicacao', 'instagram'],
  carrossel: ['carrossel', 'carousel', 'carrosséis', 'carrosseis'],
  video: ['video', 'vídeo', 'motion', 'animação', 'animacao', 'reels', 'reel'],
  logo: ['logo', 'logotipo', 'logomarca', 'identidade', 'marca'],
  banner: ['banner', 'capa', 'cover', 'header'],
  arte: ['arte', 'design', 'peça', 'peca', 'material'],
  social: ['social', 'redes', 'mídia', 'midia'],
};

export function AIBudgetGeneratorModal({ 
  open, 
  onClose, 
  catalogItems, 
  onApplyItems 
}: AIBudgetGeneratorModalProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [style, setStyle] = useState('corporate');
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);

  const extractKeywords = (text: string): string[] => {
    const normalizedText = text.toLowerCase();
    const foundKeywords: string[] = [];
    
    Object.entries(KEYWORD_MAPPINGS).forEach(([key, variants]) => {
      if (variants.some(v => normalizedText.includes(v))) {
        foundKeywords.push(key);
      }
    });
    
    return foundKeywords;
  };

  const extractQuantity = (text: string): number | null => {
    // Look for patterns like "20 peças", "10 posts", "15 stories"
    const match = text.match(/(\d+)\s*(peças?|posts?|stories?|artes?|vídeos?|videos?|materiais?)/i);
    return match ? parseInt(match[1]) : null;
  };

  const findMatchingCatalogItems = (keywords: string[]): CatalogItem[] => {
    const activeItems = catalogItems.filter(item => item.is_active);
    
    if (keywords.length === 0) {
      // Return most common items if no keywords found
      return activeItems.slice(0, 4);
    }

    const matches: CatalogItem[] = [];
    
    activeItems.forEach(item => {
      const itemName = item.name.toLowerCase();
      const itemDesc = (item.description || '').toLowerCase();
      
      const isMatch = keywords.some(keyword => {
        const variants = KEYWORD_MAPPINGS[keyword] || [keyword];
        return variants.some(v => itemName.includes(v) || itemDesc.includes(v));
      });
      
      if (isMatch) {
        matches.push(item);
      }
    });

    // If no matches, return first 4 items as fallback
    return matches.length > 0 ? matches : activeItems.slice(0, 4);
  };

  const distributeItems = (
    items: CatalogItem[], 
    totalQty: number | null, 
    budget: number | null
  ): SuggestedItem[] => {
    if (items.length === 0) return [];

    // If we have a total budget, calculate quantities to fit budget
    if (budget && budget > 0) {
      const avgPrice = items.reduce((sum, i) => sum + i.default_price, 0) / items.length;
      const totalPossibleItems = Math.floor(budget / avgPrice);
      const qtyPerItem = Math.max(1, Math.floor(totalPossibleItems / items.length));
      
      return items.map((item, index) => ({
        id: `suggestion-${index}`,
        catalog_item_id: item.id,
        description: item.name,
        quantity: qtyPerItem,
        unit_price: item.default_price,
        total: qtyPerItem * item.default_price,
        selected: true,
      }));
    }

    // If we have a total quantity, distribute evenly
    if (totalQty && totalQty > 0) {
      const baseQty = Math.floor(totalQty / items.length);
      const remainder = totalQty % items.length;
      
      return items.map((item, index) => {
        const qty = baseQty + (index < remainder ? 1 : 0);
        return {
          id: `suggestion-${index}`,
          catalog_item_id: item.id,
          description: item.name,
          quantity: qty,
          unit_price: item.default_price,
          total: qty * item.default_price,
          selected: true,
        };
      });
    }

    // Default: 1 of each
    return items.map((item, index) => ({
      id: `suggestion-${index}`,
      catalog_item_id: item.id,
      description: item.name,
      quantity: 1,
      unit_price: item.default_price,
      total: item.default_price,
      selected: true,
    }));
  };

  const generateSuggestions = async () => {
    if (!description.trim()) return;

    setLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const keywords = extractKeywords(description);
      const totalQty = extractQuantity(description);
      const budget = totalValue ? parseFloat(totalValue) * 100 : null; // Convert to cents

      const matchingItems = findMatchingCatalogItems(keywords);
      const distributed = distributeItems(matchingItems, totalQty, budget);

      // If no catalog matches but description asks for something specific, add manual suggestion
      if (distributed.length === 0 && description.trim()) {
        distributed.push({
          id: 'suggestion-manual',
          catalog_item_id: null,
          description: 'Serviço personalizado (ajuste conforme necessário)',
          quantity: 1,
          unit_price: budget || 50000, // Default R$ 500 if no budget
          total: budget || 50000,
          selected: true,
        });
      }

      setSuggestions(distributed);
      setStep('preview');
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
    setStyle('corporate');
    setSuggestions([]);
    onClose();
  };

  const handleRegenerate = () => {
    generateSuggestions();
  };

  const selectedTotal = suggestions
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.total, 0);

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
              ? 'Descreva o projeto e deixe a IA distribuir os itens'
              : 'Revise e ajuste os itens sugeridos'
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
                placeholder="Ex: Campanha de lançamento de produto com 20 peças para redes sociais, incluindo stories e posts institucionais"
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

            <div className="space-y-2">
              <Label htmlFor="style">Estilo/Tom</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    Gerando...
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
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum item encontrado no catálogo.</p>
                <p className="text-sm">Tente uma descrição diferente ou adicione itens manualmente.</p>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {suggestions.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        item.selected ? 'border-primary/30 bg-primary/5' : 'border-border opacity-60'
                      }`}
                    >
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unit_price)} / un
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateSuggestionQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
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
