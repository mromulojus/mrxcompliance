-- Corrigir sistema de login
-- 1. Atualizar emails inválidos e dados ausentes
UPDATE public.profiles 
SET 
  full_name = COALESCE(full_name, username),
  updated_at = now()
WHERE full_name IS NULL OR full_name = '';

-- 2. Melhorar função de autenticação por username
CREATE OR REPLACE FUNCTION public.authenticate_by_username(username_input text, password_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 3. Criar função para gerar emails válidos para usernames
CREATE OR REPLACE FUNCTION public.generate_valid_email(username_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se já é um email válido, retornar
  IF username_text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN username_text;
  END IF;
  
  -- Gerar email válido baseado no username
  RETURN username_text || '@sistema.interno';
END;
$$;