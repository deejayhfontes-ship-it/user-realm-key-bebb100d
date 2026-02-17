import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Entrega, StatusEntrega, TipoEntrega, ArquivoEntrega } from '@/types/entrega';
import type { Json } from '@/integrations/supabase/types';

// Gerar token único
function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper para converter Json[] para ArquivoEntrega[]
function parseArquivos(arquivos: Json | null): ArquivoEntrega[] {
  if (!arquivos) return [];
  if (!Array.isArray(arquivos)) return [];
  return arquivos.map((item: any) => ({
    nome: item?.nome || '',
    url: item?.url || '',
    tamanho: item?.tamanho || '',
    tipo: item?.tipo
  }));
}

// Hook para listar entregas
export function useEntregas(filters?: { status?: string; busca?: string }) {
  return useQuery({
    queryKey: ['entregas', filters],
    queryFn: async () => {
      let query = supabase
        .from('entregas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.busca) {
        query = query.or(`protocolo.ilike.%${filters.busca}%,cliente_nome.ilike.%${filters.busca}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        arquivos: parseArquivos(item.arquivos)
      })) as unknown as Entrega[];
    },
  });
}

// Hook para buscar uma entrega específica
export function useEntrega(id: string | undefined) {
  return useQuery({
    queryKey: ['entrega', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        arquivos: parseArquivos(data.arquivos)
      } as unknown as Entrega;
    },
    enabled: !!id,
  });
}

// Hook para buscar entrega por token (público)
export function useEntregaByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['entrega-token', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('token', token)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        arquivos: parseArquivos(data.arquivos)
      } as unknown as Entrega;
    },
    enabled: !!token,
  });
}

// Interface para criar entrega
interface CreateEntregaData {
  pedido_id: string;
  protocolo: string;
  cliente_id?: string;
  cliente_nome?: string;
  cliente_email?: string;
  cliente_whatsapp?: string;
  servico_nome?: string;
  tipo: TipoEntrega;
  arquivos?: ArquivoEntrega[];
  link_externo?: string;
  mensagem?: string;
  dias_validade: number;
  enviar?: boolean;
}

// Hook para criar entrega
export function useCreateEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEntregaData) => {
      const token = generateToken();
      const baseUrl = window.location.origin;
      const link_acesso = `${baseUrl}/entrega/${token}`;
      
      const expira_em = data.dias_validade > 0 
        ? new Date(Date.now() + data.dias_validade * 24 * 60 * 60 * 1000).toISOString()
        : null;
      
      const { data: entrega, error } = await supabase
        .from('entregas')
        .insert({
          pedido_id: data.pedido_id,
          protocolo: data.protocolo,
          cliente_id: data.cliente_id || null,
          cliente_nome: data.cliente_nome || null,
          cliente_email: data.cliente_email || null,
          cliente_whatsapp: data.cliente_whatsapp || null,
          servico_nome: data.servico_nome || null,
          status: data.enviar ? 'enviado' : 'rascunho',
          tipo: data.tipo,
          arquivos: (data.arquivos || []) as unknown as Json,
          link_externo: data.link_externo || null,
          mensagem: data.mensagem || null,
          token,
          link_acesso,
          expira_em,
          dias_validade: data.dias_validade,
          data_envio: data.enviar ? new Date().toISOString() : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log de criação
      await supabase.from('entregas_logs').insert({
        entrega_id: entrega.id,
        evento: 'criado',
        descricao: 'Entrega criada',
      });
      
      return entrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast.success('Entrega criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar entrega: ${error.message}`);
    },
  });
}

// Hook para atualizar entrega
export function useUpdateEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, arquivos, ...rest }: Partial<Entrega> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...rest };
      if (arquivos) {
        updateData.arquivos = arquivos as unknown as Json;
      }
      
      const { data: entrega, error } = await supabase
        .from('entregas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return entrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast.success('Entrega atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

// Hook para enviar entrega
export function useSendEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: entrega, error } = await supabase
        .from('entregas')
        .update({
          status: 'enviado' as StatusEntrega,
          data_envio: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log de envio
      await supabase.from('entregas_logs').insert({
        entrega_id: id,
        evento: 'enviado_email',
        descricao: 'Entrega enviada',
      });
      
      return entrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast.success('Entrega enviada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });
}

// Hook para revogar entrega
export function useRevokeEntrega() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: entrega, error } = await supabase
        .from('entregas')
        .update({
          status: 'revogado' as StatusEntrega,
          revogado_em: new Date().toISOString(),
          revogado_por: user?.id || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log de revogação
      await supabase.from('entregas_logs').insert({
        entrega_id: id,
        evento: 'revogado',
        descricao: 'Acesso revogado pelo admin',
      });
      
      return entrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast.success('Acesso revogado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao revogar: ${error.message}`);
    },
  });
}

// Hook para registrar acesso (público)
export function useRegisterAccess() {
  return useMutation({
    mutationFn: async ({ id, ip, userAgent }: { id: string; ip?: string; userAgent?: string }) => {
      // Buscar entrega atual para incrementar contador
      const { data: current } = await supabase
        .from('entregas')
        .select('total_acessos')
        .eq('id', id)
        .single();
      
      // Atualizar contador
      await supabase
        .from('entregas')
        .update({
          total_acessos: (current?.total_acessos || 0) + 1,
          ultimo_acesso: new Date().toISOString(),
        })
        .eq('id', id);
      
      // Log de acesso
      await supabase.from('entregas_logs').insert({
        entrega_id: id,
        evento: 'acessado',
        descricao: 'Link de entrega acessado',
        ip_address: ip || null,
        user_agent: userAgent || null,
      });
    },
  });
}

// Hook para estatísticas
export function useEntregasStats() {
  return useQuery({
    queryKey: ['entregas-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entregas')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        rascunho: data.filter(e => e.status === 'rascunho').length,
        pronto_envio: data.filter(e => e.status === 'pronto_envio').length,
        enviado: data.filter(e => e.status === 'enviado').length,
        expirado: data.filter(e => e.status === 'expirado').length,
        revogado: data.filter(e => e.status === 'revogado').length,
      };
      
      return stats;
    },
  });
}
