import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileDown, QrCode } from 'lucide-react';
import { formatCurrency, formatDate, downloadBudgetPDF } from '@/lib/budget-pdf';
import type { BudgetWithLines } from '@/types/budget';
import { useBudgetSettings } from '@/hooks/useBudgets';
import { PixGeneratorModal } from '@/components/pix/PixGeneratorModal';

interface BudgetViewModalProps {
  budget: BudgetWithLines | null;
  open: boolean;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Recusado',
  expired: 'Expirado',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  expired: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function BudgetViewModal({ budget, open, onClose }: BudgetViewModalProps) {
  const { settings } = useBudgetSettings();
  const [pixModalOpen, setPixModalOpen] = useState(false);

  if (!budget) return null;

  const handleDownload = () => {
    downloadBudgetPDF(budget, settings);
  };

  const canGeneratePix = budget.status === 'approved';

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Orçamento {budget.budget_number}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusColors[budget.status]}>
                  {statusLabels[budget.status]}
                </Badge>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                {canGeneratePix && (
                  <Button 
                    size="sm" 
                    onClick={() => setPixModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerar PIX
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Dados do Orçamento</h3>
                <p className="text-sm">Data: {formatDate(budget.date)}</p>
                <p className="text-sm">Validade: {budget.validity_days} dias</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Cliente</h3>
                <p className="font-medium">{budget.client_name}</p>
                {budget.client_document && <p className="text-sm text-muted-foreground">{budget.client_document}</p>}
                {budget.client_email && <p className="text-sm text-muted-foreground">{budget.client_email}</p>}
                {budget.client_phone && <p className="text-sm text-muted-foreground">{budget.client_phone}</p>}
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Itens</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">Descrição</th>
                      <th className="text-right p-2 w-16">Qtd</th>
                      <th className="text-right p-2 w-24">Unit.</th>
                      <th className="text-right p-2 w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.lines.map((line) => (
                      <tr key={line.id} className="border-t">
                        <td className="p-2">
                          {line.description}
                          {line.discount_value > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({line.discount_type === 'percent' ? `${line.discount_value}%` : formatCurrency(line.discount_value)} desc.)
                            </span>
                          )}
                        </td>
                        <td className="text-right p-2">{line.quantity}</td>
                        <td className="text-right p-2">{formatCurrency(line.unit_price)}</td>
                        <td className="text-right p-2 font-medium">{formatCurrency(line.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(budget.subtotal)}</span>
                </div>
                {budget.global_discount_value > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Desconto {budget.global_discount_type === 'percent' ? `(${budget.global_discount_value}%)` : ''}
                    </span>
                    <span>
                      -{formatCurrency(
                        budget.global_discount_type === 'percent'
                          ? budget.subtotal * (budget.global_discount_value / 100)
                          : budget.global_discount_value
                      )}
                    </span>
                  </div>
                )}
                {budget.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Frete/Taxas</span>
                    <span>{formatCurrency(budget.shipping)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(budget.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {budget.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Observações</h3>
                <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{budget.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Generator Modal */}
      <PixGeneratorModal
        open={pixModalOpen}
        onOpenChange={setPixModalOpen}
        totalAmount={budget.total}
        documentNumber={budget.budget_number}
        documentType="orcamento"
        clientName={budget.client_name}
      />
    </>
  );
}
