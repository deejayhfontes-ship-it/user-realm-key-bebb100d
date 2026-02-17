import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

export interface PixConfig {
  id: string;
  user_id: string;
  nickname: string;
  key_type: PixKeyType;
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  is_default: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PixConfigInput {
  nickname: string;
  key_type: PixKeyType;
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  is_default?: boolean;
  enabled?: boolean;
}

// Validation functions
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cleaned[13]);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 || cleaned.length === 13; // 11 digits or +55 + 11 digits
}

export function validateEVP(evp: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(evp);
}

export function validatePixKey(key: string, type: PixKeyType): { valid: boolean; message?: string } {
  switch (type) {
    case 'cpf':
      return validateCPF(key) 
        ? { valid: true } 
        : { valid: false, message: 'CPF inválido' };
    case 'cnpj':
      return validateCNPJ(key) 
        ? { valid: true } 
        : { valid: false, message: 'CNPJ inválido' };
    case 'email':
      return validateEmail(key) 
        ? { valid: true } 
        : { valid: false, message: 'Email inválido' };
    case 'phone':
      return validatePhone(key) 
        ? { valid: true } 
        : { valid: false, message: 'Telefone inválido (use 11 dígitos)' };
    case 'evp':
      return validateEVP(key) 
        ? { valid: true } 
        : { valid: false, message: 'Chave aleatória inválida (formato UUID)' };
    default:
      return { valid: false, message: 'Tipo de chave desconhecido' };
  }
}

export function maskPixKey(key: string, type: PixKeyType): string {
  switch (type) {
    case 'cpf':
      return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.***-**');
    case 'cnpj':
      return key.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '**.$2.***/$4-**');
    case 'email':
      const [local, domain] = key.split('@');
      if (local.length <= 3) return `***@${domain}`;
      return `${local.slice(0, 3)}***@${domain}`;
    case 'phone':
      const cleaned = key.replace(/\D/g, '');
      if (cleaned.length >= 11) {
        return `(${cleaned.slice(0, 2)}) *****-${cleaned.slice(-4)}`;
      }
      return `***${cleaned.slice(-4)}`;
    case 'evp':
      return `${key.slice(0, 8)}...${key.slice(-4)}`;
    default:
      return key.slice(0, 4) + '***';
  }
}

export function getKeyTypeLabel(type: PixKeyType): string {
  const labels: Record<PixKeyType, string> = {
    cpf: 'CPF',
    cnpj: 'CNPJ',
    email: 'Email',
    phone: 'Telefone',
    evp: 'Chave Aleatória',
  };
  return labels[type] || type;
}

export function usePixConfigs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pixConfigs, isLoading, error } = useQuery({
    queryKey: ['pix-configs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('pix_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PixConfig[];
    },
    enabled: !!user?.id,
  });

  const createConfigMutation = useMutation({
    mutationFn: async (input: PixConfigInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const configData = {
        user_id: user.id,
        nickname: input.nickname.trim(),
        key_type: input.key_type,
        pix_key: input.pix_key.trim(),
        merchant_name: input.merchant_name.toUpperCase().trim(),
        merchant_city: input.merchant_city.toUpperCase().trim(),
        is_default: input.is_default ?? false,
        enabled: input.enabled ?? true,
      };

      const { data, error } = await supabase
        .from('pix_configs')
        .insert(configData)
        .select()
        .single();

      if (error) throw error;
      return data as PixConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-configs'] });
      toast.success('Conta PIX cadastrada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating PIX config:', error);
      toast.error('Erro ao cadastrar conta PIX');
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<PixConfigInput> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (input.nickname !== undefined) updateData.nickname = input.nickname.trim();
      if (input.key_type !== undefined) updateData.key_type = input.key_type;
      if (input.pix_key !== undefined) updateData.pix_key = input.pix_key.trim();
      if (input.merchant_name !== undefined) updateData.merchant_name = input.merchant_name.toUpperCase().trim();
      if (input.merchant_city !== undefined) updateData.merchant_city = input.merchant_city.toUpperCase().trim();
      if (input.is_default !== undefined) updateData.is_default = input.is_default;
      if (input.enabled !== undefined) updateData.enabled = input.enabled;

      const { data, error } = await supabase
        .from('pix_configs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PixConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-configs'] });
      toast.success('Conta PIX atualizada!');
    },
    onError: (error) => {
      console.error('Error updating PIX config:', error);
      toast.error('Erro ao atualizar conta PIX');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pix_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-configs'] });
      toast.success('Conta PIX excluída!');
    },
    onError: (error) => {
      console.error('Error deleting PIX config:', error);
      toast.error('Erro ao excluir conta PIX');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pix_configs')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PixConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pix-configs'] });
      toast.success('Conta definida como padrão!');
    },
    onError: (error) => {
      console.error('Error setting default:', error);
      toast.error('Erro ao definir como padrão');
    },
  });

  return {
    pixConfigs: pixConfigs || [],
    isLoading,
    error,
    createConfig: createConfigMutation.mutate,
    updateConfig: updateConfigMutation.mutate,
    deleteConfig: deleteConfigMutation.mutate,
    setDefault: setDefaultMutation.mutate,
    isCreating: createConfigMutation.isPending,
    isUpdating: updateConfigMutation.isPending,
    isDeleting: deleteConfigMutation.isPending,
  };
}
