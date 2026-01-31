import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { useState, createContext, useContext } from 'react';

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

  return (
    <ClientSidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen w-full bg-background">
        <ClientSidebar />
        <main className={`min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <Outlet />
        </main>
      </div>
    </ClientSidebarContext.Provider>
  );
}