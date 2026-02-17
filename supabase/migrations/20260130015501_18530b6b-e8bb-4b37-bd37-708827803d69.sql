-- Criar tabela de configurações fiscais do emitente
CREATE TABLE public.nfe_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da empresa
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text NOT NULL,
  inscricao_estadual text,
  inscricao_municipal text,
  
  -- Endereço completo
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cep text,
  municipio text,
  uf text,
  codigo_municipio_ibge text,
  
  -- Configurações tributárias
  regime_tributario text DEFAULT 'simples_nacional',
  
  -- Configurações de emissão
  ambiente text DEFAULT 'homologacao' CHECK (ambiente IN ('homologacao', 'producao')),
  serie_nfe text DEFAULT '1',
  proximo_numero_nfe integer DEFAULT 1,
  serie_nfse text DEFAULT '1',
  proximo_numero_nfse integer DEFAULT 1,
  
  -- Integração API
  api_provider text DEFAULT 'manual' CHECK (api_provider IN ('manual', 'focus', 'tecnospeed', 'webmania')),
  api_key text,
  api_secret text,
  
  -- Certificado Digital
  certificado_base64 text,
  certificado_senha text,
  certificado_validade timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT unique_user_nfe_config UNIQUE (user_id)
);

-- Criar tabela de notas fiscais
CREATE TABLE public.notas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  
  -- Tipo e numeração
  tipo text NOT NULL DEFAULT 'NFSe' CHECK (tipo IN ('NFe', 'NFSe')),
  numero integer NOT NULL,
  serie text DEFAULT '1',
  chave_acesso text,
  protocolo text,
  
  -- Dados do cliente/tomador
  cliente_cpf_cnpj text NOT NULL,
  cliente_nome text NOT NULL,
  cliente_endereco text,
  cliente_municipio text,
  cliente_uf text,
  cliente_email text,
  
  -- Dados do serviço/operação
  natureza_operacao text DEFAULT 'Prestação de Serviços de Design',
  cfop text,
  codigo_servico_municipio text,
  descricao_servico text NOT NULL,
  
  -- Valores (em centavos)
  valor_servico integer NOT NULL,
  valor_desconto integer DEFAULT 0,
  valor_liquido integer NOT NULL,
  
  -- Impostos
  issqn_aliquota numeric(5,2) DEFAULT 5.00,
  issqn_valor integer DEFAULT 0,
  issqn_retido boolean DEFAULT false,
  pis_valor integer DEFAULT 0,
  cofins_valor integer DEFAULT 0,
  
  -- Status e arquivos
  status text DEFAULT 'digitacao' CHECK (status IN ('digitacao', 'enviada', 'autorizada', 'cancelada', 'denegada', 'erro')),
  motivo_status text,
  xml_url text,
  pdf_url text,
  
  -- Datas
  data_emissao timestamp with time zone DEFAULT now(),
  data_competencia date DEFAULT CURRENT_DATE,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_notas_fiscais_user_id ON public.notas_fiscais(user_id);
CREATE INDEX idx_notas_fiscais_invoice_id ON public.notas_fiscais(invoice_id);
CREATE INDEX idx_notas_fiscais_status ON public.notas_fiscais(status);
CREATE INDEX idx_notas_fiscais_numero_serie ON public.notas_fiscais(numero, serie);

-- Habilitar RLS
ALTER TABLE public.nfe_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para nfe_configs
CREATE POLICY "Users can manage own nfe_configs"
ON public.nfe_configs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all nfe_configs"
ON public.nfe_configs
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Políticas RLS para notas_fiscais
CREATE POLICY "Users can manage own notas_fiscais"
ON public.notas_fiscais
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notas_fiscais"
ON public.notas_fiscais
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Função para obter próximo número da nota
CREATE OR REPLACE FUNCTION public.get_next_nota_number(p_user_id uuid, p_tipo text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_number integer;
BEGIN
  IF p_tipo = 'NFe' THEN
    UPDATE nfe_configs 
    SET proximo_numero_nfe = proximo_numero_nfe + 1,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING proximo_numero_nfe - 1 INTO v_next_number;
  ELSE
    UPDATE nfe_configs 
    SET proximo_numero_nfse = proximo_numero_nfse + 1,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING proximo_numero_nfse - 1 INTO v_next_number;
  END IF;
  
  RETURN COALESCE(v_next_number, 1);
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_nfe_configs_updated_at
BEFORE UPDATE ON public.nfe_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notas_fiscais_updated_at
BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para armazenar XMLs e PDFs das notas
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Users can upload own notas fiscais files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notas-fiscais' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own notas fiscais files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'notas-fiscais' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own notas fiscais files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notas-fiscais' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all notas fiscais files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'notas-fiscais' AND
  is_admin(auth.uid())
);