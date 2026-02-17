import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ContactMessage, ContactMessageStatus } from '@/types/cms';

export function useContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(msg => ({
        ...msg,
        status: msg.status as ContactMessageStatus
      })) as ContactMessage[];
      
      setMessages(typedData);
      setNewCount(typedData.filter(m => m.status === 'new').length);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar mensagens',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateStatus = async (id: string, status: ContactMessageStatus) => {
    try {
      const updateData: any = { status };
      if (status === 'read' || status === 'replied') {
        updateData.read_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, ...updateData } : m
      ));
      setNewCount(prev => status === 'new' ? prev : Math.max(0, prev - 1));

      toast({ title: 'Status atualizado' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateNotes = async (id: string, admin_notes: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_notes })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === id ? { ...m, admin_notes } : m
      ));

      toast({ title: 'Anotações salvas' });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar anotações',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const deleted = messages.find(m => m.id === id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (deleted?.status === 'new') {
        setNewCount(prev => Math.max(0, prev - 1));
      }

      toast({ title: 'Mensagem excluída' });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir mensagem',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    loading,
    newCount,
    updateStatus,
    updateNotes,
    deleteMessage,
    refetch: fetchMessages,
  };
}
