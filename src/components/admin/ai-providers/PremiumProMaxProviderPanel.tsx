import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Eye, EyeOff, Sparkles, ExternalLink, Zap, Info, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const SLUG = 'premium-pro-max';

const MODELS = [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Recomendado)' },
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Ultra-rápido)' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
];

const API_TYPES = [
    { value: 'openai', label: 'OpenAI-Compatible (Groq, OpenAI, etc.)' },
    { value: 'google', label: 'Google AI (Gemini)' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
];

export function PremiumProMaxProviderPanel() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [providerId, setProviderId] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

    const [config, setConfig] = useState({
        apiKey: '',
        model: 'llama-3.3-70b-versatile',
        apiType: 'openai',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        isActive: true,
    });

    useEffect(() => {
        loadProvider();
    }, []);

    const loadProvider = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ai_providers')
                .select('*')
                .eq('slug', SLUG)
                .maybeSingle();

            if (data) {
                setProviderId(data.id);
                setConfig({
                    apiKey: (data as any).api_key_encrypted || '',
                    model: (data as any).model_name || 'llama-3.3-70b-versatile',
                    apiType: (data as any).api_type || 'openai',
                    endpoint: (data as any).endpoint_url || 'https://api.groq.com/openai/v1/chat/completions',
                    isActive: (data as any).is_active ?? true,
                });
            }
        } catch (err) {
            console.error('Erro ao carregar provider:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config.apiKey.trim()) {
            toast.error('Insira a API Key');
            return;
        }

        setSaving(true);
        try {
            const providerData = {
                name: 'Premium Pro Max (Groq)',
                slug: SLUG,
                api_type: config.apiType,
                endpoint_url: config.endpoint,
                api_key_encrypted: config.apiKey,
                model_name: config.model,
                is_active: config.isActive,
                is_default: false,
                supports_images: false,
                max_tokens: 3000,
                temperature: 0.8,
                timeout_seconds: 60,
                response_path: config.apiType === 'google'
                    ? 'candidates[0].content.parts[0].text'
                    : 'choices[0].message.content',
            };

            if (providerId) {
                const { error } = await supabase
                    .from('ai_providers')
                    .update(providerData as any)
                    .eq('id', providerId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('ai_providers')
                    .insert(providerData as any)
                    .select()
                    .single();
                if (error) throw error;
                setProviderId(data.id);
            }

            toast.success('Configurações salvas!');
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            toast.error(err.message || 'Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!config.apiKey.trim()) {
            toast.error('Insira a API Key primeiro');
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            let body: any;
            let headers: Record<string, string> = { 'Content-Type': 'application/json' };
            let endpoint = config.endpoint;

            if (config.apiType === 'openai') {
                headers['Authorization'] = `Bearer ${config.apiKey}`;
                body = {
                    model: config.model,
                    messages: [{ role: 'user', content: 'Diga apenas: OK' }],
                    max_tokens: 10,
                };
            } else if (config.apiType === 'google') {
                endpoint = `${config.endpoint}?key=${config.apiKey}`;
                body = {
                    contents: [{ role: 'user', parts: [{ text: 'Diga apenas: OK' }] }],
                    generationConfig: { maxOutputTokens: 10 },
                };
            } else if (config.apiType === 'anthropic') {
                headers['x-api-key'] = config.apiKey;
                headers['anthropic-version'] = '2023-06-01';
                body = {
                    model: config.model,
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'Diga apenas: OK' }],
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setTestResult('success');
                toast.success('Conexão OK! API funcionando.');
            } else {
                const errText = await response.text();
                console.error('Teste falhou:', response.status, errText);
                setTestResult('error');
                toast.error(`Erro ${response.status}: Verifique a API key e o endpoint.`);
            }
        } catch (err: any) {
            setTestResult('error');
            toast.error(`Erro de conexão: ${err.message}`);
        } finally {
            setTesting(false);
        }
    };

    const handleApiTypeChange = (type: string) => {
        const endpoints: Record<string, string> = {
            openai: 'https://api.groq.com/openai/v1/chat/completions',
            google: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            anthropic: 'https://api.anthropic.com/v1/messages',
        };
        const defaultModels: Record<string, string> = {
            openai: 'llama-3.3-70b-versatile',
            google: 'gemini-2.5-flash',
            anthropic: 'claude-sonnet-4-20250514',
        };
        setConfig(prev => ({
            ...prev,
            apiType: type,
            endpoint: endpoints[type] || prev.endpoint,
            model: defaultModels[type] || prev.model,
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Gerador Premium Pro Max</h2>
                        <p className="text-sm text-muted-foreground">API para geração de prompts de vídeo AI</p>
                    </div>
                </div>
                <Badge variant={config.isActive ? 'default' : 'secondary'} className="gap-1">
                    {config.isActive ? <Zap className="w-3 h-3" /> : null}
                    {config.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
            </div>

            {/* Info Card */}
            <Card className="border-orange-500/20 bg-orange-500/5">
                <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Como funciona:</strong> O Gerador Premium Pro Max usa essa API para analisar imagens e gerar prompts cinematográficos para plataformas como Veo 3, Runway, Kling e Pika.</p>
                            <p>
                                <strong>Groq API (recomendado):</strong> Crie sua key em{' '}
                                <a href="https://console.groq.com/keys" target="_blank" rel="noopener" className="text-orange-500 hover:underline inline-flex items-center gap-1">
                                    console.groq.com <ExternalLink className="w-3 h-3" />
                                </a>
                            </p>
                            <p className="text-xs">Também suporta OpenAI, Google Gemini e Anthropic Claude.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Config Form */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Configuração da API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* API Type */}
                    <div className="space-y-2">
                        <Label>Tipo de API</Label>
                        <Select value={config.apiType} onValueChange={handleApiTypeChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {API_TYPES.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="relative">
                            <Input
                                type={showKey ? 'text' : 'password'}
                                value={config.apiKey}
                                onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder={config.apiType === 'openai' ? 'gsk_...' : 'Sua API key...'}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                        <Label>Modelo</Label>
                        {config.apiType === 'openai' ? (
                            <Select value={config.model} onValueChange={v => setConfig(prev => ({ ...prev, model: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODELS.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                value={config.model}
                                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                                placeholder="Nome do modelo"
                            />
                        )}
                    </div>

                    {/* Endpoint */}
                    <div className="space-y-2">
                        <Label>Endpoint URL</Label>
                        <Input
                            value={config.endpoint}
                            onChange={e => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                            placeholder="https://api.groq.com/openai/v1/chat/completions"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <div>
                            <Label>Provedor Ativo</Label>
                            <p className="text-xs text-muted-foreground">O gerador só funciona com o provedor ativo</p>
                        </div>
                        <Switch
                            checked={config.isActive}
                            onCheckedChange={v => setConfig(prev => ({ ...prev, isActive: v }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving} className="gap-2 flex-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Configurações
                </Button>
                <Button onClick={handleTest} disabled={testing} variant="outline" className="gap-2">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                    Testar
                </Button>
                {testResult === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {testResult === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
            </div>
        </div>
    );
}
