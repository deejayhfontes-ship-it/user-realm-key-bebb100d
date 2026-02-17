import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface ConsumeCreditsParams {
  generatorId: string;
  prompt?: string;
  inputData?: Json;
}

interface ConsumeCreditsResult {
  success: boolean;
  generationId?: string;
  remainingCredits?: number;
  error?: string;
}

export function useConsumeCredit() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isConsuming, setIsConsuming] = useState(false);

  const consumeCreditMutation = useMutation({
    mutationFn: async ({ generatorId, prompt, inputData }: ConsumeCreditsParams): Promise<ConsumeCreditsResult> => {
      if (!profile?.client_id || !profile?.id) {
        throw new Error('Usuário não autenticado');
      }

      // First check if client has credits available
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('type, package_credits, package_credits_used, status')
        .eq('id', profile.client_id)
        .single();

      if (clientError) {
        throw new Error('Erro ao verificar créditos');
      }

      if (clientData.status !== 'active') {
        throw new Error('Conta não está ativa');
      }

      // Check credits for package type
      if (clientData.type === 'package') {
        const remaining = (clientData.package_credits || 0) - (clientData.package_credits_used || 0);
        if (remaining <= 0) {
          throw new Error('Créditos insuficientes');
        }
      }

      // Insert generation record (triggers will handle credit increment)
      const { data: generation, error: genError } = await supabase
        .from('generations')
        .insert([{
          client_id: profile.client_id,
          user_id: profile.id,
          generator_id: generatorId,
          prompt: prompt || null,
          input_data: inputData || null,
          success: true,
        }])
        .select('id')
        .single();

      if (genError) {
        // Check if it's a credit error from the trigger
        if (genError.message.includes('Créditos insuficientes')) {
          throw new Error('Créditos insuficientes');
        }
        if (genError.message.includes('não está ativo')) {
          throw new Error('Conta não está ativa');
        }
        throw new Error('Erro ao registrar geração');
      }

      // Fetch updated credit info
      const { data: updatedClient } = await supabase
        .from('clients')
        .select('package_credits, package_credits_used')
        .eq('id', profile.client_id)
        .single();

      const remainingCredits = updatedClient 
        ? (updatedClient.package_credits || 0) - (updatedClient.package_credits_used || 0)
        : undefined;

      return {
        success: true,
        generationId: generation.id,
        remainingCredits,
      };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-data'] });
      queryClient.invalidateQueries({ queryKey: ['client-generators'] });
      queryClient.invalidateQueries({ queryKey: ['client-recent-generations'] });
      queryClient.invalidateQueries({ queryKey: ['client-total-generations'] });

      toast({
        title: 'Arte gerada!',
        description: data.remainingCredits !== undefined 
          ? `1 crédito consumido. Saldo: ${data.remainingCredits} créditos.`
          : '1 crédito consumido.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível gerar a arte.',
      });
    },
  });

  const consumeCredit = async (params: ConsumeCreditsParams): Promise<ConsumeCreditsResult> => {
    setIsConsuming(true);
    try {
      return await consumeCreditMutation.mutateAsync(params);
    } finally {
      setIsConsuming(false);
    }
  };

  const checkCreditsAvailable = async (): Promise<{ available: boolean; remaining: number; message?: string }> => {
    if (!profile?.client_id) {
      return { available: false, remaining: 0, message: 'Usuário não autenticado' };
    }

    const { data: clientData, error } = await supabase
      .from('clients')
      .select('type, package_credits, package_credits_used, status')
      .eq('id', profile.client_id)
      .single();

    if (error || !clientData) {
      return { available: false, remaining: 0, message: 'Erro ao verificar créditos' };
    }

    if (clientData.status !== 'active') {
      return { available: false, remaining: 0, message: 'Conta não está ativa' };
    }

    // Fixed type = unlimited
    if (clientData.type === 'fixed') {
      return { available: true, remaining: Infinity };
    }

    const remaining = (clientData.package_credits || 0) - (clientData.package_credits_used || 0);
    
    if (remaining <= 0) {
      return { available: false, remaining: 0, message: 'Créditos esgotados' };
    }

    return { available: true, remaining };
  };

  return {
    consumeCredit,
    checkCreditsAvailable,
    isConsuming,
    isPending: consumeCreditMutation.isPending,
  };
}
