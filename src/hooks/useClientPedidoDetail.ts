import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OrderRevision } from '@/types/order-revision';
import type { OrderDeliverable } from '@/types/order-deliverable';
import type { PaymentInstallment } from '@/types/payment-installment';
import { toast } from 'sonner';

export function useClientPedidoDetail(pedidoId: string | null) {
    const queryClient = useQueryClient();

    const revisions = useQuery({
        queryKey: ['client-revisions', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_revisions')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('revision_number', { ascending: true });
            if (error) throw error;
            return (data || []) as OrderRevision[];
        },
        enabled: !!pedidoId,
    });

    const deliverables = useQuery({
        queryKey: ['client-deliverables', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('order_deliverables')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []) as OrderDeliverable[];
        },
        enabled: !!pedidoId,
    });

    const installments = useQuery({
        queryKey: ['client-installments', pedidoId],
        queryFn: async () => {
            if (!pedidoId) return [];
            const { data, error } = await supabase
                .from('payment_installments')
                .select('*')
                .eq('pedido_id', pedidoId)
                .order('installment_number', { ascending: true });
            if (error) throw error;
            return (data || []) as PaymentInstallment[];
        },
        enabled: !!pedidoId,
    });

    // Buscar config Pix (público, para exibir chave ao cliente)
    const pixConfig = useQuery({
        queryKey: ['client-pix-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pix_configs')
                .select('pix_key, merchant_name, merchant_city')
                .eq('enabled', true)
                .limit(1)
                .maybeSingle();
            if (error) return null;
            return data as { pix_key: string; merchant_name: string; merchant_city: string } | null;
        },
    });

    const markDownloaded = async (deliverableId: string) => {
        await supabase
            .from('order_deliverables')
            .update({ downloaded_at: new Date().toISOString() })
            .eq('id', deliverableId);
        deliverables.refetch();
    };

    // Marcar parcela como "awaiting_confirmation" (cliente clicou "Já paguei")
    const markPaymentDone = useMutation({
        mutationFn: async (installmentId: string) => {
            const { error } = await supabase
                .from('payment_installments')
                .update({ status: 'awaiting_confirmation' as any, updated_at: new Date().toISOString() })
                .eq('id', installmentId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-installments', pedidoId] });
            toast.success('Pagamento informado! Aguardando confirmação do admin.');
        },
        onError: () => {
            toast.error('Erro ao registrar pagamento.');
        },
    });

    // Upload de comprovante de pagamento
    const uploadComprovante = useMutation({
        mutationFn: async ({ installmentId, file }: { installmentId: string; file: File }) => {
            const ext = file.name.split('.').pop() || 'png';
            const path = `comprovantes/${pedidoId}/${installmentId}_${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('comprovantes')
                .upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('comprovantes')
                .getPublicUrl(path);

            const { error: updateError } = await supabase
                .from('payment_installments')
                .update({ comprovante_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('id', installmentId);
            if (updateError) throw updateError;

            return publicUrl;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-installments', pedidoId] });
            toast.success('Comprovante enviado com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao enviar comprovante.');
        },
    });

    return {
        revisions: revisions.data || [],
        deliverables: deliverables.data || [],
        installments: installments.data || [],
        pixConfig: pixConfig.data || null,
        isLoading: revisions.isLoading || deliverables.isLoading || installments.isLoading,
        markDownloaded,
        markPaymentDone: markPaymentDone.mutate,
        isMarkingPayment: markPaymentDone.isPending,
        uploadComprovante: uploadComprovante.mutate,
        isUploadingComprovante: uploadComprovante.isPending,
    };
}
