-- Create table for partner logos
CREATE TABLE public.partner_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  site_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for ordered queries
CREATE INDEX idx_partner_logos_ordem ON public.partner_logos (user_id, ordem);
CREATE INDEX idx_partner_logos_ativo ON public.partner_logos (user_id, ativo);

-- Enable Row Level Security
ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (authenticated users manage their own logos)
CREATE POLICY "Users can view their own partner logos" 
ON public.partner_logos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partner logos" 
ON public.partner_logos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner logos" 
ON public.partner_logos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partner logos" 
ON public.partner_logos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for public viewing of active logos
CREATE POLICY "Anyone can view active partner logos" 
ON public.partner_logos 
FOR SELECT 
USING (ativo = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partner_logos_updated_at
BEFORE UPDATE ON public.partner_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create settings table for section visibility
CREATE TABLE public.partner_section_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  show_section BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.partner_section_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings
CREATE POLICY "Users can view their own partner settings" 
ON public.partner_section_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partner settings" 
ON public.partner_section_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner settings" 
ON public.partner_section_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Anyone can read settings to check if section should show
CREATE POLICY "Anyone can view partner settings" 
ON public.partner_section_settings 
FOR SELECT 
USING (true);

-- Add trigger for settings timestamp
CREATE TRIGGER update_partner_section_settings_updated_at
BEFORE UPDATE ON public.partner_section_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();