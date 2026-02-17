-- Tabela de provedores de IA (arquitetura agnóstica)
CREATE TABLE public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  
  -- Configuração da API
  api_type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'openai', 'anthropic', 'google', 'lovable', 'custom'
  endpoint_url TEXT NOT NULL,
  api_key_encrypted TEXT, -- Criptografada ou referência a secret
  model_name VARCHAR(100),
  
  -- Headers e config customizados
  custom_headers JSONB DEFAULT '{}',
  request_template JSONB,
  response_path VARCHAR(200),
  system_prompt TEXT,
  
  -- Parâmetros
  timeout_seconds INTEGER DEFAULT 30,
  max_tokens INTEGER DEFAULT 4000,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  
  -- Status e metadata
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  last_test_at TIMESTAMP WITH TIME ZONE,
  last_test_success BOOLEAN,
  last_error TEXT,
  
  -- Tracking
  total_requests INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Índices para ai_providers
CREATE INDEX idx_ai_providers_active ON public.ai_providers(is_active, is_default);
CREATE INDEX idx_ai_providers_slug ON public.ai_providers(slug);

-- RLS para ai_providers
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ai_providers"
  ON public.ai_providers FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert ai_providers"
  ON public.ai_providers FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update ai_providers"
  ON public.ai_providers FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete ai_providers"
  ON public.ai_providers FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Tabela de histórico de edições
CREATE TABLE public.generator_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generator_id UUID NOT NULL REFERENCES public.generators(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
  
  old_config JSONB NOT NULL,
  new_config JSONB NOT NULL,
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Índices para generator_edit_history
CREATE INDEX idx_edit_history_generator ON public.generator_edit_history(generator_id);
CREATE INDEX idx_edit_history_created ON public.generator_edit_history(created_at DESC);

-- RLS para generator_edit_history
ALTER TABLE public.generator_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read edit_history"
  ON public.generator_edit_history FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert edit_history"
  ON public.generator_edit_history FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir Lovable AI como provider padrão
INSERT INTO public.ai_providers (
  name,
  slug,
  api_type,
  endpoint_url,
  model_name,
  response_path,
  system_prompt,
  is_active,
  is_default
) VALUES (
  'Lovable AI',
  'lovable',
  'lovable',
  'https://ai.gateway.lovable.dev/v1/chat/completions',
  'google/gemini-3-flash-preview',
  'choices[0].message.content',
  'Você é um especialista em modificar configurações JSON de geradores de arte. Você recebe a configuração atual e uma instrução do usuário, e deve retornar APENAS o JSON modificado, sem explicações. Mantenha a estrutura válida.',
  true,
  true
);