import { useRef, useCallback, useState } from 'react';
import { Paperclip, X, Loader2, Trash2, Send, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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

interface MinimalImageChatProps {
  attachments: ImageAttachment[];
  onAttachmentsChange: (attachments: ImageAttachment[]) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  maxAttachments?: number;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  supportsImages?: boolean;
}

export function MinimalImageChat({
  attachments,
  onAttachmentsChange,
  inputValue,
  onInputChange,
  onSend,
  maxAttachments = 5,
  disabled = false,
  isSending = false,
  placeholder = "Digite sua alteração...",
  supportsImages = true,
}: MinimalImageChatProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          description: `Máximo de ${maxAttachments} imagens.`,
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
            title: 'Erro ao processar',
            description: `Falha em "${file.name}".`,
            variant: 'destructive',
          });
        }
      }

      setIsProcessing(false);
      setProcessProgress(0);
      
      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        toast({
          title: 'Imagem anexada',
          description: `${newAttachments.length} imagem(ns) adicionada(s).`,
        });
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

  const handleClearAll = () => {
    attachments.forEach(att => URL.revokeObjectURL(att.preview));
    onAttachmentsChange([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && supportsImages) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || !supportsImages) return;

    if (e.dataTransfer.files.length > 0) {
      const images = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (images.length > 0) {
        handleFiles(images);
      } else {
        toast({
          title: 'Formato inválido',
          description: 'Apenas imagens são aceitas.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = inputValue.trim() && !disabled && !isSending;

  return (
    <div className="relative">
      {/* Mini-thumbnails dos anexos */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 pb-2 border-b border-border/50 flex-wrap">
          {attachments.map(att => (
            <div key={att.id} className="relative group">
              <div
                onClick={() => setPreviewImage(att)}
                className="w-14 h-14 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
              >
                <img 
                  src={att.preview} 
                  alt={att.name}
                  className="w-full h-full object-cover"
                />
                {/* Zoom overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="h-4 w-4 text-white" />
                </div>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(att.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
              {/* File name */}
              <span className="text-[10px] text-muted-foreground block mt-1 truncate max-w-[56px]">
                {att.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mb-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processando...</span>
          </div>
          <Progress value={processProgress} className="h-1" />
        </div>
      )}

      {/* Warning for unsupported providers */}
      {!supportsImages && attachments.length > 0 && (
        <div className="mb-2 text-xs text-destructive flex items-center gap-1">
          <span>⚠️ Imagens serão ignoradas por este provedor</span>
        </div>
      )}

      {/* Textarea container with drag & drop */}
      <div
        className={cn(
          "relative rounded-xl transition-all",
          isDragging && "ring-2 ring-primary ring-offset-2"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm border-2 border-dashed border-primary">
            <div className="text-center">
              <Paperclip className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-sm font-medium text-primary">Solte as imagens aqui</p>
            </div>
          </div>
        )}

        {/* Textarea */}
        <Textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[100px] pr-28 resize-none rounded-xl",
            isDragging && "border-primary"
          )}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
        />

        {/* Action buttons (bottom right) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          {/* Paperclip button */}
          {supportsImages && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || attachments.length >= maxAttachments || isProcessing}
              title={`Anexar imagem (${attachments.length}/${maxAttachments})`}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}

          {/* Trash button (only when has attachments) */}
          {attachments.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleClearAll}
              title="Limpar anexos"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {/* Send button */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            onClick={onSend}
            disabled={!canSend}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || attachments.length >= maxAttachments || isProcessing}
      />

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

// Keep old export for backwards compatibility if needed elsewhere
export const ImageAttachments = MinimalImageChat;
