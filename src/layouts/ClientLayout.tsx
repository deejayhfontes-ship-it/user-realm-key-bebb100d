import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Wand2, 
  History, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  CreditCard,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useClientData } from '@/hooks/useClientData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Geradores', href: '/client/generators', icon: Wand2 },
  { label: 'Histórico', href: '/client/history', icon: History },
  { label: 'Suporte', href: '/client/support', icon: HelpCircle },
];

export function ClientLayout() {
  const { signOut, profile } = useAuth();
  const { client, creditsInfo } = useClientData();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex gap-1", mobile ? "flex-col" : "flex-row")}>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={() => mobile && setMobileOpen(false)}
          className={({ isActive }) => cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground hidden sm:block">Fontes Graphics</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <NavItems />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Credits badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {creditsInfo.used}/{creditsInfo.total === Infinity ? '∞' : creditsInfo.total}
              </span>
            </div>

            {/* User info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{client?.name || 'Carregando...'}</p>
              <p className="text-xs text-muted-foreground">
                {client?.type === 'fixed' ? 'Plano Fixo' : 'Pacote'}
              </p>
            </div>

            {/* Logout button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <p className="font-semibold text-foreground">{client?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Créditos: {creditsInfo.used}/{creditsInfo.total === Infinity ? '∞' : creditsInfo.total}
                    </p>
                  </div>
                  <NavItems mobile />
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
