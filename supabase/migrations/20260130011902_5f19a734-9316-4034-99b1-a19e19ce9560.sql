-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('portfolio-images', 'portfolio-images', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio-images bucket
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admins can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-images' AND is_admin(auth.uid()));

-- Add file metadata columns to portfolio_cases
ALTER TABLE portfolio_cases 
ADD COLUMN IF NOT EXISTS thumbnail_original_name text,
ADD COLUMN IF NOT EXISTS file_size_kb integer;