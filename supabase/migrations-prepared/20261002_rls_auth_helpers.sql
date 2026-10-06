-- Explicon Tax Link
-- RLS helpers seguros baseados exclusivamente em auth.uid().
-- PREPARADA NO GITHUB. NÃO EXECUTAR EM PRODUÇÃO SEM TESTES.

CREATE OR REPLACE FUNCTION public.current_user_can_edit()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::public.app_role, 'editor'::public.app_role)
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_can_edit() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_can_edit() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, service_role;

DROP POLICY IF EXISTS "Editores podem inserir correlacoes" ON public.correlacoes;
CREATE POLICY "Editores podem inserir correlacoes"
ON public.correlacoes
FOR INSERT TO authenticated
WITH CHECK (public.current_user_can_edit());

DROP POLICY IF EXISTS "Editores podem atualizar correlacoes" ON public.correlacoes;
CREATE POLICY "Editores podem atualizar correlacoes"
ON public.correlacoes
FOR UPDATE TO authenticated
USING (public.current_user_can_edit())
WITH CHECK (public.current_user_can_edit());

DROP POLICY IF EXISTS "Admins podem excluir correlacoes" ON public.correlacoes;
CREATE POLICY "Admins podem excluir correlacoes"
ON public.correlacoes
FOR DELETE TO authenticated
USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Editores veem logs de consulta" ON public.consultas_log;
CREATE POLICY "Editores veem logs de consulta"
ON public.consultas_log
FOR SELECT TO authenticated
USING (public.current_user_can_edit());

DROP POLICY IF EXISTS "Editores veem logs de importacao" ON public.import_logs;
CREATE POLICY "Editores veem logs de importacao"
ON public.import_logs
FOR SELECT TO authenticated
USING (public.current_user_can_edit());

DROP POLICY IF EXISTS "Editores veem leads" ON public.leads;
CREATE POLICY "Editores veem leads"
ON public.leads
FOR SELECT TO authenticated
USING (public.current_user_can_edit());

DROP POLICY IF EXISTS "Usuario ve seus papeis" ON public.user_roles;
CREATE POLICY "Usuario ve seus papeis"
ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "Usuario ve seu perfil" ON public.profiles;
CREATE POLICY "Usuario ve seu perfil"
ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.current_user_is_admin());

COMMENT ON FUNCTION public.current_user_can_edit()
IS 'Autorizacao RLS: usuario autenticado atual possui papel admin ou editor.';

COMMENT ON FUNCTION public.current_user_is_admin()
IS 'Autorizacao RLS: usuario autenticado atual possui papel admin.';
