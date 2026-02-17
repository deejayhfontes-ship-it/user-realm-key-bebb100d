import { useNavigate } from 'react-router-dom';
import { Clock, Mail, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function ClientExpired() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="soft-card-elevated border-0 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-warning/15 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-warning" />
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Pacote Expirado
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Seu pacote expirou e você não pode mais acessar os geradores. 
            Entre em contato para renovar seu acesso.
          </p>

          <div className="space-y-3 mb-6">
            <Button 
              className="w-full rounded-full bg-primary text-primary-foreground hover:brightness-105"
              onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de renovar meu pacote.', '_blank')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renovar Pacote
            </Button>

            <Button 
              variant="outline" 
              className="w-full rounded-full"
              onClick={() => window.location.href = 'mailto:suporte@fontesgraphics.com.br'}
            >
              <Mail className="h-4 w-4 mr-2" />
              Falar com Suporte
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="text-muted-foreground"
            onClick={handleLogout}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
