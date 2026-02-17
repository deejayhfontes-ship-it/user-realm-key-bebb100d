import { useState, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generatePixCode } from '@/lib/pix-generator';
import { Copy, Check, QrCode, Download } from 'lucide-react';
import { toast } from 'sonner';
import { usePixConfig } from '@/hooks/usePixConfig';

interface PixPaymentProps {
  amount: number; // em centavos
  description?: string;
  transactionId?: string;
  onCopy?: () => void;
  showConfig?: boolean;
}

export function PixPayment({ 
  amount, 
  description, 
  transactionId,
  onCopy,
  showConfig = false 
}: PixPaymentProps) {
  const { pixConfig, isLoading } = usePixConfig();
  const [copied, setCopied] = useState(false);

  const amountInReais = amount / 100;

  const pixCode = useMemo(() => {
    if (!pixConfig?.pix_key || !pixConfig?.merchant_name || !pixConfig?.merchant_city) {
      return '';
    }

    return generatePixCode({
      pixKey: pixConfig.pix_key,
      merchantName: pixConfig.merchant_name,
      merchantCity: pixConfig.merchant_city,
      amount: amountInReais > 0 ? amountInReais : undefined,
      transactionId: transactionId || '***',
      description: description,
    });
  }, [pixConfig, amountInReais, description, transactionId]);

  const handleCopy = async () => {
    if (!pixCode) return;

    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('pix-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `pix-${transactionId || 'qrcode'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR Code baixado!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          Carregando configurações PIX...
        </CardContent>
      </Card>
    );
  }

  if (!pixConfig?.enabled) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          PIX não configurado. Configure em Configurações → PIX.
        </CardContent>
      </Card>
    );
  }

  if (!pixCode) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          Configure a chave PIX nas configurações para gerar o código.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/10 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <QrCode className="h-5 w-5 text-primary" />
          Pagamento via PIX
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCode 
              id="pix-qr-code"
              value={pixCode} 
              size={200}
              level="H"
            />
          </div>
        </div>

        {/* Valor */}
        {amountInReais > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="text-2xl font-bold text-primary">
              R$ {amountInReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Info */}
        {showConfig && (
          <div className="text-sm text-muted-foreground space-y-1 text-center">
            <p><span className="text-foreground">Chave:</span> {pixConfig.pix_key}</p>
            <p><span className="text-foreground">Beneficiário:</span> {pixConfig.merchant_name}</p>
          </div>
        )}

        {/* Código Copia e Cola */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">Código Copia e Cola</p>
          <div className="bg-secondary/50 rounded-lg p-3 text-xs font-mono break-all max-h-20 overflow-y-auto">
            {pixCode}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button 
            onClick={handleCopy} 
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Código
              </>
            )}
          </Button>
          <Button 
            onClick={handleDownloadQR} 
            variant="outline"
            size="icon"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Escaneie o QR Code ou copie o código para pagar no app do seu banco
        </p>
      </CardContent>
    </Card>
  );
}
