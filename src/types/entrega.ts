// Status possíveis da entrega
export type StatusEntrega = 
  | 'rascunho' 
  | 'pronto_envio' 
  | 'enviado' 
  | 'expirado' 
  | 'revogado';

// Tipo de entrega
export type TipoEntrega = 
  | 'upload' 
  | 'link_externo' 
  | 'upload_link';

// Arquivo anexado
export interface ArquivoEntrega {
  nome: string;
  url: string;
  tamanho: string;
  tipo?: string;
}

// Interface da entrega
export interface Entrega {
  id: string;
  
  // Vínculo com pedido
  pedido_id: string;
  protocolo: string;
  
  // Dados do cliente
  cliente_id: string | null;
  cliente_nome: string | null;
  cliente_email: string | null;
  cliente_whatsapp: string | null;
  
  // Dados do projeto
  servico_nome: string | null;
  
  // Status
  status: StatusEntrega;
  
  // Tipo
  tipo: TipoEntrega | null;
  
  // Arquivos
  arquivos: ArquivoEntrega[];
  
  // Link externo
  link_externo: string | null;
  
  // Mensagem
  mensagem: string | null;
  
  // Token e link de acesso
  token: string;
  link_acesso: string | null;
  
  // Validade
  expira_em: string | null;
  dias_validade: number;
  
  // Controle de envio
  data_envio: string | null;
  enviado_por_email: boolean;
  enviado_por_whatsapp: boolean;
  
  // Rastreamento
  total_acessos: number;
  total_downloads: number;
  ultimo_acesso: string | null;
  
  // Meta
  created_at: string;
  updated_at: string;
  revogado_em: string | null;
  revogado_por: string | null;
  
  // Relações (joins)
  pedidos?: {
    id: string;
    protocolo: string;
    nome: string;
    email: string;
  };
}

// Log de entrega
export interface EntregaLog {
  id: string;
  entrega_id: string;
  evento: string;
  descricao: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Labels para status
export const STATUS_ENTREGA_LABELS: Record<StatusEntrega, string> = {
  rascunho: 'Rascunho',
  pronto_envio: 'Pronto para Envio',
  enviado: 'Enviado',
  expirado: 'Expirado',
  revogado: 'Revogado',
};

// Cores para status
export const STATUS_ENTREGA_COLORS: Record<StatusEntrega, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  pronto_envio: 'bg-blue-500/20 text-blue-400',
  enviado: 'bg-green-500/20 text-green-400',
  expirado: 'bg-orange-500/20 text-orange-400',
  revogado: 'bg-red-500/20 text-red-400',
};

// Labels para tipo
export const TIPO_ENTREGA_LABELS: Record<TipoEntrega, string> = {
  upload: 'Upload de Arquivos',
  link_externo: 'Link Externo',
  upload_link: 'Upload + Link',
};
