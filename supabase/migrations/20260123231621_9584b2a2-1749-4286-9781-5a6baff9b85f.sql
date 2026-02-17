-- Inserir 3 clientes de exemplo
INSERT INTO clients (name, email, phone, type, status, contract_start, monthly_credits, package_credits, package_credits_used, access_expires_at, notes)
VALUES 
  ('Prefeitura de Osasco', 'prefeitura@osasco.sp.gov.br', '(11) 3652-0000', 'fixed', 'active', CURRENT_DATE, NULL, NULL, NULL, NULL, 'Cliente institucional com acesso ilimitado'),
  ('Faculdade Anhanguera', 'contato@anhanguera.com', '(11) 4003-0000', 'fixed', 'active', CURRENT_DATE, 500, NULL, NULL, NULL, 'Contrato mensal com 500 créditos'),
  ('João Silva Designer', 'joao.silva@email.com', '(11) 99999-1234', 'package', 'active', CURRENT_DATE, NULL, 50, 5, NOW() + INTERVAL '3 days', 'Pacote de 3 dias - 50 créditos')
ON CONFLICT DO NOTHING;