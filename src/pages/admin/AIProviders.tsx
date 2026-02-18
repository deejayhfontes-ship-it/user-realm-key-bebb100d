import { useState, useMemo } from 'react';
import { Plus, Zap, Settings2, Trash2, Power, PowerOff, Star, TestTube, Loader2, ExternalLink, Eye, EyeOff, Image, Type, Layers, Key, Activity, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignerDoFuturoProviderPanel } from '@/components/admin/ai-providers/DesignerDoFuturoProviderPanel';
import { PremiumProMaxProviderPanel } from '@/components/admin/ai-providers/PremiumProMaxProviderPanel';
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
import type { ProviderCategory } from '@/lib/ai-engine/types';

type FilterTab = 'all' | ProviderCategory;

const categoryConfig: Record<ProviderCategory, { label: string; icon: React.ReactNode; color: string }> = {
  vision: { label: 'Visão', icon: <Image className="h-3 w-3" />, color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  text: { label: 'Texto', icon: <Type className="h-3 w-3" />, color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  both: { label: 'Ambos', icon: <Layers className="h-3 w-3" />, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
};

const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Todos', icon: <Zap className="h-3.5 w-3.5" /> },
  { key: 'vision', label: 'Visão', icon: <Image className="h-3.5 w-3.5" /> },
  { key: 'text', label: 'Texto', icon: <Type className="h-3.5 w-3.5" /> },
  { key: 'both', label: 'Ambos', icon: <Layers className="h-3.5 w-3.5" /> },
];

function maskApiKey(key: string | null): string {
  if (!key) return '—';
  if (key.length <= 4) return '••••';
  return '••••••••' + key.slice(-4);
}

export default function AIProvidersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<AIProvider | null>(null);
  const [deleteProvider, setDeleteProvider] = useState<AIProvider | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const { data: providers, isLoading } = useAIProviders();
  const deleteMutation = useDeleteAIProvider();
  const updateMutation = useUpdateAIProvider();
  const testMutation = useTestAIProvider();
  const setDefaultMutation = useSetDefaultProvider();

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    if (activeTab === 'all') return providers;
    return providers.filter(p => p.category === activeTab);
  }, [providers, activeTab]);

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
      setDefaultMutation.mutate({ id: provider.id, category: provider.category });
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
      return <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />;
    }
    if (provider.last_test_success === false) {
      return <div className="w-2.5 h-2.5 rounded-full bg-destructive ring-2 ring-destructive/20" />;
    }
    return <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 ring-2 ring-muted-foreground/10" />;
  };

  const getCategoryBadge = (category: ProviderCategory) => {
    const config = categoryConfig[category] || categoryConfig.both;
    return (
      <Badge variant="outline" className={cn('gap-1 text-[10px] font-medium border', config.color)}>
        {config.icon}
        {config.label}
      </Badge>
    );
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

      <div className="flex-1 p-4 md:p-8">
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto gap-1">
            <TabsTrigger
              value="geral"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <Zap className="h-4 w-4" />
              Provedores Gerais
            </TabsTrigger>
            <TabsTrigger
              value="designer-do-futuro"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Designer do Futuro
            </TabsTrigger>
            <TabsTrigger
              value="premium-pro-max"
              className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Premium Pro Max
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6 mt-0">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {filterTabs.map((tab) => {
                const count = providers
                  ? tab.key === 'all'
                    ? providers.length
                    : providers.filter(p => p.category === tab.key).length
                  : 0;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                      activeTab === tab.key
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                      activeTab === tab.key ? 'bg-white/20' : 'bg-muted-foreground/10'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {isLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
            ) : filteredProviders.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className={cn(
                      'soft-card border-0 transition-all hover:shadow-lg',
                      !provider.is_active && 'opacity-60'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {getStatusIcon(provider)}
                          <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
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
                      {/* Category badge */}
                      <div className="flex gap-1.5 mt-2">
                        {getCategoryBadge(provider.category || 'both')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Tipo:</span>{' '}
                          <span className="uppercase text-xs tracking-wider">{provider.api_type}</span>
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
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <Key className="h-3 w-3" />
                          <span className="font-medium text-foreground">API Key:</span>{' '}
                          <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">
                            {maskApiKey(provider.api_key_encrypted)}
                          </code>
                        </p>
                      </div>

                      {/* Stats */}
                      {(provider.total_requests > 0 || provider.total_tokens_used > 0) && (
                        <div className="flex gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {provider.total_requests.toLocaleString('pt-BR')} requests
                          </span>
                          <span>
                            {provider.total_tokens_used.toLocaleString('pt-BR')} tokens
                          </span>
                        </div>
                      )}

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
                    {activeTab === 'all'
                      ? 'Nenhum provedor de IA configurado'
                      : `Nenhum provedor de categoria "${categoryConfig[activeTab]?.label || activeTab}" encontrado`
                    }
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Provedor
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
                  <li>Selecione o tipo (OpenAI, Claude, Google, etc) ou "Custom"</li>
                  <li>Escolha a <strong>categoria</strong>: Visão (imagens), Texto ou Ambos</li>
                  <li>Preencha o endpoint e a API key</li>
                  <li>Teste a conexão e salve</li>
                </ol>
                <p className="pt-2 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  <span>Suas API keys são armazenadas de forma segura e nunca são expostas publicamente.</span>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designer-do-futuro" className="mt-0">
            <DesignerDoFuturoProviderPanel />
          </TabsContent>

          <TabsContent value="premium-pro-max" className="mt-0">
            <PremiumProMaxProviderPanel />
          </TabsContent>
        </Tabs>
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
