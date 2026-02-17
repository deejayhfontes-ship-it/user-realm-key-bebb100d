import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { generatePixCode } from '@/lib/pix-generator';
import { Copy, Check, QrCode, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Types
export interface PixConfig {
  id: string;
  user_id: string;
  pix_key: string;
  key_type: string;
  merchant_name: string;
  merchant_city: string;
  nickname: string;
  enabled: boolean;
  is_default: boolean;
}

export interface PixPaymentProps {
  amount: number; // em centavos
  description: string;
  pixConfigId?: string;
  transactionId?: string;
  showConfigInfo?: boolean;
  onCopy?: () => void;
}

export interface UsePixPaymentResult {
  pixCode: string | null;
  pixConfig: PixConfig | null;
  isLoading: boolean;
  error: string | null;
  amountInReais: number;
  copy: () => Promise<void>;
  copied: boolean;
}

// Utility function to generate PIX payload without UI
export function generatePixPayload(config: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number; // em reais
  description?: string;
  transactionId?: string;
}): string {
  return generatePixCode({
    pixKey: config.pixKey,
    merchantName: config.merchantName,
    merchantCity: config.merchantCity,
    amount: config.amount,
    transactionId: config.transactionId || '***',
    description: config.description,
  });
}

// Hook for programmatic use
export function usePixPayment({
  amount,
  description,
  pixConfigId,
  transactionId,
}: {
  amount: number;
  description: string;
  pixConfigId?: string;
  transactionId?: string;
}): UsePixPaymentResult {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const amountInReais = amount / 100;

  // Fetch PIX config
  const { data: pixConfig, isLoading, error: queryError } = useQuery({
    queryKey: ['pix-config-for-payment', user?.id, pixConfigId],
    queryFn: async () => {
      if (!user?.id) return null;

      let query = supabase
        .from('pix_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true);

      if (pixConfigId) {
        query = query.eq('id', pixConfigId);
      } else {
        query = query.eq('is_default', true);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      // If no default found and no specific ID, get first available
      if (!data && !pixConfigId) {
        const { data: firstConfig, error: firstError } = await supabase
          .from('pix_configs')
          .select('*')
          .eq('user_id', user.id)
          .eq('enabled', true)
          .limit(1)
          .maybeSingle();
        
        if (firstError) throw firstError;
        return firstConfig as PixConfig | null;
      }

      return data as PixConfig | null;
    },
    enabled: !!user?.id,
  });

  // Generate PIX code
  const pixCode = useMemo(() => {
    if (!pixConfig?.pix_key || !pixConfig?.merchant_name || !pixConfig?.merchant_city) {
      return null;
    }

    return generatePixPayload({
      pixKey: pixConfig.pix_key,
      merchantName: pixConfig.merchant_name,
      merchantCity: pixConfig.merchant_city,
      amount: amountInReais > 0 ? amountInReais : undefined,
      transactionId: transactionId || '***',
      description: description,
    });
  }, [pixConfig, amountInReais, description, transactionId]);

  // Copy function
  const copy = useCallback(async () => {
    if (!pixCode) return;

    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  }, [pixCode]);

  const error = queryError 
    ? 'Erro ao carregar configuração PIX' 
    : !pixConfig && !isLoading 
      ? 'Configure uma conta PIX em Configurações' 
      : null;

  return {
    pixCode,
    pixConfig,
    isLoading,
    error,
    amountInReais,
    copy,
    copied,
  };
}

// Main component
export function PixPayment({
  amount,
  description,
  pixConfigId,
  transactionId,
  showConfigInfo = false,
  onCopy,
}: PixPaymentProps) {
  const {
    pixCode,
    pixConfig,
    isLoading,
    error,
    amountInReais,
    copy,
    copied,
  } = usePixPayment({ amount, description, pixConfigId, transactionId });

  const handleCopy = async () => {
    await copy();
    onCopy?.();
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

  // Loading state
  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardHeader className="bg-primary/10 border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Pagamento via PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex justify-center">
            <Skeleton className="w-[200px] h-[200px] rounded-xl" />
          </div>
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border border-border">
        <CardHeader className="bg-destructive/10 border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            PIX não disponível
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // No PIX code generated
  if (!pixCode) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          Não foi possível gerar o código PIX.
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

        {/* Descrição */}
        {description && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}

        {/* Info da conta */}
        {showConfigInfo && pixConfig && (
          <div className="text-sm text-muted-foreground space-y-1 text-center border-t border-border pt-4">
            <p><span className="text-foreground font-medium">Conta:</span> {pixConfig.nickname}</p>
            <p><span className="text-foreground font-medium">Beneficiário:</span> {pixConfig.merchant_name}</p>
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
            className="flex-1"
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

export default PixPayment;
