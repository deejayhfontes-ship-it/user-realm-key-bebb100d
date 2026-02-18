import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wand2,
  Images,
  User,
  LogOut,
  Palette,
  ChevronLeft,
  Receipt,
  FileText,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useClientData } from '@/hooks/useClientData';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientSidebar } from '@/layouts/ClientLayout';

const navItems = [
  {
    title: 'Dashboard',
    href: '/client/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Meus Geradores',
    href: '/client/geradores',
    icon: Wand2
  },
  {
    title: 'Minhas Artes',
    href: '/client/historico',
    icon: Images
  },
  {
    title: 'Meus Orçamentos',
    href: '/client/orcamentos',
    icon: FileText
  },
  {
    title: 'Meus Pedidos',
    href: '/client/pedidos',
    icon: ShoppingBag
  },
  {
    title: 'Minhas Faturas',
    href: '/client/faturas',
    icon: Receipt
  },
  {
    title: 'Perfil',
    href: '/client/perfil',
    icon: User
  },
];

export function ClientSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, isAdmin } = useAuth();
  const { client, isLoading } = useClientData();
  const { collapsed, setCollapsed } = useClientSidebar();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col gradient-sidebar transition-all duration-300 overflow-y-auto",
        "fixed left-0 top-0 z-50",
        "md:fixed",
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
              <span className="font-semibold text-white text-sm leading-tight tracking-tight">Área do Cliente</span>
              <span className="text-[10px] text-white/50 font-normal">Fontes Graphics</span>
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
            className="text-white/50 hover:bg-white/5 hover:text-white rounded-xl"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="p-2">
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

      {/* Admin viewing as client banner */}
      {isAdmin && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-warning/20 border border-warning/30">
          <p className="text-xs text-warning font-medium">
            👁️ Visualizando como cliente
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
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
        {!collapsed && (
          <div className="px-3 py-3 mb-2 rounded-2xl bg-white/5">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-32 bg-white/10 mb-1" />
                <Skeleton className="h-3 w-40 bg-white/10" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-white truncate">
                  {client?.name || profile?.email}
                </p>
                <p className="text-xs text-white/50 font-normal">
                  {client?.email || profile?.email}
                </p>
              </>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
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
