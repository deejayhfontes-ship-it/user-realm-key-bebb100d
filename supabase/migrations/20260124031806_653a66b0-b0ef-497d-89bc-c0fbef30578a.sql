-- Add supports_images column to ai_providers
ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS supports_images BOOLEAN DEFAULT false;

-- Mark providers that support images
UPDATE ai_providers 
SET supports_images = true 
WHERE api_type IN ('openai', 'anthropic', 'google', 'lovable');

-- Add attachments column to generator_edit_history
ALTER TABLE generator_edit_history
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;