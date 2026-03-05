import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    UserCheck, ZoomIn, PersonStanding, Shirt,
    Image, Video, Sparkles, Home, ChevronLeft,
    BookOpen, Wrench
} from 'lucide-react';

const sidebarTools = [
    { label: 'Upscaler Arcano V3', href: '/admin/arcano/upscaler', icon: ZoomIn },
    { label: 'Arcano Cloner', href: '/admin/arcano/cloner', icon: UserCheck, badge: 'Novo' },
    { label: 'Pose Changer', href: '/admin/arcano/pose-changer', icon: PersonStanding },
    { label: 'Veste AI', href: '/admin/arcano/veste-ai', icon: Shirt },
    { label: 'Gerar Imagem', href: '/admin/arcano/gerar-imagem', icon: Image, badge: 'Gemini', badgeColor: '#1a73e8' },
    { label: 'Gerar Vídeo', href: '/admin/arcano/gerar-video', icon: Video, badge: 'Em breve', badgeColor: '#444' },
];

interface ArcanoLayoutProps {
    children: React.ReactNode;
}

// Cores do site: Neon Lime #D8FF9A como destaque, charcoal escuro como fundo
const LIME = '#D8FF9A';
const BG = '#141414';
const SIDEBAR_BG = '#1c1c1c';

export function ArcanoLayout({ children }: ArcanoLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: BG }}>
            {/* Sidebar */}
            <aside className="w-[260px] shrink-0 flex flex-col border-r border-white/5 overflow-y-auto"
                style={{ background: SIDEBAR_BG }}>

                {/* Logo */}
                <div className="px-4 py-4 border-b border-white/5">
                    <button onClick={() => navigate('/admin/arcano')}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: LIME }}>
                            <Sparkles className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold text-sm text-white">
                            arcano <span style={{ color: LIME }}>AI</span>
                        </span>
                    </button>
                </div>

                {/* Voltar */}
                <div className="px-3 pt-3">
                    <button onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors w-full px-2 py-1.5">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Voltar ao Admin
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2 space-y-0.5">
                    <NavLink to="/admin/arcano" end
                        className={({ isActive }) => cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all font-medium',
                            isActive ? 'text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
                        )}
                        style={({ isActive }) => isActive ? { background: LIME } : {}}>
                        <Home className="w-4 h-4 shrink-0" />
                        <span>Home</span>
                    </NavLink>

                    <div className="pt-3 pb-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-3 mb-1">
                            Ferramentas de IA
                        </p>
                        {sidebarTools.map((tool) => (
                            <NavLink key={tool.href} to={tool.href}
                                className={({ isActive }) => cn(
                                    'flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-all font-medium',
                                    isActive ? 'text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
                                )}
                                style={({ isActive }) => isActive ? { background: LIME } : {}}>
                                <div className="flex items-center gap-2.5">
                                    <tool.icon className="w-4 h-4 shrink-0" />
                                    <span>{tool.label}</span>
                                </div>
                                {tool.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                        style={{ background: tool.badgeColor || '#3a6b2a' }}>
                                        {tool.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Biblioteca & Conteúdo */}
                    <div className="pt-3 pb-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-3 mb-1">
                            Conteúdo
                        </p>
                        <NavLink to="/admin/arcano/biblioteca-prompts"
                            className={({ isActive }) => cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all font-medium',
                                isActive ? 'text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
                            )}
                            style={({ isActive }) => isActive ? { background: LIME } : {}}>
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span>Biblioteca de Prompts</span>
                        </NavLink>
                        <NavLink to="/admin/arcano/ferramentas-ia"
                            className={({ isActive }) => cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all font-medium',
                                isActive ? 'text-black' : 'text-white/50 hover:text-white hover:bg-white/5'
                            )}
                            style={({ isActive }) => isActive ? { background: LIME } : {}}>
                            <Wrench className="w-4 h-4 shrink-0" />
                            <span>Ferramentas de IA</span>
                        </NavLink>
                    </div>
                </nav>
            </aside>

            {/* Conteúdo */}
            <main className="flex-1 overflow-y-auto" style={{ background: BG }}>
                {children}
            </main>
        </div>
    );
}
