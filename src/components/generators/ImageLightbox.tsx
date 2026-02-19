import { useState, useEffect, useCallback } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Copy, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LightboxImage {
    src: string;
    prompt: string;
    timestamp: number;
}

interface ImageLightboxProps {
    images: LightboxImage[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, isOpen, onClose, onIndexChange }: ImageLightboxProps) {
    const [zoom, setZoom] = useState(1);
    const [copied, setCopied] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');

    const image = images[currentIndex];

    // Reset zoom ao trocar imagem
    useEffect(() => { setZoom(1); }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape': onClose(); break;
                case 'ArrowLeft': if (currentIndex > 0) onIndexChange(currentIndex - 1); break;
                case 'ArrowRight': if (currentIndex < images.length - 1) onIndexChange(currentIndex + 1); break;
                case '+': case '=': setZoom(z => Math.min(z + 0.25, 3)); break;
                case '-': setZoom(z => Math.max(z - 0.25, 0.5)); break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

    // Download handler
    const handleDownload = useCallback(async (format: 'png' | 'jpg') => {
        if (!image) return;
        try {
            const d = new Date(image.timestamp);
            const pad = (n: number) => String(n).padStart(2, '0');
            const safeName = `design-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;

            if (format === 'jpg') {
                // Converter para JPG via Canvas
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = reject;
                    img.src = image.src;
                });
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${safeName}.jpg`;
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                    toast({ title: `📥 Baixando ${safeName}.jpg` });
                }, 'image/jpeg', 0.95);
            } else {
                // PNG direto — com fallback MIME robusto
                const response = await fetch(image.src);
                let blob = await response.blob();
                // Fallback: se blob.type vazio (data URI base64), força image/png
                if (!blob.type || blob.type === 'application/octet-stream') {
                    blob = new Blob([blob], { type: 'image/png' });
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${safeName}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 5000);
                toast({ title: `📥 Baixando ${safeName}.png` });
            }
        } catch (err) {
            console.error('Erro no download:', err);
            toast({ title: 'Erro ao baixar imagem', variant: 'destructive' });
        }
    }, [image]);

    // Copiar prompt
    const handleCopyPrompt = useCallback(() => {
        if (!image) return;
        navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        toast({ title: 'Prompt copiado!' });
        setTimeout(() => setCopied(false), 2000);
    }, [image]);

    if (!isOpen || !image) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Nav: Previous */}
            {currentIndex > 0 && (
                <button
                    onClick={() => onIndexChange(currentIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Nav: Next */}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={() => onIndexChange(currentIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            {/* Image */}
            <div className="relative z-[105] max-w-[90vw] max-h-[80vh] animate-in fade-in zoom-in-95 duration-300">
                <img
                    src={image.src}
                    alt="Imagem gerada"
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                />
            </div>

            {/* Bottom toolbar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-black/60 backdrop-blur-lg rounded-2xl px-4 py-2.5 border border-white/10">

                {/* Counter */}
                <span className="text-white/60 text-xs font-medium px-2">
                    {currentIndex + 1} / {images.length}
                </span>

                <div className="w-px h-6 bg-white/20" />

                {/* Zoom controls */}
                <button
                    onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    title="Reduzir zoom"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white/80 text-xs w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                <button
                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    title="Aumentar zoom"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/20" />

                {/* Format selector */}
                <div className="flex bg-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setDownloadFormat('png')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${downloadFormat === 'png' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                    >
                        PNG
                    </button>
                    <button
                        onClick={() => setDownloadFormat('jpg')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-colors ${downloadFormat === 'jpg' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                    >
                        JPG
                    </button>
                </div>

                {/* Download */}
                <button
                    onClick={() => handleDownload(downloadFormat)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Baixar
                </button>

                <div className="w-px h-6 bg-white/20" />

                {/* Copy prompt */}
                <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Prompt'}
                </button>
            </div>
        </div>
    );
}

export default ImageLightbox;
