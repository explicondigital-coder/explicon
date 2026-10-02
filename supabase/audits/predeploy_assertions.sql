-- Explicon Tax Link — assertions fiscais de pré-deploy
-- Read-only: falha com EXCEPTION quando uma invariante crítica não é atendida.

DO $$
DECLARE
  v integer;
BEGIN
  -- IDs únicos
  SELECT count(*) - count(DISTINCT id) INTO v FROM public.correlacoes;
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % IDs duplicados em correlacoes.', v;
  END IF;

  -- Correlações com NBS precisam ter todos os campos do cartão.
  SELECT count(*) INTO v
  FROM public.correlacoes
  WHERE nbs IS NOT NULL AND btrim(nbs) <> ''
    AND (
      descricao_nbs IS NULL OR btrim(descricao_nbs) = ''
      OR descricao_lc IS NULL OR btrim(descricao_lc) = ''
      OR local_incidencia_ibs IS NULL OR btrim(local_incidencia_ibs) = ''
      OR cst IS NULL OR btrim(cst) = ''
      OR cclasstrib IS NULL OR btrim(cclasstrib) = ''
      OR nome_cclasstrib IS NULL OR btrim(nome_cclasstrib) = ''
    );
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % cartões NBS incompletos.', v;
  END IF;

  -- CST x cClassTrib
  SELECT count(*) INTO v
  FROM public.correlacoes
  WHERE cclasstrib IS NOT NULL AND btrim(cclasstrib) <> ''
    AND cst IS DISTINCT FROM left(cclasstrib,3);
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % divergências CST/cClassTrib.', v;
  END IF;

  -- NBS válido quando presente
  SELECT count(*) INTO v
  FROM public.correlacoes
  WHERE nbs IS NOT NULL AND btrim(nbs) <> ''
    AND nbs !~ '^[0-9]\.[0-9]{4}\.[0-9]{2}\.[0-9]{2}$';
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % NBS fora do formato.', v;
  END IF;

  -- cClassTrib e CST
  SELECT count(*) INTO v
  FROM public.correlacoes
  WHERE cst IS NOT NULL AND btrim(cst) <> '' AND cst !~ '^[0-9]{3}$';
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % CST fora do formato.', v;
  END IF;

  SELECT count(*) INTO v
  FROM public.correlacoes
  WHERE cclasstrib IS NOT NULL AND btrim(cclasstrib) <> ''
    AND cclasstrib !~ '^[0-9]{6}$';
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % cClassTrib fora do formato.', v;
  END IF;

  -- Conflito de classificação para o mesmo Item + NBS.
  SELECT count(*) INTO v
  FROM (
    SELECT item_lc,nbs
    FROM public.correlacoes
    WHERE nbs IS NOT NULL AND btrim(nbs) <> ''
    GROUP BY item_lc,nbs
    HAVING count(DISTINCT cclasstrib) > 1
        OR count(DISTINCT cst) > 1
  ) x;
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % correlações Item+NBS com classificação conflitante.', v;
  END IF;

  -- Duplicidade semântica real.
  SELECT count(*) INTO v
  FROM (
    SELECT
      item_lc,descricao_lc,nbs,descricao_nbs,indop,cclasstrib,nome_cclasstrib,
      cst,descricao_cst,reducao_aliquota,base_legal,observacoes,palavras_chave,
      ps_onerosa,adq_exterior,local_incidencia_ibs
    FROM public.correlacoes
    GROUP BY
      item_lc,descricao_lc,nbs,descricao_nbs,indop,cclasstrib,nome_cclasstrib,
      cst,descricao_cst,reducao_aliquota,base_legal,observacoes,palavras_chave,
      ps_onerosa,adq_exterior,local_incidencia_ibs
    HAVING count(*) > 1
  ) x;
  IF v <> 0 THEN
    RAISE EXCEPTION 'Falha: % duplicidades semânticas reais.', v;
  END IF;
END;
$$;

-- Smoke test obrigatório do modelo de referência.
DO $$
DECLARE
  v_nbs integer;
  v_item integer;
BEGIN
  SELECT
    count(DISTINCT nbs) FILTER (WHERE nbs IS NOT NULL),
    count(DISTINCT item_lc)
  INTO v_nbs,v_item
  FROM public.correlacoes
  WHERE search_text LIKE '%' || public.normalizar_busca('contabilidade') || '%';

  IF v_nbs <> 3 OR v_item <> 1 THEN
    RAISE EXCEPTION
      'Falha smoke contabilidade: esperado 3 NBS / 1 item, obtido % NBS / % item(ns).',
      v_nbs,v_item;
  END IF;
END;
$$;
