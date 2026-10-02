-- Correção preparada: Item LC da Advocacia
-- Fonte normativa verificada: LC 116/2003, lista anexa, subitem 17.14 = Advocacia.
-- NÃO EXECUTAR EM PRODUÇÃO SEM PASSAR PELO GATE DE PUBLICAÇÃO.

DO $$
DECLARE
  v_total integer;
BEGIN
  SELECT count(*)
    INTO v_total
  FROM public.correlacoes
  WHERE lower(btrim(item_lc)) = 'advocacia'
    AND lower(btrim(descricao_lc)) = 'advocacia.';

  IF v_total <> 5 THEN
    RAISE EXCEPTION
      'Correção 17.14 cancelada: esperados 5 registros de Advocacia, encontrados %.',
      v_total;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.correlacoes
    WHERE item_lc = '17.14'
  ) THEN
    RAISE EXCEPTION
      'Correção 17.14 cancelada: já existem registros com item_lc 17.14; revisão manual necessária.';
  END IF;

  UPDATE public.correlacoes
  SET item_lc = '17.14'
  WHERE lower(btrim(item_lc)) = 'advocacia'
    AND lower(btrim(descricao_lc)) = 'advocacia.';
END;
$$;

-- Pós-condição esperada:
-- 5 registros em 17.14 e 0 registros com item_lc textual "advocacia".
