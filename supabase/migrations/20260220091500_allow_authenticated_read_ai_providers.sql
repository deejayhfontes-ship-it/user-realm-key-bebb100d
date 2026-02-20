-- Permite que TODOS os usuários autenticados leiam os provedores ativos de IA
-- Necessário para que o hook useGeminiImageGeneration funcione para não-admins
-- (ex: usuário da prefeitura gerando artes no PrefeituraArteGenerator)

CREATE POLICY "Authenticated users can read active ai_providers"
  ON public.ai_providers FOR SELECT
  TO authenticated
  USING (is_active = true);
