import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  sessao_id: string;
  remetente_tipo: 'visitante' | 'admin';
  remetente_id?: string;
  mensagem: string;
  anexo_url?: string;
  lida: boolean;
  enviada_em: string;
}

export interface ChatConfig {
  ativo: boolean;
  cor: string;
  posicao: string;
  mensagem_boas_vindas: string;
  horario_inicio: string;
  horario_fim: string;
  dias_atendimento: string[];
  delay_boas_vindas: number;
}

export interface ChatSession {
  id: string;
  session_id: string;
  status: string;
  iniciado_em: string;
}

const generateSessionId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useLiveChat() {
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_config')
          .select('*')
          .eq('ativo', true)
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setConfig({
            ativo: data.ativo ?? true,
            cor: data.cor ?? '#c4ff0d',
            posicao: data.posicao ?? 'bottom-right',
            mensagem_boas_vindas: data.mensagem_boas_vindas ?? 'Olá! Como posso ajudar?',
            horario_inicio: data.horario_inicio ?? '09:00',
            horario_fim: data.horario_fim ?? '18:00',
            dias_atendimento: data.dias_atendimento ?? ['seg', 'ter', 'qua', 'qui', 'sex'],
            delay_boas_vindas: data.delay_boas_vindas ?? 2,
          });

          // Check if online based on business hours
          const now = new Date();
          const currentTime = now.toTimeString().slice(0, 5);
          const currentDay = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][now.getDay()];
          
          const isWithinHours = currentTime >= (data.horario_inicio ?? '09:00') && 
                               currentTime <= (data.horario_fim ?? '18:00');
          const isWorkingDay = (data.dias_atendimento ?? ['seg', 'ter', 'qua', 'qui', 'sex']).includes(currentDay);
          
          setIsOnline(isWithinHours && isWorkingDay);
        }
      } catch (error) {
        console.error('Error loading chat config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Restore or create session
  const initSession = useCallback(async () => {
    const storedSessionId = localStorage.getItem('chat_session_id');
    const storedSessionTime = localStorage.getItem('chat_session_time');
    
    // Check if session is still valid (24h)
    if (storedSessionId && storedSessionTime) {
      const sessionTime = new Date(storedSessionTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        // Restore existing session
        const { data: existingSession } = await supabase
          .from('chat_sessoes')
          .select('*')
          .eq('session_id', storedSessionId)
          .maybeSingle();

        if (existingSession) {
          setSession(existingSession as ChatSession);
          
          // Load messages
          const { data: messagesData } = await supabase
            .from('chat_mensagens')
            .select('*')
            .eq('sessao_id', existingSession.id)
            .order('enviada_em', { ascending: true });

          if (messagesData) {
            setMessages(messagesData as ChatMessage[]);
          }
          
          return existingSession;
        }
      }
    }

    // Create new session
    const newSessionId = generateSessionId();
    const { data: newSession, error } = await supabase
      .from('chat_sessoes')
      .insert({
        session_id: newSessionId,
        status: 'ativa',
        user_agent: navigator.userAgent,
        pagina_origem: window.location.href,
      })
      .select()
      .single();

    if (newSession && !error) {
      localStorage.setItem('chat_session_id', newSessionId);
      localStorage.setItem('chat_session_time', new Date().toISOString());
      setSession(newSession as ChatSession);
      return newSession;
    }

    return null;
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`chat_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_mensagens',
          filter: `sessao_id=eq.${session.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  // Send message
  const sendMessage = useCallback(async (mensagem: string, anexo_url?: string) => {
    if (!session?.id || !mensagem.trim()) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('chat_mensagens')
        .insert({
          sessao_id: session.id,
          remetente_tipo: 'visitante',
          mensagem: mensagem.trim(),
          anexo_url,
        })
        .select()
        .single();

      if (data && !error) {
        // Update local state immediately for better UX
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data as ChatMessage];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [session?.id]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!session?.id) return;

    await supabase
      .from('chat_mensagens')
      .update({ lida: true })
      .eq('sessao_id', session.id)
      .eq('remetente_tipo', 'admin')
      .eq('lida', false);
  }, [session?.id]);

  return {
    config,
    session,
    messages,
    isLoading,
    isOnline,
    isSending,
    initSession,
    sendMessage,
    markAsRead,
  };
}
