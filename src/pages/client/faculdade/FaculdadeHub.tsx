import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Building2, ArrowRight, LogOut, BookOpen, Palette, ClipboardList } from 'lucide-react';

const TODAS_AREAS = [
    {
        id: 'universitario',
        nome: 'Colégio Universitário',
        descricao: 'Acesse os materiais, geradores e ferramentas do Colégio Universitário',
        icone: GraduationCap,
        rota: '/faculdade/universitario',
        gradiente: 'from-blue-600 via-blue-500 to-cyan-400',
        gradienteBg: 'from-blue-600/10 to-cyan-400/5',
        corBorda: 'border-blue-500/20',
        corIcone: 'text-blue-400',
        corHover: 'group-hover:shadow-blue-500/20',
        bgIcone: 'bg-blue-500/10',
        units: ['ifa-universitario'], // emails com este prefixo veem este card
    },
    {
        id: 'ifa',
        nome: 'IFA',
        descricao: 'Acesse os materiais, geradores e ferramentas do IFA',
        icone: Building2,
        rota: '/faculdade/ifa',
        gradiente: 'from-purple-600 via-purple-500 to-pink-400',
        gradienteBg: 'from-purple-600/10 to-pink-400/5',
        corBorda: 'border-purple-500/20',
        corIcone: 'text-purple-400',
        corHover: 'group-hover:shadow-purple-500/20',
        bgIcone: 'bg-purple-500/10',
        units: ['ifa-universitario'], // só usuário IFA vê este card
    },
    {
        id: 'fasb',
        nome: 'FASB',
        descricao: 'Acesse os materiais, geradores e ferramentas da FASB',
        icone: Building2,
        rota: '/faculdade/ifa', // reutiliza a mesma rota por ora
        gradiente: 'from-orange-600 via-orange-500 to-amber-400',
        gradienteBg: 'from-orange-600/10 to-amber-400/5',
        corBorda: 'border-orange-500/20',
        corIcone: 'text-orange-400',
        corHover: 'group-hover:shadow-orange-500/20',
        bgIcone: 'bg-orange-500/10',
        units: ['fasb'], // só usuário FASB vê este card
    },
    {
        id: 'solicitacoes',
        nome: 'Solicitações',
        descricao: 'Acompanhe e faça novas solicitações de materiais e serviços',
        icone: ClipboardList,
        rota: '/faculdade/solicitacoes',
        gradiente: 'from-emerald-600 via-emerald-500 to-teal-400',
        gradienteBg: 'from-emerald-600/10 to-teal-400/5',
        corBorda: 'border-emerald-500/20',
        corIcone: 'text-emerald-400',
        corHover: 'group-hover:shadow-emerald-500/20',
        bgIcone: 'bg-emerald-500/10',
        units: ['ifa-universitario', 'fasb'], // todos veem
    },
];

export default function FaculdadeHub() {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();

    // Detectar qual "unit" o usuário pertence baseado no email
    const email = user?.email?.toLowerCase() ?? '';
    let unit = 'desconhecido';
    if (email.includes('fasb')) unit = 'fasb';
    else if (email.includes('ifa')) unit = 'ifa-universitario';

    // Filtrar áreas visíveis para este usuário
    const areasVisiveis = TODAS_AREAS.filter(area => area.units.includes(unit));

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const colunas = areasVisiveis.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Área Educacional</h1>
                            <p className="text-xs text-white/40">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-16">
                {/* Welcome Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-6">
                        <Palette className="w-4 h-4" />
                        Fontes Graphics Platform
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                        Selecione sua área
                    </h2>
                    <p className="text-white/40 text-lg max-w-md mx-auto">
                        Escolha a seção para acessar seus materiais e ferramentas exclusivas
                    </p>
                </div>

                {/* Cards Grid */}
                <div className={`grid grid-cols-1 ${colunas} gap-6 max-w-5xl mx-auto`}>
                    {areasVisiveis.map((area) => {
                        const Icone = area.icone;
                        return (
                            <button
                                key={area.id}
                                onClick={() => navigate(area.rota)}
                                className={`group relative overflow-hidden rounded-2xl border ${area.corBorda} bg-gradient-to-br ${area.gradienteBg} bg-[#0a0a0a] p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${area.corHover}`}
                            >
                                {/* Gradient Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${area.gradiente} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl ${area.bgIcone} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                                    <Icone className={`w-8 h-8 ${area.corIcone}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-white mb-2">{area.nome}</h3>
                                <p className="text-white/40 text-sm leading-relaxed mb-6">{area.descricao}</p>

                                {/* CTA */}
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <span className={`bg-gradient-to-r ${area.gradiente} bg-clip-text text-transparent`}>
                                        Acessar área
                                    </span>
                                    <ArrowRight className={`w-4 h-4 ${area.corIcone} transition-transform duration-300 group-hover:translate-x-1`} />
                                </div>

                                {/* Decorative Corner */}
                                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${area.gradiente} opacity-[0.05] rounded-full blur-2xl group-hover:opacity-[0.1] transition-opacity duration-500`} />
                            </button>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="text-center mt-16">
                    <p className="text-white/20 text-sm">
                        Cada área contém materiais, geradores e ferramentas exclusivas
                    </p>
                </div>
            </main>
        </div>
    );
}
