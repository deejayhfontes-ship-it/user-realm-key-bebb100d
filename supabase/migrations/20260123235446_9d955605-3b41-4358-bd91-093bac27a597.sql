-- Adicionar RLS nas tabelas que estão faltando

-- art_templates - admins podem tudo, clientes veem apenas templates ativos
ALTER TABLE public.art_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on art_templates"
ON public.art_templates
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Everyone can view active templates"
ON public.art_templates
FOR SELECT
TO authenticated
USING (active = true);

-- audit_logs - apenas admins podem ver
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- client_generators - admins podem tudo, clientes veem apenas seus próprios
ALTER TABLE public.client_generators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on client_generators"
ON public.client_generators
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Clients can view their own generators"
ON public.client_generators
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.client_id = client_generators.client_id
  )
);

-- packages - todos podem ver pacotes ativos, admins podem tudo
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on packages"
ON public.packages
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Everyone can view active packages"
ON public.packages
FOR SELECT
TO authenticated
USING (active = true);