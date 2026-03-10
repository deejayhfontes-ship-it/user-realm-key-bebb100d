import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Wrench, Image, FileText, FolderOpen, Construction, Megaphone, ArrowRight } from 'lucide-react';

const MODULOS_FUTUROS = [
    { nome: 'Geradores', descricao: 'Geradores de artes exclusivos', icone: Image, disponivel: false },
    { nome: 'Canvas', descricao: 'Editor de imagens avançado', icone: FileText, disponivel: false },
    { nome: 'Ferramentas', descricao: 'Ferramentas exclusivas', icone: Wrench, disponivel: false },
];

export default function IFAHome() {
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">IFA</h1>
                            <p className="text-xs text-white/40">Área exclusiva</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-pink-400/5 bg-[#0a0a0a] p-8 mb-10">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 opacity-[0.07] rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Bem-vindo ao IFA</h2>
                        <p className="text-white/50 max-w-lg">
                            Esta é sua área exclusiva. Em breve, novos módulos e ferramentas serão adicionados aqui.
                        </p>
                    </div>
                </div>

                {/* Campanhas Card */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate('/faculdade/fasb/campanhas')}
                        className="group w-full text-left rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-orange-400/5 bg-[#0a0a0a] p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/30"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                <Megaphone className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">Campanhas</h4>
                                <p className="text-white/40 text-sm">Acesse materiais, logos, fotos e vídeos das campanhas ativas</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </button>
                </div>

                {/* Módulos Grid */}
                <h3 className="text-lg font-semibold text-white/70 mb-4 flex items-center gap-2">
                    <Construction className="w-5 h-5 text-purple-400" />
                    Módulos em desenvolvimento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MODULOS_FUTUROS.map((modulo) => {
                        const Icone = modulo.icone;
                        return (
                            <div
                                key={modulo.nome}
                                className="rounded-xl border border-white/5 bg-[#0a0a0a] p-6 opacity-50 cursor-default"
                            >
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                                    <Icone className="w-6 h-6 text-purple-400/50" />
                                </div>
                                <h4 className="font-semibold text-white/60 mb-1">{modulo.nome}</h4>
                                <p className="text-white/30 text-sm">{modulo.descricao}</p>
                                <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-white/5 text-white/30">
                                    Em breve
                                </span>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
