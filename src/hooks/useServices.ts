import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Service, ServiceFormData } from '@/types/service';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchServices = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Parse JSONB fields
      const parsed = (data || []).map(s => ({
        ...s,
        features: Array.isArray(s.features) ? s.features : [],
        deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
      })) as Service[];
      
      setServices(parsed);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar serviços',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const createService = async (formData: ServiceFormData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          icon: formData.icon || null,
          title: formData.title,
          slug: formData.slug,
          short_description: formData.short_description,
          full_description: formData.full_description || null,
          features: formData.features,
          deliverables: formData.deliverables,
          price_range: formData.price_range || null,
          delivery_time: formData.delivery_time || null,
          image_url: formData.image_url || null,
          display_order: formData.display_order,
          is_active: formData.is_active,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Serviço criado',
        description: 'O serviço foi cadastrado com sucesso.',
      });

      await fetchServices();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar serviço',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateService = async (id: string, formData: Partial<ServiceFormData>) => {
    try {
      const updateData: Record<string, any> = {};
      
      if (formData.icon !== undefined) updateData.icon = formData.icon || null;
      if (formData.title !== undefined) updateData.title = formData.title;
      if (formData.slug !== undefined) updateData.slug = formData.slug;
      if (formData.short_description !== undefined) updateData.short_description = formData.short_description;
      if (formData.full_description !== undefined) updateData.full_description = formData.full_description || null;
      if (formData.features !== undefined) updateData.features = formData.features;
      if (formData.deliverables !== undefined) updateData.deliverables = formData.deliverables;
      if (formData.price_range !== undefined) updateData.price_range = formData.price_range || null;
      if (formData.delivery_time !== undefined) updateData.delivery_time = formData.delivery_time || null;
      if (formData.image_url !== undefined) updateData.image_url = formData.image_url || null;
      if (formData.display_order !== undefined) updateData.display_order = formData.display_order;
      if (formData.is_active !== undefined) updateData.is_active = formData.is_active;

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Serviço atualizado',
        description: 'As alterações foram salvas.',
      });

      await fetchServices();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar serviço',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Serviço excluído',
        description: 'O serviço foi removido com sucesso.',
      });

      await fetchServices();
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir serviço',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const duplicateService = async (service: Service) => {
    const newFormData: ServiceFormData = {
      icon: service.icon || '',
      title: `${service.title} (Cópia)`,
      slug: `${service.slug}-copia-${Date.now()}`,
      short_description: service.short_description,
      full_description: service.full_description || '',
      features: [...service.features],
      deliverables: [...service.deliverables],
      price_range: service.price_range || '',
      delivery_time: service.delivery_time || '',
      image_url: service.image_url || '',
      display_order: service.display_order + 1,
      is_active: false,
    };

    return createService(newFormData);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateService(id, { is_active: isActive });
  };

  return {
    services,
    loading,
    fetchServices,
    createService,
    updateService,
    deleteService,
    duplicateService,
    toggleActive,
  };
}
