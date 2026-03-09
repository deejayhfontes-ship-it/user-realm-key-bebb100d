import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Download, Palette, FileImage, Eye, ChevronDown, ChevronUp, X, Package, GraduationCap, Heart, Hammer, Sprout, HandHeart, Dumbbell, Clapperboard, Landmark } from 'lucide-react';
import { useState } from 'react';

const LOGOS = [
    {
        nome: 'Logo Oficial - Colorida',
        descricao: 'Versão principal para uso em materiais oficiais',
        arquivo: '/logos/prefeitura-colorida.png',
        tipo: 'PNG',
    },
    {
        nome: 'Logo Oficial - Branca',
        descricao: 'Versão branca para fundos escuros',
        arquivo: '/logos/prefeitura-branca.png',
        tipo: 'PNG',
    },
    {
        nome: 'Logo Oficial - Preta',
        descricao: 'Versão preta para fundos claros',
        arquivo: '/logos/prefeitura-preta.png',
        tipo: 'PNG',
    },
];

const CORES = [
    { nome: 'Azul Prefeitura', hex: '#004691', uso: 'Cor principal institucional' },
    { nome: 'Amarelo Destaque', hex: '#F5C518', uso: 'Destaques e chamadas' },
    { nome: 'Verde Institucional', hex: '#2D7D46', uso: 'Elementos secundários' },
    { nome: 'Branco', hex: '#FFFFFF', uso: 'Textos em fundo escuro' },
];

const HOSTGATOR_BASE_URL = 'https://cdn.fontesgraphicsdesign.com.br/prefeitura-assets/logosecretariasegoverno';

const SECRETARIAS = [
    {
        nome: 'Secretaria de Educação',
        pasta: '01_EDUCACAO',
        icone: GraduationCap,
        cor: 'from-blue-500 to-blue-700',
        corBg: 'bg-blue-500/10',
        corTexto: 'text-blue-400',
        corBorda: 'border-blue-500/20 hover:border-blue-400/50',
        logos: [
            { arquivo: '01_LOGO PREFEITURA HELIODORA COR_SECRETARIA DE EDUCACAO.png', tipo: 'Colorida' }
        ]
    },
    {
        nome: 'Secretaria de Saúde',
        pasta: '02_SAUDE',
        icone: Heart,
        cor: 'from-red-500 to-rose-600',
        corBg: 'bg-red-500/10',
        corTexto: 'text-red-400',
        corBorda: 'border-red-500/20 hover:border-red-400/50',
        logos: [
            { arquivo: '02_LOGO PREFEITURA HELIODORA _SECRETARIA DE SAUDE_COLORIDA.png', tipo: 'Colorida' },
            { arquivo: '02_LOGO PREFEITURA HELIODORA _SECRETARIA DE SAUDE_MONO 001.png', tipo: 'Mono' },
            { arquivo: '02_LOGO PREFEITURA HELIODORA _SECRETARIA DE SAUDE_NEGATIVA.png', tipo: 'Negativa' }
        ]
    },
    {
        nome: 'Secretaria de Obras',
        pasta: '03_OBRAS',
        icone: Hammer,
        cor: 'from-amber-500 to-orange-600',
        corBg: 'bg-amber-500/10',
        corTexto: 'text-amber-400',
        corBorda: 'border-amber-500/20 hover:border-amber-400/50',
        logos: [
            { arquivo: '03_LOGO PREFEITURA HELIODORA _SECRETARIA DE OBRAS.png', tipo: 'Oficial' },
            { arquivo: 'COLORIDA.png', tipo: 'Colorida' },
            { arquivo: 'MONO 001.png', tipo: 'Mono' },
            { arquivo: 'NEGATIVA.png', tipo: 'Negativa' }
        ]
    },
    {
        nome: 'Secretaria de Agricultura',
        pasta: '04_AGRICULTURA',
        icone: Sprout,
        cor: 'from-green-500 to-emerald-600',
        corBg: 'bg-green-500/10',
        corTexto: 'text-green-400',
        corBorda: 'border-green-500/20 hover:border-green-400/50',
        logos: [
            { arquivo: '04_LOGO PREFEITURA HELIODORA _SECRETARIA DE AGRICULTURA.png', tipo: 'Oficial' },
            { arquivo: 'COLORIDA.png', tipo: 'Colorida' },
            { arquivo: 'MONO 001.png', tipo: 'Mono' },
            { arquivo: 'NEGATIVA.png', tipo: 'Negativa' }
        ]
    },
    {
        nome: 'Assistência Social',
        pasta: '05_ASSITENCIA_SOCIAL',
        icone: HandHeart,
        cor: 'from-pink-500 to-fuchsia-600',
        corBg: 'bg-pink-500/10',
        corTexto: 'text-pink-400',
        corBorda: 'border-pink-500/20 hover:border-pink-400/50',
        logos: [
            { arquivo: 'COLORIDA.png', tipo: 'Colorida' },
            { arquivo: 'MONO 001.png', tipo: 'Mono' },
            { arquivo: 'NEGATIVA.png', tipo: 'Negativa' }
        ]
    },
    {
        nome: 'Diretoria de Esporte e Lazer',
        pasta: '06_DERETORIA_DE_ESPORTE_E_LAZER',
        icone: Dumbbell,
        cor: 'from-cyan-500 to-teal-600',
        corBg: 'bg-cyan-500/10',
        corTexto: 'text-cyan-400',
        corBorda: 'border-cyan-500/20 hover:border-cyan-400/50',
        logos: [
            { arquivo: 'COLORIDA.png', tipo: 'Colorida' },
            { arquivo: 'MONO 001.png', tipo: 'Mono' },
            { arquivo: 'NEGATIVA.png', tipo: 'Negativa' }
        ]
    },
    {
        nome: 'Diretoria de Cultura e Turismo',
        pasta: '07_DIRETORIA_DE_CULTURA_E_TURISMO',
        icone: Clapperboard,
        cor: 'from-purple-500 to-violet-600',
        corBg: 'bg-purple-500/10',
        corTexto: 'text-purple-400',
        corBorda: 'border-purple-500/20 hover:border-purple-400/50',
        logos: [
            { arquivo: 'COLORIDA.png', tipo: 'Colorida' },
            { arquivo: 'MONO 001.png', tipo: 'Mono' },
            { arquivo: 'NEGATIVA.png', tipo: 'Negativa' }
        ]
    },
    {
        nome: 'Sec. de Administração e Planejamento',
        pasta: '08_SECRETARIA_DE_ADM',
        icone: Landmark,
        cor: 'from-slate-500 to-zinc-600',
        corBg: 'bg-slate-500/10',
        corTexto: 'text-slate-400',
        corBorda: 'border-slate-500/20 hover:border-slate-400/50',
        logos: [
            { arquivo: 'COLORIDA.png', tipo: 'Colorida' },
            { arquivo: 'MONO 001.png', tipo: 'Mono' },
            { arquivo: 'NEGATIVA.png', tipo: 'Negativa' }
        ]
    }
];

