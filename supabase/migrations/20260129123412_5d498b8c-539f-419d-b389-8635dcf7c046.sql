-- Tabela de Faturas (Invoices)
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  
  -- Bill To (Quem Paga)
  bill_to_name text NOT NULL,
  bill_to_company text,
  bill_to_address text,
  bill_to_email text,
  
  -- Ship To (Destinatário)
  ship_to_name text NOT NULL,
  ship_to_event text,
  ship_to_location text,
  ship_to_phone text,
  ship_to_email text,
  
  -- Datas
  date date DEFAULT CURRENT_DATE,
  due_date date,
  
  -- Itens (JSONB)
  items jsonb DEFAULT '[]',
  
  -- Valores (em centavos)
  discount integer DEFAULT 0,
  tax_rate integer DEFAULT 0,
  total integer NOT NULL,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  
  -- Notas e métodos de pagamento
  notes text,
  pix_config jsonb DEFAULT '{}',
  wise_config jsonb DEFAULT '{}',
  
  -- Metadados
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Função para gerar número de fatura automático (INV-2026-0001)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
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
    CAST(SUBSTRING(invoice_number FROM 'INV' || year_str || '(\d+)') AS integer)
  ), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE 'INV' || year_str || '%';
  
  result := 'INV' || year_str || LPAD(next_num::text, 4, '0');
  RETURN result;
END;
$$;

-- Trigger para updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faturas do usuário" ON public.invoices 
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins podem gerenciar faturas" ON public.invoices
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));