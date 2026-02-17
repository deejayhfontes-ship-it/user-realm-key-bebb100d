-- Create table for project types
CREATE TABLE public.project_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'MoreHorizontal',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

-- Anyone can view active project types
CREATE POLICY "Anyone can view active project types"
ON public.project_types
FOR SELECT
USING (is_active = true);

-- Users can manage own project types
CREATE POLICY "Users can manage own project_types"
ON public.project_types
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add project_type_id to contact_messages
ALTER TABLE public.contact_messages 
ADD COLUMN project_type_id UUID REFERENCES public.project_types(id);

-- Create trigger for updated_at
CREATE TRIGGER update_project_types_updated_at
BEFORE UPDATE ON public.project_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();