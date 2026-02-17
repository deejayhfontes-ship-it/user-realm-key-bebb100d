import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InvoiceData, InvoiceRow, InvoiceItem, PixConfig, WiseConfig } from '@/types/invoice';
import { generatePixCode } from '@/lib/pix-generator';

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        ...row,
        items: row.items as InvoiceItem[],
        pix_config: row.pix_config as PixConfig | null,
        wise_config: row.wise_config as WiseConfig | null,
      })) as InvoiceRow[];
    },
  });

  const generateInvoiceNumber = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('generate_invoice_number');
      if (error) throw error;
      return data as string;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: InvoiceData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
      const discountAmount = invoice.discount || 0;
      const taxAmount = ((subtotal - discountAmount) * (invoice.taxRate || 0)) / 100;
      const total = Math.round((subtotal - discountAmount + taxAmount) * 100); // Convert to cents

      // Generate PIX code if enabled
      let pixCode: string | null = null;
      let pixTxid: string | null = null;
      
      if (invoice.pix?.enabled && invoice.pix?.pixKey && invoice.pix?.merchantName && invoice.pix?.merchantCity) {
        pixTxid = `INV${invoice.invoiceNumber}`;
        pixCode = generatePixCode({
          pixKey: invoice.pix.pixKey,
          merchantName: invoice.pix.merchantName,
          merchantCity: invoice.pix.merchantCity,
          amount: (total / 100) > 0 ? (total / 100) : undefined,
          transactionId: pixTxid,
          description: `Fatura ${invoice.invoiceNumber}`,
        });
      }

      const insertData = {
        invoice_number: invoice.invoiceNumber,
        bill_to_name: invoice.billTo.name,
        bill_to_company: invoice.billTo.company || null,
        bill_to_address: invoice.billTo.address || null,
        bill_to_email: invoice.billTo.email || null,
        ship_to_name: invoice.shipTo.name,
        ship_to_event: invoice.shipTo.event || null,
        ship_to_location: invoice.shipTo.location || null,
        ship_to_phone: invoice.shipTo.phone || null,
        ship_to_email: invoice.shipTo.email || null,
        date: invoice.date,
        due_date: invoice.dueDate || null,
        items: invoice.items as unknown as any,
        discount: Math.round((invoice.discount || 0) * 100),
        tax_rate: invoice.taxRate || 0,
        total,
        notes: invoice.notes || null,
        pix_config: invoice.pix?.enabled ? invoice.pix as unknown as any : null,
        wise_config: invoice.wise?.enabled ? invoice.wise as unknown as any : null,
        pix_code: pixCode,
        pix_txid: pixTxid,
        pix_generated_at: pixCode ? new Date().toISOString() : null,
        status: 'pending' as const,
        created_by: user?.id || null,
      };

      const { data, error } = await supabase.from('invoices').insert(insertData).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar fatura:', error);
      toast.error('Erro ao criar fatura');
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, invoice }: { id: string; invoice: Partial<InvoiceData> }) => {
      const updateData: any = {};
      
      if (invoice.billTo) {
        updateData.bill_to_name = invoice.billTo.name;
        updateData.bill_to_company = invoice.billTo.company || null;
        updateData.bill_to_address = invoice.billTo.address || null;
        updateData.bill_to_email = invoice.billTo.email || null;
      }
      if (invoice.shipTo) {
        updateData.ship_to_name = invoice.shipTo.name;
        updateData.ship_to_event = invoice.shipTo.event || null;
        updateData.ship_to_location = invoice.shipTo.location || null;
        updateData.ship_to_phone = invoice.shipTo.phone || null;
        updateData.ship_to_email = invoice.shipTo.email || null;
      }
      if (invoice.items) {
        updateData.items = invoice.items as unknown as any;
        const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const discountAmount = invoice.discount || 0;
        const taxAmount = ((subtotal - discountAmount) * (invoice.taxRate || 0)) / 100;
        updateData.total = Math.round((subtotal - discountAmount + taxAmount) * 100);
      }
      if (invoice.date) updateData.date = invoice.date;
      if (invoice.dueDate !== undefined) updateData.due_date = invoice.dueDate || null;
      if (invoice.discount !== undefined) updateData.discount = Math.round((invoice.discount || 0) * 100);
      if (invoice.taxRate !== undefined) updateData.tax_rate = invoice.taxRate;
      if (invoice.notes !== undefined) updateData.notes = invoice.notes || null;
      if (invoice.pix) updateData.pix_config = invoice.pix.enabled ? invoice.pix : null;
      if (invoice.wise) updateData.wise_config = invoice.wise.enabled ? invoice.wise : null;
      if (invoice.status) updateData.status = invoice.status;

      const { error } = await supabase.from('invoices').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar fatura:', error);
      toast.error('Erro ao atualizar fatura');
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura removida!');
    },
    onError: (error) => {
      console.error('Erro ao remover fatura:', error);
      toast.error('Erro ao remover fatura');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'paid' | 'overdue' | 'cancelled' }) => {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  return {
    invoices,
    isLoading,
    generateInvoiceNumber,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateStatus,
  };
}
