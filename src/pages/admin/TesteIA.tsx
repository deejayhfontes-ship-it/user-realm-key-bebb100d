import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import { AIService, type GenerateTextResult } from '@/services/aiService';
import { useActiveAIProviders } from '@/hooks/useAIProviders';

interface TestResult {
  provider: string;
  success: boolean;
  text?: string;
  latency?: number;
  tokens?: number;
  error?: string;
}

export default function TesteIA() {
  const { data: providers, isLoading: loadingProviders } = useActiveAIProviders();
  const [prompt, setPrompt] = useState('Diga olá de forma criativa em uma frase curta.');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateTextResult | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Gerar com provider específico ou padrão
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResult(null);

    const res = await AIService.generateText({
      prompt,
      providerId: selectedProvider || undefined,
      temperature: 0.7
    });

    setResult(res);
    setIsGenerating(false);
  };

  // Testar todos os providers
  const handleTestAll = async () => {
    if (!providers || providers.length === 0) return;
    
    setIsTesting(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (const provider of providers) {
      const start = Date.now();
      
      try {
        const res = await AIService.generateText({
          prompt: 'Diga olá em uma frase curta.',
          providerId: provider.id,
        });

        results.push({
          provider: provider.name,
          success: res.success,
          text: res.text,
          latency: res.latency || (Date.now() - start),
          tokens: res.tokens,
          error: res.error
        });
      } catch (error) {
        results.push({
          provider: provider.name,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          latency: Date.now() - start
        });
      }

      // Atualiza resultados incrementalmente
      setTestResults([...results]);
    }

    setIsTesting(false);
  };

  const defaultProvider = providers?.find(p => p.is_default);

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Teste de IA" 
        subtitle="Teste os provedores de IA configurados"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Aviso se não há providers */}
        {!loadingProviders && (!providers || providers.length === 0) && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-700">Nenhum provedor configurado</p>
                <p className="text-sm text-muted-foreground">
                  Será usado o Lovable AI Gateway como fallback.{' '}
                  <a href="/admin/ai-providers" className="text-primary underline">
                    Configurar provedores
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Painel de Geração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Testar Geração
              </CardTitle>
              <CardDescription>
                Envie um prompt para testar a integração com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de Provider */}
              <div>
                <label className="text-sm font-medium mb-2 block">Provedor</label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      defaultProvider 
                        ? `Padrão: ${defaultProvider.name}` 
                        : 'Lovable AI Gateway'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {defaultProvider ? `Padrão: ${defaultProvider.name}` : 'Lovable AI Gateway'}
                    </SelectItem>
                    {providers?.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.is_default && '(padrão)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt */}
              <div>
                <label className="text-sm font-medium mb-2 block">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Digite seu prompt aqui..."
                  rows={4}
                />
              </div>

              {/* Botão */}
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar
                  </>
                )}
              </Button>

              {/* Resultado */}
              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {result.success ? 'Sucesso' : 'Erro'}
                    </span>
                    {result.provider && (
                      <Badge variant="secondary">{result.provider}</Badge>
                    )}
                    {result.latency && (
                      <Badge variant="outline" className="ml-auto">
                        <Clock className="w-3 h-3 mr-1" />
                        {result.latency}ms
                      </Badge>
                    )}
                  </div>

                  {result.success ? (
                    <p className="text-sm whitespace-pre-wrap">{result.text}</p>
                  ) : (
                    <p className="text-sm text-red-700 dark:text-red-400">{result.error}</p>
                  )}

                  {result.tokens && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tokens usados: {result.tokens}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Painel de Teste em Lote */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Testar Todos os Provedores
              </CardTitle>
              <CardDescription>
                Verifica conexão com todos os provedores configurados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleTestAll} 
                disabled={isTesting || loadingProviders}
                variant="outline"
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Testar Todos ({providers?.length || 0} provedores)
                  </>
                )}
              </Button>

              {/* Resultados dos testes */}
              <div className="space-y-3">
                {testResults.map((test, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      test.success 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                        : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {test.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{test.provider}</span>
                      {test.latency && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {test.latency}ms
                        </Badge>
                      )}
                    </div>
                    
                    {test.success ? (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {test.text}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 mt-1">{test.error}</p>
                    )}
                  </div>
                ))}

                {testResults.length === 0 && !isTesting && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Clique em "Testar Todos" para verificar os provedores
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentação rápida */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { AIService } from '@/services/aiService';

// Gerar texto simples
const result = await AIService.generateText({
  prompt: "Escreva uma descrição criativa",
  temperature: 0.7
});

if (result.success) {
  console.log(result.text);
}

// Gerar JSON estruturado
const json = await AIService.generateJSON<{ title: string }>({
  prompt: "Crie um título para uma pizzaria"
});

// Sugerir conteúdo
const title = await AIService.suggest("Pizzaria italiana", "title");
const hashtags = await AIService.suggest("Foto de pizza", "hashtags");

// Melhorar texto
const improved = await AIService.improve("texto aqui", "criativo");`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
