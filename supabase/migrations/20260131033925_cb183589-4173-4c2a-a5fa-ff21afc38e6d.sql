-- Tabela principal de entregas
CREATE TABLE public.entregas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Vínculo com pedido
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  protocolo VARCHAR(20) NOT NULL,
  
  -- Dados do cliente (cache para facilitar)
  cliente_id UUID REFERENCES public.clients(id),
  cliente_nome VARCHAR(255),
  cliente_email VARCHAR(255),
  cliente_whatsapp VARCHAR(20),
  
  -- Dados do projeto
  servico_nome VARCHAR(255),
  
  -- Status da entrega
  status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pronto_envio', 'enviado', 'expirado', 'revogado')),
  
  -- Tipo de entrega
  tipo VARCHAR(50) CHECK (tipo IN ('upload', 'link_externo', 'upload_link')),
  
  -- Arquivos (se upload)
  arquivos JSONB DEFAULT '[]'::jsonb,
  
  -- Link externo (se tipo link)
  link_externo TEXT,
  
  -- Mensagem personalizada
  mensagem TEXT,
  
  -- Token de acesso único
  token VARCHAR(100) UNIQUE NOT NULL,
  link_acesso TEXT,
  
  -- Controle de validade
  expira_em TIMESTAMP WITH TIME ZONE,
  dias_validade INTEGER DEFAULT 30,
  
  -- Controle de status
  data_envio TIMESTAMP WITH TIME ZONE,
  enviado_por_email BOOLEAN DEFAULT FALSE,
  enviado_por_whatsapp BOOLEAN DEFAULT FALSE,
  
  -- Rastreamento
  total_acessos INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revogado_em TIMESTAMP WITH TIME ZONE,
  revogado_por UUID REFERENCES auth.users(id)
);

-- Tabela de logs de entregas
CREATE TABLE public.entregas_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entrega_id UUID REFERENCES public.entregas(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  evento VARCHAR(50) NOT NULL CHECK (evento IN ('criado', 'enviado_email', 'enviado_whatsapp', 'acessado', 'download', 'revogado', 'reativado', 'expirado')),
  
  -- Detalhes
  descricao TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_entregas_pedido ON public.entregas(pedido_id);
CREATE INDEX idx_entregas_protocolo ON public.entregas(protocolo);
CREATE INDEX idx_entregas_token ON public.entregas(token);
CREATE INDEX idx_entregas_status ON public.entregas(status);
CREATE INDEX idx_entregas_cliente ON public.entregas(cliente_id);
CREATE INDEX idx_logs_entrega ON public.entregas_logs(entrega_id);
CREATE INDEX idx_logs_evento ON public.entregas_logs(evento);

-- Enable RLS
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_logs ENABLE ROW LEVEL SECURITY;

-- Policies para entregas (admin full access)
CREATE POLICY "Admins can manage entregas" 
ON public.entregas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy para acesso público via token (para página de download)
CREATE POLICY "Public can view entregas by token" 
ON public.entregas 
FOR SELECT 
USING (true);

-- Policies para logs
CREATE POLICY "Admins can view logs" 
ON public.entregas_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Anyone can insert logs" 
ON public.entregas_logs 
FOR INSERT 
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_entregas_updated_at
BEFORE UPDATE ON public.entregas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar token único
CREATE OR REPLACE FUNCTION public.generate_entrega_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;