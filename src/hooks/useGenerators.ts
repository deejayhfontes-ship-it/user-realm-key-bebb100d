import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Generator {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  status: string | null;
  config: Record<string, unknown> | null;
  preview_image_url: string | null;
  template_url: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GeneratorDetails extends Generator {
  clients_using: number;
  total_generations: number;
  clients: { id: string; name: string }[];
}

export interface CreateGeneratorData {
  name: string;
  slug: string;
  type: string;
  description?: string;
  status?: string;
  config?: Record<string, unknown>;
}

export interface UpdateGeneratorData extends Partial<CreateGeneratorData> {
  id: string;
}

export function useGeneratorsList() {
  return useQuery({
    queryKey: ['generators-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generators')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Generator[];
    }
  });
}

export function useGeneratorDetails(generatorId: string | null) {
  return useQuery({
    queryKey: ['generator-details', generatorId],
    queryFn: async () => {
      if (!generatorId) return null;

      // Get generator
      const { data: generator, error: genError } = await supabase
        .from('generators')
        .select('*')
        .eq('id', generatorId)
        .single();

      if (genError) throw genError;

      // Get clients using this generator
      const { data: clientGenerators } = await supabase
        .from('client_generators')
        .select('client_id, clients(id, name)')
        .eq('generator_id', generatorId)
        .eq('enabled', true);

      // Get total generations
      const { count: totalGenerations } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('generator_id', generatorId);

      const clients = clientGenerators?.map((cg: any) => ({
        id: cg.clients?.id,
        name: cg.clients?.name
      })).filter(c => c.id) || [];

      return {
        ...generator,
        clients_using: clients.length,
        total_generations: totalGenerations || 0,
        clients
      } as GeneratorDetails;
    },
    enabled: !!generatorId
  });
}

export function useCreateGenerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGeneratorData) => {
      // Check if slug already exists
      const { data: existing } = await supabase
        .from('generators')
        .select('id')
        .eq('slug', data.slug)
        .maybeSingle();

      if (existing) {
        throw new Error('Slug já existe. Escolha outro nome.');
      }

      const configData = data.config || {
        fields: [],
        options: {},
        output_formats: ['png'],
        max_generations_per_request: 10
      };

      const { data: generator, error } = await supabase
        .from('generators')
        .insert({
          name: data.name,
          slug: data.slug,
          type: data.type,
          description: data.description || null,
          status: data.status || 'development',
          config: configData as unknown as Record<string, never>
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: user?.id,
        action: 'create',
        entity_type: 'generator',
        entity_id: generator.id,
        new_data: JSON.parse(JSON.stringify(data))
      }]);

      return generator;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generators-list'] });
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      toast({
        title: 'Gerador criado!',
        description: 'O novo gerador foi adicionado ao sistema.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar gerador',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateGenerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateGeneratorData) => {
      const { id, ...updateData } = data;

      const { data: generator, error } = await supabase
        .from('generators')
        .update({
          name: updateData.name,
          slug: updateData.slug,
          type: updateData.type,
          description: updateData.description || null,
          status: updateData.status,
          config: updateData.config as unknown as Record<string, never>
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: user?.id,
        action: 'update',
        entity_type: 'generator',
        entity_id: id,
        new_data: JSON.parse(JSON.stringify(data))
      }]);

      return generator;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generators-list'] });
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      queryClient.invalidateQueries({ queryKey: ['generator-details'] });
      toast({
        title: 'Gerador atualizado!',
        description: 'As alterações foram salvas.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar gerador',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateGeneratorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('generators')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: user?.id,
        action: 'update_status',
        entity_type: 'generator',
        entity_id: id,
        new_data: { status }
      }]);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['generators-list'] });
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      queryClient.invalidateQueries({ queryKey: ['generator-details'] });
      const action = variables.status === 'disabled' ? 'desativado' : 'ativado';
      toast({
        title: `Gerador ${action}`,
        description: `Status do gerador foi alterado.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar gerador',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
