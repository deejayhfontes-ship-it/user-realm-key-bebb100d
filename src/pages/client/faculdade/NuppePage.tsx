import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Image } from 'lucide-react';

export default function NuppePage() {
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">NUPPE</h1>
                            <p className="text-xs text-white/40">Núcleo de Pesquisa, Pós-Graduação e Extensão</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 to-cyan-400/5 bg-[#0a0a0a] p-8 mb-10">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-sky-500 to-cyan-400 opacity-[0.07] rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Bem-vindo ao NUPPE</h2>
                        <p className="text-white/50 max-w-lg">
                            Núcleo de Pesquisa, Pós-Graduação e Extensão. Acesse suas ferramentas e geradores exclusivos.
                        </p>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Card Gerador de Peças */}
                    <button
                        onClick={() => navigate('/faculdade/nuppe/gerador-pecas')}
                        className="group rounded-xl border border-sky-400/20 bg-[#0a0a0a] p-6 text-left transition-all duration-300 hover:border-sky-400/40 hover:bg-sky-500/5 hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                            <Image className="w-6 h-6 text-sky-400" />
                        </div>
                        <h4 className="font-semibold text-white mb-1 group-hover:text-sky-400 transition-colors">Gerador de Peças Campanha NUPPE</h4>
                        <p className="text-white/30 text-sm">Crie peças gráficas para as campanhas do NUPPE</p>
                    </button>
                </div>
            </main>
        </div>
    );
}
