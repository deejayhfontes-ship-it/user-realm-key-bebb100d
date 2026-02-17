-- Tabela de Mensagens de Contato
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

-- Tabela de Newsletter
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Tabela de Conteúdo "Quem Somos"
CREATE TABLE public.company_about (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  headline text DEFAULT 'Quem Somos',
  story_title text,
  full_description text,
  mission text,
  vision text,
  values jsonb DEFAULT '[]'::jsonb,
  foundation_year text,
  team_size text,
  projects_count text,
  clients_count text,
  about_image_url text,
  differentials jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela Configurações de Canais (WhatsApp/Redes)
CREATE TABLE public.channel_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  whatsapp_number text,
  whatsapp_default_message text DEFAULT 'Olá! Vi o site da Fontes Graphics e gostaria de mais informações.',
  whatsapp_show_float_button boolean DEFAULT true,
  instagram_url text,
  behance_url text,
  linkedin_url text,
  youtube_url text,
  contact_email text,
  support_hours text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
CREATE POLICY "Users can manage own contact_messages" ON public.contact_messages
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Users can manage own subscribers" ON public.newsletter_subscribers
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- RLS Policies for company_about
CREATE POLICY "Users can manage own about" ON public.company_about
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view about" ON public.company_about
  FOR SELECT USING (true);

-- RLS Policies for channel_settings
CREATE POLICY "Users can manage own channels" ON public.channel_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view channel settings" ON public.channel_settings
  FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_company_about_updated_at
  BEFORE UPDATE ON public.company_about
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channel_settings_updated_at
  BEFORE UPDATE ON public.channel_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_contact_messages_user_status ON public.contact_messages(user_id, status);
CREATE INDEX idx_newsletter_subscribers_user ON public.newsletter_subscribers(user_id);

-- Storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('services-images', 'services-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('about-images', 'about-images', true);

-- Storage policies
CREATE POLICY "Anyone can view services images" ON storage.objects
  FOR SELECT USING (bucket_id = 'services-images');

CREATE POLICY "Authenticated users can upload services images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'services-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own services images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'services-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own services images" ON storage.objects
  FOR DELETE USING (bucket_id = 'services-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view about images" ON storage.objects
  FOR SELECT USING (bucket_id = 'about-images');

CREATE POLICY "Authenticated users can upload about images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'about-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own about images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'about-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own about images" ON storage.objects
  FOR DELETE USING (bucket_id = 'about-images' AND auth.role() = 'authenticated');