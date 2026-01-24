import { useRef, useCallback, useState } from 'react';
import { Paperclip, X, Upload, Loader2, AlertTriangle, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  type ImageAttachment,
  validateImageFile,
  compressImage,
  generateId,
  formatFileSize,
} from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ImageAttachmentsProps {
  attachments: ImageAttachment[];
  onAttachmentsChange: (attachments: ImageAttachment[]) => void;
  maxAttachments?: number;
  disabled?: boolean;
  supportsImages?: boolean;
}

export function ImageAttachments({
  attachments,
  onAttachmentsChange,
  maxAttachments = 5,
  disabled = false,
  supportsImages = true,
}: ImageAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<ImageAttachment | null>(null);
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
      const newAttachments: ImageAttachment[] = [];
      
      setIsProcessing(true);
      setProcessProgress(0);

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
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

          newAttachments.push({
            id: generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            base64,
            preview,
          });

          setProcessProgress(((i + 1) / filesToProcess.length) * 100);
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: 'Erro ao processar imagem',
            description: `Não foi possível processar "${file.name}".`,
            variant: 'destructive',
          });
        }
      }

      setIsProcessing(false);
      setProcessProgress(0);
      
      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop zone entirely
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

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

  // Warning if provider doesn't support images but has attachments
  const showWarning = !supportsImages && attachments.length > 0;

  return (
    <div className="space-y-2">
      {/* Warning for unsupported providers */}
      {showWarning && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs">
            Imagens serão ignoradas. Este provedor não aceita imagens.
          </p>
        </div>
      )}

      {/* Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-full mb-2">
            <Paperclip className="h-3.5 w-3.5" />
            <span className="font-medium">Anexos ({attachments.length}/{maxAttachments})</span>
          </div>
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group"
            >
              <div
                onClick={() => setPreviewImage(att)}
                className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border cursor-pointer hover:border-primary/50 transition-colors"
              >
                <img
                  src={att.preview}
                  alt={att.name}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="h-5 w-5 text-white" />
                </div>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(att.id);
                }}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>
              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 rounded-b-xl">
                <p className="text-[9px] text-white truncate font-medium">{att.name}</p>
                <p className="text-[8px] text-white/70">{formatFileSize(att.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="space-y-2 p-3 bg-primary/5 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processando imagens...</span>
          </div>
          <Progress value={processProgress} className="h-1.5" />
        </div>
      )}

      {/* Drop Zone & Button */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/20 hover:border-muted-foreground/40",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="text-center">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-medium text-primary">Solte as imagens aqui</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || attachments.length >= maxAttachments || isProcessing}
        />
        
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || attachments.length >= maxAttachments || isProcessing}
            className="rounded-xl gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
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

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">
          {previewImage && (
            <div className="relative">
              <img
                src={previewImage.preview}
                alt={previewImage.name}
                className="w-full h-auto max-h-[80vh] object-contain bg-black/5"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-medium">{previewImage.name}</p>
                <p className="text-white/70 text-sm">{formatFileSize(previewImage.size)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
