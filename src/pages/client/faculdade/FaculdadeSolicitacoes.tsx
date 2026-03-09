import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Plus, Clock, CheckCircle } from 'lucide-react';

export default function FaculdadeSolicitacoes() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/faculdade')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Solicitações</h1>
                            <p className="text-xs text-white/40">Materiais e serviços</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-400/5 bg-[#0a0a0a] p-8 mb-10">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-[0.07] rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Solicitações</h2>
                            <p className="text-white/50 max-w-lg">
                                Faça e acompanhe suas solicitações de materiais e serviços.
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            Nova solicitação
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                <div className="rounded-2xl border border-white/5 bg-[#0a0a0a] p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-8 h-8 text-emerald-400/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-white/50 mb-2">Nenhuma solicitação ainda</h3>
                    <p className="text-white/30 text-sm max-w-xs mx-auto mb-6">
                        Suas solicitações de materiais e serviços aparecerão aqui
                    </p>
                    <div className="flex items-center justify-center gap-6 text-xs text-white/20">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Em andamento
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Concluídas
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
