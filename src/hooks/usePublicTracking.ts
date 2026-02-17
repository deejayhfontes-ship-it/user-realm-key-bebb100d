<<<<<<< HEAD
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Pedido } from '@/types/pedido';
import type { OrderActivity } from '@/hooks/useOrderActivityLog';
import type { OrderDeliverable } from '@/types/order-deliverable';

// Dados do tracking público
export interface PublicTrackingData {
    pedido: {
        protocolo: string;
        status: string;
        nome: string;
        servico: string | null;
        data_briefing: string;
        data_entrega: string | null;
        prazo_final: string | null;
        nps_score: number | null;
    };
    timeline: Array<{
        action: string;
        created_at: string;
    }>;
    deliverables: Array<{
        file_name: string;
        file_type: string | null;
        delivered_at: string;
        expires_at: string | null;
        is_final: boolean;
        download_url?: string;
    }>;
}

// Status para exibição pública (não expõe detalhes internos)
export const PUBLIC_STATUS_MAP: Record<string, { label: string; step: number; color: string }> = {
    briefing: { label: 'Briefing Recebido', step: 1, color: '#3B82F6' },
    orcamento_enviado: { label: 'Orçamento Enviado', step: 2, color: '#F59E0B' },
    orcamento_aprovado: { label: 'Orçamento Aprovado', step: 2, color: '#10B981' },
    aguardando_pagamento: { label: 'Aguardando Pagamento', step: 3, color: '#F97316' },
    pagamento_confirmado: { label: 'Pagamento Confirmado', step: 3, color: '#10B981' },
    em_confeccao: { label: 'Em Produção', step: 4, color: '#8B5CF6' },
    aguardando_aprovacao_cliente: { label: 'Aguardando sua Aprovação', step: 5, color: '#06B6D4' },
    em_ajustes: { label: 'Em Ajustes', step: 4, color: '#F59E0B' },
    aguardando_pagamento_final: { label: 'Aguardando Pagamento Final', step: 5, color: '#F97316' },
    finalizado: { label: 'Finalizado ✅', step: 6, color: '#10B981' },
    cancelado: { label: 'Cancelado', step: 0, color: '#EF4444' },
    recusado: { label: 'Recusado', step: 0, color: '#EF4444' },
};

const TOTAL_STEPS = 6;

// Hook para tracking público (sem autenticação)
export function usePublicTracking(protocolo: string | undefined) {
    return useQuery({
        queryKey: ['public-tracking', protocolo],
        queryFn: async (): Promise<PublicTrackingData | null> => {
            if (!protocolo) return null;

            // Buscar pedido pelo protocolo (campo público)
            const { data: pedido, error: pedidoError } = await supabase
                .from('pedidos')
                .select('id, protocolo, status, nome, data_briefing, data_entrega, prazo_final, nps_score, services(title)')
                .eq('protocolo', protocolo)
                .single();

            if (pedidoError || !pedido) return null;

            // Buscar timeline (só ações públicas)
            const publicActions = [
                'order_created', 'quote_sent', 'quote_approved', 'payment_confirmed',
                'production_started', 'revision_requested', 'revision_completed',
                'partial_deliverable_added', 'final_deliverable_added', 'status_changed',
            ];

            const { data: timeline } = await supabase
                .from('order_activity_logs')
                .select('action, created_at')
                .eq('pedido_id', pedido.id)
                .in('action', publicActions)
                .order('created_at', { ascending: true });

            // Buscar entregáveis não expirados
            const { data: deliverables } = await supabase
                .from('order_deliverables')
                .select('file_name, file_type, delivered_at, expires_at, is_final')
                .eq('pedido_id', pedido.id)
                .gt('expires_at', new Date().toISOString())
                .order('delivered_at', { ascending: false });

            return {
                pedido: {
                    protocolo: pedido.protocolo,
                    status: pedido.status,
                    nome: pedido.nome,
                    servico: (pedido.services as { title: string } | null)?.title || null,
                    data_briefing: pedido.data_briefing,
                    data_entrega: pedido.data_entrega,
                    prazo_final: pedido.prazo_final,
                    nps_score: pedido.nps_score,
                },
                timeline: (timeline || []).map(t => ({
                    action: t.action,
                    created_at: t.created_at,
                })),
                deliverables: (deliverables || []).map(d => ({
                    file_name: d.file_name,
                    file_type: d.file_type,
                    delivered_at: d.delivered_at,
                    expires_at: d.expires_at,
                    is_final: d.is_final,
                })),
            };
        },
        enabled: !!protocolo,
        staleTime: 30000, // Cache por 30s
    });
}

