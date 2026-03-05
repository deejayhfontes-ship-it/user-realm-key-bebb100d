import { useNavigate } from 'react-router-dom';
import { ArcanoLayout } from '@/components/admin/arcano/ArcanoLayout';
import { ArrowRight, UserCheck, ZoomIn, PersonStanding, Shirt, Image } from 'lucide-react';

const tools = [
    {
        id: 'cloner',
        title: 'Arcano Cloner',
        desc: 'Transforme sua foto usando qualquer imagem como referência. A IA clona o estilo, pose e cenário na sua pessoa.',
        href: '/admin/arcano/cloner',
        icon: UserCheck,
        badge: 'Novo',
        gradient: 'from-violet-700 to-purple-900',
    },
    {
        id: 'upscaler',
        title: 'Upscaler Arcano V3',
        desc: 'Aumente a qualidade das suas imagens com inteligência artificial. Transforme fotos em alta resolução sem perder detalhes.',
        href: '/admin/arcano/upscaler',
        icon: ZoomIn,
        gradient: 'from-indigo-700 to-violet-900',
    },
    {
        id: 'pose',
        title: 'Pose Changer',
        desc: 'Mude a pose da sua foto usando qualquer imagem como referência. A IA replica a posição do corpo mantendo seu rosto.',
        href: '/admin/arcano/pose-changer',
        icon: PersonStanding,
        gradient: 'from-fuchsia-700 to-purple-900',
    },
    {
        id: 'veste',
        title: 'Veste AI',
        desc: 'Troque a roupa da sua foto usando qualquer imagem como referência. A IA veste a peça na sua pessoa de forma realista.',
        href: '/admin/arcano/veste-ai',
        icon: Shirt,
        gradient: 'from-pink-700 to-violet-900',
    },
    {
        id: 'imagem',
        title: 'Gerar Imagem',
        desc: 'Gere imagens incríveis com IA de última geração. Powered by Google Gemini.',
        href: '/admin/arcano/gerar-imagem',
        icon: Image,
        badge: 'Gemini',
        gradient: 'from-blue-700 to-violet-900',
    },
];

export default function ArcanoHub() {
    const navigate = useNavigate();

    return (
        <ArcanoLayout>
            <div className="min-h-full px-8 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2">Seja bem vindo ao Arcano!</h1>
                    <p className="text-white/40 text-sm">A plataforma dos criadores do futuro.</p>
                </div>

                {/* Grid de ferramentas */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => navigate(tool.href)}
                            className={`
                relative group rounded-2xl overflow-hidden cursor-pointer
                border border-white/10 hover:border-violet-400/40
                transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-900/30
              `}
                        >
                            {/* Gradient BG */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-40`} />

                            <div className="relative p-6">
                                {/* Badge */}
                                {tool.badge && (
                                    <span className={`
                    absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full text-white
                    ${tool.badge === 'Novo' ? 'bg-violet-500' : 'bg-blue-600'}
                  `}>
                                        {tool.badge}
                                    </span>
                                )}

                                {/* Ícone */}
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
                                    <tool.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-base font-bold text-white mb-2">{tool.title}</h3>
                                <p className="text-white/50 text-xs leading-relaxed mb-4">{tool.desc}</p>

                                <div className="flex items-center gap-1.5 text-violet-300 text-xs font-bold group-hover:gap-2.5 transition-all">
                                    <span>Acessar Ferramenta</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ArcanoLayout>
    );
}
