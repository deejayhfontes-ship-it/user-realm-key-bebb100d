-- Tabela de configurações de gateway de pagamento
CREATE TABLE IF NOT EXISTS payment_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name text NOT NULL CHECK (gateway_name IN ('stripe', 'mercado_pago', 'pagseguro', 'asaas', 'manual')),
  is_active boolean DEFAULT false,
  api_key_encrypted text,
  webhook_secret text,
  sandbox_mode boolean DEFAULT true,
  config_json jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de planos de pagamento
CREATE TABLE IF NOT EXISTS payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  currency text DEFAULT 'BRL',
  interval text DEFAULT 'month' CHECK (interval IN ('month', 'year', 'one_time')),
  credits_included integer NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de pagamentos/transações
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES payment_plans(id) ON DELETE SET NULL,
  gateway text NOT NULL,
  external_id text,
  amount_cents integer NOT NULL,
  currency text DEFAULT 'BRL',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'failed', 'cancelled', 'refunded')),
  customer_gateway_id text,
  subscription_id text,
  payment_method text,
  paid_at timestamp with time zone,
  next_billing_at timestamp with time zone,
  failure_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS para payment_configs (apenas admins)
CREATE POLICY "Admins can manage payment_configs" ON payment_configs
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- RLS para payment_plans
CREATE POLICY "Admins can manage payment_plans" ON payment_plans
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Everyone can view active plans" ON payment_plans
  FOR SELECT USING (is_active = true);

-- RLS para payments
CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- RLS para webhook_logs (apenas admins)
CREATE POLICY "Admins can manage webhook_logs" ON webhook_logs
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_payment_configs_updated_at
  BEFORE UPDATE ON payment_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos iniciais (baseado na landing page)
INSERT INTO payment_plans (name, description, price_cents, credits_included, interval, features, is_featured, sort_order) VALUES
('Starter', 'Ideal para pequenas empresas', 9700, 100, 'month', '["100 créditos/mês", "2 geradores", "Suporte por email", "Templates básicos"]', false, 1),
('Pro', 'Para equipes em crescimento', 19700, 500, 'month', '["500 créditos/mês", "Todos os geradores", "Suporte prioritário", "Templates premium", "API access"]', true, 2),
('Enterprise', 'Para grandes organizações', 49700, 2000, 'month', '["2000 créditos/mês", "Geradores ilimitados", "Suporte dedicado", "IA customizada", "API ilimitada", "SLA garantido"]', false, 3);

-- Inserir configuração inicial (manual por padrão)
INSERT INTO payment_configs (gateway_name, is_active, sandbox_mode) VALUES
('manual', true, true);