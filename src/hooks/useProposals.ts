import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Proposal, ProposalSettings, ScopeItem } from '@/types/proposal';
import { useAuth } from './useAuth';

export function useProposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [settings, setSettings] = useState<ProposalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Erro ao carregar propostas');
    } else {
      const mapped = (data || []).map((p: any) => ({
        ...p,
        scope_items: (p.scope_items as ScopeItem[]) || [],
      }));
      setProposals(mapped);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('proposal_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setSettings(data as ProposalSettings);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProposals();
      fetchSettings();
    }
  }, [user]);

  const generateProposalNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_proposal_number');
    if (error) {
      console.error('Error generating proposal number:', error);
      const year = new Date().getFullYear();
      return `PROP${year}${String(proposals.length + 1).padStart(4, '0')}`;
    }
    return data;
  };

  const createProposal = async (proposal: Omit<Proposal, 'id' | 'proposal_number' | 'created_at' | 'updated_at' | 'created_by'>) => {
    const proposalNumber = await generateProposalNumber();
    
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        client_name: proposal.client_name,
        client_company: proposal.client_company,
        client_email: proposal.client_email,
        client_phone: proposal.client_phone,
        client_address: proposal.client_address,
        project_title: proposal.project_title,
        project_description: proposal.project_description,
        scope_items: JSON.parse(JSON.stringify(proposal.scope_items)),
        investment_value: proposal.investment_value,
        payment_conditions: proposal.payment_conditions,
        estimated_days: proposal.estimated_days,
        recurrence_type: proposal.recurrence_type || 'once',
        contract_period_months: proposal.contract_period_months,
        notes: proposal.notes,
        validity_days: proposal.validity_days,
        status: proposal.status,
        date: proposal.date,
        proposal_number: proposalNumber,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating proposal:', error);
      toast.error('Erro ao criar proposta');
      return null;
    }

    toast.success('Proposta criada com sucesso!');
    fetchProposals();
    return data;
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    const updateData: Record<string, any> = {};
    
    if (updates.client_name !== undefined) updateData.client_name = updates.client_name;
    if (updates.client_company !== undefined) updateData.client_company = updates.client_company;
    if (updates.client_email !== undefined) updateData.client_email = updates.client_email;
    if (updates.client_phone !== undefined) updateData.client_phone = updates.client_phone;
    if (updates.client_address !== undefined) updateData.client_address = updates.client_address;
    if (updates.project_title !== undefined) updateData.project_title = updates.project_title;
    if (updates.project_description !== undefined) updateData.project_description = updates.project_description;
    if (updates.scope_items !== undefined) updateData.scope_items = JSON.parse(JSON.stringify(updates.scope_items));
    if (updates.investment_value !== undefined) updateData.investment_value = updates.investment_value;
    if (updates.payment_conditions !== undefined) updateData.payment_conditions = updates.payment_conditions;
    if (updates.estimated_days !== undefined) updateData.estimated_days = updates.estimated_days;
    if (updates.recurrence_type !== undefined) updateData.recurrence_type = updates.recurrence_type;
    if (updates.contract_period_months !== undefined) updateData.contract_period_months = updates.contract_period_months;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.validity_days !== undefined) updateData.validity_days = updates.validity_days;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.date !== undefined) updateData.date = updates.date;

    const { error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating proposal:', error);
      toast.error('Erro ao atualizar proposta');
      return false;
    }

    toast.success('Proposta atualizada!');
    fetchProposals();
    return true;
  };

  const deleteProposal = async (id: string) => {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting proposal:', error);
      toast.error('Erro ao excluir proposta');
      return false;
    }

    toast.success('Proposta excluída!');
    fetchProposals();
    return true;
  };

  const saveSettings = async (newSettings: Partial<ProposalSettings>) => {
    if (settings?.id) {
      const { error } = await supabase
        .from('proposal_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) {
        toast.error('Erro ao salvar configurações');
        return false;
      }
    } else {
      const { error } = await supabase
        .from('proposal_settings')
        .insert({
          ...newSettings,
          user_id: user?.id,
          created_by: user?.id,
        });

      if (error) {
        toast.error('Erro ao salvar configurações');
        return false;
      }
    }

    toast.success('Configurações salvas!');
    fetchSettings();
    return true;
  };

  return {
    proposals,
    settings,
    loading,
    createProposal,
    updateProposal,
    deleteProposal,
    saveSettings,
    refetch: fetchProposals,
  };
}
