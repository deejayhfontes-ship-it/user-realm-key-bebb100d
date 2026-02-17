import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NotaFiscal, NotaFiscalFormData } from '@/types/nfe';

export function useNotasFiscais() {
  const queryClient = useQueryClient();

  const { data: notas = [], isLoading, error } = useQuery({
    queryKey: ['notas-fiscais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotaFiscal[];
    },
  });

  const createNota = useMutation({
    mutationFn: async (formData: NotaFiscalFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar próximo número
      const { data: nextNumber, error: numError } = await supabase.rpc('get_next_nota_number', {
        p_user_id: user.id,
        p_tipo: formData.tipo,
      });

      if (numError) throw numError;

      // Calcular impostos
      const valorServico = formData.valor_servico;
      const valorDesconto = formData.valor_desconto || 0;
      const valorLiquido = valorServico - valorDesconto;
      const issqnValor = Math.round((valorLiquido * formData.issqn_aliquota) / 100);

      const payload = {
        user_id: user.id,
        invoice_id: formData.invoice_id || null,
        cliente_id: formData.cliente_id || null,
        tipo: formData.tipo,
        numero: nextNumber,
        serie: '1',
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj.replace(/\D/g, ''),
        cliente_nome: formData.cliente_nome,
        cliente_endereco: formData.cliente_endereco || null,
        cliente_municipio: formData.cliente_municipio || null,
        cliente_uf: formData.cliente_uf || null,
        cliente_email: formData.cliente_email || null,
        natureza_operacao: formData.natureza_operacao || 'Prestação de Serviços de Design',
        codigo_servico_municipio: formData.codigo_servico_municipio || null,
        descricao_servico: formData.descricao_servico,
        valor_servico: valorServico,
        valor_desconto: valorDesconto,
        valor_liquido: valorLiquido,
        issqn_aliquota: formData.issqn_aliquota,
        issqn_valor: issqnValor,
        issqn_retido: formData.issqn_retido || false,
        status: 'digitacao' as const,
      };

      const { data, error } = await supabase
        .from('notas_fiscais')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as NotaFiscal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Nota fiscal criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar nota fiscal:', error);
      toast.error('Erro ao criar nota fiscal');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, motivo }: { id: string; status: NotaFiscal['status']; motivo?: string }) => {
      const payload: Partial<NotaFiscal> = { status };
      if (motivo) payload.motivo_status = motivo;

      const { error } = await supabase
        .from('notas_fiscais')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  const transmitirNota = useMutation({
    mutationFn: async (id: string) => {
      // Por enquanto, apenas muda o status para "enviada" (modo manual)
      // Futuramente, aqui entraria a integração com APIs (Focus, Tecnospeed, etc)
      const { error } = await supabase
        .from('notas_fiscais')
        .update({ 
          status: 'enviada',
          data_emissao: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Nota transmitida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao transmitir nota:', error);
      toast.error('Erro ao transmitir nota');
    },
  });

  const cancelarNota = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { error } = await supabase
        .from('notas_fiscais')
        .update({ 
          status: 'cancelada',
          motivo_status: motivo,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Nota cancelada!');
    },
    onError: (error) => {
      console.error('Erro ao cancelar nota:', error);
      toast.error('Erro ao cancelar nota');
    },
  });

  const deleteNota = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Nota removida!');
    },
    onError: (error) => {
      console.error('Erro ao remover nota:', error);
      toast.error('Erro ao remover nota');
    },
  });

  return {
    notas,
    isLoading,
    error,
    createNota,
    updateStatus,
    transmitirNota,
    cancelarNota,
    deleteNota,
  };
}
