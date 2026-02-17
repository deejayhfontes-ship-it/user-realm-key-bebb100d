import { useState, useEffect } from 'react';
import { Trash2, Sparkles, History, Undo2, Loader2, Bot, User, Image as ImageIcon, AlertTriangle, Paperclip, Plus, Edit3, Wand2, ExternalLink, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useGeneratorsList } from '@/hooks/useGenerators';
import { useActiveAIProviders } from '@/hooks/useAIProviders';
import { useAIEdit, useEditHistory, useUndoEdit } from '@/hooks/useAIEdit';
import { useAICreate, type GeneratorType, BASE_TEMPLATES } from '@/hooks/useAICreate';
import { MinimalImageChat } from './ImageAttachments';
import { type ImageAttachment } from '@/lib/image-utils';
import { GeneratorVisualPreview } from './GeneratorVisualPreview';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

type EditorMode = 'edit' | 'create';

const GENERATOR_TYPES: { value: GeneratorType; label: string; dimensions: string; description?: string }[] = [
  { value: 'stories', label: 'Stories', dimensions: '1080×1920', description: 'Formato vertical para stories' },
  { value: 'carrossel', label: 'Carrossel', dimensions: '1080×1080', description: 'Multi-formato: 1080×1080, 1080×1440, Stories' },
  { value: 'carrossel_vertical', label: 'Carrossel Vertical', dimensions: '1080×1440', description: 'Multi-formato: 1080×1440, 1080×1080, Stories' },
  { value: 'post', label: 'Post Feed', dimensions: '1080×1080', description: 'Post quadrado ou vertical' },
  { value: 'custom', label: 'Personalizado', dimensions: 'Definir', description: 'Dimensões customizadas' },
];

const editExamples = [
  { text: 'Adiciona campo telefone', hasImage: false },
  { text: 'Muda cor de fundo para azul', hasImage: false },
  { text: 'Remove campo data', hasImage: false },
  { text: 'Use as cores desta imagem', hasImage: true },
];

const createExamples = [
  { text: 'Gerador de capas de destaque com upload de foto e campo de título', hasImage: false },
  { text: 'Posts quadrados com logo no canto e texto centralizado', hasImage: false },
  { text: 'Stories com fundo gradiente, 3 campos de texto e logo no topo', hasImage: false },
  { text: 'Carrossel de antes/depois com 2 uploads e texto descritivo', hasImage: false },
  { text: 'Use as cores e estilo desta imagem como base', hasImage: true },
];

interface Props {
  initialMode?: EditorMode;
}

