import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PixConfigForm } from '@/components/pix/PixConfigForm';
import { QrCode, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('geral');

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Configurações" 
        subtitle="Configurações do sistema"
      />
      
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              PIX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configurações gerais em construção...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pix">
            <PixConfigForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
