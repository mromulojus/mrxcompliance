-- Create user_empresas table for N:N user-company linkage
CREATE TABLE IF NOT EXISTS public.user_empresas (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, empresa_id)
);

-- Index to speed up checks
CREATE INDEX IF NOT EXISTS idx_user_empresas_empresa ON public.user_empresas(empresa_id);

-- Normalization helpers for username
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.normalize_username(txt text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '.' FROM regexp_replace(
    lower(unaccent(coalesce(txt,''))),
    '[^a-z0-9._-]+', '.', 'g'
  ));
$$;

CREATE OR REPLACE FUNCTION public.on_profiles_username_set()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username := public.normalize_username(NEW.username);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_username_normalize ON public.profiles;
CREATE TRIGGER profiles_username_normalize
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.on_profiles_username_set();

-- Format check and uniqueness
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format_chk;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_chk
  CHECK (username ~ '^[a-z0-9](?:[a-z0-9._-]{2,29})$');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
ON public.profiles (username);

-- Update user_can_access_empresa to use user_empresas if available, fallback to empresa_ids
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    EXISTS (
      SELECT 1
      FROM public.user_empresas ue
      WHERE ue.user_id = auth.uid()
        AND ue.empresa_id = empresa_uuid
    ) OR (
      -- backward compatibility: profiles.empresa_ids array
      empresa_uuid = ANY (
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    );
$$;

-- Optional preview and backfill usernames deterministically (safe, idempotent)
DO $$
BEGIN
  -- Only update rows where username is null or violates format
  UPDATE public.profiles p
  SET username = sub.new_username,
      updated_at = now()
  FROM (
    WITH base AS (
      SELECT
        p.user_id,
        COALESCE(NULLIF(p.username,''), NULL) AS current_username,
        NULLIF(p.full_name,'') AS full_name,
        u.email,
        CASE
          WHEN NULLIF(p.username,'') IS NOT NULL THEN p.username
          WHEN NULLIF(p.full_name,'') IS NOT NULL THEN
            concat_ws('.',
              split_part(regexp_replace(p.full_name, '\\s+', ' ', 'g'), ' ', 1),
              (string_to_array(trim(regexp_replace(p.full_name, '\\s+', ' ', 'g')), ' '))[ array_length(string_to_array(trim(regexp_replace(p.full_name, '\\s+', ' ', 'g')), ' '),1) ]
            )
          WHEN NULLIF(u.email,'') IS NOT NULL THEN split_part(u.email,'@',1)
          ELSE 'user-' || left(p.user_id::text, 8)
        END AS base_raw
      FROM public.profiles p
      LEFT JOIN auth.users u ON u.id = p.user_id
    ),
    norm AS (
      SELECT user_id, public.normalize_username(base_raw) AS base_norm FROM base
    ),
    dedup AS (
      SELECT user_id, base_norm,
             ROW_NUMBER() OVER (PARTITION BY base_norm ORDER BY user_id) AS dup_idx
      FROM norm
    )
    SELECT
      user_id,
      CASE
        WHEN dup_idx = 1 THEN base_norm
        WHEN dup_idx <= 20 THEN base_norm || '.' || (dup_idx-1)::text
        ELSE base_norm || '.' || left(user_id::text, 4)
      END AS new_username
    FROM dedup
  ) AS sub
  WHERE p.user_id = sub.user_id
    AND (
      p.username IS NULL OR p.username !~ '^[a-z0-9](?:[a-z0-9._-]{2,29})$'
    );
END $$;

