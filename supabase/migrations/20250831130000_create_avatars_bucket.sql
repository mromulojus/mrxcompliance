-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for avatar images
CREATE POLICY IF NOT EXISTS "Public read avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
);

-- Allow authenticated users to upload avatar images
CREATE POLICY IF NOT EXISTS "Authenticated upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Allow authenticated users to update avatar images
CREATE POLICY IF NOT EXISTS "Authenticated update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- Allow authenticated users to delete avatar images
CREATE POLICY IF NOT EXISTS "Authenticated delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for avatar images
CREATE POLICY IF NOT EXISTS "Public read avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
);

-- Allow authenticated users to upload avatar images
CREATE POLICY IF NOT EXISTS "Authenticated upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Allow authenticated users to update avatar images
CREATE POLICY IF NOT EXISTS "Authenticated update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- Allow authenticated users to delete avatar images
CREATE POLICY IF NOT EXISTS "Authenticated delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
);

