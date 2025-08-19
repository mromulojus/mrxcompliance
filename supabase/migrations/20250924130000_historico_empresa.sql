-- Tabela de histórico por empresa, com RLS e triggers para eventos-chave
-- Requisitos: funções public.user_can_access_empresa e public.has_role já existentes no projeto

-- 1) Criar tabela
CREATE TABLE IF NOT EXISTS public.historico_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL DEFAULT auth.uid()
);

COMMENT ON TABLE public.historico_empresa IS 'Eventos e comentários relacionados à empresa';
COMMENT ON COLUMN public.historico_empresa.tipo IS 'Tipo do evento (ex.: COLABORADOR_CRIADO, DIVIDA_ATUALIZADA, COMENTARIO, etc.)';

-- 2) Habilitar RLS e criar políticas
ALTER TABLE public.historico_empresa ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado que possa acessar a empresa
DROP POLICY IF EXISTS "Users can view historico_empresa for their empresas" ON public.historico_empresa;
CREATE POLICY "Users can view historico_empresa for their empresas"
ON public.historico_empresa
FOR SELECT
USING (public.user_can_access_empresa(empresa_id));

-- Inserção: qualquer usuário autenticado que possa acessar a empresa
DROP POLICY IF EXISTS "Users can insert historico_empresa for their empresas" ON public.historico_empresa;
CREATE POLICY "Users can insert historico_empresa for their empresas"
ON public.historico_empresa
FOR INSERT
WITH CHECK (public.user_can_access_empresa(empresa_id));

-- Atualização/Exclusão: apenas administradores
DROP POLICY IF EXISTS "Admins can update historico_empresa" ON public.historico_empresa;
CREATE POLICY "Admins can update historico_empresa"
ON public.historico_empresa
FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'))
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

DROP POLICY IF EXISTS "Admins can delete historico_empresa" ON public.historico_empresa;
CREATE POLICY "Admins can delete historico_empresa"
ON public.historico_empresa
FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- 3) Função utilitária para registrar eventos
CREATE OR REPLACE FUNCTION public.log_empresa_event(
  p_empresa_id UUID,
  p_tipo TEXT,
  p_descricao TEXT,
  p_meta JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.historico_empresa (empresa_id, tipo, descricao, meta)
  VALUES (p_empresa_id, p_tipo, p_descricao, p_meta);
END;
$$;

COMMENT ON FUNCTION public.log_empresa_event(UUID, TEXT, TEXT, JSONB) IS 'Registra um evento no histórico da empresa';

-- 4) Triggers automáticos em tabelas principais

-- 4.1 Colaboradores
CREATE OR REPLACE FUNCTION public.trg_log_colaboradores() RETURNS trigger AS $$
DECLARE
  v_tipo TEXT;
  v_descricao TEXT;
  v_empresa_id UUID;
  v_meta JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_tipo := 'COLABORADOR_CRIADO';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Colaborador criado: ' || NEW.nome || ' (' || NEW.cpf || ')';
    v_meta := jsonb_build_object('colaborador_id', NEW.id, 'nome', NEW.nome, 'cpf', NEW.cpf);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_tipo := 'COLABORADOR_ATUALIZADO';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Colaborador atualizado: ' || NEW.nome;
    v_meta := jsonb_build_object('colaborador_id', NEW.id, 'changed', true);
  ELSIF (TG_OP = 'DELETE') THEN
    v_tipo := 'COLABORADOR_DELETADO';
    v_empresa_id := OLD.empresa_id;
    v_descricao := 'Colaborador removido: ' || OLD.nome;
    v_meta := jsonb_build_object('colaborador_id', OLD.id);
  END IF;

  PERFORM public.log_empresa_event(v_empresa_id, v_tipo, v_descricao, v_meta);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_colaboradores_log ON public.colaboradores;
CREATE TRIGGER trg_colaboradores_log
AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores
FOR EACH ROW EXECUTE FUNCTION public.trg_log_colaboradores();

-- 4.2 Denúncias
CREATE OR REPLACE FUNCTION public.trg_log_denuncias() RETURNS trigger AS $$
DECLARE
  v_tipo TEXT;
  v_descricao TEXT;
  v_empresa_id UUID;
  v_meta JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_tipo := 'DENUNCIA_CRIADA';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Denúncia criada: protocolo ' || NEW.protocolo;
    v_meta := jsonb_build_object('denuncia_id', NEW.id, 'status', NEW.status);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_tipo := 'DENUNCIA_ATUALIZADA';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Denúncia atualizada: protocolo ' || NEW.protocolo;
    v_meta := jsonb_build_object('denuncia_id', NEW.id, 'status', NEW.status);
  ELSIF (TG_OP = 'DELETE') THEN
    v_tipo := 'DENUNCIA_DELETADA';
    v_empresa_id := OLD.empresa_id;
    v_descricao := 'Denúncia removida: protocolo ' || OLD.protocolo;
    v_meta := jsonb_build_object('denuncia_id', OLD.id);
  END IF;

  PERFORM public.log_empresa_event(v_empresa_id, v_tipo, v_descricao, v_meta);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_denuncias_log ON public.denuncias;
