
-- Tabela para configurações de cobrança das empresas
CREATE TABLE public.empresa_cobranca_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  multa_padrao DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  juros_padrao DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  correcao_padrao DECIMAL(5,2) NOT NULL DEFAULT 1.50,
  dias_negativacao INTEGER DEFAULT 30,
  dias_protesto INTEGER DEFAULT 45,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(empresa_id)
);

-- Tabela de devedores
CREATE TABLE public.devedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  documento TEXT NOT NULL, -- CPF ou CNPJ
  tipo_pessoa TEXT NOT NULL CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
  endereco_completo TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  telefone_principal TEXT,
  telefone_whatsapp TEXT,
  telefones_outros TEXT[],
  email_principal TEXT,
  email_secundario TEXT,
  contato_emergencia_nome TEXT,
  contato_emergencia_telefone TEXT,
  local_trabalho TEXT,
  score_recuperabilidade INTEGER DEFAULT 0,
  canal_preferencial TEXT DEFAULT 'whatsapp' CHECK (canal_preferencial IN ('whatsapp', 'telefone', 'email', 'sms')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de dívidas
CREATE TABLE public.dividas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devedor_id UUID NOT NULL REFERENCES public.devedores(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  numero_contrato TEXT,
  numero_nf TEXT,
  origem_divida TEXT NOT NULL,
  data_vencimento DATE NOT NULL,
  valor_original DECIMAL(12,2) NOT NULL,
  valor_multa DECIMAL(12,2) DEFAULT 0,
  valor_juros DECIMAL(12,2) DEFAULT 0,
  valor_correcao DECIMAL(12,2) DEFAULT 0,
  valor_atualizado DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'negociacao', 'acordado', 'pago', 'judicial', 'negativado', 'protestado', 'cancelado')),
  estagio TEXT NOT NULL DEFAULT 'vencimento_proximo' CHECK (estagio IN ('vencimento_proximo', 'vencido', 'negociacao', 'formal', 'judicial')),
  data_negativacao DATE,
  data_protesto DATE,
  urgency_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de histórico de cobranças
CREATE TABLE public.historico_cobrancas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  devedor_id UUID NOT NULL REFERENCES public.devedores(id) ON DELETE CASCADE,
  tipo_acao TEXT NOT NULL CHECK (tipo_acao IN ('contato_telefone', 'contato_whatsapp', 'email', 'sms', 'carta', 'visita', 'acordo', 'pagamento', 'negativacao', 'protesto', 'judicial')),
  canal TEXT NOT NULL,
  resultado TEXT CHECK (resultado IN ('sem_resposta', 'pessoa_certa', 'pessoa_errada', 'numero_inexistente', 'compromisso_pagamento', 'acordo_fechado', 'recusa', 'disputa')),
  descricao TEXT NOT NULL,
  valor_negociado DECIMAL(12,2),
  data_compromisso DATE,
  observacoes TEXT,
  anexos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela de acordos
