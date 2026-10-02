-- Explicon Tax Link — auditoria somente leitura
-- Snapshot validado em 2026-10-02. Não modifica dados.

-- 1) Resumo geral
SELECT
  count(*) AS total_registros,
  count(DISTINCT id) AS ids_unicos,
  count(DISTINCT item_lc) FILTER (WHERE item_lc IS NOT NULL) AS total_codigos_item,
  count(DISTINCT nbs) FILTER (WHERE nbs IS NOT NULL) AS total_nbs,
  count(*) FILTER (WHERE nbs IS NULL OR btrim(nbs) = '') AS sem_nbs,
  count(*) FILTER (WHERE cclasstrib IS NULL OR btrim(cclasstrib) = '') AS sem_cclasstrib,
  count(*) FILTER (WHERE cst IS NULL OR btrim(cst) = '') AS sem_cst,
  count(*) FILTER (WHERE base_legal IS NULL OR btrim(base_legal) = '') AS sem_base_legal,
  count(*) FILTER (WHERE local_incidencia_ibs IS NULL OR btrim(local_incidencia_ibs) = '') AS sem_local_ibs
FROM public.correlacoes;

-- 2) Duplicidade semântica real.
-- Usa todos os campos de classificação/apresentação relevantes.
SELECT
  item_lc,descricao_lc,nbs,descricao_nbs,indop,cclasstrib,nome_cclasstrib,
  cst,descricao_cst,reducao_aliquota,base_legal,observacoes,palavras_chave,
  ps_onerosa,adq_exterior,local_incidencia_ibs,
  count(*) AS qtd,
  array_agg(id ORDER BY id) AS ids
FROM public.correlacoes
GROUP BY
  item_lc,descricao_lc,nbs,descricao_nbs,indop,cclasstrib,nome_cclasstrib,
  cst,descricao_cst,reducao_aliquota,base_legal,observacoes,palavras_chave,
  ps_onerosa,adq_exterior,local_incidencia_ibs
HAVING count(*) > 1
ORDER BY qtd DESC,item_lc,nbs NULLS LAST;

-- 3) Mesma correlação Item + NBS com classificações conflitantes.
SELECT
  item_lc,
  nbs,
  count(DISTINCT cclasstrib) AS classificacoes,
  array_agg(DISTINCT cclasstrib ORDER BY cclasstrib) AS cclasstrib_encontradas,
  array_agg(DISTINCT cst ORDER BY cst) AS cst_encontrados
FROM public.correlacoes
WHERE nbs IS NOT NULL AND btrim(nbs) <> ''
GROUP BY item_lc,nbs
HAVING count(DISTINCT cclasstrib) > 1 OR count(DISTINCT cst) > 1
ORDER BY classificacoes DESC,item_lc,nbs;

-- 4) CST deve acompanhar os três primeiros dígitos do cClassTrib.
SELECT id,item_lc,nbs,cclasstrib,cst
FROM public.correlacoes
WHERE cclasstrib IS NOT NULL
  AND btrim(cclasstrib) <> ''
  AND cst IS DISTINCT FROM left(cclasstrib,3)
ORDER BY item_lc,nbs NULLS LAST;

-- 5) Códigos internos 99.*.
SELECT
  item_lc,
  descricao_lc,
  count(*) AS qtd,
  count(*) FILTER (WHERE nbs IS NOT NULL AND btrim(nbs) <> '') AS com_nbs,
  count(*) FILTER (WHERE nbs IS NULL OR btrim(nbs) = '') AS sem_nbs,
  count(DISTINCT cclasstrib) AS cclasstrib_distintas
FROM public.correlacoes
WHERE item_lc LIKE '99.%'
GROUP BY item_lc,descricao_lc
ORDER BY item_lc;

-- 6) Valores de item_lc não reconhecidos como LC 116 ou categoria interna 99.*.
SELECT item_lc,descricao_lc,count(*) AS qtd
FROM public.correlacoes
WHERE item_lc IS NULL
   OR btrim(item_lc) = ''
   OR (
     item_lc !~ '^[0-9]{2}\.[0-9]{2}$'
     AND item_lc !~ '^99\.[0-9]{2}\.[0-9]{2}$'
   )
GROUP BY item_lc,descricao_lc
ORDER BY item_lc;

-- 7) Registros sem NBS: são regras/tratamentos adicionais na apresentação.
SELECT
  item_lc,
  descricao_lc,
  descricao_nbs,
  indop,
  cst,
  cclasstrib,
  nome_cclasstrib,
  reducao_aliquota
FROM public.correlacoes
WHERE nbs IS NULL OR btrim(nbs) = ''
ORDER BY item_lc,cclasstrib,descricao_nbs;

-- 8) Descrição de NBS sem código NBS.
-- Não é erro automaticamente: pode descrever uma variante de tratamento.
SELECT id,item_lc,descricao_lc,nbs,descricao_nbs,indop,cclasstrib,cst
FROM public.correlacoes
WHERE (nbs IS NULL OR btrim(nbs) = '')
  AND descricao_nbs IS NOT NULL
  AND btrim(descricao_nbs) <> ''
ORDER BY item_lc,id;

-- 9) Cobertura dos campos do novo cartão.
SELECT
  count(*) FILTER (WHERE nbs IS NOT NULL AND btrim(nbs) <> '') AS cartoes_nbs,
  count(*) FILTER (WHERE nbs IS NOT NULL AND (descricao_nbs IS NULL OR btrim(descricao_nbs)='')) AS cartoes_sem_descricao_nbs,
  count(*) FILTER (WHERE nbs IS NOT NULL AND (descricao_lc IS NULL OR btrim(descricao_lc)='')) AS cartoes_sem_descricao_item,
  count(*) FILTER (WHERE nbs IS NOT NULL AND (local_incidencia_ibs IS NULL OR btrim(local_incidencia_ibs)='')) AS cartoes_sem_local_ibs,
  count(*) FILTER (WHERE nbs IS NOT NULL AND (cst IS NULL OR btrim(cst)='')) AS cartoes_sem_cst,
  count(*) FILTER (WHERE nbs IS NOT NULL AND (cclasstrib IS NULL OR btrim(cclasstrib)='')) AS cartoes_sem_cclasstrib,
  count(*) FILTER (WHERE nbs IS NOT NULL AND (nome_cclasstrib IS NULL OR btrim(nome_cclasstrib)='')) AS cartoes_sem_nome_cclasstrib
FROM public.correlacoes;

-- 10) Smoke tests de busca.
WITH termos(termo) AS (
  VALUES
    ('contabilidade'),
    ('fisioterapia'),
    ('advocacia'),
    ('programacao'),
    ('1.1302.21.00'),
    ('locacao')
)
SELECT
  t.termo,
  count(c.id) AS registros,
  count(DISTINCT c.item_lc) AS itens,
  count(DISTINCT c.nbs) FILTER (WHERE c.nbs IS NOT NULL) AS nbs_distintos
FROM termos t
LEFT JOIN public.correlacoes c
  ON c.search_text LIKE '%' || public.normalizar_busca(t.termo) || '%'
GROUP BY t.termo
ORDER BY t.termo;
