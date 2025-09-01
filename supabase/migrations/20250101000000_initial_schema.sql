-- Custom types
CREATE TYPE public.user_role AS ENUM ('superuser', 'administrador', 'empresarial', 'operacional');
CREATE TYPE public.colaborador_status AS ENUM ('ATIVO', 'INATIVO', 'DEMITIDO');
CREATE TYPE public.tipo_contrato AS ENUM ('CLT', 'PJ', 'PF');
CREATE TYPE public.sexo AS ENUM ('MASCULINO', 'FEMININO');
CREATE TYPE public.estado_civil AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL');
CREATE TYPE public.escolaridade AS ENUM ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO');
CREATE TYPE public.tipo_conta AS ENUM ('CORRENTE', 'POUPANCA');
CREATE TYPE public.denuncia_status AS ENUM ('RECEBIDO', 'EM_ANALISE', 'INVESTIGACAO', 'CONCLUIDO');
CREATE TYPE public.relacao_empresa AS ENUM ('COLABORADOR', 'EX_COLABORADOR', 'FORNECEDOR', 'CLIENTE', 'OUTRO');
CREATE TYPE public.tipo_denuncia AS ENUM ('DISCRIMINACAO', 'ASSEDIO_MORAL', 'CORRUPCAO', 'VIOLACAO_TRABALHISTA', 'OUTRO');
CREATE TYPE public.conhecimento_fato AS ENUM ('OUVI_FALAR', 'DOCUMENTO', 'COLEGA_TRABALHO', 'OUTRO');
CREATE TYPE public.tipo_documento AS ENUM ('RG', 'CPF', 'CTPS', 'COMPROVANTE_ENDERECO', 'DIPLOMA', 'CERTIDAO', 'LAUDO', 'CONTRATO', 'OUTROS');
CREATE TYPE processo_status AS ENUM (
          'ativo',
          'suspenso', 
          'arquivado',
          'transitado_julgado',
          'baixado'
        );
CREATE TYPE evento_tipo AS ENUM (
          'audiencia',
          'prazo',
          'reuniao',
          'vencimento',
          'intimacao',
          'peticao',
          'decisao',
          'outro'
        );
CREATE TYPE documento_processo_tipo AS ENUM (
          'inicial',
          'contestacao',
          'sentenca',
          'recurso',
          'acordo',
          'comprovante',
          'procuracao',
          'outro'
        );
CREATE TYPE task_status AS ENUM ('a_fazer', 'em_andamento', 'em_revisao', 'concluido');
CREATE TYPE task_priority AS ENUM ('alta', 'media', 'baixa');
CREATE TYPE task_module AS ENUM ('ouvidoria', 'auditoria', 'cobrancas', 'geral');
CREATE TYPE public.board_module AS ENUM (
  'vendas',
  'compliance', 
  'juridico',
  'ouvidoria',
  'cobranca',
  'administrativo',
  'geral'
);

-- Core tables
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'operacional',
  empresa_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );
CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  endereco TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
  );
CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT NOT NULL,
  departamento TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  status public.colaborador_status NOT NULL DEFAULT 'ATIVO',
  tipo_contrato public.tipo_contrato NOT NULL DEFAULT 'CLT',
  data_admissao DATE NOT NULL,
  data_nascimento DATE NOT NULL,
  sexo public.sexo NOT NULL,
  salario_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  telefone TEXT,
  celular TEXT,
  endereco TEXT NOT NULL,
  cep TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  estado_civil public.estado_civil NOT NULL,
  escolaridade public.escolaridade NOT NULL,
  nome_mae TEXT NOT NULL,
  nome_pai TEXT,
  -- Contato de emergência
  contato_emergencia_nome TEXT NOT NULL,
  contato_emergencia_telefone TEXT NOT NULL,
  contato_emergencia_parentesco TEXT NOT NULL,
  -- Documentos
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT NOT NULL,
  rg_orgao_emissor TEXT NOT NULL,
  ctps TEXT,
  ctps_serie TEXT,
  pis_pasep TEXT,
  titulo_eleitor TEXT,
  reservista TEXT,
  -- Benefícios
  vale_transporte BOOLEAN DEFAULT false,
  vale_refeicao BOOLEAN DEFAULT false,
  valor_vale_transporte DECIMAL(10,2) DEFAULT 0,
  valor_vale_refeicao DECIMAL(10,2) DEFAULT 0,
  plano_saude BOOLEAN DEFAULT false,
  plano_odontologico BOOLEAN DEFAULT false,
  -- Dependentes
  tem_filhos_menores_14 BOOLEAN DEFAULT false,
  quantidade_filhos INTEGER DEFAULT 0,
  filhos JSONB DEFAULT '[]',
  -- Dados bancários
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta public.tipo_conta,
  pix TEXT,
  foto_perfil TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
  );
