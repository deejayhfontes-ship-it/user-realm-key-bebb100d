import { useState, useEffect, useMemo } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { supabase } from '@/integrations/supabase/client';
import { Search, Copy, Check, ExternalLink, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const LIME = '#D8FF9A';
const CATEGORIES = ['Todos', 'Fotos', 'Cenários', 'Selos 3D', 'Logo', 'Miniatura', 'Capas', 'Flyer', 'Mockup', 'Pet', 'Outro'];

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
}

export default function BibliotecaPrompts() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Todos');
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [copied, setCopied] = useState(false);
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 24;

    useEffect(() => {
        fetchPrompts();
    }, []);

    async function fetchPrompts() {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from('arcano_prompts')
            .select('id,title,prompt,image_url,thumbnail_url,category,is_premium,tutorial_url,prompt_type')
            .order('created_at', { ascending: false });

        if (!error && data) setPrompts(data);
        setLoading(false);
    }

    const filtered = useMemo(() => {
        let result = prompts;
        if (category !== 'Todos') result = result.filter(p => p.category === category);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.prompt.toLowerCase().includes(q)
            );
        }
        return result;
    }, [prompts, category, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    useEffect(() => { setPage(0); }, [category, search]);

    async function handleCopy(text: string) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <ArcanoLayout>
            <div className="min-h-full px-8 py-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: LIME }}>
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <h1 className="text-2xl font-black text-white">
                            Biblioteca de <span style={{ color: LIME }}>Prompts</span>
                        </h1>
                    </div>
                    <p className="text-white/40 text-sm pl-12">
                        {prompts.length} prompts disponíveis para gerar imagens incríveis com IA
                    </p>
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar prompts..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                            style={{ background: '#1c1c1c' }}
                        />
                    </div>
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={{
                                background: category === cat ? LIME : '#1c1c1c',
                                color: category === cat ? '#000' : 'rgba(255,255,255,0.5)',
                                border: `1px solid ${category === cat ? LIME : 'rgba(255,255,255,0.1)'}`,
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${LIME} transparent ${LIME} ${LIME}` }} />
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="text-center py-20 text-white/30 text-sm">
                        Nenhum prompt encontrado
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {paginated.map(p => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPrompt(p)}
                                className="group rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-200 hover:scale-[1.03]"
                                style={{ background: '#1c1c1c' }}
                            >
                                <div className="aspect-square overflow-hidden relative">
                                    {p.image_url ? (
                                        <img
                                            src={p.thumbnail_url || p.image_url}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#252525' }}>
                                            <Sparkles className="w-8 h-8 text-white/10" />
                                        </div>
                                    )}
                                    {p.is_premium && (
                                        <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-black" style={{ background: '#ffd700' }}>
                                            PRO
                                        </span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="text-xs font-bold text-white truncate">{p.title}</h3>
                                    <p className="text-[10px] text-white/30 mt-0.5">{p.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-white/40 font-medium">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Modal */}
                {selectedPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <div
                            className="relative w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            style={{ background: '#1c1c1c' }}
                        >
                            {/* Close */}
                            <button
                                onClick={() => setSelectedPrompt(null)}
                                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-black/50 text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Image */}
                            {selectedPrompt.image_url && (
                                <div className="w-full aspect-video overflow-hidden">
                                    <img
                                        src={selectedPrompt.image_url}
                                        alt={selectedPrompt.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{selectedPrompt.title}</h2>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                                            style={{ background: 'rgba(216,255,154,0.15)', color: LIME }}>
                                            {selectedPrompt.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Prompt text */}
                                <div className="rounded-xl p-4 mb-4 max-h-40 overflow-y-auto text-xs text-white/70 leading-relaxed whitespace-pre-wrap"
                                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {selectedPrompt.prompt}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopy(selectedPrompt.prompt)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:brightness-110"
                                        style={{ background: LIME }}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copiado!' : 'Copiar Prompt'}
                                    </button>
                                    {selectedPrompt.tutorial_url && (
                                        <a
                                            href={selectedPrompt.tutorial_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Tutorial
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ArcanoLayout>
    );
}
