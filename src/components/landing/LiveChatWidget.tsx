import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
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
    'Fazer orçamento',
    'Status do pedido',
    'Suporte',
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

  // Don't render if still loading
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

  const accentColor = chatConfig.cor || '#c4ff0d';

  return (
    <div className="fixed top-5 right-5 z-50">
      {/* Floating Button - Glass Minimal */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="group relative flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          aria-label="Abrir chat"
        >
          <MessageCircle 
            className="w-[22px] h-[22px] text-white transition-transform duration-300 group-hover:scale-110" 
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-medium text-black animate-pulse"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window - Glass Minimal */}
      {isOpen && (
        <div
          className={cn(
            'flex flex-col overflow-hidden',
            // Mobile - fullscreen
            'fixed inset-0 md:relative md:inset-auto'
          )}
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '340px',
            maxHeight: '550px',
            borderRadius: '0',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'top right',
          }}
          // Desktop styles via className
          {...({} as any)}
        >
          <style>{`
            @keyframes scaleIn {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @media (min-width: 768px) {
              .chat-window-glass {
                width: 340px !important;
                height: 550px !important;
                border-radius: 20px !important;
                position: relative !important;
                inset: auto !important;
              }
            }
          `}</style>

          {/* Header - Minimal */}
          <div 
            className="flex items-center justify-between p-4 shrink-0"
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div 
                className="relative flex items-center justify-center"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1a1a1a, #333)',
                }}
              >
                <span className="text-white text-xs font-semibold">FG</span>
                {/* Online dot */}
                <span 
                  className="absolute -bottom-0.5 -right-0.5"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isOnline ? '#22c55e' : '#9ca3af',
                    border: '2px solid white',
                    boxShadow: isOnline ? '0 0 6px #22c55e' : 'none',
                  }}
                />
              </div>

              {/* Info */}
              <div>
                <p className="text-sm font-medium text-gray-900">Fontes Graphics</p>
                <p className="text-xs text-gray-500">
                  {isOnline ? 'Online' : 'Responde em breve'}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              background: 'linear-gradient(180deg, rgba(249,250,251,0.5) 0%, rgba(255,255,255,0) 100%)',
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && !showWelcome && (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <div 
                  className="flex items-center justify-center mb-4"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(0,0,0,0.04)',
                  }}
                >
                  <MessageCircle className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">Olá! 👋</p>
                <p className="text-sm text-gray-500 mb-5">Como podemos ajudar?</p>

                {/* Quick Replies */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-xs rounded-full transition-all hover:scale-105"
                      style={{
                        background: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Welcome message from admin */}
            {showWelcome && messages.length === 0 && chatConfig.mensagem_boas_vindas && (
              <div className="flex justify-start">
                <div 
                  className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-md"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
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
                  'flex',
                  message.remetente_tipo === 'visitante' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] px-3 py-2 rounded-2xl',
                    message.remetente_tipo === 'visitante'
                      ? 'rounded-br-md'
                      : 'rounded-bl-md'
                  )}
                  style={
                    message.remetente_tipo === 'visitante'
                      ? { 
                          backgroundColor: accentColor,
                          boxShadow: `0 2px 12px ${accentColor}40`,
                        }
                      : {
                          background: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }
                  }
                >
                  <p 
                    className="text-sm whitespace-pre-wrap break-words"
                    style={{
                      color: message.remetente_tipo === 'visitante' ? '#000' : '#1f2937'
                    }}
                  >
                    {message.mensagem}
                  </p>
                  {message.anexo_url && (
                    <a
                      href={message.anexo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-1 block opacity-70"
                    >
                      📎 Anexo
                    </a>
                  )}
                  <p
                    className="text-[10px] mt-1"
                    style={{
                      color: message.remetente_tipo === 'visitante' ? 'rgba(0,0,0,0.5)' : '#9ca3af'
                    }}
                  >
                    {formatTime(message.enviada_em)}
                  </p>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Minimal */}
          <div 
            className="p-3 shrink-0"
            style={{
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div 
              className="flex items-end gap-2 p-2 rounded-xl"
              style={{
                background: 'rgba(0,0,0,0.03)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Mensagem..."
                className="flex-1 resize-none bg-transparent focus:outline-none text-sm text-gray-900 placeholder:text-gray-400"
                style={{
                  minHeight: '36px',
                  maxHeight: '80px',
                }}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: input.trim() ? accentColor : 'rgba(0,0,0,0.06)',
                }}
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
