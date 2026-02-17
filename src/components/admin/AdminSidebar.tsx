import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wand2,
  Settings,
  LogOut,
  Palette,
  ChevronLeft,
  Zap,
  CreditCard,
  FileText,
  FileSignature,
  Receipt,
  Inbox,
  Briefcase,
  FileCheck,
  Layers,
  MessageSquare,
  ShoppingBag,
  MessageCircle,
  Package,
  Calendar,
  Building2,
  FolderOpen,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Agenda',
    href: '/admin/agenda',
    icon: Calendar
  },
  {
    title: 'Clientes',
    href: '/admin/clients',
    icon: Users
  },
  {
    title: 'Geradores',
    href: '/admin/generators',
    icon: Wand2
  },
  {
    title: 'Provedores IA',
    href: '/admin/ai-providers',
    icon: Zap
  },
  {
    title: 'Gerador Prompts',
    href: '/admin/prompt-generator',
    icon: Film
  },
  {
    title: 'Pagamentos',
    href: '/admin/payments',
    icon: CreditCard
  },
  {
    title: 'Pedidos',
    href: '/admin/pedidos',
    icon: ShoppingBag
  },
  {
    title: 'Entregas',
    href: '/admin/entregas',
    icon: Package
  },
  {
    title: 'Briefings',
    href: '/admin/briefings',
    icon: Inbox
  },
  {
    title: 'Serviços',
    href: '/admin/servicos',
    icon: Layers
  },
  {
    title: 'Atendimento',
    href: '/admin/atendimento',
    icon: MessageSquare
  },
  {
    title: 'Chat ao Vivo',
    href: '/admin/chat',
    icon: MessageCircle
  },
  {
    title: 'Orçamentos',
    href: '/admin/budgets',
    icon: FileText
  },
  {
    title: 'Propostas',
    href: '/admin/propostas',
    icon: FileSignature
  },
  {
    title: 'Faturas',
    href: '/admin/invoices',
    icon: Receipt
  },
  {
    title: 'Notas Fiscais',
    href: '/admin/notas-fiscais',
    icon: FileCheck
  },
  {
    title: 'Portfólio',
    href: '/admin/portfolio',
    icon: Briefcase
  },
  {
    title: 'Solicitações Prefeitura',
    href: '/admin/solicitacoes-prefeitura',
    icon: Building2
  },
  {
    title: 'Protocolos Drive',
    href: '/admin/protocolos',
    icon: FolderOpen
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col gradient-sidebar transition-all duration-300 z-50 overflow-y-auto md:fixed relative md:h-screen h-full",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm leading-tight tracking-tight">Fontes Graphics</span>
              <span className="text-[10px] text-white/50 font-normal">Platform</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Palette className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/50 hover:bg-white/5 hover:text-white rounded-xl hidden md:flex"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="p-2 hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-white/50 hover:bg-white/5 hover:text-white rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                isActive ? "text-primary-foreground" : "text-white/60 group-hover:text-white"
              )} />
              {!collapsed && (
                <span className={cn(
                  "font-medium text-sm",
                  isActive && "text-primary-foreground"
                )}>
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && profile && (
          <div className="px-3 py-3 mb-2 rounded-2xl bg-white/5">
            <p className="text-sm font-medium text-white truncate">
              {profile.email}
            </p>
            <p className="text-xs text-white/50 font-normal capitalize">
              {profile.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full text-white/60 hover:bg-white/5 hover:text-white rounded-2xl",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3 font-medium text-sm">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
