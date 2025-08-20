-- Add missing is_active column to boards table
ALTER TABLE public.boards 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for better performance on is_active queries
CREATE INDEX idx_boards_is_active ON public.boards(is_active);