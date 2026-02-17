import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, X, Image, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCreateAIProvider, useTestAIProvider } from '@/hooks/useAIProviders';
import { providerTemplates, type APIType } from '@/lib/ai-engine/types';

interface AddProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const apiTypes = [
  { value: 'lovable', label: 'Lovable AI (recomendado)' },
  { value: 'openai', label: 'OpenAI (GPT-4, etc)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'custom', label: 'Custom (qualquer API)' },
];

export function AddProviderModal({ open, onOpenChange }: AddProviderModalProps) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    api_type: 'lovable' as APIType,
    endpoint_url: '',
    api_key_encrypted: '',
    model_name: '',
    response_path: '',
    system_prompt: '',
    timeout_seconds: 30,
    max_tokens: 4000,
    temperature: 0.7,
    supports_images: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateAIProvider();
  const testMutation = useTestAIProvider();

  // Apply template when type changes
  useEffect(() => {
    const template = providerTemplates[form.api_type];
    if (template) {
      setForm((prev) => ({
        ...prev,
        name: template.name || prev.name,
        endpoint_url: template.endpointUrl || '',
        model_name: template.modelName || '',
        response_path: template.responsePath || '',
        system_prompt: template.systemPrompt || '',
      }));
    }
  }, [form.api_type]);

  // Generate slug from name
  useEffect(() => {
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setForm((prev) => ({ ...prev, slug }));
  }, [form.name]);

  const handleTest = () => {
    testMutation.mutate({
      apiType: form.api_type,
      endpointUrl: form.endpoint_url,
      apiKey: form.api_key_encrypted,
      modelName: form.model_name,
    });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const url = URL.createObjectURL(file);
      setIconPreview(url);
    }
  };

  const handleRemoveIcon = () => {
    setIconFile(null);
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
      setIconPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Upload icon to storage and get URL
    createMutation.mutate(form, {
      onSuccess: () => {
        onOpenChange(false);
        handleRemoveIcon();
        setForm({
          name: '',
          slug: '',
          api_type: 'lovable',
          endpoint_url: '',
          api_key_encrypted: '',
          model_name: '',
          response_path: '',
          system_prompt: '',
          timeout_seconds: 30,
          max_tokens: 4000,
          temperature: 0.7,
          supports_images: true,
        });
      },
    });
  };

  const isLovable = form.api_type === 'lovable';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="soft-card-elevated border-0 rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Provedor de IA</DialogTitle>
          <DialogDescription>
            Configure um novo provedor para edição de geradores via IA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon Upload */}
          <div className="space-y-2">
            <Label>Ícone / Logo do Provedor</Label>
            <div className="flex items-center gap-4">
              {iconPreview ? (
                <div className="relative">
                  <img
                    src={iconPreview}
                    alt="Preview do ícone"
                    className="w-16 h-16 rounded-xl object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Carregar imagem
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP ou SVG. Máx 1MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Provedor *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Minha IA Custom"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de API *</Label>
              <Select
                value={form.api_type}
                onValueChange={(value) => setForm({ ...form, api_type: value as APIType })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {apiTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endpoint & Key */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint da API *</Label>
              <Input
                value={form.endpoint_url}
                onChange={(e) => setForm({ ...form, endpoint_url: e.target.value })}
                placeholder="https://api.exemplo.com/v1/chat/completions"
                className="rounded-xl"
                required
                disabled={isLovable}
              />
              {isLovable && (
                <p className="text-xs text-muted-foreground">
                  Lovable AI usa endpoint pré-configurado.
                </p>
              )}
            </div>

            {!isLovable && (
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={form.api_key_encrypted}
                  onChange={(e) => setForm({ ...form, api_key_encrypted: e.target.value })}
                  placeholder="sk-..."
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  A chave será armazenada de forma segura.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input
                value={form.model_name}
                onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                placeholder="Ex: gpt-4, claude-3, gemini-pro"
                className="rounded-xl"
              />
            </div>

            {/* Supports Images Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <input
                type="checkbox"
                id="supports_images"
                checked={form.supports_images}
                onChange={(e) => setForm({ ...form, supports_images: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <div className="flex-1">
                <label htmlFor="supports_images" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Suporta imagens (multimodal)
                </label>
                <p className="text-xs text-muted-foreground">
                  Ative se a API aceita imagens junto com texto (ex: GPT-4 Vision, Claude 3, Gemini)
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced" className="border-0">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                Configurações Avançadas
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Timeout (segundos)</Label>
                    <Input
                      type="number"
                      value={form.timeout_seconds}
                      onChange={(e) =>
                        setForm({ ...form, timeout_seconds: parseInt(e.target.value) || 30 })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={form.max_tokens}
                      onChange={(e) =>
                        setForm({ ...form, max_tokens: parseInt(e.target.value) || 4000 })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={form.temperature}
                      onChange={(e) =>
                        setForm({ ...form, temperature: parseFloat(e.target.value) || 0.7 })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Response Path (JSON path)</Label>
                  <Input
                    value={form.response_path}
                    onChange={(e) => setForm({ ...form, response_path: e.target.value })}
                    placeholder="Ex: choices[0].message.content"
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Caminho para extrair o texto da resposta JSON.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>System Prompt customizado</Label>
                  <Textarea
                    value={form.system_prompt}
                    onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                    placeholder="Instruções para a IA..."
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={!form.endpoint_url || testMutation.isPending}
              className="rounded-xl"
            >
              {testMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Testar Conexão
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!form.name || !form.endpoint_url || createMutation.isPending}
              className="rounded-xl"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
