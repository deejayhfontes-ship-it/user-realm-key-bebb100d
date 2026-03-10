import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FolderOpen, ArrowRight } from 'lucide-react';

export function MateriaisCard() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        if (!profile?.client_id) return;
        supabase
            .from('campanhas' as any)
            .select('id', { count: 'exact', head: true })
            .eq('client_id', profile.client_id)
            .eq('status', 'active')
            .then(({ count: c }) => setCount(c ?? 0));
    }, [profile?.client_id]);

    if (count === null || count === 0) return null;

    return (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-500/5 bg-[#0a0a0a] overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Meus Materiais</h3>
                            <p className="text-xs text-white/40">{count} pacote(s) disponível(is)</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-white/50 mb-4">
                    Acesse logos, fotos, vídeos e arquivos disponibilizados para você.
                </p>

                <button
                    onClick={() => navigate('/client/materiais')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition-all group"
                >
                    Ver materiais
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>
        </div>
    );
}
