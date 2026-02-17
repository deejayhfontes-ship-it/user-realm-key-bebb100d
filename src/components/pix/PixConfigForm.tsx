import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePixConfig, PixConfigInput } from '@/hooks/usePixConfig';
import { QrCode, Save, Loader2 } from 'lucide-react';

type KeyType = 'email' | 'cpf' | 'cnpj' | 'phone' | 'random';

export function PixConfigForm() {
  const { pixConfig, isLoading, saveConfig, isSaving } = usePixConfig();
  
  const [keyType, setKeyType] = useState<KeyType>('email');
  const [pixKey, setPixKey] = useState('');
  const [merchantName, setMerchantName] = useState('Fontes Graphics');
  const [merchantCity, setMerchantCity] = useState('Pocos de Caldas');
  const [enabled, setEnabled] = useState(true);

  // Load existing config
  useEffect(() => {
    if (pixConfig) {
      setPixKey(pixConfig.pix_key);
      setMerchantName(pixConfig.merchant_name);
      setMerchantCity(pixConfig.merchant_city);
      setEnabled(pixConfig.enabled);
      
      // Detect key type
      if (pixConfig.pix_key.includes('@')) {
        setKeyType('email');
      } else if (pixConfig.pix_key.length === 11) {
        setKeyType('cpf');
      } else if (pixConfig.pix_key.length === 14) {
        setKeyType('cnpj');
      } else if (pixConfig.pix_key.startsWith('+55')) {
        setKeyType('phone');
      } else {
        setKeyType('random');
      }
    }
  }, [pixConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config: PixConfigInput = {
      pix_key: pixKey,
      merchant_name: merchantName.toUpperCase(),
      merchant_city: merchantCity.toUpperCase(),
      enabled,
    };
    
    saveConfig(config);
  };

  const getKeyPlaceholder = () => {
    switch (keyType) {
      case 'email': return 'email@exemplo.com';
      case 'cpf': return '000.000.000-00';
      case 'cnpj': return '00.000.000/0001-00';
      case 'phone': return '+5535999999999';
      case 'random': return 'Chave aleatória';
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Configurações PIX
        </CardTitle>
        <CardDescription>
          Configure sua chave PIX para receber pagamentos automaticamente em orçamentos, propostas e faturas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ativar PIX */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <Label htmlFor="pix-enabled" className="text-base font-medium">
                Ativar PIX nos documentos
              </Label>
              <p className="text-sm text-muted-foreground">
                Exibir QR Code PIX automaticamente
              </p>
            </div>
            <Switch
              id="pix-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Tipo de Chave */}
            <div className="space-y-2">
              <Label htmlFor="key-type">Tipo de Chave</Label>
              <Select value={keyType} onValueChange={(v) => setKeyType(v as KeyType)}>
                <SelectTrigger id="key-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="random">Chave Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <Label htmlFor="pix-key">Chave PIX</Label>
              <Input
                id="pix-key"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={getKeyPlaceholder()}
                required
              />
            </div>

            {/* Nome do Beneficiário */}
            <div className="space-y-2">
              <Label htmlFor="merchant-name">Nome do Beneficiário</Label>
              <Input
                id="merchant-name"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="FONTES GRAPHICS"
                maxLength={25}
                required
              />
              <p className="text-xs text-muted-foreground">
                Máximo 25 caracteres, sem acentos
              </p>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label htmlFor="merchant-city">Cidade</Label>
              <Input
                id="merchant-city"
                value={merchantCity}
                onChange={(e) => setMerchantCity(e.target.value)}
                placeholder="POCOS DE CALDAS"
                maxLength={15}
                required
              />
              <p className="text-xs text-muted-foreground">
                Máximo 15 caracteres, sem acentos
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
