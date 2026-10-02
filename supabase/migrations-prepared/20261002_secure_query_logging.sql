-- Explicon Tax Link — log de consultas por RPC
-- PREPARADA NO GITHUB. Aplicar somente junto da versão do frontend/server que usa registrar_consulta().

CREATE OR REPLACE FUNCTION public.registrar_consulta(
  _termo text,
  _resultados integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_termo text := left(btrim(coalesce(_termo, '')), 200);
  v_resultados integer := least(greatest(coalesce(_resultados, 0), 0), 1000000);
BEGIN
  IF v_termo = '' THEN
    RETURN;
  END IF;

  INSERT INTO public.consultas_log (termo, resultados)
  VALUES (v_termo, v_resultados);
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_consulta(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_consulta(text, integer)
TO anon, authenticated, service_role;

-- Impede escrita direta anônima na tabela; o visitante usa somente a RPC validada.
REVOKE INSERT ON public.consultas_log FROM anon, authenticated;
DROP POLICY IF EXISTS "Visitantes podem registrar consultas" ON public.consultas_log;

COMMENT ON FUNCTION public.registrar_consulta(text, integer)
IS 'Registra termo e quantidade de resultados sem liberar INSERT direto em consultas_log.';
