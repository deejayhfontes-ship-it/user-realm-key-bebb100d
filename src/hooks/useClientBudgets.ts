import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Budget, BudgetLine, BudgetWithLines } from '@/types/budget';

export type ComputedBudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface ClientBudget extends BudgetWithLines {
    computedStatus: ComputedBudgetStatus;
    daysUntilExpiry: number | null;
}

function computeStatus(budget: Budget): { status: ComputedBudgetStatus; daysLeft: number | null } {
    // If already approved or rejected, keep
    if (budget.status === 'approved' || budget.status === 'rejected') {
        return { status: budget.status, daysLeft: null };
    }

    // Check expiry based on date + validity_days
    if (budget.date && budget.validity_days) {
        const budgetDate = new Date(budget.date);
        const expiryDate = new Date(budgetDate);
        expiryDate.setDate(expiryDate.getDate() + budget.validity_days);

        const now = new Date();
        const diffMs = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { status: 'expired', daysLeft: 0 };
        }
        return { status: budget.status as ComputedBudgetStatus, daysLeft: diffDays };
    }

    return { status: budget.status as ComputedBudgetStatus, daysLeft: null };
}

export function useClientBudgets() {
    const { profile } = useAuth();
    const [budgets, setBudgets] = useState<ClientBudget[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBudget, setSelectedBudget] = useState<ClientBudget | null>(null);

    const fetchBudgets = useCallback(async () => {
        if (!profile?.email) return;

        setLoading(true);
        try {
            // Fetch budgets by client_email
            const { data: budgetData, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('client_email', profile.email)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const budgetsList = (budgetData as Budget[]) || [];

            // Fetch lines for all budgets
            const budgetIds = budgetsList.map(b => b.id);
            let allLines: BudgetLine[] = [];

            if (budgetIds.length > 0) {
                const { data: linesData, error: linesError } = await supabase
                    .from('budget_lines')
                    .select('*')
                    .in('budget_id', budgetIds)
                    .order('sort_order');

                if (linesError) throw linesError;
                allLines = (linesData as BudgetLine[]) || [];
            }

            // Merge lines into budgets and compute status
            const enriched: ClientBudget[] = budgetsList.map(b => {
                const lines = allLines.filter(l => l.budget_id === b.id);
                const { status, daysLeft } = computeStatus(b);
                return {
                    ...b,
                    lines,
                    computedStatus: status,
                    daysUntilExpiry: daysLeft,
                };
            });

            setBudgets(enriched);
        } catch (err) {
            console.error('Error fetching client budgets:', err);
            toast.error('Erro ao carregar orçamentos');
        } finally {
            setLoading(false);
        }
    }, [profile?.email]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const approveBudget = async (budgetId: string) => {
        try {
            const { error } = await supabase
                .from('budgets')
                .update({ status: 'approved' })
                .eq('id', budgetId);

            if (error) throw error;

            // Log activity
            try {
                await (supabase.from('order_activity_logs') as any).insert({
                    action: 'budget_approved',
                    actor_type: 'client',
                    details: { budget_id: budgetId, approved_by: profile?.email },
                });
            } catch {
                // Non-critical — log failure shouldn't block approval
            }

            toast.success('Orçamento aprovado com sucesso!');
            setSelectedBudget(null);
            await fetchBudgets();
        } catch (err) {
            console.error('Error approving budget:', err);
            toast.error('Erro ao aprovar orçamento');
        }
    };

    const rejectBudget = async (budgetId: string) => {
        try {
            const { error } = await supabase
                .from('budgets')
                .update({ status: 'rejected' })
                .eq('id', budgetId);

            if (error) throw error;

            try {
                await (supabase.from('order_activity_logs') as any).insert({
                    action: 'budget_rejected',
                    actor_type: 'client',
                    details: { budget_id: budgetId, rejected_by: profile?.email },
                });
            } catch {
                // Non-critical
            }

            toast.success('Orçamento recusado');
            setSelectedBudget(null);
            await fetchBudgets();
        } catch (err) {
            console.error('Error rejecting budget:', err);
            toast.error('Erro ao recusar orçamento');
        }
    };

    const requestChange = async (budgetId: string, message: string) => {
        try {
            await (supabase.from('order_activity_logs') as any).insert({
                action: 'budget_change_requested',
                actor_type: 'client',
                details: {
                    budget_id: budgetId,
                    message,
                    requested_by: profile?.email,
                },
            });

            toast.success('Solicitação de alteração enviada!');
        } catch (err) {
            console.error('Error requesting change:', err);
            toast.error('Erro ao enviar solicitação');
        }
    };

    return {
        budgets,
        loading,
        selectedBudget,
        setSelectedBudget,
        fetchBudgets,
        approveBudget,
        rejectBudget,
        requestChange,
    };
}
