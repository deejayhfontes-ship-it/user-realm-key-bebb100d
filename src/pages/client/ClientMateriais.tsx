import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FolderOpen, ArrowLeft, Calendar, ArrowRight, Loader2, Package } from 'lucide-react';
import type { Campanha } from '@/types/campanhas';

export default function ClientMateriais() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCampanhas = async () => {
            if (!profile?.client_id) return;
            setIsLoading(true);
            const { data, error } = await supabase
                .from('campanhas' as any)
                .select('*')
                .eq('client_id', profile.client_id)
                .eq('status', 'active')
                .order('sort_order', { ascending: true });

            if (!error && data) {
                setCampanhas(data as any);
            }
            setIsLoading(false);
        };
        fetchCampanhas();
    }, [profile?.client_id]);

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">Meus Materiais</h1>
                            <p className="text-xs text-white/40">Arquivos e materiais disponíveis</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-400/5 bg-[#0a0a0a] p-8 mb-10">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-[0.07] rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Seus Materiais</h2>
                        <p className="text-white/50 max-w-lg">
                            Acesse os arquivos, logos, fotos e materiais disponibilizados exclusivamente para você.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    </div>
                ) : campanhas.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-16 text-center">
                        <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white/50 mb-2">Nenhum material disponível</h3>
                        <p className="text-white/30 text-sm">Novos materiais serão exibidos aqui quando disponíveis.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campanhas.map(campanha => (
                            <button
                                key={campanha.id}
                                onClick={() => navigate(`/client/materiais/${campanha.slug}`)}
                                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] text-left transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/5"
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
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                                            <FolderOpen className="w-12 h-12 text-emerald-400/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
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
                                        <span className="flex items-center gap-1 text-sm font-medium text-emerald-400 ml-auto">
                                            Ver arquivos
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
