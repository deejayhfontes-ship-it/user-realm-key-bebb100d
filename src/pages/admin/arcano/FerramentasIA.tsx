import { useState, useEffect } from 'react';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LIME = '#D8FF9A';

interface Ferramenta {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cover_url: string | null;
    route: string | null;
    is_visible: boolean;
    is_coming_soon: boolean;
    display_order: number;
}

export default function FerramentasIA() {
    const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFerramentas();
    }, []);

    async function fetchFerramentas() {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from('arcano_ferramentas')
            .select('*')
            .eq('is_visible', true)
            .order('display_order', { ascending: true });

        if (!error && data) setFerramentas(data);
        setLoading(false);
    }

    // Map slugs to existing admin routes
    const slugToRoute: Record<string, string> = {
        'upscaller-arcano': '/admin/arcano/upscaler',
        'arcano-cloner': '/admin/arcano/cloner',
        'ia-muda-pose': '/admin/arcano/pose-changer',
        'ia-muda-roupa': '/admin/arcano/veste-ai',
    };

    function handleClick(f: Ferramenta) {
        if (f.is_coming_soon) return;
        const route = slugToRoute[f.slug] || f.route || '/admin/arcano';
        navigate(route);
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
                            Ferramentas de <span style={{ color: LIME }}>IA</span>
                        </h1>
                    </div>
                    <p className="text-white/40 text-sm pl-12">
                        Ferramentas poderosas impulsionadas por inteligência artificial
                    </p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${LIME} transparent ${LIME} ${LIME}` }} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
                        {ferramentas.map(f => (
                            <div
                                key={f.id}
                                onClick={() => handleClick(f)}
                                className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${f.is_coming_soon
                                        ? 'border-white/5 opacity-60 cursor-default'
                                        : 'border-white/10 hover:border-white/25 cursor-pointer hover:scale-[1.02]'
                                    }`}
                                style={{ background: '#1c1c1c' }}
                            >
                                {/* Cover */}
                                <div className="aspect-video overflow-hidden relative">
                                    {f.cover_url ? (
                                        <img
                                            src={f.cover_url}
                                            alt={f.name}
                                            className={`w-full h-full object-cover transition-transform duration-300 ${!f.is_coming_soon ? 'group-hover:scale-110' : ''
                                                }`}
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#252525' }}>
                                            <Sparkles className="w-10 h-10 text-white/10" />
                                        </div>
                                    )}
                                    {f.is_coming_soon && (
                                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 text-white/60">
                                                <Clock className="w-3 h-3" />
                                                Em Breve
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h3 className="text-base font-bold text-white mb-1.5">{f.name}</h3>
                                    <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">
                                        {f.description}
                                    </p>

                                    {!f.is_coming_soon && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold group-hover:gap-2.5 transition-all"
                                            style={{ color: LIME }}>
                                            <span>Acessar</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>

                                {/* Bottom highlight */}
                                {!f.is_coming_soon && (
                                    <div className="h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ background: LIME }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ArcanoLayout>
    );
}
