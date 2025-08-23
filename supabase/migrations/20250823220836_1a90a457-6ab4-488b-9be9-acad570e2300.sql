-- Criar tabela unificada de eventos do calendário
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

-- Habilitar RLS
ALTER TABLE public.calendario_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view eventos based on empresa access"
ON public.calendario_eventos FOR SELECT
USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage eventos"
ON public.calendario_eventos FOR ALL
USING (has_role(auth.uid(), 'administrador'::user_role));

CREATE POLICY "Users can insert eventos for their companies"
ON public.calendario_eventos FOR INSERT
WITH CHECK (user_can_access_empresa(empresa_id) AND created_by = auth.uid());

-- Índices para performance
CREATE INDEX idx_calendario_eventos_empresa_id ON public.calendario_eventos(empresa_id);
CREATE INDEX idx_calendario_eventos_data_evento ON public.calendario_eventos(data_evento);
CREATE INDEX idx_calendario_eventos_tipo_evento ON public.calendario_eventos(tipo_evento);
CREATE INDEX idx_calendario_eventos_modulo_origem ON public.calendario_eventos(modulo_origem);

-- Trigger para updated_at
CREATE TRIGGER update_calendario_eventos_updated_at
  BEFORE UPDATE ON public.calendario_eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para sincronizar eventos de tarefas
CREATE OR REPLACE FUNCTION sync_tarefa_to_calendario()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.data_vencimento IS NOT NULL AND NEW.empresa_id IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, prioridade, 
        cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Vencimento: ' || NEW.titulo,
        NEW.descricao,
        NEW.data_vencimento::timestamp with time zone,
        'task_deadline',
        'tarefas',
        NEW.id,
        'tarefa',
        NEW.prioridade,
        CASE NEW.prioridade 
          WHEN 'alta' THEN '#EF4444' 
          WHEN 'media' THEN '#F59E0B' 
          ELSE '#10B981' 
        END,
        NEW.created_by
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Para UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Deletar evento anterior se existir
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'tarefa';
    
    -- Criar novo evento se data_vencimento existir
    IF NEW.data_vencimento IS NOT NULL AND NEW.empresa_id IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, prioridade, 
        cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Vencimento: ' || NEW.titulo,
        NEW.descricao,
        NEW.data_vencimento::timestamp with time zone,
        'task_deadline',
        'tarefas',
        NEW.id,
        'tarefa',
        NEW.prioridade,
        CASE NEW.prioridade 
          WHEN 'alta' THEN '#EF4444' 
          WHEN 'media' THEN '#F59E0B' 
          ELSE '#10B981' 
        END,
        COALESCE(NEW.created_by, auth.uid())
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Para DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'tarefa';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar eventos de processos
CREATE OR REPLACE FUNCTION sync_evento_to_calendario()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.calendario_eventos (
      empresa_id, titulo, descricao, data_evento, data_fim, tipo_evento, 
      modulo_origem, entidade_id, entidade_tipo, cor_etiqueta, created_by
    ) VALUES (
      NEW.empresa_id,
      NEW.titulo,
      NEW.descricao,
      NEW.data_inicio,
      NEW.data_fim,
      CASE NEW.tipo::text
        WHEN 'audiencia' THEN 'hearing'
        WHEN 'prazo' THEN 'deadline'
        WHEN 'reuniao' THEN 'meeting'
        ELSE 'court_event'
      END,
      'processos',
      NEW.id,
      'evento',
      CASE NEW.tipo::text
        WHEN 'audiencia' THEN '#DC2626'
        WHEN 'prazo' THEN '#F59E0B'
        WHEN 'reuniao' THEN '#3B82F6'
        ELSE '#6B7280'
      END,
      NEW.created_by
    );
    RETURN NEW;
  END IF;

  -- Para UPDATE
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.calendario_eventos SET
      titulo = NEW.titulo,
      descricao = NEW.descricao,
      data_evento = NEW.data_inicio,
      data_fim = NEW.data_fim,
      tipo_evento = CASE NEW.tipo::text
        WHEN 'audiencia' THEN 'hearing'
        WHEN 'prazo' THEN 'deadline'
        WHEN 'reuniao' THEN 'meeting'
        ELSE 'court_event'
      END,
      cor_etiqueta = CASE NEW.tipo::text
        WHEN 'audiencia' THEN '#DC2626'
        WHEN 'prazo' THEN '#F59E0B'
        WHEN 'reuniao' THEN '#3B82F6'
        ELSE '#6B7280'
      END,
      updated_at = now()
    WHERE entidade_id = OLD.id AND entidade_tipo = 'evento';
    RETURN NEW;
  END IF;

  -- Para DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'evento';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar dívidas
