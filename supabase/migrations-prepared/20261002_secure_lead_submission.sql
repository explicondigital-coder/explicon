-- Explicon Tax Link — envio seguro de leads
-- PREPARADA NO GITHUB. Não aplicar antes de atualizar o LeadForm para usar esta RPC.

CREATE OR REPLACE FUNCTION public.enviar_lead_seguro(
  _nome text,
  _email text,
  _termo_buscado text DEFAULT NULL,
  _origem text DEFAULT 'cta_duvida_classificacao'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome text := btrim(coalesce(_nome, ''));
  v_email text := lower(btrim(coalesce(_email, '')));
  v_termo text := nullif(left(btrim(coalesce(_termo_buscado, '')), 200), '');
  v_origem text := left(btrim(coalesce(_origem, 'cta_duvida_classificacao')), 80);
  v_existente uuid;
  v_id uuid;
BEGIN
  IF char_length(v_nome) < 2 OR char_length(v_nome) > 100 THEN
    RAISE EXCEPTION 'Nome inválido';
  END IF;

  IF char_length(v_email) > 255
     OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'E-mail inválido';
  END IF;

  -- Idempotência básica: evita várias submissões iguais do mesmo e-mail
  -- dentro de uma janela curta, sem guardar IP ou outro identificador.
  SELECT id
    INTO v_existente
  FROM public.leads
  WHERE lower(email) = v_email
    AND origem = v_origem
    AND coalesce(termo_buscado, '') = coalesce(v_termo, '')
    AND criado_em >= now() - interval '15 minutes'
  ORDER BY criado_em DESC
  LIMIT 1;

  IF v_existente IS NOT NULL THEN
    RETURN v_existente;
  END IF;

  INSERT INTO public.leads (nome, email, termo_buscado, origem)
  VALUES (v_nome, v_email, v_termo, v_origem)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enviar_lead_seguro(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enviar_lead_seguro(text,text,text,text)
TO anon, authenticated, service_role;

-- Depois que o frontend estiver usando a RPC:
REVOKE INSERT ON public.leads FROM anon, authenticated;
REVOKE SELECT ON public.leads FROM anon;
DROP POLICY IF EXISTS "Visitantes podem enviar leads" ON public.leads;

COMMENT ON FUNCTION public.enviar_lead_seguro(text,text,text,text)
IS 'Recebe lead com validação e deduplicação de 15 minutos, sem permitir INSERT direto anônimo e sem grant SELECT para anon.';
