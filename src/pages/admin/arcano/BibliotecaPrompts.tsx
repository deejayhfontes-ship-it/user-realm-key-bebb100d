import { useState, useEffect, useMemo } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { supabase } from '@/integrations/supabase/client';
import {
    Search, Copy, Check, X, ChevronLeft, ChevronRight,
    Sparkles, Eye, Star, Flame, Clock, Image as ImageIcon,
    Lock, ExternalLink, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const LIME = '#D8FF9A';
const PURPLE = '#9333ea';
const PINK = '#ec4899';

const CATEGORIES = [
    { label: 'Populares', icon: Flame },
    { label: 'Ver Tudo', icon: null },
    { label: 'Novos', icon: Clock },
    { label: 'Grátis', icon: null },
    { label: 'Selos 3D', icon: null },
    { label: 'Fotos', icon: null },
    { label: 'Cenários', icon: null },
    { label: 'Logo', icon: null },
    { label: 'Miniatura', icon: null },
    { label: 'Capas', icon: null },
    { label: 'Flyer', icon: null },
    { label: 'Mockup', icon: null },
    { label: 'Movies para Telão', icon: null },
    { label: 'Controles de Câmera', icon: null },
];

interface Prompt {
    id: string;
    title: string;
    prompt: string;
    image_url: string | null;
    thumbnail_url: string | null;
    category: string;
    is_premium: boolean;
    tutorial_url: string | null;
    prompt_type: string;
    click_count: number;
    bonus_clicks: number;
}

export default function BibliotecaPrompts() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Ver Tudo');
    const [tab, setTab] = useState<'admin' | 'community'>('admin');
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    const { toast } = useToast();

    const PAGE_SIZE = 20;

    useEffect(() => { fetchPrompts(); }, []);

    async function fetchPrompts() {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from('arcano_prompts')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) setPrompts(data);
        setLoading(false);
    }

    const filtered = useMemo(() => {
        let result = prompts.filter(p => tab === 'community' ? p.prompt_type === 'community' : p.prompt_type !== 'community');

        if (category === 'Grátis') result = result.filter(p => !p.is_premium);
        else if (category === 'Novos') result = [...result].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 50);
        else if (category === 'Populares') result = [...result].sort((a, b) => (b.click_count + b.bonus_clicks) - (a.click_count + a.bonus_clicks));
        else if (category !== 'Ver Tudo') result = result.filter(p => p.category === category);

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p => p.title.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q));
        }
        return result;
    }, [prompts, category, search, tab]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    useEffect(() => { setPage(0); }, [category, search, tab]);

    async function handleCopy(p: Prompt, e?: React.MouseEvent) {
        e?.stopPropagation();
        await navigator.clipboard.writeText(p.prompt);
        setCopied(p.id);
        toast({ title: '✅ Prompt copiado!', description: 'Cole no gerador de imagens para usar.' });
        setTimeout(() => setCopied(null), 2500);
    }

    function handleGenerate(p: Prompt, e?: React.MouseEvent) {
        e?.stopPropagation();
        // Navigate to the Arcano Cloner with the reference image pre-filled (like the original ArcanoApp)
        navigate('/admin/arcano/cloner', { state: { prompt: p.prompt, referenceImage: p.image_url } });
    }

    const copyCount = (p: Prompt) => p.click_count + p.bonus_clicks;

    return (
        <ArcanoLayout>
            <div className="min-h-full px-6 py-8" style={{ background: '#0c0c14' }}>

                {/* Hero Banner */}
                <div className="relative rounded-2xl overflow-hidden mb-8 cursor-pointer group"
                    onClick={() => navigate('/admin/arcano/upscaler')}
                    style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #1a1a2e 100%)' }}>
                    <div className="flex items-center gap-8 p-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black text-white mb-2">
                                Conheça o Upscaler Arcano
                            </h2>
                            <p className="text-white/50 text-sm mb-4 max-w-md">
                                Deixe suas fotos em 4K com alta nitidez, riqueza de detalhes e qualidade cinematográfica
                            </p>
                            <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                Testar agora
                            </button>
                        </div>
                        <div className="w-48 h-48 rounded-2xl overflow-hidden shrink-0 hidden md:block">
                            <div className="w-full h-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' }}>
                                <Sparkles className="w-16 h-16 text-white/60" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-white mb-1">
                        Biblioteca de Prompts
                    </h1>
                    <p className="text-white/40 text-sm">
                        Explore nossa coleção de prompts para criar projetos incríveis com IA
                    </p>
                </div>

                {/* Tabs: Arquivos Exclusivos / Comunidade */}
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setTab('admin')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: tab === 'admin' ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
                            color: tab === 'admin' ? '#fff' : 'rgba(255,255,255,0.5)',
                            border: `1px solid ${tab === 'admin' ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                        }}>
                        <Star className="w-4 h-4" />
                        Arquivos Exclusivos
                    </button>
                    <button
                        onClick={() => setTab('community')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{
                            background: tab === 'community' ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
                            color: tab === 'community' ? '#fff' : 'rgba(255,255,255,0.5)',
                            border: `1px solid ${tab === 'community' ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                        }}>
                        <Eye className="w-4 h-4" />
                        Comunidade
                    </button>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.label}
                            onClick={() => setCategory(cat.label)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={{
                                background: category === cat.label ? PURPLE : 'rgba(255,255,255,0.06)',
                                color: category === cat.label ? '#fff' : 'rgba(255,255,255,0.5)',
                                border: `1px solid ${category === cat.label ? PURPLE : 'rgba(255,255,255,0.08)'}`,
                            }}>
                            {cat.icon && <cat.icon className="w-3 h-3" />}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar prompts..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${PURPLE} transparent ${PURPLE} ${PURPLE}` }} />
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="text-center py-20 text-white/30 text-sm">
                        Nenhum prompt encontrado
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginated.map(p => (
                            <div
                                key={p.id}
                                className="group rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                                style={{ background: '#16162a' }}
                            >
                                {/* Image */}
                                <div className="aspect-square overflow-hidden relative cursor-pointer"
                                    onClick={() => setSelectedPrompt(p)}>
                                    {p.image_url ? (
                                        <img
                                            src={p.thumbnail_url || p.image_url}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#1e1e3a' }}>
                                            <ImageIcon className="w-10 h-10 text-white/10" />
                                        </div>
                                    )}

                                    {/* Lock icon for premium */}
                                    {p.is_premium && (
                                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(0,0,0,0.6)' }}>
                                            <Lock className="w-4 h-4 text-white/70" />
                                        </div>
                                    )}

                                    {/* Copy count badge */}
                                    {copyCount(p) > 0 && (
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white/80"
                                            style={{ background: 'rgba(0,0,0,0.6)' }}>
                                            <Eye className="w-3 h-3" />
                                            {copyCount(p)}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-sm font-bold text-white truncate mb-2">{p.title}</h3>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {!p.is_premium ? (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: '#22c55e', color: '#000' }}>
                                                Grátis
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                style={{ background: PURPLE, color: '#fff' }}>
                                                <Star className="w-2.5 h-2.5" /> Premium
                                            </span>
                                        )}
                                        {p.tutorial_url && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                style={{ background: '#ef4444', color: '#fff' }}>
                                                <ExternalLink className="w-2.5 h-2.5" /> Tutorial
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleCopy(p, e)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
                                            style={{ background: PURPLE }}>
                                            {copied === p.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied === p.id ? 'Copiado!' : 'Copiar Prompt'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedPrompt(p)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white border border-white/10 hover:border-white/25 transition-all">
                                            Detalhes
                                        </button>
                                    </div>

                                    {/* Generate button */}
                                    <button
                                        onClick={(e) => handleGenerate(p, e)}
                                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110"
                                        style={{ background: 'linear-gradient(135deg, #ec4899, #ef4444)' }}>
                                        <Camera className="w-3.5 h-3.5" />
                                        Gerar sua foto
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            title="Página anterior">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-white/50 font-bold tabular-nums">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            title="Próxima página">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedPrompt(null)}
                        style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <div
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: '#16162a' }}>
                            {/* Close */}
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                title="Fechar">
                                <X className="w-5 h-5" />
                            </button>

                            {/* Title + badge */}
                            <div className="px-6 pt-6 pb-3">
                                <h2 className="text-xl font-black text-white pr-10 mb-2">{selectedPrompt.title}</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {!selectedPrompt.is_premium ? (
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                                            style={{ background: '#22c55e', color: '#000' }}>
                                            Grátis
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                                            style={{ background: PURPLE, color: '#fff' }}>
                                            <Star className="w-2.5 h-2.5" /> Premium
                                        </span>
                                    )}
                                    {selectedPrompt.category && (
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white/60"
                                            style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            {selectedPrompt.category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Large Preview Image */}
                            {selectedPrompt.image_url && (
                                <div className="px-6 pb-4">
                                    <div className="rounded-xl overflow-hidden border border-white/5">
                                        <img
                                            src={selectedPrompt.image_url}
                                            alt={selectedPrompt.title}
                                            className="w-full object-contain max-h-[60vh]"
                                            style={{ background: '#0c0c14' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Prompt Text */}
                            <div className="px-6 pb-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-white/25 mb-2">Prompt</p>
                                <div className="rounded-xl p-4 text-sm text-white/70 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto"
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {selectedPrompt.prompt}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => handleGenerate(selectedPrompt)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                                    style={{ background: 'linear-gradient(135deg, #ec4899, #ef4444)' }}>
                                    <Camera className="w-4 h-4" />
                                    Gerar sua foto
                                </button>
                                <button
                                    onClick={() => handleCopy(selectedPrompt)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                                    style={{ background: PURPLE }}>
                                    {copied === selectedPrompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied === selectedPrompt.id ? 'Copiado!' : 'Copiar Prompt'}
                                </button>
                                {selectedPrompt.tutorial_url && (
                                    <a
                                        href={selectedPrompt.tutorial_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Tutorial
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ArcanoLayout>
    );
}
