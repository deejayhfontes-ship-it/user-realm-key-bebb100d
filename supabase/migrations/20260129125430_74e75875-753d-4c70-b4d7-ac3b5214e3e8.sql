-- Tabela de configurações PIX por usuário
CREATE TABLE public.pix_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  pix_key text NOT NULL,
  merchant_name text NOT NULL DEFAULT 'Fontes Graphics',
  merchant_city text NOT NULL DEFAULT 'Pocos de Caldas',
  
  enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de briefings (pedidos do site)
CREATE TABLE public.briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do cliente
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  empresa text,
  
  -- Projeto
  tipo_projeto text,
  descricao text NOT NULL,
  referencias text,
  prazo text,
  arquivo_urls jsonb DEFAULT '[]',
  
  -- Controle
  status text DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'orcamento_criado', 'proposta_criada', 'aprovado', 'recusado', 'cancelado')),
  prioridade text DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  
  -- Relacionamentos opcionais
  budget_id uuid REFERENCES public.budgets(id) ON DELETE SET NULL,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  
  -- Notas internas
  notas_internas text,
  
  -- Atribuição
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pix_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

-- RLS para pix_configs (usuário só vê/edita seu próprio)
CREATE POLICY "Users can manage own pix_config"
  ON public.pix_configs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS para briefings (admins podem tudo)
CREATE POLICY "Admins can manage briefings"
  ON public.briefings FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Inserção pública para briefings (formulário externo)
CREATE POLICY "Anyone can submit briefings"
  ON public.briefings FOR INSERT
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_pix_configs_updated_at
  BEFORE UPDATE ON public.pix_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_briefings_updated_at
  BEFORE UPDATE ON public.briefings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();