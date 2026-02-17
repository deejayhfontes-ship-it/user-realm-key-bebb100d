-- Allow public signup on clients table
CREATE POLICY "Allow public signup for clients"
ON public.clients
FOR INSERT
WITH CHECK (true);

-- Allow public signup on users table (user creates their own record)
CREATE POLICY "Allow users to create their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);