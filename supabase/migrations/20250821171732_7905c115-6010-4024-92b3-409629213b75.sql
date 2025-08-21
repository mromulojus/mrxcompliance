-- Corrigir função de log de atividades para lidar com tarefas sem empresa
CREATE OR REPLACE FUNCTION public.log_empresa_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Para inserções de tarefas (APENAS quando há empresa_id)
  IF TG_TABLE_NAME = 'tarefas' AND TG_OP = 'INSERT' AND NEW.empresa_id IS NOT NULL THEN
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

  -- Para atualizações de tarefas (mudança de status) (APENAS quando há empresa_id)
  IF TG_TABLE_NAME = 'tarefas' AND TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.empresa_id IS NOT NULL THEN
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

  -- Para inserções de colaboradores (mantém como estava)
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