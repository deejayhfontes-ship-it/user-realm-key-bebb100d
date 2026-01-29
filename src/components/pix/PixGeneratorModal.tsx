import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PixPayment } from './PixPayment';
import { usePixConfig } from '@/hooks/usePixConfig';
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
  const { pixConfig, isLoading } = usePixConfig();
  const [paymentOption, setPaymentOption] = useState<'total' | 'entrada' | 'custom'>('total');
  const [customAmount, setCustomAmount] = useState(0);

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

  if (!pixConfig?.enabled) {
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
              PIX não está configurado. Configure sua chave PIX para gerar códigos de pagamento.
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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

        <div className="space-y-6">
          {/* Payment Options */}
          <div className="space-y-3">
            <Label>Valor do Pagamento</Label>
            <RadioGroup value={paymentOption} onValueChange={(v) => setPaymentOption(v as any)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary/50">
                <RadioGroupItem value="total" id="total" />
                <Label htmlFor="total" className="flex-1 cursor-pointer">
                  <span className="font-medium">Total (100%)</span>
                  <span className="block text-sm text-muted-foreground">
                    R$ {(totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary/50">
                <RadioGroupItem value="entrada" id="entrada" />
                <Label htmlFor="entrada" className="flex-1 cursor-pointer">
                  <span className="font-medium">Entrada (50%)</span>
                  <span className="block text-sm text-muted-foreground">
                    R$ {(totalAmount / 200).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-secondary/50">
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
                  value={customAmount / 100}
                  onChange={(e) => setCustomAmount(Math.round(parseFloat(e.target.value || '0') * 100))}
                  className="mt-1"
                  placeholder="0,00"
                />
              </div>
            )}
          </div>

          {/* PIX Component */}
          <PixPayment
            amount={displayAmount}
            description={`${documentPrefix}${documentNumber}`}
            transactionId={`${documentPrefix}${documentNumber}`}
            showConfig
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
