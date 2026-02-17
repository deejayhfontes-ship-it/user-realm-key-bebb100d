-- Criar tabela de configurações globais se não existir
CREATE TABLE IF NOT EXISTS public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública (todos podem ler as configurações)
CREATE POLICY "Allow public read access to global_settings"
ON public.global_settings
FOR SELECT
USING (true);

-- Policy para escrita apenas admins
CREATE POLICY "Allow admin write access to global_settings"
ON public.global_settings
FOR ALL
USING (public.is_admin(auth.uid()));

-- Inserir configuração de modo desenvolvedor (ativo por padrão para desenvolvimento)
INSERT INTO public.global_settings (key, value)
VALUES ('developer_mode', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentário
COMMENT ON TABLE public.global_settings IS 'Configurações globais do sistema';