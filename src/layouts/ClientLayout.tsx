import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '@/components/client/ClientSidebar';

export function ClientLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <ClientSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
