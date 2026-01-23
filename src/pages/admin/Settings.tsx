import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminSettings() {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Configurações" 
        subtitle="Configurações do sistema"
      />
      
      <div className="flex-1 p-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground">
            Página de configurações em construção...
          </p>
        </div>
      </div>
    </div>
  );
}
