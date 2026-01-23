import { Eye, Pencil, Ban, Unlock } from 'lucide-react';
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
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  blocked: { label: 'Bloqueado', variant: 'destructive' },
  expired: { label: 'Expirado', variant: 'outline' }
};

const typeConfig: Record<string, { label: string; className: string }> = {
  fixed: { label: 'Fixo', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  package: { label: 'Pacote', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
};

export function ClientsTable({ clients, isLoading, onView, onEdit, onToggleBlock }: ClientsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!clients?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum cliente encontrado.</p>
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
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-medium">Nome do Cliente</TableHead>
            <TableHead className="font-medium">Tipo</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Créditos</TableHead>
            <TableHead className="font-medium">Validade</TableHead>
            <TableHead className="font-medium text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const status = statusConfig[client.status || 'inactive'];
            const type = typeConfig[client.type] || typeConfig.package;
            
            return (
              <TableRow key={client.id} className="group">
                <TableCell>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    {client.email && (
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={type.className}>
                    {type.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{formatCredits(client)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatValidity(client)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(client)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(client)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
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
