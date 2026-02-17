-- Create chat sessions table
CREATE TABLE public.chat_sessoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  status VARCHAR(20) DEFAULT 'ativa',
  atendente_id UUID REFERENCES auth.users(id),
  iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  encerrado_em TIMESTAMP WITH TIME ZONE,
  ip_visitante VARCHAR(50),
  user_agent TEXT,
  pagina_origem TEXT,
  visitor_name VARCHAR(100),
  visitor_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id UUID REFERENCES public.chat_sessoes(id) ON DELETE CASCADE NOT NULL,
  remetente_tipo VARCHAR(20) NOT NULL CHECK (remetente_tipo IN ('visitante', 'admin')),
  remetente_id UUID,
  mensagem TEXT NOT NULL,
  anexo_url TEXT,
  lida BOOLEAN DEFAULT FALSE,
  enviada_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat config table (singleton per user)
CREATE TABLE public.chat_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true,
  cor VARCHAR(20) DEFAULT '#c4ff0d',
  posicao VARCHAR(20) DEFAULT 'bottom-right',
  mensagem_boas_vindas TEXT DEFAULT 'Olá! Como posso ajudar?',
  horario_inicio TIME DEFAULT '09:00',
  horario_fim TIME DEFAULT '18:00',
  dias_atendimento TEXT[] DEFAULT ARRAY['seg', 'ter', 'qua', 'qui', 'sex'],
  delay_boas_vindas INTEGER DEFAULT 2,
  atalhos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.chat_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_config ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Anyone can create chat sessions" 
ON public.chat_sessoes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own session" 
ON public.chat_sessoes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update chat sessions" 
ON public.chat_sessoes 
FOR UPDATE 
USING (true);

-- Chat messages policies
CREATE POLICY "Anyone can create messages" 
ON public.chat_mensagens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view messages from their session" 
ON public.chat_mensagens 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update messages" 
ON public.chat_mensagens 
FOR UPDATE 
USING (true);

-- Chat config policies (admin only)
CREATE POLICY "Admins can manage chat config" 
ON public.chat_config 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active chat config" 
ON public.chat_config 
FOR SELECT 
USING (ativo = true);

-- Create indexes
CREATE INDEX idx_chat_sessoes_session_id ON public.chat_sessoes(session_id);
CREATE INDEX idx_chat_sessoes_status ON public.chat_sessoes(status);
CREATE INDEX idx_chat_mensagens_sessao ON public.chat_mensagens(sessao_id);
CREATE INDEX idx_chat_mensagens_lida ON public.chat_mensagens(lida);

-- Trigger for updated_at
CREATE TRIGGER update_chat_sessoes_updated_at
BEFORE UPDATE ON public.chat_sessoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_config_updated_at
BEFORE UPDATE ON public.chat_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();