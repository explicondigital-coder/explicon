-- Explicon Tax Link
-- Busca paginada por Item LC, preservando todos os NBS de cada grupo.
-- PREPARADA NO GITHUB. NÃO EXECUTAR EM PRODUÇÃO SEM REVISÃO/TESTES.

CREATE OR REPLACE FUNCTION public.buscar_correlacoes_paginada_v2(
  _q text DEFAULT '',
  _item_lc text DEFAULT NULL,
  _nbs text DEFAULT NULL,
  _indop text DEFAULT NULL,
  _cclasstrib text DEFAULT NULL,
  _base_legal text DEFAULT NULL,
  _ordenar text DEFAULT 'item_lc',
  _limit_itens int DEFAULT 10,
  _offset_itens int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions
AS $$
DECLARE
  norm text := public.normalizar_busca(_q);
  tokens text[] := (
    SELECT array_agg(t)
    FROM unnest(regexp_split_to_array(trim(norm), '\s+')) AS t
    WHERE t <> ''
  );
  lim int := least(greatest(coalesce(_limit_itens, 10), 1), 50);
  off int := greatest(coalesce(_offset_itens, 0), 0);
  resultado jsonb;
BEGIN
  WITH filtrado AS (
    SELECT c.*
    FROM public.correlacoes c
    WHERE (tokens IS NULL OR c.search_text LIKE ALL (
      SELECT '%' || t || '%' FROM unnest(tokens) t
    ))
      AND (_item_lc IS NULL OR c.item_lc = _item_lc)
      AND (_nbs IS NULL OR c.nbs = _nbs)
      AND (_indop IS NULL OR c.indop = _indop)
      AND (_cclasstrib IS NULL OR c.cclasstrib = _cclasstrib)
      AND (_base_legal IS NULL OR c.base_legal = _base_legal)
  ),
  resumo AS (
    SELECT
      count(*)::int AS total_registros,
      count(DISTINCT item_lc)::int AS total_itens
    FROM filtrado
  ),
  itens AS (
    SELECT
      item_lc,
      min(descricao_lc) AS descricao_lc,
      min(nbs) FILTER (WHERE nbs IS NOT NULL) AS primeiro_nbs,
      count(*) AS qtd
    FROM filtrado
    GROUP BY item_lc
  ),
  itens_pagina AS (
    SELECT item_lc
    FROM itens
    ORDER BY
      CASE WHEN _ordenar = 'alfabetica' THEN descricao_lc END NULLS LAST,
      CASE WHEN _ordenar = 'nbs' THEN primeiro_nbs END NULLS LAST,
      item_lc NULLS LAST
    LIMIT lim OFFSET off
  ),
  linhas AS (
    SELECT f.*
    FROM filtrado f
    JOIN itens_pagina p ON p.item_lc IS NOT DISTINCT FROM f.item_lc
    ORDER BY f.item_lc NULLS LAST, f.nbs NULLS LAST, f.cclasstrib NULLS LAST
  )
  SELECT jsonb_build_object(
    'total_registros', r.total_registros,
    'total_itens', r.total_itens,
    'registros', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'item_lc', l.item_lc,
          'descricao_lc', l.descricao_lc,
          'nbs', l.nbs,
          'descricao_nbs', l.descricao_nbs,
          'indop', l.indop,
          'cclasstrib', l.cclasstrib,
          'nome_cclasstrib', l.nome_cclasstrib,
          'cst', l.cst,
          'descricao_cst', l.descricao_cst,
          'reducao_aliquota', l.reducao_aliquota,
          'base_legal', l.base_legal,
          'observacoes', l.observacoes,
          'palavras_chave', l.palavras_chave,
          'ps_onerosa', l.ps_onerosa,
          'adq_exterior', l.adq_exterior,
          'local_incidencia_ibs', l.local_incidencia_ibs
        )
      )
      FROM linhas l
    ), '[]'::jsonb)
  )
  INTO resultado
  FROM resumo r;

  RETURN resultado;
END;
$$;

REVOKE ALL ON FUNCTION public.buscar_correlacoes_paginada_v2(
  text,text,text,text,text,text,text,int,int
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.buscar_correlacoes_paginada_v2(
  text,text,text,text,text,text,text,int,int
) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.buscar_correlacoes_paginada_v2(
  text,text,text,text,text,text,text,int,int
) IS 'Pagina por Item LC e retorna todas as correlacoes/NBS do grupo selecionado.';
