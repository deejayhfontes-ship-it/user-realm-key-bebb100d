<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, FileText, AlertTriangle, Megaphone, ScrollText, ArrowUpRight } from 'lucide-react';

const MODELOS = [
    {
        titulo: 'Gerador de Avisos',
        descricao: 'Crie avisos oficiais como cortes de água, eventos e comunicados com layout padronizado',
        icone: AlertTriangle,
        rota: '/prefeitura/gerador-avisos',
        cor: 'from-cyan-400 to-teal-500',
        corTexto: 'text-cyan-400',
        ativo: true,
    },
    {
        titulo: 'Gerador de Stories',
        descricao: 'Crie stories para Instagram com a identidade visual da prefeitura',
        icone: Megaphone,
        rota: '/prefeitura/gerador-conteudo',
        cor: 'from-lime-400 to-green-500',
        corTexto: 'text-lime-400',
        ativo: true,
    },
    {
        titulo: 'Carrossel de Interações',
        descricao: 'Monte carrosséis para redes sociais com múltiplos slides',
        icone: ScrollText,
        rota: '/prefeitura/gerador-conteudo?tab=carrossel',
        cor: 'from-indigo-400 to-purple-500',
        corTexto: 'text-indigo-400',
        ativo: true,
    },
    {
        titulo: 'Modelo de Decreto',
        descricao: 'Template oficial para redação de decretos municipais (em breve)',
        icone: FileText,
        rota: '#',
        cor: 'from-zinc-600 to-zinc-700',
        corTexto: 'text-zinc-500',
        ativo: false,
    },
    {
        titulo: 'Modelo de Ofício',
        descricao: 'Template para ofícios e correspondências oficiais (em breve)',
        icone: FileText,
        rota: '#',
        cor: 'from-zinc-600 to-zinc-700',
        corTexto: 'text-zinc-500',
        ativo: false,
    },
];

export default function ModelosOficiais() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/prefeitura')}
                            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar</span>
                        </button>

                        <h1 className="text-xl font-bold text-white">
                            Modelos e Geradores Oficiais
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-black" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Ferramentas e Templates
                    </h2>
                    <p className="text-zinc-400">
                        Templates de decretos, avisos e documentos oficiais que a prefeitura pode rapidamente adaptar e utilizar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {MODELOS.map((modelo) => {
                        const Icone = modelo.icone;
                        return (
                            <button
                                key={modelo.titulo}
                                onClick={() => modelo.ativo && navigate(modelo.rota)}
                                disabled={!modelo.ativo}
                                className={`group relative bg-[#111111] border border-white/[0.08] rounded-2xl p-6 text-left transition-all duration-300 ${modelo.ativo
                                        ? 'hover:border-cyan-400/30 hover:shadow-[0_0_40px_-15px_rgba(34,211,238,0.15)] hover:-translate-y-0.5 cursor-pointer'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${modelo.cor} rounded-xl flex items-center justify-center ${modelo.ativo ? 'group-hover:scale-110' : ''} transition-transform`}>
                                        <Icone className="w-6 h-6 text-white" />
                                    </div>
                                    {modelo.ativo && (
                                        <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-cyan-400 flex items-center justify-center transition-all">
                                            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-black transition-colors" />
                                        </div>
                                    )}
                                    {!modelo.ativo && (
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase bg-zinc-800 px-2 py-0.5 rounded-full">
                                            Em breve
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-lg font-bold text-white mb-2 ${modelo.ativo ? `group-hover:${modelo.corTexto}` : ''} transition-colors`}>
                                    {modelo.titulo}
                                </h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {modelo.descricao}
                                </p>

                                {modelo.ativo && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-teal-400 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
=======
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, FileText, AlertTriangle, Megaphone, ScrollText, ArrowUpRight } from 'lucide-react';

const MODELOS = [
    {
        titulo: 'Gerador de Avisos',
        descricao: 'Crie avisos oficiais como cortes de água, eventos e comunicados com layout padronizado',
        icone: AlertTriangle,
        rota: '/prefeitura/gerador-avisos',
        cor: 'from-cyan-400 to-teal-500',
        corTexto: 'text-cyan-400',
        ativo: true,
    },
    {
        titulo: 'Gerador de Stories',
        descricao: 'Crie stories para Instagram com a identidade visual da prefeitura',
        icone: Megaphone,
        rota: '/prefeitura/gerador-conteudo',
        cor: 'from-lime-400 to-green-500',
        corTexto: 'text-lime-400',
        ativo: true,
    },
    {
        titulo: 'Carrossel de Interações',
        descricao: 'Monte carrosséis para redes sociais com múltiplos slides',
        icone: ScrollText,
        rota: '/prefeitura/gerador-conteudo?tab=carrossel',
        cor: 'from-indigo-400 to-purple-500',
        corTexto: 'text-indigo-400',
        ativo: true,
    },
    {
        titulo: 'Modelo de Decreto',
        descricao: 'Template oficial para redação de decretos municipais (em breve)',
        icone: FileText,
        rota: '#',
        cor: 'from-zinc-600 to-zinc-700',
        corTexto: 'text-zinc-500',
        ativo: false,
    },
    {
        titulo: 'Modelo de Ofício',
        descricao: 'Template para ofícios e correspondências oficiais (em breve)',
        icone: FileText,
        rota: '#',
        cor: 'from-zinc-600 to-zinc-700',
        corTexto: 'text-zinc-500',
        ativo: false,
    },
];

export default function ModelosOficiais() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/prefeitura')}
                            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar</span>
                        </button>

                        <h1 className="text-xl font-bold text-white">
                            Modelos e Geradores Oficiais
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-black" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Ferramentas e Templates
                    </h2>
                    <p className="text-zinc-400">
                        Templates de decretos, avisos e documentos oficiais que a prefeitura pode rapidamente adaptar e utilizar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {MODELOS.map((modelo) => {
                        const Icone = modelo.icone;
                        return (
                            <button
                                key={modelo.titulo}
                                onClick={() => modelo.ativo && navigate(modelo.rota)}
                                disabled={!modelo.ativo}
                                className={`group relative bg-[#111111] border border-white/[0.08] rounded-2xl p-6 text-left transition-all duration-300 ${modelo.ativo
                                        ? 'hover:border-cyan-400/30 hover:shadow-[0_0_40px_-15px_rgba(34,211,238,0.15)] hover:-translate-y-0.5 cursor-pointer'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${modelo.cor} rounded-xl flex items-center justify-center ${modelo.ativo ? 'group-hover:scale-110' : ''} transition-transform`}>
                                        <Icone className="w-6 h-6 text-white" />
                                    </div>
                                    {modelo.ativo && (
                                        <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-cyan-400 flex items-center justify-center transition-all">
                                            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-black transition-colors" />
                                        </div>
                                    )}
                                    {!modelo.ativo && (
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase bg-zinc-800 px-2 py-0.5 rounded-full">
                                            Em breve
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-lg font-bold text-white mb-2 ${modelo.ativo ? `group-hover:${modelo.corTexto}` : ''} transition-colors`}>
                                    {modelo.titulo}
                                </h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {modelo.descricao}
                                </p>

                                {modelo.ativo && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-teal-400 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
