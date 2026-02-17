-- Create portfolio_cases table for admin to showcase projects
CREATE TABLE public.portfolio_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  thumbnail_url text NOT NULL,
  gallery_urls jsonb DEFAULT '[]'::jsonb,
  results text,
  featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_cases ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage portfolio_cases"
ON public.portfolio_cases
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Everyone can view published cases (for public homepage)
CREATE POLICY "Anyone can view published portfolio_cases"
ON public.portfolio_cases
FOR SELECT
USING (status = 'published');

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_cases_updated_at
BEFORE UPDATE ON public.portfolio_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_portfolio_cases_status ON public.portfolio_cases(status);
CREATE INDEX idx_portfolio_cases_featured ON public.portfolio_cases(featured);
CREATE INDEX idx_portfolio_cases_order ON public.portfolio_cases(order_index);