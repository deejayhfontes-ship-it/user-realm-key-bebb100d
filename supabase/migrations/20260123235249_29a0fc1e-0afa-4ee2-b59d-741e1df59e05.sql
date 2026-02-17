-- Vincular geradores aos clientes
-- Prefeitura de Osasco - todos os geradores, sem limite
INSERT INTO client_generators (client_id, generator_id, enabled, credits_limit, credits_used, allowed_weekdays)
SELECT 
  '23b1b6f7-2244-42e1-a4c5-9680a1bea897',
  id,
  true,
  NULL,
  0,
  ARRAY[0,1,2,3,4,5,6]
FROM generators WHERE status = 'ready';

-- Faculdade Anhanguera - todos os geradores, limite de horário
INSERT INTO client_generators (client_id, generator_id, enabled, credits_limit, credits_used, time_limit_start, time_limit_end, allowed_weekdays)
SELECT 
  'f06f380a-5097-4f33-9cb5-022aee154fc0',
  id,
  true,
  100,
  23,
  '08:00',
  '18:00',
  ARRAY[1,2,3,4,5]
FROM generators WHERE status = 'ready';

-- João Silva Designer - apenas 2 geradores
INSERT INTO client_generators (client_id, generator_id, enabled, credits_limit, credits_used, allowed_weekdays)
VALUES 
  ('31b8a903-2cc7-4e9a-8cb0-c2a2c901e604', 'bf1825d5-a1e3-4804-81ea-d3f7c4d93231', true, 20, 5, ARRAY[0,1,2,3,4,5,6]),
  ('31b8a903-2cc7-4e9a-8cb0-c2a2c901e604', '7412424e-19f2-48c4-8e56-d18340213565', true, 30, 0, ARRAY[0,1,2,3,4,5,6]);