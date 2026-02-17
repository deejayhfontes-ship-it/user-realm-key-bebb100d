import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: 'fixed' | 'package';
  status: string | null;
  logo_url: string | null;
  notes: string | null;
  contract_start: string | null;
  contract_end: string | null;
  monthly_credits: number | null;
  package_type: string | null;
  package_credits: number | null;
  package_credits_used: number | null;
  access_expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  total_geradores?: number;
  total_credits_used?: number;
}

export interface ClientGenerator {
  id?: string;
  client_id: string;
  generator_id: string;
  enabled?: boolean;
  credits_limit?: number | null;
  credits_used?: number;
  time_limit_start?: string | null;
  time_limit_end?: string | null;
  allowed_weekdays?: number[];
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  type: 'fixed' | 'package';
  notes?: string;
  contract_start?: string;
  monthly_credits?: number | null;
  package_type?: string;
  package_credits?: number;
  access_expires_at?: string;
  generators: ClientGenerator[];
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

export function useClients(statusFilter?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ['clients', statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select(`
          *,
          client_generators(id, credits_used)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(client => ({
        ...client,
        total_geradores: client.client_generators?.length || 0,
        total_credits_used: client.client_generators?.reduce(
          (sum: number, cg: { credits_used?: number }) => sum + (cg.credits_used || 0), 
          0
        ) || 0
      })) as Client[];
    }
  });
}

export function useClientDetails(clientId: string | null) {
  return useQuery({
    queryKey: ['client-details', clientId],
    queryFn: async () => {
      if (!clientId) return null;

      // Get client with generators
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          client_generators(
            id,
            generator_id,
            credits_limit,
            credits_used,
            time_limit_start,
            time_limit_end,
            allowed_weekdays,
            enabled
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Get generator names
      const { data: generators } = await supabase
        .from('generators')
        .select('id, name, slug');

      // Get recent generations
      const { data: recentGenerations } = await supabase
        .from('generations')
        .select('id, created_at, generator_id, success')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get total generations count
      const { count: totalGenerations } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId);

      // Map generator names to client_generators
      const clientGeneratorsWithNames = client.client_generators?.map((cg: any) => ({
        ...cg,
        generator_name: generators?.find(g => g.id === cg.generator_id)?.name || 'Desconhecido'
      })) || [];

      // Map generator names to generations
      const generationsWithNames = recentGenerations?.map((gen: any) => ({
        ...gen,
        generator_name: generators?.find(g => g.id === gen.generator_id)?.name || 'Desconhecido'
      })) || [];

      return {
        ...client,
        client_generators: clientGeneratorsWithNames,
        recent_generations: generationsWithNames,
        total_generations: totalGenerations || 0,
        total_credits_used: clientGeneratorsWithNames.reduce(
          (sum: number, cg: { credits_used?: number }) => sum + (cg.credits_used || 0), 
          0
        )
      };
    },
    enabled: !!clientId
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      // Check if email already exists
      if (data.email) {
        const { data: existing } = await supabase
          .from('clients')
          .select('id')
          .eq('email', data.email)
          .maybeSingle();

        if (existing) {
          throw new Error('Email já cadastrado');
        }
      }

      // Create client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          type: data.type,
          status: 'active',
          notes: data.notes || null,
          contract_start: data.contract_start || null,
          monthly_credits: data.monthly_credits || null,
          package_type: data.package_type || null,
          package_credits: data.package_credits || null,
          package_credits_used: 0,
          access_expires_at: data.access_expires_at || null
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Create client_generators
      if (data.generators.length > 0) {
        const generatorInserts = data.generators.map(gen => ({
          client_id: client.id,
          generator_id: gen.generator_id,
          enabled: true,
          credits_limit: gen.credits_limit || null,
          credits_used: 0,
          time_limit_start: gen.time_limit_start || null,
          time_limit_end: gen.time_limit_end || null,
          allowed_weekdays: gen.allowed_weekdays || [0, 1, 2, 3, 4, 5, 6]
        }));

        const { error: genError } = await supabase
          .from('client_generators')
          .insert(generatorInserts);

        if (genError) throw genError;
      }

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: user?.id,
        action: 'create',
        entity_type: 'client',
        entity_id: client.id,
        new_data: JSON.parse(JSON.stringify({ ...data, id: client.id }))
      }]);

      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente criado com sucesso!',
        description: 'O novo cliente foi adicionado ao sistema.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateClientData) => {
      const { id, generators, ...clientData } = data;

      // Update client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone || null,
          type: clientData.type,
          notes: clientData.notes || null,
          contract_start: clientData.contract_start || null,
          monthly_credits: clientData.monthly_credits || null,
          package_type: clientData.package_type || null,
          package_credits: clientData.package_credits || null,
          access_expires_at: clientData.access_expires_at || null
        })
        .eq('id', id)
        .select()
        .single();

      if (clientError) throw clientError;

      // Update generators - delete old ones and insert new ones
      if (generators && generators.length > 0) {
        // Delete existing generators
        await supabase
          .from('client_generators')
          .delete()
          .eq('client_id', id);

        // Insert new generators
        const generatorInserts = generators.map(gen => ({
          client_id: id,
          generator_id: gen.generator_id,
          enabled: true,
          credits_limit: gen.credits_limit || null,
          credits_used: gen.credits_used || 0,
          time_limit_start: gen.time_limit_start || null,
          time_limit_end: gen.time_limit_end || null,
          allowed_weekdays: gen.allowed_weekdays || [0, 1, 2, 3, 4, 5, 6]
        }));

        const { error: genError } = await supabase
          .from('client_generators')
          .insert(generatorInserts);

        if (genError) throw genError;
      }

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([{
        user_id: user?.id,
        action: 'update',
        entity_type: 'client',
        entity_id: id,
        new_data: JSON.parse(JSON.stringify(data))
      }]);

      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-details'] });
      toast({
        title: 'Cliente atualizado!',
        description: 'As alterações foram salvas com sucesso.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('clients')
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
        entity_type: 'client',
        entity_id: id,
        new_data: { status }
      }]);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-details'] });
      const action = variables.status === 'blocked' ? 'bloqueado' : 'desbloqueado';
      toast({
        title: `Cliente ${action}`,
        description: `Status do cliente foi alterado para ${variables.status}.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useGenerators() {
  return useQuery({
    queryKey: ['generators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generators')
        .select('id, name, slug, status')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
}
