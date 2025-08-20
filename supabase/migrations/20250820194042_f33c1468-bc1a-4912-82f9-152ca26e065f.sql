-- Adicionar colunas faltantes na tabela tarefas para suporte a quadros
ALTER TABLE public.tarefas 
ADD COLUMN board_id uuid REFERENCES public.boards(id),
ADD COLUMN column_id uuid REFERENCES public.board_columns(id),
ADD COLUMN is_archived boolean DEFAULT false,
ADD COLUMN archived_at timestamp with time zone;

-- Criar índices para performance
CREATE INDEX idx_tarefas_board_id ON public.tarefas(board_id);
CREATE INDEX idx_tarefas_column_id ON public.tarefas(column_id);
CREATE INDEX idx_tarefas_is_archived ON public.tarefas(is_archived);

-- Criar bucket para anexos de tarefas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tarefas-anexos', 'tarefas-anexos', false);

-- Criar policies para o bucket de anexos
CREATE POLICY "Users can view their task attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tarefas-anexos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload task attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'tarefas-anexos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their task attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'tarefas-anexos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their task attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'tarefas-anexos' AND auth.uid() IS NOT NULL);

-- Criar quadros departamentais automáticos para empresas
-- Função para criar quadros departamentais
CREATE OR REPLACE FUNCTION create_departmental_boards_for_empresa(p_empresa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dept_board_id uuid;
  dept_names text[] := ARRAY['VENDAS (xGROWTH)', 'COMPLIANCE (Mrx Compliance)', 'JURIDICO (MR Advocacia)', 'OUVIDORIA (Ouve.ai)', 'COBRANÇA (Debto)', 'ADMINISTRATIVO'];
  dept_name text;
BEGIN
  FOREACH dept_name IN ARRAY dept_names
  LOOP
    -- Verificar se o quadro já existe
    IF NOT EXISTS (
      SELECT 1 FROM public.boards 
      WHERE empresa_id = p_empresa_id 
      AND name = dept_name
    ) THEN
      -- Criar o quadro departamental
      INSERT INTO public.boards (name, empresa_id, created_by, card_default)
      VALUES (
        dept_name, 
        p_empresa_id, 
        auth.uid(),
        '{"prioridade": "media", "modulo_origem": "geral"}'::jsonb
      )
      RETURNING id INTO dept_board_id;
      
      -- Criar colunas padrão para o quadro
      INSERT INTO public.board_columns (board_id, name, position) VALUES
      (dept_board_id, 'A Fazer', 0),
      (dept_board_id, 'Em Andamento', 1),
      (dept_board_id, 'Em Revisão', 2),
      (dept_board_id, 'Concluído', 3);
    END IF;
  END LOOP;
END;
$$;