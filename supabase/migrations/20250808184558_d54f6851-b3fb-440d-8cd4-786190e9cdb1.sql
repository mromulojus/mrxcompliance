-- Update the handle_new_user function to include contato@mrxbr.com as superuser
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    CASE 
      WHEN NEW.email IN ('mrxbr@example.com', 'contato@mrxbr.com') THEN 'superuser'::public.user_role
      ELSE 'operacional'::public.user_role
    END
  );
  RETURN NEW;
END;
$function$;
