-- Add fields to track first login completion and terms acceptance
ALTER TABLE public.profiles 
ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN first_login_completed BOOLEAN DEFAULT FALSE;