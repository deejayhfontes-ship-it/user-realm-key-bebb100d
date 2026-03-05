import { useNavigate } from 'react-router-dom';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { ArrowRight, UserCheck, ZoomIn, PersonStanding, Shirt, Image } from 'lucide-react';

const LIME = '#D8FF9A';

const tools = [
    {
        id: 'cloner',
        title: 'Arcano Cloner',
        desc: 'Transforme sua foto usando qualquer imagem como referência. A IA clona o estilo, pose e cenário na sua pessoa.',
        href: '/admin/arcano/cloner',
        icon: UserCheck,
        badge: 'Novo',
    },
    {
        id: 'upscaler',
        title: 'Upscaler Arcano V3',
        desc: 'Aumente a qualidade das suas imagens com inteligência artificial. Transforme fotos em alta resolução sem perder detalhes.',
        href: '/admin/arcano/upscaler',
        icon: ZoomIn,
    },
    {
        id: 'pose',
        title: 'Pose Changer',
        desc: 'Mude a pose da sua foto usando qualquer imagem como referência. A IA replica a posição do corpo mantendo seu rosto.',
        href: '/admin/arcano/pose-changer',
        icon: PersonStanding,
    },
    {
        id: 'veste',
        title: 'Veste AI',
        desc: 'Troque a roupa da sua foto usando qualquer imagem como referência. A IA veste a peça na sua pessoa de forma realista.',
        href: '/admin/arcano/veste-ai',
        icon: Shirt,
    },
    {
        id: 'imagem',
        title: 'Gerar Imagem',
        desc: 'Gere imagens incríveis com IA de última geração. Powered by Google Gemini.',
        href: '/admin/arcano/gerar-imagem',
        icon: Image,
        badge: 'Gemini',
    },
];

export default function ArcanoHub() {
    const navigate = useNavigate();

    return (
        <ArcanoLayout>
            <div className="min-h-full px-8 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2">
                        Seja bem vindo ao <span style={{ color: LIME }}>Arcano!</span>
                    </h1>
                    <p className="text-white/40 text-sm">A plataforma dos criadores do futuro.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => navigate(tool.href)}
                            className="relative group rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                            style={{ background: '#1c1c1c' }}
                        >
                            <div className="p-6">
                                {tool.badge && (
                                    <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full text-black"
                                        style={{ background: LIME }}>
                                        {tool.badge}
                                    </span>
                                )}

                                {/* Ícone */}
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                                    style={{ background: 'rgba(216,255,154,0.12)' }}>
                                    <tool.icon className="w-6 h-6" style={{ color: LIME }} />
                                </div>

                                <h3 className="text-base font-bold text-white mb-2">{tool.title}</h3>
                                <p className="text-white/40 text-xs leading-relaxed mb-4">{tool.desc}</p>

                                <div className="flex items-center gap-1.5 text-xs font-bold group-hover:gap-2.5 transition-all"
                                    style={{ color: LIME }}>
                                    <span>Acessar Ferramenta</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {/* Bottom highlight on hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: LIME }} />
                        </div>
                    ))}
                </div>
            </div>
        </ArcanoLayout>
    );
}
