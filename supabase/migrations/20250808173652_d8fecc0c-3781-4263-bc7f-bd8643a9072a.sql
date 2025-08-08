-- Create enum types for better data consistency
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

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'operacional',
  empresa_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create empresas table
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

-- Create colaboradores table
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

-- Create documentos_colaborador table
CREATE TABLE public.documentos_colaborador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo public.tipo_documento NOT NULL,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create historico_colaborador table
CREATE TABLE public.historico_colaborador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  observacao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create denuncias table
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

-- Create comentarios_denuncia table
CREATE TABLE public.comentarios_denuncia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  denuncia_id UUID NOT NULL REFERENCES public.denuncias(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  by_user TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_denuncia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND (
      role = required_role 
      OR role = 'superuser'
      OR (required_role = 'operacional' AND role IN ('empresarial', 'administrador'))
      OR (required_role = 'empresarial' AND role = 'administrador')
    )
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superuser can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'superuser'));

CREATE POLICY "Admin can view profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for empresas
CREATE POLICY "All authenticated users can view empresas" ON public.empresas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and superuser can insert empresas" ON public.empresas
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admin and superuser can update empresas" ON public.empresas
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Superuser can delete empresas" ON public.empresas
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'superuser'));

-- RLS Policies for colaboradores
CREATE POLICY "All authenticated users can view colaboradores" ON public.colaboradores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and superuser can insert colaboradores" ON public.colaboradores
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admin and superuser can update colaboradores" ON public.colaboradores
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Superuser can delete colaboradores" ON public.colaboradores
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'superuser'));

-- RLS Policies for documentos_colaborador
CREATE POLICY "Users can view documents of colaboradores" ON public.documentos_colaborador
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage documents" ON public.documentos_colaborador
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for historico_colaborador
CREATE POLICY "Users can view history" ON public.historico_colaborador
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert history" ON public.historico_colaborador
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for denuncias
CREATE POLICY "Admin can view all denuncias" ON public.denuncias
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Anyone can insert denuncias" ON public.denuncias
  FOR INSERT TO anon, authenticated USING (true);

CREATE POLICY "Admin can update denuncias" ON public.denuncias
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for comentarios_denuncia
CREATE POLICY "Admin can view comentarios" ON public.comentarios_denuncia
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admin can insert comentarios" ON public.comentarios_denuncia
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for activity_logs
CREATE POLICY "Superuser can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'superuser'));

CREATE POLICY "All authenticated can insert logs" ON public.activity_logs
  FOR INSERT TO authenticated USING (true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Create function to handle new user registration
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate protocol
CREATE OR REPLACE FUNCTION public.generate_protocol()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  protocol TEXT;
BEGIN
  protocol := 'MRX-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN protocol;
END;
$$;

-- Add default value for protocolo in denuncias
ALTER TABLE public.denuncias ALTER COLUMN protocolo SET DEFAULT public.generate_protocol();