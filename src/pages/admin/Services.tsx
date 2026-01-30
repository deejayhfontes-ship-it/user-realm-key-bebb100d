import { useState } from 'react';
import { Plus, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useServices } from '@/hooks/useServices';
import { ServiceCard } from '@/components/admin/services/ServiceCard';
import { ServiceFormModal } from '@/components/admin/services/ServiceFormModal';
import type { Service, ServiceFormData } from '@/types/service';

export default function AdminServices() {
  const { services, loading, createService, updateService, deleteService, duplicateService, toggleActive } = useServices();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const handleNew = () => {
    setSelectedService(null);
    setFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormOpen(true);
  };

  const handleDuplicate = async (service: Service) => {
    await duplicateService(service);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      await deleteService(serviceToDelete.id);
      setServiceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (formData: ServiceFormData): Promise<boolean | null> => {
    if (selectedService) {
      return updateService(selectedService.id, formData);
    } else {
      const result = await createService(formData);
      return result !== null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pela agência
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">Nenhum serviço cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece adicionando os serviços que sua agência oferece
          </p>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteClick}
              onToggleActive={toggleActive}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ServiceFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        service={selectedService}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{serviceToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
