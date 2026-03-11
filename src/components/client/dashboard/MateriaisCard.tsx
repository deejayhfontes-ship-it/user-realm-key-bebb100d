import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FolderOpen, Download, ArrowRight, Package } from 'lucide-react';

interface CampanhaBasic {
    id: string;
    title: string;
    slug: string;
    cover_image: string | null;
    description: string | null;
    drive_folder_id: string | null;
}

export function MateriaisCard() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [campanhas, setCampanhas] = useState<CampanhaBasic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!profile?.client_id) { setIsLoading(false); return; }
        supabase
            .from('campanhas' as any)
            .select('id, title, slug, cover_image, description, drive_folder_id')
            .eq('client_id', profile.client_id)
            .eq('status', 'active')
            .order('sort_order', { ascending: true })
            .then(({ data }) => {
                setCampanhas((data as any) || []);
                setIsLoading(false);
            });
    }, [profile?.client_id]);

    if (isLoading || campanhas.length === 0) return null;

    return (
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0a0a0a] overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <Download className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">Materiais para Download</h3>
                        <p className="text-xs text-white/40">{campanhas.length} pacote{campanhas.length > 1 ? 's' : ''} disponível{campanhas.length > 1 ? 'is' : ''}</p>
                    </div>
                </div>
                {campanhas.length > 2 && (
                    <button
                        onClick={() => navigate('/client/materiais')}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Ver todos <ArrowRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Cards de campanha com preview */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {campanhas.map(c => (
                    <button
                        key={c.id}
                        onClick={() => navigate(`/client/materiais/${c.slug}`)}
                        className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] text-left transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.04] hover:scale-[1.01]"
                    >
                        {/* Capa */}
                        <div className="w-full aspect-[16/7] overflow-hidden bg-white/5 relative">
                            {c.cover_image ? (
                                <img
                                    src={c.cover_image}
                                    alt={c.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-500/15 to-teal-500/5 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-emerald-400/30" />
                                </div>
                            )}
                            {/* overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Badge Drive */}
                            {c.drive_folder_id && (
                                <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-[10px] text-white/60 border border-white/10">
                                    <FolderOpen className="w-3 h-3" /> Drive
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                            <p className="font-semibold text-white text-sm leading-tight mb-0.5 group-hover:text-emerald-400 transition-colors">
                                {c.title}
                            </p>
                            {c.description && (
                                <p className="text-xs text-white/40 line-clamp-1">{c.description}</p>
                            )}
                            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                                <Download className="w-3 h-3" /> Acessar arquivos
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