CREATE OR REPLACE FUNCTION sync_divida_to_calendario()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT
  IF TG_OP = 'INSERT' THEN
    -- Vencimento da dívida
    INSERT INTO public.calendario_eventos (
      empresa_id, titulo, descricao, data_evento, tipo_evento, 
      modulo_origem, entidade_id, entidade_tipo, prioridade,
      cor_etiqueta, created_by
    ) VALUES (
      NEW.empresa_id,
      'Vencimento Dívida: ' || COALESCE(NEW.numero_contrato, NEW.origem_divida),
      'Valor: R$ ' || NEW.valor_original,
      NEW.data_vencimento::timestamp with time zone,
      'debt_due',
      'cobrancas',
      NEW.id,
      'divida',
      CASE 
        WHEN NEW.data_vencimento < CURRENT_DATE THEN 'alta'
        WHEN NEW.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'media'
        ELSE 'baixa'
      END,
      CASE 
        WHEN NEW.data_vencimento < CURRENT_DATE THEN '#DC2626'
        WHEN NEW.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN '#F59E0B'
        ELSE '#10B981'
      END,
      NEW.created_by
    );
    
    -- Protesto se houver data
    IF NEW.data_protesto IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, prioridade,
        cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Protesto: ' || COALESCE(NEW.numero_contrato, NEW.origem_divida),
        'Valor: R$ ' || NEW.valor_original,
        NEW.data_protesto::timestamp with time zone,
        'protest',
        'cobrancas',
        NEW.id,
        'divida',
        'alta',
        '#B91C1C',
        NEW.created_by
      );
    END IF;
    
    -- Negativação se houver data
    IF NEW.data_negativacao IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, prioridade,
        cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Negativação: ' || COALESCE(NEW.numero_contrato, NEW.origem_divida),
        'Valor: R$ ' || NEW.valor_original,
        NEW.data_negativacao::timestamp with time zone,
        'blacklist',
        'cobrancas',
        NEW.id,
        'divida',
        'alta',
        '#7C2D12',
        NEW.created_by
      );
    END IF;
    
    RETURN NEW;
  END IF;

  -- Para UPDATE (similar lógica)
  IF TG_OP = 'UPDATE' THEN
    -- Deletar eventos anteriores
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'divida';
    
    -- Recriar eventos com nova data
    -- Vencimento
    INSERT INTO public.calendario_eventos (
      empresa_id, titulo, descricao, data_evento, tipo_evento, 
      modulo_origem, entidade_id, entidade_tipo, prioridade,
      cor_etiqueta, created_by
    ) VALUES (
      NEW.empresa_id,
      'Vencimento Dívida: ' || COALESCE(NEW.numero_contrato, NEW.origem_divida),
      'Valor: R$ ' || NEW.valor_original,
      NEW.data_vencimento::timestamp with time zone,
      'debt_due',
      'cobrancas',
      NEW.id,
      'divida',
      CASE 
        WHEN NEW.data_vencimento < CURRENT_DATE THEN 'alta'
        WHEN NEW.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'media'
        ELSE 'baixa'
      END,
      CASE 
        WHEN NEW.data_vencimento < CURRENT_DATE THEN '#DC2626'
        WHEN NEW.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN '#F59E0B'
        ELSE '#10B981'
      END,
      COALESCE(NEW.created_by, auth.uid())
    );
    
    -- Protesto e negativação (se houver)
    IF NEW.data_protesto IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, prioridade,
        cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Protesto: ' || COALESCE(NEW.numero_contrato, NEW.origem_divida),
        'Valor: R$ ' || NEW.valor_original,
        NEW.data_protesto::timestamp with time zone,
        'protest',
        'cobrancas',
        NEW.id,
        'divida',
        'alta',
        '#B91C1C',
        COALESCE(NEW.created_by, auth.uid())
      );
    END IF;
    
    IF NEW.data_negativacao IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, prioridade,
        cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Negativação: ' || COALESCE(NEW.numero_contrato, NEW.origem_divida),
        'Valor: R$ ' || NEW.valor_original,
        NEW.data_negativacao::timestamp with time zone,
        'blacklist',
        'cobrancas',
        NEW.id,
        'divida',
        'alta',
        '#7C2D12',
        COALESCE(NEW.created_by, auth.uid())
      );
    END IF;
    
    RETURN NEW;
  END IF;

  -- Para DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'divida';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar aniversários (excluindo admissão conforme solicitado)
