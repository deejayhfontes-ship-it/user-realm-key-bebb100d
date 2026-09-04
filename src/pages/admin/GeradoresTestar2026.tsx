import { useState, useEffect, useRef } from 'react';
import { Sparkles, Upload, Download, Eye, Loader2, X, ImageOff } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import {
  montarPrompt,
  ESTILOS,
  ESTILOS_LABELS,
  type OrionForm,
  type OrionCategoria,
  type OrionPlano,
  type OrionPosicao,
  type OrionDimensions,
  type OrionQuality,
} from '@/lib/geradores/orionPrompt';

interface RefImage {
  base64: string; // sem o prefixo data:
  dataUrl: string; // com prefixo, para preview
  name: string;
}

const defaultForm: OrionForm = {
  categoria: 'pessoa',
  quantidade: 1,
  subject_description: '',
  plano: 'medium',
  subject_position: 'center',
  estilo_visual: 'ultra_realistic',
  cenario: '',
  nicho_projeto: '',
  color_palette: '',
  dimensions: '4:5',
  quality: '2K',
  sobriedade_criatividade: 50,
  textos: '',
};

function stripDataPrefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

function OrionProGenerator() {
  const [form, setForm] = useState<OrionForm>(defaultForm);
  const [images, setImages] = useState<RefImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultMime, setResultMime] = useState<string>('image/png');
  const [lastPrompt, setLastPrompt] = useState<string>('');

  const update = <K extends keyof OrionForm>(key: K, value: OrionForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<RefImage>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                base64: stripDataPrefix(reader.result as string),
                dataUrl: reader.result as string,
                name: file.name,
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setImages((prev) => [...prev, ...arr]);
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleBuild = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);

    const prompt = montarPrompt(form);
    setLastPrompt(prompt);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gerar-imagem-teste', {
        body: {
          prompt,
          imagens: images.map((i) => i.base64),
          dimensions: form.dimensions,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.image_base64) throw new Error('Resposta sem imagem.');

      const mime = data.mime || 'image/png';
      setResultMime(mime);
      setResultUrl(`data:${mime};base64,${data.image_base64}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido ao gerar imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `orion-teste-${Date.now()}.${resultMime.split('/')[1] || 'png'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Órion Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => update('categoria', v as OrionCategoria)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoa">Pessoa</SelectItem>
                <SelectItem value="produto">Produto</SelectItem>
                <SelectItem value="livre">Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload de referências */}
          <div className="space-y-2">
            <Label>Fotos do sujeito / produto</Label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4" />
              Enviar imagens (1 ou mais)
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                    <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label>Quantidade de sujeitos: {form.quantidade}</Label>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[form.quantidade]}
              onValueChange={([v]) => update('quantidade', v)}
            />
          </div>

          {/* Descrição do sujeito */}
          <div className="space-y-2">
            <Label>Descrição do sujeito</Label>
            <Textarea
              value={form.subject_description}
              onChange={(e) => update('subject_description', e.target.value)}
              placeholder="Ex: mulher 30 anos, cabelo cacheado, sorrindo"
              rows={2}
            />
          </div>

          {/* Plano + Posição */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={form.plano} onValueChange={(v) => update('plano', v as OrionPlano)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="close-up">Close-up</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="american">Americano</SelectItem>
                  <SelectItem value="full">Corpo inteiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Posição</Label>
              <Select
                value={form.subject_position}
                onValueChange={(v) => update('subject_position', v as OrionPosicao)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estilo visual */}
          <div className="space-y-2">
            <Label>Estilo visual</Label>
            <Select
              value={form.estilo_visual}
              onValueChange={(v) => update('estilo_visual', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(ESTILOS).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ESTILOS_LABELS[key] ?? key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cenário */}
          <div className="space-y-2">
            <Label>Cenário / contexto</Label>
            <Textarea
              value={form.cenario}
              onChange={(e) => update('cenario', e.target.value)}
              placeholder="Ex: estúdio com fundo neutro, luz natural"
              rows={2}
            />
          </div>

          {/* Nicho */}
          <div className="space-y-2">
            <Label>Nicho / projeto</Label>
            <Input
              value={form.nicho_projeto}
              onChange={(e) => update('nicho_projeto', e.target.value)}
              placeholder="Ex: clínica odontológica"
            />
          </div>

          {/* Paleta */}
          <div className="space-y-2">
            <Label>Paleta de cores (opcional)</Label>
            <Input
              value={form.color_palette}
              onChange={(e) => update('color_palette', e.target.value)}
              placeholder="Ex: azul petróleo, dourado, branco"
            />
          </div>

          {/* Dimensões + Qualidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dimensões</Label>
              <Select
                value={form.dimensions}
                onValueChange={(v) => update('dimensions', v as OrionDimensions)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="4:5">4:5</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                  <SelectItem value="16:9">16:9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Qualidade</Label>
              <Select
                value={form.quality}
                onValueChange={(v) => update('quality', v as OrionQuality)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1K">1K</SelectItem>
                  <SelectItem value="2K">2K</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sobriedade / criatividade */}
          <div className="space-y-2">
            <Label>Sobriedade ↔ Criatividade: {form.sobriedade_criatividade}</Label>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[form.sobriedade_criatividade]}
              onValueChange={([v]) => update('sobriedade_criatividade', v)}
            />
          </div>

          {/* Textos */}
          <div className="space-y-2">
            <Label>Textos na imagem (opcional)</Label>
            <Input
              value={form.textos}
              onChange={(e) => update('textos', e.target.value)}
              placeholder="Ex: 50% OFF"
            />
          </div>

          <Button onClick={handleBuild} disabled={loading} className="w-full">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Construindo...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Construir</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive border border-destructive/30 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="aspect-[4/5] w-full rounded-md border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : resultUrl ? (
              <img src={resultUrl} alt="Resultado gerado" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
                <ImageOff className="w-8 h-8" />
                Nenhuma imagem ainda
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} disabled={!resultUrl} variant="secondary" className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!lastPrompt} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" /> Ver prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Prompt final</DialogTitle>
                </DialogHeader>
                <pre className="whitespace-pre-wrap text-sm bg-muted/50 rounded-md p-4 max-h-[60vh] overflow-auto">
                  {lastPrompt}
                </pre>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Réplica DesignBuilder (HTML puro em public/geradores-testar-2026) dentro de um iframe.
