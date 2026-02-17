import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { 
  QrCode, 
  Plus, 
  Pencil, 
  Trash2, 
  Star,
  Loader2
} from 'lucide-react';
import { 
  usePixConfigs, 
  PixConfig, 
  maskPixKey, 
  getKeyTypeLabel,
  PixKeyType 
} from '@/hooks/usePixConfigs';
import { PixAccountModal } from './PixAccountModal';

export function PixAccountsList() {
  const { 
    pixConfigs, 
    isLoading, 
    deleteConfig, 
    setDefault,
    isDeleting 
  } = usePixConfigs();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PixConfig | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (config: PixConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteConfig(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Contas PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Contas PIX
            </CardTitle>
            <CardDescription>
              Gerencie suas chaves PIX para receber pagamentos
            </CardDescription>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Conta
          </Button>
        </CardHeader>
        <CardContent>
          {pixConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conta PIX cadastrada</p>
              <p className="text-sm mt-1">Adicione uma conta para começar a receber pagamentos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pixConfigs.map((config) => (
                <div 
                  key={config.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground truncate">
                        {config.nickname}
                      </span>
                      {config.is_default && (
                        <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Padrão
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getKeyTypeLabel(config.key_type as PixKeyType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {maskPixKey(config.pix_key, config.key_type as PixKeyType)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.merchant_name} • {config.merchant_city}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!config.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefault(config.id)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Definir como padrão"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PixAccountModal
        open={isModalOpen}
        onClose={handleModalClose}
        editingConfig={editingConfig}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta PIX?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta PIX será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
