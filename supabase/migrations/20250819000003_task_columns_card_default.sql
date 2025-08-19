-- Add per-column default card JSON settings
ALTER TABLE public.task_columns
  ADD COLUMN IF NOT EXISTS card_default JSONB NULL;

