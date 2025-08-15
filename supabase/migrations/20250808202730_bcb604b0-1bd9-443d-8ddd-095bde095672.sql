-- Add unique constraint to username in profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create function to authenticate by username
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
  -- Get email from username
  SELECT auth.users.email, auth.users.id
  INTO user_email, user_uuid
  FROM public.profiles
  JOIN auth.users ON auth.users.id = profiles.user_id
  WHERE profiles.username = username_input;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Username not found';
  END IF;
  
  RETURN QUERY SELECT user_uuid, user_email;
END;
$$;
