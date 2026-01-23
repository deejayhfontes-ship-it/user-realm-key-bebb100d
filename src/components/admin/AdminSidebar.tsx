import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wand2, 
  Settings, 
  LogOut,
  Sparkles,
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
        "h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-sidebar-foreground">FontesApp</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-sidebar-border">
        {!collapsed && profile && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.email}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
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
