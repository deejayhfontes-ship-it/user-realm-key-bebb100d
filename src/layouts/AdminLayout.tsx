import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useState, createContext, useContext } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminSidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useAdminSidebar = () => useContext(AdminSidebarContext);

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminSidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 gradient-sidebar">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-foreground">Painel Admin</span>
        </div>
        
        {/* Main Content */}
        <main className={`min-h-screen transition-all duration-300 pt-14 md:pt-0 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          <Outlet />
        </main>
      </div>
    </AdminSidebarContext.Provider>
  );
}
