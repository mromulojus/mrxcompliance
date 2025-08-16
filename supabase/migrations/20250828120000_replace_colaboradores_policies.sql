-- Restrict colaboradores access to HR and self

-- Drop existing policies
DROP POLICY IF EXISTS "Admins or self can view colaborador" ON public.colaboradores;
DROP POLICY IF EXISTS "Self or admin can view colaborador" ON public.colaboradores;
DROP POLICY IF EXISTS "All authenticated users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "HR admins can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "HR admins can update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "HR admins can delete colaboradores" ON public.colaboradores;

CREATE POLICY "hr admin select" ON public.colaboradores
  FOR SELECT TO authenticated
  USING (public.log_colaboradores_access(id) AND public.has_role(auth.uid(), 'rh'));

CREATE POLICY "hr admin insert" ON public.colaboradores
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'rh'));

CREATE POLICY "hr admin update" ON public.colaboradores
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'rh'))
  WITH CHECK (public.has_role(auth.uid(), 'rh'));

CREATE POLICY "hr admin delete" ON public.colaboradores
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'rh'));

CREATE POLICY "self read only" ON public.colaboradores
  FOR SELECT TO authenticated
  USING (public.log_colaboradores_access(id) AND auth.uid() = id);

CREATE OR REPLACE FUNCTION public.log_colaboradores_update_trg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.log_colaboradores_access(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS colaboradores_update_audit ON public.colaboradores;
CREATE TRIGGER colaboradores_update_audit
AFTER UPDATE ON public.colaboradores
FOR EACH ROW EXECUTE FUNCTION public.log_colaboradores_update_trg();

-- Verify unauthorized users see no rows
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000000';
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.colaboradores) THEN
    RAISE EXCEPTION 'unauthorized users should not see colaboradores rows';
  END IF;
END;
$$;
RESET ROLE;
