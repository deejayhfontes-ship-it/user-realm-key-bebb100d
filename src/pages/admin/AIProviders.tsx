import { useState } from 'react';
import { Plus, Zap, Settings2, Trash2, Power, PowerOff, Star, TestTube, Loader2, ExternalLink } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  useAIProviders, 
  useDeleteAIProvider, 
  useUpdateAIProvider,
  useTestAIProvider,
  useSetDefaultProvider,
  type AIProvider 
} from '@/hooks/useAIProviders';
import { AddProviderModal } from '@/components/admin/ai-providers/AddProviderModal';
import { EditProviderModal } from '@/components/admin/ai-providers/EditProviderModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function AIProvidersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<AIProvider | null>(null);
  const [deleteProvider, setDeleteProvider] = useState<AIProvider | null>(null);

  const { data: providers, isLoading } = useAIProviders();
  const deleteMutation = useDeleteAIProvider();
  const updateMutation = useUpdateAIProvider();
  const testMutation = useTestAIProvider();
  const setDefaultMutation = useSetDefaultProvider();

  const handleToggleActive = (provider: AIProvider) => {
    updateMutation.mutate({
      id: provider.id,
      is_active: !provider.is_active,
    });
  };

  const handleTest = (provider: AIProvider) => {
    testMutation.mutate({ providerId: provider.id });
  };

  const handleSetDefault = (provider: AIProvider) => {
    if (!provider.is_default) {
      setDefaultMutation.mutate(provider.id);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteProvider) {
      deleteMutation.mutate(deleteProvider.id);
      setDeleteProvider(null);
    }
  };

  const getStatusIcon = (provider: AIProvider) => {
    if (provider.last_test_success === true) {
      return <div className="w-2 h-2 rounded-full bg-primary" />;
    }
    if (provider.last_test_success === false) {
      return <div className="w-2 h-2 rounded-full bg-destructive" />;
    }
    return <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />;
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title="Provedores de IA"
        subtitle="Gerencie os provedores de IA para edição de geradores"
        action={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:brightness-105 rounded-full px-6 h-11 font-medium shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Adicionar Provedor
          </Button>
        }
      />

      <div className="flex-1 p-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="soft-card border-0">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className={cn(
                  'soft-card border-0 transition-all',
                  !provider.is_active && 'opacity-60'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider)}
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {provider.is_default && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Padrão
                        </Badge>
                      )}
                      <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                        {provider.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Tipo:</span>{' '}
                      {provider.api_type}
                    </p>
                    <p className="text-muted-foreground truncate">
                      <span className="font-medium text-foreground">Endpoint:</span>{' '}
                      {provider.endpoint_url}
                    </p>
                    {provider.model_name && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Modelo:</span>{' '}
                        {provider.model_name}
                      </p>
                    )}
                  </div>

                  {provider.last_test_at && (
                    <div className="text-xs text-muted-foreground">
                      Último teste:{' '}
                      {format(new Date(provider.last_test_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      {provider.last_test_success === false && provider.last_error && (
                        <p className="text-destructive mt-1 truncate" title={provider.last_error}>
                          {provider.last_error}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(provider)}
                      disabled={testMutation.isPending}
                      className="rounded-lg gap-1"
                    >
                      {testMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <TestTube className="h-3 w-3" />
                      )}
                      Testar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditProvider(provider)}
                      className="rounded-lg gap-1"
                    >
                      <Settings2 className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(provider)}
                      className="rounded-lg gap-1"
                    >
                      {provider.is_active ? (
                        <>
                          <PowerOff className="h-3 w-3" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Power className="h-3 w-3" />
                          Ativar
                        </>
                      )}
                    </Button>
                    {!provider.is_default && provider.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(provider)}
                        className="rounded-lg gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Definir padrão
                      </Button>
                    )}
                    {provider.slug !== 'lovable' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteProvider(provider)}
                        className="rounded-lg gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remover
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="soft-card border-0">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum provedor de IA configurado
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeiro Provedor
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info card */}
        <Card className="soft-card border-0 mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Como Adicionar Sua Própria IA
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Clique em "Adicionar Provedor"</li>
              <li>Selecione o tipo (OpenAI, Claude, etc) ou "Custom"</li>
              <li>Preencha o endpoint e a API key</li>
              <li>Teste a conexão</li>
              <li>Salve e comece a usar!</li>
            </ol>
            <p className="pt-2">
              Sua API deve aceitar POST e retornar JSON com a resposta.{' '}
              <a
                href="https://platform.openai.com/docs/api-reference/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Ver exemplo OpenAI
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddProviderModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditProviderModal
        provider={editProvider}
        open={!!editProvider}
        onOpenChange={(open) => !open && setEditProvider(null)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteProvider} onOpenChange={() => setDeleteProvider(null)}>
        <AlertDialogContent className="soft-card-elevated border-0 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover provedor?</AlertDialogTitle>
            <AlertDialogDescription>
              O provedor "{deleteProvider?.name}" será removido permanentemente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
