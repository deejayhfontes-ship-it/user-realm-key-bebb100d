import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { z } from 'zod';

// Schema for validating config.json from ZIP
const generatorConfigSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  version: z.string().default('1.0.0'),
  description: z.string().optional(),
  author: z.string().optional(),
  icon: z.string().optional(),
  type: z.string().default('custom'),
  credits_per_use: z.number().default(1),
  dimensions: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  features: z.object({
    upload: z.boolean().optional(),
    text_fields: z.array(z.string()).optional(),
    preview: z.boolean().optional(),
    output_format: z.enum(['png', 'jpg', 'zip']).optional()
  }).optional(),
  form_fields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    label: z.string(),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
    default: z.any().optional(),
    accept: z.string().optional()
  })).optional()
});

export type GeneratorConfig = z.infer<typeof generatorConfigSchema>;

export interface InstallResult {
  success: boolean;
  generator: GeneratorConfig;
  message: string;
}

// Parse and validate ZIP file
async function parseGeneratorZip(file: File): Promise<{ config: GeneratorConfig; files: Record<string, Blob> }> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  // Find config.json (might be in root or in a subfolder)
  let configFile: JSZip.JSZipObject | null = null;
  let basePath = '';
  
  for (const [path, zipEntry] of Object.entries(contents.files)) {
    if (path.endsWith('config.json') && !zipEntry.dir) {
      configFile = zipEntry;
      basePath = path.replace('config.json', '');
      break;
    }
  }
  
  if (!configFile) {
    throw new Error('config.json não encontrado no ZIP');
  }
  
  const configText = await configFile.async('text');
  let configJson;
  
  try {
    configJson = JSON.parse(configText);
  } catch {
    throw new Error('config.json inválido - não é um JSON válido');
  }
  
  // Validate config
  const result = generatorConfigSchema.safeParse(configJson);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`config.json inválido: ${errors}`);
  }
  
  // Extract all files
  const files: Record<string, Blob> = {};
  for (const [path, zipEntry] of Object.entries(contents.files)) {
    if (!zipEntry.dir && path.startsWith(basePath)) {
      const relativePath = path.replace(basePath, '');
      const blob = await zipEntry.async('blob');
      files[relativePath] = blob;
    }
  }
  
  return { config: result.data, files };
}

// Fetch ZIP from URL
async function fetchZipFromUrl(url: string, token?: string): Promise<File> {
  const headers: HeadersInit = {};
  
  // Handle GitHub URLs
  if (url.includes('github.com')) {
    // Convert github.com URL to raw.githubusercontent.com if needed
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:blob\/)?([^/]+)\/(.+)/);
    if (match) {
      const [, owner, repo, branch, path] = match;
      url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    }
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Falha ao baixar: ${response.status} ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const filename = url.split('/').pop() || 'generator.zip';
  
  return new File([blob], filename, { type: 'application/zip' });
}

export function useInstallGenerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      method: 'upload' | 'url';
      file?: File;
      url?: string;
      token?: string;
    }): Promise<InstallResult> => {
      let zipFile: File;
      
      // 1. Get ZIP file
      if (params.method === 'upload') {
        if (!params.file) throw new Error('Arquivo não fornecido');
        zipFile = params.file;
      } else {
        if (!params.url) throw new Error('URL não fornecida');
        zipFile = await fetchZipFromUrl(params.url, params.token);
      }
      
      // 2. Validate file size (50MB max)
      if (zipFile.size > 52428800) {
        throw new Error('Arquivo muito grande. Máximo: 50MB');
      }
      
      // 3. Parse and validate ZIP
      const { config, files } = await parseGeneratorZip(zipFile);
      
      // 4. Check if generator already exists
      const { data: existing } = await supabase
        .from('generators')
        .select('id')
        .eq('slug', config.id)
        .maybeSingle();
      
      if (existing) {
        throw new Error(`Gerador "${config.name}" (${config.id}) já está instalado`);
      }
      
      // 5. Upload ZIP to storage
      const zipPath = `${config.id}/${config.id}-v${config.version}.zip`;
      const { error: uploadError } = await supabase.storage
        .from('generators')
        .upload(zipPath, zipFile, {
          contentType: 'application/zip',
          upsert: false
        });
      
      if (uploadError) {
        throw new Error(`Erro ao salvar arquivo: ${uploadError.message}`);
      }
      
      // 6. Upload config.json separately for easy access
      const configBlob = files['config.json'];
      if (configBlob) {
        await supabase.storage
          .from('generators')
          .upload(`${config.id}/config.json`, configBlob, {
            contentType: 'application/json',
            upsert: true
          });
      }
      
      // 7. Create generator record in database
      const generatorData = {
        name: config.name,
        slug: config.id,
        type: config.type || 'custom',
        description: config.description || null,
        status: 'ready',
        config: config as unknown as Record<string, never>,
        installed_via: params.method,
        zip_file_path: zipPath
      };
      
      const { error: insertError } = await supabase
        .from('generators')
        .insert(generatorData);
      
      if (insertError) {
        // Rollback: delete uploaded files
        await supabase.storage.from('generators').remove([zipPath]);
        throw new Error(`Erro ao registrar gerador: ${insertError.message}`);
      }
      
      // 8. Audit log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'generator_installed',
        entity_type: 'generator',
        new_data: { 
          generator_id: config.id, 
          method: params.method,
          version: config.version
        }
      });
      
      return {
        success: true,
        generator: config,
        message: `Gerador "${config.name}" instalado com sucesso!`
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['generators-list'] });
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      toast({
        title: 'Gerador instalado!',
        description: result.message
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na instalação',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useRemoveGenerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (generatorId: string) => {
      // 1. Get generator info
      const { data: generator, error: fetchError } = await supabase
        .from('generators')
        .select('id, slug, zip_file_path')
        .eq('id', generatorId)
        .single();
      
      if (fetchError || !generator) {
        throw new Error('Gerador não encontrado');
      }
      
      // 2. Delete from storage if has ZIP
      if (generator.zip_file_path) {
        await supabase.storage
          .from('generators')
          .remove([generator.zip_file_path]);
        
        // Also try to remove the folder
        const folder = generator.zip_file_path.split('/')[0];
        const { data: folderContents } = await supabase.storage
          .from('generators')
          .list(folder);
        
        if (folderContents && folderContents.length > 0) {
          const filesToDelete = folderContents.map(f => `${folder}/${f.name}`);
          await supabase.storage.from('generators').remove(filesToDelete);
        }
      }
      
      // 3. Delete from database
      const { error: deleteError } = await supabase
        .from('generators')
        .delete()
        .eq('id', generatorId);
      
      if (deleteError) {
        throw new Error(`Erro ao remover: ${deleteError.message}`);
      }
      
      // 4. Audit log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'generator_removed',
        entity_type: 'generator',
        entity_id: generatorId,
        old_data: { slug: generator.slug }
      });
      
      return generator.slug;
    },
    onSuccess: (slug) => {
      queryClient.invalidateQueries({ queryKey: ['generators-list'] });
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      toast({
        title: 'Gerador removido',
        description: `O gerador "${slug}" foi desinstalado.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
