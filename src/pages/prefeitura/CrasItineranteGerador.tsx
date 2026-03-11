import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Eye } from 'lucide-react';

// Imagens do template Figma (servidas pelo Figma Dev Mode MCP local)
// Em produção, hospede as imagens no projeto e substitua as URLs abaixo
const IMG_PATTERN = 'http://localhost:3845/assets/a25e9cb720a1b6f4696def93186214bc06efc8ca.svg';
const IMG_LOGO = 'http://localhost:3845/assets/52add733f1e2711ee7ac0494890ee51c52ba9920.png';
const IMG_VAN = 'http://localhost:3845/assets/67b7a86baa773398eb36970d809477b850f48bdd.png';
const IMG_RODAPE = 'http://localhost:3845/assets/9c9293deb83f8fb9ac456ee714f3a40fdf34b966.png';

interface CamposForm {
    bairro: string;
    data: string;
    hora: string;
    texto: string;
}

const DEFAULT: CamposForm = {
    bairro: 'bairro da floresta',
    data: '22 Março',
    hora: '13H',
    texto: 'Participe de uma tarde especial de acolhimento, informação e convivência para toda a comunidade. Será um momento para esclarecer dúvidas, conhecer serviços, fortalecer vínculos e garantir direitos. Sua presença é muito importante.\n\nEsperamos por você!',
};

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
        img.src = src;
    });
}

// Quebra texto em linhas para caber na largura indicada
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');
    for (const para of paragraphs) {
        if (!para.trim()) { lines.push(''); continue; }
        const words = para.split(' ');
        let current = '';
        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            if (ctx.measureText(test).width <= maxWidth) {
                current = test;
            } else {
                if (current) lines.push(current);
                current = word;
            }
        }
        if (current) lines.push(current);
    }
    return lines;
}

