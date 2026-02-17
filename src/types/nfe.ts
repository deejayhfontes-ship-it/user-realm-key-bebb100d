export interface NfeConfig {
  id: string;
  user_id: string;
  
  // Dados da empresa
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  inscricao_estadual: string | null;
  inscricao_municipal: string | null;
  
  // Endereço
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  municipio: string | null;
  uf: string | null;
  codigo_municipio_ibge: string | null;
  
  // Configurações
  regime_tributario: string;
  ambiente: 'homologacao' | 'producao';
  serie_nfe: string;
  proximo_numero_nfe: number;
  serie_nfse: string;
  proximo_numero_nfse: number;
  
  // API
  api_provider: 'manual' | 'focus' | 'tecnospeed' | 'webmania';
  api_key: string | null;
  api_secret: string | null;
  
  // Certificado
  certificado_base64: string | null;
  certificado_senha: string | null;
  certificado_validade: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface NotaFiscal {
  id: string;
  user_id: string;
  invoice_id: string | null;
  cliente_id: string | null;
  
  tipo: 'NFe' | 'NFSe';
  numero: number;
  serie: string;
  chave_acesso: string | null;
  protocolo: string | null;
  
  cliente_cpf_cnpj: string;
  cliente_nome: string;
  cliente_endereco: string | null;
  cliente_municipio: string | null;
  cliente_uf: string | null;
  cliente_email: string | null;
  
  natureza_operacao: string;
  cfop: string | null;
  codigo_servico_municipio: string | null;
  descricao_servico: string;
  
  valor_servico: number;
  valor_desconto: number;
  valor_liquido: number;
  
  issqn_aliquota: number;
  issqn_valor: number;
  issqn_retido: boolean;
  pis_valor: number;
  cofins_valor: number;
  
  status: 'digitacao' | 'enviada' | 'autorizada' | 'cancelada' | 'denegada' | 'erro';
  motivo_status: string | null;
  xml_url: string | null;
  pdf_url: string | null;
  
  data_emissao: string;
  data_competencia: string;
  
  created_at: string;
  updated_at: string;
}

export interface NotaFiscalFormData {
  tipo: 'NFe' | 'NFSe';
  invoice_id?: string;
  cliente_id?: string;
  
  cliente_cpf_cnpj: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_municipio: string;
  cliente_uf: string;
  cliente_email: string;
  
  natureza_operacao: string;
  codigo_servico_municipio: string;
  descricao_servico: string;
  
  valor_servico: number;
  valor_desconto: number;
  issqn_aliquota: number;
  issqn_retido: boolean;
}

export const REGIMES_TRIBUTARIOS = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'simples_nacional_excesso', label: 'Simples Nacional - Excesso de Sublimite' },
  { value: 'regime_normal', label: 'Regime Normal' },
] as const;

export const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export const STATUS_NOTA = {
  digitacao: { label: 'Digitação', color: 'bg-muted text-muted-foreground' },
  enviada: { label: 'Enviada', color: 'bg-blue-500/20 text-blue-600' },
  autorizada: { label: 'Autorizada', color: 'bg-green-500/20 text-green-600' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/20 text-red-600' },
  denegada: { label: 'Denegada', color: 'bg-orange-500/20 text-orange-600' },
  erro: { label: 'Erro', color: 'bg-destructive/20 text-destructive' },
} as const;
