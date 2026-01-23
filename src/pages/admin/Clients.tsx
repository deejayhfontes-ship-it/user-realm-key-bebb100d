import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminClients() {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Clientes" 
        subtitle="Gerenciar clientes e pacotes"
      />
      
      <div className="flex-1 p-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground">
            Página de clientes em construção...
          </p>
        </div>
      </div>
    </div>
  );
}
