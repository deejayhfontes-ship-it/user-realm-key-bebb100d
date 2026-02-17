import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageCircle,
  Send,
  Search,
  User,
  Archive,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  X,
  Check,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatSession {
  id: string;
  session_id: string;
  status: string;
  iniciado_em: string;
  visitor_name?: string;
  visitor_email?: string;
  user_agent?: string;
  pagina_origem?: string;
  client_id?: string;
}

interface ChatMessage {
  id: string;
  sessao_id: string;
  remetente_tipo: 'visitante' | 'admin';
  mensagem: string;
  anexo_url?: string;
  lida: boolean;
  enviada_em: string;
}

// Quick replies
const QUICK_REPLIES = [
  { command: '/ola', text: 'Olá! Como posso ajudar?' },
  { command: '/aguarde', text: 'Aguarde um momento, por favor.' },
  { command: '/andamento', text: 'Seu pedido está em andamento! Em breve teremos novidades.' },
  { command: '/orcamento', text: 'Para fazer um orçamento, acesse: https://seusite.com/briefing' },
];

export default function AdminChat() {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'todas' | 'ativas' | 'arquivadas'>('ativas');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['chat-sessions', filter],
    queryFn: async () => {
      let query = supabase
        .from('chat_sessoes')
        .select('*')
        .order('iniciado_em', { ascending: false });

      if (filter === 'ativas') {
        query = query.eq('status', 'ativa');
      } else if (filter === 'arquivadas') {
        query = query.eq('status', 'arquivada');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ChatSession[];
    },
  });

  // Fetch messages for selected session
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession?.id) return [];

      const { data, error } = await supabase
        .from('chat_mensagens')
        .select('*')
        .eq('sessao_id', selectedSession.id)
        .order('enviada_em', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedSession?.id,
  });

  // Get unread count per session
  const getUnreadCount = useCallback(async (sessionId: string) => {
    const { count } = await supabase
      .from('chat_mensagens')
      .select('*', { count: 'exact', head: true })
      .eq('sessao_id', sessionId)
      .eq('remetente_tipo', 'visitante')
      .eq('lida', false);
    return count || 0;
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (mensagem: string) => {
      if (!selectedSession?.id) throw new Error('No session selected');

      const { data, error } = await supabase
        .from('chat_mensagens')
        .insert({
          sessao_id: selectedSession.id,
          remetente_tipo: 'admin',
          mensagem,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSession?.id] });
      setInput('');
    },
    onError: () => {
      toast.error('Erro ao enviar mensagem');
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await supabase
        .from('chat_mensagens')
        .update({ lida: true })
        .eq('sessao_id', sessionId)
        .eq('remetente_tipo', 'visitante')
        .eq('lida', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  // Archive session mutation
  const archiveSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('chat_sessoes')
        .update({ status: 'arquivada', encerrado_em: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setSelectedSession(null);
      toast.success('Conversa arquivada');
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_mensagens',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
          if (selectedSession?.id) {
            queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSession.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_sessoes',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedSession?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when selecting session
  useEffect(() => {
    if (selectedSession?.id) {
      markAsReadMutation.mutate(selectedSession.id);
    }
  }, [selectedSession?.id]);

  // Handle send message
  const handleSend = () => {
    let messageToSend = input.trim();

    // Check for quick reply commands
    const quickReply = QUICK_REPLIES.find((qr) => messageToSend === qr.command);
    if (quickReply) {
      messageToSend = quickReply.text;
    }

    if (!messageToSend) return;
    sendMessageMutation.mutate(messageToSend);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format date
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}min`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h`;
    } else {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Format time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Detect device from user agent
  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="w-4 h-4" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  // Get visitor name
  const getVisitorName = (session: ChatSession) => {
    if (session.visitor_name) return session.visitor_name;
    return 'Visitante';
  };

  // Filter sessions by search
  const filteredSessions = sessions?.filter((session) => {
    if (!searchTerm) return true;
    const name = getVisitorName(session).toLowerCase();
    const email = (session.visitor_email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-muted/30">
      {/* Sessions List */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Chat ao Vivo
          </h1>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 p-2 border-b border-border">
          {(['todas', 'ativas', 'arquivadas'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f)}
              className="flex-1 capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1">
          {isLoadingSessions ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSessions?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredSessions?.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-colors',
                    selectedSession?.id === session.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{getVisitorName(session)}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(session.iniciado_em)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getDeviceIcon(session.user_agent)}
                        <Badge
                          variant={session.status === 'ativa' ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa da lista para visualizar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{getVisitorName(selectedSession)}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Iniciado {formatDate(selectedSession.iniciado_em)}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => archiveSessionMutation.mutate(selectedSession.id)}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Arquivar conversa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-2/3" />
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Nenhuma mensagem ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',
                        message.remetente_tipo === 'admin' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] px-4 py-2 rounded-2xl',
                          message.remetente_tipo === 'admin'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.mensagem}</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1',
                            message.remetente_tipo === 'admin' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <span className="text-[10px] opacity-70">
                            {formatTime(message.enviada_em)}
                          </span>
                          {message.remetente_tipo === 'admin' && (
                            <Check className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
              {QUICK_REPLIES.map((qr) => (
                <Button
                  key={qr.command}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(qr.command)}
                  className="shrink-0 text-xs"
                >
                  {qr.command}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua mensagem... (use /ola, /aguarde, etc.)"
                  className="min-h-[44px] max-h-[120px] resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Session Info Sidebar */}
      {selectedSession && (
        <div className="w-64 border-l border-border bg-card p-4 hidden xl:block">
          <h3 className="font-semibold mb-4">Informações</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Dispositivo</p>
              <div className="flex items-center gap-2 mt-1">
                {getDeviceIcon(selectedSession.user_agent)}
                <span className="truncate">
                  {selectedSession.user_agent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                </span>
              </div>
            </div>

            {selectedSession.pagina_origem && (
              <div>
                <p className="text-muted-foreground text-xs">Página de origem</p>
                <p className="truncate mt-1" title={selectedSession.pagina_origem}>
                  {new URL(selectedSession.pagina_origem).pathname || '/'}
                </p>
              </div>
            )}

            <div>
              <p className="text-muted-foreground text-xs">Iniciado em</p>
              <p className="mt-1">
                {new Date(selectedSession.iniciado_em).toLocaleString('pt-BR')}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant={selectedSession.status === 'ativa' ? 'default' : 'secondary'}>
                {selectedSession.status}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
