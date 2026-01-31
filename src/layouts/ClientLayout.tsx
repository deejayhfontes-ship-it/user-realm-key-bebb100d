import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '@/components/client/ClientSidebar';

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ClientSidebar />
      <main className="ml-64 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
