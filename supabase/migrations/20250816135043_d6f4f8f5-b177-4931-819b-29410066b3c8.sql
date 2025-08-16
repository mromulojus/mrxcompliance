-- Criar tipos enumerados para processos judiciais
CREATE TYPE IF NOT EXISTS processo_status AS ENUM (
  'ativo',
  'suspenso', 
  'arquivado',
  'transitado_julgado',
  'baixado'
);

CREATE TYPE IF NOT EXISTS evento_tipo AS ENUM (
  'audiencia',
  'prazo',
  'reuniao',
  'vencimento',
  'intimacao',
  'peticao',
  'decisao',
  'outro'
);

CREATE TYPE IF NOT EXISTS documento_processo_tipo AS ENUM (
  'inicial',
  'contestacao',
  'sentenca',
  'recurso',
  'acordo',
  'comprovante',
  'procuracao',
  'outro'
);

-- Tabela de eventos/calendário
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  tipo evento_tipo NOT NULL DEFAULT 'outro',
  local TEXT,
  participantes TEXT[],
  processo_id UUID,
  divida_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de processos judiciais
CREATE TABLE public.processos_judiciais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  numero_processo TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  acao TEXT NOT NULL,
  juizo TEXT,
  vara TEXT,
  tribunal TEXT,
  link_tribunal TEXT,
  autor TEXT NOT NULL,
  reu TEXT NOT NULL,
  reu_contratado TEXT,
  parte_contraria TEXT,
  advogado_responsavel TEXT,
  status processo_status NOT NULL DEFAULT 'ativo',
  valor_causa DECIMAL(15,2),
  valor_origem DECIMAL(15,2),
  valor_compra DECIMAL(15,2),
  valor_pensao DECIMAL(15,2),
  data_distribuicao DATE,
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  divida_id UUID, -- Vinculação opcional com dívida
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico dos processos
CREATE TABLE public.processos_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL,
  data_evento DATE NOT NULL,
  tipo_evento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  detalhes TEXT,
  urgente BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de documentos dos processos
CREATE TABLE public.processos_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL,
  nome_documento TEXT NOT NULL,
  tipo documento_processo_tipo NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER,
  mime_type TEXT,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL,
  tags TEXT[],
  observacoes TEXT
);

-- Tabela de valores/honorários/despesas
CREATE TABLE public.processos_valores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL,
  tipo TEXT NOT NULL, -- 'honorario', 'despesa', 'valor_processo'
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  pago BOOLEAN DEFAULT FALSE,
  forma_pagamento TEXT,
  observacoes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_judiciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_valores ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para eventos
CREATE POLICY "Users can view eventos based on empresa access" 
ON public.eventos FOR SELECT 
USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage eventos" 
ON public.eventos FOR ALL 
USING (has_role(auth.uid(), 'administrador'::user_role));

-- Políticas de segurança para processos judiciais
CREATE POLICY "Users can view processos based on empresa access" 
ON public.processos_judiciais FOR SELECT 
USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage processos" 
ON public.processos_judiciais FOR ALL 
USING (has_role(auth.uid(), 'administrador'::user_role));

-- Políticas de segurança para histórico
CREATE POLICY "Users can view historico based on processo access" 
ON public.processos_historico FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM public.processos_judiciais 
  WHERE id = processos_historico.processo_id 
  AND user_can_access_empresa(empresa_id)
));

CREATE POLICY "Authenticated can insert historico" 
ON public.processos_historico FOR INSERT 
WITH CHECK (EXISTS(
  SELECT 1 FROM public.processos_judiciais 
  WHERE id = processos_historico.processo_id 
  AND user_can_access_empresa(empresa_id)
) AND auth.uid() = created_by);

-- Políticas de segurança para documentos
CREATE POLICY "Users can view documentos based on processo access" 
ON public.processos_documentos FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM public.processos_judiciais 
  WHERE id = processos_documentos.processo_id 
  AND user_can_access_empresa(empresa_id)
));

CREATE POLICY "Admins can manage documentos" 
ON public.processos_documentos FOR ALL 
USING (EXISTS(
  SELECT 1 FROM public.processos_judiciais 
  WHERE id = processos_documentos.processo_id 
  AND user_can_access_empresa(empresa_id)
) AND has_role(auth.uid(), 'administrador'::user_role));

-- Políticas de segurança para valores
CREATE POLICY "Users can view valores based on processo access" 
ON public.processos_valores FOR SELECT 
USING (EXISTS(
  SELECT 1 FROM public.processos_judiciais 
  WHERE id = processos_valores.processo_id 
  AND user_can_access_empresa(empresa_id)
));

CREATE POLICY "Admins can manage valores" 
ON public.processos_valores FOR ALL 
USING (EXISTS(
  SELECT 1 FROM public.processos_judiciais 
  WHERE id = processos_valores.processo_id 
  AND user_can_access_empresa(empresa_id)
) AND has_role(auth.uid(), 'administrador'::user_role));

-- Triggers para updated_at
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON public.processos_judiciais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_eventos_empresa_data ON public.eventos(empresa_id, data_inicio);
CREATE INDEX idx_processos_empresa ON public.processos_judiciais(empresa_id);
CREATE INDEX idx_processos_numero ON public.processos_judiciais(numero_processo);
CREATE INDEX idx_processos_historico_processo ON public.processos_historico(processo_id, data_evento);
CREATE INDEX idx_processos_documentos_processo ON public.processos_documentos(processo_id);
CREATE INDEX idx_processos_valores_processo ON public.processos_valores(processo_id);