CREATE OR REPLACE FUNCTION sync_colaborador_to_calendario()
RETURNS TRIGGER AS $$
BEGIN
  -- Para INSERT
  IF TG_OP = 'INSERT' THEN
    -- Apenas aniversário (não admissão conforme solicitado)
    IF NEW.data_nascimento IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Aniversário: ' || NEW.nome,
        'Colaborador fazendo aniversário',
        (DATE_TRUNC('year', CURRENT_DATE) + (NEW.data_nascimento - DATE_TRUNC('year', NEW.data_nascimento)))::timestamp with time zone,
        'birthday',
        'hr',
        NEW.id,
        'colaborador',
        '#EC4899',
        NEW.created_by
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Para UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Deletar eventos anteriores
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'colaborador';
    
    -- Recriar aniversário se data_nascimento existir
    IF NEW.data_nascimento IS NOT NULL THEN
      INSERT INTO public.calendario_eventos (
        empresa_id, titulo, descricao, data_evento, tipo_evento, 
        modulo_origem, entidade_id, entidade_tipo, cor_etiqueta, created_by
      ) VALUES (
        NEW.empresa_id,
        'Aniversário: ' || NEW.nome,
        'Colaborador fazendo aniversário',
        (DATE_TRUNC('year', CURRENT_DATE) + (NEW.data_nascimento - DATE_TRUNC('year', NEW.data_nascimento)))::timestamp with time zone,
        'birthday',
        'hr',
        NEW.id,
        'colaborador',
        '#EC4899',
        COALESCE(NEW.created_by, auth.uid())
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Para DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.calendario_eventos 
    WHERE entidade_id = OLD.id AND entidade_tipo = 'colaborador';
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
CREATE TRIGGER trg_sync_tarefa_to_calendario
  AFTER INSERT OR UPDATE OR DELETE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION sync_tarefa_to_calendario();

CREATE TRIGGER trg_sync_evento_to_calendario
  AFTER INSERT OR UPDATE OR DELETE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION sync_evento_to_calendario();

CREATE TRIGGER trg_sync_divida_to_calendario
  AFTER INSERT OR UPDATE OR DELETE ON public.dividas
  FOR EACH ROW EXECUTE FUNCTION sync_divida_to_calendario();

CREATE TRIGGER trg_sync_colaborador_to_calendario
  AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores
  FOR EACH ROW EXECUTE FUNCTION sync_colaborador_to_calendario();

-- Popular dados existentes (migração)
INSERT INTO public.calendario_eventos (
  empresa_id, titulo, descricao, data_evento, tipo_evento, 
  modulo_origem, entidade_id, entidade_tipo, prioridade, 
  cor_etiqueta, created_by
)
SELECT 
  t.empresa_id,
  'Vencimento: ' || t.titulo,
  t.descricao,
  t.data_vencimento::timestamp with time zone,
  'task_deadline',
  'tarefas',
  t.id,
  'tarefa',
  t.prioridade,
  CASE t.prioridade 
    WHEN 'alta' THEN '#EF4444' 
    WHEN 'media' THEN '#F59E0B' 
    ELSE '#10B981' 
  END,
  t.created_by
FROM public.tarefas t
WHERE t.data_vencimento IS NOT NULL AND t.empresa_id IS NOT NULL;

-- Popular eventos existentes
INSERT INTO public.calendario_eventos (
  empresa_id, titulo, descricao, data_evento, data_fim, tipo_evento, 
  modulo_origem, entidade_id, entidade_tipo, cor_etiqueta, created_by
)
SELECT 
  e.empresa_id,
  e.titulo,
  e.descricao,
  e.data_inicio,
  e.data_fim,
  CASE e.tipo::text
    WHEN 'audiencia' THEN 'hearing'
    WHEN 'prazo' THEN 'deadline'
    WHEN 'reuniao' THEN 'meeting'
    ELSE 'court_event'
  END,
  'processos',
  e.id,
  'evento',
  CASE e.tipo::text
    WHEN 'audiencia' THEN '#DC2626'
    WHEN 'prazo' THEN '#F59E0B'
    WHEN 'reuniao' THEN '#3B82F6'
    ELSE '#6B7280'
  END,
  e.created_by
FROM public.eventos e;

-- Popular dívidas existentes
INSERT INTO public.calendario_eventos (
  empresa_id, titulo, descricao, data_evento, tipo_evento, 
  modulo_origem, entidade_id, entidade_tipo, prioridade,
  cor_etiqueta, created_by
)
SELECT 
  d.empresa_id,
  'Vencimento Dívida: ' || COALESCE(d.numero_contrato, d.origem_divida),
  'Valor: R$ ' || d.valor_original,
  d.data_vencimento::timestamp with time zone,
  'debt_due',
  'cobrancas',
  d.id,
  'divida',
  CASE 
    WHEN d.data_vencimento < CURRENT_DATE THEN 'alta'
    WHEN d.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'media'
    ELSE 'baixa'
  END,
  CASE 
    WHEN d.data_vencimento < CURRENT_DATE THEN '#DC2626'
    WHEN d.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN '#F59E0B'
    ELSE '#10B981'
  END,
  d.created_by
FROM public.dividas d
WHERE d.data_vencimento IS NOT NULL;

-- Popular aniversários existentes (excluindo admissão)
INSERT INTO public.calendario_eventos (
  empresa_id, titulo, descricao, data_evento, tipo_evento, 
  modulo_origem, entidade_id, entidade_tipo, cor_etiqueta, created_by
)
SELECT 
  c.empresa_id,
  'Aniversário: ' || c.nome,
  'Colaborador fazendo aniversário',
  (DATE_TRUNC('year', CURRENT_DATE) + (c.data_nascimento - DATE_TRUNC('year', c.data_nascimento)))::timestamp with time zone,
  'birthday',
  'hr',
  c.id,
  'colaborador',
  '#EC4899',
  c.created_by
FROM public.colaboradores c
WHERE c.data_nascimento IS NOT NULL;