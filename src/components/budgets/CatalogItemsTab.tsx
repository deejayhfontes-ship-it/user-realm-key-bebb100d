import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCatalogItems } from '@/hooks/useBudgets';
import type { CatalogItem } from '@/types/budget';
import { formatCurrency } from '@/lib/budget-pdf';

interface ItemFormData {
  name: string;
  description: string;
  sku: string;
  unit: string;
  default_price: string;
  is_active: boolean;
}

const initialFormData: ItemFormData = {
  name: '',
  description: '',
  sku: '',
  unit: 'un',
  default_price: '',
  is_active: true,
};

export function CatalogItemsTab() {
  const { items, loading, createItem, updateItem, deleteItem } = useCatalogItems();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      sku: item.sku || '',
      unit: item.unit,
      default_price: String(item.default_price),
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.default_price) return;

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        sku: formData.sku || null,
        unit: formData.unit,
        default_price: parseFloat(formData.default_price.replace(',', '.')),
        is_active: formData.is_active,
      };

      if (editingItem) {
        await updateItem(editingItem.id, data);
      } else {
        await createItem(data);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CatalogItem) => {
    if (!confirm(`Excluir "${item.name}"?`)) return;
    await deleteItem(item.id);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Catálogo de Itens</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do item"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">Código/SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="un, hora, mês..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Valor Padrão (R$) *</Label>
                <Input
                  id="price"
                  value={formData.default_price}
                  onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Item Ativo</Label>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-primary/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhum item cadastrado ainda.</p>
          <Button onClick={handleOpenCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro item
          </Button>
        </div>
      ) : (
        <div className="border border-primary/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[80px]">Unidade</TableHead>
                <TableHead className="w-[120px] text-right">Valor</TableHead>
                <TableHead className="w-[80px] text-center">Ativo</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku || '-'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.default_price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.is_active 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.is_active ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
