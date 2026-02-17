import { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/integrations/supabase/client';

export interface UploadedImage {
  url: string;
  originalName: string;
  fileSizeKb: number;
  wasCompressed: boolean;
}

interface ImageUploaderProps {
  value?: string;
  onUpload: (result: UploadedImage) => void;
  onRemove: () => void;
  folder?: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  className?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 2;
const MAX_WIDTH = 1200;

export function ImageUploader({
  value,
  onUpload,
  onRemove,
  folder = 'portfolio',
  maxSizeMB = MAX_SIZE_MB,
  maxWidthOrHeight = MAX_WIDTH,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    wasCompressed: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato não suportado. Use JPG, PNG ou WebP.';
    }
    if (file.size > maxSizeMB * 1024 * 1024 * 2) {
      // Allow up to 2x for compression
      return `Imagem muito grande. Máximo ${maxSizeMB * 2}MB antes da compressão.`;
    }
    return null;
  };

  const compressImage = async (file: File): Promise<{ blob: Blob; wasCompressed: boolean }> => {
    const originalSizeMB = file.size / (1024 * 1024);

    // If already small enough and not too large dimensions, skip compression
    if (originalSizeMB <= 0.3) {
      return { blob: file, wasCompressed: false };
    }

    const options = {
      maxSizeMB: Math.min(maxSizeMB, 0.5), // Target 500KB for thumbnails
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: file.type === 'image/png' ? 'image/webp' : file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return { blob: compressedFile, wasCompressed: true };
    } catch (err) {
      console.error('Compression error:', err);
      // If compression fails, try with simpler options
      const simpleOptions = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: false,
      };
      const compressedFile = await imageCompression(file, simpleOptions);
      return { blob: compressedFile, wasCompressed: true };
    }
  };

  const uploadToStorage = async (blob: Blob, originalName: string): Promise<string> => {
    const extension = blob.type === 'image/webp' ? 'webp' : 
                     blob.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsProcessing(false);
      return;
    }

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploadProgress(10);

      // Compress
      setUploadProgress(30);
      const { blob, wasCompressed } = await compressImage(file);
      
      const compressedSizeKb = Math.round(blob.size / 1024);
      const originalSizeKb = Math.round(file.size / 1024);

      // Check final size
      if (blob.size > maxSizeMB * 1024 * 1024) {
        setError(`Imagem ainda muito grande após compressão (${compressedSizeKb}KB). Tente uma imagem menor.`);
        setIsProcessing(false);
        return;
      }

      setFileInfo({
        originalSize: originalSizeKb,
        compressedSize: compressedSizeKb,
        wasCompressed,
      });
      setUploadProgress(60);

      // Upload
      const url = await uploadToStorage(blob, file.name);
      setUploadProgress(100);

      onUpload({
        url,
        originalName: file.name,
        fileSizeKb: compressedSizeKb,
        wasCompressed,
      });

      // Cleanup preview URL after successful upload
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erro ao fazer upload. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileInfo(null);
    setError(null);
    setUploadProgress(0);
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };

  const displayUrl = value || previewUrl;

  return (
    <div className={cn('space-y-2', className)}>
      {displayUrl ? (
        <div className="relative group">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          {fileInfo && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          {fileInfo.wasCompressed ? (
            <>
              <Check className="h-3 w-3 text-primary" />
              <span>{fileInfo.compressedSize}KB</span>
              <span className="text-muted-foreground">
                (de {fileInfo.originalSize}KB)
              </span>
            </>
          ) : (
            <>
              <Check className="h-3 w-3 text-primary" />
              <span>{fileInfo.compressedSize}KB - Otimizado ✓</span>
            </>
          )}
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            isProcessing && 'pointer-events-none opacity-60'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isProcessing ? (
            <div className="space-y-3">
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 30 ? 'Preparando...' :
                 uploadProgress < 60 ? 'Otimizando imagem...' :
                 uploadProgress < 100 ? 'Enviando...' : 'Concluído!'}
              </p>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Máx: {maxSizeMB}MB • JPG, PNG ou WebP • Até {maxWidthOrHeight}px
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
