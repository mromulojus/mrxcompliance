-- Recreate security definer functions with explicit search path

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    public.has_role(auth.uid(), 'superuser'::public.user_role) OR
    public.has_role(auth.uid(), 'administrador'::public.user_role) OR
    (
      public.has_role(auth.uid(), 'operacional'::public.user_role) AND
      empresa_uuid = ANY (
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT empresa_id FROM public.profiles
    WHERE user_id = auth.uid()
    AND role != 'administrador'
    AND role != 'superuser'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = '';

CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    -- Superusers e administradores têm acesso total
    public.has_role(auth.uid(), 'superuser'::public.user_role) OR
    public.has_role(auth.uid(), 'administrador'::public.user_role) OR
    -- Usuários empresariais só acessam suas empresas
    (
      public.has_role(auth.uid(), 'empresarial'::public.user_role) AND
      empresa_uuid = ANY(
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    ) OR
    -- Usuários operacionais acessam empresas onde trabalham
    (
      public.has_role(auth.uid(), 'operacional'::public.user_role) AND
      EXISTS (
        SELECT 1
        FROM public.colaboradores
        WHERE empresa_id = empresa_uuid
        AND created_by = auth.uid()
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.profiles
  SET last_login = now()
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.authenticate_by_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
