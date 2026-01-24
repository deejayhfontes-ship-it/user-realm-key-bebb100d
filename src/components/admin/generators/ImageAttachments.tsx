import { useRef, useCallback } from 'react';
import { Paperclip, X, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  type ImageAttachment,
  validateImageFile,
  compressImage,
  generateId,
} from '@/lib/image-utils';

interface ImageAttachmentsProps {
  attachments: ImageAttachment[];
  onAttachmentsChange: (attachments: ImageAttachment[]) => void;
  maxAttachments?: number;
  disabled?: boolean;
}

export function ImageAttachments({
  attachments,
  onAttachmentsChange,
  maxAttachments = 5,
  disabled = false,
}: ImageAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxAttachments - attachments.length;

      if (remaining <= 0) {
        toast({
          title: 'Limite atingido',
          description: `Máximo de ${maxAttachments} imagens por mensagem.`,
          variant: 'destructive',
        });
        return;
      }

      const filesToProcess = fileArray.slice(0, remaining);

      for (const file of filesToProcess) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast({
            title: 'Arquivo inválido',
            description: validation.error,
            variant: 'destructive',
          });
          continue;
        }

        try {
          const { base64 } = await compressImage(file);
          const preview = URL.createObjectURL(file);

          const newAttachment: ImageAttachment = {
            id: generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            base64,
            preview,
          };

          onAttachmentsChange([...attachments, newAttachment]);
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: 'Erro ao processar imagem',
            description: 'Não foi possível processar a imagem. Tente novamente.',
            variant: 'destructive',
          });
        }
      }
    },
    [attachments, maxAttachments, onAttachmentsChange, toast]
  );

  const handleRemove = (id: string) => {
    const attachment = attachments.find((a) => a.id === id);
    if (attachment) {
      URL.revokeObjectURL(attachment.preview);
    }
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-primary');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary');
    }
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-foreground w-full mb-1">
            <Paperclip className="h-3 w-3" />
            <span>Anexos ({attachments.length}/{maxAttachments})</span>
          </div>
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border"
            >
              <img
                src={att.preview}
                alt={att.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(att.id)}
                className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 truncate">
                {att.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone & Button */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-3 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || attachments.length >= maxAttachments}
        />
        
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || attachments.length >= maxAttachments}
            className="rounded-xl gap-2"
          >
            <Upload className="h-4 w-4" />
            Anexar imagem
          </Button>
          
          <span className="text-xs text-muted-foreground">
            ou arraste aqui
          </span>
        </div>
        
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          JPG, PNG, GIF, WebP • Máx 5MB • {attachments.length}/{maxAttachments}
        </p>
      </div>
    </div>
  );
}
