import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '@/components/client/ClientSidebar';

export function ClientLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <ClientSidebar />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
