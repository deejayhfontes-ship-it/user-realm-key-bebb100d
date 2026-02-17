import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { NewsletterSubscriber } from '@/types/cms';

export function useNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data as NewsletterSubscriber[] || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar assinantes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const addSubscriber = async (email: string, name?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          user_id: userData.user.id,
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já está cadastrado');
        }
        throw error;
      }

      setSubscribers(prev => [data as NewsletterSubscriber, ...prev]);
      toast({ title: 'Assinante adicionado' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar assinante',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeSubscriber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Assinante removido' });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover assinante',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;

      setSubscribers(prev => prev.map(s => 
        s.id === id ? { ...s, is_active } : s
      ));

      toast({ title: is_active ? 'Assinante ativado' : 'Assinante desativado' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar assinante',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const exportCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const csv = [
      'Nome,Email,Data Cadastro',
      ...activeSubscribers.map(s => 
        `"${s.name || ''}","${s.email}","${new Date(s.created_at).toLocaleDateString('pt-BR')}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({ title: 'CSV exportado com sucesso' });
  };

  return {
    subscribers,
    loading,
    totalActive: subscribers.filter(s => s.is_active).length,
    addSubscriber,
    removeSubscriber,
    toggleActive,
    exportCSV,
    refetch: fetchSubscribers,
  };
}
