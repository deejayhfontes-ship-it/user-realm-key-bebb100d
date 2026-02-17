import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { enableCodeProtection, disableCodeProtection } from '@/utils/codeProtection';

interface DeveloperModeValue {
  enabled: boolean;
}

export function CodeProtectionProvider({ children }: { children: React.ReactNode }) {
  // Verificar modo desenvolvedor
  const { data } = useQuery({
    queryKey: ['global-settings', 'developer_mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'developer_mode')
        .single();
      
      if (error) {
        console.error('Erro ao buscar configuração de modo desenvolvedor:', error);
        return { enabled: true } as DeveloperModeValue; // Default: habilitado em caso de erro
      }
      const value = data?.value as unknown as DeveloperModeValue | null;
      return value ?? { enabled: true };
    },
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Revalidar a cada minuto
  });

  useEffect(() => {
    const isDeveloperMode = data?.enabled ?? true;
    
    if (!isDeveloperMode) {
      // Ativar proteção
      const cleanup = enableCodeProtection();
      return cleanup;
    } else {
      // Desativar proteção
      disableCodeProtection();
    }
  }, [data?.enabled]);

  return <>{children}</>;
}
