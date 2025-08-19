-- Add per-board default card JSON settings
ALTER TABLE public.task_boards
  ADD COLUMN IF NOT EXISTS card_default JSONB NULL;

