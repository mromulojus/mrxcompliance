-- Corrigir search_path nas funções restantes para eliminar warnings de segurança

-- Corrigir função get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Corrigir função user_can_access_empresa  
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (
      role IN ('superuser', 'administrador') 
      OR empresa_uuid = ANY(empresa_ids)
    )
  );
$$;

-- Corrigir função authenticate_by_username
CREATE OR REPLACE FUNCTION public.authenticate_by_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  WHERE profiles.username = username_input;

  -- Se não encontrou por username, tentar por email
  IF user_email IS NULL THEN
    SELECT auth.users.email, auth.users.id
    INTO user_email, user_uuid
    FROM public.profiles
    JOIN auth.users ON auth.users.id = profiles.user_id
    WHERE auth.users.email = username_input;
  END IF;

  -- Se encontrou o usuário, retornar os dados
  IF user_email IS NOT NULL THEN
    RETURN QUERY SELECT user_uuid, user_email;
  END IF;

  -- Se não encontrou, retornar vazio
  RETURN;
END;
$$;