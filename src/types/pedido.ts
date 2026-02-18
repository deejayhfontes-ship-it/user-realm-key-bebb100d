// Tipos de pedido
export type OrderType = 'package' | 'service_selection' | 'custom';

// Modos de pagamento
export type PaymentMode =
  | 'full'
  | 'split_50_50'
  | 'split_30_70'
  | 'split_custom'
  | 'installments';

// Tipos de pagamento disponíveis
export type TipoPagamento =
  | 'antecipado'
  | 'faturamento'
  | 'pos_entrega'
  | 'parcelado'
  | 'sem_custo';

// Status possíveis do pedido
export type StatusPedido =
  | 'briefing'
  | 'orcamento_enviado'
  | 'orcamento_aprovado'
  | 'aguardando_pagamento'
  | 'pagamento_confirmado'
  | 'em_confeccao'
  | 'aguardando_aprovacao_cliente'
  | 'em_ajustes'
  | 'aguardando_pagamento_final'
  | 'finalizado'
  | 'cancelado'
  | 'recusado';

// Interface do pedido
export interface Pedido {
  id: string;
  protocolo: string;
  client_id: string | null;
  service_id: string | null;

  // Tipo de pedido
  order_type: OrderType;

  // Dados do briefing
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  descricao: string;
  prazo_solicitado: string | null;
  referencias: string | null;
  arquivo_urls: string[];

  // Briefing dinâmico
  briefing_template_id: string | null;
  briefing_data: Record<string, unknown>;
  briefing_completeness_score: number;

  // Dados do orçamento
  valor_orcado: number | null;
  prazo_orcado: number | null;
  observacoes_admin: string | null;
  discount_amount: number;
  discount_reason: string | null;

  // Configuração de pagamento
  requer_pagamento_antecipado: boolean;
  tipo_pagamento: TipoPagamento;
  payment_mode: PaymentMode;
  valor_entrada: number | null;
  condicao_pagamento: string | null;

  // Revisões
  max_revisions: number;
  revision_count: number;

  // Status
  status: StatusPedido;

  // Datas
  data_briefing: string;
  data_orcamento: string | null;
  data_aprovacao: string | null;
  data_pagamento: string | null;
  data_pagamento_final: string | null;
  data_inicio_confeccao: string | null;
  data_entrega: string | null;
  prazo_final: string | null;

  // Recusa
  motivo_recusa: string | null;

  // Entregas
  arquivos_entregues: string[];
  mensagem_entrega: string | null;

  // Comprovante
  comprovante_url: string | null;

  // Faturamento
  nota_fiscal_emitida: boolean;
  numero_nota_fiscal: string | null;
  data_emissao_nf: string | null;

  // Avaliação (legado)
  avaliacao_nota: number | null;
  avaliacao_comentario: string | null;

  // NPS (novo)
  nps_score: number | null;
  nps_comment: string | null;

  // Arquivamento
  archived_at: string | null;

  // Tracking público
  public_token: string | null;

  // Metadados
  created_at: string;
  updated_at: string;

  // Relações (joins)
  clients?: {
    id: string;
    name: string;
    email: string | null;
  };
  services?: {
    id: string;
    title: string;
    icon: string | null;
  };
}

// Interface para criar orçamento
export interface OrcamentoData {
  valor_orcado: number;
  prazo_orcado: number;
  observacoes_admin?: string;
  requer_pagamento_antecipado: boolean;
  tipo_pagamento: TipoPagamento;
  payment_mode?: PaymentMode;
  valor_entrada?: number;
  condicao_pagamento?: string;
  discount_amount?: number;
  discount_reason?: string;
  max_revisions?: number;
}

// Labels para status
export const STATUS_LABELS: Record<StatusPedido, string> = {
  briefing: 'Briefing Recebido',
  orcamento_enviado: 'Orçamento Enviado',
  orcamento_aprovado: 'Orçamento Aprovado',
  aguardando_pagamento: 'Aguardando Pagamento',
  pagamento_confirmado: 'Pagamento Confirmado',
  em_confeccao: 'Em Confecção',
  aguardando_aprovacao_cliente: 'Aguardando Aprovação',
  em_ajustes: 'Em Ajustes',
  aguardando_pagamento_final: 'Aguardando Pagamento Final',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
  recusado: 'Recusado',
};

// Cores para status
export const STATUS_COLORS: Record<StatusPedido, string> = {
  briefing: 'bg-blue-500/20 text-blue-400',
  orcamento_enviado: 'bg-yellow-500/20 text-yellow-400',
  orcamento_aprovado: 'bg-green-500/20 text-green-400',
  aguardando_pagamento: 'bg-orange-500/20 text-orange-400',
  pagamento_confirmado: 'bg-emerald-500/20 text-emerald-400',
  em_confeccao: 'bg-purple-500/20 text-purple-400',
  aguardando_aprovacao_cliente: 'bg-cyan-500/20 text-cyan-400',
  em_ajustes: 'bg-amber-500/20 text-amber-400',
  aguardando_pagamento_final: 'bg-orange-500/20 text-orange-400',
  finalizado: 'bg-green-500/20 text-green-400',
  cancelado: 'bg-red-500/20 text-red-400',
  recusado: 'bg-red-500/20 text-red-400',
};

// Labels para tipo de pagamento
export const TIPO_PAGAMENTO_LABELS: Record<TipoPagamento, string> = {
  antecipado: 'Pagamento Antecipado',
  faturamento: 'Faturamento',
  pos_entrega: 'Pagamento Após Entrega',
  parcelado: 'Parcelado',
  sem_custo: 'Cortesia',
};

// Cores para tipo de pagamento
export const TIPO_PAGAMENTO_COLORS: Record<TipoPagamento, string> = {
  antecipado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  faturamento: 'bg-green-500/20 text-green-400 border-green-500/30',
  pos_entrega: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  parcelado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sem_custo: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// Labels para modo de pagamento
export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  full: 'Pagamento Integral',
  split_50_50: '50% + 50%',
  split_30_70: '30% + 70%',
  split_custom: 'Divisão Personalizada',
  installments: 'Parcelado',
};

// Labels para tipo de pedido
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  package: 'Pacote Pronto',
  service_selection: 'Seleção de Serviço',
  custom: 'Descrição Personalizada',
};
