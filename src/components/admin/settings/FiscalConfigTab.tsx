import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, MapPin, FileText, Key, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useNfeConfig } from '@/hooks/useNfeConfig';
import { validateCNPJ, maskCNPJ, maskCEP } from '@/lib/validators';
import { REGIMES_TRIBUTARIOS, UF_OPTIONS } from '@/types/nfe';
import { toast } from 'sonner';

export function FiscalConfigTab() {
  const { config, isLoading, saveConfig } = useNfeConfig();
  
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    municipio: '',
    uf: '',
    codigo_municipio_ibge: '',
    regime_tributario: 'simples_nacional',
    ambiente: 'homologacao' as 'homologacao' | 'producao',
    serie_nfe: '1',
    proximo_numero_nfe: 1,
    serie_nfse: '1',
    proximo_numero_nfse: 1,
    api_provider: 'manual' as 'manual' | 'focus' | 'tecnospeed' | 'webmania',
    api_key: '',
    api_secret: '',
    certificado_senha: '',
  });

  const [cnpjError, setCnpjError] = useState('');
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);

  useEffect(() => {
    if (config) {
      setFormData({
        razao_social: config.razao_social || '',
        nome_fantasia: config.nome_fantasia || '',
        cnpj: config.cnpj ? maskCNPJ(config.cnpj) : '',
        inscricao_estadual: config.inscricao_estadual || '',
        inscricao_municipal: config.inscricao_municipal || '',
        logradouro: config.logradouro || '',
        numero: config.numero || '',
        complemento: config.complemento || '',
        bairro: config.bairro || '',
        cep: config.cep ? maskCEP(config.cep) : '',
        municipio: config.municipio || '',
        uf: config.uf || '',
        codigo_municipio_ibge: config.codigo_municipio_ibge || '',
        regime_tributario: config.regime_tributario || 'simples_nacional',
        ambiente: config.ambiente || 'homologacao',
        serie_nfe: config.serie_nfe || '1',
        proximo_numero_nfe: config.proximo_numero_nfe || 1,
        serie_nfse: config.serie_nfse || '1',
        proximo_numero_nfse: config.proximo_numero_nfse || 1,
        api_provider: config.api_provider || 'manual',
        api_key: config.api_key || '',
        api_secret: config.api_secret || '',
        certificado_senha: '',
      });
    }
  }, [config]);

  const handleChange = (field: string, value: string | number) => {
    if (field === 'cnpj') {
      const masked = maskCNPJ(value as string);
      setFormData(prev => ({ ...prev, cnpj: masked }));
      const clean = masked.replace(/\D/g, '');
      if (clean.length === 14 && !validateCNPJ(clean)) {
        setCnpjError('CNPJ inválido');
      } else {
        setCnpjError('');
      }
    } else if (field === 'cep') {
      setFormData(prev => ({ ...prev, cep: maskCEP(value as string) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCertificadoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pfx') && !file.name.endsWith('.p12')) {
      toast.error('Arquivo deve ser .pfx ou .p12');
      return;
    }

    setCertificadoFile(file);
    toast.success('Certificado selecionado: ' + file.name);
  };

  const handleSave = async () => {
    // Validações
    if (!formData.razao_social) {
      toast.error('Razão Social é obrigatória');
      return;
    }

    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (!cleanCnpj || !validateCNPJ(cleanCnpj)) {
      toast.error('CNPJ inválido');
      return;
    }

    // Converter certificado para base64 se houver
    let certificadoBase64 = config?.certificado_base64 || null;
    if (certificadoFile) {
      const reader = new FileReader();
      certificadoBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(certificadoFile);
      });
    }

    const payload = {
      ...formData,
      cnpj: cleanCnpj,
      cep: formData.cep.replace(/\D/g, ''),
      certificado_base64: certificadoBase64,
      certificado_senha: formData.certificado_senha || null,
    };

    saveConfig.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Dados do Emitente */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Dados do Emitente</CardTitle>
          </div>
          <CardDescription>
            Informações da empresa para emissão de notas fiscais
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão Social *</Label>
            <Input
              id="razao_social"
              value={formData.razao_social}
              onChange={(e) => handleChange('razao_social', e.target.value)}
              placeholder="Empresa Ltda"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
            <Input
              id="nome_fantasia"
              value={formData.nome_fantasia}
              onChange={(e) => handleChange('nome_fantasia', e.target.value)}
              placeholder="Minha Empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
              className={cnpjError ? 'border-destructive' : ''}
            />
            {cnpjError && <p className="text-xs text-destructive">{cnpjError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
            <Input
              id="inscricao_estadual"
              value={formData.inscricao_estadual}
              onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
              placeholder="000.000.000.000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
            <Input
              id="inscricao_municipal"
              value={formData.inscricao_municipal}
              onChange={(e) => handleChange('inscricao_municipal', e.target.value)}
              placeholder="Obrigatório para NFS-e"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regime_tributario">Regime Tributário</Label>
            <Select
              value={formData.regime_tributario}
              onValueChange={(v) => handleChange('regime_tributario', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIMES_TRIBUTARIOS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Card Endereço */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Endereço</CardTitle>
          </div>
          <CardDescription>
            Endereço completo do estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={(e) => handleChange('cep', e.target.value)}
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              value={formData.logradouro}
              onChange={(e) => handleChange('logradouro', e.target.value)}
              placeholder="Rua, Avenida..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={formData.complemento}
              onChange={(e) => handleChange('complemento', e.target.value)}
              placeholder="Sala 101"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={formData.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
              placeholder="Centro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Input
              id="municipio"
              value={formData.municipio}
              onChange={(e) => handleChange('municipio', e.target.value)}
              placeholder="São Paulo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uf">UF</Label>
            <Select value={formData.uf} onValueChange={(v) => handleChange('uf', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigo_municipio_ibge">Código IBGE</Label>
            <Input
              id="codigo_municipio_ibge"
              value={formData.codigo_municipio_ibge}
              onChange={(e) => handleChange('codigo_municipio_ibge', e.target.value)}
              placeholder="3550308"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card Emissão */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Configurações de Emissão</CardTitle>
          </div>
          <CardDescription>
            Ambiente, numeração e integração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base">Ambiente de Emissão</Label>
              <p className="text-sm text-muted-foreground">
                {formData.ambiente === 'producao' ? 'Notas fiscais serão emitidas oficialmente' : 'Notas de teste, sem validade fiscal'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={formData.ambiente === 'producao' ? 'default' : 'secondary'}>
                {formData.ambiente === 'producao' ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Produção</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Homologação</>
                )}
              </Badge>
              <Switch
                checked={formData.ambiente === 'producao'}
                onCheckedChange={(checked) => handleChange('ambiente', checked ? 'producao' : 'homologacao')}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Série NF-e</Label>
              <Input
                value={formData.serie_nfe}
                onChange={(e) => handleChange('serie_nfe', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Próximo Nº NF-e</Label>
              <Input
                type="number"
                value={formData.proximo_numero_nfe}
                onChange={(e) => handleChange('proximo_numero_nfe', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Série NFS-e</Label>
              <Input
                value={formData.serie_nfse}
                onChange={(e) => handleChange('serie_nfse', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Próximo Nº NFS-e</Label>
              <Input
                type="number"
                value={formData.proximo_numero_nfse}
                onChange={(e) => handleChange('proximo_numero_nfse', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo de Emissão</Label>
              <Select
                value={formData.api_provider}
                onValueChange={(v) => handleChange('api_provider', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (sem API)</SelectItem>
                  <SelectItem value="focus">Focus NFe</SelectItem>
                  <SelectItem value="tecnospeed">Tecnospeed</SelectItem>
                  <SelectItem value="webmania">Webmania</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.api_provider !== 'manual' && (
              <>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => handleChange('api_key', e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={formData.api_secret}
                    onChange={(e) => handleChange('api_secret', e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Certificado Digital */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Certificado Digital A1</CardTitle>
          </div>
          <CardDescription>
            Certificado para assinatura das notas fiscais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Arquivo do Certificado (.pfx ou .p12)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pfx,.p12"
                  onChange={handleCertificadoUpload}
                  className="hidden"
                  id="certificado-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('certificado-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {certificadoFile ? certificadoFile.name : config?.certificado_base64 ? 'Certificado salvo ✓' : 'Selecionar arquivo'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Senha do Certificado</Label>
              <Input
                type="password"
                value={formData.certificado_senha}
                onChange={(e) => handleChange('certificado_senha', e.target.value)}
                placeholder="••••••••••"
              />
            </div>
          </div>
          {config?.certificado_validade && (
            <p className="text-sm text-muted-foreground">
              Validade: {new Date(config.certificado_validade).toLocaleDateString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveConfig.isPending}>
          {saveConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Configurações Fiscais
        </Button>
      </div>
    </div>
  );
}
