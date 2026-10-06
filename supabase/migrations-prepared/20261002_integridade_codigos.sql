-- Explicon Tax Link — integridade estrutural de códigos
-- PREPARADA NO GITHUB. Aplicar somente após a migration da Advocacia 17.14.
-- Não corrige ps_onerosa='advocacia': esse caso exige validação de origem.

-- Normalização segura e não semântica.
UPDATE public.correlacoes
SET ps_onerosa = 'S'
WHERE ps_onerosa = 's';

-- Pré-condição: nenhum item_lc fora dos formatos aceitos.
DO $$
DECLARE
  v_invalidos integer;
BEGIN
  SELECT count(*) INTO v_invalidos
  FROM public.correlacoes
  WHERE item_lc IS NULL
     OR (
       item_lc !~ '^[0-9]{2}\.[0-9]{2}$'
       AND item_lc !~ '^99\.[0-9]{2}\.[0-9]{2}$'
     );

  IF v_invalidos <> 0 THEN
    RAISE EXCEPTION
      'Constraints não aplicadas: existem % item_lc fora do padrão. Corrija primeiro.',
      v_invalidos;
  END IF;
END;
$$;

ALTER TABLE public.correlacoes
  DROP CONSTRAINT IF EXISTS correlacoes_item_lc_formato_chk,
  DROP CONSTRAINT IF EXISTS correlacoes_nbs_formato_chk,
  DROP CONSTRAINT IF EXISTS correlacoes_cst_formato_chk,
  DROP CONSTRAINT IF EXISTS correlacoes_cclasstrib_formato_chk,
  DROP CONSTRAINT IF EXISTS correlacoes_indop_formato_chk,
  DROP CONSTRAINT IF EXISTS correlacoes_adq_exterior_chk;

ALTER TABLE public.correlacoes
  ADD CONSTRAINT correlacoes_item_lc_formato_chk
    CHECK (
      item_lc ~ '^[0-9]{2}\.[0-9]{2}$'
      OR item_lc ~ '^99\.[0-9]{2}\.[0-9]{2}$'
    ),
  ADD CONSTRAINT correlacoes_nbs_formato_chk
    CHECK (
      nbs IS NULL
      OR btrim(nbs) = ''
      OR nbs ~ '^[0-9]\.[0-9]{4}\.[0-9]{2}\.[0-9]{2}$'
    ),
  ADD CONSTRAINT correlacoes_cst_formato_chk
    CHECK (cst IS NULL OR btrim(cst) = '' OR cst ~ '^[0-9]{3}$'),
  ADD CONSTRAINT correlacoes_cclasstrib_formato_chk
    CHECK (
      cclasstrib IS NULL
      OR btrim(cclasstrib) = ''
      OR cclasstrib ~ '^[0-9]{6}$'
    ),
  ADD CONSTRAINT correlacoes_indop_formato_chk
    CHECK (indop IS NULL OR btrim(indop) = '' OR indop ~ '^[0-9]{6}$'),
  ADD CONSTRAINT correlacoes_adq_exterior_chk
    CHECK (adq_exterior IS NULL OR adq_exterior IN ('S','N'));

-- ps_onerosa fica deliberadamente sem constraint até revisar os cinco
-- registros atualmente contaminados com o valor textual "advocacia".
