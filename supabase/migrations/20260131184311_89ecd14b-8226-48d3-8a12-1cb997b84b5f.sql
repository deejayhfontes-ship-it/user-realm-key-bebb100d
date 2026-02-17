-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Temporarily disable RLS on clients and users for the trigger to work
-- We'll use a different approach: grant direct permissions

-- Create the trigger function with explicit bypassing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_client_id uuid;
BEGIN
  -- Insert into clients
  INSERT INTO public.clients (
    name,
    email,
    phone,
    type,
    status,
    package_credits,
    package_credits_used,
    access_expires_at,
    document_type,
    document_number
  )
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'package',
    'pending',
    0,
    0,
    NOW() + INTERVAL '30 days',
    COALESCE(NEW.raw_user_meta_data->>'document_type', 'cnpj'),
    NEW.raw_user_meta_data->>'document_number'
  )
  RETURNING id INTO new_client_id;

  -- Insert into users
  INSERT INTO public.users (
    id,
    email,
    password_hash,
    role,
    client_id,
    login_count
  )
  VALUES (
    NEW.id,
    NEW.email,
    'managed_by_supabase_auth',
    'client',
    new_client_id,
    0
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Set function owner to postgres (bypasses RLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Grant execute to supabase_auth_admin (the role that runs auth triggers)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Grant INSERT on clients and users to supabase_auth_admin directly
GRANT INSERT ON public.clients TO supabase_auth_admin;
GRANT INSERT ON public.users TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();