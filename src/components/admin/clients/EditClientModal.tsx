<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { SecurityAccessTab } from './SecurityAccessTab';
import { useClientPermissions } from '@/hooks/useClientPermissions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { Building2, Package, Zap, Flame, Gem, Settings, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

import { useGenerators, usePackages, useUpdateClient, useClientDetails, ClientGenerator, Client } from '@/hooks/useClients';
import { toast } from '@/hooks/use-toast';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  type: z.enum(['fixed', 'package']),
  notes: z.string().optional(),
  contract_start: z.date().optional(),
  monthly_credits: z.number().nullable().optional(),
  package_id: z.string().optional(),
  custom_days: z.number().optional(),
  custom_credits: z.number().optional(),
  custom_price: z.number().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface GeneratorConfig {
  generator_id: string;
  enabled: boolean;
  credits_limit: number | null;
  credits_used: number;
  time_limit_start: string | null;
  time_limit_end: string | null;
  allowed_weekdays: number[];
}

interface EditClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClientModal({ client, open, onOpenChange }: EditClientModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [generatorConfigs, setGeneratorConfigs] = useState<Record<string, GeneratorConfig>>({});
  const [expandedGenerators, setExpandedGenerators] = useState<Set<string>>(new Set());
  const [clientPassword, setClientPassword] = useState('');
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});

  const { data: generators } = useGenerators();
  const { data: packages } = usePackages();
  const { data: clientDetails } = useClientDetails(client?.id || null);
  const { data: existingPermissions } = useClientPermissions(client?.id || null);
  const updateClient = useUpdateClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'fixed',
      notes: '',
      contract_start: new Date(),
      monthly_credits: null,
      package_id: '',
      custom_days: undefined,
      custom_credits: undefined,
      custom_price: undefined,
    }
  });

  // Load client data when modal opens
  useEffect(() => {
    if (client && open) {
      form.reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        type: client.type,
        notes: client.notes || '',
        contract_start: client.contract_start ? new Date(client.contract_start) : new Date(),
        monthly_credits: client.monthly_credits,
        package_id: client.package_type || '',
        custom_days: undefined,
        custom_credits: client.package_credits || undefined,
        custom_price: undefined,
      });
      setActiveTab('info');
    }
  }, [client, open, form]);

  // Load generator configs when client details are loaded
  useEffect(() => {
    if (clientDetails?.client_generators) {
      const configs: Record<string, GeneratorConfig> = {};
      clientDetails.client_generators.forEach((cg: any) => {
        configs[cg.generator_id] = {
          generator_id: cg.generator_id,
          enabled: cg.enabled ?? true,
          credits_limit: cg.credits_limit,
          credits_used: cg.credits_used || 0,
          time_limit_start: cg.time_limit_start,
          time_limit_end: cg.time_limit_end,
          allowed_weekdays: cg.allowed_weekdays || [0, 1, 2, 3, 4, 5, 6]
        };
      });
      setGeneratorConfigs(configs);
    }
  }, [clientDetails]);

  const clientType = form.watch('type');
  const selectedPackageId = form.watch('package_id');
  const customDays = form.watch('custom_days');

  const selectedPackage = packages?.find(p => p.id === selectedPackageId);
  const isCustomPackage = selectedPackageId === 'custom';

  const tabs = ['info', 'config', 'generators', 'security'];
  const currentTabIndex = tabs.indexOf(activeTab);

  const goNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    }
  };

  const goPrev = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  };

  const toggleGenerator = (generatorId: string, checked: boolean) => {
    setGeneratorConfigs(prev => ({
      ...prev,
      [generatorId]: {
        generator_id: generatorId,
        enabled: checked,
        credits_limit: prev[generatorId]?.credits_limit ?? null,
        credits_used: prev[generatorId]?.credits_used ?? 0,
        time_limit_start: prev[generatorId]?.time_limit_start ?? null,
        time_limit_end: prev[generatorId]?.time_limit_end ?? null,
        allowed_weekdays: prev[generatorId]?.allowed_weekdays ?? [0, 1, 2, 3, 4, 5, 6]
      }
    }));
  };

  const updateGeneratorConfig = (generatorId: string, updates: Partial<GeneratorConfig>) => {
    setGeneratorConfigs(prev => ({
      ...prev,
      [generatorId]: {
        ...prev[generatorId],
        ...updates
      }
    }));
  };

  const toggleExpanded = (generatorId: string) => {
    setExpandedGenerators(prev => {
      const next = new Set(prev);
      if (next.has(generatorId)) {
        next.delete(generatorId);
      } else {
        next.add(generatorId);
      }
      return next;
    });
  };

  const weekdays = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;

    const enabledGenerators = Object.values(generatorConfigs).filter(g => g.enabled);

    if (enabledGenerators.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione ao menos 1 gerador',
        variant: 'destructive'
      });
      setActiveTab('generators');
      return;
    }

    let packageCredits: number | undefined = client.package_credits || undefined;
    let accessExpiresAt: string | undefined = client.access_expires_at || undefined;
    let packageType: string | undefined = client.package_type || undefined;

    if (data.type === 'package') {
      if (isCustomPackage && data.custom_days && data.custom_credits) {
        packageCredits = data.custom_credits;
        accessExpiresAt = addDays(new Date(), data.custom_days).toISOString();
        packageType = 'custom';
      } else if (selectedPackage) {
        packageCredits = selectedPackage.credits;
        accessExpiresAt = addDays(new Date(), selectedPackage.duration_days).toISOString();
        packageType = selectedPackage.id;
      }
    }

    const generators: ClientGenerator[] = enabledGenerators.map(g => ({
      client_id: client.id,
      generator_id: g.generator_id,
      credits_limit: g.credits_limit,
      credits_used: g.credits_used,
      time_limit_start: g.time_limit_start,
      time_limit_end: g.time_limit_end,
      allowed_weekdays: g.allowed_weekdays
    }));

    await updateClient.mutateAsync({
      id: client.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      notes: data.notes,
      contract_start: data.contract_start?.toISOString().split('T')[0],
      monthly_credits: data.monthly_credits,
      package_type: packageType,
      package_credits: packageCredits,
      access_expires_at: accessExpiresAt,
      generators
    });

    onOpenChange(false);
  };

  const calculateExpirationDate = () => {
    if (isCustomPackage && customDays) {
      return format(addDays(new Date(), customDays), 'dd/MM/yyyy');
    }
    if (selectedPackage) {
      return format(addDays(new Date(), selectedPackage.duration_days), 'dd/MM/yyyy');
    }
    if (client?.access_expires_at) {
      return format(new Date(client.access_expires_at), 'dd/MM/yyyy');
    }
    return '-';
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto soft-card-elevated border-0 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4 bg-muted rounded-2xl p-1 h-12">
              <TabsTrigger value="info" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">Informações</TabsTrigger>
              <TabsTrigger value="config" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">Configuração</TabsTrigger>
              <TabsTrigger value="generators" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">Geradores</TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acesso
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo/empresa *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: Empresa ABC Ltda"
                    className="rounded-xl border-0 bg-muted h-11"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="email@empresa.com"
                    className="rounded-xl border-0 bg-muted h-11"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="(11) 99999-9999"
                    className="rounded-xl border-0 bg-muted h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold">Tipo de cliente</Label>
                  <RadioGroup
                    value={clientType}
                    onValueChange={(value) => form.setValue('type', value as 'fixed' | 'package')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="edit-type-fixed"
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                        clientType === 'fixed'
                          ? "bg-secondary text-secondary-foreground shadow-md"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <RadioGroupItem value="fixed" id="edit-type-fixed" className="sr-only" />
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        clientType === 'fixed' ? "bg-primary" : "bg-card"
                      )}>
                        <Building2 className={cn("h-6 w-6", clientType === 'fixed' ? "text-primary-foreground" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <p className="font-semibold">Cliente Fixo</p>
                        <p className={cn("text-sm", clientType === 'fixed' ? "text-secondary-foreground/70" : "text-muted-foreground")}>Contrato mensal</p>
                      </div>
                    </Label>
                    <Label
                      htmlFor="edit-type-package"
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                        clientType === 'package'
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <RadioGroupItem value="package" id="edit-type-package" className="sr-only" />
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        clientType === 'package' ? "bg-primary-foreground/20" : "bg-card"
                      )}>
                        <Package className={cn("h-6 w-6", clientType === 'package' ? "text-primary-foreground" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <p className="font-semibold">Cliente Avulso</p>
                        <p className={cn("text-sm", clientType === 'package' ? "text-primary-foreground/70" : "text-muted-foreground")}>Pacote temporário</p>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-6 mt-6">
              {clientType === 'fixed' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data início contrato</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl h-11",
                            !form.watch('contract_start') && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('contract_start')
                            ? format(form.watch('contract_start')!, 'dd/MM/yyyy')
                            : "Selecione uma data"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.watch('contract_start')}
                          onSelect={(date) => form.setValue('contract_start', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly_credits">Créditos mensais</Label>
                    <Input
                      id="monthly_credits"
                      type="number"
                      placeholder="Deixe vazio para ilimitado"
                      defaultValue={client.monthly_credits || ''}
                      onChange={(e) => form.setValue('monthly_credits', e.target.value ? parseInt(e.target.value) : null)}
                      className="rounded-xl border-0 bg-muted h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Notas sobre o cliente..."
                      rows={3}
                      className="rounded-xl border-0 bg-muted"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-semibold">Selecionar pacote</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {packages?.map((pkg) => {
                        const icons: Record<number, React.ReactNode> = {
                          3: <Zap className="h-5 w-5" />,
                          7: <Flame className="h-5 w-5" />,
                          30: <Gem className="h-5 w-5" />
                        };
                        const icon = icons[pkg.duration_days] || <Package className="h-5 w-5" />;
                        const isSelected = selectedPackageId === pkg.id;

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => form.setValue('package_id', pkg.id)}
                            className={cn(
                              "p-5 rounded-2xl cursor-pointer transition-all",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted/50 hover:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "flex items-center gap-2 mb-3",
                              isSelected ? "text-primary-foreground" : "text-primary"
                            )}>
                              {icon}
                              <span className="font-semibold">{pkg.duration_days} dias</span>
                            </div>
                            <p className="text-xl font-bold">{pkg.credits} créditos</p>
                            <p className={cn(
                              "text-sm mt-1",
                              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              R$ {Number(pkg.price).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                      <div
                        onClick={() => form.setValue('package_id', 'custom')}
                        className={cn(
                          "p-5 rounded-2xl cursor-pointer transition-all",
                          isCustomPackage
                            ? "bg-secondary text-secondary-foreground shadow-md"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-2 mb-3",
                          isCustomPackage ? "text-secondary-foreground" : "text-muted-foreground"
                        )}>
                          <Settings className="h-5 w-5" />
                          <span className="font-semibold">Personalizado</span>
                        </div>
                        <p className={cn(
                          "text-sm",
                          isCustomPackage ? "text-secondary-foreground/70" : "text-muted-foreground"
                        )}>
                          Configure manualmente
                        </p>
                      </div>
                    </div>
                  </div>

                  {isCustomPackage && (
                    <div className="space-y-4 p-5 rounded-2xl bg-muted/50">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="custom_days" className="font-medium">Duração (dias)</Label>
                          <Input
                            id="custom_days"
                            type="number"
                            {...form.register('custom_days', { valueAsNumber: true })}
                            placeholder="Ex: 10"
                            className="rounded-xl border-0 bg-card h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="custom_credits" className="font-medium">Total de créditos</Label>
                          <Input
                            id="custom_credits"
                            type="number"
                            {...form.register('custom_credits', { valueAsNumber: true })}
                            placeholder="Ex: 100"
                            className="rounded-xl border-0 bg-card h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="custom_price" className="font-medium">Valor (R$)</Label>
                          <Input
                            id="custom_price"
                            type="number"
                            step="0.01"
                            {...form.register('custom_price', { valueAsNumber: true })}
                            placeholder="Ex: 299.00"
                            className="rounded-xl border-0 bg-card h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-secondary text-secondary-foreground">
                    <div>
                      <p className="text-sm text-secondary-foreground/60">Data início</p>
                      <p className="font-semibold text-lg">{format(new Date(), 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-foreground/60">Data expiração</p>
                      <p className="font-semibold text-lg">{calculateExpirationDate()}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="generators" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground">
                Selecione os geradores que este cliente poderá acessar.
              </p>

              <div className="space-y-3">
                {generators?.map((generator) => {
                  const config = generatorConfigs[generator.id];
                  const isEnabled = config?.enabled || false;
                  const isExpanded = expandedGenerators.has(generator.id);

                  return (
                    <div
                      key={generator.id}
                      className={cn(
                        "rounded-2xl transition-all overflow-hidden",
                        isEnabled ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-4 p-5">
                        <Checkbox
                          id={`edit-gen-${generator.id}`}
                          checked={isEnabled}
                          onCheckedChange={(checked) => toggleGenerator(generator.id, checked as boolean)}
                          className="h-5 w-5 rounded-lg"
                        />
                        <Label
                          htmlFor={`edit-gen-${generator.id}`}
                          className="flex-1 cursor-pointer font-semibold"
                        >
                          {generator.name}
                        </Label>
                        {isEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(generator.id)}
                            className="rounded-full text-xs font-medium"
                          >
                            {isExpanded ? 'Ocultar' : 'Configurar'}
                          </Button>
                        )}
                      </div>

                      {isEnabled && isExpanded && (
                        <div className="px-5 pb-5 pt-3 border-t border-border/30 space-y-4 bg-card/50">
                          <div className="space-y-2">
                            <Label className="font-medium">Limite de créditos</Label>
                            <Input
                              type="number"
                              placeholder="Vazio = sem limite"
                              value={config?.credits_limit || ''}
                              onChange={(e) => updateGeneratorConfig(generator.id, {
                                credits_limit: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="rounded-xl border-0 bg-muted h-11"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="font-medium">Horário início</Label>
                              <Input
                                type="time"
                                value={config?.time_limit_start || ''}
                                onChange={(e) => updateGeneratorConfig(generator.id, {
                                  time_limit_start: e.target.value || null
                                })}
                                className="rounded-xl border-0 bg-muted h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-medium">Horário fim</Label>
                              <Input
                                type="time"
                                value={config?.time_limit_end || ''}
                                onChange={(e) => updateGeneratorConfig(generator.id, {
                                  time_limit_end: e.target.value || null
                                })}
                                className="rounded-xl border-0 bg-muted h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Dias permitidos</Label>
                            <div className="flex flex-wrap gap-2">
                              {weekdays.map((day) => {
                                const isAllowed = config?.allowed_weekdays?.includes(day.value) ?? true;
                                return (
                                  <Button
                                    key={day.value}
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const current = config?.allowed_weekdays || [0, 1, 2, 3, 4, 5, 6];
                                      const updated = isAllowed
                                        ? current.filter(d => d !== day.value)
                                        : [...current, day.value].sort();
                                      updateGeneratorConfig(generator.id, { allowed_weekdays: updated });
                                    }}
                                    className={cn(
                                      "rounded-full px-4 h-9 font-medium",
                                      isAllowed
                                        ? "bg-primary text-primary-foreground hover:brightness-105"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                  >
                                    {day.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <SecurityAccessTab
                existingPermissions={existingPermissions?.map(p => ({ page_id: p.page_id, granted: p.granted }))}
                onPermissionsChange={setEditPermissions}
                password={clientPassword}
                onPasswordChange={setClientPassword}
                forcePasswordChange={forcePasswordChange}
                onForcePasswordChangeToggle={setForcePasswordChange}
                lastLogin={null}
                isEditMode={true}
                onResetPassword={() => {
                  // TODO: implement reset password via email
                  console.log('Reset password for', client?.email);
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-6"
            >
              Cancelar
            </Button>

            <div className="flex items-center gap-3">
              {currentTabIndex > 0 && (
                <Button type="button" variant="outline" onClick={goPrev} className="rounded-full px-5">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              {currentTabIndex < tabs.length - 1 ? (
                <Button type="button" onClick={goNext} className="rounded-full px-5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={updateClient.isPending} className="rounded-full px-6 bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/20">
                  {updateClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alterações
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
=======
import { useState, useEffect } from 'react';
import { SecurityAccessTab } from './SecurityAccessTab';
import { useClientPermissions } from '@/hooks/useClientPermissions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { Building2, Package, Zap, Flame, Gem, Settings, ChevronLeft, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

import { useGenerators, usePackages, useUpdateClient, useClientDetails, ClientGenerator, Client } from '@/hooks/useClients';
import { toast } from '@/hooks/use-toast';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  type: z.enum(['fixed', 'package']),
  notes: z.string().optional(),
  contract_start: z.date().optional(),
  monthly_credits: z.number().nullable().optional(),
  package_id: z.string().optional(),
  custom_days: z.number().optional(),
  custom_credits: z.number().optional(),
  custom_price: z.number().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface GeneratorConfig {
  generator_id: string;
  enabled: boolean;
  credits_limit: number | null;
  credits_used: number;
  time_limit_start: string | null;
  time_limit_end: string | null;
  allowed_weekdays: number[];
}

interface EditClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClientModal({ client, open, onOpenChange }: EditClientModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [generatorConfigs, setGeneratorConfigs] = useState<Record<string, GeneratorConfig>>({});
  const [expandedGenerators, setExpandedGenerators] = useState<Set<string>>(new Set());
  const [clientPassword, setClientPassword] = useState('');
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});

  const { data: generators } = useGenerators();
  const { data: packages } = usePackages();
  const { data: clientDetails } = useClientDetails(client?.id || null);
  const { data: existingPermissions } = useClientPermissions(client?.id || null);
  const updateClient = useUpdateClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'fixed',
      notes: '',
      contract_start: new Date(),
      monthly_credits: null,
      package_id: '',
      custom_days: undefined,
      custom_credits: undefined,
      custom_price: undefined,
    }
  });

  // Load client data when modal opens
  useEffect(() => {
    if (client && open) {
      form.reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        type: client.type,
        notes: client.notes || '',
        contract_start: client.contract_start ? new Date(client.contract_start) : new Date(),
        monthly_credits: client.monthly_credits,
        package_id: client.package_type || '',
        custom_days: undefined,
        custom_credits: client.package_credits || undefined,
        custom_price: undefined,
      });
      setActiveTab('info');
    }
  }, [client, open, form]);

  // Load generator configs when client details are loaded
  useEffect(() => {
    if (clientDetails?.client_generators) {
      const configs: Record<string, GeneratorConfig> = {};
      clientDetails.client_generators.forEach((cg: any) => {
        configs[cg.generator_id] = {
          generator_id: cg.generator_id,
          enabled: cg.enabled ?? true,
          credits_limit: cg.credits_limit,
          credits_used: cg.credits_used || 0,
          time_limit_start: cg.time_limit_start,
          time_limit_end: cg.time_limit_end,
          allowed_weekdays: cg.allowed_weekdays || [0, 1, 2, 3, 4, 5, 6]
        };
      });
      setGeneratorConfigs(configs);
    }
  }, [clientDetails]);

  const clientType = form.watch('type');
  const selectedPackageId = form.watch('package_id');
  const customDays = form.watch('custom_days');

  const selectedPackage = packages?.find(p => p.id === selectedPackageId);
  const isCustomPackage = selectedPackageId === 'custom';

  const tabs = ['info', 'config', 'generators', 'security'];
  const currentTabIndex = tabs.indexOf(activeTab);

  const goNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    }
  };

  const goPrev = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  };

  const toggleGenerator = (generatorId: string, checked: boolean) => {
    setGeneratorConfigs(prev => ({
      ...prev,
      [generatorId]: {
        generator_id: generatorId,
        enabled: checked,
        credits_limit: prev[generatorId]?.credits_limit ?? null,
        credits_used: prev[generatorId]?.credits_used ?? 0,
        time_limit_start: prev[generatorId]?.time_limit_start ?? null,
        time_limit_end: prev[generatorId]?.time_limit_end ?? null,
        allowed_weekdays: prev[generatorId]?.allowed_weekdays ?? [0, 1, 2, 3, 4, 5, 6]
      }
    }));
  };

  const updateGeneratorConfig = (generatorId: string, updates: Partial<GeneratorConfig>) => {
    setGeneratorConfigs(prev => ({
      ...prev,
      [generatorId]: {
        ...prev[generatorId],
        ...updates
      }
    }));
  };

  const toggleExpanded = (generatorId: string) => {
    setExpandedGenerators(prev => {
      const next = new Set(prev);
      if (next.has(generatorId)) {
        next.delete(generatorId);
      } else {
        next.add(generatorId);
      }
      return next;
    });
  };

  const weekdays = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;

    const enabledGenerators = Object.values(generatorConfigs).filter(g => g.enabled);

    if (enabledGenerators.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione ao menos 1 gerador',
        variant: 'destructive'
      });
      setActiveTab('generators');
      return;
    }

    let packageCredits: number | undefined = client.package_credits || undefined;
    let accessExpiresAt: string | undefined = client.access_expires_at || undefined;
    let packageType: string | undefined = client.package_type || undefined;

    if (data.type === 'package') {
      if (isCustomPackage && data.custom_days && data.custom_credits) {
        packageCredits = data.custom_credits;
        accessExpiresAt = addDays(new Date(), data.custom_days).toISOString();
        packageType = 'custom';
      } else if (selectedPackage) {
        packageCredits = selectedPackage.credits;
        accessExpiresAt = addDays(new Date(), selectedPackage.duration_days).toISOString();
        packageType = selectedPackage.id;
      }
    }

    const generators: ClientGenerator[] = enabledGenerators.map(g => ({
      client_id: client.id,
      generator_id: g.generator_id,
      credits_limit: g.credits_limit,
      credits_used: g.credits_used,
      time_limit_start: g.time_limit_start,
      time_limit_end: g.time_limit_end,
      allowed_weekdays: g.allowed_weekdays
    }));

    await updateClient.mutateAsync({
      id: client.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      notes: data.notes,
      contract_start: data.contract_start?.toISOString().split('T')[0],
      monthly_credits: data.monthly_credits,
      package_type: packageType,
      package_credits: packageCredits,
      access_expires_at: accessExpiresAt,
      generators
    });

    onOpenChange(false);
  };

  const calculateExpirationDate = () => {
    if (isCustomPackage && customDays) {
      return format(addDays(new Date(), customDays), 'dd/MM/yyyy');
    }
    if (selectedPackage) {
      return format(addDays(new Date(), selectedPackage.duration_days), 'dd/MM/yyyy');
    }
    if (client?.access_expires_at) {
      return format(new Date(client.access_expires_at), 'dd/MM/yyyy');
    }
    return '-';
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto soft-card-elevated border-0 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4 bg-muted rounded-2xl p-1 h-12">
              <TabsTrigger value="info" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">Informações</TabsTrigger>
              <TabsTrigger value="config" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">Configuração</TabsTrigger>
              <TabsTrigger value="generators" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium">Geradores</TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-medium gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acesso
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo/empresa *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: Empresa ABC Ltda"
                    className="rounded-xl border-0 bg-muted h-11"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="email@empresa.com"
                    className="rounded-xl border-0 bg-muted h-11"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="(11) 99999-9999"
                    className="rounded-xl border-0 bg-muted h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold">Tipo de cliente</Label>
                  <RadioGroup
                    value={clientType}
                    onValueChange={(value) => form.setValue('type', value as 'fixed' | 'package')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="edit-type-fixed"
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                        clientType === 'fixed'
                          ? "bg-secondary text-secondary-foreground shadow-md"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <RadioGroupItem value="fixed" id="edit-type-fixed" className="sr-only" />
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        clientType === 'fixed' ? "bg-primary" : "bg-card"
                      )}>
                        <Building2 className={cn("h-6 w-6", clientType === 'fixed' ? "text-primary-foreground" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <p className="font-semibold">Cliente Fixo</p>
                        <p className={cn("text-sm", clientType === 'fixed' ? "text-secondary-foreground/70" : "text-muted-foreground")}>Contrato mensal</p>
                      </div>
                    </Label>
                    <Label
                      htmlFor="edit-type-package"
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                        clientType === 'package'
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <RadioGroupItem value="package" id="edit-type-package" className="sr-only" />
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        clientType === 'package' ? "bg-primary-foreground/20" : "bg-card"
                      )}>
                        <Package className={cn("h-6 w-6", clientType === 'package' ? "text-primary-foreground" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <p className="font-semibold">Cliente Avulso</p>
                        <p className={cn("text-sm", clientType === 'package' ? "text-primary-foreground/70" : "text-muted-foreground")}>Pacote temporário</p>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-6 mt-6">
              {clientType === 'fixed' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data início contrato</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl h-11",
                            !form.watch('contract_start') && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('contract_start')
                            ? format(form.watch('contract_start')!, 'dd/MM/yyyy')
                            : "Selecione uma data"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.watch('contract_start')}
                          onSelect={(date) => form.setValue('contract_start', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly_credits">Créditos mensais</Label>
                    <Input
                      id="monthly_credits"
                      type="number"
                      placeholder="Deixe vazio para ilimitado"
                      defaultValue={client.monthly_credits || ''}
                      onChange={(e) => form.setValue('monthly_credits', e.target.value ? parseInt(e.target.value) : null)}
                      className="rounded-xl border-0 bg-muted h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      {...form.register('notes')}
                      placeholder="Notas sobre o cliente..."
                      rows={3}
                      className="rounded-xl border-0 bg-muted"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-semibold">Selecionar pacote</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {packages?.map((pkg) => {
                        const icons: Record<number, React.ReactNode> = {
                          3: <Zap className="h-5 w-5" />,
                          7: <Flame className="h-5 w-5" />,
                          30: <Gem className="h-5 w-5" />
                        };
                        const icon = icons[pkg.duration_days] || <Package className="h-5 w-5" />;
                        const isSelected = selectedPackageId === pkg.id;

                        return (
                          <div
                            key={pkg.id}
                            onClick={() => form.setValue('package_id', pkg.id)}
                            className={cn(
                              "p-5 rounded-2xl cursor-pointer transition-all",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted/50 hover:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "flex items-center gap-2 mb-3",
                              isSelected ? "text-primary-foreground" : "text-primary"
                            )}>
                              {icon}
                              <span className="font-semibold">{pkg.duration_days} dias</span>
                            </div>
                            <p className="text-xl font-bold">{pkg.credits} créditos</p>
                            <p className={cn(
                              "text-sm mt-1",
                              isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              R$ {Number(pkg.price).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                      <div
                        onClick={() => form.setValue('package_id', 'custom')}
                        className={cn(
                          "p-5 rounded-2xl cursor-pointer transition-all",
                          isCustomPackage
                            ? "bg-secondary text-secondary-foreground shadow-md"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-2 mb-3",
                          isCustomPackage ? "text-secondary-foreground" : "text-muted-foreground"
                        )}>
                          <Settings className="h-5 w-5" />
                          <span className="font-semibold">Personalizado</span>
                        </div>
                        <p className={cn(
                          "text-sm",
                          isCustomPackage ? "text-secondary-foreground/70" : "text-muted-foreground"
                        )}>
                          Configure manualmente
                        </p>
                      </div>
                    </div>
                  </div>

                  {isCustomPackage && (
                    <div className="space-y-4 p-5 rounded-2xl bg-muted/50">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="custom_days" className="font-medium">Duração (dias)</Label>
                          <Input
                            id="custom_days"
                            type="number"
                            {...form.register('custom_days', { valueAsNumber: true })}
                            placeholder="Ex: 10"
                            className="rounded-xl border-0 bg-card h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="custom_credits" className="font-medium">Total de créditos</Label>
                          <Input
                            id="custom_credits"
                            type="number"
                            {...form.register('custom_credits', { valueAsNumber: true })}
                            placeholder="Ex: 100"
                            className="rounded-xl border-0 bg-card h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="custom_price" className="font-medium">Valor (R$)</Label>
                          <Input
                            id="custom_price"
                            type="number"
                            step="0.01"
                            {...form.register('custom_price', { valueAsNumber: true })}
                            placeholder="Ex: 299.00"
                            className="rounded-xl border-0 bg-card h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-secondary text-secondary-foreground">
                    <div>
                      <p className="text-sm text-secondary-foreground/60">Data início</p>
                      <p className="font-semibold text-lg">{format(new Date(), 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-foreground/60">Data expiração</p>
                      <p className="font-semibold text-lg">{calculateExpirationDate()}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="generators" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground">
                Selecione os geradores que este cliente poderá acessar.
              </p>

              <div className="space-y-3">
                {generators?.map((generator) => {
                  const config = generatorConfigs[generator.id];
                  const isEnabled = config?.enabled || false;
                  const isExpanded = expandedGenerators.has(generator.id);

                  return (
                    <div
                      key={generator.id}
                      className={cn(
                        "rounded-2xl transition-all overflow-hidden",
                        isEnabled ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-4 p-5">
                        <Checkbox
                          id={`edit-gen-${generator.id}`}
                          checked={isEnabled}
                          onCheckedChange={(checked) => toggleGenerator(generator.id, checked as boolean)}
                          className="h-5 w-5 rounded-lg"
                        />
                        <Label
                          htmlFor={`edit-gen-${generator.id}`}
                          className="flex-1 cursor-pointer font-semibold"
                        >
                          {generator.name}
                        </Label>
                        {isEnabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(generator.id)}
                            className="rounded-full text-xs font-medium"
                          >
                            {isExpanded ? 'Ocultar' : 'Configurar'}
                          </Button>
                        )}
                      </div>

                      {isEnabled && isExpanded && (
                        <div className="px-5 pb-5 pt-3 border-t border-border/30 space-y-4 bg-card/50">
                          <div className="space-y-2">
                            <Label className="font-medium">Limite de créditos</Label>
                            <Input
                              type="number"
                              placeholder="Vazio = sem limite"
                              value={config?.credits_limit || ''}
                              onChange={(e) => updateGeneratorConfig(generator.id, {
                                credits_limit: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="rounded-xl border-0 bg-muted h-11"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="font-medium">Horário início</Label>
                              <Input
                                type="time"
                                value={config?.time_limit_start || ''}
                                onChange={(e) => updateGeneratorConfig(generator.id, {
                                  time_limit_start: e.target.value || null
                                })}
                                className="rounded-xl border-0 bg-muted h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-medium">Horário fim</Label>
                              <Input
                                type="time"
                                value={config?.time_limit_end || ''}
                                onChange={(e) => updateGeneratorConfig(generator.id, {
                                  time_limit_end: e.target.value || null
                                })}
                                className="rounded-xl border-0 bg-muted h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-medium">Dias permitidos</Label>
                            <div className="flex flex-wrap gap-2">
                              {weekdays.map((day) => {
                                const isAllowed = config?.allowed_weekdays?.includes(day.value) ?? true;
                                return (
                                  <Button
                                    key={day.value}
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const current = config?.allowed_weekdays || [0, 1, 2, 3, 4, 5, 6];
                                      const updated = isAllowed
                                        ? current.filter(d => d !== day.value)
                                        : [...current, day.value].sort();
                                      updateGeneratorConfig(generator.id, { allowed_weekdays: updated });
                                    }}
                                    className={cn(
                                      "rounded-full px-4 h-9 font-medium",
                                      isAllowed
                                        ? "bg-primary text-primary-foreground hover:brightness-105"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                  >
                                    {day.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <SecurityAccessTab
                existingPermissions={existingPermissions?.map(p => ({ page_id: p.page_id, granted: p.granted }))}
                onPermissionsChange={setEditPermissions}
                password={clientPassword}
                onPasswordChange={setClientPassword}
                forcePasswordChange={forcePasswordChange}
                onForcePasswordChangeToggle={setForcePasswordChange}
                lastLogin={null}
                isEditMode={true}
                onResetPassword={() => {
                  // TODO: implement reset password via email
                  console.log('Reset password for', client?.email);
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-6"
            >
              Cancelar
            </Button>

            <div className="flex items-center gap-3">
              {currentTabIndex > 0 && (
                <Button type="button" variant="outline" onClick={goPrev} className="rounded-full px-5">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              {currentTabIndex < tabs.length - 1 ? (
                <Button type="button" onClick={goNext} className="rounded-full px-5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={updateClient.isPending} className="rounded-full px-6 bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/20">
                  {updateClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alterações
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
