import { useState, useEffect } from 'react';
import {
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Key,
    Cpu,
    Sparkles,
    Save,
    Zap,
    Info,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    useAIProviders,
    useCreateAIProvider,
    useUpdateAIProvider,
    useTestAIProvider,
} from '@/hooks/useAIProviders';

const DESIGNER_SLUG = 'designer-do-futuro';

const DEFAULT_CONFIG = {
    name: 'Designer do Futuro — Gemini',
    slug: DESIGNER_SLUG,
    api_type: 'google' as const,
    endpoint_url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
    model_name: 'gemini-3-pro-image-preview',
    category: 'vision' as const,
    supports_images: true,
    is_active: true,
    timeout_seconds: 60,
    max_tokens: 8000,
    temperature: 0.8,
    response_path: 'candidates[0].content.parts[0].text',
    system_prompt: '',
};

function maskKey(key: string): string {
    if (key.length <= 10) return '••••••••••';
    return key.slice(0, 6) + '••••••' + key.slice(-4);
}

export function DesignerDoFuturoProviderPanel() {
    const { data: providers, isLoading: isLoadingProviders } = useAIProviders();
    const createMutation = useCreateAIProvider();
    const updateMutation = useUpdateAIProvider();
    const testMutation = useTestAIProvider();

    const existingProvider = providers?.find((p) => p.slug === DESIGNER_SLUG);
    const isConfigured = !!existingProvider;

    const [apiKey, setApiKey] = useState('');
    const [extraKeys, setExtraKeys] = useState<string[]>([]);
    const [newExtraKey, setNewExtraKey] = useState('');
    const [modelImage, setModelImage] = useState(DEFAULT_CONFIG.model_name);
    const [modelText, setModelText] = useState('gemini-3-pro-preview');
    const [hasChanges, setHasChanges] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPool, setShowPool] = useState(false);

    useEffect(() => {
        if (existingProvider) {
            setModelImage(existingProvider.model_name || DEFAULT_CONFIG.model_name);
            try {
                const meta = existingProvider.system_prompt ? JSON.parse(existingProvider.system_prompt) : null;
                if (meta?.model_text) setModelText(meta.model_text);
                if (meta?.api_keys && Array.isArray(meta.api_keys)) {
                    setExtraKeys(meta.api_keys);
                }
            } catch {
                // plain text, ignore
            }
        }
    }, [existingProvider]);

    const handleFieldChange = (setter: (v: string) => void, value: string) => {
        setter(value);
        setHasChanges(true);
    };

    const handleAddExtraKey = () => {
        const trimmed = newExtraKey.trim();
        if (!trimmed || extraKeys.includes(trimmed)) return;
        setExtraKeys(prev => [...prev, trimmed]);
        setNewExtraKey('');
        setHasChanges(true);
    };

    const handleRemoveExtraKey = (index: number) => {
        setExtraKeys(prev => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const totalKeys = (isConfigured || apiKey ? 1 : 0) + extraKeys.length;

    const handleSave = () => {
        const meta: Record<string, any> = { model_text: modelText };
        if (extraKeys.length > 0) {
            meta.api_keys = extraKeys;
        }

        const providerData = {
            name: DEFAULT_CONFIG.name,
            slug: DESIGNER_SLUG,
            api_type: DEFAULT_CONFIG.api_type,
            endpoint_url: DEFAULT_CONFIG.endpoint_url,
            api_key_encrypted: apiKey || undefined,
            model_name: modelImage,
            category: DEFAULT_CONFIG.category,
            supports_images: true,
            is_active: true,
            timeout_seconds: DEFAULT_CONFIG.timeout_seconds,
            max_tokens: DEFAULT_CONFIG.max_tokens,
            temperature: DEFAULT_CONFIG.temperature,
            response_path: DEFAULT_CONFIG.response_path,
            system_prompt: JSON.stringify(meta),
        };

        if (existingProvider) {
            updateMutation.mutate(
                { id: existingProvider.id, ...providerData },
                { onSuccess: () => setHasChanges(false) }
            );
        } else {
            createMutation.mutate(providerData as any, {
                onSuccess: () => setHasChanges(false),
            });
        }
    };

    const handleTest = () => {
        if (existingProvider) {
            testMutation.mutate({ providerId: existingProvider.id });
        } else {
            testMutation.mutate({
                apiType: 'google',
                endpointUrl: DEFAULT_CONFIG.endpoint_url,
                apiKey: apiKey,
                modelName: modelImage,
            });
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    if (isLoadingProviders) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* Status */}
            <Card className="soft-card border-0">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isConfigured ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {isConfigured ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">
                                    {isConfigured ? 'API Configurada ✓' : 'API não configurada'}
                                </h3>
                                <Badge variant="outline" className={isConfigured ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}>
                                    {isConfigured ? 'Ativo' : 'Pendente'}
                                </Badge>
                                {totalKeys > 1 && (
                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        Pool: {totalKeys} keys
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isConfigured
                                    ? `Modelo: ${existingProvider?.model_name || modelImage}`
                                    : 'Siga o passo a passo abaixo para configurar.'}
                            </p>
                        </div>
                        {isConfigured && existingProvider?.last_test_success !== null && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Último teste</p>
                                <p className={`text-sm font-medium ${existingProvider?.last_test_success ? 'text-emerald-600' : 'text-destructive'}`}>
                                    {existingProvider?.last_test_success ? 'Sucesso ✓' : 'Falhou ✗'}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Passo a passo */}
            <Card className="soft-card border-0 bg-blue-500/5 border-blue-500/10">
                <CardContent className="pt-5">
                    <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-3 text-sm flex-1">
                            <p className="font-semibold text-foreground">Como obter sua API Key do Google Gemini</p>
                            <ol className="space-y-2 text-muted-foreground list-none">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                    <span>Acesse o <strong>Google AI Studio</strong> clicando no botão abaixo</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                    <span>Clique em <strong>"Create API key"</strong> (ou "Criar chave de API")</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                    <span>Copie a chave gerada (começa com <code className="bg-muted px-1 rounded text-xs">AIzaSy...</code>)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                                    <span>Cole no campo <strong>"API Key Principal"</strong> abaixo e clique em Salvar</span>
                                </li>
                            </ol>
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Abrir Google AI Studio
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulário */}
            <Card className="soft-card border-0">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Configuração
                    </CardTitle>
                    <CardDescription>
                        Apenas a API Key é obrigatória. Os modelos já estão configurados com os valores corretos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                    {/* API Key — campo principal */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold">
                            <Key className="h-4 w-4 text-primary" />
                            API Key Principal *
                        </Label>
                        <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => handleFieldChange(setApiKey, e.target.value)}
                            placeholder={isConfigured ? '••••••••••••  (chave salva — cole nova para trocar)' : 'AIzaSy...'}
                            className="rounded-xl font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            {isConfigured
                                ? 'Deixe em branco para manter a chave atual. Cole uma nova para substituir.'
                                : 'Cole aqui a chave copiada do Google AI Studio.'}
                        </p>
                    </div>

                    {/* Pool de API Keys */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPool(!showPool)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPool ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            Pool de API Keys ({totalKeys} {totalKeys === 1 ? 'key' : 'keys'})
                        </button>

                        {showPool && (
                            <div className="mt-4 p-4 rounded-xl bg-muted/40 space-y-4">
                                <div className="flex gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground">
                                        Adicione múltiplas API keys para evitar rate limits (erro 429).
                                        As keys são embaralhadas e usadas em rodízio automático.
                                        Ideal para alta demanda — quanto mais keys, mais gerações simultâneas.
                                    </p>
                                </div>

                                {/* Lista de keys extras */}
                                {extraKeys.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Keys adicionais no pool:</Label>
                                        {extraKeys.map((key, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-background border">
                                                <Key className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                <code className="text-xs font-mono flex-1 text-muted-foreground">{maskKey(key)}</code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveExtraKey(idx)}
                                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Adicionar nova key */}
                                <div className="flex gap-2">
                                    <Input
                                        type="password"
                                        value={newExtraKey}
                                        onChange={(e) => setNewExtraKey(e.target.value)}
                                        placeholder="AIzaSy... (key adicional)"
                                        className="rounded-xl font-mono text-xs flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddExtraKey()}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={handleAddExtraKey}
                                        disabled={!newExtraKey.trim()}
                                        className="rounded-xl gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Adicionar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Avançado — modelos */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            Configurações avançadas (modelos)
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs">
                                        <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                                        Modelo de Imagem
                                    </Label>
                                    <Input
                                        value={modelImage}
                                        onChange={(e) => handleFieldChange(setModelImage, e.target.value)}
                                        className="rounded-xl font-mono text-xs h-9"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Gera as imagens. Padrão: <code className="bg-muted px-1 rounded">gemini-3-pro-image-preview</code>
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs">
                                        <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                                        Modelo de Texto
                                    </Label>
                                    <Input
                                        value={modelText}
                                        onChange={(e) => handleFieldChange(setModelText, e.target.value)}
                                        className="rounded-xl font-mono text-xs h-9"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Refina os prompts. Padrão: <code className="bg-muted px-1 rounded">gemini-3-pro-preview</code>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-3 pt-2 border-t">
                        <Button
                            variant="outline"
                            onClick={handleTest}
                            disabled={testMutation.isPending || (!isConfigured && !apiKey)}
                            className="rounded-xl gap-2"
                        >
                            {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                            Testar Conexão
                        </Button>
                        <div className="flex-1" />
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || (!hasChanges && isConfigured && !apiKey)}
                            className="rounded-xl gap-2 px-8"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isConfigured ? 'Atualizar' : 'Salvar e Ativar'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Info */}
            <Card className="soft-card border-0 bg-muted/30">
                <CardContent className="pt-5">
                    <div className="flex gap-3">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground text-sm">Sobre o Designer do Futuro</p>
                            <ul className="space-y-1">
                                <li>• Usa o Google Gemini 3 Pro para gerar imagens fotorrealistas e cinematográficas</li>
                                <li>• Suporta upload de imagem de referência para manter consistência visual</li>
                                <li>• Pool de API Keys distribui carga e evita rate limits (429)</li>
                                <li>• A API do Gemini tem um plano gratuito generoso para começar</li>
                                <li>• Consulte os preços em{' '}
                                    <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        ai.google.dev/pricing
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
