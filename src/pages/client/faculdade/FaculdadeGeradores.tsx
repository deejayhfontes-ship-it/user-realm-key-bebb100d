import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, ImagePlus, Sparkles, BookImage, Megaphone, Construction, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const GERADORES = [
    {
        id: 'avisos-fasb',
        nome: 'Gerador de Avisos FASB',
        descricao: 'Gere avisos oficiais no padrão FASB (ex: Recessos, Comunicados)',
        icon: FileText,
        gradiente: 'from-blue-600 via-indigo-500 to-violet-400',
        corBorda: 'border-blue-500/20',
        corIcone: 'text-blue-400',
        bgIcone: 'bg-blue-500/10',
        disponivel: true,
        rota: '/faculdade/geradores/avisos-fasb',
    },
    {
        id: 'avisos-universitario',
        nome: 'Gerador de Avisos — Colégio Universitário',
        descricao: 'Gere avisos oficiais no padrão Colégio Universitário (Feed e Stories)',
        icon: FileText,
        gradiente: 'from-teal-600 via-cyan-500 to-emerald-400',
        corBorda: 'border-teal-500/20',
        corIcone: 'text-teal-400',
        bgIcone: 'bg-teal-500/10',
        disponivel: true,
        rota: '/faculdade/geradores/avisos-universitario',
    },
    {
        id: 'post-instagram',
        nome: 'Post Instagram',
        descricao: 'Gere posts prontos para o Instagram com IA — feed, stories e reels',
        icon: ImagePlus,
        gradiente: 'from-pink-600 via-rose-500 to-orange-400',
        corBorda: 'border-pink-500/20',
        corIcone: 'text-pink-400',
        bgIcone: 'bg-pink-500/10',
        disponivel: false,
    },
    {
        id: 'banner',
        nome: 'Banner & Materiais',
        descricao: 'Crie banners, outdoor, roll-up e materiais gráficos com texto e layout automático',
        icon: BookImage,
        gradiente: 'from-blue-600 via-sky-500 to-cyan-400',
        corBorda: 'border-blue-500/20',
        corIcone: 'text-blue-400',
        bgIcone: 'bg-blue-500/10',
        disponivel: false,
    },
    {
        id: 'campanha',
        nome: 'Campanha Completa',
        descricao: 'Gere um kit completo de peças para campanhas — feed, stories, banner e flyer',
        icon: Megaphone,
        gradiente: 'from-amber-600 via-orange-500 to-yellow-400',
        corBorda: 'border-amber-500/20',
        corIcone: 'text-amber-400',
        bgIcone: 'bg-amber-500/10',
        disponivel: false,
    },
    {
        id: 'data-comemorativa',
        nome: 'Data Comemorativa',
        descricao: 'Arte temática para datas especiais com mensagem e identidade visual automáticas',
        icon: Sparkles,
        gradiente: 'from-violet-600 via-purple-500 to-fuchsia-400',
        corBorda: 'border-violet-500/20',
        corIcone: 'text-violet-400',
        bgIcone: 'bg-violet-500/10',
        disponivel: false,
    },
];

export default function FaculdadeGeradores() {
    console.log("FaculdadeGeradores remounted with Avisos FASB");
    const navigate = useNavigate();
    const { user } = useAuth();

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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Geradores</h1>
                            <p className="text-xs text-white/40">Ferramentas de criação com IA</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-fuchsia-400/5 bg-[#0a0a0a] p-8 mb-10">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-[0.07] rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Wand2 className="w-5 h-5 text-violet-400" />
                            <span className="text-violet-400 text-sm font-medium">IA Generativa</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Geradores de Arte</h2>
                        <p className="text-white/50 max-w-lg">
                            Ferramentas com inteligência artificial para criar posts, banners, campanhas e muito mais — em segundos.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                            <Construction className="w-3.5 h-3.5" />
                            Em breve — em desenvolvimento
                        </div>
                    </div>
                </div>

                {/* Grid de Geradores */}
                <div>
                    <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-6">
                        Ferramentas disponíveis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {GERADORES.map((gerador) => {
                            const Icone = gerador.icon;
                            return (
                                <div
                                    key={gerador.id}
                                    onClick={() => gerador.disponivel && gerador.rota ? navigate(gerador.rota) : null}
                                    className={`relative overflow-hidden rounded-2xl border ${gerador.corBorda} bg-[#0a0a0a] p-6 transition-all duration-300 ${gerador.disponivel ? 'opacity-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer' : 'opacity-60 grayscale-[0.3]'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${gerador.bgIcone} flex items-center justify-center flex-shrink-0`}>
                                            <Icone className={`w-6 h-6 ${gerador.corIcone}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-white">{gerador.nome}</h4>
                                                {!gerador.disponivel && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/30 border border-white/10">
                                                        Em breve
                                                    </span>
                                                )}
                                                {gerador.disponivel && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                                        Novo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/40 text-sm leading-relaxed">{gerador.descricao}</p>
                                        </div>
                                    </div>
                                    {/* Decorative glow */}
                                    <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${gerador.gradiente} opacity-[0.04] rounded-full blur-2xl transition-opacity duration-300 ${gerador.disponivel ? 'group-hover:opacity-[0.1]' : ''}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-white/20 text-sm">
                        Novos geradores serão adicionados conforme desenvolvidos
                    </p>
                </div>
            </main>
        </div>
    );
}
