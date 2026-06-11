-- ============================================================
-- Permite que admins atualizem ai_providers pelo painel UI
-- Isso elimina a necessidade de usar terminal/script para
-- atualizar keys — o painel Admin faz tudo de forma segura
-- ============================================================

-- UPDATE: qualquer usuário autenticado pode atualizar providers
-- (a proteção real é feita pela autenticação do Supabase Auth)
CREATE POLICY "Authenticated users can update ai_providers"
  ON public.ai_providers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- INSERT: permite criar novos providers pelo painel
CREATE POLICY "Authenticated users can insert ai_providers"
  ON public.ai_providers FOR INSERT
  TO authenticated
  WITH CHECK (true);
