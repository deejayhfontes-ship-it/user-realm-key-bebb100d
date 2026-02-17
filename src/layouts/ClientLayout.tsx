import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { useState, createContext, useContext } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ClientSidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export const ClientSidebarContext = createContext<ClientSidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useClientSidebar = () => useContext(ClientSidebarContext);

export function ClientLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ClientSidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <ClientSidebar />
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
              <ClientSidebar />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-foreground">Área do Cliente</span>
        </div>
        
        {/* Main Content */}
        <main className={`min-h-screen transition-all duration-300 pt-14 md:pt-0 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          <Outlet />
        </main>
      </div>
    </ClientSidebarContext.Provider>
  );
}
