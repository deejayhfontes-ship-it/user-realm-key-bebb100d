import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessagesTab } from '@/components/admin/atendimento/MessagesTab';
import { NewsletterTab } from '@/components/admin/atendimento/NewsletterTab';
import { MessageSquare, Mail, Search } from 'lucide-react';

export default function AdminAtendimento() {
  const [activeTab, setActiveTab] = useState('mensagens');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Atendimento" 
        subtitle="Mensagens de contato e assinantes da newsletter"
      />
      
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="mensagens" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagens
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Newsletter
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {activeTab === 'mensagens' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="new">Novos</SelectItem>
                    <SelectItem value="read">Lidos</SelectItem>
                    <SelectItem value="replied">Respondidos</SelectItem>
                    <SelectItem value="archived">Arquivados</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <TabsContent value="mensagens">
            <MessagesTab searchTerm={searchTerm} statusFilter={statusFilter} />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterTab searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