export function AIEditorTab({ initialMode = 'edit' }: Props) {
  const navigate = useNavigate();
  
  // Mode state
  const [mode, setMode] = useState<EditorMode>(initialMode);
  
  // Edit mode state
  const [selectedGenerator, setSelectedGenerator] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);

  // Create mode state
  const [newGeneratorName, setNewGeneratorName] = useState('');
  const [newGeneratorType, setNewGeneratorType] = useState<GeneratorType>('stories');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);

  // Data hooks
  const { data: generators } = useGeneratorsList();
  const { data: providers } = useActiveAIProviders();
  
  // Edit hooks
  const { messages: editMessages, sendMessage, isSending: isEditSending, clearMessages: clearEditMessages } = useAIEdit(selectedGenerator || null);
  const { data: history } = useEditHistory(selectedGenerator || null);
  const undoMutation = useUndoEdit();
  
  // Create hooks
  const { messages: createMessages, sendCreate, isCreating, createdGeneratorId, clearMessages: clearCreateMessages } = useAICreate();

  // Derived state
  const currentGenerator = generators?.find(g => g.id === selectedGenerator);
  const currentProvider = providers?.find(p => p.id === selectedProvider);
  const supportsImages = currentProvider?.supports_images ?? true;
  
  const messages = mode === 'create' ? createMessages : editMessages;
  const isSending = mode === 'create' ? isCreating : isEditSending;
  const exampleCommands = mode === 'create' ? createExamples : editExamples;

  // When generator is created, switch to edit mode
  useEffect(() => {
    if (createdGeneratorId) {
      setSelectedGenerator(createdGeneratorId);
      setMode('edit');
      setNewGeneratorName('');
    }
  }, [createdGeneratorId]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const images = attachments.map(att => ({
      name: att.name,
      type: att.type,
      base64: att.base64,
    }));

    if (mode === 'create') {
      if (!newGeneratorName.trim()) return;
      
      sendCreate({
        name: newGeneratorName,
        type: newGeneratorType,
        customDimensions: newGeneratorType === 'custom' 
          ? { width: customWidth, height: customHeight }
          : undefined,
        userPrompt: inputValue,
        providerId: selectedProvider || undefined,
        images: images.length > 0 ? images : undefined,
      });
    } else {
      if (!selectedGenerator) return;
      
      sendMessage({ 
        prompt: inputValue, 
        providerId: selectedProvider || undefined,
        images: images.length > 0 ? images : undefined,
      });
    }
    
    setInputValue('');
    attachments.forEach(att => URL.revokeObjectURL(att.preview));
    setAttachments([]);
  };

  const handleUndo = () => {
    if (history && history.length > 0) {
      undoMutation.mutate(history[0]);
    }
  };

  const handleClear = () => {
    if (mode === 'create') {
      clearCreateMessages();
    } else {
      clearEditMessages();
    }
    attachments.forEach(att => URL.revokeObjectURL(att.preview));
    setAttachments([]);
  };

  const handleModeChange = (newMode: EditorMode) => {
    setMode(newMode);
    setInputValue('');
    attachments.forEach(att => URL.revokeObjectURL(att.preview));
    setAttachments([]);
  };

  const getPreviewConfig = () => {
    if (mode === 'create') {
      const baseTemplate = { ...BASE_TEMPLATES[newGeneratorType] };
      if (newGeneratorType === 'custom') {
        baseTemplate.dimensions = { width: customWidth, height: customHeight };
      }
      return baseTemplate;
    }
    return currentGenerator?.config;
  };

  const canSend = mode === 'create' 
    ? inputValue.trim() && newGeneratorName.trim()
    : inputValue.trim() && selectedGenerator;

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
            {/* Mode Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Modo</label>
              <RadioGroup 
                value={mode} 
                onValueChange={(v) => handleModeChange(v as EditorMode)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="mode-edit" />
                  <Label htmlFor="mode-edit" className="flex items-center gap-1.5 cursor-pointer">
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar Existente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="mode-create" />
                  <Label htmlFor="mode-create" className="flex items-center gap-1.5 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    Criar Novo
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {mode === 'edit' ? (
              /* Edit Mode Fields */
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
            ) : (
              /* Create Mode Fields */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome do novo gerador
                  </label>
                  <Input
                    value={newGeneratorName}
                    onChange={(e) => setNewGeneratorName(e.target.value)}
                    placeholder="Ex: Gerador de Posts Feed"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo base
                  </label>
                  <Select 
                    value={newGeneratorType} 
                    onValueChange={(v) => setNewGeneratorType(v as GeneratorType)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENERATOR_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{type.label}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {type.dimensions}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newGeneratorType === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Largura (px)</label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        min={100}
                        max={5000}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Altura (px)</label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        min={100}
                        max={5000}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Warning for create mode */}
                <div className="p-2.5 bg-accent/50 border border-accent rounded-xl">
                  <p className="text-xs text-accent-foreground">
                    ⚠️ Geradores criados por IA são estruturas básicas que podem precisar de ajustes manuais.
                  </p>
                </div>
              </div>
            )}

            {/* Provider Selection (both modes) */}
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
                      <div className="flex items-center gap-2">
                        {prov.name}
                        {prov.is_default && <Badge variant="secondary" className="text-[10px]">padrão</Badge>}
                        {prov.supports_images && <ImageIcon className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="soft-card border-0 flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              {mode === 'create' ? 'Criar com IA' : 'Chat com IA'}
              {mode === 'create' && (
                <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 bg-primary/10">
                  <Wand2 className="h-3 w-3" />
                  Modo Criação
                </Badge>
              )}
              {supportsImages ? (
                <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30 bg-primary/10">
                  <ImageIcon className="h-3 w-3" />
                  Imagens
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] gap-1 text-destructive border-destructive/30 bg-destructive/10">
                  <AlertTriangle className="h-3 w-3" />
                  Sem imagens
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
            {/* Mensagens */}
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {mode === 'create' ? (
                      <>
                        <p>Preencha o nome e tipo, depois descreva o gerador desejado.</p>
                        <p className="text-xs mt-2">A IA irá criar a estrutura completa para você.</p>
                      </>
                    ) : (
                      <>
                        <p>Selecione um gerador e descreva a alteração desejada.</p>
                        {supportsImages && (
                          <p className="text-xs mt-2">Você pode anexar imagens para referência.</p>
                        )}
                      </>
                    )}
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
                      {msg.role === 'user' && msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {msg.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg overflow-hidden border border-primary-foreground/20"
                            >
                              <img
                                src={`data:${img.type};base64,${img.base64}`}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
                      <p className="text-sm text-muted-foreground">
                        {mode === 'create' ? 'Criando gerador...' : 'Processando...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="mt-3">
              <MinimalImageChat
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                maxAttachments={5}
                disabled={mode === 'create' ? !newGeneratorName.trim() : !selectedGenerator}
                isSending={isSending}
                placeholder={
                  mode === 'create'
                    ? "Descreva o gerador que deseja criar..."
                    : attachments.length > 0
                      ? "Descreva o que fazer com as imagens..."
                      : "Digite sua alteração..."
                }
                supportsImages={supportsImages}
              />
              {messages.length > 0 && (
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs text-muted-foreground hover:text-destructive gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Limpar conversa
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exemplos */}
        <Card className="soft-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              💡 {mode === 'create' ? 'Exemplos para criar' : 'Exemplos de comandos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {exampleCommands.map((cmd) => (
                <Badge
                  key={cmd.text}
                  variant="outline"
                  className={cn(
                    "cursor-pointer hover:bg-primary/10 transition-colors gap-1 text-xs",
                    cmd.hasImage && "border-primary/30"
                  )}
                  onClick={() => setInputValue(cmd.text)}
                >
                  {cmd.hasImage && <ImageIcon className="h-3 w-3" />}
                  {cmd.text.length > 50 ? cmd.text.substring(0, 50) + '...' : cmd.text}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico (somente modo editar) */}
        {mode === 'edit' && history && history.length > 0 && (
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
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {history.map((item) => {
                    const hasAttachments = item.attachments && (item.attachments as unknown[]).length > 0;
                    const isCreateAction = item.user_prompt.startsWith('[CRIAR NOVO]');
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <Badge
                          variant={item.success ? (isCreateAction ? 'default' : 'secondary') : 'destructive'}
                          className="text-[10px] px-1.5 py-0 mt-0.5"
                        >
                          {isCreateAction ? '✨' : item.success ? '✓' : '✗'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p className="flex-1 font-medium leading-tight">{item.user_prompt}</p>
                            {hasAttachments && (
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <Paperclip className="h-3 w-3 text-primary" />
                                <span className="text-[10px] text-primary">
                                  {(item.attachments as unknown[]).length}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <span>
                              {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                            </span>
                            {item.provider && (
                              <>
                                <span>•</span>
                                <span>{item.provider.name}</span>
                              </>
                            )}
                            {item.tokens_used && (
                              <>
                                <span>•</span>
                                <span>{item.tokens_used} tokens</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Coluna Direita - Preview */}
      <div className="col-span-3">
        <Card className="soft-card border-0 h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                {mode === 'create' ? 'Preview do Template Base' : 'Preview em Tempo Real'}
              </CardTitle>
              {mode === 'edit' && currentGenerator && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/generators`)}
                  className="text-xs gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver gerador
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {(mode === 'create' || currentGenerator) ? (
              <Tabs defaultValue="visual" className="h-full flex flex-col">
                <TabsList className="w-fit mb-4">
                  <TabsTrigger value="visual" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Visual
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-1.5">
                    <Code className="h-3.5 w-3.5" />
                    JSON
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="visual" className="flex-1 mt-0">
                  <GeneratorVisualPreview
                    config={getPreviewConfig()}
                    name={mode === 'create' ? (newGeneratorName || 'Novo Gerador') : (currentGenerator?.name || '')}
                    type={mode === 'create' ? newGeneratorType : (currentGenerator?.type || '')}
                  />
                </TabsContent>
                
                <TabsContent value="code" className="flex-1 mt-0">
                  <div className="bg-muted/50 rounded-xl p-4 h-full">
                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(getPreviewConfig(), null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
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
