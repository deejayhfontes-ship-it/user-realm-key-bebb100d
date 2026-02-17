-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with correct constraint values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
BEGIN
  -- Create client record with required fields for 'package' type
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
    NOW() + INTERVAL '30 days', -- Required for package type
    COALESCE(NEW.raw_user_meta_data->>'document_type', 'cnpj'),
    NEW.raw_user_meta_data->>'document_number'
  )
  RETURNING id INTO new_client_id;

  -- Create user record linking to client
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
END;
$$;

-- Recreate trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();