import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MessageCircle, Minimize2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'client' | 'admin';
  timestamp: Date;
  read: boolean;
}

interface ChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const quickReplies = [
  'Status do meu pedido',
  'Fazer alteração',
  'Dúvida sobre entrega',
  'Suporte técnico',
];

export function ChatWidget({ isOpen = true, onClose, isMobile = false }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'client',
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate admin typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela mensagem! Em breve um de nossos atendentes irá responder.',
        sender: 'admin',
        timestamp: new Date(),
        read: false,
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "border-none shadow-lg overflow-hidden flex flex-col",
      isMobile ? "fixed inset-0 z-50 rounded-none" : "min-h-[400px] max-h-[600px]"
    )}>
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-foreground">Suporte Fontes</h4>
            <div className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onClose}
          >
            {isMobile ? <X className="w-5 h-5" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Messages area */}
      <CardContent className="flex-1 overflow-y-auto p-4 bg-muted/30 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground mb-4">Como podemos ajudar?</p>
            
            {/* Quick replies */}
            <div className="flex flex-wrap justify-center gap-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.sender === 'client' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] px-4 py-2.5 text-sm",
                    msg.sender === 'client'
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                      : 'bg-card text-foreground rounded-2xl rounded-bl-sm shadow-sm'
                  )}
                >
                  <p>{msg.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    msg.sender === 'client' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Input area */}
      <div className="p-3 border-t bg-card flex-shrink-0">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Textarea
            placeholder="Digite sua mensagem..."
            className="min-h-[40px] max-h-[100px] resize-none border-none bg-muted/50"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
          />
          <Button 
            size="icon" 
            className="flex-shrink-0"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
