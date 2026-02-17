<<<<<<< HEAD
// Interface do entregável
export interface OrderDeliverable {
    id: string;
    pedido_id: string;
    file_url: string;
    file_name: string;
    file_type: string | null;
    file_size: number | null;
    delivered_at: string;
    downloaded_at: string | null;
    expires_at: string | null;
    is_final: boolean;
    created_at: string;
}

// Helper para verificar se expirou
export function isDeliverableExpired(deliverable: OrderDeliverable): boolean {
    if (!deliverable.expires_at) return false;
    return new Date(deliverable.expires_at) < new Date();
}
=======
// Interface do entregável
export interface OrderDeliverable {
    id: string;
    pedido_id: string;
    file_url: string;
    file_name: string;
    file_type: string | null;
    file_size: number | null;
    delivered_at: string;
    downloaded_at: string | null;
    expires_at: string | null;
    is_final: boolean;
    created_at: string;
}

// Helper para verificar se expirou
export function isDeliverableExpired(deliverable: OrderDeliverable): boolean {
    if (!deliverable.expires_at) return false;
    return new Date(deliverable.expires_at) < new Date();
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
