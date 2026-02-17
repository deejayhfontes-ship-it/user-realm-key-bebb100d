import { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { generatePixCode } from '@/lib/pix-generator';

interface PixQRCodeDisplayProps {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number; // em centavos
  transactionId?: string;
  description?: string;
  size?: number;
  showDetails?: boolean;
}

export function PixQRCodeDisplay({ 
  pixKey, 
  merchantName, 
  merchantCity, 
  amount, 
  transactionId,
  description,
  size = 120,
  showDetails = true
}: PixQRCodeDisplayProps) {
  const amountInReais = amount / 100;

  const pixCode = useMemo(() => {
    if (!pixKey || !merchantName || !merchantCity) return '';
    
    return generatePixCode({
      pixKey,
      merchantName,
      merchantCity,
      amount: amountInReais > 0 ? amountInReais : undefined,
      transactionId: transactionId || '***',
      description: description,
    });
  }, [pixKey, merchantName, merchantCity, amountInReais, transactionId, description]);

  if (!pixCode) return null;

  return (
    <div className="border-t-2 border-foreground pt-4 mt-4">
      <div className="flex items-start gap-6">
        <div className="bg-white p-3 rounded-lg border-2 border-foreground">
          <QRCode value={pixCode} size={size} level="H" />
        </div>
        {showDetails && (
          <div className="flex-1">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">PIX</span>
              Pagamento via PIX
            </h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Chave:</span> {pixKey}</p>
              <p><span className="text-muted-foreground">Beneficiário:</span> {merchantName}</p>
              {amountInReais > 0 && (
                <p>
                  <span className="text-muted-foreground">Valor:</span>{' '}
                  <strong className="text-foreground font-bold text-base">
                    R$ {amountInReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Escaneie o QR Code com o app do seu banco para pagar
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 p-2 bg-secondary rounded text-xs font-mono break-all">
        <span className="text-muted-foreground">Copia e Cola: </span>{pixCode}
      </div>
    </div>
  );
}