CREATE TABLE public.documentos_colaborador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo public.tipo_documento NOT NULL,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
  );
CREATE TABLE public.historico_colaborador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  observacao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
  );
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
CREATE TABLE public.denuncias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL UNIQUE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  identificado BOOLEAN NOT NULL DEFAULT false,
  nome TEXT,
  email TEXT,
  relacao public.relacao_empresa NOT NULL,
  tipo public.tipo_denuncia NOT NULL,
  setor TEXT,
  conhecimento_fato public.conhecimento_fato NOT NULL,
  envolvidos_cientes BOOLEAN NOT NULL DEFAULT false,
  descricao TEXT NOT NULL,
  evidencias_descricao TEXT,
  sugestao TEXT,
  anexos TEXT[],
  status public.denuncia_status NOT NULL DEFAULT 'RECEBIDO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );
CREATE TABLE public.comentarios_denuncia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  denuncia_id UUID NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );
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
CREATE TABLE public.agenda_acordos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  devedor_nome TEXT NOT NULL,
  parcela_numero INTEGER NOT NULL,
  parcela_total INTEGER NOT NULL,
  valor_parcela NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  acordo_id UUID,
  divida_id UUID,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago', 'atrasado'
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
CREATE TABLE public.board_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );

-- Tabela tarefas com referências para boards (deve vir após boards e board_columns)
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status task_status NOT NULL DEFAULT 'a_fazer',
  prioridade task_priority NOT NULL DEFAULT 'media',
  modulo_origem task_module NOT NULL DEFAULT 'geral',
  empresa_id UUID REFERENCES public.empresas(id),
  responsavel_id UUID REFERENCES auth.users(id),
  responsavel_ids UUID[],
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  data_vencimento DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  ordem_na_coluna INTEGER DEFAULT 0,
  board_id UUID REFERENCES public.boards(id),
  column_id UUID REFERENCES public.board_columns(id),
  -- Vinculações com outros módulos
  denuncia_id UUID REFERENCES public.denuncias(id),
  divida_id UUID REFERENCES public.dividas(id),
  colaborador_id UUID REFERENCES public.colaboradores(id),
  processo_id UUID REFERENCES public.processos_judiciais(id),
  -- Anexos (URLs do Supabase Storage)
  anexos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );

CREATE TABLE public.task_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  empresa_id UUID NULL REFERENCES public.empresas(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
CREATE TABLE public.task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
CREATE TABLE public.task_board_members (
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (board_id, user_id)
  );
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  by_user TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );
CREATE TABLE public.user_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
  );
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT,
  business_unit TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT departments_name_unique UNIQUE (company_id, name),
  CONSTRAINT departments_slug_unique UNIQUE (company_id, slug)
  );
CREATE TABLE public.user_departments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role_in_department TEXT NOT NULL DEFAULT 'member', -- 'member' | 'admin'
  is_primary BOOLEAN NOT NULL DEFAULT false,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, department_id)
  );
