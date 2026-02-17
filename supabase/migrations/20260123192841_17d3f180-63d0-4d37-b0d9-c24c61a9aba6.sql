-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Create simple, non-recursive policy
-- Authenticated users can read their own data OR all data if admin
CREATE POLICY "Users can read own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Create SECURITY DEFINER function to check admin role safely (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = _user_id AND role = 'admin'
  );
$$;

-- Admins can read all users using the secure function
CREATE POLICY "Admins can read all users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can insert users
CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update users
CREATE POLICY "Admins can update users" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete users
CREATE POLICY "Admins can delete users" 
ON public.users 
FOR DELETE 
TO authenticated
USING (public.is_admin(auth.uid()));