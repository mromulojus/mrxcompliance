-- Add user_id to activity_logs for efficient filtering and joinability
ALTER TABLE IF EXISTS public.activity_logs
  ADD COLUMN IF NOT EXISTS user_id uuid NULL;

-- Backfill could be added here if needed based on meta->>'user_id'
-- UPDATE public.activity_logs SET user_id = (meta->>'user_id')::uuid WHERE user_id IS NULL AND meta ? 'user_id';

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_created ON public.activity_logs(action, created_at DESC);

-- Timesheet table to track active session time precisely
CREATE TABLE IF NOT EXISTS public.user_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_timesheets ENABLE ROW LEVEL SECURITY;

-- Policies: user can manage own timesheets
DROP POLICY IF EXISTS user_timesheets_select_self ON public.user_timesheets;
CREATE POLICY user_timesheets_select_self ON public.user_timesheets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin/superuser can view all timesheets
DROP POLICY IF EXISTS user_timesheets_select_admin ON public.user_timesheets;
CREATE POLICY user_timesheets_select_admin ON public.user_timesheets
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador'::public.user_role)
    OR public.has_role(auth.uid(), 'superuser'::public.user_role)
  );

DROP POLICY IF EXISTS user_timesheets_insert_self ON public.user_timesheets;
CREATE POLICY user_timesheets_insert_self ON public.user_timesheets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_timesheets_update_self ON public.user_timesheets;
CREATE POLICY user_timesheets_update_self ON public.user_timesheets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_timesheets_user_started ON public.user_timesheets(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_timesheets_user_ended ON public.user_timesheets(user_id, ended_at);