CREATE TABLE public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
CREATE TABLE public.historico_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL DEFAULT auth.uid()
  );
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
CREATE TABLE public.etiquetas_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#gray',
  empresa_id UUID REFERENCES empresas(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('devedor', 'divida', 'ambos')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
  );
CREATE TABLE public.empresa_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  tipo TEXT NOT NULL, -- 'manual', 'tarefa', 'auditoria', 'cobranca', 'sistema'
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  usuario_nome TEXT NOT NULL,
  anexos TEXT[], -- URLs dos anexos
  meta JSONB, -- dados adicionais específicos do tipo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
  );
CREATE TABLE public.calendario_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN (
  'task_deadline', 'task_completion',
  'hearing', 'deadline', 'meeting', 'court_event', 'distribution',
  'debt_due', 'payment', 'protest', 'blacklist', 'installment',
  'birthday', 'document_due', 'compliance_due',
  'custom_event'
  )),
  modulo_origem TEXT NOT NULL CHECK (modulo_origem IN (
  'tarefas', 'processos', 'cobrancas', 'hr', 'eventos'
  )),
  entidade_id UUID, -- ID da entidade origem (tarefa_id, processo_id, etc)
  entidade_tipo TEXT, -- tipo da entidade (tarefa, processo, divida, etc)
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
  cor_etiqueta TEXT DEFAULT '#6B7280',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  );
CREATE TABLE public.board_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, user_id)
  );
CREATE TABLE public.department_assignments (
  resource_type TEXT NOT NULL, -- ex.: 'tarefas', 'boards', 'cards'
  resource_id UUID NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT department_assignments_pk PRIMARY KEY (resource_type, resource_id, department_id)
  );

-- Essential function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate by username or email
CREATE OR REPLACE FUNCTION public.authenticate_by_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  user_uuid uuid;
BEGIN
  -- Buscar por username primeiro
  SELECT auth.users.email, auth.users.id
  INTO user_email, user_uuid
  FROM public.profiles
  JOIN auth.users ON auth.users.id = profiles.user_id
  WHERE profiles.username = username_input;

  -- Se não encontrou por username, tentar por email
  IF user_email IS NULL THEN
    SELECT auth.users.email, auth.users.id
    INTO user_email, user_uuid
    FROM public.profiles
    JOIN auth.users ON auth.users.id = profiles.user_id
    WHERE auth.users.email = username_input;
  END IF;

  -- Se encontrou o usuário, retornar os dados
  IF user_email IS NOT NULL THEN
    RETURN QUERY SELECT user_uuid, user_email;
  END IF;
END;
$$;


-- Essential triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_colaboradores_updated_at
  BEFORE UPDATE ON public.colaboradores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_denuncias_updated_at
  BEFORE UPDATE ON public.denuncias
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
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_processos_judiciais_updated_at
  BEFORE UPDATE ON public.processos_judiciais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_board_columns_updated_at
  BEFORE UPDATE ON public.board_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Essential indexes
CREATE INDEX IF NOT EXISTS idx_profiles_empresa_ids ON public.profiles USING GIN (empresa_ids);
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_created_by ON public.colaboradores (empresa_id, created_by);
CREATE INDEX IF NOT EXISTS idx_devedores_empresa_id ON public.devedores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_dividas_devedor_id ON public.dividas(devedor_id);
CREATE INDEX IF NOT EXISTS idx_dividas_status ON public.dividas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_empresa_id ON public.tarefas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);
CREATE INDEX IF NOT EXISTS idx_boards_empresa ON public.boards(empresa_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('colaborador-docs', 'colaborador-docs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tarefas-anexos', 'tarefas-anexos', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('denuncia-anexos', 'denuncia-anexos', false) ON CONFLICT (id) DO NOTHING;

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Basic superuser policies
CREATE POLICY "superuser_full_access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.empresas FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.colaboradores FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.devedores FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.dividas FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.denuncias FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.tarefas FOR ALL USING (true);
CREATE POLICY "superuser_full_access" ON public.boards FOR ALL USING (true);