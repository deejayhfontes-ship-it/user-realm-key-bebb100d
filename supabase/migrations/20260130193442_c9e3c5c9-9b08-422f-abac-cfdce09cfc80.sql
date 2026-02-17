-- Tabela de pedidos com fluxo flexível de pagamento
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo VARCHAR(20) UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  service_id UUID REFERENCES public.services(id),
  
  -- Dados do briefing
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  descricao TEXT NOT NULL,
  prazo_solicitado TEXT,
  referencias TEXT,
  arquivo_urls JSONB DEFAULT '[]'::jsonb,
  
  -- Dados do orçamento (preenchido pelo admin)
  valor_orcado INTEGER, -- em centavos
  prazo_orcado INTEGER, -- dias úteis
  observacoes_admin TEXT,
  
  -- Configuração de pagamento
  requer_pagamento_antecipado BOOLEAN DEFAULT TRUE,
  tipo_pagamento VARCHAR(50) DEFAULT 'antecipado',
  -- Valores: 'antecipado', 'faturamento', 'pos_entrega', 'parcelado', 'sem_custo'
  valor_entrada INTEGER, -- em centavos, se parcelado
  condicao_pagamento TEXT, -- ex: "30/60 dias"
  
  -- Status do pedido
  status VARCHAR(50) DEFAULT 'briefing',
  -- Valores: 'briefing', 'orcamento_enviado', 'orcamento_aprovado', 
  -- 'aguardando_pagamento', 'pagamento_confirmado', 'em_confeccao', 
  -- 'aguardando_aprovacao_cliente', 'em_ajustes', 'aguardando_pagamento_final', 
  -- 'finalizado', 'cancelado', 'recusado'
  
  -- Datas de controle
  data_briefing TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_orcamento TIMESTAMP WITH TIME ZONE,
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  data_pagamento_final TIMESTAMP WITH TIME ZONE,
  data_inicio_confeccao TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  prazo_final DATE,
  
  -- Motivo de recusa (se recusado)
  motivo_recusa TEXT,
  
  -- Entregas
  arquivos_entregues JSONB DEFAULT '[]'::jsonb,
  mensagem_entrega TEXT,
  
  -- Comprovante de pagamento
  comprovante_url TEXT,
  
  -- Faturamento
  nota_fiscal_emitida BOOLEAN DEFAULT FALSE,
  numero_nota_fiscal VARCHAR(50),
  data_emissao_nf DATE,
  
  -- Avaliação do cliente
  avaliacao_nota INTEGER CHECK (avaliacao_nota >= 1 AND avaliacao_nota <= 5),
  avaliacao_comentario TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_client_id ON public.pedidos(client_id);
CREATE INDEX idx_pedidos_tipo_pagamento ON public.pedidos(tipo_pagamento);
CREATE INDEX idx_pedidos_protocolo ON public.pedidos(protocolo);
CREATE INDEX idx_pedidos_email ON public.pedidos(email);

-- Habilitar RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Anyone can create pedidos via briefing"
ON public.pedidos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all pedidos"
ON public.pedidos
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Clients can view own pedidos by email"
ON public.pedidos
FOR SELECT
USING (
  email = (SELECT email FROM public.users WHERE id = auth.uid())
  OR client_id IN (SELECT client_id FROM public.users WHERE id = auth.uid())
);

CREATE POLICY "Clients can update own pedidos for approval"
ON public.pedidos
FOR UPDATE
USING (
  email = (SELECT email FROM public.users WHERE id = auth.uid())
  OR client_id IN (SELECT client_id FROM public.users WHERE id = auth.uid())
);

-- Função para gerar protocolo automático
CREATE OR REPLACE FUNCTION generate_pedido_protocolo()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  next_num INTEGER;
BEGIN
  year_str := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(protocolo FROM 'PED-' || year_str || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM public.pedidos
  WHERE protocolo LIKE 'PED-' || year_str || '-%';
  
  NEW.protocolo := 'PED-' || year_str || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para gerar protocolo
CREATE TRIGGER trigger_generate_pedido_protocolo
BEFORE INSERT ON public.pedidos
FOR EACH ROW
WHEN (NEW.protocolo IS NULL)
EXECUTE FUNCTION generate_pedido_protocolo();

-- Trigger para updated_at
CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();