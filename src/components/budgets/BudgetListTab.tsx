import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Copy, FileDown, Trash2 } from 'lucide-react';
import { useBudgets, useBudgetSettings } from '@/hooks/useBudgets';
import { formatCurrency, formatDate, downloadBudgetPDF } from '@/lib/budget-pdf';
import type { Budget, BudgetWithLines } from '@/types/budget';

interface BudgetListTabProps {
  onEdit: (budget: BudgetWithLines) => void;
  onView: (budget: BudgetWithLines) => void;
}

const statusColors: Record<Budget['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/20 text-blue-500',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  expired: 'bg-orange-500/20 text-orange-500',
};

const statusLabels: Record<Budget['status'], string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Recusado',
  expired: 'Expirado',
};

export function BudgetListTab({ onEdit, onView }: BudgetListTabProps) {
  const { budgets, loading, fetchBudgetWithLines, deleteBudget, createBudget, updateStatus } = useBudgets();
  const { settings } = useBudgetSettings();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleView = async (budget: Budget) => {
    setActionLoading(budget.id);
    const full = await fetchBudgetWithLines(budget.id);
    setActionLoading(null);
    if (full) onView(full);
  };

  const handleEdit = async (budget: Budget) => {
    setActionLoading(budget.id);
    const full = await fetchBudgetWithLines(budget.id);
    setActionLoading(null);
    if (full) onEdit(full);
  };

  const handleDuplicate = async (budget: Budget) => {
    setActionLoading(budget.id);
    const full = await fetchBudgetWithLines(budget.id);
    if (full) {
      await createBudget(
        {
          date: new Date().toISOString().split('T')[0],
          validity_days: full.validity_days,
          client_name: full.client_name,
          client_document: full.client_document,
          client_email: full.client_email,
          client_phone: full.client_phone,
          client_address: full.client_address,
          notes: full.notes,
          global_discount_type: full.global_discount_type,
          global_discount_value: full.global_discount_value,
          shipping: full.shipping,
          subtotal: full.subtotal,
          total: full.total,
        },
        full.lines.map(l => ({
          catalog_item_id: l.catalog_item_id,
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
          discount_type: l.discount_type,
          discount_value: l.discount_value,
          total: l.total,
        }))
      );
    }
    setActionLoading(null);
  };

  const handleDownloadPDF = async (budget: Budget) => {
    setActionLoading(budget.id);
    const full = await fetchBudgetWithLines(budget.id);
    setActionLoading(null);
    if (full) downloadBudgetPDF(full, settings);
  };

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Excluir orçamento ${budget.budget_number}?`)) return;
    await deleteBudget(budget.id);
  };

  const handleStatusChange = async (budget: Budget, status: Budget['status']) => {
    await updateStatus(budget.id, status);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  if (budgets.length === 0) {
    return (
      <div className="border border-dashed border-primary/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Nenhum orçamento criado ainda.</p>
      </div>
    );
  }

  return (
    <div className="border border-primary/20 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Nº</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => (
            <TableRow key={budget.id}>
              <TableCell className="font-mono text-sm">{budget.budget_number}</TableCell>
              <TableCell>
                <div>
                  <span className="font-medium">{budget.client_name}</span>
                  {budget.client_email && (
                    <p className="text-xs text-muted-foreground">{budget.client_email}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">{formatDate(budget.date)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(budget.total)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Badge className={`${statusColors[budget.status]} cursor-pointer`}>
                        {statusLabels[budget.status]}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => handleStatusChange(budget, key as Budget['status'])}
                      >
                        <Badge className={statusColors[key as Budget['status']]}>{label}</Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={actionLoading === budget.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(budget)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(budget)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(budget)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadPDF(budget)}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Gerar PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(budget)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
