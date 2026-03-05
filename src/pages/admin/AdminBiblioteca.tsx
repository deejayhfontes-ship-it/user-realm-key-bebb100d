import { useState, useEffect, useCallback } from 'react';
import {
    Archive,
    Trash2,
    Download,
    Search,
    Filter,
    X,
    Eye,
    Loader2,
    RefreshCcw,
    Image as ImageIcon,
    Calendar,
    Wand2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Tipos ──
interface BackupImage {
    filename: string;
    url: string;
    size: number;
    date: string;
    generator_type?: string;
    prompt?: string;
}

// ── Proxy Supabase (bypass ModSecurity) ──
const PROXY_URL = 'https://nzngwbknezmfthbyfjmx.supabase.co/functions/v1/backup-proxy';

const GENERATOR_LABELS: Record<string, string> = {
    prefeitura_arte: '🏛️ Prefeitura Arte',
    designer_futuro: '🎨 Designer do Futuro',
    edital_decretos: '📄 Editais e Decretos',
    prefeitura_mais_facil: '📱 Prefeitura Stories',
    carrossel: '🎠 Carrossel',
    desconhecido: '❓ Outros',
};

export default function AdminBiblioteca() {
    const [images, setImages] = useState<BackupImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenerator, setFilterGenerator] = useState('todos');
    const [selectedImage, setSelectedImage] = useState<BackupImage | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    // ── Buscar imagens do drive do HostGator ──
    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${PROXY_URL}?action=list`);
            if (res.ok) {
                const data = await res.json();
                setImages(data.files || data.images || []);
            } else {
                // Se a API não estiver disponível, usar dados mock para desenvolvimento
                console.warn('[BIBLIOTECA] API indisponível, usando estado vazio');
                setImages([]);
            }
        } catch (err) {
            console.warn('[BIBLIOTECA] Erro ao buscar imagens:', err);
            // Mostrar estado vazio ao invés de erro
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchImages(); }, [fetchImages]);

    // ── Deletar imagem ──
    const handleDelete = async (filename: string) => {
        if (!confirm('Tem certeza que deseja apagar esta imagem?')) return;
        setDeleting(filename);
        try {
            const res = await fetch(`${PROXY_URL}?action=delete&filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setImages(prev => prev.filter(img => img.filename !== filename));
                toast({ title: '🗑️ Imagem removida!' });
                if (selectedImage?.filename === filename) setSelectedImage(null);
            } else {
                toast({ title: 'Erro ao deletar', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Erro de conexão', variant: 'destructive' });
        } finally {
            setDeleting(null);
        }
    };

    // ── Filtros ──
    const filteredImages = images.filter(img => {
        const matchSearch = !searchTerm ||
            img.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (img.prompt || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchGenerator = filterGenerator === 'todos' ||
            (img.generator_type || 'desconhecido') === filterGenerator;
        return matchSearch && matchGenerator;
    });

    // Geradores únicos presentes nas imagens
    const availableGenerators = ['todos', ...new Set(images.map(img => img.generator_type || 'desconhecido'))];

    // ── Format helpers ──
    const formatSize = (bytes: number): string => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (date: string): string => {
        if (!date) return '—';
        try {
            return new Date(date).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return date; }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Archive className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Arquivo / Biblioteca</h1>
                            <p className="text-sm text-muted-foreground">
                                {images.length} imagens salvas no backup
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchImages}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Busca */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome ou prompt..."
                            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filtro por gerador */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            value={filterGenerator}
                            onChange={(e) => setFilterGenerator(e.target.value)}
                            className="pl-10 pr-8 py-2.5 bg-card border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm appearance-none cursor-pointer min-w-[200px]"
                        >
                            {availableGenerators.map(gen => (
                                <option key={gen} value={gen}>
                                    {gen === 'todos' ? '📂 Todos os Geradores' : (GENERATOR_LABELS[gen] || gen)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-2xl font-bold text-foreground">{filteredImages.length}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <ImageIcon className="w-3 h-3" /> Imagens encontradas
                        </p>
                    </div>
                    {Object.entries(GENERATOR_LABELS).slice(0, 3).map(([key, label]) => {
                        const count = images.filter(img => (img.generator_type || 'desconhecido') === key).length;
                        if (count === 0) return null;
                        return (
                            <div key={key} className="bg-card border border-border rounded-xl p-4">
                                <p className="text-2xl font-bold text-foreground">{count}</p>
                                <p className="text-xs text-muted-foreground mt-1">{label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground text-sm">Carregando imagens do backup...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <Archive className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Nenhuma imagem encontrada</h3>
                        <p className="text-muted-foreground text-sm text-center max-w-md">
                            {searchTerm || filterGenerator !== 'todos'
                                ? 'Tente alterar os filtros de busca.'
                                : 'As imagens geradas nos geradores serão salvas automaticamente aqui.'}
                        </p>
                    </div>
                )}

                {/* Grid de Imagens */}
                {!loading && filteredImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredImages.map((img) => (
                            <div
                                key={img.filename}
                                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                            >
                                {/* Thumbnail */}
                                <div
                                    className="aspect-square bg-muted relative cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.filename}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '';
                                            (e.target as HTMLImageElement).alt = 'Erro ao carregar';
                                        }}
                                    />
                                    {/* Overlay com ações */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                            title="Visualizar"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={img.url}
                                            download={img.filename}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                            title="Baixar"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(img.filename); }}
                                            disabled={deleting === img.filename}
                                            className="w-9 h-9 rounded-full bg-red-500/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/60 transition-colors disabled:opacity-50"
                                            title="Excluir"
                                        >
                                            {deleting === img.filename
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Trash2 className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-2.5">
                                    <p className="text-xs text-foreground font-medium truncate" title={img.filename}>
                                        {img.filename}
                                    </p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Wand2 className="w-2.5 h-2.5" />
                                            {GENERATOR_LABELS[img.generator_type || 'desconhecido']?.split(' ').pop() || img.generator_type || '—'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatSize(img.size)}
                                        </span>
                                    </div>
                                    {img.date && (
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {formatDate(img.date)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox / Modal de Visualização */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" />

                    {/* Close */}
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Imagem */}
                    <div className="relative z-[105] max-w-[90vw] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.filename}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                        />

                        {/* Info card */}
                        <div className="mt-4 bg-black/60 backdrop-blur-lg rounded-xl px-5 py-3 border border-white/10 space-y-2">
                            <p className="text-white font-medium text-sm">{selectedImage.filename}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-white/60">
                                {selectedImage.generator_type && (
                                    <span className="flex items-center gap-1">
                                        <Wand2 className="w-3 h-3" />
                                        {GENERATOR_LABELS[selectedImage.generator_type] || selectedImage.generator_type}
                                    </span>
                                )}
                                {selectedImage.date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(selectedImage.date)}
                                    </span>
                                )}
                                <span>{formatSize(selectedImage.size)}</span>
                            </div>
                            {selectedImage.prompt && (
                                <p className="text-white/40 text-xs line-clamp-2" title={selectedImage.prompt}>
                                    Prompt: {selectedImage.prompt}
                                </p>
                            )}
                            <div className="flex gap-2 pt-2">
                                <a
                                    href={selectedImage.url}
                                    download={selectedImage.filename}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Baixar
                                </a>
                                <button
                                    onClick={() => handleDelete(selectedImage.filename)}
                                    disabled={deleting === selectedImage.filename}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/40 hover:bg-red-500/60 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {deleting === selectedImage.filename
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Trash2 className="w-4 h-4" />
                                    }
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
