import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import type { AIImageAttachment } from '@/lib/ai-engine/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  success?: boolean;
  tokensUsed?: number;
  processingTime?: number;
  images?: AIImageAttachment[];
}

export interface EditHistoryItem {
  id: string;
  generator_id: string;
  provider_id: string | null;
  old_config: Record<string, unknown>;
  new_config: Record<string, unknown>;
  user_prompt: string;
  ai_response: string | null;
  tokens_used: number | null;
  processing_time_ms: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
  created_by: string | null;
  attachments?: AIImageAttachment[];
  provider?: {
    name: string;
  };
}

export function useAIEdit(generatorId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendMessage = useMutation({
    mutationFn: async ({ prompt, providerId, images }: { prompt: string; providerId?: string; images?: AIImageAttachment[] }) => {
      if (!generatorId) throw new Error('Nenhum gerador selecionado');

      const { data, error } = await supabase.functions.invoke('ai-edit', {
        body: {
          generatorId,
          userPrompt: prompt,
          providerId,
          images,
        },
      });

      if (error) throw error;
      return {
        ...(data as {
          success: boolean;
          newConfig?: Record<string, unknown>;
          message?: string;
          tokensUsed?: number;
          processingTime?: number;
          error?: string;
        }),
        images,
      };
    },
    onMutate: ({ prompt, images }) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
        images,
      };
      setMessages((prev) => [...prev, userMessage]);
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.success
          ? '✅ Configuração atualizada com sucesso!'
          : `❌ ${data.error || 'Erro ao processar'}`,
        timestamp: new Date(),
        success: data.success,
        tokensUsed: data.tokensUsed,
        processingTime: data.processingTime,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['generators'] });
        queryClient.invalidateQueries({ queryKey: ['generator', generatorId] });
        toast({
          title: 'Gerador atualizado',
          description: 'A configuração foi modificada pela IA.',
        });
      }
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Erro: ${error.message}`,
        timestamp: new Date(),
        success: false,
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: 'Erro ao processar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const clearMessages = () => setMessages([]);

  return {
    messages,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    clearMessages,
  };
}

export function useEditHistory(generatorId: string | null, limit = 10) {
  return useQuery({
    queryKey: ['edit-history', generatorId, limit],
    queryFn: async () => {
      if (!generatorId) return [];

      const { data, error } = await supabase
        .from('generator_edit_history')
        .select(`
          *,
          provider:ai_providers(name)
        `)
        .eq('generator_id', generatorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as EditHistoryItem[];
    },
    enabled: !!generatorId,
  });
}

export function useUndoEdit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (historyItem: EditHistoryItem) => {
      // Restaurar config anterior
      const { error } = await supabase
        .from('generators')
        .update({ 
          config: historyItem.old_config as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', historyItem.generator_id);

      if (error) throw error;

      // Registrar undo no histórico
      await supabase.from('generator_edit_history').insert({
        generator_id: historyItem.generator_id,
        old_config: historyItem.new_config as Json,
        new_config: historyItem.old_config as Json,
        user_prompt: `[UNDO] Desfazer: "${historyItem.user_prompt.substring(0, 50)}..."`,
        success: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      queryClient.invalidateQueries({ queryKey: ['edit-history'] });
      toast({
        title: 'Alteração desfeita',
        description: 'A configuração anterior foi restaurada.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao desfazer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
