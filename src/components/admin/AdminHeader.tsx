import { useAuth } from '@/hooks/useAuth';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-normal mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="w-64 pl-11 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 rounded-full h-11"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full h-11 w-11">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User avatar */}
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-sm font-semibold text-secondary-foreground">
            {profile?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}