export default function BrandKit() {
    const navigate = useNavigate();
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#050505] text-white" style={{ colorScheme: 'dark' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/80 border-b border-white/[0.06]">
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
                            🏛️ Brand Kit Prefeitura
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">

                {/* Logos Oficiais */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                            <FileImage className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Logos Oficiais</h2>
                            <p className="text-sm text-zinc-500">Baixe as versões aprovadas</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {LOGOS.map((logo) => (
                            <div
                                key={logo.nome}
                                className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 hover:border-rose-400/30 transition-all group"
                            >
                                <div className="aspect-video bg-[#0a0a0a] rounded-xl mb-4 flex items-center justify-center border border-white/[0.04] overflow-hidden">
                                    <Palette className="w-12 h-12 text-zinc-700 group-hover:text-rose-400/50 transition-colors" />
                                </div>
                                <h3 className="font-bold text-white text-sm mb-1">{logo.nome}</h3>
                                <p className="text-xs text-zinc-500 mb-3">{logo.descricao}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPreviewLogo(logo.arquivo)}
                                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white py-2 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Ver
                                    </button>
                                    <a
                                        href={logo.arquivo}
                                        download
                                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 py-2 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {logo.tipo}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Paleta de Cores */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                            <Palette className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Paleta de Cores</h2>
                            <p className="text-sm text-zinc-500">Cores oficiais da identidade visual</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CORES.map((cor) => (
                            <button
                                key={cor.hex}
                                onClick={() => navigator.clipboard.writeText(cor.hex)}
                                className="bg-[#111111] border border-white/[0.08] rounded-2xl p-4 hover:border-rose-400/30 transition-all text-left group"
                                title="Clique para copiar"
                            >
                                <div
                                    className="w-full aspect-square rounded-xl mb-3 border border-white/[0.06]"
                                    style={{ backgroundColor: cor.hex }}
                                />
                                <h3 className="font-bold text-white text-sm">{cor.nome}</h3>
                                <p className="text-xs text-zinc-500 mb-1">{cor.uso}</p>
                                <code className="text-xs text-rose-400 group-hover:text-rose-300 font-mono">{cor.hex}</code>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════ */}
                {/* LOGOS DAS SECRETARIAS - SEÇÃO REDESENHADA */}
                {/* ═══════════════════════════════════════════════════ */}
                <section>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Logos das Secretarias & Governo</h2>
                            <p className="text-sm text-zinc-500">Clique em uma secretaria para ver e baixar os materiais</p>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-600 mb-8 ml-[52px]">
                        Cada secretaria possui versões Colorida, Monocromática e Negativa em alta resolução
                    </p>

                    {/* Grid de Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {SECRETARIAS.map((sec) => {
                            const Icone = sec.icone;
                            const isExpanded = expandedCard === sec.pasta;

                            return (
                                <div
                                    key={sec.pasta}
                                    className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded
                                            ? 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 ' + sec.corBorda
                                            : 'bg-[#111111] ' + sec.corBorda
                                        }`}
                                >
                                    {/* Card Header - Sempre visível */}
                                    <button
                                        onClick={() => setExpandedCard(isExpanded ? null : sec.pasta)}
                                        className="w-full text-left p-5 flex items-center gap-4 group"
                                    >
                                        {/* Ícone da Secretaria */}
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sec.cor} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                                            <Icone className="w-7 h-7 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white text-base truncate">{sec.nome}</h3>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {sec.logos.length} {sec.logos.length === 1 ? 'versão' : 'versões'} disponíveis
                                            </p>
                                        </div>

                                        <div className={`${sec.corTexto} transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </button>

                                    {/* Conteúdo expandido */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-white/[0.06] pt-5 bg-[#0a0a0a]">
                                            {/* Preview das logos */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
                                                {sec.logos.map((logo) => {
                                                    const fileUrl = `${HOSTGATOR_BASE_URL}/${sec.pasta}/${encodeURIComponent(logo.arquivo)}`;
                                                    return (
                                                        <div
                                                            key={logo.arquivo}
                                                            className="bg-[#111111] border border-white/[0.06] rounded-xl p-3 group hover:border-white/[0.15] transition-all"
                                                        >
                                                            {/* Preview da Imagem */}
                                                            <div
                                                                className="aspect-[4/3] bg-[#1a1a1a] rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer relative"
                                                                onClick={() => setPreviewLogo(fileUrl)}
                                                            >
                                                                <img
                                                                    src={fileUrl}
                                                                    alt={`${sec.nome} - ${logo.tipo}`}
                                                                    className="max-w-full max-h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                                <div className="hidden flex-col items-center gap-2">
                                                                    <Icone className={`w-8 h-8 ${sec.corTexto} opacity-50`} />
                                                                    <span className="text-[10px] text-zinc-600">Preview indisponível</span>
                                                                </div>
                                                                {/* Hover overlay */}
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <Eye className="w-6 h-6 text-white" />
                                                                </div>
                                                            </div>

                                                            {/* Info + Download */}
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className={`font-bold text-sm ${sec.corTexto}`}>{logo.tipo}</h4>
                                                                    <p className="text-[10px] text-zinc-600 truncate max-w-[140px]" title={logo.arquivo}>
                                                                        {logo.arquivo}
                                                                    </p>
                                                                </div>
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    download
                                                                    className={`p-2 rounded-lg border ${sec.corBorda} ${sec.corBg} hover:scale-110 transition-all`}
                                                                    title="Baixar PNG"
                                                                >
                                                                    <Download className={`w-4 h-4 ${sec.corTexto}`} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Botão Download ZIP */}
                                            <div className="flex items-center justify-between bg-[#111111] rounded-xl px-4 py-3 border border-white/[0.06]">
                                                <div className="flex items-center gap-3">
                                                    <Package className={`w-5 h-5 ${sec.corTexto}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">Baixar todos os materiais</p>
                                                        <p className="text-[10px] text-zinc-500">{sec.logos.length} arquivos • PNG alta resolução</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`${HOSTGATOR_BASE_URL}/${sec.pasta}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${sec.cor} text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all`}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download ZIP
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* Modal Preview Fullscreen */}
            {previewLogo && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
                    onClick={() => setPreviewLogo(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        onClick={() => setPreviewLogo(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="relative max-w-3xl w-full">
                        <img src={previewLogo} alt="Preview" className="w-full rounded-2xl shadow-2xl" />
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <a
                                href={previewLogo}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Imagem
                            </a>
                            <button
                                onClick={() => setPreviewLogo(null)}
                                className="px-6 py-3 text-zinc-400 hover:text-white border border-white/10 rounded-xl hover:border-white/30 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
