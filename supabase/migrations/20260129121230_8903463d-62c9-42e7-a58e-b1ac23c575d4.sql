-- Propostas comerciais
CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_number text UNIQUE NOT NULL,
  
  -- Cliente
  client_name text NOT NULL,
  client_company text,
  client_email text,
  client_phone text,
  client_address text,
  
  -- Projeto
  project_title text NOT NULL,
  project_description text,
  
  -- Escopo do serviço (array de itens com título e descrição detalhada)
  scope_items jsonb DEFAULT '[]',
  
  -- Investimento
  investment_value integer NOT NULL,
  recurrence_type text DEFAULT 'once' CHECK (recurrence_type IN ('once', 'monthly', 'yearly')),
  
  contract_period_months integer,
  
  payment_conditions text,
  estimated_days integer,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
  validity_days integer DEFAULT 15,
  
  -- Datas
  date date DEFAULT CURRENT_DATE,
  
  -- Notas
  notes text,
  
  -- Metadados
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Configurações específicas de propostas
CREATE TABLE proposal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  company_name text DEFAULT 'Fontes Graphics',
  company_document text,
  company_address text,
  company_phone text,
  company_email text,
  company_website text,
  logo_url text,
  show_fontes_logo boolean DEFAULT true,
  show_criate_logo boolean DEFAULT false,
  default_notes text,
  default_payment_conditions text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Propostas do usuário" ON proposals FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Configurações do usuário" ON proposal_settings FOR ALL USING (user_id = auth.uid());

-- Função para gerar número da proposta
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_str text;
  next_num integer;
  result text;
BEGIN
  year_str := to_char(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(proposal_number FROM 'PROP' || year_str || '(\d+)') AS integer)
  ), 0) + 1
  INTO next_num
  FROM proposals
  WHERE proposal_number LIKE 'PROP' || year_str || '%';
  
  result := 'PROP' || year_str || LPAD(next_num::text, 4, '0');
  RETURN result;
END;
$$;

-- Trigger para updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_settings_updated_at
  BEFORE UPDATE ON proposal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();