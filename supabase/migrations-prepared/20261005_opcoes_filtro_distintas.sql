-- Explicon Tax Link — opções de filtro compactas
-- PREPARADA NO GITHUB. Não aplicar diretamente em produção sem validação.
-- Objetivo: evitar transportar 1.157 linhas para o servidor apenas para montar
-- listas distintas de Item LC, NBS, INDOP e cClassTrib.

CREATE OR REPLACE FUNCTION public.obter_opcoes_filtro_v2()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'itensLc', COALESCE((
      SELECT jsonb_agg(v ORDER BY v)
      FROM (
        SELECT DISTINCT item_lc AS v
        FROM public.correlacoes
        WHERE item_lc IS NOT NULL AND btrim(item_lc) <> ''
      ) x
    ), '[]'::jsonb),
    'nbs', COALESCE((
      SELECT jsonb_agg(v ORDER BY v)
      FROM (
        SELECT DISTINCT nbs AS v
        FROM public.correlacoes
        WHERE nbs IS NOT NULL AND btrim(nbs) <> ''
      ) x
    ), '[]'::jsonb),
    'indop', COALESCE((
      SELECT jsonb_agg(v ORDER BY v)
      FROM (
        SELECT DISTINCT indop AS v
        FROM public.correlacoes
        WHERE indop IS NOT NULL AND btrim(indop) <> ''
      ) x
    ), '[]'::jsonb),
    'cclasstrib', COALESCE((
      SELECT jsonb_agg(v ORDER BY v)
      FROM (
        SELECT DISTINCT cclasstrib AS v
        FROM public.correlacoes
        WHERE cclasstrib IS NOT NULL AND btrim(cclasstrib) <> ''
      ) x
    ), '[]'::jsonb),
    -- Base Legal permanece vazia na auditoria atual; manter array vazio até
    -- existirem dados validados.
    'baseLegal', '[]'::jsonb
  );
$$;

REVOKE ALL ON FUNCTION public.obter_opcoes_filtro_v2() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obter_opcoes_filtro_v2()
TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.obter_opcoes_filtro_v2()
IS 'Retorna opções distintas de filtros em payload compacto para o Tax Link.';
