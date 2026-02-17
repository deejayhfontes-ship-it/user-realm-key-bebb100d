import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Plus, List, Package } from 'lucide-react';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { BudgetListTab } from '@/components/budgets/BudgetListTab';
import { CatalogItemsTab } from '@/components/budgets/CatalogItemsTab';
import { BudgetSettingsModal } from '@/components/budgets/BudgetSettingsModal';
import { BudgetViewModal } from '@/components/budgets/BudgetViewModal';
import type { BudgetWithLines } from '@/types/budget';

export default function Budgets() {
  const [activeTab, setActiveTab] = useState('list');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithLines | null>(null);
  const [viewingBudget, setViewingBudget] = useState<BudgetWithLines | null>(null);

  const handleEdit = (budget: BudgetWithLines) => {
    setEditingBudget(budget);
    setActiveTab('new');
  };

  const handleView = (budget: BudgetWithLines) => {
    setViewingBudget(budget);
  };

  const handleSaved = () => {
    setEditingBudget(null);
    setActiveTab('list');
  };

  const handleNewBudget = () => {
    setEditingBudget(null);
    setActiveTab('new');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">Crie e gerencie orçamentos profissionais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button onClick={handleNewBudget} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingBudget ? 'Editar' : 'Novo'}
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <BudgetListTab onEdit={handleEdit} onView={handleView} />
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <BudgetForm editingBudget={editingBudget} onSaved={handleSaved} />
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <CatalogItemsTab />
        </TabsContent>
      </Tabs>

      <BudgetSettingsModal 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      <BudgetViewModal
        budget={viewingBudget}
        open={!!viewingBudget}
        onClose={() => setViewingBudget(null)}
      />
    </div>
  );
}
