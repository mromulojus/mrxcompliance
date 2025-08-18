-- Relax constraints on historico_cobrancas to prevent app inserts from failing
-- Drops strict CHECK constraints so the application can evolve the allowed values

ALTER TABLE public.historico_cobrancas
  DROP CONSTRAINT IF EXISTS historico_cobrancas_tipo_acao_check;

ALTER TABLE public.historico_cobrancas
  DROP CONSTRAINT IF EXISTS historico_cobrancas_resultado_check;

-- Optionally, you may later reintroduce narrower checks aligned with the UI
