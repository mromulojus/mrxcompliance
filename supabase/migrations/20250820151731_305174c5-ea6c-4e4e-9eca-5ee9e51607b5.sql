-- Create boards table for task boards
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  empresa_id UUID REFERENCES empresas(id),
  created_by UUID REFERENCES auth.users(id),
  card_default JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create board_columns table for kanban columns
CREATE TABLE public.board_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Users can view boards from their company" 
ON public.boards 
FOR SELECT 
USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
    ELSE empresa_id = ANY(
      SELECT unnest(empresa_ids) 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  END
);

CREATE POLICY "Users can create boards for their company" 
ON public.boards 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
    ELSE empresa_id = ANY(
      SELECT unnest(empresa_ids) 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  END
);

CREATE POLICY "Users can update boards from their company" 
ON public.boards 
FOR UPDATE 
USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
    ELSE empresa_id = ANY(
      SELECT unnest(empresa_ids) 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  END
);

CREATE POLICY "Users can delete boards from their company" 
ON public.boards 
FOR DELETE 
USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
    ELSE empresa_id = ANY(
      SELECT unnest(empresa_ids) 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  END
);

-- Create policies for board_columns
CREATE POLICY "Users can view columns from accessible boards" 
ON public.board_columns 
FOR SELECT 
USING (
  board_id IN (
    SELECT id FROM public.boards 
    WHERE CASE 
      WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
      ELSE empresa_id = ANY(
        SELECT unnest(empresa_ids) 
        FROM profiles 
        WHERE user_id = auth.uid()
      )
    END
  )
);

CREATE POLICY "Users can create columns for accessible boards" 
ON public.board_columns 
FOR INSERT 
WITH CHECK (
  board_id IN (
    SELECT id FROM public.boards 
    WHERE CASE 
      WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
      ELSE empresa_id = ANY(
        SELECT unnest(empresa_ids) 
        FROM profiles 
        WHERE user_id = auth.uid()
      )
    END
  )
);

CREATE POLICY "Users can update columns from accessible boards" 
ON public.board_columns 
FOR UPDATE 
USING (
  board_id IN (
    SELECT id FROM public.boards 
    WHERE CASE 
      WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
      ELSE empresa_id = ANY(
        SELECT unnest(empresa_ids) 
        FROM profiles 
        WHERE user_id = auth.uid()
      )
    END
  )
);

CREATE POLICY "Users can delete columns from accessible boards" 
ON public.board_columns 
FOR DELETE 
USING (
  board_id IN (
    SELECT id FROM public.boards 
    WHERE CASE 
      WHEN auth.jwt() ->> 'role' = 'superuser' THEN true
      ELSE empresa_id = ANY(
        SELECT unnest(empresa_ids) 
        FROM profiles 
        WHERE user_id = auth.uid()
      )
    END
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_board_columns_updated_at
  BEFORE UPDATE ON public.board_columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_boards_empresa_id ON public.boards(empresa_id);
CREATE INDEX idx_board_columns_board_id ON public.board_columns(board_id);
CREATE INDEX idx_board_columns_position ON public.board_columns(board_id, position);