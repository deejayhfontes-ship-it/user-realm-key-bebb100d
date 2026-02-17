import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Save,
  Clock,
  Palette,
  Users,
  History,
  Link,
  Eye,
  Send
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuickReply {
  id: string;
  comando: string;
  resposta: string;
}

interface Attendant {
  id: string;
  nome: string;
  status: 'online' | 'ausente' | 'ocupado';
  ativo: boolean;
}

export function LiveChatConfigTab() {
  const [chatAtivo, setChatAtivo] = useState(true);
  const [posicao, setPosicao] = useState('bottom-right');
  const [corPrimaria, setCorPrimaria] = useState('#c4ff0d');
  const [horarioInicio, setHorarioInicio] = useState('09:00');
  const [horarioFim, setHorarioFim] = useState('18:00');
  const [diasAtivos, setDiasAtivos] = useState(['seg', 'ter', 'qua', 'qui', 'sex']);
  const [mensagemBoasVindas, setMensagemBoasVindas] = useState('Olá! Como posso ajudar?');
  const [delayMensagem, setDelayMensagem] = useState(2);
  const [apenasPrimeiraVez, setApenasPrimeiraVez] = useState(true);
  const [salvarConversas, setSalvarConversas] = useState(true);
  const [periodoHistorico, setPeriodoHistorico] = useState(90);
  const [vincularCliente, setVincularCliente] = useState(true);
  const [distribuicao, setDistribuicao] = useState('round-robin');
  
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([
    { id: '1', comando: '/ola', resposta: 'Olá! Como posso ajudar?' },
    { id: '2', comando: '/aguarde', resposta: 'Aguarde um momento, por favor' },
    { id: '3', comando: '/andamento', resposta: 'Seu pedido está em andamento' },
    { id: '4', comando: '/orcamento', resposta: 'Acesse o link para fazer seu orçamento: {link}' },
  ]);

  const [attendants, setAttendants] = useState<Attendant[]>([
    { id: '1', nome: 'Admin Principal', status: 'online', ativo: true },
    { id: '2', nome: 'Suporte', status: 'ausente', ativo: false },
  ]);

  const [integracoes, setIntegracoes] = useState({
    whatsapp: false,
    email: false,
    sistemaPedidos: true,
  });

  const [novoAtalho, setNovoAtalho] = useState({ comando: '', resposta: '' });
  const [showPreview, setShowPreview] = useState(false);

  const diasSemana = [
    { value: 'seg', label: 'Seg' },
    { value: 'ter', label: 'Ter' },
    { value: 'qua', label: 'Qua' },
    { value: 'qui', label: 'Qui' },
    { value: 'sex', label: 'Sex' },
    { value: 'sab', label: 'Sáb' },
    { value: 'dom', label: 'Dom' },
  ];

  const toggleDia = (dia: string) => {
    setDiasAtivos(prev => 
      prev.includes(dia) 
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  const addQuickReply = () => {
    if (!novoAtalho.comando || !novoAtalho.resposta) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    const id = Date.now().toString();
    setQuickReplies([...quickReplies, { id, ...novoAtalho }]);
    setNovoAtalho({ comando: '', resposta: '' });
    toast({ title: 'Atalho adicionado!' });
  };

  const removeQuickReply = (id: string) => {
    setQuickReplies(quickReplies.filter(qr => qr.id !== id));
  };

  const toggleAttendant = (id: string) => {
    setAttendants(attendants.map(a => 
      a.id === id ? { ...a, ativo: !a.ativo } : a
    ));
  };

  const updateAttendantStatus = (id: string, status: Attendant['status']) => {
    setAttendants(attendants.map(a => 
      a.id === id ? { ...a, status } : a
    ));
  };

  const handleSave = () => {
    const config = {
      chat_ativo: chatAtivo,
      posicao,
      cor: corPrimaria,
      horario: {
        inicio: horarioInicio,
        fim: horarioFim,
        dias: diasAtivos,
      },
      boas_vindas: {
        mensagem: mensagemBoasVindas,
        delay: delayMensagem,
        apenas_primeira_vez: apenasPrimeiraVez,
      },
      atalhos: quickReplies,
      distribuicao,
      atendentes: attendants,
      historico: {
        salvar: salvarConversas,
        periodo: periodoHistorico,
        vincular_cliente: vincularCliente,
      },
      integracoes,
    };
    console.log('Salvando configurações:', config);
    toast({ title: 'Configurações salvas com sucesso!' });
  };

  const getStatusColor = (status: Attendant['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'ausente': return 'bg-yellow-500';
      case 'ocupado': return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão salvar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat ao Vivo</h2>
          <p className="text-muted-foreground">Configure o chat de suporte do site</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status e Posição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Chat Ativo</Label>
                  <p className="text-sm text-muted-foreground">Habilitar chat no site</p>
                </div>
                <Switch checked={chatAtivo} onCheckedChange={setChatAtivo} />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posição do Widget</Label>
                  <Select value={posicao} onValueChange={setPosicao}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Inferior Direita</SelectItem>
                      <SelectItem value="bottom-left">Inferior Esquerda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor Primária
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input 
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horário de Funcionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Horário de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input 
                    type="time" 
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input 
                    type="time" 
                    value={horarioFim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dias Ativos</Label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map(dia => (
                    <Button
                      key={dia.value}
                      variant={diasAtivos.includes(dia.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDia(dia.value)}
                      className={diasAtivos.includes(dia.value) ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {dia.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Fora do horário:</strong> Exibir mensagem automática informando horário de atendimento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem de Boas-vindas */}
          <Card>
            <CardHeader>
              <CardTitle>Mensagem de Boas-vindas</CardTitle>
              <CardDescription>Mensagem automática ao abrir o chat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea 
                  value={mensagemBoasVindas}
                  onChange={(e) => setMensagemBoasVindas(e.target.value)}
                  placeholder="Olá! Como posso ajudar?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delay (segundos)</Label>
                  <Input 
                    type="number" 
                    min={0}
                    max={10}
                    value={delayMensagem}
                    onChange={(e) => setDelayMensagem(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Checkbox 
                    id="primeira-vez"
                    checked={apenasPrimeiraVez}
                    onCheckedChange={(checked) => setApenasPrimeiraVez(!!checked)}
                  />
                  <Label htmlFor="primeira-vez" className="cursor-pointer">
                    Apenas primeira vez
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Respostas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Respostas Rápidas (Atalhos)</CardTitle>
              <CardDescription>Use comandos como /ola para respostas rápidas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {quickReplies.map(qr => (
                    <div key={qr.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="secondary" className="font-mono shrink-0">
                        {qr.comando}
                      </Badge>
                      <p className="text-sm flex-1">{qr.resposta}</p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeQuickReply(qr.id)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="space-y-3">
                <Label>Adicionar Novo Atalho</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="/comando"
                    value={novoAtalho.comando}
                    onChange={(e) => setNovoAtalho({ ...novoAtalho, comando: e.target.value })}
                    className="w-32"
                  />
                  <Input 
                    placeholder="Resposta..."
                    value={novoAtalho.resposta}
                    onChange={(e) => setNovoAtalho({ ...novoAtalho, resposta: e.target.value })}
                    className="flex-1"
                  />
                  <Button onClick={addQuickReply}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atribuição de Conversas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Atribuição de Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Distribuição</Label>
                <Select value={distribuicao} onValueChange={setDistribuicao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round-robin">Round-robin (revezamento)</SelectItem>
                    <SelectItem value="disponibilidade">Por disponibilidade</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Atendentes</Label>
                <div className="space-y-3">
                  {attendants.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={att.ativo}
                          onCheckedChange={() => toggleAttendant(att.id)}
                        />
                        <span className="font-medium">{att.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(att.status)}`} />
                        <Select 
                          value={att.status} 
                          onValueChange={(val) => updateAttendantStatus(att.id, val as Attendant['status'])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="ausente">Ausente</SelectItem>
                            <SelectItem value="ocupado">Ocupado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico e Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Histórico e Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Salvar conversas</Label>
                  <p className="text-sm text-muted-foreground">Manter histórico das conversas</p>
                </div>
                <Switch checked={salvarConversas} onCheckedChange={setSalvarConversas} />
              </div>

              <div className="space-y-2">
                <Label>Período de retenção (dias)</Label>
                <Input 
                  type="number"
                  min={30}
                  max={365}
                  value={periodoHistorico}
                  onChange={(e) => setPeriodoHistorico(Number(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vincular a cliente</Label>
                  <p className="text-sm text-muted-foreground">Auto (se logado)</p>
                </div>
                <Switch checked={vincularCliente} onCheckedChange={setVincularCliente} />
              </div>
            </CardContent>
          </Card>

          {/* Integrações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-primary" />
                Integrações
              </CardTitle>
              <CardDescription>Sincronizar conversas com outros canais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={integracoes.whatsapp}
                      onCheckedChange={(checked) => setIntegracoes({ ...integracoes, whatsapp: !!checked })}
                    />
                    <span>WhatsApp Business</span>
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={integracoes.email}
                      onCheckedChange={(checked) => setIntegracoes({ ...integracoes, email: !!checked })}
                    />
                    <span>Email</span>
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={integracoes.sistemaPedidos}
                      onCheckedChange={(checked) => setIntegracoes({ ...integracoes, sistemaPedidos: !!checked })}
                    />
                    <span>Sistema de mensagens do pedido</span>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview do Widget */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview do Widget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-muted to-muted/50 rounded-lg h-[500px] overflow-hidden">
                {/* Widget Button */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: corPrimaria }}
                >
                  <MessageCircle className="w-6 h-6 text-black" />
                </button>

                {/* Chat Window */}
                {showPreview && (
                  <div className="absolute bottom-20 right-4 w-72 bg-background rounded-2xl shadow-xl overflow-hidden border animate-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div 
                      className="p-4 flex items-center gap-3"
                      style={{ backgroundColor: corPrimaria }}
                    >
                      <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                        <span className="text-black font-bold">S</span>
                      </div>
                      <div>
                        <p className="font-semibold text-black">Suporte</p>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs text-black/70">Online</span>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="p-4 h-48 bg-muted/30">
                      <div className="bg-background p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
                        <p className="text-sm">{mensagemBoasVindas}</p>
                        <span className="text-xs text-muted-foreground">agora</span>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t flex items-center gap-2">
                      <Input 
                        placeholder="Digite sua mensagem..."
                        className="flex-1 text-sm"
                        disabled
                      />
                      <Button 
                        size="icon" 
                        className="shrink-0"
                        style={{ backgroundColor: corPrimaria }}
                      >
                        <Send className="w-4 h-4 text-black" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hint */}
                {!showPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Clique no botão para ver o preview
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
