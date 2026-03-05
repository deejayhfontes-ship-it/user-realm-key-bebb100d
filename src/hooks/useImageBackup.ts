/**
 * useImageBackup — Hook para backup automático de imagens geradas no HostGator
 * 
 * Envia uma cópia de cada imagem gerada para o servidor HostGator em background,
 * usando uma Edge Function do Supabase como proxy (bypass ModSecurity).
 * Non-blocking: não interrompe o fluxo do usuário em caso de falha.
 */

const PROXY_URL = 'https://nzngwbknezmfthbyfjmx.supabase.co/functions/v1/backup-proxy';

interface BackupMetadata {
    generator_type: string;   // ex: 'prefeitura_arte', 'designer_futuro', 'edital_decretos'
    prompt?: string;
    filename?: string;
    original_url?: string;
}

/**
 * Converte um Blob para base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || result;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Converte uma data:URI string para base64 puro
 */
function dataUriToBase64(dataUri: string): string {
    return dataUri.split(',')[1] || dataUri;
}

/**
 * Extrai a extensão de um blob/mime type
 */
function getExtension(blob: Blob): string {
    const mimeMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
    };
    return mimeMap[blob.type] || 'png';
}

/**
 * Envia imagem para backup no HostGator via proxy Supabase (fire-and-forget)
 * Aceita Blob OU data:URI string
 */
export async function backupImageToHostGator(
    imageData: Blob | string,
    metadata: BackupMetadata
): Promise<void> {
    try {
        let base64: string;
        let extension: string;

        if (imageData instanceof Blob) {
            base64 = await blobToBase64(imageData);
            extension = getExtension(imageData);
        } else {
            base64 = dataUriToBase64(imageData);
            const mimeMatch = imageData.match(/^data:image\/(\w+)/);
            extension = mimeMatch ? mimeMatch[1] : 'png';
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = metadata.filename || `${metadata.generator_type}_${timestamp}`;

        const payload = {
            image_base64: base64,
            extension,
            filename,
            generator_type: metadata.generator_type,
            prompt: metadata.prompt || '',
            original_url: metadata.original_url || '',
        };

        // Fire-and-forget via proxy Supabase
        fetch(`${PROXY_URL}?action=upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    console.log('[BACKUP] ✅ Imagem salva:', data.url || data.filename || 'ok');
                } else {
                    const text = await res.text();
                    console.warn('[BACKUP] ⚠️ Falha HTTP:', res.status, text.substring(0, 200));
                }
            })
            .catch((err) => {
                console.warn('[BACKUP] ⚠️ Erro no backup (não crítico):', err.message);
            });

    } catch (err: unknown) {
        console.warn('[BACKUP] ⚠️ Erro ao preparar backup:', err instanceof Error ? err.message : err);
    }
}

/**
 * Hook para facilitar o uso em componentes React
 */
export function useImageBackup() {
    return { backupImageToHostGator };
}
