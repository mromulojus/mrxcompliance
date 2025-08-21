-- Criar tabela para histórico de empresa
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

-- Habilitar RLS
ALTER TABLE public.empresa_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para empresa_historico
CREATE POLICY "Usuários podem ver histórico de empresas que têm acesso"
ON public.empresa_historico
FOR SELECT
USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Usuários podem inserir histórico de empresas que têm acesso"
ON public.empresa_historico
FOR INSERT
WITH CHECK (user_can_access_empresa(empresa_id) AND created_by = auth.uid());

-- Admins podem gerenciar tudo
CREATE POLICY "Admins podem gerenciar histórico"
ON public.empresa_historico
FOR ALL
USING (has_role(auth.uid(), 'administrador'::user_role));

-- Trigger para atualizar histórico automaticamente em certas ações
CREATE OR REPLACE FUNCTION public.log_empresa_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Para inserções de tarefas
  IF TG_TABLE_NAME = 'tarefas' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.empresa_historico (
      empresa_id, tipo, titulo, descricao, usuario_nome, created_by, meta
    )
    VALUES (
      NEW.empresa_id,
      'tarefa',
      'Nova tarefa criada',
      'Tarefa "' || NEW.titulo || '" foi criada',
      COALESCE((SELECT full_name FROM profiles WHERE user_id = NEW.created_by), 'Sistema'),
      NEW.created_by,
      jsonb_build_object('tarefa_id', NEW.id, 'status', NEW.status, 'prioridade', NEW.prioridade)
    );
  END IF;

  -- Para atualizações de tarefas (mudança de status)
  IF TG_TABLE_NAME = 'tarefas' AND TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.empresa_historico (
      empresa_id, tipo, titulo, descricao, usuario_nome, created_by, meta
    )
    VALUES (
      NEW.empresa_id,
      'tarefa',
      'Status da tarefa atualizado',
      'Tarefa "' || NEW.titulo || '" mudou de ' || OLD.status || ' para ' || NEW.status,
      COALESCE((SELECT full_name FROM profiles WHERE user_id = auth.uid()), 'Sistema'),
      COALESCE(auth.uid(), NEW.created_by),
      jsonb_build_object('tarefa_id', NEW.id, 'status_anterior', OLD.status, 'status_novo', NEW.status)
    );
  END IF;

  -- Para inserções de colaboradores
  IF TG_TABLE_NAME = 'colaboradores' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.empresa_historico (
      empresa_id, tipo, titulo, descricao, usuario_nome, created_by, meta
    )
    VALUES (
      NEW.empresa_id,
      'colaborador',
      'Novo colaborador cadastrado',
      'Colaborador "' || NEW.nome || '" foi cadastrado no cargo de ' || NEW.cargo,
      COALESCE((SELECT full_name FROM profiles WHERE user_id = NEW.created_by), 'Sistema'),
      COALESCE(NEW.created_by, auth.uid()),
      jsonb_build_object('colaborador_id', NEW.id, 'cargo', NEW.cargo, 'departamento', NEW.departamento)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para log automático
CREATE TRIGGER empresa_historico_tarefas_insert
AFTER INSERT ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.log_empresa_activity();

CREATE TRIGGER empresa_historico_tarefas_update
AFTER UPDATE ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.log_empresa_activity();

CREATE TRIGGER empresa_historico_colaboradores_insert
AFTER INSERT ON public.colaboradores
FOR EACH ROW EXECUTE FUNCTION public.log_empresa_activity();

-- Criar tabela para agenda de acordos (cobranças)
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

-- Habilitar RLS para agenda_acordos
ALTER TABLE public.agenda_acordos ENABLE ROW LEVEL SECURITY;

-- Políticas para agenda_acordos
CREATE POLICY "Usuários podem ver agenda de empresas que têm acesso"
ON public.agenda_acordos
FOR SELECT
USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins podem gerenciar agenda"
ON public.agenda_acordos
FOR ALL
USING (has_role(auth.uid(), 'administrador'::user_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agenda_acordos_updated_at
BEFORE UPDATE ON public.agenda_acordos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();