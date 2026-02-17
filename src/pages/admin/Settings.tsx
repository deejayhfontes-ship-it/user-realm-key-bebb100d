import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PixAccountsList } from '@/components/admin/settings/PixAccountsList';
import { FiscalConfigTab } from '@/components/admin/settings/FiscalConfigTab';
import { ChannelsConfigTab } from '@/components/admin/settings/ChannelsConfigTab';
import { AboutConfigTab } from '@/components/admin/settings/AboutConfigTab';
import { PartnersConfigTab } from '@/components/admin/settings/PartnersConfigTab';
import { ContactFormConfigTab } from '@/components/admin/settings/ContactFormConfigTab';
import { GeneralConfigTab } from '@/components/admin/settings/GeneralConfigTab';
import { SocialLinksConfigTab } from '@/components/admin/settings/SocialLinksConfigTab';
import { LegalPagesConfigTab } from '@/components/admin/settings/LegalPagesConfigTab';
import { HomePageConfigTab } from '@/components/admin/settings/HomePageConfigTab';
import { SeoConfigTab } from '@/components/admin/settings/SeoConfigTab';
import { LiveChatConfigTab } from '@/components/admin/settings/LiveChatConfigTab';
import { GoalsConfigTab } from '@/components/admin/settings/GoalsConfigTab';
import { SecurityConfigTab } from '@/components/admin/settings/SecurityConfigTab';
import { 
  Settings as SettingsIcon, 
  Share2, 
  FileText, 
  Home, 
  Info, 
  Briefcase, 
  Users, 
  Mail, 
  Globe,
  QrCode,
  Building2,
  MessageCircle,
  Target,
  Shield
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('geral');

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Configurações" 
        subtitle="Gerencie todas as configurações do site"
      />
      
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="mb-6 inline-flex w-max">
              <TabsTrigger value="geral" data-tab="geral" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="redes" data-tab="redes" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Redes Sociais
              </TabsTrigger>
              <TabsTrigger value="legal" data-tab="legal" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Termos e Privacidade
              </TabsTrigger>
              <TabsTrigger value="home" data-tab="home" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home Page
              </TabsTrigger>
              <TabsTrigger value="sobre" data-tab="sobre" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Seção Sobre
              </TabsTrigger>
              <TabsTrigger value="servicos" data-tab="servicos" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Seção Serviços
              </TabsTrigger>
              <TabsTrigger value="parceiros" data-tab="parceiros" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Parceiros
              </TabsTrigger>
              <TabsTrigger value="formulario" data-tab="formulario" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Formulário
              </TabsTrigger>
              <TabsTrigger value="seo" data-tab="seo" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="pix" data-tab="pix" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="fiscal" data-tab="fiscal" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Fiscal
              </TabsTrigger>
              <TabsTrigger value="chat" data-tab="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat ao Vivo
              </TabsTrigger>
              <TabsTrigger value="metas" data-tab="metas" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Metas
              </TabsTrigger>
              <TabsTrigger value="seguranca" data-tab="seguranca" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="geral">
            <GeneralConfigTab />
          </TabsContent>

          <TabsContent value="redes">
            <SocialLinksConfigTab />
          </TabsContent>

          <TabsContent value="legal">
            <LegalPagesConfigTab />
          </TabsContent>

          <TabsContent value="home">
            <HomePageConfigTab onTabChange={setActiveTab} />
          </TabsContent>

          <TabsContent value="sobre">
            <AboutConfigTab />
          </TabsContent>

          <TabsContent value="servicos">
            <ChannelsConfigTab />
          </TabsContent>

          <TabsContent value="parceiros">
            <PartnersConfigTab />
          </TabsContent>

          <TabsContent value="formulario">
            <ContactFormConfigTab />
          </TabsContent>

          <TabsContent value="seo">
            <SeoConfigTab />
          </TabsContent>

          <TabsContent value="pix">
            <PixAccountsList />
          </TabsContent>

          <TabsContent value="fiscal">
            <FiscalConfigTab />
          </TabsContent>

          <TabsContent value="chat">
            <LiveChatConfigTab />
          </TabsContent>

          <TabsContent value="metas">
            <GoalsConfigTab />
          </TabsContent>

          <TabsContent value="seguranca">
            <SecurityConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
