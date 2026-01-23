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
        "h-screen flex flex-col gradient-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm leading-tight">Fontes Graphics</span>
              <span className="text-[10px] text-muted-foreground">Platform</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center mx-auto">
            <Palette className="w-5 h-5 text-accent" />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-accent"
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
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-accent"
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                "text-sidebar-foreground hover:bg-sidebar-accent",
                isActive 
                  ? "bg-sidebar-accent text-foreground active-indicator" 
                  : "hover:text-accent"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors",
                isActive ? "text-accent" : "group-hover:text-accent"
              )} />
              {!collapsed && (
                <span className={cn(
                  "font-medium",
                  isActive && "text-foreground"
                )}>
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-sidebar-border">
        {!collapsed && profile && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
