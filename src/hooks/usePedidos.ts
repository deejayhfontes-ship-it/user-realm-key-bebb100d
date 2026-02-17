import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Pedido, OrcamentoData, StatusPedido, TipoPagamento } from "@/types/pedido";

// Fetch all pedidos (admin)
export function usePedidos(filters?: { status?: StatusPedido; search?: string }) {
  return useQuery({
    queryKey: ["pedidos", filters],
    queryFn: async () => {
      let query = supabase
        .from("pedidos")
        .select(`
          *,
          clients (id, name, email),
          services (id, title, icon)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.search) {
        query = query.or(`protocolo.ilike.%${filters.search}%,nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(mapPedido);
    },
  });
}

// Fetch single pedido by ID
export function usePedido(id: string | undefined) {
  return useQuery({
    queryKey: ["pedido", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          clients (id, name, email),
          services (id, title, icon)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return mapPedido(data);
    },
    enabled: !!id,
  });
}

// Fetch pedido by protocolo (public)
export function usePedidoByProtocolo(protocolo: string | undefined) {
  return useQuery({
    queryKey: ["pedido-protocolo", protocolo],
    queryFn: async () => {
      if (!protocolo) return null;
      
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          services (id, title, icon)
        `)
        .eq("protocolo", protocolo)
        .single();

      if (error) throw error;
      return mapPedido(data);
    },
    enabled: !!protocolo,
  });
}

// Fetch client's own pedidos
export function useClientPedidos() {
  return useQuery({
    queryKey: ["client-pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          services (id, title, icon)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapPedido);
    },
  });
}

// Create pedido from briefing
export function useCreatePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      nome: string;
      email: string;
      telefone?: string;
      empresa?: string;
      descricao: string;
      prazo_solicitado?: string;
      referencias?: string;
      arquivo_urls?: string[];
      service_id?: string;
    }) => {
      const insertData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        empresa: data.empresa || null,
        descricao: data.descricao,
        prazo_solicitado: data.prazo_solicitado || null,
        referencias: data.referencias || null,
        arquivo_urls: data.arquivo_urls || [],
        service_id: data.service_id || null,
        status: 'briefing' as const,
      };
      
      const { data: pedido, error } = await supabase
        .from("pedidos")
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      return pedido;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

// Update pedido status
export function useUpdatePedidoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, extras }: { 
      id: string; 
      status: StatusPedido;
      extras?: Partial<{
        data_orcamento: string;
        data_aprovacao: string;
        data_pagamento: string;
        data_pagamento_final: string;
        data_inicio_confeccao: string;
        data_entrega: string;
        prazo_final: string;
        motivo_recusa: string;
      }>;
    }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({ status, ...extras })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });
}

// Send orçamento (admin)
export function useSendOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OrcamentoData }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({
          valor_orcado: Math.round(data.valor_orcado * 100), // Convert to cents
          prazo_orcado: data.prazo_orcado,
          observacoes_admin: data.observacoes_admin || null,
          requer_pagamento_antecipado: data.requer_pagamento_antecipado,
          tipo_pagamento: data.tipo_pagamento,
          valor_entrada: data.valor_entrada ? Math.round(data.valor_entrada * 100) : null,
          condicao_pagamento: data.condicao_pagamento || null,
          status: 'orcamento_enviado',
          data_orcamento: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Orçamento enviado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar orçamento");
    },
  });
}

// Aprovar orçamento (client)
export function useAprovarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pedido }: { id: string; pedido: Pedido }) => {
      // Determinar próximo status baseado no tipo de pagamento
      let nextStatus: StatusPedido;
      
      if (pedido.requer_pagamento_antecipado) {
        nextStatus = 'aguardando_pagamento';
      } else {
        nextStatus = 'em_confeccao';
      }

      // Calcular prazo final se indo direto para confecção
      const prazoFinal = nextStatus === 'em_confeccao' && pedido.prazo_orcado
        ? calculatePrazoFinal(pedido.prazo_orcado)
        : null;

      const { error } = await supabase
        .from("pedidos")
        .update({
          status: nextStatus,
          data_aprovacao: new Date().toISOString(),
          ...(nextStatus === 'em_confeccao' && {
            data_inicio_confeccao: new Date().toISOString(),
            prazo_final: prazoFinal,
          }),
        })
        .eq("id", id);

      if (error) throw error;
      
      return { nextStatus };
    },
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      queryClient.invalidateQueries({ queryKey: ["client-pedidos"] });
      
      if (result.nextStatus === 'em_confeccao') {
        toast.success("Orçamento aprovado! Projeto iniciado.");
      } else {
        toast.success("Orçamento aprovado! Aguardando pagamento.");
      }
    },
    onError: () => {
      toast.error("Erro ao aprovar orçamento");
    },
  });
}

// Recusar orçamento (client)
export function useRecusarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo?: string }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({
          status: 'recusado',
          motivo_recusa: motivo || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      queryClient.invalidateQueries({ queryKey: ["client-pedidos"] });
      toast.success("Orçamento recusado");
    },
    onError: () => {
      toast.error("Erro ao recusar orçamento");
    },
  });
}

// Confirmar pagamento (admin)
export function useConfirmarPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pedido, isFinal }: { id: string; pedido: Pedido; isFinal?: boolean }) => {
      const updates: Record<string, unknown> = {};
      
      if (isFinal) {
        // Pagamento final (pós-entrega ou saldo parcelado)
        updates.status = 'finalizado';
        updates.data_pagamento_final = new Date().toISOString();
      } else {
        // Pagamento inicial/entrada
        updates.data_pagamento = new Date().toISOString();
        updates.status = 'em_confeccao';
        updates.data_inicio_confeccao = new Date().toISOString();
        
        if (pedido.prazo_orcado) {
          updates.prazo_final = calculatePrazoFinal(pedido.prazo_orcado);
        }
      }

      const { error } = await supabase
        .from("pedidos")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Pagamento confirmado!");
    },
    onError: () => {
      toast.error("Erro ao confirmar pagamento");
    },
  });
}

// Upload comprovante (client)
export function useUploadComprovante() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comprovanteUrl }: { id: string; comprovanteUrl: string }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({ comprovante_url: comprovanteUrl })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Comprovante enviado!");
    },
    onError: () => {
      toast.error("Erro ao enviar comprovante");
    },
  });
}

// Finalizar confecção (admin) - muda para aguardando aprovação do cliente
export function useFinalizarConfeccao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, arquivos, mensagem }: { 
      id: string; 
      arquivos: string[];
      mensagem?: string;
    }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({
          status: 'aguardando_aprovacao_cliente',
          arquivos_entregues: arquivos,
          mensagem_entrega: mensagem || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Prévia enviada para aprovação!");
    },
    onError: () => {
      toast.error("Erro ao finalizar confecção");
    },
  });
}

// Aprovar entrega (client)
export function useAprovarEntrega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pedido }: { id: string; pedido: Pedido }) => {
      // Se precisa pagamento pós-entrega
      const needsFinalPayment = 
        pedido.tipo_pagamento === 'pos_entrega' ||
        (pedido.tipo_pagamento === 'parcelado' && !pedido.data_pagamento_final);

      const { error } = await supabase
        .from("pedidos")
        .update({
          status: needsFinalPayment ? 'aguardando_pagamento_final' : 'finalizado',
          data_entrega: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      return { needsFinalPayment };
    },
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      queryClient.invalidateQueries({ queryKey: ["client-pedidos"] });
      
      if (result.needsFinalPayment) {
        toast.success("Entrega aprovada! Aguardando pagamento final.");
      } else {
        toast.success("Projeto finalizado com sucesso!");
      }
    },
    onError: () => {
      toast.error("Erro ao aprovar entrega");
    },
  });
}

// Solicitar ajustes (client)
export function useSolicitarAjustes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: 'em_ajustes' })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Ajustes solicitados");
    },
    onError: () => {
      toast.error("Erro ao solicitar ajustes");
    },
  });
}

// Avaliar pedido (client)
export function useAvaliarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nota, comentario }: { 
      id: string; 
      nota: number;
      comentario?: string;
    }) => {
      const { error } = await supabase
        .from("pedidos")
        .update({
          avaliacao_nota: nota,
          avaliacao_comentario: comentario || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pedido", id] });
      toast.success("Obrigado pela avaliação!");
    },
    onError: () => {
      toast.error("Erro ao enviar avaliação");
    },
  });
}

// Helper: Map database row to Pedido type
function mapPedido(row: Record<string, unknown>): Pedido {
  return {
    id: row.id as string,
    protocolo: row.protocolo as string,
    client_id: row.client_id as string | null,
    service_id: row.service_id as string | null,
    nome: row.nome as string,
    email: row.email as string,
    telefone: row.telefone as string | null,
    empresa: row.empresa as string | null,
    descricao: row.descricao as string,
    prazo_solicitado: row.prazo_solicitado as string | null,
    referencias: row.referencias as string | null,
    arquivo_urls: (row.arquivo_urls as string[]) || [],
    valor_orcado: row.valor_orcado as number | null,
    prazo_orcado: row.prazo_orcado as number | null,
    observacoes_admin: row.observacoes_admin as string | null,
    requer_pagamento_antecipado: row.requer_pagamento_antecipado as boolean,
    tipo_pagamento: (row.tipo_pagamento as TipoPagamento) || 'antecipado',
    valor_entrada: row.valor_entrada as number | null,
    condicao_pagamento: row.condicao_pagamento as string | null,
    status: (row.status as StatusPedido) || 'briefing',
    data_briefing: row.data_briefing as string,
    data_orcamento: row.data_orcamento as string | null,
    data_aprovacao: row.data_aprovacao as string | null,
    data_pagamento: row.data_pagamento as string | null,
    data_pagamento_final: row.data_pagamento_final as string | null,
    data_inicio_confeccao: row.data_inicio_confeccao as string | null,
    data_entrega: row.data_entrega as string | null,
    prazo_final: row.prazo_final as string | null,
    motivo_recusa: row.motivo_recusa as string | null,
    arquivos_entregues: (row.arquivos_entregues as string[]) || [],
    mensagem_entrega: row.mensagem_entrega as string | null,
    comprovante_url: row.comprovante_url as string | null,
    nota_fiscal_emitida: row.nota_fiscal_emitida as boolean,
    numero_nota_fiscal: row.numero_nota_fiscal as string | null,
    data_emissao_nf: row.data_emissao_nf as string | null,
    avaliacao_nota: row.avaliacao_nota as number | null,
    avaliacao_comentario: row.avaliacao_comentario as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    clients: row.clients as Pedido['clients'],
    services: row.services as Pedido['services'],
  };
}

// Helper: Calculate prazo final from business days
function calculatePrazoFinal(diasUteis: number): string {
  const date = new Date();
  let count = 0;
  
  while (count < diasUteis) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  
  return date.toISOString().split('T')[0];
}
