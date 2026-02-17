-- Catálogo de produtos/serviços (para facilitar criação de orçamentos)
CREATE TABLE catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text,
  name text NOT NULL,
  description text,
  unit text DEFAULT 'un',
  default_price integer NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Configurações da empresa (para cabeçalho dos PDFs)
CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  company_name text DEFAULT 'Fontes Graphics',
  company_document text,
  company_address text,
  company_phone text,
  company_email text,
  logo_url text,
  show_fontes_logo boolean DEFAULT true,
  show_criate_logo boolean DEFAULT false,
  default_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orçamentos
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_number text UNIQUE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  validity_days integer DEFAULT 7,
  client_name text NOT NULL,
  client_document text,
  client_email text,
  client_phone text,
  client_address text,
  subtotal integer NOT NULL DEFAULT 0,
  global_discount_type text DEFAULT 'fixed' CHECK (global_discount_type IN ('fixed', 'percent')),
  global_discount_value integer DEFAULT 0,
  shipping integer DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  notes text,
  terms_and_conditions text DEFAULT 'Para aprovação e início de qualquer projeto, é exigido o pagamento de 50% do valor total como entrada. O saldo restante deverá ser quitado conforme acordado antes da entrega final.',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens do orçamento (linhas)
CREATE TABLE budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE,
  catalog_item_id uuid REFERENCES catalog_items(id),
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price integer NOT NULL,
  discount_type text DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percent')),
  discount_value integer DEFAULT 0,
  total integer NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas seus dados" ON catalog_items FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Usuários veem apenas seus orçamentos" ON budgets FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Linhas dos orçamentos do usuário" ON budget_lines FOR ALL USING (
  budget_id IN (SELECT id FROM budgets WHERE created_by = auth.uid())
);
CREATE POLICY "Configurações do usuário" ON company_settings FOR ALL USING (user_id = auth.uid());

-- Triggers para updated_at
CREATE TRIGGER update_catalog_items_updated_at
  BEFORE UPDATE ON catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();