//    O iframe pede a geração por postMessage; aqui chamamos a edge function com a sessão logada
//    e devolvemos a imagem. A chave Google nunca vai pro browser.
function ReplicaDesignBuilder() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMsg = async (ev: MessageEvent) => {
      const win = ref.current?.contentWindow;
      if (!win || ev.source !== win || ev.origin !== window.location.origin) return;
      const d = ev.data || {};
      if (d.type !== 'GERAR_IMAGEM') return;
      try {
        const { data, error } = await supabase.functions.invoke('gerar-imagem-teste', {
          body: { prompt: d.prompt, imagens: d.imagens || [], dimensions: d.dimensions },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        if (!data?.image_base64) throw new Error('Resposta sem imagem.');
        win.postMessage(
          { type: 'GERAR_IMAGEM_RESULT', image_base64: data.image_base64, mime: data.mime },
          window.location.origin,
        );
      } catch (e) {
        win.postMessage(
          { type: 'GERAR_IMAGEM_RESULT', error: e instanceof Error ? e.message : 'Erro desconhecido' },
          window.location.origin,
        );
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  return (
    <iframe
      ref={ref}
      src="/geradores-testar-2026/index.html"
      title="DesignBuilder Réplica"
      className="w-full rounded-xl border bg-[#0a0714]"
      style={{ height: 'calc(100vh - 170px)', minHeight: 720 }}
    />
  );
}

export default function GeradoresTestar2026() {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title="GERADORES TESTAR 2026"
        subtitle="Gerador de imagens por IA para testes — reusa a chave Google já configurada"
      />
      <div className="flex-1 p-8">
        <Tabs defaultValue="designbuilder">
          <TabsList>
            <TabsTrigger value="designbuilder">DesignBuilder</TabsTrigger>
            <TabsTrigger value="orion-pro">Órion Pro</TabsTrigger>
          </TabsList>
          <TabsContent value="designbuilder" className="mt-4">
            <ReplicaDesignBuilder />
          </TabsContent>
          <TabsContent value="orion-pro" className="mt-6">
            <OrionProGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
