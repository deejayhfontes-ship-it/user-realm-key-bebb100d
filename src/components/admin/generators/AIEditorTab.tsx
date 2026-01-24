import { useState } from 'react';
import { Send, Trash2, Sparkles, History, Undo2, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useGeneratorsList } from '@/hooks/useGenerators';
import { useActiveAIProviders } from '@/hooks/useAIProviders';
import { useAIEdit, useEditHistory, useUndoEdit } from '@/hooks/useAIEdit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const exampleCommands = [
  'Adiciona campo telefone',
  'Muda cor de fundo para azul',
  'Remove campo data',
  'Aumenta fonte para 72px',
  'Adiciona logo no topo direito',
];

export function AIEditorTab() {
  const [selectedGenerator, setSelectedGenerator] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [inputValue, setInputValue] = useState('');

  const { data: generators } = useGeneratorsList();
  const { data: providers } = useActiveAIProviders();
  const { messages, sendMessage, isSending, clearMessages } = useAIEdit(selectedGenerator || null);
  const { data: history } = useEditHistory(selectedGenerator || null);
  const undoMutation = useUndoEdit();

  const currentGenerator = generators?.find(g => g.id === selectedGenerator);

  const handleSend = () => {
    if (!inputValue.trim() || !selectedGenerator) return;
    sendMessage({ prompt: inputValue, providerId: selectedProvider || undefined });
    setInputValue('');
  };

  const handleUndo = () => {
    if (history && history.length > 0) {
      undoMutation.mutate(history[0]);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-6 h-[calc(100vh-220px)]">
      {/* Coluna Esquerda - Configurações e Chat */}
      <div className="col-span-2 flex flex-col gap-4">
        {/* Configurações */}
        <Card className="soft-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Gerador a editar
              </label>
              <Select value={selectedGenerator} onValueChange={setSelectedGenerator}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione um gerador" />
                </SelectTrigger>
                <SelectContent>
                  {generators?.map((gen) => (
                    <SelectItem key={gen.id} value={gen.id}>
                      {gen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Provedor de IA
              </label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Usar padrão" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.map((prov) => (
                    <SelectItem key={prov.id} value={prov.id}>
                      {prov.name} {prov.is_default && '(padrão)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!providers || providers.length === 0) && (
                <p className="text-xs text-muted-foreground">
                  Nenhum provedor configurado. Configure em Configurações → Provedores de IA.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="soft-card border-0 flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Chat com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
            {/* Mensagens */}
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Selecione um gerador e descreva a alteração desejada.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-2',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 max-w-[85%]',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.tokensUsed && (
                        <p className="text-xs opacity-70 mt-1">
                          {msg.tokensUsed} tokens • {msg.processingTime}ms
                        </p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <p className="text-sm text-muted-foreground">Processando...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="space-y-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua alteração..."
                className="rounded-xl resize-none min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!selectedGenerator || isSending}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || !selectedGenerator || isSending}
                  className="flex-1 rounded-xl gap-2"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar
                </Button>
                <Button
                  variant="outline"
                  onClick={clearMessages}
                  disabled={messages.length === 0}
                  className="rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exemplos */}
        <Card className="soft-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">💡 Exemplos de comandos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {exampleCommands.map((cmd) => (
                <Badge
                  key={cmd}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setInputValue(cmd)}
                >
                  {cmd}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        {history && history.length > 0 && (
          <Card className="soft-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico (últimas 10)
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={undoMutation.isPending}
                  className="h-8 text-xs gap-1"
                >
                  <Undo2 className="h-3 w-3" />
                  Desfazer última
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/50"
                    >
                      <Badge
                        variant={item.success ? 'default' : 'destructive'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.success ? '✓' : '✗'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{item.user_prompt}</p>
                        <p className="text-muted-foreground">
                          {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          {item.provider && ` • ${item.provider.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Coluna Direita - Preview */}
      <div className="col-span-3">
        <Card className="soft-card border-0 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              👁️ Preview em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentGenerator ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currentGenerator.type}</Badge>
                  <span className="font-medium">{currentGenerator.name}</span>
                </div>
                <Separator />
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    Configuração atual:
                  </p>
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(currentGenerator.config, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Selecione um gerador para ver o preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