CREATE TABLE public.acordos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  devedor_id UUID NOT NULL REFERENCES public.devedores(id) ON DELETE CASCADE,
  valor_acordo DECIMAL(12,2) NOT NULL,
  desconto_percentual DECIMAL(5,2),
  parcelas INTEGER DEFAULT 1,
  valor_entrada DECIMAL(12,2) DEFAULT 0,
  valor_parcela DECIMAL(12,2),
  data_vencimento_entrada DATE,
  data_primeira_parcela DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cumprido', 'quebrado', 'cancelado')),
  forma_pagamento TEXT CHECK (forma_pagamento IN ('pix', 'boleto', 'cartao', 'dinheiro', 'transferencia')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela de pagamentos
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  acordo_id UUID REFERENCES public.acordos(id) ON DELETE SET NULL,
  valor_pago DECIMAL(12,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  forma_pagamento TEXT NOT NULL,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela de documentos da dívida
CREATE TABLE public.documentos_divida (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('contrato', 'nota_fiscal', 'comprovante_entrega', 'comprovante_servico', 'correspondencia', 'acordo', 'comprovante_pagamento', 'outros')),
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_devedores_empresa_id ON public.devedores(empresa_id);
CREATE INDEX idx_devedores_documento ON public.devedores(documento);
CREATE INDEX idx_dividas_devedor_id ON public.dividas(devedor_id);
CREATE INDEX idx_dividas_empresa_id ON public.dividas(empresa_id);
CREATE INDEX idx_dividas_status ON public.dividas(status);
CREATE INDEX idx_dividas_vencimento ON public.dividas(data_vencimento);
CREATE INDEX idx_historico_divida_id ON public.historico_cobrancas(divida_id);
CREATE INDEX idx_acordos_divida_id ON public.acordos(divida_id);
CREATE INDEX idx_pagamentos_divida_id ON public.pagamentos(divida_id);

-- Triggers para updated_at
CREATE TRIGGER update_empresa_cobranca_config_updated_at
  BEFORE UPDATE ON public.empresa_cobranca_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devedores_updated_at
  BEFORE UPDATE ON public.devedores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dividas_updated_at
  BEFORE UPDATE ON public.dividas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acordos_updated_at
  BEFORE UPDATE ON public.acordos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.empresa_cobranca_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_divida ENABLE ROW LEVEL SECURITY;

-- Políticas para empresa_cobranca_config
CREATE POLICY "Users can view empresa config based on role" ON public.empresa_cobranca_config
  FOR SELECT USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage empresa config" ON public.empresa_cobranca_config
  FOR ALL USING (has_role(auth.uid(), 'administrador'::user_role));

-- Políticas para devedores
CREATE POLICY "Users can view devedores based on role" ON public.devedores
  FOR SELECT USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage devedores" ON public.devedores
  FOR ALL USING (has_role(auth.uid(), 'administrador'::user_role));

-- Políticas para dividas
CREATE POLICY "Users can view dividas based on role" ON public.dividas
  FOR SELECT USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage dividas" ON public.dividas
  FOR ALL USING (has_role(auth.uid(), 'administrador'::user_role));

-- Políticas para historico_cobrancas
CREATE POLICY "Users can view historico based on empresa access" ON public.historico_cobrancas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = historico_cobrancas.divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    )
  );

CREATE POLICY "Authenticated can insert historico" ON public.historico_cobrancas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    )
  );

-- Políticas para acordos
CREATE POLICY "Users can view acordos based on empresa access" ON public.acordos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = acordos.divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    )
  );

CREATE POLICY "Admins can manage acordos" ON public.acordos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    ) AND (has_role(auth.uid(), 'administrador'::user_role))
  );

-- Políticas para pagamentos
CREATE POLICY "Users can view pagamentos based on empresa access" ON public.pagamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = pagamentos.divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    )
  );

CREATE POLICY "Admins can manage pagamentos" ON public.pagamentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    ) AND (has_role(auth.uid(), 'administrador'::user_role))
  );

-- Políticas para documentos_divida
CREATE POLICY "Users can view documentos based on empresa access" ON public.documentos_divida
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = documentos_divida.divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    )
  );

CREATE POLICY "Admins can manage documentos" ON public.documentos_divida
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dividas 
      WHERE dividas.id = divida_id 
      AND user_can_access_empresa(dividas.empresa_id)
    ) AND (has_role(auth.uid(), 'administrador'::user_role))
  );

-- Função para calcular valor atualizado
CREATE OR REPLACE FUNCTION public.calcular_valor_atualizado(
  valor_original DECIMAL,
  data_vencimento DATE,
  multa_perc DECIMAL DEFAULT 2.00,
  juros_perc DECIMAL DEFAULT 1.00,
  correcao_perc DECIMAL DEFAULT 1.50
) RETURNS DECIMAL
LANGUAGE plpgsql
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

-- Função para atualizar automaticamente os valores das dívidas
CREATE OR REPLACE FUNCTION public.atualizar_valores_dividas()
RETURNS void
LANGUAGE plpgsql
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
