import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminGenerators() {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Geradores" 
        subtitle="Configurar geradores de arte"
      />
      
      <div className="flex-1 p-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground">
            Página de geradores em construção...
          </p>
        </div>
      </div>
    </div>
  );
}
