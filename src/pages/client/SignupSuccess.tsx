import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Palette, ArrowRight, MessageCircle } from 'lucide-react';

export default function SignupSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Fontes Graphics</h1>
            <p className="text-muted-foreground text-sm font-light">Platform</p>
          </div>
        </div>

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Conta criada com sucesso!
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Nossa equipe irá liberar seus créditos em breve. 
          Você receberá um email quando estiver tudo pronto para começar a criar.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/client/login" className="block">
            <Button className="w-full h-12 bg-primary hover:brightness-105 text-primary-foreground font-semibold rounded-2xl">
              Ir para Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl"
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Acabei de criar minha conta na plataforma Fontes Graphics e gostaria de tirar algumas dúvidas.', '_blank')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Tirar Dúvidas no WhatsApp
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-2xl bg-muted/50 text-left">
          <h3 className="font-medium text-foreground mb-2">O que acontece agora?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">1.</span>
              Nossa equipe receberá sua solicitação
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">2.</span>
              Avaliaremos seu perfil e liberaremos os créditos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">3.</span>
              Você receberá um email de confirmação
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
