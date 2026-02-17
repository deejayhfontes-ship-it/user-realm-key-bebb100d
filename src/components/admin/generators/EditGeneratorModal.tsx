import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Generator, useUpdateGenerator } from '@/hooks/useGenerators';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ready', 'development', 'disabled']),
  output_width: z.number().optional(),
  output_height: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditGeneratorModalProps {
  generator: Generator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const generatorTypes = [
  { value: 'stories', label: 'Stories' },
  { value: 'derivacoes', label: 'Derivações IA' },
  { value: 'carrossel', label: 'Carrossel' },
  { value: 'avisos', label: 'Avisos' },
  { value: 'outro', label: 'Outro' },
];

export function EditGeneratorModal({ generator, open, onOpenChange }: EditGeneratorModalProps) {
  const updateGenerator = useUpdateGenerator();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: '',
      description: '',
      status: 'development',
      output_width: 1080,
      output_height: 1920,
    }
  });

  useEffect(() => {
    if (generator) {
      const config = generator.config as any;
      form.reset({
        name: generator.name,
        slug: generator.slug,
        type: generator.type,
        description: generator.description || '',
        status: (generator.status as 'ready' | 'development' | 'disabled') || 'development',
        output_width: config?.options?.output_width || 1080,
        output_height: config?.options?.output_height || 1920,
      });
    }
  }, [generator, form]);

  const onSubmit = async (data: FormData) => {
    if (!generator) return;

    const existingConfig = generator.config as any || {};
    
    await updateGenerator.mutateAsync({
      id: generator.id,
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description,
      status: data.status,
      config: {
        ...existingConfig,
        options: {
          ...existingConfig.options,
          output_width: data.output_width,
          output_height: data.output_height
        }
      }
    });
    
    onOpenChange(false);
  };

  if (!generator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg soft-card-elevated border-0 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Editar Gerador</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">Nome *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Ex: Gerador de Stories"
              className="h-12 rounded-2xl border-0 bg-muted focus:ring-2 focus:ring-primary/20"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="font-medium">Slug *</Label>
            <Input
              id="slug"
              {...form.register('slug')}
              placeholder="gerador-de-stories"
              className="h-12 rounded-2xl border-0 bg-muted focus:ring-2 focus:ring-primary/20 font-mono text-sm"
            />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="font-medium">Tipo *</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value)}
            >
              <SelectTrigger className="h-12 rounded-2xl border-0 bg-muted focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-0 shadow-lg">
                {generatorTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="rounded-xl">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Descrição</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descrição breve do gerador..."
              className="rounded-2xl border-0 bg-muted focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
            />
          </div>

          {/* Output dimensions */}
          <div className="space-y-2">
            <Label className="font-medium">Dimensões de saída</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  {...form.register('output_width', { valueAsNumber: true })}
                  placeholder="Largura"
                  className="h-12 rounded-2xl border-0 bg-muted focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <Input
                  type="number"
                  {...form.register('output_height', { valueAsNumber: true })}
                  placeholder="Altura"
                  className="h-12 rounded-2xl border-0 bg-muted focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Ex: 1080x1920 para Stories</p>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="font-medium">Status</Label>
            <RadioGroup
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as 'ready' | 'development' | 'disabled')}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="edit-status-ready"
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all text-center",
                  form.watch('status') === 'ready'
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <RadioGroupItem value="ready" id="edit-status-ready" className="sr-only" />
                <span className="font-medium text-sm">Pronto</span>
              </Label>
              <Label
                htmlFor="edit-status-development"
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all text-center",
                  form.watch('status') === 'development'
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <RadioGroupItem value="development" id="edit-status-development" className="sr-only" />
                <span className="font-medium text-sm">Desenvolvimento</span>
              </Label>
              <Label
                htmlFor="edit-status-disabled"
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all text-center",
                  form.watch('status') === 'disabled'
                    ? "bg-muted text-muted-foreground shadow-md"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <RadioGroupItem value="disabled" id="edit-status-disabled" className="sr-only" />
                <span className="font-medium text-sm">Desabilitado</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateGenerator.isPending}
              className="rounded-full px-6 bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/20"
            >
              {updateGenerator.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