CREATE TRIGGER trg_denuncias_log
AFTER INSERT OR UPDATE OR DELETE ON public.denuncias
FOR EACH ROW EXECUTE FUNCTION public.trg_log_denuncias();

-- 4.3 Devedores
CREATE OR REPLACE FUNCTION public.trg_log_devedores() RETURNS trigger AS $$
DECLARE
  v_tipo TEXT;
  v_descricao TEXT;
  v_empresa_id UUID;
  v_meta JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_tipo := 'DEVEDOR_CRIADO';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Devedor criado: ' || NEW.documento;
    v_meta := jsonb_build_object('devedor_id', NEW.id, 'documento', NEW.documento);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_tipo := 'DEVEDOR_ATUALIZADO';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Devedor atualizado: ' || NEW.documento;
    v_meta := jsonb_build_object('devedor_id', NEW.id);
  ELSIF (TG_OP = 'DELETE') THEN
    v_tipo := 'DEVEDOR_DELETADO';
    v_empresa_id := OLD.empresa_id;
    v_descricao := 'Devedor removido: ' || OLD.documento;
    v_meta := jsonb_build_object('devedor_id', OLD.id);
  END IF;

  PERFORM public.log_empresa_event(v_empresa_id, v_tipo, v_descricao, v_meta);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_devedores_log ON public.devedores;
CREATE TRIGGER trg_devedores_log
AFTER INSERT OR UPDATE OR DELETE ON public.devedores
FOR EACH ROW EXECUTE FUNCTION public.trg_log_devedores();

-- 4.4 Dívidas
CREATE OR REPLACE FUNCTION public.trg_log_dividas() RETURNS trigger AS $$
DECLARE
  v_tipo TEXT;
  v_descricao TEXT;
  v_empresa_id UUID;
  v_meta JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_tipo := 'DIVIDA_CRIADA';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Dívida criada para devedor ' || NEW.devedor_id;
    v_meta := jsonb_build_object('divida_id', NEW.id, 'valor', NEW.valor_original);
  ELSIF (TG_OP = 'UPDATE') THEN
    v_tipo := 'DIVIDA_ATUALIZADA';
    v_empresa_id := NEW.empresa_id;
    v_descricao := 'Dívida atualizada para devedor ' || NEW.devedor_id;
    v_meta := jsonb_build_object('divida_id', NEW.id, 'valor_atualizado', NEW.valor_atualizado);
  ELSIF (TG_OP = 'DELETE') THEN
    v_tipo := 'DIVIDA_DELETADA';
    v_empresa_id := OLD.empresa_id;
    v_descricao := 'Dívida removida do devedor ' || OLD.devedor_id;
    v_meta := jsonb_build_object('divida_id', OLD.id);
  END IF;

  PERFORM public.log_empresa_event(v_empresa_id, v_tipo, v_descricao, v_meta);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dividas_log ON public.dividas;
CREATE TRIGGER trg_dividas_log
AFTER INSERT OR UPDATE OR DELETE ON public.dividas
FOR EACH ROW EXECUTE FUNCTION public.trg_log_dividas();

-- 4.5 Acordos
CREATE OR REPLACE FUNCTION public.trg_log_acordos() RETURNS trigger AS $$
DECLARE
  v_tipo TEXT;
  v_descricao TEXT;
  v_empresa_id UUID;
  v_meta JSONB;
  v_divida RECORD;
BEGIN
  -- Para acordos, empresa_id vem da dívida relacionada
  IF (TG_OP = 'INSERT') THEN
    SELECT empresa_id INTO v_divida FROM public.dividas WHERE id = NEW.divida_id;
    v_tipo := 'ACORDO_CRIADO';
    v_empresa_id := v_divida.empresa_id;
    v_descricao := 'Acordo criado para dívida ' || NEW.divida_id;
    v_meta := jsonb_build_object('acordo_id', NEW.id, 'valor', NEW.valor_acordo);
  ELSIF (TG_OP = 'UPDATE') THEN
    SELECT empresa_id INTO v_divida FROM public.dividas WHERE id = NEW.divida_id;
    v_tipo := 'ACORDO_ATUALIZADO';
    v_empresa_id := v_divida.empresa_id;
    v_descricao := 'Acordo atualizado para dívida ' || NEW.divida_id;
    v_meta := jsonb_build_object('acordo_id', NEW.id);
  ELSIF (TG_OP = 'DELETE') THEN
    SELECT empresa_id INTO v_divida FROM public.dividas WHERE id = OLD.divida_id;
    v_tipo := 'ACORDO_DELETADO';
    v_empresa_id := v_divida.empresa_id;
    v_descricao := 'Acordo removido para dívida ' || OLD.divida_id;
    v_meta := jsonb_build_object('acordo_id', OLD.id);
  END IF;

  IF v_empresa_id IS NOT NULL THEN
    PERFORM public.log_empresa_event(v_empresa_id, v_tipo, v_descricao, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_acordos_log ON public.acordos;
CREATE TRIGGER trg_acordos_log
AFTER INSERT OR UPDATE OR DELETE ON public.acordos
FOR EACH ROW EXECUTE FUNCTION public.trg_log_acordos();

