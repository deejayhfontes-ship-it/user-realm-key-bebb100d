import { InvoiceData, InvoiceRow } from "@/types/invoice";
import QRCode from "react-qr-code";
import { generatePixCode } from "@/lib/pix-generator";
import { useMemo } from "react";
import logoFontes from "@/assets/logo-fontes-graphics.png";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface InvoicePreviewProps {
  data: InvoiceData;
  savedPixCode?: string | null; // Pre-generated PIX code from database
  showInteractivePixPayment?: boolean; // Show copy button for PIX
}

export const InvoicePreview = ({ data, savedPixCode, showInteractivePixPayment = false }: InvoicePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const discountAmount = data.discount || 0;
  const taxAmount = ((subtotal - discountAmount) * (data.taxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  // Use saved PIX code if available, otherwise generate new one
  const pixCode = useMemo(() => {
    if (savedPixCode) return savedPixCode;
    
    if (!data.pix?.enabled || !data.pix?.pixKey || !data.pix?.merchantName || !data.pix?.merchantCity) return "";
    
    return generatePixCode({
      pixKey: data.pix.pixKey,
      merchantName: data.pix.merchantName,
      merchantCity: data.pix.merchantCity,
      amount: total > 0 ? total : undefined,
      transactionId: `INV${data.invoiceNumber}`,
      description: `Fatura ${data.invoiceNumber}`,
    });
  }, [data.pix, total, data.invoiceNumber, savedPixCode]);

  const handleCopyPixCode = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <div className="bg-white text-black p-8 rounded-xl shadow-lg max-w-4xl mx-auto" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <img src={logoFontes} alt="Fontes Graphics" className="h-14 mb-4" style={{ filter: 'invert(1) brightness(0)' }} />
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-black">Fontes Graphics Design</p>
            <p>Poços de Caldas - MG / 33.259.883/0001-08</p>
            <p>fontescampanhas@gmail.com</p>
            <p>(35) 9 91116310</p>
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="bg-lime-400 text-black p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">INVOICE (FATURA)</h1>
          <div className="text-right">
            <p className="font-bold text-lg">Nº {data.invoiceNumber}</p>
            <p className="text-sm font-medium">Data: {new Date(data.date).toLocaleDateString('pt-BR')}</p>
            {data.dueDate && <p className="text-sm font-medium">Vencimento: {new Date(data.dueDate).toLocaleDateString('pt-BR')}</p>}
          </div>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-gray-500">Bill To</h3>
          <p className="font-semibold">{data.billTo.name}</p>
          {data.billTo.company && <p className="text-sm">{data.billTo.company}</p>}
          {data.billTo.address && <p className="text-sm text-gray-600">{data.billTo.address}</p>}
          {data.billTo.email && <p className="text-sm text-gray-600">{data.billTo.email}</p>}
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-gray-500">Ship To</h3>
          <p className="font-semibold">{data.shipTo.name}</p>
          {data.shipTo.event && <p className="text-sm font-medium">{data.shipTo.event}</p>}
          {data.shipTo.location && <p className="text-sm text-gray-600">{data.shipTo.location}</p>}
          {data.shipTo.phone && <p className="text-sm text-gray-600">{data.shipTo.phone}</p>}
          {data.shipTo.email && <p className="text-sm text-gray-600">{data.shipTo.email}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 font-bold text-sm">Descrição</th>
              <th className="text-center py-2 font-bold text-sm w-24">Data</th>
              <th className="text-center py-2 font-bold text-sm w-16">Qtd</th>
              <th className="text-right py-2 font-bold text-sm w-28">Preço Unit.</th>
              <th className="text-right py-2 font-bold text-sm w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 text-sm">{item.description}</td>
                <td className="py-2 text-sm text-center">
                  {item.serviceDate ? new Date(item.serviceDate).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="py-2 text-sm text-center">{item.quantity}</td>
                <td className="py-2 text-sm text-right">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="py-2 text-sm text-right font-medium">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Desconto:</span>
              <span>-R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Taxa ({data.taxRate}%):</span>
              <span>+R$ {taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2">
            <span>TOTAL:</span>
            <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {(data.pix?.enabled || data.wise?.enabled || savedPixCode) && (
        <div className="border-t-2 border-gray-300 pt-6 mb-6">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Métodos de Pagamento</h3>
          
          {(data.pix?.enabled || savedPixCode) && pixCode && (
            <div className="flex items-start gap-6 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-2 rounded shadow-sm">
                <QRCode value={pixCode} size={120} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">PIX</p>
                {data.pix?.pixKey && (
                  <p className="text-xs text-gray-600 mb-1">Chave: {data.pix.pixKey}</p>
                )}
                {data.pix?.merchantName && (
                  <p className="text-xs text-gray-600 mb-2">Beneficiário: {data.pix.merchantName}</p>
                )}
                <div className="bg-white p-2 rounded text-xs font-mono break-all border max-h-20 overflow-y-auto">
                  {pixCode}
                </div>
                {showInteractivePixPayment && (
                  <Button 
                    onClick={handleCopyPixCode}
                    size="sm"
                    className="mt-2"
                    variant={copied ? "secondary" : "default"}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar Código PIX
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {data.wise?.enabled && data.wise?.username && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-bold text-sm mb-1">
                <span className="bg-[#9fe870] text-[#1a2e05] px-2 py-0.5 rounded text-xs font-bold mr-2">WISE</span>
                Pagamento Internacional
              </p>
              <p className="text-sm">
                Link: <a href={`https://wise.com/pay/me/${data.wise.username}`} className="text-blue-600 underline">
                  wise.com/pay/me/{data.wise.username}
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {data.showNotes && data.notes && (
        <div className="border-t-2 border-gray-300 pt-6 mb-6">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Observações</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-black pt-6">
        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-600">
            <p className="font-semibold text-black">FONTES GRAPHICS DESIGN</p>
            <p>POÇOS DE CALDAS - MG R.SÃO FRANCISCO Nº39</p>
            <p>33.259.883/0001-08</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-t-2 border-black pt-2">
              <p className="text-sm font-medium">ASSINATURA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
