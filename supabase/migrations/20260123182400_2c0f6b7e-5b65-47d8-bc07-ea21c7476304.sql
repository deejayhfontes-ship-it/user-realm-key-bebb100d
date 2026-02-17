-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Policy: Admins can insert users
CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Policy: Admins can update users
CREATE POLICY "Admins can update users" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Policy: Admins can delete users
CREATE POLICY "Admins can delete users" 
ON public.users 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);