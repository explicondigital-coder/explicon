-- Explicon Tax Link — verificações pós-migration de segurança
-- Somente leitura. Executar depois de aplicar as migrations preparadas.

-- 1) Funções de autorização seguras devem existir.
SELECT proname, prosecdef
FROM pg_proc
JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('current_user_can_edit','current_user_is_admin','enviar_lead_seguro','registrar_consulta')
ORDER BY proname;

-- 2) INSERT direto anônimo deve ter sido removido.
SELECT
  has_table_privilege('anon','public.leads','INSERT') AS anon_insert_leads,
  has_table_privilege('anon','public.consultas_log','INSERT') AS anon_insert_consultas;

-- Resultado esperado: false / false.

-- 3) RPCs necessárias devem continuar executáveis.
SELECT
  has_function_privilege('anon','public.enviar_lead_seguro(text,text,text,text)','EXECUTE') AS anon_exec_lead,
  has_function_privilege('anon','public.registrar_consulta(text,integer)','EXECUTE') AS anon_exec_consulta;

-- Resultado esperado: true / true.

-- 4) Anon não deve ler dados sensíveis.
SELECT
  has_table_privilege('anon','public.leads','SELECT') AS anon_select_leads,
  has_table_privilege('anon','public.consultas_log','SELECT') AS anon_select_consultas,
  has_table_privilege('anon','public.user_roles','SELECT') AS anon_select_roles;

-- Resultado esperado: false / false / false.

-- 5) Policies resultantes.
SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('correlacoes','consultas_log','import_logs','leads','user_roles','profiles')
ORDER BY tablename,policyname;

-- 6) Não deve existir policy aberta de INSERT em leads/consultas_log.
SELECT tablename,policyname,roles,cmd,with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('leads','consultas_log')
  AND cmd='INSERT';
