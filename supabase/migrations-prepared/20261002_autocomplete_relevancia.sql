-- Explicon Tax Link — autocomplete com relevância
-- PREPARADA NO GITHUB. Não aplicar em produção sem teste.

CREATE OR REPLACE FUNCTION public.sugerir_correlacoes_v2(
  _q text,
  _limit integer DEFAULT 8
)
RETURNS TABLE (
  tipo text,
  valor text,
  descricao text,
  item_lc text,
  nbs text,
  score integer
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  WITH parametros AS (
    SELECT
      public.normalizar_busca(_q) AS q,
      least(greatest(coalesce(_limit, 8), 1), 20) AS limite
  ),
  candidatos AS (
    -- Código NBS
    SELECT
      'NBS'::text AS tipo,
      c.nbs AS valor,
      c.descricao_nbs AS descricao,
      c.item_lc,
      c.nbs,
      CASE
        WHEN public.normalizar_busca(c.nbs) = p.q THEN 1000
        WHEN public.normalizar_busca(c.nbs) LIKE p.q || '%' THEN 950
        ELSE 900
      END AS score
    FROM public.correlacoes c
    CROSS JOIN parametros p
    WHERE c.nbs IS NOT NULL
      AND p.q <> ''
      AND public.normalizar_busca(c.nbs) LIKE '%' || p.q || '%'

    UNION ALL

    -- Código Item LC
    SELECT
      'Item LC'::text,
      c.item_lc,
      c.descricao_lc,
      c.item_lc,
      c.nbs,
      CASE
        WHEN public.normalizar_busca(c.item_lc) = p.q THEN 990
        WHEN public.normalizar_busca(c.item_lc) LIKE p.q || '%' THEN 940
        ELSE 890
      END
    FROM public.correlacoes c
    CROSS JOIN parametros p
    WHERE c.item_lc IS NOT NULL
      AND p.q <> ''
      AND public.normalizar_busca(c.item_lc) LIKE '%' || p.q || '%'

    UNION ALL

    -- Descrição NBS
    SELECT
      'Serviço NBS'::text,
      c.descricao_nbs,
      concat_ws(' · ',
        CASE WHEN c.nbs IS NOT NULL THEN 'NBS ' || c.nbs END,
        CASE WHEN c.item_lc IS NOT NULL THEN 'Item LC ' || c.item_lc END
      ),
      c.item_lc,
      c.nbs,
      CASE
        WHEN public.normalizar_busca(c.descricao_nbs) = p.q THEN 850
        WHEN public.normalizar_busca(c.descricao_nbs) LIKE p.q || '%' THEN 800
        ELSE 750
      END
    FROM public.correlacoes c
    CROSS JOIN parametros p
    WHERE c.descricao_nbs IS NOT NULL
      AND p.q <> ''
      AND public.normalizar_busca(c.descricao_nbs) LIKE '%' || p.q || '%'

    UNION ALL

    -- Descrição do Item LC
    SELECT
      'Serviço'::text,
      c.descricao_lc,
      CASE WHEN c.item_lc IS NOT NULL THEN 'Item LC ' || c.item_lc END,
      c.item_lc,
      c.nbs,
      CASE
        WHEN public.normalizar_busca(c.descricao_lc) = p.q THEN 840
        WHEN public.normalizar_busca(c.descricao_lc) LIKE p.q || '%' THEN 790
        ELSE 740
      END
    FROM public.correlacoes c
    CROSS JOIN parametros p
    WHERE c.descricao_lc IS NOT NULL
      AND p.q <> ''
      AND public.normalizar_busca(c.descricao_lc) LIKE '%' || p.q || '%'
  ),
  deduplicado AS (
    SELECT *,
      row_number() OVER (
        PARTITION BY tipo, valor
        ORDER BY score DESC, item_lc NULLS LAST, nbs NULLS LAST
      ) AS rn
    FROM candidatos
    WHERE valor IS NOT NULL
  )
  SELECT d.tipo, d.valor, d.descricao, d.item_lc, d.nbs, d.score
  FROM deduplicado d
  CROSS JOIN parametros p
  WHERE d.rn = 1
  ORDER BY d.score DESC, d.valor
  LIMIT (SELECT limite FROM parametros);
$$;

REVOKE ALL ON FUNCTION public.sugerir_correlacoes_v2(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sugerir_correlacoes_v2(text, integer)
TO anon, authenticated, service_role;