export default function CrasItineranteGerador() {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [campos, setCampos] = useState<CamposForm>(DEFAULT);
    const [gerando, setGerando] = useState(false);
    const [erroImagem, setErroImagem] = useState(false);

    const renderCanvas = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1080;
        canvas.height = 1080;

        // Fundo gradiente azul claro (fallback se imagens não carregarem)
        const grad = ctx.createLinearGradient(0, 0, 0, 1080);
        grad.addColorStop(0, '#e0f4ff');
        grad.addColorStop(1, '#bde8ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1080);

        try {
            // Carregar imagens (sem pattern SVG por questões de CORS — substitui por gradiente)
            const [imgLogo, imgVan, imgRodape] = await Promise.all([
                IMG_LOGO, IMG_VAN, IMG_RODAPE
            ].map(src => loadImage(src).catch(() => null)));

            setErroImagem(false);

            // Logo CRAS ITINERANTE (topo esquerdo)
            if (imgLogo) {
                const logoW = 400;
                const logoH = (imgLogo.height / imgLogo.width) * logoW;
                ctx.drawImage(imgLogo, 53, 42, logoW, logoH);
            } else {
                // Fallback texto logo
                ctx.fillStyle = '#0771b6';
                ctx.font = 'bold 72px Inter, Arial, sans-serif';
                ctx.fillText('CRAS', 60, 120);
                ctx.fillStyle = '#f5c400';
                ctx.font = 'bold 48px Inter, Arial, sans-serif';
                ctx.fillText('ITINERANTE', 60, 175);
            }

            // DATA + HORA + BAIRRO (topo direito)
            const dataLine = `${campos.data.toUpperCase()} ${campos.hora.toUpperCase()}`;
            ctx.textAlign = 'right';
            ctx.fillStyle = '#0771b6';
            ctx.font = 'bold 56px Inter, Arial, sans-serif';
            ctx.fillText(dataLine, 1000, 100);

            ctx.font = '400 40px Inter, Arial, sans-serif';
            ctx.fillStyle = '#0a4b7a';
            ctx.fillText(campos.bairro.toLowerCase(), 1000, 152);

            ctx.textAlign = 'left';

            // Título "O CRAS"
            ctx.font = '900 96px Inter, Arial, sans-serif';
            ctx.fillStyle = '#043555';
            ctx.fillText('O CRAS', 80, 440);

            // "vai até você!"
            ctx.font = '600 96px Inter, Arial, sans-serif';
            ctx.fillStyle = '#0771b6';
            ctx.fillText('vai até você!', 80, 550);

            // BAIRRO destaque
            ctx.font = 'bold 64px Inter, Arial, sans-serif';
            ctx.fillStyle = '#0771b6';
            const bairroLines = wrapText(ctx, campos.bairro, 430);
            bairroLines.forEach((line, i) => {
                ctx.fillText(line, 80, 640 + i * 76);
            });

            // Texto descritivo
            ctx.font = '500 26px Inter, Arial, sans-serif';
            ctx.fillStyle = '#0771b6';
            const textoLines = wrapText(ctx, campos.texto, 420);
            let textoY = 640 + bairroLines.length * 76 + 20;
            textoLines.forEach((line) => {
                ctx.fillText(line, 80, textoY);
                textoY += 36;
            });

            // Van CRAS (direita, centro)
            if (imgVan) {
                const vanW = 660;
                const vanH = (imgVan.height / imgVan.width) * vanW;
                ctx.drawImage(imgVan, 400, 350, vanW, vanH);
            }

            // Rodapé
            if (imgRodape) {
                const rpH = 104;
                const rpW = 1080;
                ctx.drawImage(imgRodape, 0, 976, rpW, rpH);
            } else {
                // fallback rodapé
                ctx.fillStyle = '#043555';
                ctx.fillRect(0, 976, 1080, 104);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 24px Inter, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('PREFEITURA MUNICIPAL DE HELIODORA | SECRETARIA DE ASSISTÊNCIA SOCIAL', 540, 1036);
                ctx.textAlign = 'left';
            }

        } catch {
            setErroImagem(true);
        }
    }, [campos]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    function handleCampo<K extends keyof CamposForm>(key: K) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setCampos(prev => ({ ...prev, [key]: e.target.value }));
        };
    }

    function baixarPNG() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        const bairroSlug = campos.bairro.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        link.download = `cras-itinerante-${bairroSlug}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    }

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/prefeitura/secretarias')}
                        className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar</span>
                    </button>

                    <h1 className="text-xl font-bold text-white">CRAS Itinerante — Gerador</h1>

                    <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Formulário */}
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Personalizar Arte</h2>
                            <p className="text-zinc-400 text-sm">Preencha os campos abaixo e veja o preview ao vivo</p>
                        </div>

                        {erroImagem && (
                            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-400">
                                ⚠️ Algumas imagens do template não carregaram (requer Figma Desktop aberto na porta 3845). O layout base ainda funciona.
                            </div>
                        )}

                        {/* Bairro */}
                        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
                            <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">
                                Nome do Bairro
                            </label>
                            <input
                                type="text"
                                value={campos.bairro}
                                onChange={handleCampo('bairro')}
                                placeholder="Ex: Centro, Vila Nova, Jardim América..."
                                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-400/50 transition-colors text-lg font-medium"
                            />
                        </div>

                        {/* Data + Hora */}
                        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
                            <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">
                                Data e Hora
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Data (ex: 22 Março)</label>
                                    <input
                                        type="text"
                                        value={campos.data}
                                        onChange={handleCampo('data')}
                                        placeholder="22 Março"
                                        className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-400/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Hora (ex: 13H)</label>
                                    <input
                                        type="text"
                                        value={campos.hora}
                                        onChange={handleCampo('hora')}
                                        placeholder="13H"
                                        className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-400/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Texto */}
                        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
                            <label className="block text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">
                                Texto Descritivo
                            </label>
                            <textarea
                                value={campos.texto}
                                onChange={handleCampo('texto')}
                                rows={6}
                                className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-400/50 transition-colors resize-none text-sm leading-relaxed"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setCampos(DEFAULT); }}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-sm font-medium"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Resetar
                            </button>

                            <button
                                onClick={baixarPNG}
                                disabled={gerando}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-bold transition-all shadow-[0_0_30px_-10px_rgba(167,139,250,0.5)] hover:shadow-[0_0_40px_-10px_rgba(167,139,250,0.7)] disabled:opacity-60"
                            >
                                <Download className="w-5 h-5" />
                                {gerando ? 'Gerando...' : 'Baixar PNG (1080×1080)'}
                            </button>
                        </div>

                        <p className="text-xs text-zinc-600 text-center">
                            Arte gerada em resolução 1080×1080px — ideal para Instagram
                        </p>
                    </div>

                    {/* Preview Canvas */}
                    <div className="sticky top-24">
                        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Preview ao vivo</span>
                                <span className="text-xs text-zinc-600">1080 × 1080</span>
                            </div>
                            <div className="w-full aspect-square overflow-hidden rounded-xl bg-[#0a0a0a]">
                                <canvas
                                    ref={canvasRef}
                                    style={{ width: '100%', height: '100%', imageRendering: 'crisp-edges' }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
