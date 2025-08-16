-- Enforce secure search_path for functions

CREATE OR REPLACE FUNCTION public.generate_protocol()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
DECLARE
  protocol TEXT;
BEGIN
  protocol := 'MRX-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN protocol;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_protocol() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_protocol() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.calcular_valor_atualizado(
  valor_original DECIMAL,
  data_vencimento DATE,
  multa_perc DECIMAL DEFAULT 2.00,
  juros_perc DECIMAL DEFAULT 1.00,
  correcao_perc DECIMAL DEFAULT 1.50
) RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
DECLARE
  dias_atraso INTEGER;
  valor_multa DECIMAL;
  valor_juros DECIMAL;
  valor_correcao DECIMAL;
  valor_total DECIMAL;
BEGIN
  dias_atraso := GREATEST(0, CURRENT_DATE - data_vencimento);

  IF dias_atraso = 0 THEN
    RETURN valor_original;
  END IF;

  valor_multa := valor_original * (multa_perc / 100);
  valor_juros := valor_original * (juros_perc / 100) * (dias_atraso / 30.0);
  valor_correcao := valor_original * (correcao_perc / 100) * (dias_atraso / 30.0);

  valor_total := valor_original + valor_multa + valor_juros + valor_correcao;
  RETURN ROUND(valor_total, 2);
END;
$$;

REVOKE ALL ON FUNCTION public.calcular_valor_atualizado(DECIMAL, DATE, DECIMAL, DECIMAL, DECIMAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calcular_valor_atualizado(DECIMAL, DATE, DECIMAL, DECIMAL, DECIMAL) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.atualizar_valores_dividas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  UPDATE public.dividas
  SET
    valor_atualizado = calcular_valor_atualizado(
      valor_original,
      data_vencimento,
      COALESCE((SELECT multa_padrao FROM empresa_cobranca_config WHERE empresa_id = dividas.empresa_id), 2.00),
      COALESCE((SELECT juros_padrao FROM empresa_cobranca_config WHERE empresa_id = dividas.empresa_id), 1.00),
      COALESCE((SELECT correcao_padrao FROM empresa_cobranca_config WHERE empresa_id = dividas.empresa_id), 1.50)
    ),
    updated_at = now()
  WHERE status IN ('pendente', 'negociacao', 'vencido');
END;
$$;

REVOKE ALL ON FUNCTION public.atualizar_valores_dividas() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.atualizar_valores_dividas() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.generate_valid_email(username_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
  SET search_path = '', public;
BEGIN
  IF username_text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
    RETURN username_text;
  END IF;
  RETURN username_text || '@sistema.interno';
END;
$$;

REVOKE ALL ON FUNCTION public.generate_valid_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_valid_email(text) TO authenticated, service_role;

