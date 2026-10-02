-- Explicon Tax Link — auditoria somente leitura
-- Pode ser executado no Supabase sem modificar dados.

-- 1) Resumo geral
SELECT
  count(*) AS total_registros,
  count(DISTINCT item_lc) FILTER (WHERE item_lc IS NOT NULL) AS total_itens_lc,
  count(DISTINCT nbs) FILTER (WHERE nbs IS NOT NULL) AS total_nbs,
  count(*) FILTER (WHERE nbs IS NULL OR btrim(nbs) = '') AS sem_nbs,
  count(*) FILTER (WHERE cclasstrib IS NULL OR btrim(cclasstrib) = '') AS sem_cclasstrib,
  count(*) FILTER (WHERE cst IS NULL OR btrim(cst) = '') AS sem_cst,
  count(*) FILTER (WHERE base_legal IS NULL OR btrim(base_legal) = '') AS sem_base_legal,
  count(*) FILTER (WHERE local_incidencia_ibs IS NULL OR btrim(local_incidencia_ibs) = '') AS sem_local_ibs
FROM public.correlacoes;

-- 2) Duplicidades estruturais
SELECT item_lc, nbs, indop, cclasstrib, count(*) AS qtd
FROM public.correlacoes
GROUP BY item_lc, nbs, indop, cclasstrib
HAVING count(*) > 1
ORDER BY qtd DESC, item_lc, nbs;

-- 3) Valores em item_lc que não têm formato de Item LC 116 tradicional.
-- Códigos internos 99.* devem ser conscientemente classificados como internos.
SELECT item_lc, descricao_lc, count(*) AS qtd
FROM public.correlacoes
WHERE item_lc IS NULL
   OR btrim(item_lc) = ''
   OR item_lc !~ '^[0-9]{2}\.[0-9]{2}$'
GROUP BY item_lc, descricao_lc
ORDER BY item_lc;

-- 4) Registros sem NBS: devem ser apresentados como tratamento adicional,
-- nunca como correlação NBS confirmada.
SELECT
  item_lc,
  descricao_lc,
  indop,
  cst,
  cclasstrib,
  nome_cclasstrib,
  reducao_aliquota
FROM public.correlacoes
WHERE nbs IS NULL OR btrim(nbs) = ''
ORDER BY item_lc, cclasstrib;

-- 5) cClassTrib x CST: verifica se o CST derivado corresponde aos 3 primeiros dígitos.
SELECT id, item_lc, nbs, cclasstrib, cst
FROM public.correlacoes
WHERE cclasstrib IS NOT NULL
  AND cst IS DISTINCT FROM left(cclasstrib, 3);

-- 6) Possíveis conflitos: mesmo Item LC + NBS com mais de uma classificação.
SELECT
  item_lc,
  nbs,
  count(DISTINCT cclasstrib) AS classificacoes,
  array_agg(DISTINCT cclasstrib ORDER BY cclasstrib) AS cclasstrib_encontradas
FROM public.correlacoes
WHERE nbs IS NOT NULL
GROUP BY item_lc, nbs
HAVING count(DISTINCT cclasstrib) > 1
ORDER BY classificacoes DESC, item_lc, nbs;

-- 7) Cobertura de informações exigidas pelo novo cartão.
SELECT
  count(*) FILTER (WHERE nbs IS NOT NULL) AS cartoes_nbs,
  count(*) FILTER (WHERE nbs IS NOT NULL AND descricao_nbs IS NULL) AS cartoes_sem_descricao_nbs,
  count(*) FILTER (WHERE nbs IS NOT NULL AND descricao_lc IS NULL) AS cartoes_sem_descricao_item,
  count(*) FILTER (WHERE nbs IS NOT NULL AND local_incidencia_ibs IS NULL) AS cartoes_sem_local_ibs,
  count(*) FILTER (WHERE nbs IS NOT NULL AND cst IS NULL) AS cartoes_sem_cst,
  count(*) FILTER (WHERE nbs IS NOT NULL AND cclasstrib IS NULL) AS cartoes_sem_cclasstrib,
  count(*) FILTER (WHERE nbs IS NOT NULL AND nome_cclasstrib IS NULL) AS cartoes_sem_nome_cclasstrib
FROM public.correlacoes;
