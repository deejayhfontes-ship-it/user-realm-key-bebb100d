import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  CatalogItem, 
  Budget, 
  BudgetLine, 
  BudgetWithLines, 
  BudgetSettings,
  NewBudgetLine 
} from '@/types/budget';

// ==================== CATALOG ITEMS ====================
export function useCatalogItems() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('catalog_items')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching catalog items:', error);
      toast.error('Erro ao carregar itens do catálogo');
    } else {
      setItems((data as CatalogItem[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (item: Partial<CatalogItem>) => {
    const { data: userData } = await supabase.auth.getUser();
    const insertData = {
      name: item.name || '',
      default_price: item.default_price || 0,
      description: item.description,
      sku: item.sku,
      unit: item.unit || 'un',
      is_active: item.is_active ?? true,
      created_by: userData.user?.id,
    };
    
    const { data, error } = await supabase
      .from('catalog_items')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating catalog item:', error);
      toast.error('Erro ao criar item');
      throw error;
    }
    
    setItems(prev => [...prev, data as CatalogItem]);
    toast.success('Item criado com sucesso');
    return data as CatalogItem;
  };

  const updateItem = async (id: string, updates: Partial<CatalogItem>) => {
    const { error } = await supabase
      .from('catalog_items')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating catalog item:', error);
      toast.error('Erro ao atualizar item');
      throw error;
    }
    
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    toast.success('Item atualizado com sucesso');
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('catalog_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting catalog item:', error);
      toast.error('Erro ao excluir item');
      throw error;
    }
    
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item excluído com sucesso');
  };

  return { items, loading, fetchItems, createItem, updateItem, deleteItem };
}

// ==================== BUDGETS ====================
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Erro ao carregar orçamentos');
    } else {
      setBudgets((data as Budget[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const fetchBudgetWithLines = async (id: string): Promise<BudgetWithLines | null> => {
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (budgetError) {
      console.error('Error fetching budget:', budgetError);
      toast.error('Erro ao carregar orçamento');
      return null;
    }

    const { data: lines, error: linesError } = await supabase
      .from('budget_lines')
      .select('*')
      .eq('budget_id', id)
      .order('sort_order');
    
    if (linesError) {
      console.error('Error fetching budget lines:', linesError);
      toast.error('Erro ao carregar itens do orçamento');
      return null;
    }

    return { ...(budget as Budget), lines: (lines as BudgetLine[]) || [] };
  };

  const generateBudgetNumber = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('budgets')
      .select('*', { count: 'exact', head: true });
    
    const num = (count || 0) + 1;
    return `ORC-${year}-${String(num).padStart(3, '0')}`;
  };

  const createBudget = async (
    budgetData: Partial<Budget>, 
    lines: NewBudgetLine[]
  ): Promise<Budget | null> => {
    const { data: userData } = await supabase.auth.getUser();
    const budgetNumber = await generateBudgetNumber();

    const insertData = {
      budget_number: budgetNumber,
      client_name: budgetData.client_name || '',
      date: budgetData.date,
      validity_days: budgetData.validity_days,
      client_document: budgetData.client_document,
      client_email: budgetData.client_email,
      client_phone: budgetData.client_phone,
      client_address: budgetData.client_address,
      subtotal: budgetData.subtotal || 0,
      global_discount_type: budgetData.global_discount_type,
      global_discount_value: budgetData.global_discount_value,
      shipping: budgetData.shipping,
      total: budgetData.total || 0,
      notes: budgetData.notes,
      status: budgetData.status || 'draft',
      created_by: userData.user?.id,
    };

    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert(insertData)
      .select()
      .single();
    
    if (budgetError) {
      console.error('Error creating budget:', budgetError);
      toast.error('Erro ao criar orçamento');
      return null;
    }

    if (lines.length > 0) {
      const linesToInsert = lines.map((line, index) => ({
        ...line,
        budget_id: budget.id,
        sort_order: index,
      }));

      const { error: linesError } = await supabase
        .from('budget_lines')
        .insert(linesToInsert);
      
      if (linesError) {
        console.error('Error creating budget lines:', linesError);
        toast.error('Erro ao criar itens do orçamento');
      }
    }

    await fetchBudgets();
    toast.success('Orçamento criado com sucesso');
    return budget as Budget;
  };

  const updateBudget = async (
    id: string, 
    budgetData: Partial<Budget>, 
    lines: NewBudgetLine[]
  ) => {
    const { error: budgetError } = await supabase
      .from('budgets')
      .update(budgetData)
      .eq('id', id);
    
    if (budgetError) {
      console.error('Error updating budget:', budgetError);
      toast.error('Erro ao atualizar orçamento');
      return;
    }

    // Delete existing lines and insert new ones
    await supabase.from('budget_lines').delete().eq('budget_id', id);

    if (lines.length > 0) {
      const linesToInsert = lines.map((line, index) => ({
        ...line,
        budget_id: id,
        sort_order: index,
      }));

      const { error: linesError } = await supabase
        .from('budget_lines')
        .insert(linesToInsert);
      
      if (linesError) {
        console.error('Error updating budget lines:', linesError);
        toast.error('Erro ao atualizar itens do orçamento');
      }
    }

    await fetchBudgets();
    toast.success('Orçamento atualizado com sucesso');
  };

  const updateStatus = async (id: string, status: Budget['status']) => {
    const { error } = await supabase
      .from('budgets')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
      return;
    }

    setBudgets(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    toast.success('Status atualizado');
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting budget:', error);
      toast.error('Erro ao excluir orçamento');
      return;
    }

    setBudgets(prev => prev.filter(b => b.id !== id));
    toast.success('Orçamento excluído');
  };

  return { 
    budgets, 
    loading, 
    fetchBudgets, 
    fetchBudgetWithLines,
    createBudget, 
    updateBudget, 
    updateStatus,
    deleteBudget 
  };
}

// ==================== BUDGET SETTINGS ====================
export function useBudgetSettings() {
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching settings:', error);
    } else {
      setSettings(data as BudgetSettings | null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (updates: Partial<BudgetSettings>) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (settings) {
      const { error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', settings.id);
      
      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Erro ao salvar configurações');
        throw error;
      }
      
      setSettings({ ...settings, ...updates });
    } else {
      const { data, error } = await supabase
        .from('company_settings')
        .insert({ ...updates, user_id: userData.user.id })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating settings:', error);
        toast.error('Erro ao salvar configurações');
        throw error;
      }
      
      setSettings(data as BudgetSettings);
    }
    
    toast.success('Configurações salvas');
  };

  return { settings, loading, fetchSettings, saveSettings };
}
