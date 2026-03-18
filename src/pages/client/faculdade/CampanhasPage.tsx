import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, ArrowLeft, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import type { Campanha } from '@/types/campanhas';

export default function CampanhasPage() {
    const navigate = useNavigate();
    const { unit } = useParams<{ unit: string }>();
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const unitLabel = unit === 'universitario' ? 'Colégio Universitário' : 'FASB';
    const gradientFrom = unit === 'universitario' ? 'from-blue-500' : 'from-purple-500';
    const gradientTo = unit === 'universitario' ? 'to-cyan-500' : 'to-pink-500';
    const accentColor = unit === 'universitario' ? 'blue' : 'purple';

    useEffect(() => {
        const fetchCampanhas = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('campanhas' as any)
                .select('*')
                .eq('unit', unit)
                .eq('status', 'active')
                .is('client_id', null)
                .order('sort_order', { ascending: true });

            if (!error && data) {
                setCampanhas(data as any);
            }
            setIsLoading(false);
        };
        fetchCampanhas();
    }, [unit]);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/faculdade/${unit}`)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {unitLabel}
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">Campanhas</h1>
                            <p className="text-xs text-white/40">{unitLabel}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero */}
                <div className={`relative overflow-hidden rounded-2xl border border-${accentColor}-500/20 bg-gradient-to-br ${gradientFrom}/10 ${gradientTo}/5 bg-[#0a0a0a] p-8 mb-10`}>
                    <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-[0.07] rounded-full blur-3xl`} />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Campanhas Ativas</h2>
                        <p className="text-white/50 max-w-lg">
                            Acesse os materiais de cada campanha para download de logos, fotos, vídeos e muito mais.
                        </p>
                    </div>
                </div>

                {/* Loading */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className={`w-8 h-8 animate-spin text-${accentColor}-400`} />
                    </div>
                ) : campanhas.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-16 text-center">
                        <Megaphone className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white/50 mb-2">Nenhuma campanha ativa</h3>
                        <p className="text-white/30 text-sm">Novas campanhas serão exibidas aqui quando disponíveis.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campanhas.map(campanha => (
                            <button
                                key={campanha.id}
                                onClick={() => navigate(`/faculdade/${unit}/campanhas/${campanha.slug}`)}
                                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] text-left transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-2xl"
                            >
                                {/* Cover */}
                                <div className="aspect-[16/9] w-full bg-white/5 overflow-hidden">
                                    {campanha.cover_image ? (
                                        <img
                                            src={campanha.cover_image}
                                            alt={campanha.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${gradientFrom}/20 ${gradientTo}/10 flex items-center justify-center`}>
                                            <Megaphone className={`w-12 h-12 text-${accentColor}-400/30`} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                                        {campanha.title}
                                    </h3>
                                    {campanha.description && (
                                        <p className="text-white/40 text-sm line-clamp-2 mb-3">{campanha.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        {campanha.starts_at && (
                                            <span className="flex items-center gap-1 text-xs text-white/30">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(campanha.starts_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                        <span className={`flex items-center gap-1 text-sm font-medium text-${accentColor}-400`}>
                                            Ver materiais
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
