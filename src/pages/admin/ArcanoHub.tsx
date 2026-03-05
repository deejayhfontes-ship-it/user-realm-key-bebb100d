import { useNavigate } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Sparkles, ZoomIn, UserCheck, Shirt, Award, FileImage, ArrowRight, Clock } from 'lucide-react';

interface ToolCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    route?: string;
    status: 'active' | 'soon';
    badge?: string;
}

const tools: ToolCard[] = [
    {
        id: 'cloner',
        title: 'Arcano Cloner',
        description: 'Crie ensaios fotográficos ultra-realistas com IA a partir de uma foto',
        icon: <UserCheck className="w-7 h-7" />,
        route: '/admin/arcano/cloner',
        status: 'active',
        badge: 'NOVO',
    },
    {
        id: 'upscaler',
        title: 'Upscaler IA',
        description: 'Aumente a resolução de imagens com inteligência artificial',
        icon: <ZoomIn className="w-7 h-7" />,
        route: '/admin/arcano/upscaler',
        status: 'active',
    },
    {
        id: 'pose',
        title: 'Pose Changer',
        description: 'Altere a pose de pessoas em fotos com IA',
        icon: <Sparkles className="w-7 h-7" />,
        status: 'soon',
    },
    {
        id: 'veste',
        title: 'Veste AI',
        description: 'Troque roupas em fotos com inteligência artificial',
        icon: <Shirt className="w-7 h-7" />,
        status: 'soon',
    },
    {
        id: 'selos',
        title: 'Forja de Selos 3D',
        description: 'Crie selos e emblemas 3D animados com IA',
        icon: <Award className="w-7 h-7" />,
        status: 'soon',
    },
    {
        id: 'flyer',
        title: 'Flyer Maker',
        description: 'Crie flyers para eventos incríveis com IA',
        icon: <FileImage className="w-7 h-7" />,
        status: 'soon',
    },
];

export default function ArcanoHub() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f]">
            <AdminHeader
                title="Arcano"
                subtitle="Ferramentas de IA para criação profissional"
            />

            <div className="flex-1 p-8">
                {/* Header decorativo */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Plataforma Arcano</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Ferramentas de IA</h1>
                    <p className="text-white/50 text-sm">Crie imagens profissionais com inteligência artificial — sem limites de créditos</p>
                </div>

                {/* Grid de ferramentas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => tool.status === 'active' && tool.route && navigate(tool.route)}
                            className={`
                relative group rounded-2xl border p-6 transition-all duration-300
                ${tool.status === 'active'
                                    ? 'border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-[#0d0d1a] hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer'
                                    : 'border-white/5 bg-white/[0.02] opacity-60 cursor-default'
                                }
              `}
                        >
                            {/* Badge */}
                            {tool.badge && (
                                <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-violet-500 text-white text-[9px] font-extrabold uppercase tracking-wider">
                                    {tool.badge}
                                </span>
                            )}
                            {tool.status === 'soon' && (
                                <span className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-[9px] font-bold uppercase">
                                    <Clock className="w-2.5 h-2.5" />
                                    Em Breve
                                </span>
                            )}

                            {/* Ícone */}
                            <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
                ${tool.status === 'active'
                                    ? 'bg-violet-500/20 text-violet-300 group-hover:bg-violet-500/30 group-hover:scale-110'
                                    : 'bg-white/5 text-white/20'
                                }
              `}>
                                {tool.icon}
                            </div>

                            <h3 className={`text-base font-bold mb-1.5 ${tool.status === 'active' ? 'text-white' : 'text-white/40'}`}>
                                {tool.title}
                            </h3>
                            <p className={`text-xs leading-relaxed mb-4 ${tool.status === 'active' ? 'text-white/50' : 'text-white/20'}`}>
                                {tool.description}
                            </p>

                            {tool.status === 'active' && (
                                <div className="flex items-center gap-1 text-violet-400 text-xs font-bold group-hover:gap-2 transition-all">
                                    <span>Acessar</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
