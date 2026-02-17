-- Add new columns to pix_configs for multiple accounts support
ALTER TABLE public.pix_configs 
ADD COLUMN IF NOT EXISTS nickname TEXT DEFAULT 'Conta Principal',
ADD COLUMN IF NOT EXISTS key_type TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Remove the unique constraint on user_id to allow multiple configs per user
-- First, check if the constraint exists and drop it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pix_configs_user_id_key'
  ) THEN
    ALTER TABLE public.pix_configs DROP CONSTRAINT pix_configs_user_id_key;
  END IF;
END $$;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pix_configs_user_id ON public.pix_configs(user_id);

-- Add a trigger to ensure only one default per user
CREATE OR REPLACE FUNCTION ensure_single_default_pix()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE public.pix_configs 
    SET is_default = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS ensure_single_default_pix_trigger ON public.pix_configs;

-- Create the trigger
CREATE TRIGGER ensure_single_default_pix_trigger
BEFORE INSERT OR UPDATE ON public.pix_configs
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_pix();