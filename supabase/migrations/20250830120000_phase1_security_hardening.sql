-- Phase 1 Security Hardening: enforce secure search_path, protect profiles, and tighten RLS

-- 1) Recreate SECURITY DEFINER functions with explicit secure search_path ('', public)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'operacional'::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_denuncia_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  INSERT INTO public.activity_logs (action, by_user, meta)
  VALUES (
    'denuncia_' || TG_OP,
    COALESCE(auth.jwt() ->> 'email', 'anonymous'),
    jsonb_build_object(
      'denuncia_id', COALESCE(NEW.id, OLD.id),
      'protocolo', COALESCE(NEW.protocolo, OLD.protocolo),
      'timestamp', now()
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.log_denuncia_access(denuncia_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES(
    'select_denuncia',
    auth.uid(),
    jsonb_build_object('denuncia_id', denuncia_id, 'timestamp', now())
  );
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = '', public
AS $$
  SELECT
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'operacional'::user_role) AND
      empresa_uuid = ANY (
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  RETURN (
    SELECT empresa_id FROM public.profiles
    WHERE user_id = auth.uid()
    AND role != 'administrador'
    AND role != 'superuser'
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = '', public
AS $$
  SELECT
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      empresa_uuid = ANY(
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    ) OR (
      has_role(auth.uid(), 'operacional'::user_role) AND
      EXISTS (
        SELECT 1
        FROM public.colaboradores
        WHERE empresa_id = empresa_uuid
        AND created_by = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = '', public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = '', public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid
    AND (
      role = required_role
      OR role = 'superuser'
      OR (required_role = 'operacional' AND role IN ('empresarial', 'administrador', 'financeiro', 'financeiro_master'))
      OR (required_role = 'empresarial' AND role IN ('administrador', 'financeiro_master'))
      OR (required_role = 'financeiro' AND role = 'financeiro_master')
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = '', public
AS $$
  UPDATE public.profiles
  SET last_login = now()
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.authenticate_by_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
DECLARE
  user_email text;
  user_uuid uuid;
BEGIN
  -- Buscar por username primeiro
  SELECT auth.users.email, auth.users.id
  INTO user_email, user_uuid
  FROM public.profiles
  JOIN auth.users ON auth.users.id = profiles.user_id
  WHERE profiles.username = username_input
    AND profiles.is_active = true;

  -- Se não encontrou por username, tentar por email
  IF user_email IS NULL THEN
    SELECT auth.users.email, auth.users.id
    INTO user_email, user_uuid
    FROM public.profiles
    JOIN auth.users ON auth.users.id = profiles.user_id
    WHERE auth.users.email = username_input
      AND profiles.is_active = true;
  END IF;

  -- Se ainda não encontrou, verificar se existe na tabela auth mas não na profiles
  IF user_email IS NULL THEN
    SELECT auth.users.email, auth.users.id
    INTO user_email, user_uuid
    FROM auth.users
    WHERE auth.users.email = username_input
      AND auth.users.email_confirmed_at IS NOT NULL;

    -- Se encontrou na auth mas não na profiles, criar profile
    IF user_email IS NOT NULL THEN
      INSERT INTO public.profiles (user_id, username, full_name, role, is_active)
      VALUES (user_uuid, username_input, username_input, 'operacional', true)
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        updated_at = now();
    END IF;
  END IF;

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Username not found or user inactive';
  END IF;

  RETURN QUERY SELECT user_uuid, user_email;
END;
$$;

-- 2) Protect profiles against self-escalation: trigger to block restricted field changes

CREATE OR REPLACE FUNCTION public.enforce_profile_update_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  SET search_path = '', public;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'superuser') OR public.has_role(auth.uid(), 'administrador')) THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.empresa_ids IS DISTINCT FROM OLD.empresa_ids
       OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'Not permitted to modify restricted profile fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profiles_protected_fields_trg ON public.profiles;
CREATE TRIGGER enforce_profiles_protected_fields_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_update_restrictions();

-- 3) Force RLS on sensitive tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores FORCE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_colaborador FORCE ROW LEVEL SECURITY;

-- 4) Tighten colaboradores RLS: bound by company and role, with access logging
DROP POLICY IF EXISTS "Admins or self can view colaborador" ON public.colaboradores;
DROP POLICY IF EXISTS "hr admin select" ON public.colaboradores;
DROP POLICY IF EXISTS "hr admin insert" ON public.colaboradores;
DROP POLICY IF EXISTS "hr admin update" ON public.colaboradores;
DROP POLICY IF EXISTS "hr admin delete" ON public.colaboradores;
DROP POLICY IF EXISTS "self read only" ON public.colaboradores;

CREATE POLICY "colaboradores_select_company_bound" ON public.colaboradores
  FOR SELECT TO authenticated
  USING (
    public.log_colaboradores_access(id) AND (
      public.has_role(auth.uid(), 'superuser') OR
      (public.has_role(auth.uid(), 'administrador') AND public.user_can_access_empresa(empresa_id)) OR
      (public.has_role(auth.uid(), 'empresarial') AND public.user_can_access_empresa(empresa_id)) OR
      (public.has_role(auth.uid(), 'operacional') AND created_by = auth.uid())
    )
  );

CREATE POLICY "colaboradores_insert_admin" ON public.colaboradores
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'superuser'))
    AND public.user_can_access_empresa(empresa_id)
  );

CREATE POLICY "colaboradores_update_admin" ON public.colaboradores
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'superuser'))
    AND public.user_can_access_empresa(empresa_id)
  )
  WITH CHECK (
    (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'superuser'))
    AND public.user_can_access_empresa(empresa_id)
  );

CREATE POLICY "colaboradores_delete_admin" ON public.colaboradores
  FOR DELETE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'superuser'))
    AND public.user_can_access_empresa(empresa_id)
  );