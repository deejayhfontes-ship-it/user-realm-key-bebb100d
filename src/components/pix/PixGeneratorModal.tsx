import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PixPayment } from '@/components/pix-payment';
import { usePixConfigs, maskPixKey, type PixKeyType } from '@/hooks/usePixConfigs';
import { QrCode, Loader2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PixGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number; // em centavos
  documentNumber: string;
  documentType: 'orcamento' | 'proposta' | 'invoice';
  clientName?: string;
}

export function PixGeneratorModal({
  open,
  onOpenChange,
  totalAmount,
  documentNumber,
  documentType,
  clientName
}: PixGeneratorModalProps) {
  const { pixConfigs, isLoading } = usePixConfigs();
  const [paymentOption, setPaymentOption] = useState<'total' | 'entrada' | 'custom'>('total');
  const [customAmount, setCustomAmount] = useState(0);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [showPixPayment, setShowPixPayment] = useState(false);

  // Find default or first enabled config
  const defaultConfig = useMemo(() => {
    if (!pixConfigs?.length) return null;
    return pixConfigs.find(c => c.is_default && c.enabled) || pixConfigs.find(c => c.enabled);
  }, [pixConfigs]);

  // Use selected or default
  const activeConfigId = selectedConfigId || defaultConfig?.id || '';

  const displayAmount = useMemo(() => {
    switch (paymentOption) {
      case 'total':
        return totalAmount;
      case 'entrada':
        return Math.round(totalAmount / 2);
      case 'custom':
        return customAmount;
      default:
        return totalAmount;
    }
  }, [paymentOption, totalAmount, customAmount]);

  const documentPrefix = useMemo(() => {
    switch (documentType) {
      case 'orcamento':
        return 'ORC';
      case 'proposta':
        return 'PROP';
      case 'invoice':
        return 'INV';
      default:
        return 'DOC';
    }
  }, [documentType]);

  const documentLabel = useMemo(() => {
    switch (documentType) {
      case 'orcamento':
        return 'Orçamento';
      case 'proposta':
        return 'Proposta';
      case 'invoice':
        return 'Fatura';
      default:
        return 'Documento';
    }
  }, [documentType]);

  const description = `${documentLabel} ${documentNumber}`;

  const handleGenerate = () => {
    setShowPixPayment(true);
  };

  const handleClose = () => {
    setShowPixPayment(false);
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const enabledConfigs = pixConfigs?.filter(c => c.enabled) || [];

  if (enabledConfigs.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Gerar PIX
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Nenhuma conta PIX configurada. Configure suas chaves PIX para gerar códigos de pagamento.
            </p>
            <Button asChild>
              <Link to="/admin/settings" onClick={() => onOpenChange(false)}>
                <Settings className="h-4 w-4 mr-2" />
                Ir para Configurações
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Gerar PIX para Cobrança
          </DialogTitle>
          <DialogDescription>
            {documentLabel} {documentNumber}
            {clientName && ` - ${clientName}`}
          </DialogDescription>
        </DialogHeader>

        {!showPixPayment ? (
          <div className="space-y-6">
            {/* Account Selection */}
            {enabledConfigs.length > 1 && (
              <div className="space-y-2">
                <Label>Conta PIX</Label>
                <Select value={activeConfigId} onValueChange={setSelectedConfigId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {enabledConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        <div className="flex items-center gap-2">
                          <span>{config.nickname}</span>
                          <span className="text-muted-foreground text-xs">
                            ({maskPixKey(config.pix_key, config.key_type as PixKeyType)})
                          </span>
                          {config.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              Padrão
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Options */}
            <div className="space-y-3">
              <Label>Valor do Pagamento</Label>
              <RadioGroup value={paymentOption} onValueChange={(v) => setPaymentOption(v as 'total' | 'entrada' | 'custom')}>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <RadioGroupItem value="total" id="total" />
                  <Label htmlFor="total" className="flex-1 cursor-pointer">
                    <span className="font-medium">Total (100%)</span>
                    <span className="block text-sm text-muted-foreground">
                      R$ {(totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <RadioGroupItem value="entrada" id="entrada" />
                  <Label htmlFor="entrada" className="flex-1 cursor-pointer">
                    <span className="font-medium">Entrada (50%)</span>
                    <span className="block text-sm text-muted-foreground">
                      R$ {(totalAmount / 200).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex-1 cursor-pointer">
                    <span className="font-medium">Valor Personalizado</span>
                  </Label>
                </div>
              </RadioGroup>

              {paymentOption === 'custom' && (
                <div className="pt-2">
                  <Label htmlFor="customAmount">Valor (R$)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={customAmount / 100 || ''}
                    onChange={(e) => setCustomAmount(Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="mt-1"
                    placeholder="0,00"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={description} disabled className="bg-muted/50" />
            </div>

            {/* Generate Button */}
            <Button onClick={handleGenerate} className="w-full" disabled={displayAmount <= 0}>
              <QrCode className="h-4 w-4 mr-2" />
              Gerar PIX
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* PIX Component */}
            <PixPayment
              amount={displayAmount}
              description={description}
              pixConfigId={activeConfigId}
              transactionId={`${documentPrefix}${documentNumber}`}
              showConfigInfo
            />

            {/* Close Button */}
            <Button variant="outline" onClick={handleClose} className="w-full">
              Concluído
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
