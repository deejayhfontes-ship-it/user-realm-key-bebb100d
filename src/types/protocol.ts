<<<<<<< HEAD
// Tipos de protocolo
export type ProtocolType = 'CLIENTE' | 'PREFEITURA';

// Status possíveis do protocolo
export type ProtocolStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'IN_PRODUCTION'
    | 'READY_FOR_PICKUP'
    | 'DELIVERED'
    | 'REJECTED'
    | 'CANCELED';

// Interface do protocolo
export interface Protocol {
    protocol_code: string;
    type: ProtocolType;
    display_name: string;
    customer_email: string | null;
    status: ProtocolStatus;
    drive_folder_id: string | null;
    drive_folder_url: string | null;
    delivery_link_enabled: boolean;
    pedido_id: string | null;
    created_at: string;
    updated_at: string;
}

// Ações do Drive
export type DriveActionType =
    | 'CREATE_FOLDER'
    | 'ENABLE_DELIVERY'
    | 'DELETE_FOLDER'
    | 'SHARE_EMAIL'
    | 'DISABLE_DELIVERY';

// Log de ação do Drive
export interface DriveAction {
    id: string;
    protocol_code: string;
    action: DriveActionType;
    by_user: string | null;
    success: boolean;
    payload_json: Record<string, unknown> | null;
    error_message: string | null;
    created_at: string;
}

// Labels para status
export const PROTOCOL_STATUS_LABELS: Record<ProtocolStatus, string> = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Enviado',
    APPROVED: 'Aprovado',
    IN_PRODUCTION: 'Em Produção',
    READY_FOR_PICKUP: 'Pronto para Entrega',
    DELIVERED: 'Entregue',
    REJECTED: 'Rejeitado',
    CANCELED: 'Cancelado',
};

// Cores para status
export const PROTOCOL_STATUS_COLORS: Record<ProtocolStatus, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-400',
    SUBMITTED: 'bg-blue-500/20 text-blue-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    IN_PRODUCTION: 'bg-purple-500/20 text-purple-400',
    READY_FOR_PICKUP: 'bg-cyan-500/20 text-cyan-400',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    CANCELED: 'bg-red-500/20 text-red-400',
};

// Labels para tipo
export const PROTOCOL_TYPE_LABELS: Record<ProtocolType, string> = {
    CLIENTE: 'Cliente',
    PREFEITURA: 'Prefeitura',
};
=======
// Tipos de protocolo
export type ProtocolType = 'CLIENTE' | 'PREFEITURA';

// Status possíveis do protocolo
export type ProtocolStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'IN_PRODUCTION'
    | 'READY_FOR_PICKUP'
    | 'DELIVERED'
    | 'REJECTED'
    | 'CANCELED';

// Interface do protocolo
export interface Protocol {
    protocol_code: string;
    type: ProtocolType;
    display_name: string;
    customer_email: string | null;
    status: ProtocolStatus;
    drive_folder_id: string | null;
    drive_folder_url: string | null;
    delivery_link_enabled: boolean;
    pedido_id: string | null;
    created_at: string;
    updated_at: string;
}

// Ações do Drive
export type DriveActionType =
    | 'CREATE_FOLDER'
    | 'ENABLE_DELIVERY'
    | 'DELETE_FOLDER'
    | 'SHARE_EMAIL'
    | 'DISABLE_DELIVERY';

// Log de ação do Drive
export interface DriveAction {
    id: string;
    protocol_code: string;
    action: DriveActionType;
    by_user: string | null;
    success: boolean;
    payload_json: Record<string, unknown> | null;
    error_message: string | null;
    created_at: string;
}

// Labels para status
export const PROTOCOL_STATUS_LABELS: Record<ProtocolStatus, string> = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Enviado',
    APPROVED: 'Aprovado',
    IN_PRODUCTION: 'Em Produção',
    READY_FOR_PICKUP: 'Pronto para Entrega',
    DELIVERED: 'Entregue',
    REJECTED: 'Rejeitado',
    CANCELED: 'Cancelado',
};

// Cores para status
export const PROTOCOL_STATUS_COLORS: Record<ProtocolStatus, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-400',
    SUBMITTED: 'bg-blue-500/20 text-blue-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    IN_PRODUCTION: 'bg-purple-500/20 text-purple-400',
    READY_FOR_PICKUP: 'bg-cyan-500/20 text-cyan-400',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    CANCELED: 'bg-red-500/20 text-red-400',
};

// Labels para tipo
export const PROTOCOL_TYPE_LABELS: Record<ProtocolType, string> = {
    CLIENTE: 'Cliente',
    PREFEITURA: 'Prefeitura',
};
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
