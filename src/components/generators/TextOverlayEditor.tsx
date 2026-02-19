import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Type, Plus, Trash2, Download, GripVertical, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

// ── Fontes disponíveis ──
const FONTS = [
    'Inter', 'Montserrat', 'Poppins', 'Bebas Neue', 'Playfair Display',
    'Roboto', 'Oswald', 'Raleway', 'Anton', 'Outfit',
];

// ── Presets de estilo ──
const PRESETS = {
    h1: { fontSize: 48, fontFamily: 'Bebas Neue', color: '#FFFFFF', bold: true, italic: false, align: 'center' as const, shadow: true },
    h2: { fontSize: 28, fontFamily: 'Poppins', color: '#E2E8F0', bold: false, italic: false, align: 'center' as const, shadow: true },
    cta: { fontSize: 20, fontFamily: 'Montserrat', color: '#000000', bold: true, italic: false, align: 'center' as const, shadow: false, bgColor: '#C8E64A', borderRadius: 12, paddingX: 32, paddingY: 14 },
};

interface TextLayer {
    id: string;
    type: 'h1' | 'h2' | 'cta';
    text: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    fontSize: number;
    fontFamily: string;
    color: string;
    bold: boolean;
    italic: boolean;
    align: 'left' | 'center' | 'right';
    shadow: boolean;
    // CTA specific
    bgColor?: string;
    borderRadius?: number;
    paddingX?: number;
    paddingY?: number;
}

interface TextOverlayEditorProps {
    imageSrc: string;
    initialTexts?: { h1?: string; h2?: string; cta?: string };
    onSave: (resultBase64: string) => void;
    onClose: () => void;
}

