-- Members linked to boards
CREATE TABLE IF NOT EXISTS public.task_board_members (
  board_id UUID NOT NULL REFERENCES public.task_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (board_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_board_members_user ON public.task_board_members(user_id);

ALTER TABLE public.task_board_members ENABLE ROW LEVEL SECURITY;

-- Only board owner can manage and view members for now
DROP POLICY IF EXISTS "board_members_select_by_owner" ON public.task_board_members;
CREATE POLICY "board_members_select_by_owner" ON public.task_board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_board_members.board_id AND b.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "board_members_insert_by_owner" ON public.task_board_members;
CREATE POLICY "board_members_insert_by_owner" ON public.task_board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_board_members.board_id AND b.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "board_members_delete_by_owner" ON public.task_board_members;
CREATE POLICY "board_members_delete_by_owner" ON public.task_board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.task_boards b
      WHERE b.id = task_board_members.board_id AND b.created_by = auth.uid()
    )
  );

