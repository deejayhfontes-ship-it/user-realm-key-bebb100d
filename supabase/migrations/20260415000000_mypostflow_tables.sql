-- MyPostFlow — tabelas de carrosséis, templates e treinamento de usuário

-- ─── carousels ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.carousels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT 'Sem título',
  format      text NOT NULL DEFAULT 'carousel',   -- carousel | square | story
  style       text NOT NULL DEFAULT 'minimalista', -- minimalista | profile
  slides      jsonb NOT NULL DEFAULT '[]',
  thumbnail_url text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carousels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own carousels"
  ON public.carousels FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── templates ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'Meu Template',
  format      text NOT NULL DEFAULT 'carousel',
  style       text NOT NULL DEFAULT 'minimalista',
  slides      jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates"
  ON public.templates FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── user_training ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_training (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_handle    text DEFAULT '',
  niche               text DEFAULT '',
  tone                text DEFAULT 'direto',
  font_title          text DEFAULT 'space-grotesk',
  font_subtitle       text DEFAULT 'inter',
  brand_bg            text DEFAULT '#0a0a0a',
  brand_title_color   text DEFAULT '',
  brand_sub_color     text DEFAULT '',
  accent_color        text DEFAULT '',
  slide_count         integer DEFAULT 5,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own training"
  ON public.user_training FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER carousels_updated_at
  BEFORE UPDATE ON public.carousels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER user_training_updated_at
  BEFORE UPDATE ON public.user_training
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
