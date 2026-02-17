<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Download, Palette, FileImage, Eye } from 'lucide-react';
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

export default function BrandKit() {
    const navigate = useNavigate();
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);

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
                            Brand Kit Prefeitura
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">

                {/* Logos Section */}
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
                                <div className="aspect-video bg-zinc-900 rounded-xl mb-4 flex items-center justify-center border border-white/[0.04] overflow-hidden">
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

                    <p className="text-xs text-zinc-600 mt-4 text-center">
                        * Para adicionar logos, coloque os arquivos na pasta <code className="text-zinc-500">public/logos/</code> do projeto
                    </p>
                </section>

                {/* Cores Section */}
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
            </main>

            {/* Modal Preview */}
            {previewLogo && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                    onClick={() => setPreviewLogo(null)}
                >
                    <div className="relative max-w-2xl w-full">
                        <img src={previewLogo} alt="Preview" className="w-full rounded-2xl" />
                        <p className="text-center text-zinc-400 mt-4 text-sm">Clique fora para fechar</p>
                    </div>
                </div>
            )}
        </div>
    );
}
=======
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Download, Palette, FileImage, Eye } from 'lucide-react';
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

export default function BrandKit() {
    const navigate = useNavigate();
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);

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
                            Brand Kit Prefeitura
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">

                {/* Logos Section */}
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
                                <div className="aspect-video bg-zinc-900 rounded-xl mb-4 flex items-center justify-center border border-white/[0.04] overflow-hidden">
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

                    <p className="text-xs text-zinc-600 mt-4 text-center">
                        * Para adicionar logos, coloque os arquivos na pasta <code className="text-zinc-500">public/logos/</code> do projeto
                    </p>
                </section>

                {/* Cores Section */}
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
            </main>

            {/* Modal Preview */}
            {previewLogo && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                    onClick={() => setPreviewLogo(null)}
                >
                    <div className="relative max-w-2xl w-full">
                        <img src={previewLogo} alt="Preview" className="w-full rounded-2xl" />
                        <p className="text-center text-zinc-400 mt-4 text-sm">Clique fora para fechar</p>
                    </div>
                </div>
            )}
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
