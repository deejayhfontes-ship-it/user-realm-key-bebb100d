import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Users, Download, Plus, Trash2, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useNewsletter } from '@/hooks/useNewsletter';

interface NewsletterTabProps {
  searchTerm: string;
}

export function NewsletterTab({ searchTerm }: NewsletterTabProps) {
  const { subscribers, loading, totalActive, addSubscriber, removeSubscriber, toggleActive, exportCSV } = useNewsletter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    const success = await addSubscriber(newEmail, newName);
    if (success) {
      setAddDialogOpen(false);
      setNewEmail('');
      setNewName('');
    }
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    setSubscriberToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (subscriberToDelete) {
      removeSubscriber(subscriberToDelete);
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Stats and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalActive}</p>
                <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Manual
          </Button>
        </div>
      </div>

      {/* Subscribers List */}
      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">Nenhum assinante cadastrado</h3>
          <p className="text-sm text-muted-foreground">
            Os assinantes da newsletter aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSubscribers.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {sub.name || sub.email}
                  </span>
                  {!sub.is_active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
                {sub.name && (
                  <p className="text-sm text-muted-foreground truncate">{sub.email}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(sub.created_at), "dd/MM/yy", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={sub.is_active}
                  onCheckedChange={(checked) => toggleActive(sub.id, checked)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(sub.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subscriber Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Assinante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nome (opcional)</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do assinante"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={adding || !newEmail.trim()}>
              {adding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover assinante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover o assinante da lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
