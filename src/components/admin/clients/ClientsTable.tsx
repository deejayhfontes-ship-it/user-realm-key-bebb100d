import { Eye, Pencil, Ban, Unlock, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Client } from '@/hooks/useClients';

interface ClientsTableProps {
  clients: Client[] | undefined;
  isLoading: boolean;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onToggleBlock: (client: Client) => void;
  onManageGenerators: (client: Client) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-primary/15 text-primary border-0 hover:bg-primary/20' },
  inactive: { label: 'Inativo', className: 'bg-muted text-muted-foreground border-0' },
  blocked: { label: 'Bloqueado', className: 'bg-destructive/15 text-destructive border-0' },
  expired: { label: 'Expirado', className: 'bg-warning/15 text-warning border-0' }
};

const typeConfig: Record<string, { label: string; className: string }> = {
  fixed: { label: 'Fixo', className: 'bg-secondary text-secondary-foreground border-0' },
  package: { label: 'Pacote', className: 'bg-primary text-primary-foreground border-0' }
};

export function ClientsTable({ clients, isLoading, onView, onEdit, onToggleBlock, onManageGenerators }: ClientsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!clients?.length) {
    return (
      <div className="soft-card text-center py-16">
        <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
      </div>
    );
  }

  const formatCredits = (client: Client) => {
    if (client.type === 'fixed') {
      if (client.monthly_credits) {
        return `${client.total_credits_used || 0}/${client.monthly_credits}`;
      }
      return 'Ilimitado';
    }
    return `${client.package_credits_used || 0}/${client.package_credits || 0}`;
  };

  const formatValidity = (client: Client) => {
    if (client.type === 'fixed') {
      return 'Sem expiração';
    }
    if (client.access_expires_at) {
      return format(new Date(client.access_expires_at), 'dd/MM/yyyy', { locale: ptBR });
    }
    return '-';
  };

  return (
    <div className="soft-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/50 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground py-5">Nome do Cliente</TableHead>
            <TableHead className="font-semibold text-foreground">Tipo</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Créditos</TableHead>
            <TableHead className="font-semibold text-foreground">Validade</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const status = statusConfig[client.status || 'inactive'] || statusConfig.inactive;
            const type = typeConfig[client.type] || typeConfig.package;

            return (
              <TableRow key={client.id} className="group border-b border-border/30 hover:bg-muted/30 transition-colors">
                <TableCell className="py-5">
                  <div>
                    <p className="font-semibold text-foreground">{client.name}</p>
                    {client.email && (
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${type.className} rounded-full px-3 py-1 font-medium text-xs`}>
                    {type.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${status.className} rounded-full px-3 py-1 font-medium text-xs`}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-muted/50 px-3 py-1.5 rounded-full">{formatCredits(client)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{formatValidity(client)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-muted"
                      onClick={() => onView(client)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-muted"
                      onClick={() => onEdit(client)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                      onClick={() => onManageGenerators(client)}
                      title="Gerenciar geradores"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onToggleBlock(client)}
                      title={client.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                    >
                      {client.status === 'blocked' ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
