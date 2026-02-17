import { useState } from 'react';
import { useProjectTypesAdmin, ProjectType } from '@/hooks/useProjectTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Palette, 
  Monitor, 
  Instagram, 
  Play, 
  Layers, 
  MoreHorizontal,
  Package,
  Megaphone,
  FileText,
  PenTool,
  Camera,
  Loader2,
  Check,
  X
} from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

const AVAILABLE_ICONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'Palette', label: 'Paleta', icon: Palette },
  { value: 'Monitor', label: 'Monitor', icon: Monitor },
  { value: 'Instagram', label: 'Instagram', icon: Instagram },
  { value: 'Play', label: 'Play', icon: Play },
  { value: 'Layers', label: 'Camadas', icon: Layers },
  { value: 'Package', label: 'Pacote', icon: Package },
  { value: 'Megaphone', label: 'Megafone', icon: Megaphone },
  { value: 'FileText', label: 'Documento', icon: FileText },
  { value: 'PenTool', label: 'Caneta', icon: PenTool },
  { value: 'Camera', label: 'Câmera', icon: Camera },
  { value: 'MoreHorizontal', label: 'Outro', icon: MoreHorizontal },
];

const getIconComponent = (iconName: string | null): LucideIcon => {
  const found = AVAILABLE_ICONS.find(i => i.value === iconName);
  return found?.icon || MoreHorizontal;
};

export function ContactFormConfigTab() {
  const { projectTypes, loading, addProjectType, updateProjectType, deleteProjectType } = useProjectTypesAdmin();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('MoreHorizontal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    await addProjectType(newName.trim(), newIcon);
    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setNewName('');
    setNewIcon('MoreHorizontal');
  };

  const handleStartEdit = (pt: ProjectType) => {
    setEditingId(pt.id);
    setEditName(pt.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateProjectType(id, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleToggleActive = async (pt: ProjectType) => {
    await updateProjectType(pt.id, { is_active: !pt.is_active });
  };

  const handleIconChange = async (id: string, icon: string) => {
    await updateProjectType(id, { icon });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProjectType(deleteId);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <Card className="border border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tipos de Projeto</CardTitle>
            <CardDescription>
              Opções exibidas no formulário de contato
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar tipo
          </Button>
        </CardHeader>
        <CardContent>
          {projectTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum tipo de projeto cadastrado.</p>
              <p className="text-sm mt-1">Clique em "Adicionar tipo" para começar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projectTypes.map((pt) => {
                const Icon = getIconComponent(pt.icon);
                const isEditing = editingId === pt.id;

                return (
                  <div
                    key={pt.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      pt.is_active 
                        ? "bg-card border-border" 
                        : "bg-muted/50 border-border/50 opacity-60"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    
                    <Select
                      value={pt.icon || 'MoreHorizontal'}
                      onValueChange={(value) => handleIconChange(pt.id, value)}
                    >
                      <SelectTrigger className="w-[100px] h-9">
                        <SelectValue>
                          <Icon className="w-4 h-4" />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((iconOpt) => (
                          <SelectItem key={iconOpt.value} value={iconOpt.value}>
                            <div className="flex items-center gap-2">
                              <iconOpt.icon className="w-4 h-4" />
                              <span>{iconOpt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(pt.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSaveEdit(pt.id)}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <span 
                        className="flex-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleStartEdit(pt)}
                      >
                        {pt.name}
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={pt.is_active}
                        onCheckedChange={() => handleToggleActive(pt)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(pt.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Projeto</DialogTitle>
            <DialogDescription>
              Adicione uma nova opção para o formulário de contato
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Design de Embalagens"
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Ícone</label>
              <Select value={newIcon} onValueChange={setNewIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((iconOpt) => (
                    <SelectItem key={iconOpt.value} value={iconOpt.value}>
                      <div className="flex items-center gap-2">
                        <iconOpt.icon className="w-4 h-4" />
                        <span>{iconOpt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={!newName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tipo de projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O tipo de projeto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
