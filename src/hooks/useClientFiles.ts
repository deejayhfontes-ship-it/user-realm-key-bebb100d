import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClientFile {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  projeto: string;
  data: string;
  tamanho: string;
}

interface EntregaArquivo {
  nome?: string;
  url?: string;
  tipo?: string;
  tamanho?: number;
}

export function useClientFiles() {
  const { profile } = useAuth();

  const { data: files, isLoading } = useQuery({
    queryKey: ['client-files', profile?.client_id],
    queryFn: async () => {
      if (!profile?.client_id) return [];
      
      // Fetch entregas with files for this client
      const { data: entregas, error } = await supabase
        .from('entregas')
        .select('id, arquivos, servico_nome, protocolo, created_at')
        .eq('cliente_id', profile.client_id)
        .not('arquivos', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const allFiles: ClientFile[] = [];
      
      for (const entrega of entregas || []) {
        // arquivos is stored as JSON array
        const arquivos = entrega.arquivos as EntregaArquivo[] | null;
        
        if (Array.isArray(arquivos)) {
          for (const arquivo of arquivos) {
            if (arquivo && arquivo.url) {
              allFiles.push({
                id: `${entrega.id}-${arquivo.nome || 'file'}`,
                nome: arquivo.nome || 'Arquivo',
                url: arquivo.url,
                tipo: arquivo.tipo || 'application/octet-stream',
                projeto: entrega.servico_nome || `Protocolo ${entrega.protocolo}`,
                data: entrega.created_at,
                tamanho: formatFileSize(arquivo.tamanho || 0),
              });
            }
          }
        }
      }
      
      return allFiles;
    },
    enabled: !!profile?.client_id,
  });

  return {
    files: files || [],
    isLoading,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
