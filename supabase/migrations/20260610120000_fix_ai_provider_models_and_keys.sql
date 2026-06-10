-- ============================================================
-- Fix: Atualiza modelos Gemini para versões GA ativas (junho/2026)
-- Corrige gemini-3-pro-image-preview → gemini-3-pro-image (GA)
-- Corrige gemini-3-pro-preview (texto) → gemini-3.5-flash
-- Adiciona as duas keys recarregadas ao pool
-- ============================================================

UPDATE ai_providers
SET
  model_name   = 'gemini-3-pro-image',
  endpoint_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent',
  system_prompt = jsonb_build_object(
    'model_text', 'gemini-3.5-flash',
    'api_keys', jsonb_build_array(
      jsonb_build_object('key', 'AIzaSyDdoJpwUBSEqB4pfyPc0JZHvXDBcmBB2D4', 'enabled', true),
      jsonb_build_object('key', 'AIzaSyCTNux6BEM5p5WVBMEOozM29sDbRGG7GC4',  'enabled', true),
      jsonb_build_object('key', 'AIzaSyASZdiVYzgd2ZkJXlsNNXXeBICkQT_sIZ8',  'enabled', false),
      jsonb_build_object('key', 'AIzaSyArc8MYzPTPmdb5nlDOUBHCRln3XhjeCL0',  'enabled', false),
      jsonb_build_object('key', 'AIzaSyAT6BFUDleuM_ddG6esH3OcnrfUmq7bTAQ',  'enabled', false),
      jsonb_build_object('key', 'AIzaSyBDQVzsN8XB9tqLARVxEe_51Z7rNnUgWjY',  'enabled', false),
      jsonb_build_object('key', 'AIzaSyDFzuFu7Kh0UOIwaly44ssF6Sdi-XWWH-w',  'enabled', false)
    )
  )::text,
  api_key_encrypted = 'AIzaSyDdoJpwUBSEqB4pfyPc0JZHvXDBcmBB2D4'
WHERE slug = 'designer-do-futuro';
