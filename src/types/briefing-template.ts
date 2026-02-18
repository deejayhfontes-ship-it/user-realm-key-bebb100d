// Tipos de campo suportados
export type BriefingFieldType =
    | 'text'
    | 'textarea'
    | 'select'
    | 'color_picker'
    | 'file_upload'
    | 'checkbox'
    | 'number'
    | 'date'
    | 'url';

// Schema de um campo do briefing
export interface BriefingFieldSchema {
    key: string;
    label: string;
    type: BriefingFieldType;
    required: boolean;
    placeholder?: string;
    description?: string;
    options?: string[]; // Para tipo 'select'
    max?: number; // Para file_upload (max arquivos) ou number (max valor)
    min?: number; // Para number (min valor)
}

// Schema completo do briefing
export interface BriefingSchemaJson {
    fields: BriefingFieldSchema[];
}

// Interface do template de briefing
export interface BriefingTemplate {
    id: string;
    service_id: string | null;
    name: string;
    description: string | null;
    schema_json: BriefingSchemaJson;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    // Relações (joins)
    services?: {
        id: string;
        title: string;
        icon: string | null;
    };
}
