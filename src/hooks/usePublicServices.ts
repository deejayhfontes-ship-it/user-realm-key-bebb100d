import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/service';

// Hook for public use - fetches only active services without authentication
export function usePublicServices() {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['public-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(s => ({
        ...s,
        features: Array.isArray(s.features) ? s.features : [],
        deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
      })) as Service[];
    },
  });

  return { services, isLoading, error };
}