export function TextOverlayEditor({ imageSrc, initialTexts, onSave, onClose }: TextOverlayEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [layers, setLayers] = useState<TextLayer[]>(() => {
        const initial: TextLayer[] = [];
        if (initialTexts?.h1) {
            initial.push({ id: crypto.randomUUID(), type: 'h1', text: initialTexts.h1, x: 50, y: 20, ...PRESETS.h1 });
        }
        if (initialTexts?.h2) {
            initial.push({ id: crypto.randomUUID(), type: 'h2', text: initialTexts.h2, x: 50, y: 35, ...PRESETS.h2 });
        }
        if (initialTexts?.cta) {
            initial.push({ id: crypto.randomUUID(), type: 'cta', text: initialTexts.cta, x: 50, y: 85, ...PRESETS.cta });
        }
        return initial;
    });
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [imgDims, setImgDims] = useState({ w: 0, h: 0 });

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    // Load Google Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); };
    }, []);

    // Track image dimensions
    const handleImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImgDims({ w: img.clientWidth, h: img.clientHeight });
    }, []);

    const updateLayer = useCallback((id: string, updates: Partial<TextLayer>) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }, []);

    const addLayer = useCallback((type: 'h1' | 'h2' | 'cta') => {
        const preset = PRESETS[type];
        const newLayer: TextLayer = {
            id: crypto.randomUUID(),
            type,
            text: type === 'h1' ? 'Título Principal' : type === 'h2' ? 'Subtítulo' : 'SAIBA MAIS',
            x: 50,
            y: type === 'h1' ? 25 : type === 'h2' ? 40 : 80,
            ...preset,
        };
        setLayers(prev => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
    }, []);

    const removeLayer = useCallback((id: string) => {
        setLayers(prev => prev.filter(l => l.id !== id));
        if (selectedLayerId === id) setSelectedLayerId(null);
    }, [selectedLayerId]);

    // ── Drag handlers ──
    const handleMouseDown = useCallback((e: React.MouseEvent, layerId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const layer = layers.find(l => l.id === layerId);
        if (!layer) return;

        const layerPxX = (layer.x / 100) * rect.width;
        const layerPxY = (layer.y / 100) * rect.height;
        setDragOffset({ x: e.clientX - rect.left - layerPxX, y: e.clientY - rect.top - layerPxY });
        setDragging(layerId);
        setSelectedLayerId(layerId);
    }, [layers]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
        const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
        updateLayer(dragging, {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        });
    }, [dragging, dragOffset, updateLayer]);

    const handleMouseUp = useCallback(() => setDragging(null), []);

    // ── Export via Canvas ──
    const handleExport = useCallback(async () => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>((res, rej) => {
                img.onload = () => res();
                img.onerror = rej;
                img.src = imageSrc;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            // Scale factor
            const scaleX = img.naturalWidth / (imgDims.w || img.naturalWidth);
            const scaleY = img.naturalHeight / (imgDims.h || img.naturalHeight);

            for (const layer of layers) {
                const px = (layer.x / 100) * canvas.width;
                const py = (layer.y / 100) * canvas.height;
                const fontSize = layer.fontSize * Math.max(scaleX, scaleY);

                ctx.save();
                ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${fontSize}px "${layer.fontFamily}"`;
                ctx.textAlign = layer.align;
                ctx.textBaseline = 'middle';

                const metrics = ctx.measureText(layer.text);
                const textW = metrics.width;
                const textH = fontSize * 1.2;

                // CTA background
                if (layer.type === 'cta' && layer.bgColor) {
                    const padX = (layer.paddingX || 32) * scaleX;
                    const padY = (layer.paddingY || 14) * scaleY;
                    const radius = (layer.borderRadius || 12) * Math.max(scaleX, scaleY);

                    let rectX = px - textW / 2 - padX;
                    if (layer.align === 'left') rectX = px - padX;
                    if (layer.align === 'right') rectX = px - textW - padX;

                    ctx.fillStyle = layer.bgColor;
                    ctx.beginPath();
                    ctx.roundRect(rectX, py - textH / 2 - padY, textW + padX * 2, textH + padY * 2, radius);
                    ctx.fill();
                }

                // Shadow
                if (layer.shadow) {
                    ctx.shadowColor = 'rgba(0,0,0,0.7)';
                    ctx.shadowBlur = fontSize * 0.15;
                    ctx.shadowOffsetX = fontSize * 0.03;
                    ctx.shadowOffsetY = fontSize * 0.05;
                }

                ctx.fillStyle = layer.color;
                ctx.fillText(layer.text, px, py);
                ctx.restore();
            }

            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
            toast({ title: '💾 Imagem salva com textos!', className: 'bg-emerald-600 text-white border-none' });
        } catch (err: any) {
            toast({ title: 'Erro ao exportar', description: err.message, variant: 'destructive' });
        }
    }, [imageSrc, layers, imgDims, onSave]);

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex">
            {/* ─── Canvas Area ─── */}
            <div
                className="flex-1 flex items-center justify-center p-6"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div ref={containerRef} className="relative inline-block max-w-full max-h-[85vh]">
                    <img
                        src={imageSrc}
                        className="max-w-full max-h-[85vh] object-contain rounded-lg"
                        draggable={false}
                        onLoad={handleImgLoad}
                    />

                    {/* Text layers */}
                    {layers.map(layer => (
                        <div
                            key={layer.id}
                            className={`absolute cursor-move select-none transition-shadow ${selectedLayerId === layer.id ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-transparent' : ''
                                }`}
                            style={{
                                left: `${layer.x}%`,
                                top: `${layer.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontFamily: `"${layer.fontFamily}", sans-serif`,
                                fontSize: `${layer.fontSize}px`,
                                fontWeight: layer.bold ? 'bold' : 'normal',
                                fontStyle: layer.italic ? 'italic' : 'normal',
                                color: layer.color,
                                textAlign: layer.align,
                                textShadow: layer.shadow ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
                                ...(layer.type === 'cta' && layer.bgColor ? {
                                    backgroundColor: layer.bgColor,
                                    borderRadius: `${layer.borderRadius || 12}px`,
                                    paddingLeft: `${layer.paddingX || 32}px`,
                                    paddingRight: `${layer.paddingX || 32}px`,
                                    paddingTop: `${layer.paddingY || 14}px`,
                                    paddingBottom: `${layer.paddingY || 14}px`,
                                } : {}),
                                whiteSpace: 'nowrap',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, layer.id)}
                        >
                            {layer.text}
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Right Panel ─── */}
            <div className="w-[320px] bg-[#1a1a1a] border-l border-white/10 flex flex-col">
                {/* Header */}
                <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Text Editor</span>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Add buttons */}
                <div className="p-3 border-b border-white/5 flex gap-2">
                    <button onClick={() => addLayer('h1')} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider border border-white/10 transition-colors">
                        + H1
                    </button>
                    <button onClick={() => addLayer('h2')} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider border border-white/10 transition-colors">
                        + H2
                    </button>
                    <button onClick={() => addLayer('cta')} className="flex-1 py-2 rounded-lg bg-[#C8E64A]/20 hover:bg-[#C8E64A]/30 text-[#C8E64A] text-[10px] font-bold uppercase tracking-wider border border-[#C8E64A]/20 transition-colors">
                        + CTA
                    </button>
                </div>

                {/* Layers list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {layers.length === 0 && (
                        <div className="text-center mt-12 opacity-40">
                            <Type className="w-8 h-8 mx-auto mb-2 text-white/20" />
                            <p className="text-[10px] text-white/30 font-bold uppercase">Adicione textos</p>
                        </div>
                    )}

                    {layers.map(layer => (
                        <div
                            key={layer.id}
                            className={`rounded-xl border p-3 space-y-2 cursor-pointer transition-colors ${selectedLayerId === layer.id
                                    ? 'border-violet-500/50 bg-violet-500/5'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                            onClick={() => setSelectedLayerId(layer.id)}
                        >
                            {/* Layer header */}
                            <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${layer.type === 'cta' ? 'text-[#C8E64A]' : layer.type === 'h1' ? 'text-violet-400' : 'text-blue-400'
                                    }`}>
                                    {layer.type.toUpperCase()}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="text-white/30 hover:text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Text input */}
                            <Input
                                value={layer.text}
                                onChange={e => updateLayer(layer.id, { text: e.target.value })}
                                className="h-8 bg-white/5 border-white/10 text-white text-xs"
                                onClick={e => e.stopPropagation()}
                            />

                            {/* Properties (only if selected) */}
                            {selectedLayerId === layer.id && (
                                <div className="space-y-2 pt-1">
                                    {/* Font */}
                                    <div className="flex gap-2">
                                        <select
                                            value={layer.fontFamily}
                                            onChange={e => updateLayer(layer.id, { fontFamily: e.target.value })}
                                            className="flex-1 h-7 rounded-md bg-white/5 border border-white/10 text-white text-[10px] px-2 outline-none"
                                        >
                                            {FONTS.map(f => (
                                                <option key={f} value={f} className="bg-black">{f}</option>
                                            ))}
                                        </select>
                                        <Input
                                            type="number"
                                            value={layer.fontSize}
                                            onChange={e => updateLayer(layer.id, { fontSize: Number(e.target.value) })}
                                            className="w-16 h-7 bg-white/5 border-white/10 text-white text-[10px] text-center"
                                            min={8}
                                            max={200}
                                        />
                                    </div>

                                    {/* Style buttons */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => updateLayer(layer.id, { bold: !layer.bold })}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${layer.bold ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50'}`}
                                        >
                                            <Bold className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => updateLayer(layer.id, { italic: !layer.italic })}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${layer.italic ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50'}`}
                                        >
                                            <Italic className="w-3 h-3" />
                                        </button>
                                        <div className="w-px h-7 bg-white/10" />
                                        <button
                                            onClick={() => updateLayer(layer.id, { align: 'left' })}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${layer.align === 'left' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50'}`}
                                        >
                                            <AlignLeft className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => updateLayer(layer.id, { align: 'center' })}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${layer.align === 'center' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50'}`}
                                        >
                                            <AlignCenter className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => updateLayer(layer.id, { align: 'right' })}
                                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${layer.align === 'right' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50'}`}
                                        >
                                            <AlignRight className="w-3 h-3" />
                                        </button>
                                        <div className="w-px h-7 bg-white/10" />
                                        <button
                                            onClick={() => updateLayer(layer.id, { shadow: !layer.shadow })}
                                            className={`px-2 h-7 rounded-md flex items-center justify-center text-[9px] font-bold transition-colors ${layer.shadow ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/50'}`}
                                        >
                                            Sombra
                                        </button>
                                    </div>

                                    {/* Colors */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-[9px] text-white/40 uppercase tracking-wider w-8">Cor</label>
                                        <input
                                            type="color"
                                            value={layer.color}
                                            onChange={e => updateLayer(layer.id, { color: e.target.value })}
                                            className="w-7 h-7 rounded border-none cursor-pointer"
                                        />
                                        {layer.type === 'cta' && (
                                            <>
                                                <label className="text-[9px] text-white/40 uppercase tracking-wider w-6">BG</label>
                                                <input
                                                    type="color"
                                                    value={layer.bgColor || '#C8E64A'}
                                                    onChange={e => updateLayer(layer.id, { bgColor: e.target.value })}
                                                    className="w-7 h-7 rounded border-none cursor-pointer"
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* CTA radius */}
                                    {layer.type === 'cta' && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] text-white/40 uppercase tracking-wider whitespace-nowrap">Raio</label>
                                            <Slider
                                                value={[layer.borderRadius || 12]}
                                                onValueChange={v => updateLayer(layer.id, { borderRadius: v[0] })}
                                                min={0}
                                                max={50}
                                                step={1}
                                                className="flex-1"
                                            />
                                            <span className="text-[9px] text-white/40 w-6 text-right">{layer.borderRadius || 12}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="p-3 border-t border-white/10 space-y-2">
                    <Button
                        onClick={handleExport}
                        disabled={layers.length === 0}
                        className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Salvar com Textos
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full h-9 text-white/60 border-white/10 hover:bg-white/5 text-[10px] rounded-xl"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default TextOverlayEditor;
