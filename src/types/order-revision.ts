// Status de revisão
export type RevisionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

// Quem solicitou
export type RevisionRequestedBy = 'client' | 'admin';

// Interface da revisão
export interface OrderRevision {
    id: string;
    pedido_id: string;
    revision_number: number;
    requested_by: RevisionRequestedBy;
    description: string;
    files: Array<{ nome: string; url: string; tipo?: string }>;
    status: RevisionStatus;
    admin_response: string | null;
    is_extra: boolean;
    extra_cost: number;
    created_at: string;
    resolved_at: string | null;
}

// Labels para status
export const REVISION_STATUS_LABELS: Record<RevisionStatus, string> = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluída',
    rejected: 'Rejeitada',
};

// Cores para status
export const REVISION_STATUS_COLORS: Record<RevisionStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
};
