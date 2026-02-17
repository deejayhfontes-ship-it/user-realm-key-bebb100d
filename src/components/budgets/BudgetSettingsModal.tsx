import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBudgetSettings } from '@/hooks/useBudgets';

interface BudgetSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function BudgetSettingsModal({ open, onClose }: BudgetSettingsModalProps) {
  const { settings, loading, saveSettings } = useBudgetSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_document: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    default_notes: '',
    show_fontes_logo: false,
    show_criate_logo: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        company_document: settings.company_document || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        default_notes: settings.default_notes || '',
        show_fontes_logo: settings.show_fontes_logo || false,
        show_criate_logo: settings.show_criate_logo || false,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Orçamento</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Minha Empresa Ltda"
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={formData.company_document}
                onChange={(e) => setFormData({ ...formData, company_document: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={formData.company_address}
                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                placeholder="Rua, número, cidade, estado"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Texto Padrão de Condições</Label>
              <Textarea
                value={formData.default_notes}
                onChange={(e) => setFormData({ ...formData, default_notes: e.target.value })}
                placeholder="Condições de pagamento, prazo de entrega..."
                rows={4}
              />
            </div>

            {/* Logo Selection */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">Logos no Rodapé do PDF</Label>
              <p className="text-sm text-muted-foreground">
                Selecione quais logos devem aparecer no rodapé do orçamento
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Fontes Graphics Logo */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.show_fontes_logo 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, show_fontes_logo: !formData.show_fontes_logo })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox 
                      checked={formData.show_fontes_logo}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, show_fontes_logo: checked === true })
                      }
                    />
                    <Label className="cursor-pointer">Fontes Graphics</Label>
                  </div>
                  <div className="h-12 flex items-center justify-center bg-muted rounded">
                    <span className="text-xs text-muted-foreground">Logo Fontes</span>
                  </div>
                </div>

                {/* Criate Logo */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.show_criate_logo 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, show_criate_logo: !formData.show_criate_logo })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox 
                      checked={formData.show_criate_logo}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, show_criate_logo: checked === true })
                      }
                    />
                    <Label className="cursor-pointer">Criate</Label>
                  </div>
                  <div className="h-12 flex items-center justify-center bg-muted rounded">
                    <span className="text-xs text-muted-foreground">Logo Criate</span>
                  </div>
                </div>
              </div>

              {(formData.show_fontes_logo || formData.show_criate_logo) && (
                <p className="text-xs text-muted-foreground">
                  {formData.show_fontes_logo && formData.show_criate_logo 
                    ? 'Ambas as logos aparecerão lado a lado no rodapé'
                    : `A logo ${formData.show_fontes_logo ? 'Fontes Graphics' : 'Criate'} aparecerá centralizada no rodapé`
                  }
                </p>
              )}
            </div>

            <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
