-- Ensure security and explicit search path for relevant functions

CREATE OR REPLACE FUNCTION public.generate_protocol()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  protocol TEXT;
BEGIN
  protocol := 'MRX-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN protocol;
END;
$$;

CREATE OR REPLACE FUNCTION public.calcular_valor_atualizado(
  valor_original DECIMAL,
  data_vencimento DATE,
  multa_perc DECIMAL DEFAULT 2.00,
  juros_perc DECIMAL DEFAULT 1.00,
  correcao_perc DECIMAL DEFAULT 1.50
) RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dias_atraso INTEGER;
  valor_multa DECIMAL;
  valor_juros DECIMAL;
  valor_correcao DECIMAL;
  valor_total DECIMAL;
BEGIN
  -- Calcular dias de atraso
  dias_atraso := GREATEST(0, CURRENT_DATE - data_vencimento);

  IF dias_atraso = 0 THEN
    RETURN valor_original;
  END IF;

  -- Calcular multa (aplicada uma vez)
  valor_multa := valor_original * (multa_perc / 100);

  -- Calcular juros (por mês de atraso)
  valor_juros := valor_original * (juros_perc / 100) * (dias_atraso / 30.0);

  -- Calcular correção monetária (por mês de atraso)
  valor_correcao := valor_original * (correcao_perc / 100) * (dias_atraso / 30.0);

  valor_total := valor_original + valor_multa + valor_juros + valor_correcao;

  RETURN ROUND(valor_total, 2);
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_valores_dividas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
