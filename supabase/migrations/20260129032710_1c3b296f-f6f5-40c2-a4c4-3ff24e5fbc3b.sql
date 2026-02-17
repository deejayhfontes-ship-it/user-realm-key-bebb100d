-- Trigger para verificar créditos antes de inserir uma geração
CREATE OR REPLACE FUNCTION public.check_credits_before_generation()
RETURNS TRIGGER AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Buscar dados do cliente
  SELECT type, package_credits, package_credits_used, status
  INTO client_record
  FROM clients
  WHERE id = NEW.client_id;
  
  -- Verificar status do cliente
  IF client_record.status != 'active' THEN
    RAISE EXCEPTION 'Cliente não está ativo';
  END IF;
  
  -- Verificar créditos para pacotes
  IF client_record.type = 'package' THEN
    IF client_record.package_credits_used >= client_record.package_credits THEN
      RAISE EXCEPTION 'Créditos insuficientes';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS before_generation_insert ON public.generations;
CREATE TRIGGER before_generation_insert
  BEFORE INSERT ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.check_credits_before_generation();

-- Função para incrementar créditos usados após inserção bem-sucedida
CREATE OR REPLACE FUNCTION public.increment_credits_used()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar package_credits_used para clientes do tipo package
  UPDATE clients
  SET package_credits_used = COALESCE(package_credits_used, 0) + 1
  WHERE id = NEW.client_id AND type = 'package';
  
  -- Incrementar credits_used no client_generators
  UPDATE client_generators
  SET credits_used = COALESCE(credits_used, 0) + 1
  WHERE client_id = NEW.client_id AND generator_id = NEW.generator_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para incrementar créditos
DROP TRIGGER IF EXISTS after_generation_insert ON public.generations;
CREATE TRIGGER after_generation_insert
  AFTER INSERT ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.increment_credits_used();