// Helper para calcular progresso
export function getTrackingProgress(status: string): { step: number; total: number; percentage: number } {
    const info = PUBLIC_STATUS_MAP[status];
    const step = info?.step || 0;
    return {
        step,
        total: TOTAL_STEPS,
        percentage: Math.round((step / TOTAL_STEPS) * 100),
    };
}
=======
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Pedido } from '@/types/pedido';
import type { OrderActivity } from '@/hooks/useOrderActivityLog';
import type { OrderDeliverable } from '@/types/order-deliverable';

// Dados do tracking público
export interface PublicTrackingData {
    pedido: {
        protocolo: string;
        status: string;
        nome: string;
        servico: string | null;
        data_briefing: string;
        data_entrega: string | null;
        prazo_final: string | null;
        nps_score: number | null;
    };
    timeline: Array<{
        action: string;
        created_at: string;
    }>;
    deliverables: Array<{
        file_name: string;
        file_type: string | null;
        delivered_at: string;
        expires_at: string | null;
        is_final: boolean;
        download_url?: string;
    }>;
}

// Status para exibição pública (não expõe detalhes internos)
export const PUBLIC_STATUS_MAP: Record<string, { label: string; step: number; color: string }> = {
    briefing: { label: 'Briefing Recebido', step: 1, color: '#3B82F6' },
    orcamento_enviado: { label: 'Orçamento Enviado', step: 2, color: '#F59E0B' },
    orcamento_aprovado: { label: 'Orçamento Aprovado', step: 2, color: '#10B981' },
    aguardando_pagamento: { label: 'Aguardando Pagamento', step: 3, color: '#F97316' },
    pagamento_confirmado: { label: 'Pagamento Confirmado', step: 3, color: '#10B981' },
    em_confeccao: { label: 'Em Produção', step: 4, color: '#8B5CF6' },
    aguardando_aprovacao_cliente: { label: 'Aguardando sua Aprovação', step: 5, color: '#06B6D4' },
    em_ajustes: { label: 'Em Ajustes', step: 4, color: '#F59E0B' },
    aguardando_pagamento_final: { label: 'Aguardando Pagamento Final', step: 5, color: '#F97316' },
    finalizado: { label: 'Finalizado ✅', step: 6, color: '#10B981' },
    cancelado: { label: 'Cancelado', step: 0, color: '#EF4444' },
    recusado: { label: 'Recusado', step: 0, color: '#EF4444' },
};

const TOTAL_STEPS = 6;

// Hook para tracking público (sem autenticação)
export function usePublicTracking(protocolo: string | undefined) {
    return useQuery({
        queryKey: ['public-tracking', protocolo],
        queryFn: async (): Promise<PublicTrackingData | null> => {
            if (!protocolo) return null;

            // Buscar pedido pelo protocolo (campo público)
            const { data: pedido, error: pedidoError } = await supabase
                .from('pedidos')
                .select('id, protocolo, status, nome, data_briefing, data_entrega, prazo_final, nps_score, services(title)')
                .eq('protocolo', protocolo)
                .single();

            if (pedidoError || !pedido) return null;

            // Buscar timeline (só ações públicas)
            const publicActions = [
                'order_created', 'quote_sent', 'quote_approved', 'payment_confirmed',
                'production_started', 'revision_requested', 'revision_completed',
                'partial_deliverable_added', 'final_deliverable_added', 'status_changed',
            ];

            const { data: timeline } = await supabase
                .from('order_activity_logs')
                .select('action, created_at')
                .eq('pedido_id', pedido.id)
                .in('action', publicActions)
                .order('created_at', { ascending: true });

            // Buscar entregáveis não expirados
            const { data: deliverables } = await supabase
                .from('order_deliverables')
                .select('file_name, file_type, delivered_at, expires_at, is_final')
                .eq('pedido_id', pedido.id)
                .gt('expires_at', new Date().toISOString())
                .order('delivered_at', { ascending: false });

            return {
                pedido: {
                    protocolo: pedido.protocolo,
                    status: pedido.status,
                    nome: pedido.nome,
                    servico: (pedido.services as { title: string } | null)?.title || null,
                    data_briefing: pedido.data_briefing,
                    data_entrega: pedido.data_entrega,
                    prazo_final: pedido.prazo_final,
                    nps_score: pedido.nps_score,
                },
                timeline: (timeline || []).map(t => ({
                    action: t.action,
                    created_at: t.created_at,
                })),
                deliverables: (deliverables || []).map(d => ({
                    file_name: d.file_name,
                    file_type: d.file_type,
                    delivered_at: d.delivered_at,
                    expires_at: d.expires_at,
                    is_final: d.is_final,
                })),
            };
        },
        enabled: !!protocolo,
        staleTime: 30000, // Cache por 30s
    });
}

// Helper para calcular progresso
export function getTrackingProgress(status: string): { step: number; total: number; percentage: number } {
    const info = PUBLIC_STATUS_MAP[status];
    const step = info?.step || 0;
    return {
        step,
        total: TOTAL_STEPS,
        percentage: Math.round((step / TOTAL_STEPS) * 100),
    };
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
