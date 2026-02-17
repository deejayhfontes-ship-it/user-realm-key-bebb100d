import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Settings, FileText, Receipt } from 'lucide-react';
import PaymentConfigTab from '@/components/admin/payments/PaymentConfigTab';
import PaymentPlansTab from '@/components/admin/payments/PaymentPlansTab';
import PaymentTransactionsTab from '@/components/admin/payments/PaymentTransactionsTab';

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('config');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
        <p className="text-muted-foreground">
          Configure gateways, gerencie planos e acompanhe transações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-background">
            <Settings className="w-4 h-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-background">
            <CreditCard className="w-4 h-4 mr-2" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-background">
            <Receipt className="w-4 h-4 mr-2" />
            Transações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <PaymentConfigTab />
        </TabsContent>

        <TabsContent value="plans">
          <PaymentPlansTab />
        </TabsContent>

        <TabsContent value="transactions">
          <PaymentTransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
