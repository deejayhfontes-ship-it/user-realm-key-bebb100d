import { useState, useCallback } from 'react';
import { Upload, Link, FileArchive, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInstallGenerator } from '@/hooks/useInstallGenerator';
import { cn } from '@/lib/utils';

export function InstallGeneratorTab() {
  // Upload method state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // URL method state
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  
  const installMutation = useInstallGenerator();

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadInstall = () => {
    if (selectedFile) {
      installMutation.mutate({ method: 'upload', file: selectedFile });
    }
  };

  const handleUrlInstall = () => {
    if (url) {
      installMutation.mutate({ method: 'url', url, token: token || undefined });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Method 1: Upload ZIP */}
      <Card className="soft-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-primary" />
            Upload ZIP
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo ZIP contendo o gerador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/30 hover:border-muted-foreground/50",
              selectedFile && "border-primary bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
          {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle className="h-10 w-10 mx-auto text-primary" />
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <FileArchive className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-foreground font-medium">
                    Arraste o arquivo ZIP aqui
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou clique para selecionar
                  </p>
                </div>
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="zip-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => document.getElementById('zip-upload')?.click()}
                >
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-medium text-foreground mb-2">Requisitos:</p>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Arquivo .zip
            </p>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Conter config.json na raiz
            </p>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Máximo 50MB
            </p>
          </div>

          <Button
            onClick={handleUploadInstall}
            disabled={!selectedFile || installMutation.isPending}
            className="w-full rounded-full bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/20"
          >
            {installMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Instalar via Upload
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Method 2: Import via URL */}
      <Card className="soft-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link className="h-5 w-5 text-primary" />
            Importar via URL
          </CardTitle>
          <CardDescription>
            Importe diretamente de uma URL ou repositório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generator-url">URL do gerador</Label>
            <Input
              id="generator-url"
              placeholder="https://github.com/user/repo/archive/main.zip"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Supported types info */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
            <p className="font-medium text-foreground">Tipos suportados:</p>
            <div className="space-y-1.5 text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>GitHub: github.com/user/repo/archive/main.zip</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                <span>URL direta: https://site.com/generator.zip</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-token" className="flex items-center gap-2">
              Token de acesso
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="access-token"
              type="password"
              placeholder="Para repositórios privados"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button
            onClick={handleUrlInstall}
            disabled={!url || installMutation.isPending}
            className="w-full rounded-full bg-primary text-primary-foreground hover:brightness-105 shadow-lg shadow-primary/20"
          >
            {installMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Instalar via URL
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Installation result feedback */}
      {installMutation.isSuccess && (
        <Card className="col-span-full soft-card border-0 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <CheckCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                Gerador instalado com sucesso!
              </p>
              <p className="text-sm text-muted-foreground">
                {installMutation.data?.generator.name} v{installMutation.data?.generator.version}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {installMutation.isError && (
        <Card className="col-span-full soft-card border-0 bg-destructive/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-medium text-foreground">
                Erro na instalação
              </p>
              <p className="text-sm text-destructive">
                {installMutation.error?.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
