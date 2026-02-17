-- Atualizar modelo deprecado do Google Gemini
UPDATE ai_providers
SET 
  model_name = 'gemini-1.5-flash',
  endpoint_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
WHERE api_type = 'google'
  AND model_name = 'gemini-pro';

-- Também atualizar qualquer outro modelo deprecado do Gemini
UPDATE ai_providers
SET 
  model_name = 'gemini-1.5-flash',
  endpoint_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
WHERE api_type = 'google'
  AND (model_name LIKE 'gemini-pro%' OR model_name = 'gemini-1.0-pro');