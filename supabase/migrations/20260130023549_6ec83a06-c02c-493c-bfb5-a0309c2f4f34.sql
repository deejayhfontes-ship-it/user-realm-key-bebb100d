-- Tabela de serviços da agência
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  icon text, -- nome do ícone lucide ou emoji/URL
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text NOT NULL,
  full_description text,
  features jsonb DEFAULT '[]'::jsonb,
  deliverables jsonb DEFAULT '[]'::jsonb,
  price_range text,
  delivery_time text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_services_display_order ON public.services(display_order);

-- RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (usuário gerencia seus próprios serviços)
CREATE POLICY "Users can manage own services"
ON public.services
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Serviços ativos podem ser visualizados publicamente (para landing page)
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();