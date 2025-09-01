-- Consolidated Initial Schema Migration
-- Generated from all migrations up to 2025-08-30
-- This replaces all individual migrations with a single clean schema

-- Create custom types
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

-- Sequences
CREATE SEQUENCE IF NOT EXISTS denuncia_protocolo_seq;

-- Core tables
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE,
  role public.user_role NOT NULL DEFAULT 'operacional',
  empresa_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  sexo public.sexo,
  estado_civil public.estado_civil,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  cargo TEXT,
  departamento TEXT,
  tipo_contrato public.tipo_contrato NOT NULL DEFAULT 'CLT',
  data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_demissao DATE,
  salario NUMERIC(10,2),
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta public.tipo_conta DEFAULT 'CORRENTE',
  escolaridade public.escolaridade,
  nome_mae TEXT,
  status public.colaborador_status NOT NULL DEFAULT 'ATIVO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.documentos_colaborador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo public.tipo_documento NOT NULL,
  numero TEXT,
  orgao_emissor TEXT,
  data_emissao DATE,
  data_vencimento DATE,
  arquivo_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.historico_colaborador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  detalhes JSONB,
  data_acao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  usuario_id UUID REFERENCES auth.users(id)
);

CREATE TABLE public.denuncias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL UNIQUE DEFAULT 'DEN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('denuncia_protocolo_seq')::text, 6, '0'),
  tipo_denuncia public.tipo_denuncia NOT NULL,
  descricao TEXT NOT NULL,
  data_fato DATE,
  local_fato TEXT,
  conhecimento_fato public.conhecimento_fato,
  relacao_empresa public.relacao_empresa,
  empresa_envolvida TEXT,
  denunciante_nome TEXT,
  denunciante_email TEXT,
  denunciante_telefone TEXT,
  denunciante_endereco TEXT,
  anonimo BOOLEAN NOT NULL DEFAULT false,
  status public.denuncia_status NOT NULL DEFAULT 'RECEBIDO',
  investigador_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.comentarios_denuncia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  denuncia_id UUID NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Additional tables from later migrations
CREATE TABLE public.devedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  nome TEXT NOT NULL,
  documento TEXT NOT NULL,
  tipo_documento TEXT DEFAULT 'CPF',
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.dividas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  devedor_id UUID NOT NULL REFERENCES public.devedores(id),
  valor_original NUMERIC NOT NULL,
  valor_atualizado NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Board tables (must be created before tarefas due to foreign key dependencies)
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  background_color TEXT DEFAULT '#ffffff',
  background_image TEXT,
  is_public BOOLEAN DEFAULT false,
  modulos JSONB DEFAULT '["tarefas"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE public.board_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id UUID REFERENCES auth.users(id),
  responsavel_ids UUID[],
  status TEXT NOT NULL DEFAULT 'a_fazer',
  prioridade TEXT DEFAULT 'media',
  data_vencimento DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  modulo_origem TEXT DEFAULT 'geral',
  ordem_na_coluna INTEGER DEFAULT 0,
  board_id UUID REFERENCES public.boards(id),
  column_id UUID REFERENCES public.board_columns(id),
  denuncia_id UUID REFERENCES public.denuncias(id),
  divida_id UUID,
  colaborador_id UUID REFERENCES public.colaboradores(id),
  processo_id UUID,
  anexos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('colaborador-docs', 'colaborador-docs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('denuncia-anexos', 'denuncia-anexos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Functions
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

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role() RETURNS text
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    CASE
      WHEN NEW.email = 'mrxbr@example.com' THEN 'superuser'::public.user_role
      ELSE 'operacional'::public.user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Function to check if user can access empresa
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid) RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND (
      role IN ('superuser', 'administrador')
      OR empresa_uuid = ANY(empresa_ids)
    )
  );
$$;$$;

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON public.colaboradores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_denuncia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Superuser can view all profiles" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'superuser'
  )
);

CREATE POLICY "Admin can manage empresas" ON public.empresas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('superuser', 'administrador')
  )
);

CREATE POLICY "Users can view empresas" ON public.empresas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND (role IN ('superuser', 'administrador') OR id = ANY(empresa_ids))
  )
);

CREATE POLICY "Admin can manage colaboradores" ON public.colaboradores
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND (role IN ('superuser', 'administrador') OR empresa_id = ANY(empresa_ids))
  )
);

CREATE POLICY "Anonymous can insert denuncias" ON public.denuncias
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admin can view denuncias" ON public.denuncias
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('superuser', 'administrador')
  )
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_empresa_ids ON public.profiles USING GIN(empresa_ids);
CREATE INDEX idx_colaboradores_empresa_id ON public.colaboradores(empresa_id);
CREATE INDEX idx_colaboradores_cpf ON public.colaboradores(cpf);
CREATE INDEX idx_denuncias_protocolo ON public.denuncias(protocolo);
CREATE INDEX idx_tarefas_empresa_id ON public.tarefas(empresa_id);
CREATE INDEX idx_tarefas_responsavel_id ON public.tarefas(responsavel_id);
CREATE INDEX idx_tarefas_responsavel_ids ON public.tarefas USING GIN(responsavel_ids);
CREATE INDEX idx_tarefas_board_id ON public.tarefas(board_id);
CREATE INDEX idx_tarefas_column_id ON public.tarefas(column_id);
CREATE INDEX idx_tarefas_status ON public.tarefas(status);
CREATE INDEX idx_tarefas_created_by ON public.tarefas(created_by);
CREATE INDEX idx_boards_modulos ON public.boards USING GIN(modulos);

-- Comentários para documentação dos campos adicionados
COMMENT ON COLUMN public.tarefas.board_id IS 'Referência ao quadro/board onde a tarefa está localizada';
COMMENT ON COLUMN public.tarefas.column_id IS 'Referência à coluna específica dentro do board';
COMMENT ON COLUMN public.tarefas.responsavel_ids IS 'Array de UUIDs dos responsáveis pela tarefa (para múltiplos responsáveis)';
COMMENT ON COLUMN public.boards.background_color IS 'Cor de fundo do quadro em formato hexadecimal';
COMMENT ON COLUMN public.boards.background_image IS 'URL da imagem de fundo do quadro';
COMMENT ON COLUMN public.boards.is_public IS 'Define se o quadro é público ou privado';
COMMENT ON COLUMN public.boards.modulos IS 'Array dos módulos ativos no quadro (ex: ["tarefas", "compliance"])';

