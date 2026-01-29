import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}