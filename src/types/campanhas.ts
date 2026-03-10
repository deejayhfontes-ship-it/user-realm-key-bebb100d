// Types para o módulo de Campanhas

export interface Campanha {
    id: string;
    title: string;
    slug: string;
    unit: 'universitario' | 'fasb';
    status: 'active' | 'inactive';
    description: string | null;
    cover_image: string | null;
    drive_folder_id: string | null;
    starts_at: string | null;
    ends_at: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size: string;
    thumbnailLink: string | null;
    webViewLink: string | null;
    webContentLink: string | null;
    iconLink: string | null;
    category: string; // subpasta: logos, fotos, social-media, videos, pdfs
    createdTime: string;
}

export interface DriveCategory {
    name: string;
    label: string;
    icon: string;
    files: DriveFile[];
}

export const CATEGORY_LABELS: Record<string, string> = {
    'logos': 'Logos',
    'fotos': 'Fotos',
    'social-media': 'Social Media',
    'videos': 'Vídeos',
    'pdfs': 'PDFs',
    'outros': 'Outros',
};

export const UNIT_LABELS: Record<string, string> = {
    'universitario': 'Colégio Universitário',
    'fasb': 'FASB',
};
