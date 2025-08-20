-- Add archive fields to tarefas
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE NULL;

-- Index to filter archived quickly
CREATE INDEX IF NOT EXISTS idx_tarefas_is_archived ON public.tarefas(is_archived);

