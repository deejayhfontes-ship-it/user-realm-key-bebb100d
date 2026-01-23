import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wand2, 
  Settings, 
  LogOut,
  Palette,
  ChevronLeft
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
    title: 'Configurações', 
    href: '/admin/settings', 
    icon: Settings 
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen flex flex-col gradient-sidebar border-r border-white/10 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-white text-sm leading-tight tracking-tight">Fontes Graphics</span>
              <span className="text-[10px] text-white/60 font-normal">Platform</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
            <Palette className="w-5 h-5 text-white" />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
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
            className="w-full text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                "text-white/70 hover:bg-white/10",
                isActive 
                  ? "bg-white/10 text-white active-indicator" 
                  : "hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                isActive ? "text-white" : "text-white/70 group-hover:text-white"
              )} />
              {!collapsed && (
                <span className={cn(
                  "font-normal",
                  isActive && "font-medium text-white"
                )}>
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-white/10">
        {!collapsed && profile && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">
              {profile.email}
            </p>
            <p className="text-xs text-white/60 font-normal capitalize">
              {profile.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full text-white/70 hover:bg-white/10 hover:text-white rounded-xl",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3 font-normal">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
