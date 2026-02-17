-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function with explicit schema owner privileges
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_client_id uuid;
BEGIN
  -- Insert into clients with explicit schema reference
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

  -- Insert into users with explicit schema reference
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
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant necessary permissions to the function
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Create RLS bypass policy for trigger on clients table
DO $$
BEGIN
  -- Add policy that allows service role to insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' 
    AND policyname = 'Service role can insert clients'
  ) THEN
    CREATE POLICY "Service role can insert clients"
      ON public.clients
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Add policy that allows service role to insert users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Service role can insert users'
  ) THEN
    CREATE POLICY "Service role can insert users"
      ON public.users
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Also ensure postgres role (SECURITY DEFINER owner) can bypass RLS
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();