-- Add document fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS document_number text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS document_type text;

-- Add check constraint for document_type
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_document_type_check;
ALTER TABLE clients ADD CONSTRAINT clients_document_type_check CHECK (document_type IS NULL OR document_type IN ('cpf', 'cnpj'));