-- Criar bucket para armazenar ZIPs dos geradores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generators',
  'generators',
  false,
  52428800, -- 50MB
  ARRAY['application/zip', 'application/x-zip-compressed', 'application/json']
);

-- Políticas RLS para o bucket de geradores
-- Admins podem fazer upload de arquivos
CREATE POLICY "Admins can upload generator files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'generators' 
  AND is_admin(auth.uid())
);

-- Admins podem visualizar arquivos
CREATE POLICY "Admins can view generator files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'generators' 
  AND is_admin(auth.uid())
);

-- Admins podem deletar arquivos
CREATE POLICY "Admins can delete generator files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'generators' 
  AND is_admin(auth.uid())
);

-- Adicionar coluna para rastrear método de instalação e arquivo ZIP
ALTER TABLE generators 
ADD COLUMN IF NOT EXISTS installed_via TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS zip_file_path TEXT,
ADD COLUMN IF NOT EXISTS installed_at TIMESTAMPTZ DEFAULT now();