import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLiveChat, ChatMessage } from '@/hooks/useLiveChat';

export function LiveChatWidget() {
  const {
    config,
    session,
    messages,
    isLoading,
    isOnline,
    isSending,
    initSession,
    sendMessage,
    markAsRead,
  } = useLiveChat();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick reply options
  const quickReplies = [
    'Status do meu pedido',
    'Fazer um orçamento',
    'Dúvida sobre entrega',
    'Suporte técnico',
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message after delay
  useEffect(() => {
    if (isOpen && !showWelcome && messages.length === 0) {
      const delay = config?.delay_boas_vindas ?? 2;
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showWelcome, messages.length, config?.delay_boas_vindas]);

  // Initialize session when chat opens
  useEffect(() => {
    if (isOpen && !initialized) {
      initSession();
      setInitialized(true);
      markAsRead();
    }
  }, [isOpen, initialized, initSession, markAsRead]);

  // Handle open chat
  const handleOpen = () => {
    setIsOpen(true);
  };

  // Handle close chat
  const handleClose = () => {
    setIsOpen(false);
  };

  // Handle send message
  const handleSend = () => {
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput('');
    textareaRef.current?.focus();
  };

  // Handle quick reply click
  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Count unread admin messages
  const unreadCount = messages.filter(
    (m) => m.remetente_tipo === 'admin' && !m.lida
  ).length;

  // Don't render if still loading. Show by default if no config exists yet.
  if (isLoading) {
    return null;
  }

  // If config exists but chat is disabled, don't render
  if (config && config.ativo === false) {
    return null;
  }

  // Default config fallback when no config exists in database
  const chatConfig = config || {
    ativo: true,
    cor: '#c4ff0d',
    posicao: 'top-right',
    delay_boas_vindas: 2,
    mensagem_boas_vindas: 'Olá! Como posso ajudar?',
  };

  // Format time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={cn(
            'fixed z-50 flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-2xl transition-all duration-300 hover:scale-110',
            chatConfig.posicao === 'top-left' ? 'top-6 left-6' : 'top-6 right-6'
          )}
          style={{ backgroundColor: chatConfig.cor }}
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-7 h-7 text-black" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-5 duration-300',
            // Desktop
            'md:top-6 md:w-[380px] md:h-[600px] md:rounded-2xl',
            chatConfig.posicao === 'top-left' ? 'md:left-6' : 'md:right-6',
            // Mobile - fullscreen
            'bottom-0 left-0 right-0 top-0 md:bottom-auto rounded-none'
          )}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center gap-3 shrink-0"
            style={{ backgroundColor: chatConfig.cor }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-black/80" />
              </div>
              <span
                className={cn(
                  'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-black">Fontes Graphics</p>
              <p className="text-sm text-black/60">
                {isOnline ? 'Online agora' : 'Responde em breve'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-black/70 hover:text-black hover:bg-black/10 md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-black/70 hover:text-black hover:bg-black/10 hidden md:flex"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {/* Empty state with welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-xl font-semibold text-gray-800 mb-2">Olá! 👋</p>
                <p className="text-gray-600 mb-6">Como podemos ajudar?</p>

                {/* Quick Replies */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-4 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Welcome message from admin */}
            {showWelcome && messages.length === 0 && chatConfig.mensagem_boas_vindas && (
              <div className="flex justify-start animate-in slide-in-from-left-5">
                <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white shadow-sm">
                  <p className="text-sm text-gray-800">{chatConfig.mensagem_boas_vindas}</p>
                  <p className="text-[10px] text-gray-400 mt-1">agora</p>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex animate-in',
                  message.remetente_tipo === 'visitante'
                    ? 'justify-end slide-in-from-right-5'
                    : 'justify-start slide-in-from-left-5'
                )}
              >
                <div
                  className={cn(
                    'max-w-[75%] px-4 py-3 rounded-2xl',
                    message.remetente_tipo === 'visitante'
                      ? 'rounded-br-sm text-black'
                      : 'rounded-bl-sm bg-white shadow-sm text-gray-800'
                  )}
                  style={
                    message.remetente_tipo === 'visitante'
                      ? { backgroundColor: chatConfig.cor }
                      : undefined
                  }
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.mensagem}
                  </p>
                  {message.anexo_url && (
                    <a
                      href={message.anexo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-1 block"
                    >
                      📎 Anexo
                    </a>
                  )}
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      message.remetente_tipo === 'visitante'
                        ? 'text-black/50'
                        : 'text-gray-400'
                    )}
                  >
                    {formatTime(message.enviada_em)}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 shrink-0"
                disabled
                title="Em breve"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 p-2 text-sm"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="shrink-0 rounded-full"
                style={{ backgroundColor: chatConfig.cor }}
              >
                <Send className="w-4 h-4 text-black" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
