import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDriveFiles } from '@/hooks/useDriveFiles';
import {
    ArrowLeft, Download, Eye, Loader2, Megaphone, FolderOpen,
    Image as ImageIcon, Film, FileText, FileType, Grid3X3, List, Search
} from 'lucide-react';
import type { Campanha, DriveFile } from '@/types/campanhas';
import { CATEGORY_LABELS } from '@/types/campanhas';

const CATEGORY_ICONS: Record<string, any> = {
    'logos': FileType,
    'fotos': ImageIcon,
    'social-media': Grid3X3,
    'videos': Film,
    'pdfs': FileText,
    'outros': FolderOpen,
};

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType.includes('pdf')) return FileText;
    return FileType;
}

function formatFileSize(bytes: string | undefined) {
    if (!bytes) return '';
    const b = parseInt(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CampanhaDetail() {
    const navigate = useNavigate();
    const { unit, slug } = useParams<{ unit: string; slug: string }>();
    const [campanha, setCampanha] = useState<Campanha | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { categories, isLoading: loadingFiles, error: filesError, fetchFiles } = useDriveFiles();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

    const gradientFrom = unit === 'universitario' ? 'from-blue-500' : 'from-purple-500';
    const gradientTo = unit === 'universitario' ? 'to-cyan-500' : 'to-pink-500';
    const accentColor = unit === 'universitario' ? 'blue' : 'purple';

    useEffect(() => {
        const fetchCampanha = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('campanhas' as any)
                .select('*')
                .eq('slug', slug)
                .eq('status', 'active')
                .single();

            if (!error && data) {
                const c = data as any as Campanha;
                setCampanha(c);
                if (c.drive_folder_id) {
                    fetchFiles(c.drive_folder_id);
                }
            }
            setIsLoading(false);
        };
        fetchCampanha();
    }, [slug]);

    const categoryNames = useMemo(() => Object.keys(categories), [categories]);

    const filteredFiles = useMemo(() => {
        let files: DriveFile[] = [];
        if (activeCategory === 'all') {
            files = Object.values(categories).flat();
        } else {
            files = categories[activeCategory] || [];
        }

        if (searchTerm) {
            files = files.filter(f =>
                f.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return files;
    }, [categories, activeCategory, searchTerm]);

    const totalFiles = Object.values(categories).reduce((sum, f) => sum + f.length, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
        );
    }

    if (!campanha) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <Megaphone className="w-12 h-12 text-white/20 mb-4" />
                <h2 className="text-xl font-semibold text-white/50">Campanha não encontrada</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-amber-400 hover:underline text-sm"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/faculdade/${unit}/campanhas`)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Campanhas
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <h1 className="text-lg font-semibold truncate">{campanha.title}</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] mb-8">
                    {campanha.cover_image ? (
                        <div className="aspect-[21/9] w-full">
                            <img
                                src={campanha.cover_image}
                                alt={campanha.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                        </div>
                    ) : (
                        <div className={`aspect-[21/9] w-full bg-gradient-to-br ${gradientFrom}/20 ${gradientTo}/10 flex items-center justify-center`}>
                            <Megaphone className="w-20 h-20 text-white/10" />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h2 className="text-3xl font-bold mb-2">{campanha.title}</h2>
                        {campanha.description && (
                            <p className="text-white/60 max-w-2xl">{campanha.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-white/30">
                            <span>{totalFiles} arquivo(s)</span>
                            <span>{categoryNames.length} categoria(s)</span>
                        </div>
                    </div>
                </div>

                {/* Drive Files Section */}
                {!campanha.drive_folder_id ? (
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-12 text-center">
                        <FolderOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white/50 mb-2">Pasta do Drive não configurada</h3>
                        <p className="text-white/30 text-sm">O administrador precisa vincular uma pasta do Google Drive a esta campanha.</p>
                    </div>
                ) : loadingFiles ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                        <span className="ml-3 text-white/40">Carregando arquivos...</span>
                    </div>
                ) : filesError ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                        <p className="text-red-400 mb-2">Erro ao carregar arquivos</p>
                        <p className="text-red-400/60 text-sm">{filesError}</p>
                    </div>
                ) : (
                    <>
                        {/* Search + Category Tabs */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar arquivo..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setActiveCategory('all')}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all'
                                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                                            : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    Todos ({totalFiles})
                                </button>
                                {categoryNames.map(cat => {
                                    const CatIcon = CATEGORY_ICONS[cat] || FolderOpen;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                                                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                                                    : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'
                                                }`}
                                        >
                                            <CatIcon className="w-3.5 h-3.5" />
                                            {CATEGORY_LABELS[cat] || cat} ({categories[cat]?.length || 0})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Files Grid */}
                        {filteredFiles.length === 0 ? (
                            <div className="text-center py-12 text-white/30">
                                <p>Nenhum arquivo encontrado</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredFiles.map((file) => {
                                    const isImage = file.mimeType?.startsWith('image/');
                                    const isVideo = file.mimeType?.startsWith('video/');
                                    const FileIcon = getFileIcon(file.mimeType);

                                    return (
                                        <div
                                            key={file.id}
                                            className="group rounded-xl border border-white/5 bg-[#0a0a0a] overflow-hidden hover:border-white/10 transition-all"
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-square bg-white/5 relative overflow-hidden">
                                                {file.thumbnailLink || isImage ? (
                                                    <img
                                                        src={file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`${file.thumbnailLink || isImage ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                                                    <FileIcon className="w-10 h-10 text-white/20" />
                                                </div>

                                                {/* Hover actions */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    {file.webViewLink && (
                                                        <a
                                                            href={file.webViewLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                                                            title="Visualizar"
                                                        >
                                                            <Eye className="w-4 h-4 text-white" />
                                                        </a>
                                                    )}
                                                    {file.webContentLink && (
                                                        <a
                                                            href={file.webContentLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 rounded-xl bg-amber-500/80 hover:bg-amber-500 transition-all"
                                                            title="Baixar"
                                                        >
                                                            <Download className="w-4 h-4 text-white" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* File Info */}
                                            <div className="p-3">
                                                <p className="text-xs font-medium text-white/70 truncate" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-white/30 uppercase">
                                                        {file.mimeType?.split('/').pop()?.split('.').pop()}
                                                    </span>
                                                    <span className="text-[10px] text-white/30">
                                                        {formatFileSize(file.size)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
