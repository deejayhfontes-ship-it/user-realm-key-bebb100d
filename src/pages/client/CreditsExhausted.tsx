import { CreditCard, Mail, ArrowLeft, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CreditsExhausted() {
  const adminEmail = 'suporte@fontes.app';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full border-none shadow-lg">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <CreditCard className="w-10 h-10 text-red-500" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Créditos Esgotados
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6">
            Você utilizou todos os créditos disponíveis no seu pacote.
            Para continuar gerando artes incríveis, entre em contato com o administrador.
          </p>
          
          {/* Features */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-primary" />
              O que você pode fazer:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Solicitar mais créditos ao administrador</li>
              <li>• Aguardar a renovação do seu pacote</li>
              <li>• Fazer upgrade para um plano com mais créditos</li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <a href={`mailto:${adminEmail}?subject=Solicitar mais créditos&body=Olá, gostaria de adquirir mais créditos para continuar usando os geradores.`}>
                <Mail className="w-4 h-4 mr-2" />
                Contatar Administrador
              </a>
            </Button>
            
            <Button variant="outline" asChild size="lg" className="w-full">
              <Link to="/client/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
