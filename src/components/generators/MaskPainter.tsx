import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Undo2, Trash2, Paintbrush, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

interface MaskPainterProps {
    imageSrc: string;
    onApply: (maskBase64: string, editPrompt: string) => void;
    onClose: () => void;
}

export function MaskPainter({ imageSrc, onApply, onClose }: MaskPainterProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const [brushSize, setBrushSize] = useState(30);
    const [isDrawing, setIsDrawing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [history, setHistory] = useState<ImageData[]>([]);
    const [imgDims, setImgDims] = useState({ w: 0, h: 0 });

    // Load image and setup canvases
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Cap dimensions for display (max 800px wide)
            const maxW = Math.min(800, window.innerWidth - 80);
            const scale = Math.min(maxW / img.width, 600 / img.height, 1);
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            setImgDims({ w: img.width, h: img.height });

            // Background canvas (image display)
            const canvas = canvasRef.current;
            const overlay = overlayRef.current;
            if (!canvas || !overlay) return;

            canvas.width = w;
            canvas.height = h;
            overlay.width = w;
            overlay.height = h;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
            }

            // Clear overlay (transparent)
            const oCtx = overlay.getContext('2d');
            if (oCtx) {
                oCtx.clearRect(0, 0, w, h);
            }
        };
        img.src = imageSrc;
    }, [imageSrc]);

    const saveHistory = useCallback(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        if (!ctx) return;
        setHistory(prev => [...prev, ctx.getImageData(0, 0, overlay.width, overlay.height)]);
    }, []);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        saveHistory();
        setIsDrawing(true);
        draw(e);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const overlay = overlayRef.current;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red semi-transparent for visual
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    const stopDraw = () => setIsDrawing(false);

    const handleUndo = () => {
        const overlay = overlayRef.current;
        if (!overlay || history.length === 0) return;
        const ctx = overlay.getContext('2d');
        if (!ctx) return;
        const prev = history[history.length - 1];
        ctx.putImageData(prev, 0, 0);
        setHistory(h => h.slice(0, -1));
    };

    const handleClear = () => {
        const overlay = overlayRef.current;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        if (!ctx) return;
        saveHistory();
        ctx.clearRect(0, 0, overlay.width, overlay.height);
    };

    const handleApply = () => {
        if (!editPrompt.trim()) return;
        const overlay = overlayRef.current;
        if (!overlay) return;
        const ctx = overlay.getContext('2d');
        if (!ctx) return;

        // Generate binary mask: white background, black where painted
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = imgDims.w || overlay.width;
        maskCanvas.height = imgDims.h || overlay.height;
        const mCtx = maskCanvas.getContext('2d');
        if (!mCtx) return;

        // White background (keep area)
        mCtx.fillStyle = '#FFFFFF';
        mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Scale overlay data to original image dimensions
        const overlayData = ctx.getImageData(0, 0, overlay.width, overlay.height);
        const scaleX = maskCanvas.width / overlay.width;
        const scaleY = maskCanvas.height / overlay.height;

        // Draw black where there's any non-transparent pixel on overlay
        mCtx.fillStyle = '#000000';
        for (let py = 0; py < overlay.height; py++) {
            for (let px = 0; px < overlay.width; px++) {
                const idx = (py * overlay.width + px) * 4;
                if (overlayData.data[idx + 3] > 20) {
                    mCtx.fillRect(
                        Math.floor(px * scaleX),
                        Math.floor(py * scaleY),
                        Math.ceil(scaleX),
                        Math.ceil(scaleY)
                    );
                }
            }
        }

        const maskBase64 = maskCanvas.toDataURL('image/png');
        onApply(maskBase64, editPrompt);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 max-w-[900px] w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Paintbrush className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-bold text-white">Mask Painter — Inpainting</span>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Canvas area */}
                <div className="flex-1 overflow-auto p-4 flex justify-center">
                    <div className="relative inline-block">
                        <canvas ref={canvasRef} className="rounded-lg" />
                        <canvas
                            ref={overlayRef}
                            className="absolute top-0 left-0 rounded-lg cursor-crosshair"
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-white/10 space-y-3">
                    {/* Brush size + actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">Brush: {brushSize}px</span>
                            <Slider
                                value={[brushSize]}
                                onValueChange={v => setBrushSize(v[0])}
                                min={5}
                                max={80}
                                step={1}
                                className="flex-1"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className="text-white/70 border-white/20 hover:bg-white/10"
                        >
                            <Undo2 className="w-3 h-3 mr-1" /> Desfazer
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            className="text-white/70 border-white/20 hover:bg-white/10"
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Limpar
                        </Button>
                    </div>

                    {/* Prompt + Apply */}
                    <div className="flex gap-2">
                        <Textarea
                            value={editPrompt}
                            onChange={e => setEditPrompt(e.target.value)}
                            placeholder="Descreva o que quer alterar na área pintada..."
                            className="flex-1 bg-white/5 border-white/10 text-white text-xs resize-none min-h-[60px] placeholder:text-white/30"
                        />
                        <Button
                            onClick={handleApply}
                            disabled={!editPrompt.trim()}
                            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 self-end"
                        >
                            <Check className="w-4 h-4 mr-1" /> Aplicar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MaskPainter;
