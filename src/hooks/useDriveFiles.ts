import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DriveFile, DriveCategory, CATEGORY_LABELS } from '@/types/campanhas';

interface UseDriveFilesResult {
    categories: Record<string, DriveFile[]>;
    isLoading: boolean;
    error: string | null;
    fetchFiles: (folderId: string) => Promise<void>;
    totalFiles: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const cache = new Map<string, { data: Record<string, DriveFile[]>; fetchedAt: number }>();

export function useDriveFiles(): UseDriveFilesResult {
    const [categories, setCategories] = useState<Record<string, DriveFile[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async (folderId: string) => {
        if (!folderId) {
            setError('Nenhum folder_id fornecido');
            return;
        }

        // Check cache
        const cached = cache.get(folderId);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
            setCategories(cached.data);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke('drive-files', {
                body: { folder_id: folderId },
            });

            if (fnError) throw fnError;
            if (data?.error) throw new Error(data.error);

            const cats = data?.categories || {};
            setCategories(cats);
            cache.set(folderId, { data: cats, fetchedAt: Date.now() });
        } catch (err: any) {
            console.error('[useDriveFiles] Error:', err);
            setError(err.message || 'Erro ao carregar arquivos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const totalFiles = Object.values(categories).reduce((sum, files) => sum + files.length, 0);

    return { categories, isLoading, error, fetchFiles, totalFiles };
}
