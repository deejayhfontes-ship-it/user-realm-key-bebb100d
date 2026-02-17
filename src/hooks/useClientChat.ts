import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'client' | 'admin';
  timestamp: Date;
  read: boolean;
}

export function useClientChat() {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get or create chat session
  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ['client-chat-session', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return null;
      
      // Check for existing open session
      const { data: existingSession, error: fetchError } = await supabase
        .from('chat_sessoes')
        .select('*')
        .eq('client_id', profile.client_id)
        .is('encerrado_em', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession) {
        setSessionId(existingSession.id);
        return existingSession;
      }

      // Create new session if none exists
      const newSessionId = crypto.randomUUID();
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessoes')
        .insert({
          session_id: newSessionId,
          client_id: profile.client_id,
          visitor_name: profile?.email?.split('@')[0] || 'Cliente',
          visitor_email: profile?.email,
          status: 'aguardando',
          iniciado_em: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;
      
      setSessionId(newSession?.id || null);
      return newSession;
    },
    enabled: !!profile?.client_id,
  });

  // Fetch messages for the session
  const { data: messages, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['client-chat-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('chat_mensagens')
        .select('*')
        .eq('sessao_id', sessionId)
        .order('enviada_em', { ascending: true });

      if (error) throw error;
      
      return (data || []).map((msg): ChatMessage => ({
        id: msg.id,
        text: msg.mensagem,
        sender: msg.remetente_tipo === 'admin' ? 'admin' : 'client',
        timestamp: new Date(msg.enviada_em || ''),
        read: msg.lida || false,
      }));
    },
    enabled: !!sessionId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!sessionId || !user?.id) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('chat_mensagens')
        .insert({
          sessao_id: sessionId,
          mensagem: text,
          remetente_tipo: 'client',
          remetente_id: user.id,
          lida: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update session status
      await supabase
        .from('chat_sessoes')
        .update({ 
          status: 'ativo',
          updated_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-chat-messages', sessionId] });
    },
  });

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!sessionId) return;
    
    await supabase
      .from('chat_mensagens')
      .update({ lida: true })
      .eq('sessao_id', sessionId)
      .eq('remetente_tipo', 'admin')
      .eq('lida', false);

    queryClient.invalidateQueries({ queryKey: ['client-chat-messages', sessionId] });
  }, [sessionId, queryClient]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_mensagens',
          filter: `sessao_id=eq.${sessionId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['client-chat-messages', sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  const sendMessage = useCallback((text: string) => {
    return sendMessageMutation.mutateAsync(text);
  }, [sendMessageMutation]);

  const unreadCount = messages?.filter(m => m.sender === 'admin' && !m.read).length || 0;

  return {
    messages: messages || [],
    sendMessage,
    markAsRead,
    isLoading: isLoadingSession || isLoadingMessages,
    isSending: sendMessageMutation.isPending,
    sessionId,
    unreadCount,
    refetchMessages,
  };
}
