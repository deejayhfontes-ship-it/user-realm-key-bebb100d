-- Add RLS policy for admins to insert generators
CREATE POLICY "Admins can insert generators" 
ON public.generators 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Add RLS policy for admins to update generators
CREATE POLICY "Admins can update generators" 
ON public.generators 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Add RLS policy for admins to delete generators
CREATE POLICY "Admins can delete generators" 
ON public.generators 
FOR DELETE 
USING (is_admin(auth.uid()));