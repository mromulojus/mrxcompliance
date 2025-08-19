-- Task Boards feature: boards and columns, and link tarefas to boards/columns

-- Boards
CREATE TABLE IF NOT EXISTS public.task_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  empresa_id UUID NULL REFERENCES public.empresas(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Columns per board
CREATE TABLE IF NOT EXISTS public.task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tarefas linkage to board/column (optional)
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS board_id UUID NULL REFERENCES public.task_boards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS column_id UUID NULL REFERENCES public.task_columns(id) ON DELETE SET NULL;

-- Indices
CREATE INDEX IF NOT EXISTS idx_task_boards_empresa ON public.task_boards(empresa_id);
CREATE INDEX IF NOT EXISTS idx_task_boards_created_by ON public.task_boards(created_by);
CREATE INDEX IF NOT EXISTS idx_task_columns_board ON public.task_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_board ON public.tarefas(board_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_column ON public.tarefas(column_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_task_boards_updated_at ON public.task_boards;
CREATE TRIGGER set_task_boards_updated_at
BEFORE UPDATE ON public.task_boards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.task_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;

-- Only board owners can manage their boards/columns; everyone can read their own
DROP POLICY IF EXISTS "boards_select_own" ON public.task_boards;
CREATE POLICY "boards_select_own" ON public.task_boards
  FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "boards_insert_self" ON public.task_boards;
CREATE POLICY "boards_insert_self" ON public.task_boards
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "boards_update_own" ON public.task_boards;
CREATE POLICY "boards_update_own" ON public.task_boards
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "boards_delete_own" ON public.task_boards;
CREATE POLICY "boards_delete_own" ON public.task_boards
  FOR DELETE USING (created_by = auth.uid());

-- Columns: only for boards the user owns
DROP POLICY IF EXISTS "columns_select_by_board_owner" ON public.task_columns;
CREATE POLICY "columns_select_by_board_owner" ON public.task_columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_columns.board_id AND b.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "columns_insert_by_board_owner" ON public.task_columns;
CREATE POLICY "columns_insert_by_board_owner" ON public.task_columns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_columns.board_id AND b.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "columns_update_by_board_owner" ON public.task_columns;
CREATE POLICY "columns_update_by_board_owner" ON public.task_columns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_columns.board_id AND b.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "columns_delete_by_board_owner" ON public.task_columns;
CREATE POLICY "columns_delete_by_board_owner" ON public.task_columns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_columns.board_id AND b.created_by = auth.uid()
    )
  );

-- Optional helper function to reorder columns
CREATE OR REPLACE FUNCTION public.reorder_task_columns(p_board_id UUID, p_column_id UUID, p_new_order INT)
RETURNS VOID AS $$
DECLARE
  current_order INT;
BEGIN
  SELECT order_index INTO current_order FROM public.task_columns WHERE id = p_column_id AND board_id = p_board_id;
  IF current_order IS NULL THEN
    RAISE EXCEPTION 'Column not found on board';
  END IF;

  IF p_new_order < 0 THEN p_new_order := 0; END IF;

  -- Shift other columns
  IF p_new_order > current_order THEN
    UPDATE public.task_columns
    SET order_index = order_index - 1
    WHERE board_id = p_board_id AND order_index > current_order AND order_index <= p_new_order;
  ELSE
    UPDATE public.task_columns
    SET order_index = order_index + 1
    WHERE board_id = p_board_id AND order_index < current_order AND order_index >= p_new_order;
  END IF;

  -- Set new order
  UPDATE public.task_columns SET order_index = p_new_order WHERE id = p_column_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

