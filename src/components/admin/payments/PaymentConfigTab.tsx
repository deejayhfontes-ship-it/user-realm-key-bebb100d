import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, TestTube, CreditCard, Wallet, Building2, HandCoins, Info } from 'lucide-react';

type GatewayName = 'stripe' | 'mercado_pago' | 'pagseguro' | 'asaas' | 'manual';

interface PaymentConfig {
  id: string;
  gateway_name: GatewayName;
  is_active: boolean;
  api_key_encrypted: string | null;
  webhook_secret: string | null;
  sandbox_mode: boolean;
  config_json: Record<string, unknown>;
}

const gatewayIcons: Record<GatewayName, React.ReactNode> = {
  stripe: <CreditCard className="w-5 h-5" />,
  mercado_pago: <Wallet className="w-5 h-5" />,
  pagseguro: <Building2 className="w-5 h-5" />,
  asaas: <HandCoins className="w-5 h-5" />,
  manual: <HandCoins className="w-5 h-5" />,
};

const gatewayLabels: Record<GatewayName, string> = {
  stripe: 'Stripe',
  mercado_pago: 'Mercado Pago',
  pagseguro: 'PagSeguro',
  asaas: 'Asaas',
  manual: 'Manual',
};

export default function PaymentConfigTab() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeGateway, setActiveGateway] = useState<GatewayName>('manual');

  // Form states
  const [isActive, setIsActive] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_configs')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as PaymentConfig);
        setActiveGateway(data.gateway_name as GatewayName);
        setIsActive(data.is_active || false);
        setSandboxMode(data.sandbox_mode || true);
        setWebhookSecret(data.webhook_secret || '');
        
        // Parse config_json for gateway-specific settings
        const configJson = (data.config_json as Record<string, string>) || {};
        setPublishableKey(configJson.publishable_key || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configurações de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        gateway_name: activeGateway,
        is_active: isActive,
        sandbox_mode: sandboxMode,
        webhook_secret: webhookSecret || null,
        api_key_encrypted: apiKey || config?.api_key_encrypted || null,
        config_json: {
          publishable_key: publishableKey,
        },
        updated_at: new Date().toISOString(),
      };

      if (config?.id) {
        const { error } = await supabase
          .from('payment_configs')
          .update(updateData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_configs')
          .insert(updateData);

        if (error) throw error;
      }

      toast.success('Configurações salvas com sucesso!');
      loadConfig();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    // TODO: Implementar teste real de conexão com gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info('Teste de conexão será implementado quando o gateway for integrado');
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const webhookUrl = `https://nzngwbknezmfthbyfjmx.supabase.co/functions/v1/webhook-${activeGateway.replace('_', '-')}`;

  return (
    <div className="space-y-6">
      {/* Configuração Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Configuração Geral
          </CardTitle>
          <CardDescription>
            Ative o sistema de pagamentos e escolha o gateway padrão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payments-active">Sistema de pagamentos ativo</Label>
              <p className="text-sm text-muted-foreground">
                Habilita toda a funcionalidade de pagamentos
              </p>
            </div>
            <Switch
              id="payments-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="space-y-2">
            <Label>Gateway padrão</Label>
            <Select value={activeGateway} onValueChange={(v) => setActiveGateway(v as GatewayName)}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {Object.entries(gatewayLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {gatewayIcons[key as GatewayName]}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeGateway !== 'manual' && (
            <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Configure as credenciais na aba específica do gateway escolhido abaixo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abas de Gateways */}
      <Tabs value={activeGateway} onValueChange={(v) => setActiveGateway(v as GatewayName)}>
        <TabsList className="bg-muted/50 p-1 rounded-xl flex-wrap h-auto gap-1">
          {Object.entries(gatewayLabels).map(([key, label]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="rounded-lg data-[state=active]:bg-background gap-2"
            >
              {gatewayIcons[key as GatewayName]}
              {label}
              {key === activeGateway && isActive && (
                <Badge variant="default" className="ml-1 text-xs">Ativo</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Stripe */}
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#635BFF]" />
                Stripe
              </CardTitle>
              <CardDescription>
                Configure sua integração com o Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Sandbox/Teste</Label>
                  <p className="text-sm text-muted-foreground">Use chaves de teste</p>
                </div>
                <Switch checked={sandboxMode} onCheckedChange={setSandboxMode} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    placeholder="sk_test_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Publishable Key</Label>
                  <Input
                    placeholder="pk_test_..."
                    value={publishableKey}
                    onChange={(e) => setPublishableKey(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <Input
                  type="password"
                  placeholder="whsec_..."
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={webhookUrl}
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast.success('URL copiada!');
                    }}
                  >
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione esta URL nas configurações de webhooks do seu dashboard Stripe
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleTestConnection} variant="outline" disabled={testing}>
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                  Testar conexão
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mercado Pago */}
        <TabsContent value="mercado_pago">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#009EE3]" />
                Mercado Pago
              </CardTitle>
              <CardDescription>
                Configure sua integração com o Mercado Pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Sandbox/Teste</Label>
                  <p className="text-sm text-muted-foreground">Use credenciais de teste</p>
                </div>
                <Switch checked={sandboxMode} onCheckedChange={setSandboxMode} />
              </div>

              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input
                  type="password"
                  placeholder="APP_USR-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Public Key</Label>
                <Input
                  placeholder="APP_USR-..."
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={webhookUrl}
                    className="bg-muted"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast.success('URL copiada!');
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleTestConnection} variant="outline" disabled={testing}>
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                  Testar conexão
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PagSeguro */}
        <TabsContent value="pagseguro">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#41B54C]" />
                PagSeguro
              </CardTitle>
              <CardDescription>
                Configure sua integração com o PagSeguro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Sandbox/Teste</Label>
                  <p className="text-sm text-muted-foreground">Use ambiente de sandbox</p>
                </div>
                <Switch checked={sandboxMode} onCheckedChange={setSandboxMode} />
              </div>

              <div className="space-y-2">
                <Label>Token</Label>
                <Input
                  type="password"
                  placeholder="Seu token PagSeguro"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email da conta</Label>
                <Input
                  type="email"
                  placeholder="email@pagseguro.com"
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleTestConnection} variant="outline" disabled={testing}>
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                  Testar conexão
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asaas */}
        <TabsContent value="asaas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-[#0064CC]" />
                Asaas
              </CardTitle>
              <CardDescription>
                Configure sua integração com o Asaas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Sandbox/Teste</Label>
                  <p className="text-sm text-muted-foreground">Use ambiente de homologação</p>
                </div>
                <Switch checked={sandboxMode} onCheckedChange={setSandboxMode} />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="$aact_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleTestConnection} variant="outline" disabled={testing}>
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                  Testar conexão
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-primary" />
                Modo Manual
              </CardTitle>
              <CardDescription>
                Registre pagamentos recebidos por fora (Pix, transferência, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  No modo manual, você registra os pagamentos recebidos diretamente na aba "Transações".
                  Os créditos são liberados manualmente após confirmação do pagamento.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
