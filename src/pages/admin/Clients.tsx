import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { ClientsTable } from '@/components/admin/clients/ClientsTable';
import { ClientFilters } from '@/components/admin/clients/ClientFilters';
import { NewClientModal } from '@/components/admin/clients/NewClientModal';
import { useClients, useUpdateClientStatus, Client } from '@/hooks/useClients';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminClients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [clientToBlock, setClientToBlock] = useState<Client | null>(null);

  const { data: clients, isLoading } = useClients(statusFilter, searchQuery);
  const updateStatus = useUpdateClientStatus();

  const handleView = (client: Client) => {
    // TODO: Implement view modal
    console.log('View client:', client);
  };

  const handleEdit = (client: Client) => {
    // TODO: Implement edit modal
    console.log('Edit client:', client);
  };

  const handleToggleBlock = (client: Client) => {
    setClientToBlock(client);
  };

  const confirmToggleBlock = () => {
    if (clientToBlock) {
      const newStatus = clientToBlock.status === 'blocked' ? 'active' : 'blocked';
      updateStatus.mutate({ id: clientToBlock.id, status: newStatus });
      setClientToBlock(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Clientes" 
        subtitle="Gerenciar clientes e pacotes"
        action={
          <Button 
            onClick={() => setIsNewModalOpen(true)} 
            className="gap-2 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-6 h-11 font-medium shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />
      
      <div className="flex-1 p-8 space-y-6">
        <ClientFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <ClientsTable
          clients={clients}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onToggleBlock={handleToggleBlock}
        />
      </div>

      <NewClientModal
        open={isNewModalOpen}
        onOpenChange={setIsNewModalOpen}
      />

      <AlertDialog open={!!clientToBlock} onOpenChange={() => setClientToBlock(null)}>
        <AlertDialogContent className="soft-card-elevated border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {clientToBlock?.status === 'blocked' ? 'Desbloquear' : 'Bloquear'} cliente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clientToBlock?.status === 'blocked'
                ? `O cliente "${clientToBlock?.name}" será desbloqueado e poderá acessar o sistema novamente.`
                : `O cliente "${clientToBlock?.name}" será bloqueado e não poderá mais acessar o sistema.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleBlock}
              className="rounded-full bg-primary text-primary-foreground hover:brightness-105"
            >
              {clientToBlock?.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}