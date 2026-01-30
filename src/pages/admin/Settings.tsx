import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PixAccountsList } from '@/components/admin/settings/PixAccountsList';
import { FiscalConfigTab } from '@/components/admin/settings/FiscalConfigTab';
import { ChannelsConfigTab } from '@/components/admin/settings/ChannelsConfigTab';
import { AboutConfigTab } from '@/components/admin/settings/AboutConfigTab';
import { PartnersConfigTab } from '@/components/admin/settings/PartnersConfigTab';
import { ContactFormConfigTab } from '@/components/admin/settings/ContactFormConfigTab';
import { QrCode, Building2, FileText, MessageCircle, Users, Handshake, FormInput } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('pix');

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Configurações" 
        subtitle="Configurações do sistema"
      />
      
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Contas PIX
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Nota Fiscal
            </TabsTrigger>
            <TabsTrigger value="canais" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Canais de Contato
            </TabsTrigger>
            <TabsTrigger value="sobre" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quem Somos
            </TabsTrigger>
            <TabsTrigger value="parceiros" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Parceiros Criativos
            </TabsTrigger>
            <TabsTrigger value="formulario" className="flex items-center gap-2">
              <FormInput className="h-4 w-4" />
              Formulário de Contato
            </TabsTrigger>
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pix">
            <PixAccountsList />
          </TabsContent>

          <TabsContent value="fiscal">
            <FiscalConfigTab />
          </TabsContent>

          <TabsContent value="canais">
            <ChannelsConfigTab />
          </TabsContent>

          <TabsContent value="sobre">
            <AboutConfigTab />
          </TabsContent>

          <TabsContent value="parceiros">
            <PartnersConfigTab />
          </TabsContent>

          <TabsContent value="formulario">
            <ContactFormConfigTab />
          </TabsContent>

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
        </Tabs>
      </div>
    </div>
  );
}