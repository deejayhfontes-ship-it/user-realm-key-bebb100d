import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePartnerLogos, PartnerLogo } from '@/hooks/usePartnerLogos';
import { Upload, Edit, Trash2, AlertTriangle, GripVertical, ExternalLink, Loader2 } from 'lucide-react';

export function PartnersConfigTab() {
  const {
    logos,
    settings,
    loading,
    canActivateSection,
    createLogo,
    updateLogo,
    deleteLogo,
    reorderLogos,
    updateSettings,
    uploadLogo,
  } = usePartnerLogos();

  const [isUploading, setIsUploading] = useState(false);
  const [editingLogo, setEditingLogo] = useState<PartnerLogo | null>(null);
  const [deletingLogo, setDeletingLogo] = useState<PartnerLogo | null>(null);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoSiteUrl, setNewLogoSiteUrl] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Formato de arquivo inválido. Use PNG, SVG, JPG ou WEBP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo muito grande (max 2MB)');
      return;
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadAndCreate = async () => {
    if (!pendingFile || !newLogoName.trim()) return;

    setIsUploading(true);
    try {
      const url = await uploadLogo(pendingFile);
      if (url) {
        await createLogo({
          nome: newLogoName.trim(),
          logo_url: url,
          site_url: newLogoSiteUrl.trim() || undefined,
        });
        // Reset form
        setPendingFile(null);
        setPreviewUrl(null);
        setNewLogoName('');
        setNewLogoSiteUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setNewLogoName('');
    setNewLogoSiteUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateLogo = async () => {
    if (!editingLogo) return;
    await updateLogo(editingLogo.id, {
      nome: editingLogo.nome,
      site_url: editingLogo.site_url,
      ativo: editingLogo.ativo,
    });
    setEditingLogo(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLogo) return;
    await deleteLogo(deletingLogo.id);
    setDeletingLogo(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...logos];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    await reorderLogos(newOrder.map(l => l.id));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleToggleSection = async (checked: boolean) => {
    if (checked && !canActivateSection) return;
    await updateSettings(checked);
  };

  if (loading) {
    return (
      <Card className="border border-border">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Gerenciar Logos de Parceiros</CardTitle>
          <CardDescription>
            Logos exibidos no carrossel da home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Section */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-section" className="text-base font-medium">
                Exibir seção "Parceiros Criativos" na home
              </Label>
              <p className="text-sm text-muted-foreground">
                {canActivateSection
                  ? 'Você tem logos suficientes para ativar a seção'
                  : `Adicione pelo menos 4 logos para ativar (${logos.filter(l => l.ativo).length}/4)`}
              </p>
            </div>
            <Switch
              id="show-section"
              checked={settings?.show_section ?? false}
              onCheckedChange={handleToggleSection}
              disabled={!canActivateSection}
            />
          </div>

          {/* Warning if not enough logos */}
          {!canActivateSection && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border-l-4 border-amber-500">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">Logos insuficientes</p>
                <p className="text-sm text-muted-foreground">
                  Adicione pelo menos 4 logos para ativar a seção
                </p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="space-y-4">
            <Label>Adicionar Novo Logo</Label>
            {!pendingFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">
                  Arraste o logo aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground/60 mt-2">
                  PNG, SVG ou JPG • Recomendado: 400x200px • Background transparente
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border rounded-xl p-6 space-y-4">
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center h-24">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nome do cliente *</Label>
                    <Input
                      id="new-name"
                      value={newLogoName}
                      onChange={(e) => setNewLogoName(e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-url">URL do site (opcional)</Label>
                    <Input
                      id="new-url"
                      value={newLogoSiteUrl}
                      onChange={(e) => setNewLogoSiteUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={handleCancelUpload}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUploadAndCreate}
                    disabled={!newLogoName.trim() || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Adicionar Logo'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logos Grid */}
      {logos.length > 0 && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Logos Cadastrados ({logos.length})</CardTitle>
            <CardDescription>
              Arraste para reordenar • Clique para editar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {logos.map((logo, index) => (
                <div
                  key={logo.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`relative bg-card border rounded-xl p-5 transition-all ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${dragOverIndex === index ? 'border-primary border-dashed' : ''}`}
                >
                  {/* Drag Handle */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Actions */}
                  <div className="absolute right-3 top-3 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingLogo({ ...logo })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingLogo(logo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="pl-6 space-y-3">
                    <div className="bg-muted rounded-lg p-4 h-20 flex items-center justify-center">
                      <img
                        src={logo.logo_url}
                        alt={logo.nome}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold truncate">{logo.nome}</h4>
                      {logo.site_url && (
                        <a
                          href={logo.site_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                        >
                          {logo.site_url}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        Ordem: {logo.ordem}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Ativo</span>
                        <Switch
                          checked={logo.ativo}
                          onCheckedChange={(checked) =>
                            updateLogo(logo.id, { ativo: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {logos.length === 0 && (
        <Card className="border border-dashed">
          <CardContent className="p-12 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg mb-2">Nenhum logo cadastrado</h3>
            <p className="text-muted-foreground">
              Adicione o primeiro logo para começar!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingLogo} onOpenChange={() => setEditingLogo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Logo</DialogTitle>
          </DialogHeader>
          {editingLogo && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 h-24 flex items-center justify-center">
                <img
                  src={editingLogo.logo_url}
                  alt={editingLogo.nome}
                  className="max-h-full max-w-48 object-contain"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do cliente *</Label>
                <Input
                  id="edit-name"
                  value={editingLogo.nome}
                  onChange={(e) =>
                    setEditingLogo({ ...editingLogo, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-url">URL do site</Label>
                <Input
                  id="edit-url"
                  value={editingLogo.site_url || ''}
                  onChange={(e) =>
                    setEditingLogo({ ...editingLogo, site_url: e.target.value || null })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-ativo">Ativo</Label>
                <Switch
                  id="edit-ativo"
                  checked={editingLogo.ativo}
                  onCheckedChange={(checked) =>
                    setEditingLogo({ ...editingLogo, ativo: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingLogo(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateLogo}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingLogo} onOpenChange={() => setDeletingLogo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja remover este logo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O logo "{deletingLogo?.nome}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
