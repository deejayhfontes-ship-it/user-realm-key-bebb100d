-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
BEGIN
  -- Create client record first
  INSERT INTO public.clients (
    name,
    email,
    phone,
    type,
    status,
    package_credits,
    package_credits_used,
    document_type
  )
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'package',
    'pending',
    0,
    0,
    COALESCE(NEW.raw_user_meta_data->>'document_type', 'cnpj')
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

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();