import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: 'fixed' | 'package';
  status: string;
  monthly_credits: number | null;
  package_credits: number | null;
  package_credits_used: number | null;
  access_expires_at: string | null;
  contract_start: string | null;
  contract_end: string | null;
  notes: string | null;
  logo_url: string | null;
}

export interface ClientGenerator {
  id: string;
  generator_id: string;
  credits_used: number;
  credits_limit: number | null;
  enabled: boolean;
  time_limit_start: string | null;
  time_limit_end: string | null;
  allowed_weekdays: number[];
  generator: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    config: any;
    preview_image_url: string | null;
  };
}

export interface Generation {
  id: string;
  generator_id: string;
  created_at: string;
  success: boolean;
  prompt: string | null;
  processing_time_ms: number | null;
  generator_name?: string;
}

export function useClientData() {
  const { profile } = useAuth();

  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client-data', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', profile.client_id)
        .single();

      if (error) throw error;
      return data as ClientData;
    },
    enabled: !!profile?.client_id,
  });

  // Fetch client's generators
  const { data: generators, isLoading: isLoadingGenerators, refetch: refetchGenerators } = useQuery({
    queryKey: ['client-generators', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      const { data, error } = await supabase
        .from('client_generators')
        .select(`
          id,
          generator_id,
          credits_used,
          credits_limit,
          enabled,
          time_limit_start,
          time_limit_end,
          allowed_weekdays,
          generators (
            id,
            name,
            slug,
            description,
            type,
            config,
            preview_image_url
          )
        `)
        .eq('client_id', profile.client_id)
        .eq('enabled', true);

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        generator: item.generators
      })) as ClientGenerator[];
    },
    enabled: !!profile?.client_id,
  });

  // Fetch recent generations
  const { data: recentGenerations, isLoading: isLoadingGenerations } = useQuery({
    queryKey: ['client-recent-generations', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      const { data, error } = await supabase
        .from('generations')
        .select(`
          id,
          generator_id,
          created_at,
          success,
          prompt,
          processing_time_ms,
          generators (name)
        `)
        .eq('client_id', profile.client_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        generator_name: item.generators?.name
      })) as Generation[];
    },
    enabled: !!profile?.client_id,
  });

  // Fetch total generations count
  const { data: totalGenerations } = useQuery({
    queryKey: ['client-total-generations', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return 0;
      
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', profile.client_id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.client_id,
  });

  // Calculate credits info
  const creditsInfo = {
    used: client?.type === 'package' 
      ? (client?.package_credits_used || 0)
      : (generators?.reduce((acc, g) => acc + (g.credits_used || 0), 0) || 0),
    total: client?.type === 'package' 
      ? (client?.package_credits || 0)
      : (client?.monthly_credits || Infinity),
    remaining: client?.type === 'package'
      ? ((client?.package_credits || 0) - (client?.package_credits_used || 0))
      : (client?.monthly_credits 
        ? (client.monthly_credits - (generators?.reduce((acc, g) => acc + (g.credits_used || 0), 0) || 0))
        : Infinity),
  };

  return {
    client,
    generators,
    recentGenerations,
    totalGenerations,
    creditsInfo,
    isLoading: isLoadingClient || isLoadingGenerators || isLoadingGenerations,
    refetchGenerators,
  };
}

// Check if generator can be used
export function checkGeneratorAccess(
  generator: ClientGenerator,
  client: ClientData | null | undefined
): { allowed: boolean; reason: string; details?: string } {
  if (!client) {
    return { allowed: false, reason: 'Cliente não encontrado' };
  }

  // Check client status
  if (client.status === 'blocked') {
    return { allowed: false, reason: 'Conta bloqueada', details: 'Entre em contato com o suporte.' };
  }

  if (client.status === 'expired') {
    return { allowed: false, reason: 'Pacote expirado', details: 'Entre em contato para renovar.' };
  }

  // Check package credits
  if (client.type === 'package') {
    const remaining = (client.package_credits || 0) - (client.package_credits_used || 0);
    if (remaining <= 0) {
      return { 
        allowed: false, 
        reason: 'Sem créditos',
        details: 'Seu pacote esgotou os créditos. Contate o suporte.'
      };
    }
  }

  // Check generator-specific credit limit
  if (generator.credits_limit !== null && generator.credits_used >= generator.credits_limit) {
    return {
      allowed: false,
      reason: 'Limite atingido',
      details: `Você atingiu o limite de ${generator.credits_limit} gerações para este gerador.`
    };
  }

  // Check time restrictions
  if (generator.time_limit_start && generator.time_limit_end) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = generator.time_limit_start.split(':').map(Number);
    const [endH, endM] = generator.time_limit_end.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return {
        allowed: false,
        reason: 'Fora do horário',
        details: `Disponível das ${generator.time_limit_start} às ${generator.time_limit_end}`
      };
    }
  }

  // Check allowed weekdays
  if (generator.allowed_weekdays && generator.allowed_weekdays.length > 0 && generator.allowed_weekdays.length < 7) {
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    
    if (!generator.allowed_weekdays.includes(today)) {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const allowedDayNames = generator.allowed_weekdays.map(d => days[d]).join(', ');
      return {
        allowed: false,
        reason: 'Dia não permitido',
        details: `Disponível: ${allowedDayNames}`
      };
    }
  }

  return { allowed: true, reason: 'Disponível' };
}
