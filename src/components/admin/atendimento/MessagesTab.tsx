import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Eye, CheckCircle, Archive, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { useContactMessages } from '@/hooks/useContactMessages';
import type { ContactMessage, ContactMessageStatus } from '@/types/cms';

const statusConfig: Record<ContactMessageStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  new: { label: 'Novo', variant: 'default' },
  read: { label: 'Lido', variant: 'secondary' },
  replied: { label: 'Respondido', variant: 'outline' },
  archived: { label: 'Arquivado', variant: 'destructive' },
};

interface MessagesTabProps {
  searchTerm: string;
  statusFilter: string;
}

export function MessagesTab({ searchTerm, statusFilter }: MessagesTabProps) {
  const { messages, loading, updateStatus, updateNotes, deleteMessage } = useContactMessages();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setNotes(msg.admin_notes || '');
    if (msg.status === 'new') {
      updateStatus(msg.id, 'read');
    }
  };

  const handleSaveNotes = () => {
    if (selectedMessage) {
      updateNotes(selectedMessage.id, notes);
    }
  };

  const handleDelete = (id: string) => {
    setMessageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1">Nenhuma mensagem recebida</h3>
        <p className="text-sm text-muted-foreground">
          As mensagens do formulário de contato aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => openMessage(msg)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium truncate">{msg.name}</span>
                <Badge variant={statusConfig[msg.status].variant}>
                  {statusConfig[msg.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{msg.email}</p>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {msg.subject || msg.message.slice(0, 60)}...
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {format(new Date(msg.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        ))}
      </div>

      {/* Message Detail Sheet */}
      <Sheet open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedMessage && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Mensagem de {selectedMessage.name}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Nome</label>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Email</label>
                    <p className="font-medium">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Telefone</label>
                      <p className="font-medium">{selectedMessage.phone}</p>
                    </div>
                  )}
                  {selectedMessage.subject && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Assunto</label>
                      <p className="font-medium">{selectedMessage.subject}</p>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Mensagem</label>
                  <p className="mt-1 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="text-xs text-muted-foreground uppercase mb-2 block">
                    Anotações Internas
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione notas sobre este contato..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={handleSaveNotes}
                  >
                    Salvar Anotações
                  </Button>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Ações</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMessage.status !== 'read' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateStatus(selectedMessage.id, 'read');
                          setSelectedMessage({ ...selectedMessage, status: 'read' });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Marcar como Lido
                      </Button>
                    )}
                    {selectedMessage.status !== 'replied' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateStatus(selectedMessage.id, 'replied');
                          setSelectedMessage({ ...selectedMessage, status: 'replied' });
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Respondido
                      </Button>
                    )}
                    {selectedMessage.status !== 'archived' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateStatus(selectedMessage.id, 'archived');
                          setSelectedMessage({ ...selectedMessage, status: 'archived' });
                        }}
                      >
                        <Archive className="w-4 h-4 mr-1" /> Arquivar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
