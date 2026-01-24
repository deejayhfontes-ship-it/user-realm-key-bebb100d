import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageCircle,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClientSupport() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Suporte</h1>
        <p className="text-muted-foreground mt-1">
          Precisa de ajuda? Estamos aqui para você.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Email */}
        <Card className="soft-card border-0">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Resposta em até 24 horas
            </p>
            <Button 
              variant="outline" 
              className="rounded-full w-full"
              onClick={() => window.location.href = 'mailto:suporte@fontesgraphics.com.br'}
            >
              suporte@fontesgraphics.com.br
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="soft-card border-0">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Atendimento rápido
            </p>
            <Button 
              className="rounded-full w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
            >
              Iniciar conversa
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Phone */}
        <Card className="soft-card border-0">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto mb-4">
              <Phone className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Telefone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Seg-Sex, 9h às 18h
            </p>
            <Button 
              variant="outline" 
              className="rounded-full w-full"
              onClick={() => window.location.href = 'tel:+551140028922'}
            >
              (11) 4002-8922
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="soft-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">Como funciona o sistema de créditos?</h4>
              <p className="text-sm text-muted-foreground">
                Cada geração de arte consome 1 crédito. Se você tem um plano de pacote, 
                os créditos são debitados do seu saldo. Planos fixos têm limite mensal renovável.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">Posso solicitar mais geradores?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Entre em contato com nosso suporte para solicitar a liberação de novos 
                geradores conforme sua necessidade.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">As imagens geradas têm marca d'água?</h4>
              <p className="text-sm text-muted-foreground">
                Não. Todas as imagens geradas são entregues sem marca d'água, prontas para uso 
                comercial conforme seu plano.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <h4 className="font-medium text-foreground mb-2">Meus créditos expiram?</h4>
              <p className="text-sm text-muted-foreground">
                Clientes de pacote têm uma data de validade definida. Clientes fixos têm 
                renovação mensal automática. Verifique seu dashboard para mais detalhes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card className="soft-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Horário de Atendimento</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Segunda a Sexta</p>
              <p className="font-medium text-foreground">9h às 18h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sábados</p>
              <p className="font-medium text-foreground">9h às 12h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
